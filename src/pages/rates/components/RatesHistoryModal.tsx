import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/common';
import { ClockIcon, PencilIcon } from '@/components/icons';
import { formatDateTime } from '@/lib/date';
import { GET_RATES_HISTORY } from '@/graphql/queries/rates';
import { SET_ACTIVE_RATES_VERSION, RESTORE_RATES_SNAPSHOT } from '@/graphql/mutations/rates';
import { SnapshotDetails } from './SnapshotDetails';

interface RatesHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    refetchChanges?: () => void;
    refetchRatePlans?: () => void;
}

export function RatesHistoryModal({ isOpen, onClose, refetchChanges, refetchRatePlans }: RatesHistoryModalProps) {
    // State
    const [historyPage, setHistoryPage] = useState(1);
    const [activeVersionUid, setActiveVersionUid] = useState<string | null>(null);
    const [restoringUid, setRestoringUid] = useState<string | null>(null);

    // Queries & Mutations
    const [fetchHistory, { data: historyData, loading: historyLoading }] = useLazyQuery(GET_RATES_HISTORY, {
        fetchPolicy: 'network-only',
    });

    const [setActiveRatesVersion] = useMutation(SET_ACTIVE_RATES_VERSION);
    const [restoreRatesSnapshot] = useMutation(RESTORE_RATES_SNAPSHOT);

    // Effects
    useEffect(() => {
        if (isOpen) {
            setHistoryPage(1);
            fetchHistory({ variables: { page: 1, limit: 20 } });
        }
    }, [isOpen, fetchHistory]);

    useEffect(() => {
        if (historyData?.ratesHistory?.data) {
            const activeRecord = historyData.ratesHistory.data.find((r: any) => r.activeVersion === 1);
            if (activeRecord) {
                setActiveVersionUid(activeRecord.uid);
            }
        }
    }, [historyData]);

    const handleHistoryPageChange = (newPage: number) => {
        setHistoryPage(newPage);
        fetchHistory({ variables: { page: newPage, limit: 20 } });
    };

    // Direct restore handler - updates rate_plans and rate_offers directly
    const handleDirectRestore = async (uid: string) => {
        setRestoringUid(uid);
        try {
            await restoreRatesSnapshot({ variables: { historyUid: uid } });
            toast.success('Version restored successfully');
            onClose(); // Close the modal
            refetchChanges?.(); // Refresh the changes highlighting
            refetchRatePlans?.(); // Refresh the rate plans table
        } catch (err: any) {
            toast.error(err.message || 'Failed to restore version');
        } finally {
            setRestoringUid(null);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Saved Versions (${historyData?.ratesHistory?.meta?.totalRecords || 0})`}
                size="full"
            >
                <div className="space-y-6 pb-8">
                    {/* Pagination Control */}
                    {historyData?.ratesHistory?.meta && historyData.ratesHistory.meta.totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 px-1">
                            <span className="text-xs text-muted-foreground mr-2">
                                Page {historyPage} of {historyData.ratesHistory.meta.totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleHistoryPageChange(historyPage - 1)}
                                    disabled={historyPage <= 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleHistoryPageChange(historyPage + 1)}
                                    disabled={historyPage >= historyData.ratesHistory.meta.totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    )}

                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                            </div>
                            <p className="text-sm text-muted-foreground">Loading history...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-4">
                                {historyData?.ratesHistory?.data?.map((record: any) => {
                                    const actionStyles = {
                                        SNAPSHOT: { bg: 'bg-purple-500', icon: '?', label: 'Version', border: 'border-purple-200', lightBg: 'bg-purple-50' }
                                    };
                                    const actionKey = (record.auditAction || 'SNAPSHOT') as keyof typeof actionStyles;
                                    const actionConfig = actionStyles[actionKey] || { bg: 'bg-gray-500', icon: '?', label: record.auditAction, border: 'border-gray-200', lightBg: 'bg-gray-50' };

                                    return (
                                        <div key={record.uid} className="relative flex gap-4">
                                            <div className={`flex-1 p-4 rounded-xl border ${record.uid === activeVersionUid ? 'border-green-200 bg-green-50/50' : actionConfig.border + ' ' + actionConfig.lightBg} shadow-sm hover:shadow-md transition-shadow`}>
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${actionConfig.bg} text-white`}>
                                                                {actionConfig.label}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                #{record.version}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            Saved Version
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-muted-foreground">{formatDateTime(record.createdAt)}</p>
                                                            {(record.createdByName || record.createdBy) && (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground">•</span>
                                                                    <p className="text-xs text-muted-foreground">by {record.createdByName || record.createdBy}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium ${record.uid === activeVersionUid ? 'text-green-700' : 'text-muted-foreground'}`}>
                                                                {record.uid === activeVersionUid ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <Switch
                                                                checked={record.uid === activeVersionUid}
                                                                onChange={async (checked) => {
                                                                    if (checked && record.uid !== activeVersionUid) {
                                                                        const previousActiveUid = activeVersionUid;
                                                                        // Optimistic update
                                                                        setActiveVersionUid(record.uid);

                                                                        try {
                                                                            const { data } = await setActiveRatesVersion({ variables: { uid: record.uid } });
                                                                            toast.success(data?.setActiveRatesVersion?.message || 'Version activated successfully');
                                                                            // No need to revert if successful, fetchHistory will eventually update data
                                                                            fetchHistory({ variables: { page: historyPage, limit: 20 } });
                                                                            refetchChanges?.();
                                                                        } catch (err: any) {
                                                                            // Revert on failure
                                                                            setActiveVersionUid(previousActiveUid);
                                                                            toast.error(err.message || 'Failed to activate version');
                                                                        }
                                                                    }
                                                                }}
                                                                className={record.uid === activeVersionUid ? "cursor-default" : ""}
                                                            />
                                                        </div>
                                                        {record.uid !== activeVersionUid && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleDirectRestore(record.uid)}
                                                                isLoading={restoringUid === record.uid}
                                                                disabled={restoringUid !== null}
                                                                className="h-7 px-3 text-xs gap-1.5 hover:border-primary hover:text-primary transition-colors bg-white"
                                                            >
                                                                <PencilIcon size={12} />
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <details className="group">
                                                    <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        View Version Data
                                                    </summary>
                                                    <div className="mt-3">
                                                        <SnapshotDetails uid={record.uid} />
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!historyData?.ratesHistory?.data || historyData?.ratesHistory?.data?.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <ClockIcon size={32} className="text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">No History Yet</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Saved versions of rate plans will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
