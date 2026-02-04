import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_HISTORY_DETAILS } from '@/graphql/queries/rates';
import { formatSydneyTime } from '@/lib/date';
import { StatusField } from '@/components/common/StatusField';
import { DNSP_MAP, RATE_TYPE_MAP } from '@/lib/constants';

interface SnapshotDetailsProps {
    uid: string;
    activeSnapshot?: any[];
}

export const SnapshotDetails = ({ uid, activeSnapshot }: SnapshotDetailsProps) => {
    const { data, loading, error } = useQuery(GET_HISTORY_DETAILS, {
        variables: { uid },
        fetchPolicy: 'cache-first', // Use cache if available
    });



    const record = data?.ratesHistoryRecord;
    // record.newRecord is already a string here (from server or cache), or null
    const snapshotData = record?.newRecord ? JSON.parse(record.newRecord) : [];

    // Filter snapshotData to only show items different from activeSnapshot
    // Helper to check if a key should be ignored in comparison
    const isIgnoredKey = (key: string) =>
        ['id', 'uid', 'ratePlanUid', 'offerName', 'tenant', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedBy', '__typename'].includes(key);

    // Helper to check if two values are effectively different
    const hasValueChanged = (val1: any, val2: any) => {
        if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) return false;
        return String(val1) !== String(val2);
    };

    // Unified diff logic
    const allDiffs = React.useMemo(() => {
        const diffs: any[] = [];
        if (!activeSnapshot || !Array.isArray(activeSnapshot)) {
            // If no active snapshot, everything in snapshotData is considered "Captured" (just show it)
            if (Array.isArray(snapshotData)) {
                return snapshotData.map(plan => ({ status: 'captured', plan }));
            }
            return [];
        }

        // 1. Check for Modified and Deleted (Present in Snapshot)
        if (Array.isArray(snapshotData)) {
            snapshotData.forEach((plan: any) => {
                const activePlan = activeSnapshot.find((ap: any) => ap.uid === plan.uid || (ap.planId === plan.planId && ap.codes === plan.codes));

                if (!activePlan) {
                    diffs.push({ status: 'deleted', plan });
                } else {
                    // Check for modifications
                    const planKeys = Object.keys(plan);
                    const hasPlanDiff = planKeys.some(key => {
                        if (isIgnoredKey(key)) return false;
                        if (key === 'offers') return false;
                        if (typeof plan[key] === 'object' && plan[key] !== null && !Array.isArray(plan[key])) return false;
                        return hasValueChanged(plan[key], activePlan[key]);
                    });

                    let hasOfferDiff = false;
                    if (plan.offers?.length !== activePlan.offers?.length) {
                        hasOfferDiff = true;
                    } else {
                        hasOfferDiff = plan.offers?.some((offer: any) => {
                            const activeOffer = activePlan.offers?.find((ao: any) => ao.uid === offer.uid || ao.offerName === offer.offerName);
                            if (!activeOffer) return true;
                            return Object.keys(offer).some(key => {
                                if (isIgnoredKey(key)) return false;
                                return hasValueChanged(offer[key], activeOffer[key]);
                            });
                        });
                    }

                    if (hasPlanDiff || hasOfferDiff) {
                        diffs.push({ status: 'modified', plan, activePlan });
                    }
                }
            });
        }

        // 2. Check for Added (Present in Active, Not in Snapshot)
        activeSnapshot.forEach((activePlan: any) => {
            const snapshotPlan = Array.isArray(snapshotData) ? snapshotData.find((sp: any) => sp.uid === activePlan.uid || (sp.planId === activePlan.planId && sp.codes === activePlan.codes)) : null;
            if (!snapshotPlan) {
                diffs.push({ status: 'added', plan: activePlan, activePlan }); // For added, the "plan" implies the content we want to show, which is the active one
            }
        });

        return diffs;
    }, [snapshotData, activeSnapshot]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                    <span className="text-xs text-muted-foreground">Loading snapshot data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                Failed to load snapshot details: {error.message}
            </div>
        );
    }


    const renderRow = (label: string, value: any, activeValue: any, type: 'text' | 'status' = 'text', statusType?: any, rowStatus: 'added' | 'deleted' | 'modified' | 'captured' = 'modified') => {
        // value = Version Value (Snapshot)
        // activeValue = Current Version Value (Active)

        // For 'added': value is from activePlan (passed as plan), activeValue is same (or we treat 'value' as the new thing)
        // Actually, let's normalize in the caller.
        // If status == 'added': Snapshot had NOTHING (-). Active has VALUE.
        // If status == 'deleted': Snapshot had VALUE. Active has NOTHING (-).

        const isDifferent = activeSnapshot && String(value) !== String(activeValue);

        // Formatting helpers
        const formatVal = (val: any) => {
            if (val === undefined || val === null) return '—';
            if (Array.isArray(val)) return val.join(', ');

            if (type === 'status' && statusType) {
                if (statusType === 'dnsp') return DNSP_MAP[String(val)] || String(val);
                if (statusType === 'rate_type') return RATE_TYPE_MAP[String(val)] || String(val);
                return <StatusField type={statusType} value={val} />;
            }

            return String(val);
        };

        let val1 = value; // Version Value
        let val2 = activeValue; // Current Value

        if (rowStatus === 'added') {
            val1 = undefined; // Not in version
            val2 = value; // Is in current
        } else if (rowStatus === 'deleted') {
            val1 = value; // Was in version
            val2 = undefined; // Not in current
        }

        return (
            <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-900 font-medium align-top">
                    {label}
                </td>
                <td className={`px-4 py-3 align-top ${rowStatus === 'deleted' ? 'text-red-600 bg-red-50/30 font-medium' : 'text-gray-500'}`}>
                    {val1 === undefined ? '—' : formatVal(val1)}
                </td>
                <td className={`px-4 py-3 align-top ${rowStatus === 'added' ? 'text-green-600 bg-green-50/30 font-medium' : (isDifferent ? 'text-blue-600 bg-blue-50/30' : 'text-gray-500')}`}>
                    {activeSnapshot ? (
                        val2 === undefined ? '—' : formatVal(val2)
                    ) : (
                        <span className="text-gray-300">—</span>
                    )}
                </td>
            </tr>
        );
    };

    return (
        <div className="rounded-lg border border-green-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-3">
                {activeSnapshot ? 'Changes from Active Version' : `Captured ${Array.isArray(snapshotData) ? snapshotData.length : 0} Rate Plans`}
            </h4>

            {allDiffs.length === 0 && activeSnapshot ? (
                <div className="text-xs text-gray-500 italic p-2 text-center">
                    No differences found compared to the active version.
                </div>
            ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {allDiffs.map((diffItem: any, idx: number) => {
                        const { status, plan, activePlan } = diffItem;

                        // Identify explicit changes only if modified
                        const explicitPlanFields = ['dnsp', 'type', 'tariff', 'vpp', 'discountApplies', 'discountPercentage', 'isActive'];
                        let otherChangedKeys: string[] = [];

                        if (status === 'modified') {
                            otherChangedKeys = Object.keys(plan).filter(key => {
                                if (isIgnoredKey(key)) return false;
                                if (key === 'offers') return false;
                                if (explicitPlanFields.includes(key)) return false;
                                if (typeof plan[key] === 'object' && plan[key] !== null && !Array.isArray(plan[key])) return false;
                                return activePlan && hasValueChanged(plan[key], activePlan[key]);
                            });
                        }

                        // Badge color
                        const badgeClass = status === 'added' ? 'bg-green-100 text-green-800 border-green-200' :
                            status === 'deleted' ? 'bg-red-100 text-red-800 border-red-200' :
                                status === 'modified' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200';

                        const statusLabel = status === 'added' ? 'Added in Current' :
                            status === 'deleted' ? 'Deleted in Current' :
                                status === 'modified' ? 'Modified' : 'Captured';

                        return (
                            <div key={idx} className={`border rounded-lg overflow-hidden ${status === 'added' ? 'border-green-200' : status === 'deleted' ? 'border-red-200' : 'border-gray-200'}`}>
                                {/* Plan Header - Context */}
                                <div className={`px-4 py-3 border-b flex justify-between items-center ${status === 'added' ? 'bg-green-50' : status === 'deleted' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-gray-900 text-sm">
                                                {Array.isArray(plan.codes) ? plan.codes.join(', ') : plan.codes}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            {/* <span className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">{plan.planId}</span> */}
                                            <span>{plan.state}</span>
                                            <span className="text-gray-400">|</span>
                                            <span>{formatSydneyTime(plan.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Differences Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-[10px] text-gray-500 uppercase bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold w-1/3">Field</th>
                                                <th className="px-4 py-2 font-semibold w-1/3 text-red-500">Version Value</th>
                                                <th className="px-4 py-2 font-semibold w-1/3 text-green-600">Current Version Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {/* Core Fields */}
                                            {renderRow('DNSP', plan.dnsp, activePlan?.dnsp, 'status', 'dnsp', status)}
                                            {renderRow('Rate Type', plan.type, activePlan?.type, 'status', 'rate_type', status)}
                                            {renderRow('Tariff', plan.tariff, activePlan?.tariff, 'text', undefined, status)}
                                            {renderRow('VPP', plan.vpp, activePlan?.vpp, 'status', 'vpp', status)}
                                            {renderRow('Discount', plan.discountApplies ? `${plan.discountPercentage}%` : 'No', activePlan ? (activePlan.discountApplies ? `${activePlan.discountPercentage}%` : 'No') : undefined, 'text', undefined, status)}
                                            {renderRow('Active', plan.isActive ? 'Yes' : 'No', activePlan ? (activePlan.isActive ? 'Yes' : 'No') : undefined, 'text', undefined, status)}

                                            {/* Other Changed Plan Fields */}
                                            {otherChangedKeys.map(key => (
                                                <React.Fragment key={key}>
                                                    {renderRow(key.replace(/([A-Z])/g, ' $1').trim(), plan[key], activePlan?.[key], 'text', undefined, status)}
                                                </React.Fragment>
                                            ))}

                                            {/* Offers */}
                                            {plan.offers && plan.offers.length > 0 && plan.offers.map((offer: any, oIdx: number) => {
                                                const activeOffer = status === 'modified' ? activePlan?.offers?.find((ao: any) => ao.uid === offer.uid || ao.offerName === offer.offerName) :
                                                    status === 'added' ? offer : undefined; // For added, offer is the active offer

                                                // If 'deleted', activeOffer is undefined.
                                                // If 'added', activeOffer IS the offer (since plan=activePlan).

                                                // Filter fields logic:
                                                // If status != modified, show ALL fields that are interesting (not ignored).
                                                // If status == modified, show only changed fields.

                                                const reportableFields = Object.entries(offer).filter(([k, v]) => {
                                                    const ignored = ['id', 'uid', 'ratePlanUid', 'offerName', 'tenant', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedBy'].includes(k);
                                                    if (ignored) return false;
                                                    if (v === 0 || v === '0' || v === null) return false;

                                                    if (status === 'modified' && activeOffer) {
                                                        return String(v) !== String(activeOffer[k]);
                                                    }
                                                    return true;
                                                });

                                                if (reportableFields.length === 0) return null;

                                                return (
                                                    <React.Fragment key={oIdx}>
                                                        <tr className="bg-gray-50">
                                                            <td colSpan={3} className="px-4 py-2 font-semibold text-xs text-gray-700 border-t border-b border-gray-200">
                                                                Offer: {offer.offerName}
                                                            </td>
                                                        </tr>
                                                        {reportableFields.map(([key, val]) => {
                                                            return (
                                                                <React.Fragment key={key}>
                                                                    {renderRow(key.replace(/([A-Z])/g, ' $1').trim(), val, status === 'modified' ? activeOffer?.[key] : val, 'text', undefined, status)}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
