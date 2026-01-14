import { useQuery } from '@apollo/client';
import { GET_HISTORY_DETAILS } from '@/graphql/queries/rates';
import { formatDate } from '@/lib/date';

interface SnapshotDetailsProps {
    uid: string;
}

export const SnapshotDetails = ({ uid }: SnapshotDetailsProps) => {
    const { data, loading, error } = useQuery(GET_HISTORY_DETAILS, {
        variables: { uid },
        fetchPolicy: 'cache-first', // Use cache if available
    });

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

    const record = data?.ratesHistoryRecord;
    // record.newRecord is already a string here (from server or cache), or null
    const snapshotData = record?.newRecord ? JSON.parse(record.newRecord) : [];

    return (
        <div className="rounded-lg border border-purple-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-3">
                Captured {Array.isArray(snapshotData) ? snapshotData.length : 0} Rate Plans
            </h4>

            {Array.isArray(snapshotData) && snapshotData.length > 0 && (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {snapshotData.map((plan: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs">
                            {/* Plan Header */}
                            <div className="flex justify-between items-start border-b border-gray-200 pb-2 mb-2">
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">
                                        {Array.isArray(plan.codes) ? plan.codes.join(', ') : plan.codes}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                        <span className="font-mono bg-gray-200 px-1 rounded mr-2">{plan.planId}</span>
                                        <span className="mr-2">{plan.state}</span>
                                        <span className="mr-2">{formatDate(plan.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                                        DNSP: {plan.dnsp}
                                    </span>
                                    <span className="block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">
                                        Type: {plan.type === 0 ? 'Res' : plan.type === 1 ? 'Bus' : plan.type}
                                    </span>
                                </div>
                            </div>

                            {/* Plan Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-gray-600">
                                <div><span className="text-gray-400">Tariff:</span> {plan.tariff}</div>
                                <div><span className="text-gray-400">VPP:</span> {plan.vpp}</div>
                                <div><span className="text-gray-400">Disc:</span> {plan.discountApplies ? `${plan.discountPercentage}%` : 'No'}</div>
                                <div><span className="text-gray-400">Active:</span> {plan.isActive ? 'Yes' : 'No'}</div>
                            </div>

                            {/* Offers */}
                            {plan.offers && plan.offers.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <div className="font-semibold text-gray-700">Offers</div>
                                    {plan.offers.map((offer: any, oIdx: number) => (
                                        <div key={oIdx} className="bg-white border boundary-gray-200 rounded p-2">
                                            <div className="font-medium text-purple-700 mb-1">{offer.offerName}</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 text-gray-500">
                                                {Object.entries(offer).map(([key, val]) => {
                                                    if (['id', 'uid', 'ratePlanUid', 'offerName', 'tenant', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedBy'].includes(key)) return null;
                                                    if (val === 0 || val === '0' || val === null) return null;
                                                    return (
                                                        <div key={key} className="flex justify-between border-b border-gray-50">
                                                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                            <span className="font-mono text-gray-800">{String(val)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
