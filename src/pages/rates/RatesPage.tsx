import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, type Column, Modal } from '@/components/common';
import { PlusIcon, FilterIcon, RefreshCwIcon, TrashIcon, PencilIcon, SaveIcon, ClockIcon } from '@/components/icons';
import { GET_RATE_PLANS, HAS_RATES_CHANGES } from '@/graphql/queries/rates';
import { CREATE_RATE_PLAN, UPDATE_RATE_PLAN, SOFT_DELETE_RATE_PLAN, RESTORE_RATE_PLAN, CREATE_RATES_SNAPSHOT } from '@/graphql/mutations/rates';
import { formatDateTime } from '@/lib/date';
import { useAuthStore } from '@/stores/useAuthStore';
import { StatusField } from '@/components/common';
import { STATE_OPTIONS, DNSP_OPTIONS } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { RatesHistoryModal } from './components/RatesHistoryModal';

// Interfaces based on the query
interface RateOffer {
    id: string;
    uid: string;
    offerName: string;
    type: string;
    anytime: number;
    cl1Supply: number;
    cl1Usage: number;
    cl2Supply: number;
    cl2Usage: number;
    demand: number;
    demandOp: number;
    demandP: number;
    demandS: number;
    fit: number;
    fitPeak?: number;
    fitCritical?: number;
    offPeak: number;
    peak: number;
    shoulder: number;
    supplyCharge: number;
    vppOrcharge: number;
    isActive: boolean;
    isDeleted: boolean;
}

interface RatePlan {
    id: string;
    uid: string;
    codes: string[];
    planId: string;
    dnsp: string;
    state: string;
    type: string; // Residential/Business
    vpp: number;
    discountApplies: boolean;
    discountPercentage: number;
    tariff: string;
    isActive: boolean;
    isDeleted: number; // 0 = active, 1 = deleted
    offers: RateOffer[];
    updatedAt: string;
}

interface RatePlansResponse {
    ratePlans: {
        data: RatePlan[];
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
    };
}

export function RatesPage() {
    const [searchCode, setSearchCode] = useState('');
    const [debouncedSearchCode, setDebouncedSearchCode] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [dnspFilter, setDnspFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [allRatePlans, setAllRatePlans] = useState<RatePlan[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const limit = 20;

    // Permissions
    const canCreate = useAuthStore((state) => state.canCreateInMenu('rates'));
    const canEdit = useAuthStore((state) => state.canEditInMenu('rates'));
    const canDelete = useAuthStore((state) => state.canDeleteInMenu('rates'));
    // Add Rate Modal State
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false); // Ref-based guard for preventing multiple calls

    // Form initial state
    const initialFormState = {
        codes: '',
        planId: '',
        tariff: '',
        state: 'NSW',
        dnsp: 0,
        type: 0,
        vpp: 0,
        discountApplies: 0,
        discountPercentage: 0,
        // Offer fields
        offerName: '',
        anytime: '',
        supplyCharge: '',
        vppOrcharge: '',
        peak: '',
        shoulder: '',
        offPeak: '',
        cl1Supply: '',
        cl1Usage: '',
        cl2Supply: '',
        cl2Usage: '',
        demand: '',
        demandOp: '',
        demandP: '',
        demandS: '',
        fit: '',
        fitPeak: '',
        fitCritical: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Edit mode state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRatePlan, setEditingRatePlan] = useState<RatePlan | null>(null);

    // Delete/Restore state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ratePlanToDelete, setRatePlanToDelete] = useState<RatePlan | null>(null);
    const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [ratePlanToRestore, setRatePlanToRestore] = useState<RatePlan | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    // Mutations
    const [createRatePlan] = useMutation(CREATE_RATE_PLAN);
    const [updateRatePlan] = useMutation(UPDATE_RATE_PLAN);
    const [softDeleteRatePlan] = useMutation(SOFT_DELETE_RATE_PLAN);
    const [restoreRatePlanMutation] = useMutation(RESTORE_RATE_PLAN);
    const [createRatesSnapshot, { loading: isSnapshotting }] = useMutation(CREATE_RATES_SNAPSHOT);

    const handleCreateSnapshot = async () => {
        try {
            await createRatesSnapshot({
                variables: {
                    ratePlanUid: 'MANUAL_SNAPSHOT',
                    action: 'SNAPSHOT'
                }
            });
            toast.success('System snapshot created successfully');
            // Refetch to update Save button state
            setTimeout(() => refetchChanges?.(), 500);
        } catch (error) {
            console.error('Failed to create snapshot:', error);
            toast.error('Failed to create snapshot');
        }
    };

    // History state
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    const handleOpenHistory = () => {
        setHistoryModalOpen(true);
    };

    // Debounce search code
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearchCode !== searchCode) {
                setAllRatePlans([]);
                setPage(1);
                setDebouncedSearchCode(searchCode);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchCode, debouncedSearchCode]);

    const { data, loading, error, refetch } = useQuery<RatePlansResponse>(GET_RATE_PLANS, {
        variables: {
            page,
            limit,
            search: debouncedSearchCode || undefined,
            state: stateFilter || undefined,
            dnsp: dnspFilter ? parseInt(dnspFilter, 10) : undefined,
            type: typeFilter ? parseInt(typeFilter, 10) : undefined,
        },
        fetchPolicy: 'network-only',
    });

    const meta = data?.ratePlans?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Check if current rates have changes compared to active version (backend comparison)
    const { data: changesData, refetch: refetchChanges } = useQuery(HAS_RATES_CHANGES, {
        fetchPolicy: 'network-only',
    });

    const hasUnsavedChanges = changesData?.hasRatesChanges?.hasChanges ?? true;
    const changedRatePlanUids = useMemo(() => new Set(changesData?.hasRatesChanges?.changedRatePlanUids || []), [changesData]);
    // Map of old records for comparison: uid -> oldRecord object
    const oldRecordsMap = useMemo(() => {
        const map = new Map<string, any>();
        if (changesData?.hasRatesChanges?.changes) {
            changesData.hasRatesChanges.changes.forEach((change: any) => {
                try {
                    if (change.oldRecord) {
                        map.set(change.uid, JSON.parse(change.oldRecord));
                    }
                } catch (e) {
                    console.error('Error parsing old record', e);
                }
            });
        }
        return map;
    }, [changesData]);

    const isFieldChanged = useCallback((row: RatePlan, fieldKey: string) => {
        const oldRecord = oldRecordsMap.get(row.uid);
        if (!oldRecord) return false; // New record or no change

        // Helper for offers comparison
        const getOfferValue = (offer: any, key: string) => offer?.[key];

        switch (fieldKey) {
            case 'state':
            case 'dnsp':
            case 'type':
            case 'tariff':
            case 'planId':
            case 'discountApplies':
            case 'discountPercentage':
            case 'vpp':
                // loose comparison for numbers/strings safe here
                return row[fieldKey as keyof RatePlan] != oldRecord[fieldKey];

            case 'codes':
                // Normalize both to string for comparison (oldRecord might be string, row.codes might be array)
                const currentCodes = Array.isArray(row.codes) ? row.codes.join(', ') : String(row.codes || '');
                const oldCodes = Array.isArray(oldRecord.codes) ? oldRecord.codes.join(', ') : String(oldRecord.codes || '');
                return currentCodes !== oldCodes;

            default:
                // Offer fields like 'offer_anytime'
                if (fieldKey.startsWith('offer_')) {
                    const offerKey = fieldKey.replace('offer_', '');
                    const newOffer = row.offers?.[0];
                    const oldOffer = oldRecord.offers?.[0]; // Assuming single offer structure
                    return getOfferValue(newOffer, offerKey) != getOfferValue(oldOffer, offerKey);
                }
                return false;
        }
    }, [oldRecordsMap]);

    const getOldValue = useCallback((row: RatePlan, fieldKey: string) => {
        const oldRecord = oldRecordsMap.get(row.uid);
        if (!oldRecord) return undefined;

        if (fieldKey.startsWith('offer_')) {
            const offerKey = fieldKey.replace('offer_', '');
            return oldRecord.offers?.[0]?.[offerKey];
        }
        return oldRecord[fieldKey];
    }, [oldRecordsMap]);
    useEffect(() => {
        if (data?.ratePlans?.data) {
            const newData = data.ratePlans.data;
            const currentPage = data.ratePlans.meta?.currentPage || 1;

            if (currentPage === 1) {
                // Fresh load or filter change - replace all data
                setAllRatePlans(newData);
            } else {
                // Pagination - append new data avoiding duplicates
                setAllRatePlans(prev => {
                    const existingIds = new Set(prev.map(r => r.uid));
                    const newRatePlans = newData.filter(r => !existingIds.has(r.uid));
                    if (newRatePlans.length > 0) {
                        return [...prev, ...newRatePlans];
                    }
                    return prev;
                });
            }
            setIsLoadingMore(false);
        }
    }, [data]);

    // Handle load more
    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
    };



    const handleClearAll = () => {
        setSearchCode('');
        setDebouncedSearchCode('');
        setStateFilter('');
        setDnspFilter('');
        setTypeFilter('');
        setAllRatePlans([]);
        setPage(1);
    };

    // Open Add Rate Modal
    const handleAddRate = () => {
        setFormData(initialFormState);
        setFormErrors({});
        setAddModalOpen(true);
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.codes?.trim()) {
            errors.codes = 'Code is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit Create Rate
    const handleCreateRate = async () => {
        if (isSubmitting) return; // Prevent multiple calls
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const input: any = {
                codes: formData.codes,
                planId: formData.planId || undefined,
                tariff: formData.tariff || undefined,
                state: formData.state,
                dnsp: formData.dnsp,
                type: formData.type,
                vpp: formData.vpp,
                discountApplies: formData.discountApplies,
                discountPercentage: formData.discountPercentage || 0,
                offers: [{
                    offerName: formData.offerName || 'Default Offer',
                    anytime: parseFloat(formData.anytime) || 0,
                    supplyCharge: parseFloat(formData.supplyCharge) || 0,
                    vppOrcharge: parseFloat(formData.vppOrcharge) || 0,
                    peak: parseFloat(formData.peak) || 0,
                    shoulder: parseFloat(formData.shoulder) || 0,
                    offPeak: parseFloat(formData.offPeak) || 0,
                    cl1Supply: parseFloat(formData.cl1Supply) || 0,
                    cl1Usage: parseFloat(formData.cl1Usage) || 0,
                    cl2Supply: parseFloat(formData.cl2Supply) || 0,
                    cl2Usage: parseFloat(formData.cl2Usage) || 0,
                    demand: parseFloat(formData.demand) || 0,
                    demandOp: parseFloat(formData.demandOp) || 0,
                    demandP: parseFloat(formData.demandP) || 0,
                    demandS: parseFloat(formData.demandS) || 0,
                    fit: parseFloat(formData.fit) || 0,
                }]
            };

            await createRatePlan({ variables: { input } });
            toast.success('Rate plan created successfully');
            setAddModalOpen(false);
            setFormData(initialFormState);
            // Refresh the list
            setAllRatePlans([]);
            setPage(1);
            refetch(); // Actually reload the data
            refetchChanges?.(); // Update Save button state
        } catch (err: any) {
            console.error('Failed to create rate plan:', err);
            toast.error(err.message || 'Failed to create rate plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Rate Modal
    const handleEditRate = useCallback((ratePlan: RatePlan) => {
        setEditingRatePlan(ratePlan);
        const offer = ratePlan.offers?.[0];
        setFormData({
            codes: Array.isArray(ratePlan.codes) ? ratePlan.codes.join(', ') : (ratePlan.codes || ''),
            planId: ratePlan.planId || '',
            tariff: ratePlan.tariff || '',
            state: ratePlan.state || 'NSW',
            dnsp: typeof ratePlan.dnsp === 'number' ? ratePlan.dnsp : parseInt(String(ratePlan.dnsp) || '0', 10),
            type: typeof ratePlan.type === 'number' ? ratePlan.type : parseInt(String(ratePlan.type) || '0', 10),
            vpp: ratePlan.vpp || 0,
            discountApplies: ratePlan.discountApplies ? 1 : 0,
            discountPercentage: ratePlan.discountPercentage || 0,
            offerName: offer?.offerName || '',
            anytime: offer?.anytime?.toString() || '',
            supplyCharge: offer?.supplyCharge?.toString() || '',
            vppOrcharge: offer?.vppOrcharge?.toString() || '',
            peak: offer?.peak?.toString() || '',
            shoulder: offer?.shoulder?.toString() || '',
            offPeak: offer?.offPeak?.toString() || '',
            cl1Supply: offer?.cl1Supply?.toString() || '',
            cl1Usage: offer?.cl1Usage?.toString() || '',
            cl2Supply: offer?.cl2Supply?.toString() || '',
            cl2Usage: offer?.cl2Usage?.toString() || '',
            demand: offer?.demand?.toString() || '',
            demandOp: offer?.demandOp?.toString() || '',
            demandP: offer?.demandP?.toString() || '',
            demandS: offer?.demandS?.toString() || '',
            fit: offer?.fit?.toString() || '',
            fitPeak: offer?.fitPeak?.toString() || '',
            fitCritical: offer?.fitCritical?.toString() || '',
        });
        setFormErrors({});
        setEditModalOpen(true);
    }, []);

    // Submit Update Rate
    const handleUpdateRate = async () => {
        // Use ref for immediate check (state updates are async)
        if (isSubmittingRef.current) return;
        if (!editingRatePlan) return;
        if (!validateForm()) {
            return;
        }

        // Set ref immediately to block any concurrent calls
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            // Build the offer data if an offer exists
            const existingOffer = editingRatePlan.offers?.[0];
            const offersInput = existingOffer?.uid ? [{
                uid: existingOffer.uid,
                offerName: formData.offerName || existingOffer.offerName || 'Default Offer',
                anytime: parseFloat(formData.anytime) || 0,
                supplyCharge: parseFloat(formData.supplyCharge) || 0,
                vppOrcharge: parseFloat(formData.vppOrcharge) || 0,
                peak: parseFloat(formData.peak) || 0,
                shoulder: parseFloat(formData.shoulder) || 0,
                offPeak: parseFloat(formData.offPeak) || 0,
                cl1Supply: parseFloat(formData.cl1Supply) || 0,
                cl1Usage: parseFloat(formData.cl1Usage) || 0,
                cl2Supply: parseFloat(formData.cl2Supply) || 0,
                cl2Usage: parseFloat(formData.cl2Usage) || 0,
                demand: parseFloat(formData.demand) || 0,
                demandOp: parseFloat(formData.demandOp) || 0,
                demandP: parseFloat(formData.demandP) || 0,
                demandS: parseFloat(formData.demandS) || 0,
                fit: parseFloat(formData.fit) || 0,
            }] : undefined;

            // Single API call to update both rate plan and offers
            const planInput: any = {
                codes: formData.codes,
                planId: formData.planId || undefined,
                tariff: formData.tariff || undefined,
                state: formData.state,
                dnsp: formData.dnsp,
                type: formData.type,
                vpp: formData.vpp,
                discountApplies: formData.discountApplies,
                discountPercentage: formData.discountPercentage || 0,
                offers: offersInput, // Include offers in the same mutation
            };

            await updateRatePlan({ variables: { uid: editingRatePlan.uid, input: planInput } });

            toast.success('Rate plan updated successfully');
            setEditModalOpen(false);
            setEditingRatePlan(null);
            setFormData(initialFormState);
            // Refresh the list
            setAllRatePlans([]);
            setPage(1);
            refetch(); // Force refresh the list
            refetchChanges?.(); // Update Save button state
        } catch (err: any) {
            console.error('Failed to update rate plan:', err);
            toast.error(err.message || 'Failed to update rate plan');
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    // Open delete modal
    const handleDeleteClick = useCallback((ratePlan: RatePlan) => {
        setRatePlanToDelete(ratePlan);
        setDeleteConfirmCode('');
        setDeleteModalOpen(true);
    }, []);

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!ratePlanToDelete) return;
        const codes = Array.isArray(ratePlanToDelete.codes)
            ? ratePlanToDelete.codes.join(', ')
            : ratePlanToDelete.codes;
        if (deleteConfirmCode !== codes) return;

        setIsDeleting(true);
        try {
            await softDeleteRatePlan({ variables: { uid: ratePlanToDelete.uid } });
            toast.success('Rate plan deleted successfully');
            setAllRatePlans(prev =>
                prev.map(r => r.uid === ratePlanToDelete.uid ? { ...r, isDeleted: 1 } : r)
            );
            setDeleteModalOpen(false);
            setRatePlanToDelete(null);
            refetchChanges?.(); // Update Save button state
        } catch (err: any) {
            console.error('Failed to delete rate plan:', err);
            toast.error(err.message || 'Failed to delete rate plan');
        } finally {
            setIsDeleting(false);
        }
    };

    // Open restore modal
    const handleRestoreClick = useCallback((ratePlan: RatePlan) => {
        setRatePlanToRestore(ratePlan);
        setRestoreModalOpen(true);
    }, []);

    // Confirm restore
    const handleConfirmRestore = async () => {
        if (!ratePlanToRestore) return;

        setIsRestoring(true);
        try {
            await restoreRatePlanMutation({ variables: { uid: ratePlanToRestore.uid } });
            toast.success('Rate plan restored successfully');
            setAllRatePlans(prev =>
                prev.map(r => r.uid === ratePlanToRestore.uid ? { ...r, isDeleted: 0 } : r)
            );
            setRestoreModalOpen(false);
            setRatePlanToRestore(null);
            refetchChanges?.(); // Update Save button state
        } catch (err: any) {
            console.error('Failed to restore rate plan:', err);
            toast.error(err.message || 'Failed to restore rate plan');
        } finally {
            setIsRestoring(false);
        }
    };

    const showActions = canEdit || canDelete;

    const columns: Column<RatePlan>[] = useMemo(() => [

        {
            key: 'actions',
            header: 'Actions',
            width: 'w-[100px]',
            sticky: 'left' as const,
            stickyOffset: 0,
            render: (row: RatePlan) => (
                <div className="flex items-center gap-2">
                    {row.isDeleted ? (
                        canDelete && (
                            <Tooltip content="Restore Rate">
                                <button
                                    className="p-2 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                                    onClick={() => handleRestoreClick(row)}
                                >
                                    <RefreshCwIcon size={16} />
                                </button>
                            </Tooltip>
                        )
                    ) : (
                        <>
                            {canEdit && (
                                <Tooltip content="Edit Rate">
                                    <button
                                        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                                        onClick={() => handleEditRate(row)}
                                    >
                                        <PencilIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                            {canDelete && (
                                <Tooltip content="Delete Rate">
                                    <button
                                        className="p-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                                        onClick={() => handleDeleteClick(row)}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                        </>
                    )}
                    {!canEdit && !canDelete && !row.isDeleted && <span className="text-muted-foreground">-</span>}
                </div>
            )
        },
        {
            key: 'state',
            header: 'State',
            width: 'w-[60px]',
            sticky: 'left' as const,
            stickyOffset: showActions ? 100 : 0,
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'state') ? `Old: ${getOldValue(row, 'state')}` : null}>
                    <span className={isFieldChanged(row, 'state') ? 'bg-orange-400 text-orange-950 font-bold px-2 py-0.5 rounded' : ''}>{row.state || '-'}</span>
                </Tooltip>
            ),
        },
        {
            key: 'codes',
            header: 'Code',
            width: 'w-[150px]',
            sticky: 'left' as const,
            stickyOffset: showActions ? 160 : 60,
            render: (row: RatePlan) => {
                let codes: string[] = [];
                if (Array.isArray(row.codes)) {
                    codes = row.codes;
                } else if (typeof row.codes === 'string') {
                    try {
                        // Try parsing as JSON first (e.g. "[\"E1\"]")
                        const parsed = JSON.parse(row.codes);
                        if (Array.isArray(parsed)) codes = parsed;
                        else codes = [row.codes];
                    } catch {
                        // Fallback to comma separation or single value
                        codes = (row.codes as string).includes(',')
                            ? (row.codes as string).split(',').map(c => c.trim())
                            : [row.codes];
                    }
                }

                const codesChanged = isFieldChanged(row, 'codes');

                return (
                    <Tooltip content={codesChanged ? `Old: ${getOldValue(row, 'codes')}` : null}>
                        <div className={`flex flex-wrap gap-1 ${codesChanged ? 'bg-orange-300 dark:bg-orange-700/50 -m-2 p-2 rounded ring-1 ring-orange-400' : ''}`}>
                            {codes.map((code, idx) => (
                                <span key={idx} className={`text-xs px-2 py-0.5 rounded ${codesChanged ? 'bg-orange-400 text-orange-950 font-bold' : 'bg-gray-100 text-gray-800'}`}>
                                    {code}
                                </span>
                            )) || '-'}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            key: 'dnsp',
            header: 'DNSP',
            width: 'w-[120px]',
            render: (row: RatePlan) => (
                <div className={isFieldChanged(row, 'dnsp') ? "bg-orange-300 dark:bg-orange-700/50 -m-2 p-2 rounded ring-1 ring-orange-400" : ""}>
                    <Tooltip content={isFieldChanged(row, 'dnsp') ? `Old: ${getOldValue(row, 'dnsp')}` : null}>
                        <StatusField type="dnsp" value={row.dnsp} mode="badge" />
                    </Tooltip>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            width: 'w-[120px]',
            render: (row: RatePlan) => <StatusField type="rate_type" value={row.type} mode="badge" />,
        },
        {
            key: 'anytime',
            header: 'Anytime',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_anytime') ? `Old: ${getOldValue(row, 'offer_anytime')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_anytime') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-orange-50 text-orange-600'}`}>
                        {row.offers?.[0]?.anytime ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'peak',
            header: 'Peak',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_peak') ? `Old: ${getOldValue(row, 'offer_peak')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_peak') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-blue-50 text-blue-600'}`}>
                        {row.offers?.[0]?.peak ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'shoulder',
            header: 'Shoulder',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_shoulder') ? `Old: ${getOldValue(row, 'offer_shoulder')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_shoulder') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-blue-50 text-blue-600'}`}>
                        {row.offers?.[0]?.shoulder ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'offPeak',
            header: 'Off-Peak',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_offPeak') ? `Old: ${getOldValue(row, 'offer_offPeak')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_offPeak') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-blue-50 text-blue-600'}`}>
                        {row.offers?.[0]?.offPeak ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'supplyCharge',
            header: 'Supply Charge',
            width: 'w-[120px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_supplyCharge') ? `Old: ${getOldValue(row, 'offer_supplyCharge')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_supplyCharge') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-purple-50 text-purple-600'}`}>
                        {row.offers?.[0]?.supplyCharge ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'cl1Supply',
            header: 'CL1 Supply',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_cl1Supply') ? `Old: ${getOldValue(row, 'offer_cl1Supply')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_cl1Supply') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.cl1Supply ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'cl1Usage',
            header: 'CL1 Usage', // Assuming 'Usage' in image maps here or CL1 Usage
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_cl1Usage') ? `Old: ${getOldValue(row, 'offer_cl1Usage')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_cl1Usage') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.cl1Usage ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'cl2Supply',
            header: 'CL2 Supply',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_cl2Supply') ? `Old: ${getOldValue(row, 'offer_cl2Supply')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_cl2Supply') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.cl2Supply ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'cl2Usage',
            header: 'CL2 Usage',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_cl2Usage') ? `Old: ${getOldValue(row, 'offer_cl2Usage')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_cl2Usage') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.cl2Usage ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'demand',
            header: 'Demand',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_demand') ? `Old: ${getOldValue(row, 'offer_demand')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_demand') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-red-50 text-red-600'}`}>
                        {row.offers?.[0]?.demand ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'demandOp',
            header: 'Demand(OP)',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_demandOp') ? `Old: ${getOldValue(row, 'offer_demandOp')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_demandOp') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-red-50 text-red-600'}`}>
                        {row.offers?.[0]?.demandOp ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'demandP',
            header: 'Demand(P)',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_demandP') ? `Old: ${getOldValue(row, 'offer_demandP')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_demandP') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-red-50 text-red-600'}`}>
                        {row.offers?.[0]?.demandP ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'demandS',
            header: 'Demand(S)',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_demandS') ? `Old: ${getOldValue(row, 'offer_demandS')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_demandS') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-red-50 text-red-600'}`}>
                        {row.offers?.[0]?.demandS ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'fit',
            header: 'FIT',
            width: 'w-[80px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_fit') ? `Old: ${getOldValue(row, 'offer_fit')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_fit') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.fit ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'vppOrcharge',
            header: 'FIT-VPP',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <Tooltip content={isFieldChanged(row, 'offer_vppOrcharge') ? `Old: ${getOldValue(row, 'offer_vppOrcharge')}` : null}>
                    <span className={`px-2 py-1 rounded font-medium text-xs ${isFieldChanged(row, 'offer_vppOrcharge') ? 'bg-orange-400 text-orange-950 border border-orange-500 font-bold' : 'bg-green-50 text-green-600'}`}>
                        {row.offers?.[0]?.vppOrcharge ?? '-'}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: 'fitPeak',
            header: 'FIT-Peak',
            width: 'w-[100px]',
            render: (row: RatePlan) => <span className="bg-green-50 text-green-600 px-2 py-1 rounded font-medium text-xs">{row.offers?.[0]?.fitPeak ?? '-'}</span>,
        },
        {
            key: 'fitCritical',
            header: 'FIT-Critical',
            width: 'w-[100px]',
            render: (row: RatePlan) => <span className="bg-green-50 text-green-600 px-2 py-1 rounded font-medium text-xs">{row.offers?.[0]?.fitCritical ?? '-'}</span>,
        },
        {
            key: 'vpp',
            header: 'VPP Orchestration',
            width: 'w-[140px]',
            render: (row: RatePlan) => <span className="text-red-600 font-medium text-xs">{row.vpp ?? '-'}</span>,
        },
        {
            key: 'discount',
            header: 'Discount',
            width: 'w-[100px]',
            render: (row: RatePlan) => (
                <div className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors ${row.discountApplies ? 'bg-primary' : 'bg-gray-300'}`} onClick={() => console.log('Toggle Discount', row.uid)}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${row.discountApplies ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            ),
        },
        {
            key: 'tariff',
            header: 'Tariff Code',
            width: 'w-[100px]',
            render: (row: RatePlan) => <span className="font-medium text-foreground">{row.tariff || '-'}</span>,
        },
        {
            key: 'planId',
            header: 'Plan ID',
            width: 'w-[150px]',
            render: (row: RatePlan) => <span className="font-medium text-foreground">{row.planId || '-'}</span>,
        },
        {
            key: 'updatedAt',
            header: 'Updated',
            width: 'w-[150px]',
            render: (row: RatePlan) => <span className="text-muted-foreground">{formatDateTime(row.updatedAt)}</span>,
        }
    ].filter(col => col.key !== 'actions' || (canEdit || canDelete)), [handleEditRate, handleDeleteClick, handleRestoreClick, canEdit, canDelete, isFieldChanged, getOldValue]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Rates Management</h1>
                    <p className="text-muted-foreground">Manage utility rates and plans</p>
                </div>
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button
                            leftIcon={<PlusIcon size={16} />}
                            onClick={handleAddRate}
                        >
                            Add Rate
                        </Button>
                    )}
                    {canEdit && (
                        <>

                            <Button
                                variant="outline"
                                leftIcon={<ClockIcon size={16} />}
                                onClick={handleOpenHistory}
                            >
                                Versions
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Input
                                type="search"
                                placeholder="Search"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                containerClassName="w-[200px]"
                            />
                            <StatusField
                                type="state"
                                mode="select"
                                showAllOption
                                value={stateFilter}
                                onChange={(val) => {
                                    setAllRatePlans([]);
                                    setPage(1);
                                    setStateFilter(val as string);
                                }}
                                placeholder="State"
                                className="w-[150px]"
                            />
                            <StatusField
                                type="dnsp"
                                mode="select"
                                showAllOption
                                value={dnspFilter}
                                onChange={(val) => {
                                    setAllRatePlans([]);
                                    setPage(1);
                                    setDnspFilter(val as string);
                                }}
                                placeholder="DNSP"
                                className="w-[150px]"
                            />
                            <StatusField
                                type="rate_type"
                                mode="select"
                                showAllOption
                                value={typeFilter}
                                onChange={(val) => {
                                    setAllRatePlans([]);
                                    setPage(1);
                                    setTypeFilter(val as string);
                                }}
                                placeholder="Type"
                                className="w-[150px]"
                            />

                            <Button variant="outline" leftIcon={<FilterIcon size={16} />}>
                                Filters
                            </Button>


                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RefreshCwIcon size={14} />
                                Clear all
                            </button>
                        </div>
                        <div>
                            <Tooltip content={hasUnsavedChanges ? "Unsaved changes - Click to save version" : "All changes saved"}>
                                <Button
                                    variant={hasUnsavedChanges ? "default" : "outline"}
                                    onClick={handleCreateSnapshot}
                                    isLoading={isSnapshotting}
                                    disabled={!hasUnsavedChanges || isSnapshotting}
                                    className={`px-4 gap-2 transition-all duration-300 ${hasUnsavedChanges
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg border-0'
                                        : 'border-green-300 bg-green-50 text-green-600 cursor-default'}`}
                                >
                                    {!isSnapshotting && (
                                        hasUnsavedChanges ? (
                                            <>
                                                <SaveIcon size={16} />
                                                <span className="text-sm font-medium">Save</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                <span className="text-sm font-medium">Saved</span>
                                            </>
                                        )
                                    )}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {meta ? `Showing ${allRatePlans.length} out of ${meta.totalRecords} records` : 'Loading...'}
                    </p>
                </div>


                <DataTable
                    columns={columns}
                    data={allRatePlans}
                    loading={loading}
                    error={error?.message}
                    rowKey={(row) => row.uid}
                    emptyMessage="No rate plans found."
                    loadingMessage="Loading rates..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    rowClassName={(row) => changedRatePlanUids.has(row.uid) ? '[&>td]:!bg-orange-100 font-medium' : ''}
                />
            </div>

            {/* Add Rate Modal */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Add New Rate"
                size="full"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setAddModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRate}
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                        >
                            Create rate
                        </Button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    {/* Row 1: Code, Tariff Code */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. N73"
                                value={formData.codes}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, codes: e.target.value }));
                                    if (formErrors.codes) setFormErrors(prev => ({ ...prev, codes: '' }));
                                }}
                                className={formErrors.codes ? 'border-red-500' : ''}
                            />
                            {formErrors.codes && <p className="text-xs text-red-500">{formErrors.codes}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tariff Code</label>
                            <Input
                                placeholder="E.g. General"
                                value={formData.tariff}
                                onChange={(e) => setFormData(prev => ({ ...prev, tariff: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Row 2: Plan ID, State */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plan ID</label>
                            <Input
                                placeholder="E.g. PLAN-001"
                                value={formData.planId}
                                onChange={(e) => setFormData(prev => ({ ...prev, planId: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <div className="flex flex-wrap gap-2">
                                {STATE_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.state === option.value
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                            }`}
                                        onClick={() => setFormData(prev => ({ ...prev, state: option.value }))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DNSP */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">DNSP</label>
                        <div className="flex flex-wrap gap-2">
                            {DNSP_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${String(formData.dnsp) === opt.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, dnsp: parseInt(opt.value, 10) }))}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type and Toggles - inline layout */}
                    <div className="flex items-start gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.type === 0
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 0 }))}
                                >
                                    Business
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.type === 1
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 1 }))}
                                >
                                    Residential
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">VPP Enabled</label>
                            <br />
                            <button
                                type="button"
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.vpp === 1 ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, vpp: prev.vpp === 1 ? 0 : 1 }))}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${formData.vpp === 1 ? 'translate-x-4' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount applies</label>
                            <br />
                            <button
                                type="button"
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.discountApplies === 1 ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, discountApplies: prev.discountApplies === 1 ? 0 : 1 }))}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${formData.discountApplies === 1 ? 'translate-x-4' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* Anytime and Supply Charge */}
                    <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Anytime</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.anytime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, anytime: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Supply Charge</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.supplyCharge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, supplyCharge: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* VPP Orchestration */}
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                        <label className="text-sm font-medium">VPP Orchestration</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.vppOrcharge}
                            onChange={(e) => setFormData(prev => ({ ...prev, vppOrcharge: e.target.value }))}
                        />
                    </div>

                    {/* Peak, Shoulder, Off-Peak */}
                    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.peak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, peak: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Shoulder</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.shoulder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shoulder: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Off-Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.offPeak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, offPeak: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CL1/CL2 Supply/Usage */}
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL1 Supply</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl1Supply}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl1Supply: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL1 Usage</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl1Usage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl1Usage: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL2 Supply</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl2Supply}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl2Supply: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL2 Usage</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl2Usage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl2Usage: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Demand fields */}
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demand}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demand: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (OP)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandOp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandOp: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (P)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandP}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandP: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (S)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandS}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandS: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* FIT fields */}
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fit: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-VPP</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.vppOrcharge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vppOrcharge: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fitPeak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fitPeak: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-Critical</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fitCritical}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fitCritical: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Edit Rate Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingRatePlan(null);
                    setFormData(initialFormState);
                }}
                title="Edit Rate"
                size="full"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setEditModalOpen(false);
                                setEditingRatePlan(null);
                                setFormData(initialFormState);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateRate}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                        >
                            Update rate
                        </Button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    {/* Row 1: Code, Tariff Code */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="E.g. N73"
                                value={formData.codes}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, codes: e.target.value }));
                                    if (formErrors.codes) setFormErrors(prev => ({ ...prev, codes: '' }));
                                }}
                                className={formErrors.codes ? 'border-red-500' : ''}
                            />
                            {formErrors.codes && <p className="text-xs text-red-500">{formErrors.codes}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tariff Code</label>
                            <Input
                                placeholder="E.g. General"
                                value={formData.tariff}
                                onChange={(e) => setFormData(prev => ({ ...prev, tariff: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Row 2: Plan ID, State */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plan ID</label>
                            <Input
                                placeholder="E.g. PLAN-001"
                                value={formData.planId}
                                onChange={(e) => setFormData(prev => ({ ...prev, planId: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <div className="flex flex-wrap gap-2">
                                {STATE_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.state === option.value
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                            }`}
                                        onClick={() => setFormData(prev => ({ ...prev, state: option.value }))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DNSP */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">DNSP</label>
                        <div className="flex flex-wrap gap-2">
                            {DNSP_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${String(formData.dnsp) === opt.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, dnsp: parseInt(opt.value, 10) }))}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type and Toggles */}
                    <div className="flex items-start gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.type === 0
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 0 }))}
                                >
                                    Business
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.type === 1
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 1 }))}
                                >
                                    Residential
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">VPP Enabled</label>
                            <br />
                            <button
                                type="button"
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.vpp === 1 ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, vpp: prev.vpp === 1 ? 0 : 1 }))}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${formData.vpp === 1 ? 'translate-x-4' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount applies</label>
                            <br />
                            <button
                                type="button"
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.discountApplies === 1 ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                onClick={() => setFormData(prev => ({ ...prev, discountApplies: prev.discountApplies === 1 ? 0 : 1 }))}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${formData.discountApplies === 1 ? 'translate-x-4' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* Anytime and Supply Charge */}
                    <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Anytime</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.anytime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, anytime: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Supply Charge</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.supplyCharge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, supplyCharge: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* VPP Orchestration */}
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                        <label className="text-sm font-medium">VPP Orchestration</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.vppOrcharge}
                            onChange={(e) => setFormData(prev => ({ ...prev, vppOrcharge: e.target.value }))}
                        />
                    </div>

                    {/* Peak, Shoulder, Off-Peak */}
                    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.peak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, peak: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Shoulder</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.shoulder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shoulder: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Off-Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.offPeak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, offPeak: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CL1/CL2 Supply/Usage */}
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL1 Supply</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl1Supply}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl1Supply: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL1 Usage</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl1Usage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl1Usage: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL2 Supply</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl2Supply}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl2Supply: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CL2 Usage</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cl2Usage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cl2Usage: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Demand fields */}
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demand}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demand: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (OP)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandOp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandOp: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (P)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandP}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandP: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demand (S)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.demandS}
                                    onChange={(e) => setFormData(prev => ({ ...prev, demandS: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* FIT fields */}
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fit: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-VPP</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.vppOrcharge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vppOrcharge: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-Peak</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fitPeak}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fitPeak: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">FIT-Critical</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.fitCritical}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fitCritical: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm deletion"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirmCode !== (Array.isArray(ratePlanToDelete?.codes) ? ratePlanToDelete?.codes.join(', ') : ratePlanToDelete?.codes) || isDeleting}
                            isLoading={isDeleting}
                            loadingText="Deleting..."
                        >
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Type the code <span className="font-semibold text-foreground">{Array.isArray(ratePlanToDelete?.codes) ? ratePlanToDelete?.codes.join(', ') : ratePlanToDelete?.codes}</span> to delete this rate plan.
                    </p>
                    <Input
                        placeholder="Enter rate code"
                        value={deleteConfirmCode}
                        onChange={(e) => setDeleteConfirmCode(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            const codes = Array.isArray(ratePlanToDelete?.codes) ? ratePlanToDelete?.codes.join(', ') : ratePlanToDelete?.codes;
                            if (e.key === 'Enter' && deleteConfirmCode === codes) {
                                handleConfirmDelete();
                            }
                        }}
                    />
                </div>
            </Modal>

            {/* Restore Confirmation Modal */}
            <Modal
                isOpen={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                title="Confirm restoration"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setRestoreModalOpen(false)}
                            disabled={isRestoring}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmRestore}
                            isLoading={isRestoring}
                            loadingText="Restoring..."
                        >
                            Restore
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to restore <span className="font-semibold text-foreground">{Array.isArray(ratePlanToRestore?.codes) ? ratePlanToRestore?.codes.join(', ') : ratePlanToRestore?.codes}</span>?
                        This will make the rate plan visible and active again.
                    </p>
                </div>
            </Modal>

            {/* History Modal */}
            <RatesHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                refetchChanges={() => refetchChanges()}
                refetchRatePlans={() => {
                    setAllRatePlans([]);
                    setPage(1);
                    refetch();
                }}
            />
        </div >
    );
}
