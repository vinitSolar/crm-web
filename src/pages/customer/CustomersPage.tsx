import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { calculateDiscountedRate } from '../../lib/rate-utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, type Column, Modal } from '@/components/common';
import {
    PlusIcon, PencilIcon,
    CheckIcon, XIcon, MailIcon, Settings2Icon, PlugIcon, ZapIcon,
    ActivityIcon, InfoIcon, IdCardIcon,
    EyeIcon, TrashIcon, UploadIcon
} from '@/components/icons';
import { GET_CUSTOMERS_CURSOR, GET_CUSTOMER_BY_ID, SOFT_DELETE_CUSTOMER, SEND_REMINDER_EMAIL, CREATE_CUSTOMER, UPDATE_CUSTOMER, GET_ALL_FILTERED_CUSTOMER_IDS, GET_RATES_HISTORY_BY_VERSION, GET_CUSTOMER_NOTES, CREATE_CUSTOMER_NOTE, DELETE_CUSTOMER_NOTE } from '@/graphql';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { StatusField } from '@/components/common';
import { ConfirmationPopover } from '@/components/ui/ConfirmationPopover';
import { formatSydneyTime } from '@/lib/date';
import {
    //  apolloClient,
    secondaryApiAxios,
    apiAxios
} from '@/lib/apollo';
import { cn } from '@/lib/utils';
import BulkEmailModal from './BulkEmailModal';

import { SALE_TYPE_LABELS, BILLING_PREF_LABELS, DNSP_LABELS, DNSP_OPTIONS, DISCOUNT_OPTIONS, CUSTOMER_STATUS_OPTIONS, VPP_OPTIONS, VPP_CONNECTED_OPTIONS, ULTIMATE_STATUS_OPTIONS, MSAT_CONNECTED_OPTIONS, ID_TYPE_MAP, BATTERY_BRAND_OPTIONS } from '@/lib/constants';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

interface CustomerAddress {
    id: string;
    unitNumber?: string;
    streetNumber?: string;
    streetName?: string;
    streetType?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    country?: string;
    fullAddress?: string;
}

interface Customer {
    uid: string;
    customerId?: string;
    firstName: string;
    lastName: string;
    email: string;
    number?: string;
    status: number | string;
    tariffCode?: string;
    discount?: string;
    previousBill?: { path: string; filename?: string };
    identityProof?: { path: string; filename?: string };
    createdAt: string;
    rateVersion?: number;
    address?: CustomerAddress;
    ratePlan?: {
        dnsp?: number;
        tariff?: string;
    };
    vppDetails?: {
        vpp?: number;
        vppConnected?: number;
        vppSignupBonus?: number;
    };
    utilmateStatus?: number;
    msatDetails?: {
        msatConnected?: number;
    };
    utilmateDetails?: {
        utilmateConnected?: number;
    };
}

interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount?: number;
}

interface CustomersCursorResponse {
    customersCursor: {
        data: Customer[];
        pageInfo: PageInfo;
    };
}

// Extended customer details interface for modal
interface CustomerDetails {
    uid: string;
    customerId?: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    abn?: string;
    email?: string;
    number?: string;
    dob?: string;
    propertyType?: number;
    status: number;
    previousBill?: { uid: string; path: string; filename?: string };
    identityProof?: { uid: string; path: string; filename?: string };
    discount?: number;
    tariffCode?: string;
    signDate?: string;
    phoneVerifiedAt?: string;
    address?: CustomerAddress & { nmi?: string };
    enrollmentDetails?: {
        saletype?: number;
        connectiondate?: string;
        idtype?: number;
        idnumber?: string;
        idstate?: string;
        idexpiry?: string;
        concession?: number;
        lifesupport?: number;
        billingpreference?: number;
    };
    ratePlan?: {
        uid?: string;
        codes?: string;
        planId?: string;
        dnsp?: number;
        state?: string;
        tariff?: string;
        type?: number;
        vpp?: number;
        discountApplies?: number;
        discountPercentage?: number;
        offers?: Array<{
            uid?: string;
            offerName?: string;
            anytime?: number;
            supplyCharge?: number;
            peak?: number;
            offPeak?: number;
            shoulder?: number;
            fit?: number;
            fitPeak?: number;
            fitCritical?: number;
            fitVpp?: number;
            cl1Supply?: number;
            cl1Usage?: number;
            cl2Supply?: number;
            cl2Usage?: number;
            demand?: number;
            demandOp?: number;
            demandP?: number;
            demandS?: number;
            vppOrcharge?: number;
            isActive?: boolean;
        }>;
    };
    rateOffer?: {
        uid?: string;
        offerName?: string;
        anytime?: number;
        supplyCharge?: number;
        peak?: number;
        offPeak?: number;
        shoulder?: number;
        fit?: number;
    };
    vppDetails?: {
        vpp?: number;
        vppConnected?: number;
        vppSignupBonus?: number;
    };
    msatDetails?: {
        msatConnected?: number;
        msatConnectedAt?: string;
        msatUpdatedAt?: string;
    };
    solarDetails?: {
        id?: string;
        customerUid?: string;
        hassolar?: number;
        solarcapacity?: number;
        invertercapacity?: number;
    };
    batteryDetails?: {
        batterybrand?: string;
        snnumber?: string;
        batterycapacity?: number;
        exportlimit?: number;
        inverterCapacity?: number;
        checkCode?: string;
    };
    utilmateDetails?: {
        id?: string;
        customerUid?: string;
        siteIdentifier?: string;
        accountNumber?: string;
        utilmateConnected?: number;
        utilmateConnectedAt?: string;
    };
    utilmateStatus?: string | number;
    rateVersion?: number;
    createdAt?: string;
    updatedAt?: string;
    debitDetails?: {
        id: string | number;
        customerUid: string;
        accountType?: number;
        companyName?: string;
        abn?: string;
        firstName?: string;
        lastName?: string;
        bankName?: string;
        bankAddress?: string;
        bsb?: string;
        accountNumber?: string;
        paymentFrequency?: number;
        firstDebitDate?: string;
        optIn?: number;
    };
    documents?: Array<{
        id: string;
        uid: string;
        type?: string;
        name?: string;
        filename?: string;
        path?: string;
        size?: number;
        mimeType?: string;
        createdAt: string;
        createdBy?: string;
        createdByUser?: {
            name: string;
        };
    }>;
}

const DOCUMENT_TYPE_OPTIONS = [
    { label: 'Solar Contract', value: 'solar_contract' },
    { label: 'Connection Approval', value: 'connection_approval' },
    { label: 'Electrical Certificate', value: 'electrical_certificate' },
    { label: 'Site Photos', value: 'site_photos' },
    { label: 'Other', value: 'other' }
];






const ToggleSwitch = ({ checked, onChange, disabled }: { checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
                onChange(!checked);
            }
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);


interface SearchFilters {
    id: string;
    name: string;
    mobile: string;
    address: string;
    tariff: string;
    dnsp: string;
    discount: string;
    status: string;
    vpp: string;
    vppConnected: string;
    utilmateStatus: string;
    msatConnected: string;
}

const RateVersionTooltip = ({ version, children }: { version: string, children: React.ReactNode }) => {
    const { data, loading } = useQuery(GET_RATES_HISTORY_BY_VERSION, {
        variables: { version },
        skip: !version
    });

    const history = data?.ratesHistoryByVersion;
    const createdDate = history?.createdAt ? formatSydneyTime(history.createdAt) : 'Unknown';
    const isActive = history?.activeVersion === 1;

    return (
        <Tooltip
            position="bottom"
            className="whitespace-normal min-w-[220px] p-0 overflow-hidden bg-white dark:bg-neutral-900 border border-border shadow-xl text-foreground"
            content={
                loading ? (
                    <div className="p-3 text-xs text-muted-foreground">Loading details...</div>
                ) : history ? (
                    <div className="flex flex-col text-xs">
                        <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="font-semibold">Rate Version Details</span>
                        </div>
                        <div className="p-2 space-y-1">

                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={isActive ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                    {isActive ? 'Current Version' : 'Previous Version'}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{createdDate}</span>
                            </div>
                            {history.createdByName && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">By:</span>
                                    <span>{history.createdByName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-3 text-xs text-muted-foreground">No history found</div>
                )
            }
        >
            <div className="cursor-help inline-flex items-center gap-1 hover:text-primary transition-colors duration-200">
                {children}
            </div>
        </Tooltip>
    );
};

export function CustomersPage() {
    const navigate = useNavigate();
    const canView = useAuthStore((state) => state.canViewMenu('customers'));
    const canCreate = useAuthStore((state) => state.canCreateInMenu('customers'));
    const canEdit = useAuthStore((state) => state.canEditInMenu('customers'));
    const canDelete = useAuthStore((state) => state.canDeleteInMenu('customers'));
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        id: '',
        name: '',
        mobile: '',
        address: '',
        tariff: '',
        dnsp: '',
        discount: '',
        status: '',
        vpp: '',
        vppConnected: '',
        utilmateStatus: '',
        msatConnected: '',
    });

    const [debouncedFilters, setDebouncedFilters] = useState(searchFilters);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]); // Index 0 corresponds to page 1's start cursor (which is null)

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Customer details modal state
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<CustomerDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Detail Section State
    const [selectedDetailSection, setSelectedDetailSection] = useState<'info' | 'location' | 'account' | 'rates' | 'solar' | 'debit' | 'vpp' | 'utilmate' | 'notes' | 'documents' | 'electricity_bills'>('info');

    // Notes State
    const [noteText, setNoteText] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);

    // Document operations state
    const [isDeletingDocument, setIsDeletingDocument] = useState<string | null>(null);
    const [isUploadingDocument, setIsUploadingDocument] = useState<string | null>(null);
    const [isAddingDocument, setIsAddingDocument] = useState(false);
    const [newDocumentType, setNewDocumentType] = useState<string>('');
    const previousBillInputRef = useRef<HTMLInputElement>(null);
    const identityProofInputRef = useRef<HTMLInputElement>(null);
    const newDocumentInputRef = useRef<HTMLInputElement>(null);

    // Reset section when modal opens/customer changes
    useEffect(() => {
        if (detailsModalOpen) {
            setSelectedDetailSection('info');
        }
    }, [detailsModalOpen, selectedCustomerDetails?.uid]);

    // Lazy query for customer details
    const [fetchCustomerDetails] = useLazyQuery(GET_CUSTOMER_BY_ID, {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
    });

    // Lazy query for fetching all filtered customer IDs (for Select All)
    const [fetchAllFilteredIds] = useLazyQuery(GET_ALL_FILTERED_CUSTOMER_IDS, {
        fetchPolicy: 'network-only',
    });

    // Notes query and mutations
    const { data: notesData, loading: notesLoading, refetch: refetchNotes } = useQuery(GET_CUSTOMER_NOTES, {
        variables: { customerUid: selectedCustomerDetails?.uid || '' },
        skip: !selectedCustomerDetails?.uid || selectedDetailSection !== 'notes',
        fetchPolicy: 'network-only',
    });

    const [createNote] = useMutation(CREATE_CUSTOMER_NOTE);
    const [deleteNote] = useMutation(DELETE_CUSTOMER_NOTE);

    const handleAddNote = async () => {
        if (!noteText.trim() || !selectedCustomerDetails?.uid) return;
        setIsAddingNote(true);
        try {
            await createNote({
                variables: {
                    customerUid: selectedCustomerDetails.uid,
                    message: noteText.trim(),
                },
            });
            setNoteText('');
            refetchNotes();
            toast.success('Note added successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add note');
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleDeleteNote = async (noteUid: string) => {
        try {
            await deleteNote({ variables: { uid: noteUid } });
            refetchNotes();
            toast.success('Note deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete note');
        }
    };

    // Document handlers
    const handleDeleteDocument = async (docPath: string) => {
        if (!selectedCustomerDetails?.customerId) return;

        setIsDeletingDocument(docPath);
        try {
            // Use the full docPath directly - the API uses wildcard routing to handle nested paths
            // encodeURIComponent ensures special characters are properly encoded
            await apiAxios.delete(`/api/documents/${encodeURIComponent(docPath).replace(/%2F/g, '/')}`);

            // Refetch customer details to update UI
            const result = await fetchCustomerDetails({
                variables: { uid: selectedCustomerDetails.uid }
            });
            if (result.data?.customer) {
                setSelectedCustomerDetails(result.data.customer);
            }

            toast.success('Document deleted successfully');
        } catch (error: any) {
            console.error('Error deleting document:', error);
            toast.error(error.response?.data?.error || 'Failed to delete document');
        } finally {
            setIsDeletingDocument(null);
        }
    };

    const handleUploadDocument = async (documentType: string, file: File, startDate?: string, endDate?: string) => {
        if (!file) return;
        if (!selectedCustomerDetails?.customerId || !selectedCustomerDetails?.uid) return;

        setIsUploadingDocument(documentType);
        try {
            const formData = new FormData();
            formData.append('customerId', selectedCustomerDetails.customerId);
            formData.append('customer_uid', selectedCustomerDetails.uid);
            let apiDocType = documentType;
            let docName = documentType;

            if (documentType === 'previousBill') {
                apiDocType = 'previous_bill';
                docName = 'Previous Bill';
            } else if (documentType === 'identityProof') {
                apiDocType = 'identity_proof';
                docName = 'Identity Proof';
            } else {
                // For other documents, try to find a nice label or just use the type
                const option = DOCUMENT_TYPE_OPTIONS.find(o => o.value === documentType);
                docName = option ? option.label : documentType;
            }

            formData.append('documentType', apiDocType);
            formData.append('name', docName);
            if (startDate) formData.append('startDate', startDate);
            if (endDate) formData.append('endDate', endDate);
            formData.append('file', file);

            await apiAxios.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refetch customer details to update UI
            const result = await fetchCustomerDetails({
                variables: { uid: selectedCustomerDetails.uid }
            });
            if (result.data?.customer) {
                setSelectedCustomerDetails(result.data.customer);
            }

            toast.success('Document uploaded successfully');
            setIsAddingDocument(false);
            setNewDocumentType('');
            // Reset dates
            setBillStartDate('');
            setBillEndDate('');
        } catch (error: any) {
            console.error('Error uploading document:', error);
            toast.error(error.response?.data?.error || 'Failed to upload document');
        } finally {
            setIsUploadingDocument(null);
        }
    };


    // State for selection
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [bulkEmailModalOpen, setBulkEmailModalOpen] = useState(false);
    const [isSelectingAll, setIsSelectingAll] = useState(false);
    const [totalFilteredCount, setTotalFilteredCount] = useState<number | undefined>(undefined);

    const limit = 20;

    // Debounce search and reset pagination
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(searchFilters) !== JSON.stringify(debouncedFilters)) {
                setAllCustomers([]);
                setDebouncedFilters(searchFilters);
                // Reset pagination and selection
                setCurrentPage(1);
                setPageCursors([null]);
                setSelectedCustomerIds([]);
                setTotalFilteredCount(undefined);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchFilters, debouncedFilters]);

    const { data, loading, error, refetch } = useQuery<CustomersCursorResponse>(GET_CUSTOMERS_CURSOR, {
        variables: {
            first: limit,
            after: pageCursors[currentPage - 1] || null,
            searchId: debouncedFilters.id || undefined,
            searchName: debouncedFilters.name || undefined,
            searchMobile: debouncedFilters.mobile || undefined,
            searchAddress: debouncedFilters.address || undefined,
            searchTariff: debouncedFilters.tariff || undefined,
            searchDnsp: debouncedFilters.dnsp || undefined,
            searchDiscount: debouncedFilters.discount ? parseInt(debouncedFilters.discount) : undefined,
            searchStatus: debouncedFilters.status ? parseInt(debouncedFilters.status) : undefined,
            searchVpp: debouncedFilters.vpp ? parseInt(debouncedFilters.vpp) : undefined,
            searchVppConnected: debouncedFilters.vppConnected ? parseInt(debouncedFilters.vppConnected) : undefined,
            searchUtilmateStatus: debouncedFilters.utilmateStatus ? parseInt(debouncedFilters.utilmateStatus) : undefined,
            searchMsatConnected: debouncedFilters.msatConnected ? parseInt(debouncedFilters.msatConnected) : undefined,
        },
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const pageInfo = data?.customersCursor?.pageInfo;

    // Update customers when data changes
    useEffect(() => {
        if (data?.customersCursor?.data) {
            setAllCustomers(data.customersCursor.data);

            // If we have an endCursor and we are moving forward to a page we haven't visited yet (conceptually),
            // though with this array approach we usually just push the next one if it doesn't exist.
            if (data.customersCursor.pageInfo.endCursor) {
                setPageCursors(prev => {
                    const newCursors = [...prev];
                    // Ensure the cursor for the NEXT page (index = currentPage) is set
                    if (newCursors.length <= currentPage) {
                        newCursors[currentPage] = data.customersCursor.pageInfo.endCursor;
                    } else {
                        newCursors[currentPage] = data.customersCursor.pageInfo.endCursor;
                    }
                    return newCursors;
                });
            }
        }
    }, [data, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1) return;
        // Prevent going to next page if we don't have a cursor for it, unless it's page 1
        if (newPage > currentPage && !pageInfo?.hasNextPage) return;

        setCurrentPage(newPage);
        // Deselect when changing pages (optional, but typical for non-persisted selection across pages)
        // Keeping selection across pages might be desired, current logic allows it if IDs are kept.
        // Existing logic `setSelectedCustomerIds` persists IDs, so we can keep them.
    };

    const handleSearchChange = (key: keyof typeof searchFilters, value: string) => {
        setSearchFilters(prev => ({ ...prev, [key]: value }));
    };

    const [softDeleteCustomer] = useMutation(SOFT_DELETE_CUSTOMER);
    const [sendReminderEmail] = useMutation(SEND_REMINDER_EMAIL);
    const [createCustomer] = useMutation(CREATE_CUSTOMER);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [reminderSent, setReminderSent] = useState(false);
    const [freezingCustomer, setFreezingCustomer] = useState(false);
    const [freezeModalOpen, setFreezeModalOpen] = useState(false);
    const [customerToFreeze, setCustomerToFreeze] = useState<CustomerDetails | null>(null);
    const [markingNotInterested, setMarkingNotInterested] = useState(false);
    const [updateCustomer] = useMutation(UPDATE_CUSTOMER);

    // VPP Form State
    const [isEditingVpp, setIsEditingVpp] = useState(false);
    const [vppForm, setVppForm] = useState({
        vppSignupBonus: '',
        batteryBrand: '',
        snNumber: '',
        batteryCapacity: '',
        exportLimit: '',
        inverterCapacity: '',
        checkCode: ''
    });

    // Date state for electricity bill upload
    const [billStartDate, setBillStartDate] = useState<string>('');
    const [billEndDate, setBillEndDate] = useState<string>('');
    const [vppConnectModalOpen, setVppConnectModalOpen] = useState(false);
    const [utilmateConnectModalOpen, setUtilmateConnectModalOpen] = useState(false);

    // Utilmate Form State
    const [isEditingUtilmate, setIsEditingUtilmate] = useState(false);
    const [utilmateForm, setUtilmateForm] = useState({
        siteIdentifier: '',
        accountNumber: '',
        utilmateConnected: 0,
        utilmateConnectedAt: ''
    });

    // Sync VPP form data when customer details are loaded
    useEffect(() => {
        if (selectedCustomerDetails) {
            setVppForm({
                vppSignupBonus: selectedCustomerDetails.vppDetails?.vppSignupBonus?.toString() || '',
                batteryBrand: selectedCustomerDetails.batteryDetails?.batterybrand || '',
                snNumber: selectedCustomerDetails.batteryDetails?.snnumber || '',
                batteryCapacity: selectedCustomerDetails.batteryDetails?.batterycapacity?.toString() || '',
                exportLimit: selectedCustomerDetails.batteryDetails?.exportlimit?.toString() || '',
                inverterCapacity: selectedCustomerDetails.batteryDetails?.inverterCapacity?.toString() || '',
                checkCode: selectedCustomerDetails.batteryDetails?.checkCode || ''
            });
            // Reset editing state when switching customers
            setIsEditingVpp(false);

            setUtilmateForm({
                siteIdentifier: selectedCustomerDetails.utilmateDetails?.siteIdentifier || '',
                accountNumber: selectedCustomerDetails.utilmateDetails?.accountNumber || '',
                utilmateConnected: selectedCustomerDetails.utilmateDetails?.utilmateConnected || 0,
                utilmateConnectedAt: selectedCustomerDetails.utilmateDetails?.utilmateConnectedAt || ''
            });
            setIsEditingUtilmate(false);
        }
    }, [selectedCustomerDetails?.uid]); // Only depend on UID change to avoid loops

    const handleSaveVppDetails = async () => {
        if (!selectedCustomerDetails) return;
        console.log('selectedCustomerDetails', selectedCustomerDetails);
        try {
            const input: any = {
                vppDetails: {
                    vpp: 1, // Ensure VPP is ON
                    // Preserve existing connected status if just editing details, 
                    // or default to 0 if enabling for first time (backend handles logic usually, but let's be safe)
                    vppConnected: selectedCustomerDetails.vppDetails?.vppConnected || 0,
                    vppSignupBonus: vppForm.vppSignupBonus ? parseFloat(vppForm.vppSignupBonus) : undefined,
                },
                batteryDetails: vppForm.batteryBrand ? {
                    batterybrand: vppForm.batteryBrand,
                    snnumber: vppForm.snNumber || undefined,
                    batterycapacity: vppForm.batteryCapacity ? parseFloat(vppForm.batteryCapacity) : undefined,
                    exportlimit: vppForm.exportLimit ? parseFloat(vppForm.exportLimit) : undefined,
                    inverterCapacity: vppForm.inverterCapacity ? parseFloat(vppForm.inverterCapacity) : undefined,
                    checkCode: vppForm.checkCode || undefined,
                } : undefined
            };

            await updateCustomer({
                variables: {
                    uid: selectedCustomerDetails.uid,
                    input
                }
            });

            // Call Secondary API
            try {
                console.log('Attempting to call secondary API...');
                const response = await secondaryApiAxios.post('/api/v1/utilmate/user/add-user-battery', {
                    userId: selectedCustomerDetails.uid,
                    batteryBrand: vppForm.batteryBrand,
                    snNumber: vppForm.snNumber,
                    checkCode: vppForm.checkCode,
                    batteryUsableCapacity: vppForm.batteryCapacity ? parseFloat(vppForm.batteryCapacity) : 0,
                    inverterCapacity: vppForm.inverterCapacity ? parseFloat(vppForm.inverterCapacity) : 0
                });
                console.log('Secondary API call success:', response.data);
            } catch (secErr) {
                console.error('Failed to sync with secondary API', secErr);
            }

            toast.success('VPP details saved successfully');
            setIsEditingVpp(false);

            // Optimistic update
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                vppDetails: {
                    ...selectedCustomerDetails.vppDetails,
                    vpp: 1,
                    vppConnected: input.vppDetails.vppConnected,
                    vppSignupBonus: input.vppDetails.vppSignupBonus
                },
                batteryDetails: input.batteryDetails
            });

        } catch (error: any) {
            console.error('Error saving VPP details:', error);
            toast.error(error.message || 'Failed to save VPP details');
        }
    };

    const handleSaveUtilmateDetails = async () => {
        if (!selectedCustomerDetails) return;

        try {
            const input: any = {
                utilmateDetails: {
                    siteIdentifier: utilmateForm.siteIdentifier || undefined,
                    accountNumber: utilmateForm.accountNumber || undefined,
                    utilmateConnected: utilmateForm.utilmateConnected,
                    utilmateConnectedAt: utilmateForm.utilmateConnectedAt || undefined,
                }
            };

            await updateCustomer({
                variables: {
                    uid: selectedCustomerDetails.uid,
                    input
                }
            });

            toast.success('Utilmate details saved successfully');
            setIsEditingUtilmate(false);

            // Optimistic update
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                utilmateDetails: {
                    ...selectedCustomerDetails.utilmateDetails,
                    ...input.utilmateDetails
                }
            });

        } catch (error: any) {
            console.error('Error saving Utilmate details:', error);
            toast.error(error.message || 'Failed to save Utilmate details');
        }
    };

    const handleFreezeClick = (customer: CustomerDetails) => {
        setCustomerToFreeze(customer);
        setFreezeModalOpen(true);
    };

    const handleConfirmFreeze = async () => {
        if (!customerToFreeze) return;
        const customer = customerToFreeze;
        setFreezeModalOpen(false);
        setFreezingCustomer(true);
        try {
            // Build input from current customer details
            const input: any = {
                tenant: 'vinitSolar',
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                number: customer.number,
                dob: customer.dob,
                propertyType: customer.propertyType,
                tariffCode: customer.tariffCode,
                discount: customer.discount,
                rateVersion: customer.rateVersion, // Preserve rate version
                previousCustomerUid: customer.uid, // Link to the frozen customer
                status: 1, // Set status to 1 for the new customer
            };

            // Add address if exists
            if (customer.address) {
                input.address = {
                    unitNumber: customer.address.unitNumber,
                    streetNumber: customer.address.streetNumber,
                    streetName: customer.address.streetName,
                    streetType: customer.address.streetType,
                    suburb: customer.address.suburb,
                    state: customer.address.state,
                    postcode: customer.address.postcode,
                    country: customer.address.country,
                    nmi: customer.address.nmi,
                };
            }

            // Add enrollment details if exists
            if (customer.enrollmentDetails) {
                input.enrollmentDetails = {
                    saletype: customer.enrollmentDetails.saletype,
                    connectiondate: customer.enrollmentDetails.connectiondate,
                    idtype: customer.enrollmentDetails.idtype,
                    idnumber: customer.enrollmentDetails.idnumber,
                    idstate: customer.enrollmentDetails.idstate,
                    idexpiry: customer.enrollmentDetails.idexpiry,
                    concession: customer.enrollmentDetails.concession,
                    lifesupport: customer.enrollmentDetails.lifesupport,
                    billingpreference: customer.enrollmentDetails.billingpreference,
                };
            }

            // Add VPP details if exists
            if (customer.vppDetails) {
                input.vppDetails = {
                    vpp: customer.vppDetails.vpp,
                    vppConnected: 0, // Reset VPP connected status
                    vppSignupBonus: customer.vppDetails.vppSignupBonus,
                };
            }

            // Add Solar details if exists
            if (customer.solarDetails) {
                input.solarDetails = {
                    hassolar: customer.solarDetails.hassolar,
                    solarcapacity: customer.solarDetails.solarcapacity,
                    invertercapacity: customer.solarDetails.invertercapacity,
                };
            }

            const { data } = await createCustomer({
                variables: { input }
            });

            if (data?.createCustomer?.uid) {
                // Update the previous customer's status to 4 (Frozen)
                await updateCustomer({
                    variables: {
                        uid: customer.uid,
                        input: { status: 4 }
                    }
                });

                toast.success('Customer frozen and new customer created successfully');
                setDetailsModalOpen(false);
                // Refresh the customer list - reset state and refetch
                setAllCustomers([]);
                setPageCursors([null]);
                setCurrentPage(1);
                refetch();
            }
        } catch (error: any) {
            console.error('Error freezing customer:', error);
            toast.error(error.message || 'Failed to freeze customer');
        } finally {
            setFreezingCustomer(false);
        }
    };

    const handleMarkNotInterested = async () => {
        if (!selectedCustomerDetails) return;
        setMarkingNotInterested(true);
        try {
            await updateCustomer({
                variables: {
                    uid: selectedCustomerDetails.uid,
                    input: { status: 5 }
                }
            });
            toast.success('Customer marked as Not Interested');
            // Update local state
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                status: 5
            });
            // Refresh the list
            refetch();
        } catch (error: any) {
            console.error('Error marking customer as not interested:', error);
            toast.error(error.message || 'Failed to update customer status');
        } finally {
            setMarkingNotInterested(false);
        }
    };

    const handleVppToggle = async (customerUid: string, newValue: boolean) => {
        // If turning ON, open modal to collect details unless it's just a quick toggle off/on
        // But user requirement says "when tries to turn on... ask this detail first"
        // So we interpret this as: always ask details when connecting.
        if (newValue) {
            // Pre-fill form with existing details if available
            setVppForm({
                vppSignupBonus: selectedCustomerDetails?.vppDetails?.vppSignupBonus?.toString() || '',
                batteryBrand: selectedCustomerDetails?.batteryDetails?.batterybrand || '',
                snNumber: selectedCustomerDetails?.batteryDetails?.snnumber || '',
                batteryCapacity: selectedCustomerDetails?.batteryDetails?.batterycapacity?.toString() || '',

                exportLimit: selectedCustomerDetails?.batteryDetails?.exportlimit?.toString() || '',
                inverterCapacity: selectedCustomerDetails?.batteryDetails?.inverterCapacity?.toString() || '',
                checkCode: selectedCustomerDetails?.batteryDetails?.checkCode || ''
            });
            setVppConnectModalOpen(true);
            return;
        }

        // Optimistic update - immediately update UI
        const previousValue = selectedCustomerDetails?.vppDetails?.vppConnected;
        if (selectedCustomerDetails) {
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                vppDetails: {
                    ...selectedCustomerDetails.vppDetails,
                    vppConnected: newValue ? 1 : 0
                }
            });
        }

        try {
            await updateCustomer({
                variables: {
                    uid: customerUid,
                    input: {
                        vppDetails: {
                            vppConnected: newValue ? 1 : 0
                        }
                    }
                }
            });
            toast.success(`VPP ${newValue ? 'connected' : 'disconnected'} successfully`);
        } catch (error: any) {
            console.error('Error updating VPP status:', error);
            toast.error(error.message || 'Failed to update VPP status');
            // Revert to previous value on failure
            if (selectedCustomerDetails) {
                setSelectedCustomerDetails({
                    ...selectedCustomerDetails,
                    vppDetails: {
                        ...selectedCustomerDetails.vppDetails,
                        vppConnected: previousValue
                    }
                });
            }
        }
    };

    const handleConfirmVppConnect = async () => {
        if (!selectedCustomerDetails) return;

        try {
            const input: any = {
                vppDetails: {
                    vpp: 1, // Ensure VPP is marked as eligible/active
                    vppConnected: 1, // Connect it
                    vppSignupBonus: vppForm.vppSignupBonus ? parseFloat(vppForm.vppSignupBonus) : undefined,
                },
                batteryDetails: vppForm.batteryBrand ? {
                    batterybrand: vppForm.batteryBrand,
                    snnumber: vppForm.snNumber || undefined,
                    batterycapacity: vppForm.batteryCapacity ? parseFloat(vppForm.batteryCapacity) : undefined,

                    exportlimit: vppForm.exportLimit ? parseFloat(vppForm.exportLimit) : undefined,
                    inverterCapacity: vppForm.inverterCapacity ? parseFloat(vppForm.inverterCapacity) : undefined,
                    checkCode: vppForm.checkCode || undefined,
                } : undefined
            };

            await updateCustomer({
                variables: {
                    uid: selectedCustomerDetails.uid,
                    input
                }
            });

            // Call Secondary API
            try {
                console.log('Attempting to call secondary API from handleConfirmVppConnect...');
                const response = await secondaryApiAxios.post('/api/v1/utilmate/user/add-user-battery', {
                    user_id: selectedCustomerDetails.customerId,
                    battery_brand: vppForm.batteryBrand,
                    sn_number: vppForm.snNumber,
                    check_code: vppForm.checkCode,
                    battery_usable_capacity: vppForm.batteryCapacity ? parseFloat(vppForm.batteryCapacity) : 0,
                    inverter_capacity: vppForm.inverterCapacity ? parseFloat(vppForm.inverterCapacity) : 0
                });
                console.log('Secondary API call success:', response.data);
            } catch (secErr) {
                console.error('Failed to sync with secondary API', secErr);
            }

            toast.success('VPP Connected and details saved');
            setVppConnectModalOpen(false);

            // Update local state
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                vppDetails: {
                    ...selectedCustomerDetails.vppDetails,
                    vpp: 1,
                    vppConnected: 1,
                    vppSignupBonus: input.vppDetails.vppSignupBonus
                },
                batteryDetails: input.batteryDetails
            });

        } catch (error: any) {
            console.error('Error connecting VPP:', error);
            toast.error(error.message || 'Failed to connect VPP');
        }
    };

    const handleMsatToggle = async (customerUid: string, newValue: boolean) => {
        // Optimistic update - immediately update UI
        const previousValue = selectedCustomerDetails?.msatDetails?.msatConnected;
        const now = new Date().toISOString();
        if (selectedCustomerDetails) {
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                msatDetails: {
                    ...selectedCustomerDetails.msatDetails,
                    msatConnected: newValue ? 1 : 0,
                    msatConnectedAt: newValue ? now : selectedCustomerDetails.msatDetails?.msatConnectedAt,
                    msatUpdatedAt: now
                }
            });
        }

        try {
            await updateCustomer({
                variables: {
                    uid: customerUid,
                    input: {
                        msatDetails: {
                            msatConnected: newValue ? 1 : 0,
                            msatConnectedAt: newValue ? now : undefined,
                            msatUpdatedAt: now
                        }
                    }
                }
            });
            toast.success(`MSAT ${newValue ? 'connected' : 'disconnected'} successfully`);
        } catch (error: any) {
            console.error('Error updating MSAT status:', error);
            toast.error(error.message || 'Failed to update MSAT status');
            // Revert to previous value on failure
            if (selectedCustomerDetails) {
                setSelectedCustomerDetails({
                    ...selectedCustomerDetails,
                    msatDetails: {
                        ...selectedCustomerDetails.msatDetails,
                        msatConnected: previousValue
                    }
                });
            }
        }
    };

    const handleUtilmateToggle = async (customerUid: string, newValue: boolean) => {
        // Restriction: Cannot connect to Utilmate if MSAT is not connected
        if (newValue && selectedCustomerDetails?.msatDetails?.msatConnected !== 1) {
            toast.error("Please connect to MSAT first before connecting to Utilmate.");
            return;
        }

        if (newValue) {
            // Pre-fill form with existing details if available
            setUtilmateForm({
                siteIdentifier: selectedCustomerDetails?.utilmateDetails?.siteIdentifier || '',
                accountNumber: selectedCustomerDetails?.utilmateDetails?.accountNumber || '',
                utilmateConnected: 1,
                utilmateConnectedAt: selectedCustomerDetails?.utilmateDetails?.utilmateConnectedAt || ''
            });
            setUtilmateConnectModalOpen(true);
            return;
        }

        // Optimistic update - immediately update UI
        const previousValue = selectedCustomerDetails?.utilmateDetails?.utilmateConnected;
        const now = new Date().toISOString();
        if (selectedCustomerDetails) {
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                utilmateDetails: {
                    ...selectedCustomerDetails.utilmateDetails,
                    utilmateConnected: newValue ? 1 : 0,
                    utilmateConnectedAt: newValue ? now : selectedCustomerDetails.utilmateDetails?.utilmateConnectedAt,
                }
            });

            // Also update form
            setUtilmateForm(prev => ({
                ...prev,
                utilmateConnected: newValue ? 1 : 0,
                utilmateConnectedAt: newValue ? now : prev.utilmateConnectedAt
            }));
        }

        try {
            await updateCustomer({
                variables: {
                    uid: customerUid,
                    input: {
                        utilmateDetails: {
                            utilmateConnected: newValue ? 1 : 0,
                            utilmateConnectedAt: newValue ? now : undefined,
                        }
                    }
                }
            });
            toast.success(`Utilmate ${newValue ? 'connected' : 'disconnected'} successfully`);
        } catch (error: any) {
            console.error('Error updating Utilmate status:', error);
            toast.error(error.message || 'Failed to update Utilmate status');
            // Revert to previous value on failure
            if (selectedCustomerDetails) {
                setSelectedCustomerDetails({
                    ...selectedCustomerDetails,
                    utilmateDetails: {
                        ...selectedCustomerDetails.utilmateDetails,
                        utilmateConnected: previousValue
                    }
                });

                setUtilmateForm(prev => ({
                    ...prev,
                    utilmateConnected: previousValue || 0
                }));
            }
        }
    };

    const handleConfirmUtilmateConnect = async () => {
        if (!selectedCustomerDetails) return;

        try {
            const now = new Date().toISOString();
            const input: any = {
                utilmateDetails: {
                    siteIdentifier: utilmateForm.siteIdentifier || undefined,
                    accountNumber: utilmateForm.accountNumber || undefined,
                    utilmateConnected: 1,
                    utilmateConnectedAt: now,
                }
            };

            await updateCustomer({
                variables: {
                    uid: selectedCustomerDetails.uid,
                    input
                }
            });

            // Call Secondary API
            try {
                console.log('Attempting to call secondary API for Utilmate Connect...');
                const response = await secondaryApiAxios.post('/api/v1/utilmate/user/add-user', {
                    account_number: utilmateForm.accountNumber,
                    site_identifier: utilmateForm.siteIdentifier,
                    gee_id: selectedCustomerDetails.customerId || selectedCustomerDetails.uid, // Fallback to UID if customerId is missing
                    dnsp: selectedCustomerDetails.ratePlan?.dnsp ? (DNSP_LABELS[selectedCustomerDetails.ratePlan.dnsp] || '') : '',
                    nmi_number: selectedCustomerDetails.address?.nmi || ''
                });
                console.log('Secondary API call success (Utilmate):', response.data);
            } catch (secErr) {
                console.error('Failed to sync with secondary API', secErr);
            }

            toast.success('Utilmate connected and details saved');
            setUtilmateConnectModalOpen(false);

            // Update local state
            setSelectedCustomerDetails({
                ...selectedCustomerDetails,
                utilmateDetails: {
                    ...selectedCustomerDetails.utilmateDetails,
                    ...input.utilmateDetails
                }
            });

        } catch (error: any) {
            console.error('Error connecting Utilmate:', error);
            toast.error(error.message || 'Failed to connect Utilmate');
        }
    };

    const handleSendReminder = async (customerUid: string) => {
        setSendingReminder(true);
        try {
            const { data } = await sendReminderEmail({
                variables: { customerUid }
            });

            if (data?.sendReminderEmail?.success) {
                toast.success(data.sendReminderEmail.message || 'Reminder sent successfully');
                setReminderSent(true);
            } else {
                toast.error(data?.sendReminderEmail?.message || 'Failed to send reminder');
            }
        } catch (error: any) {
            console.error('Error sending reminder:', error);
            toast.error(error.message || 'Failed to send reminder');
        } finally {
            setSendingReminder(false);
        }
    };

    // const handleDeleteClick = (customer: Customer) => {
    //     setCustomerToDelete(customer);
    //     setDeleteConfirmName('');
    //     setDeleteModalOpen(true);
    // };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;
        const confirmValue = customerToDelete.customerId || customerToDelete.uid;
        if (deleteConfirmName !== confirmValue) return;

        setIsDeleting(true);
        try {
            const { data: result } = await softDeleteCustomer({
                variables: { uid: customerToDelete.uid }
            });

            if (result?.softDeleteCustomer) {
                // Remove from local state immediately
                setAllCustomers(prev => prev.filter(c => c.uid !== customerToDelete.uid));
                setDeleteModalOpen(false);
                setCustomerToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete customer:', err);
            alert('Failed to delete customer. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (customer: Customer) => {
        navigate(`/customers/${customer.uid}`);
    };

    // Handler to view customer details in modal
    const handleViewDetails = async (customer: Customer) => {
        setDetailsModalOpen(true);
        setIsLoadingDetails(true);
        setSelectedCustomerDetails(null);

        try {
            const result = await fetchCustomerDetails({
                variables: { uid: customer.uid }
            });

            console.log('fetchCustomerDetails result:', result);

            if (result.error) {
                console.error('GraphQL error:', result.error);
            }

            if (result.data?.customer) {
                console.log('Setting customer details:', result.data.customer);
                setSelectedCustomerDetails(result.data.customer);
            } else {
                console.warn('No customer data in response:', result.data);
            }
        } catch (err) {
            console.error('Failed to fetch customer details:', err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // allCustomers now contains API-filtered results (search is done server-side)
    const filteredCustomers = allCustomers;

    const showActionsColumn = canView || canEdit || canDelete;

    // Selection Logic handled by DataTable
    const hasSelection = selectedCustomerIds.length > 0;

    // Handle Select All - fetches all customer IDs matching current filters from backend
    const handleSelectAll = async (selectAll: boolean) => {
        if (!selectAll) {
            // Deselect all
            setSelectedCustomerIds([]);
            return;
        }

        // Fetch all customer IDs matching the current filters
        setIsSelectingAll(true);
        try {
            const { data } = await fetchAllFilteredIds({
                variables: {
                    searchId: debouncedFilters.id || undefined,
                    searchName: debouncedFilters.name || undefined,
                    searchMobile: debouncedFilters.mobile || undefined,
                    searchAddress: debouncedFilters.address || undefined,
                    searchTariff: debouncedFilters.tariff || undefined,
                    searchDnsp: debouncedFilters.dnsp || undefined,
                    searchDiscount: debouncedFilters.discount ? parseInt(debouncedFilters.discount) : undefined,
                    searchStatus: debouncedFilters.status ? parseInt(debouncedFilters.status) : undefined,
                    searchVpp: debouncedFilters.vpp ? parseInt(debouncedFilters.vpp) : undefined,
                    searchVppConnected: debouncedFilters.vppConnected ? parseInt(debouncedFilters.vppConnected) : undefined,
                    searchUtilmateStatus: debouncedFilters.utilmateStatus ? parseInt(debouncedFilters.utilmateStatus) : undefined,
                    searchMsatConnected: debouncedFilters.msatConnected ? parseInt(debouncedFilters.msatConnected) : undefined,
                },
            });

            if (data?.customersCursor?.data) {
                const allIds = data.customersCursor.data.map((c: { uid: string }) => c.uid);
                setSelectedCustomerIds(allIds);
                setTotalFilteredCount(allIds.length);
                // toast.success(`Selected all ${allIds.length} customers matching your filters`);
            }
        } catch (error: any) {
            console.error('Error fetching all customer IDs:', error);
            toast.error('Failed to select all customers');
            setSelectedCustomerIds([]);
        } finally {
            setIsSelectingAll(false);
        }
    };

    const columns: Column<Customer>[] = [
        // Only show actions column if user has at least one action permission or we need selection

        {
            key: 'id',
            header: (
                <div className="flex flex-col gap-1 max-w-[100px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Customer ID</span>
                    </div>
                    <Input
                        value={searchFilters.id}
                        onChange={(e) => handleSearchChange('id', e.target.value)}
                        placeholder="Search ID..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => (
                row.status === 4 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 cursor-not-allowed">
                        {row.customerId || row.uid.slice(0, 8)}
                    </span>
                ) : (
                    <button
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        onClick={() => handleViewDetails(row)}
                    >
                        {row.customerId || row.uid.slice(0, 8)}
                    </button>
                )
            ),
        },
        {
            key: 'name',
            header: (
                <div className="flex flex-col gap-1 min-w-[100px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Name</span>
                    </div>
                    <Input
                        value={searchFilters.name}
                        onChange={(e) => handleSearchChange('name', e.target.value)}
                        placeholder="Search name..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            width: 'w-[120px]',
            render: (row) => <span className="font-medium text-foreground">{row.firstName} {row.lastName}</span>,
        },
        {
            key: 'discount',
            header: (
                <div className="flex flex-col gap-1 items-start">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Discount</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'All' }, ...DISCOUNT_OPTIONS]}
                        value={searchFilters.discount}
                        onChange={(val) => handleSearchChange('discount', val as string)}
                        placeholder="All"
                        className="h-7 text-xs w-[70px]"
                    />
                </div>
            ),
            render: (row) => <span className="text-foreground">{row.discount ? `${row.discount} %` : '0 %'}</span>,
        },
        {
            key: 'status',
            header: (
                <div className="flex flex-col gap-1 items-start">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'All' }, ...CUSTOMER_STATUS_OPTIONS]}
                        value={searchFilters.status}
                        onChange={(val) => handleSearchChange('status', val as string)}
                        placeholder="All"
                        className="h-7 text-xs w-[90px]"
                    />
                </div>
            ),
            width: 'w-[110px]',
            render: (row: Customer) => (
                <div className="whitespace-nowrap">
                    <StatusField
                        type="customer_status"
                        value={row.status}
                        mode="badge"
                    />
                </div>
            ),
        },
        {
            key: 'vppConnected',
            header: (
                <div className="flex flex-col gap-1 items-start">
                    <div className='flex gap-1 items-center'>
                        <span className="text-xs font-semibold uppercase text-muted-foreground whitespace-nowrap">VPP</span>
                        <Select
                            options={[{ value: '', label: 'All' }, ...VPP_OPTIONS]}
                            value={searchFilters.vpp}
                            onChange={(val) => handleSearchChange('vpp', val as string)}
                            placeholder="All"
                            className="h-7 text-xs w-[70px]"
                        />
                    </div>
                    <Select
                        options={[{ value: '', label: 'All' }, ...VPP_CONNECTED_OPTIONS]}
                        value={searchFilters.vppConnected}
                        onChange={(val) => handleSearchChange('vppConnected', val as string)}
                        placeholder="All"
                        className="h-7 text-xs w-[98px]"
                    />
                </div>
            ),
            render: (row) => (
                <div className="flex justify-center">
                    {row.vppDetails?.vppConnected === 1 ? (
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1">
                            <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1">
                            <XIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    )}
                </div>
            ),
        },
        ...(searchFilters.status === '3' ? [
            {
                key: 'utilmateStatus',
                header: (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="h-7 flex items-center">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Ultimate</span>
                        </div>
                        <Select
                            options={[{ value: '', label: 'All' }, ...ULTIMATE_STATUS_OPTIONS]}
                            value={searchFilters.utilmateStatus}
                            onChange={(val) => handleSearchChange('utilmateStatus', val as string)}
                            placeholder="All"
                            className="h-7 text-xs w-[70px]"
                        />
                    </div>
                ),
                render: (row: Customer) => (
                    <div className="flex justify-center">
                        {row.utilmateDetails?.utilmateConnected === 1 ? (
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1">
                                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1">
                                <XIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: 'msatConnected',
                header: (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="h-7 flex items-center">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">MSAT</span>
                        </div>
                        <Select
                            options={[{ value: '', label: 'All' }, ...MSAT_CONNECTED_OPTIONS]}
                            value={searchFilters.msatConnected}
                            onChange={(val) => handleSearchChange('msatConnected', val as string)}
                            placeholder="All"
                            className="h-7 text-xs w-[70px]"
                        />
                    </div>
                ),
                render: (row: Customer) => (
                    <div className="flex justify-center">
                        {row.msatDetails?.msatConnected === 1 ? (
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1">
                                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1">
                                <XIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                    </div>
                ),
            }
        ] : []),
        {
            key: 'mobile',
            header: (
                <div className="flex flex-col gap-1 max-w-[110px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Mobile</span>
                    </div>
                    <Input
                        value={searchFilters.mobile}
                        onChange={(e) => handleSearchChange('mobile', e.target.value)}
                        placeholder="Search mobile..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => <span className="text-foreground">{row.number || '-'}</span>,
        },
        {
            key: 'address',
            header: (
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Address</span>
                    </div>
                    <Input
                        value={searchFilters.address}
                        onChange={(e) => handleSearchChange('address', e.target.value)}
                        placeholder="Search address..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => {
                const fullAddr = row.address?.fullAddress;
                if (!fullAddr) return <span className="text-muted-foreground">-</span>;
                return (
                    <Tooltip content={fullAddr}>
                        <span className="text-foreground text-sm truncate max-w-[220px] block">
                            {fullAddr}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            key: 'tariff',
            header: (
                <div className="flex flex-col gap-1 max-w-[100px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Tariff</span>
                    </div>
                    <Input
                        value={searchFilters.tariff}
                        onChange={(e) => handleSearchChange('tariff', e.target.value)}
                        placeholder="Search tariff..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => <span className="text-foreground">{row.tariffCode || row.ratePlan?.tariff || '-'}</span>,
        },
        {
            key: 'dnsp',
            header: (
                <div className="flex flex-col gap-1 items-start">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">DNSP</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'All' }, ...DNSP_OPTIONS]}
                        value={searchFilters.dnsp}
                        onChange={(val) => handleSearchChange('dnsp', val as string)}
                        placeholder="All"
                        className="h-7 text-xs w-[90px]"
                    />
                </div>
            ),
            render: (row) => <StatusField type="dnsp" value={row.ratePlan?.dnsp} mode="badge" />,
        },
        ...(showActionsColumn ? [{
            key: 'actions' as const,
            header: (
                <div className="flex flex-col gap-1 min-w-[100px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Actions</span>
                    </div>
                    {/* <div className="h-7 flex items-center">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            ref={input => {
                                if (input) input.indeterminate = someSelected;
                            }}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                    </div> */}
                </div>
            ),
            width: 'w-[100px]',
            sticky: 'right' as const,
            render: (row: Customer) => (
                <div className="flex items-center gap-3">
                    {/* <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedCustomerIds.includes(row.uid)}
                            onChange={(e) => handleSelectRow(row.uid, e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                    </div> */}
                    <div className="flex items-center gap-2">
                        {canView && (
                            <Tooltip content={row.status === 4 ? "Cannot view frozen customer" : "View Details"}>
                                <button
                                    className={`p-2 border rounded-lg transition-colors ${row.status === 4
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40'
                                        }`}
                                    onClick={() => row.status !== 4 && handleViewDetails(row)}
                                    disabled={row.status === 4}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                            </Tooltip>
                        )}
                        {canEdit && row.status !== 3 && (
                            <Tooltip content="Edit Customer">
                                <button
                                    className="p-2 border border-border rounded-lg bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => handleEdit(row)}
                                >
                                    <PencilIcon size={16} />
                                </button>
                            </Tooltip>
                        )}
                        {/* Delete button hidden
                        {canDelete && (
                            <Tooltip content="Delete Customer">
                                <button
                                    className="p-2 border border-red-200 rounded-lg bg-white hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                                    onClick={() => handleDeleteClick(row)}
                                >
                                    <TrashIcon size={16} />
                                </button>
                            </Tooltip>
                        )}
                        */}

                    </div>
                </div>
            ),
        }] : [])
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer accounts</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasSelection && (
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-sm text-muted-foreground">{selectedCustomerIds.length} selected</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkEmailModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <MailIcon size={16} />
                                Send Email
                            </Button>
                        </div>
                    )}
                    {canCreate && (
                        <Button
                            leftIcon={<PlusIcon size={16} />}
                            onClick={() => navigate('/customers/new')}
                        >
                            Add Customer
                        </Button>
                    )}
                </div>
            </div>

            {/* Customers Table */}
            <div className='p-5 bg-background rounded-lg border border-border shadow-sm'>
                <div className="flex flex-col gap-4 mb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        Total Customers: <span className="text-foreground">{pageInfo?.totalCount ?? 0}</span>
                    </p>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredCustomers}
                    loading={loading && allCustomers.length === 0}
                    error={error?.message}
                    rowKey={(row) => row.uid}
                    emptyMessage='No customers found. Click "Add Customer" to create one.'
                    loadingMessage="Loading customers..."
                    /* Fixed height for pagination - adjusted to ensure footer is visible */
                    containerHeightClass="h-[calc(100vh-280px)]"
                    enableSelection={true}
                    selectedRowKeys={selectedCustomerIds}
                    onSelectionChange={setSelectedCustomerIds}
                    onSelectAll={handleSelectAll}
                    isSelectingAll={isSelectingAll}
                    totalFilteredCount={totalFilteredCount}
                    pagination={{
                        currentPage,
                        pageSize: limit,
                        onPageChange: handlePageChange,
                        hasNextPage: !!pageInfo?.hasNextPage,
                        hasPreviousPage: currentPage > 1,
                    }}
                />
            </div>

            <BulkEmailModal
                isOpen={bulkEmailModalOpen}
                onClose={() => setBulkEmailModalOpen(false)}
                selectedCustomerIds={selectedCustomerIds}
                onSuccess={() => {
                    setSelectedCustomerIds([]);
                    // Optional: refresh list if needed, but not strictly required for email sending
                    toast.success("Bulk email process completed");
                }}
            />

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
                            disabled={!customerToDelete || deleteConfirmName !== (customerToDelete.customerId || customerToDelete.uid) || isDeleting}
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
                        Type the Customer ID <span className="font-semibold text-foreground">{customerToDelete ? (customerToDelete.customerId || customerToDelete.uid) : ''}</span> to delete this customer.
                    </p>
                    <Input
                        placeholder="Enter Customer ID"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customerToDelete) {
                                const confirmValue = customerToDelete.customerId || customerToDelete.uid;
                                if (deleteConfirmName === confirmValue) {
                                    handleConfirmDelete();
                                }
                            }
                        }}
                    />
                </div>
            </Modal>

            {/* Customer Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => { setDetailsModalOpen(false); setReminderSent(false); }}
                title={selectedCustomerDetails ? (
                    <>
                        {/* <span className="hidden sm:inline">Customer details · </span> */}
                        <span>{selectedCustomerDetails.firstName} {selectedCustomerDetails.lastName}</span>
                    </>
                ) : 'Customer details'}
                size="full"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => { setDetailsModalOpen(false); setReminderSent(false); }}
                        >
                            Close
                        </Button>
                        {selectedCustomerDetails && (
                            <Button
                                className="bg-neutral-900 text-white hover:bg-neutral-800"
                                onClick={() => {
                                    setDetailsModalOpen(false);
                                    navigate(`/customers/${selectedCustomerDetails.uid}`);
                                }}
                            >
                                Resume
                            </Button>
                        )}
                    </div>
                }
            >
                {isLoadingDetails || freezingCustomer ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <p className="mt-4 text-sm text-muted-foreground">
                            {freezingCustomer ? 'Freezing customer...' : 'Loading customer details...'}
                        </p>
                    </div>
                ) : selectedCustomerDetails ? (
                    <div className="space-y-3">
                        {/* Progress Timeline with Freeze Button */}
                        <div className="bg-muted/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Progress timeline</h3>
                                    <p className="text-xs text-muted-foreground">Track each milestone and when it happened.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedCustomerDetails.status !== 5 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                                            onClick={handleMarkNotInterested}
                                            disabled={markingNotInterested}
                                            isLoading={markingNotInterested}
                                            loadingText="Updating..."
                                        >
                                            Not Interested
                                        </Button>
                                    )}
                                    {selectedCustomerDetails.status === 3 && (
                                        <Button
                                            size="sm"
                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                            onClick={() => handleFreezeClick(selectedCustomerDetails)}
                                            disabled={freezingCustomer}
                                            isLoading={freezingCustomer}
                                            loadingText="Freezing..."
                                        >
                                            Freeze
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="relative flex justify-between items-start">
                                {[
                                    { label: 'Offer sent', date: selectedCustomerDetails.createdAt, completed: true, step: 1 },
                                    { label: 'Signed by customer', date: selectedCustomerDetails.signDate, completed: !!selectedCustomerDetails.signDate, showReminder: selectedCustomerDetails.status < 2, step: 2 },
                                    ...(selectedCustomerDetails.vppDetails?.vpp === 1 ? [
                                        { label: 'VPP connect', date: null, completed: selectedCustomerDetails.vppDetails?.vppConnected === 1, showToggle: true, disabled: selectedCustomerDetails.status < 2, step: 3 },
                                    ] : []),
                                    { label: 'Connected to MSAT', date: null, completed: selectedCustomerDetails.msatDetails?.msatConnected === 1, showToggle: true, disabled: selectedCustomerDetails.vppDetails?.vpp === 1 && selectedCustomerDetails.vppDetails?.vppConnected !== 1, step: 4 },
                                    { label: 'Utilmate Connect', date: null, completed: selectedCustomerDetails.utilmateDetails?.utilmateConnected === 1, showToggle: true, disabled: selectedCustomerDetails.vppDetails?.vpp === 1 && selectedCustomerDetails.msatDetails?.msatConnected !== 1, step: 5 },
                                ].map((item, index, arr) => (
                                    <div key={index} className="relative flex flex-col items-center" style={{ width: `${100 / arr.length}%` }}>
                                        {index > 0 && (
                                            <div className={`absolute top-[18px] h-0.5 ${item.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ right: '50%', left: '-50%' }} />
                                        )}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-background border-2 z-10 ${item.completed ? 'border-green-500 text-green-500' : 'border-gray-200 dark:border-gray-600 text-gray-400'}`}>
                                            {item.completed ? <CheckIcon size={16} strokeWidth={3} /> : index + 1}
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 justify-center z-30 relative">
                                            <span className={`text-xs font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                                            {item.step === 4 && (
                                                <Tooltip
                                                    position="bottom"
                                                    className="whitespace-normal min-w-[220px] p-0 overflow-hidden bg-white dark:bg-neutral-900 border border-border shadow-xl text-foreground"
                                                    content={
                                                        <div className="flex flex-col text-xs">
                                                            <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                                </div>
                                                                <span className="font-semibold">MSAT Details</span>
                                                            </div>
                                                            <div className="p-2 space-y-1">
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Status:</span>
                                                                    <span className={selectedCustomerDetails.msatDetails?.msatConnected === 1 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                                                        {selectedCustomerDetails.msatDetails?.msatConnected === 1 ? 'Connected' : 'Not Connected'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Connected:</span>
                                                                    <span>{selectedCustomerDetails.msatDetails?.msatConnectedAt ? formatSydneyTime(selectedCustomerDetails.msatDetails.msatConnectedAt) : '—'}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Updated:</span>
                                                                    <span>{selectedCustomerDetails.msatDetails?.msatUpdatedAt ? formatSydneyTime(selectedCustomerDetails.msatDetails.msatUpdatedAt) : '—'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className="cursor-help text-muted-foreground hover:text-foreground transition-colors p-1">
                                                        <InfoIcon size={14} />
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </div>
                                        {item.date && <span className="text-[10px] text-muted-foreground">{formatSydneyTime(item.date)}</span>}
                                        {item.showReminder && (
                                            <button
                                                onClick={() => handleSendReminder(selectedCustomerDetails.uid)}
                                                disabled={sendingReminder || reminderSent}
                                                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg mt-1 relative z-30 ${reminderSent ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'} ${sendingReminder ? 'opacity-70' : ''}`}
                                            >
                                                {sendingReminder ? (
                                                    <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                                                ) : reminderSent ? (
                                                    <><CheckIcon size={10} />Sent</>
                                                ) : (
                                                    <><MailIcon size={10} />Send reminder</>
                                                )}
                                            </button>
                                        )}


                                        {item.showToggle && (
                                            <div className="mt-1 relative z-30">
                                                <ConfirmationPopover
                                                    title="Disconnect?"
                                                    description="Are you sure you want to disconnect this service?"
                                                    enabled={item.completed}
                                                    onConfirm={() => {
                                                        if (item.step === 3) {
                                                            handleVppToggle(selectedCustomerDetails.uid, false);
                                                        } else if (item.step === 4) {
                                                            handleMsatToggle(selectedCustomerDetails.uid, false);
                                                        } else if (item.step === 5) {
                                                            handleUtilmateToggle(selectedCustomerDetails.uid, false);
                                                        }
                                                    }}
                                                >
                                                    <ToggleSwitch
                                                        checked={item.completed}
                                                        disabled={item.disabled}
                                                        onChange={(val) => {
                                                            // Only handle turning ON here. Turning OFF is handled by onConfirm.
                                                            if (val) {
                                                                if (item.step === 3) {
                                                                    handleVppToggle(selectedCustomerDetails.uid, true);
                                                                } else if (item.step === 4) {
                                                                    handleMsatToggle(selectedCustomerDetails.uid, true);
                                                                } else if (item.step === 5) {
                                                                    handleUtilmateToggle(selectedCustomerDetails.uid, true);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </ConfirmationPopover>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Master-Detail Layout */}
                        <div className="flex flex-col lg:flex-row gap-6 items-start min-h-[500px]">
                            {/* Navigation Sidebar */}
                            <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:space-y-1 pb-2 lg:pb-0">
                                {[
                                    {
                                        id: 'info',
                                        label: 'Customer Info',
                                        mobileLabel: 'Info',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'location',
                                        label: 'Location & Meter',
                                        mobileLabel: 'Location',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'location' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'account',
                                        label: 'Account Settings',
                                        mobileLabel: 'Account',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'account' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                        )
                                    },
                                    ...(selectedCustomerDetails.ratePlan ? [{
                                        id: 'rates',
                                        label: 'Rate Plan',
                                        mobileLabel: 'Rates',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'rates' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                            </div>
                                        ),
                                        badge: <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200/50 dark:border-amber-800/50 truncate max-w-[80px] hidden lg:block">{selectedCustomerDetails.tariffCode || selectedCustomerDetails.ratePlan.tariff || 'View'}</span>
                                    }] : []),

                                    ...(selectedCustomerDetails.solarDetails?.hassolar === 1 ? [{
                                        id: 'solar',
                                        label: 'Solar System',
                                        mobileLabel: 'Solar',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'solar' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                            </div>
                                        ),
                                        badge: <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-full hidden lg:block">Has Solar</span>
                                    }] : []),
                                    ...(selectedCustomerDetails.debitDetails?.optIn === 1 ? [{
                                        id: 'debit',
                                        label: 'Debit Details',
                                        mobileLabel: 'Debit',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'debit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            </div>
                                        ),
                                        badge: <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full hidden lg:block">Active</span>
                                    }] : []),
                                    ...(selectedCustomerDetails.vppDetails?.vpp === 1 ? [{
                                        id: 'vpp',
                                        label: 'VPP Participant',
                                        mobileLabel: 'VPP',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'vpp' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <ZapIcon className="w-4 h-4" />
                                            </div>
                                        ),
                                        badge: <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full hidden lg:block">Active</span>
                                    }] : []),
                                    ...(selectedCustomerDetails.utilmateDetails?.utilmateConnected === 1 ? [{
                                        id: 'utilmate',
                                        label: 'Utilmate Details',
                                        mobileLabel: 'Utilmate',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'utilmate' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <PlugIcon className="w-4 h-4" />
                                            </div>
                                        ),
                                    }] : []),
                                    {
                                        id: 'electricity_bills',
                                        label: 'Electricity Bills',
                                        mobileLabel: 'Bills',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'electricity_bills' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <ZapIcon className="w-4 h-4" />
                                            </div>
                                        ),
                                        badge: (selectedCustomerDetails.documents?.some(d => d.type === '2')) ? (
                                            <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-full hidden lg:block">
                                                {selectedCustomerDetails.documents?.filter(d => d.type === '2').length}
                                            </span>
                                        ) : undefined
                                    },
                                    {
                                        id: 'documents',
                                        label: 'Documents',
                                        mobileLabel: 'Docs',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'documents' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <IdCardIcon className="w-4 h-4" />
                                            </div>
                                        ),
                                        badge: (selectedCustomerDetails.previousBill?.path || selectedCustomerDetails.identityProof?.path) ? (
                                            <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-full hidden lg:block">
                                                Active
                                            </span>
                                        ) : undefined
                                    },
                                    {
                                        id: 'notes',
                                        label: 'Notes',
                                        mobileLabel: 'Notes',
                                        icon: (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDetailSection === 'notes' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                            </div>
                                        ),
                                    }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedDetailSection(item.id as 'info' | 'location' | 'account' | 'rates' | 'solar' | 'debit' | 'vpp' | 'utilmate' | 'notes' | 'documents' | 'electricity_bills')}
                                        className={`flex-1 flex flex-col lg:flex-row items-center lg:w-full gap-1 lg:gap-3 p-2 rounded-xl text-sm font-medium transition-all ${selectedDetailSection === item.id
                                            ? 'bg-card shadow-sm border border-border text-foreground ring-1 ring-primary/5'
                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                            } justify-center lg:justify-start`}
                                        title={item.label}
                                    >
                                        {item.icon}
                                        <span className="lg:hidden text-[10px]">{item.mobileLabel}</span>
                                        <span className="hidden lg:block">{item.label}</span>
                                        {item.badge}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="w-full flex-1 bg-card rounded-xl border border-border p-4 shadow-sm min-h-[400px] flex flex-col">
                                {selectedDetailSection === 'electricity_bills' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-foreground tracking-tight">Electricity Bills</h3>
                                                <p className="text-[10px] text-muted-foreground">Manage electricity bill documents</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                onClick={() => setIsAddingDocument(true)}
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1" />
                                                Add Bill
                                            </Button>
                                        </div>

                                        {/* Hidden file input for bill upload */}
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                            className="hidden"
                                            ref={newDocumentInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadDocument('electricity_bill', file, billStartDate, billEndDate);
                                                e.target.value = '';
                                            }}
                                        />

                                        <Modal
                                            isOpen={isAddingDocument}
                                            onClose={() => setIsAddingDocument(false)}
                                            title="Upload Electricity Bill"
                                            size="md"
                                        >
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={billStartDate}
                                                            onChange={(e) => setBillStartDate(e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={billEndDate}
                                                            onChange={(e) => setBillEndDate(e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsAddingDocument(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                        disabled={isUploadingDocument !== null}
                                                        onClick={() => newDocumentInputRef.current?.click()}
                                                        isLoading={isUploadingDocument === 'electricity_bill'}
                                                    >
                                                        <UploadIcon className="w-4 h-4 mr-2" />
                                                        Select File & Upload
                                                    </Button>
                                                </div>
                                            </div>
                                        </Modal>

                                        <div className="overflow-hidden rounded-xl border border-border bg-background">
                                            <div className="overflow-auto max-h-[300px]">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-muted/50 border-b border-border">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Document Name</th>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Start Date</th>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">End Date</th>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Uploaded By</th>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Uploaded At</th>
                                                            <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {(selectedCustomerDetails.documents?.filter(d => d.type === '2') || []).length > 0 ? (
                                                            selectedCustomerDetails.documents?.filter(d => d.type === '2').map((doc, idx) => (
                                                                <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 rounded flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
                                                                                <ZapIcon className="w-4 h-4" />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium text-foreground">{doc.name || 'Electricity Bill'}</span>
                                                                                <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={doc.filename}>{doc.filename}</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                                        {(doc as any).startDate ? formatSydneyTime((doc as any).startDate, 'DD/MM/YYYY') : <span className="text-muted-foreground italic">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                                        {(doc as any).endDate ? formatSydneyTime((doc as any).endDate, 'DD/MM/YYYY') : <span className="text-muted-foreground italic">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground">
                                                                        <span className="text-foreground font-medium">{(doc as any).createdByUser?.name || (doc as any).createdBy || 'System'}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                                        {doc.createdAt ? formatSydneyTime(doc.createdAt) : <span className="text-muted-foreground italic">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 px-3 text-xs font-medium border-border hover:bg-muted transition-colors"
                                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/documents/${encodeURIComponent(doc.path!).replace(/%2F/g, '/')}`, '_blank')}
                                                                            >
                                                                                <EyeIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                View
                                                                            </Button>
                                                                            <ConfirmationPopover
                                                                                title="Delete Bill"
                                                                                description="Are you sure you want to delete this bill? This action cannot be undone."
                                                                                confirmText="Delete"
                                                                                onConfirm={() => handleDeleteDocument(doc.path!)}
                                                                                confirmVariant="destructive"
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 px-3 text-xs font-medium border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                                                                                    disabled={isDeletingDocument === doc.path}
                                                                                    isLoading={isDeletingDocument === doc.path}
                                                                                    loadingText="Deleting..."
                                                                                >
                                                                                    <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Delete
                                                                                </Button>
                                                                            </ConfirmationPopover>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                                                                    No electricity bills uploaded yet.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedDetailSection === 'documents' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-foreground tracking-tight">Documents</h3>
                                                <p className="text-[10px] text-muted-foreground">Manage customer documents</p>
                                            </div>
                                            {!isAddingDocument && (
                                                <Button
                                                    size="sm"
                                                    className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                    onClick={() => setIsAddingDocument(true)}
                                                >
                                                    <PlusIcon className="w-4 h-4 mr-1" />
                                                    Add Document
                                                </Button>
                                            )}
                                        </div>

                                        {/* Hidden file inputs for upload */}
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                            className="hidden"
                                            ref={previousBillInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadDocument('previousBill', file);
                                                e.target.value = '';
                                            }}
                                        />
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                            className="hidden"
                                            ref={identityProofInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadDocument('identityProof', file);
                                                e.target.value = '';
                                            }}
                                        />
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                                            className="hidden"
                                            ref={newDocumentInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file && newDocumentType) handleUploadDocument(newDocumentType, file);
                                                e.target.value = '';
                                            }}
                                        />

                                        {isAddingDocument && (
                                            <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-end gap-3">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Document Type</label>
                                                        <Select
                                                            options={DOCUMENT_TYPE_OPTIONS}
                                                            value={newDocumentType}
                                                            onChange={(val) => setNewDocumentType(val as string)}
                                                            placeholder="Select Type..."
                                                            className="w-full bg-background"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsAddingDocument(false);
                                                                setNewDocumentType('');
                                                            }}
                                                            className="border-input hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                            disabled={!newDocumentType || isUploadingDocument !== null}
                                                            onClick={() => newDocumentInputRef.current?.click()}
                                                            isLoading={isUploadingDocument !== null && isUploadingDocument === newDocumentType}
                                                        >
                                                            <UploadIcon className="w-4 h-4 mr-2" />
                                                            Select File & Upload
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-hidden rounded-xl border border-border bg-background">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-muted/50 border-b border-border">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Document Type</th>
                                                        <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Uploaded By</th>
                                                        <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Uploaded At</th>
                                                        <th className="px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {[
                                                        {
                                                            doc: selectedCustomerDetails.previousBill,
                                                            label: 'Previous Bill',
                                                            type: 'previousBill'
                                                        },
                                                        {
                                                            doc: selectedCustomerDetails.identityProof,
                                                            label: 'Identity Proof',
                                                            type: 'identityProof'
                                                        },
                                                        ...(selectedCustomerDetails.documents?.filter(d =>
                                                            d.uid !== selectedCustomerDetails.previousBill?.uid &&
                                                            d.uid !== selectedCustomerDetails.identityProof?.uid &&
                                                            d.type !== '2' // Exclude electricity bills
                                                        ).map(d => {
                                                            const option = DOCUMENT_TYPE_OPTIONS.find(o => o.value === d.type);
                                                            // If type is generic '0' or mismatched, prioritize the saved name
                                                            const label = (d.type === '0' || !option) && d.name ? d.name : (option ? option.label : d.type || 'Document');

                                                            return {
                                                                doc: d,
                                                                label: label,
                                                                type: d.type || 'other'
                                                            };
                                                        }) || [])
                                                    ].map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded flex items-center justify-center",
                                                                        item.doc?.path ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                                    )}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-foreground">{item.label}</span>
                                                                        {item.doc?.filename && (
                                                                            <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={item.doc.filename}>
                                                                                {item.doc.filename}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-muted-foreground">
                                                                {item.doc?.path ? (
                                                                    <span className="text-foreground font-medium">
                                                                        {(item.doc as any).createdByUser?.name || (item.doc as any).createdBy || 'System'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground italic">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                                {item.doc?.path && (item.doc as any).createdAt
                                                                    ? formatSydneyTime((item.doc as any).createdAt)
                                                                    : <span className="text-muted-foreground italic">—</span>
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {item.doc?.path ? (
                                                                        <>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 px-3 text-xs font-medium border-border hover:bg-muted transition-colors"
                                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/documents/${encodeURIComponent(item.doc!.path!).replace(/%2F/g, '/')}`, '_blank')}
                                                                            >
                                                                                <EyeIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                View
                                                                            </Button>
                                                                            <ConfirmationPopover
                                                                                title="Delete Document"
                                                                                description={`Are you sure you want to delete this ${item.label}? This action cannot be undone.`}
                                                                                confirmText="Delete"
                                                                                onConfirm={() => handleDeleteDocument(item.doc!.path!)}
                                                                                confirmVariant="destructive"
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 px-3 text-xs font-medium border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                                                                                    disabled={isDeletingDocument === item.doc!.path}
                                                                                    isLoading={isDeletingDocument === item.doc!.path}
                                                                                    loadingText="Deleting..."
                                                                                >
                                                                                    <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                    Delete
                                                                                </Button>
                                                                            </ConfirmationPopover>
                                                                        </>
                                                                    ) : (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 px-3 text-xs font-medium border-primary/50 text-primary hover:bg-primary/10"
                                                                            // Only allow upload for mapped types if it is specifically previousBill or identityProof
                                                                            onClick={() => {
                                                                                if (item.type === 'previousBill') previousBillInputRef.current?.click();
                                                                                else if (item.type === 'identityProof') identityProofInputRef.current?.click();
                                                                            }}
                                                                            disabled={isUploadingDocument === item.type}
                                                                            isLoading={isUploadingDocument === item.type}
                                                                            loadingText="Uploading..."
                                                                        >
                                                                            <UploadIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                            Upload
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                )}
                                {selectedDetailSection === 'info' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <h3 className="text-lg font-semibold text-foreground tracking-tight">Customer Info</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {[
                                                { label: 'Customer Id', value: selectedCustomerDetails.customerId },
                                                { label: 'Business', value: selectedCustomerDetails.businessName },
                                                { label: 'ABN', value: selectedCustomerDetails.abn },
                                                { label: 'Email', value: selectedCustomerDetails.email, fullWidth: true },
                                                { label: 'Mobile', value: selectedCustomerDetails.number },
                                                { label: 'DOB', value: selectedCustomerDetails.dob ? formatSydneyTime(selectedCustomerDetails.dob, 'DD/MM/YYYY') : null },
                                                { label: 'ID Type', value: ID_TYPE_MAP[selectedCustomerDetails.enrollmentDetails?.idtype ?? -1] },
                                                { label: 'ID Number', value: selectedCustomerDetails.enrollmentDetails?.idnumber },
                                                { label: 'ID State', value: selectedCustomerDetails.enrollmentDetails?.idstate },
                                                { label: 'ID Expiry', value: selectedCustomerDetails.enrollmentDetails?.idexpiry ? formatSydneyTime(selectedCustomerDetails.enrollmentDetails.idexpiry, 'DD/MM/YYYY') : null },
                                            ].map((item, i) => (
                                                <div key={i} className={`flex flex-col space-y-0.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 ${item.fullWidth ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''}`}>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                    <span className="text-sm font-medium text-foreground break-words">{item.value || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDetailSection === 'location' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <h3 className="text-lg font-semibold text-foreground tracking-tight">Location & Meter</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="flex flex-col space-y-0.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 col-span-1 sm:col-span-2">
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Address</span>
                                                <span className="text-sm font-medium text-foreground break-words">{selectedCustomerDetails.address?.fullAddress || [selectedCustomerDetails.address?.streetNumber, selectedCustomerDetails.address?.streetName, selectedCustomerDetails.address?.suburb].filter(Boolean).join(' ') || '—'}</span>
                                            </div>
                                            {[
                                                { label: 'State', value: selectedCustomerDetails.address?.state },
                                                { label: 'Postcode', value: selectedCustomerDetails.address?.postcode },
                                                { label: 'NMI', value: selectedCustomerDetails.address?.nmi },
                                                { label: 'Tariff Code', value: selectedCustomerDetails.tariffCode },
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col space-y-0.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                    <span className="text-sm font-medium text-foreground">{item.value || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDetailSection === 'account' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <h3 className="text-lg font-semibold text-foreground tracking-tight">Account Settings</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {[
                                                { label: 'Sale Type', value: SALE_TYPE_LABELS[selectedCustomerDetails.enrollmentDetails?.saletype ?? 0] || 'Direct' },
                                                { label: 'Billing Preference', value: BILLING_PREF_LABELS[selectedCustomerDetails.enrollmentDetails?.billingpreference ?? 0] || 'eBill' },
                                                { label: 'Discount', value: selectedCustomerDetails.discount ? `${selectedCustomerDetails.discount}%` : '-' },
                                                { label: 'Rate Version', value: selectedCustomerDetails.rateVersion ? <RateVersionTooltip version={String(selectedCustomerDetails.rateVersion)}>{selectedCustomerDetails.rateVersion}</RateVersionTooltip> : '—' },
                                                { label: 'Connection Date', value: selectedCustomerDetails.enrollmentDetails?.connectiondate ? formatSydneyTime(selectedCustomerDetails.enrollmentDetails.connectiondate, 'DD/MM/YYYY') : null },
                                                { label: 'Concession', value: selectedCustomerDetails.enrollmentDetails?.concession === 1 ? 'Yes' : 'No' },
                                                { label: 'Life Support', value: selectedCustomerDetails.enrollmentDetails?.lifesupport === 1 ? 'Yes' : 'No' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col space-y-0.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                    <span className="text-sm font-medium text-foreground">{item.value || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDetailSection === 'rates' && selectedCustomerDetails.ratePlan && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                                            <h3 className="text-lg font-semibold text-foreground">Rate Plan Details</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg">DNSP: {DNSP_LABELS[selectedCustomerDetails.ratePlan.dnsp ?? -1] || 'Unknown'}</span>
                                                {selectedCustomerDetails.rateVersion && (
                                                    <div className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg flex items-center gap-1">
                                                        <span>Ver:</span>
                                                        <RateVersionTooltip version={String(selectedCustomerDetails.rateVersion)}>
                                                            <span className="underline decoration-dotted decoration-blue-700/50 dark:decoration-blue-400/50">{selectedCustomerDetails.rateVersion}</span>
                                                        </RateVersionTooltip>
                                                    </div>
                                                )}
                                                {selectedCustomerDetails.vppDetails?.vpp === 1 && <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg">VPP Active</span>}
                                            </div>
                                        </div>

                                        {selectedCustomerDetails.ratePlan.offers && selectedCustomerDetails.ratePlan.offers.length > 0 ? (
                                            <div className="space-y-6">
                                                {selectedCustomerDetails.ratePlan.offers.map((offer, idx) => {
                                                    const discount = selectedCustomerDetails.discount ?? 0;
                                                    const hasCL = (offer.cl1Usage || 0) > 0 || (offer.cl2Usage || 0) > 0;
                                                    const hasFiT = (offer.fit || 0) > 0 || (offer.fitPeak || 0) > 0 || (offer.fitCritical || 0) > 0 || (offer.fitVpp || 0) > 0;

                                                    return (
                                                        <div key={offer.uid || idx} className="space-y-4">
                                                            <div className="flex flex-wrap gap-8">
                                                                {/* Column 1: Energy Rates */}
                                                                <div className="space-y-4 min-w-[180px] flex-1">
                                                                    <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                                                                        <Settings2Icon size={16} />
                                                                        <h4 className="text-sm font-bold uppercase tracking-wide">Energy Rates</h4>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {(offer.peak ?? 0) > 0 && (
                                                                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                <div className="text-blue-600 dark:text-blue-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.peak ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Peak</div>
                                                                            </div>
                                                                        )}
                                                                        {(offer.offPeak ?? 0) > 0 && (
                                                                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                <div className="text-blue-600 dark:text-blue-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.offPeak ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Off-Peak</div>
                                                                            </div>
                                                                        )}
                                                                        {(offer.shoulder ?? 0) > 0 && (
                                                                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                <div className="text-blue-600 dark:text-blue-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.shoulder ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider opacity-80">Shoulder</div>
                                                                            </div>
                                                                        )}
                                                                        {(offer.anytime ?? 0) > 0 && (
                                                                            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                <div className="text-orange-600 dark:text-orange-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.anytime ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider opacity-80">Anytime</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Column 2: Supply Charges */}
                                                                <div className="space-y-4 min-w-[180px] flex-1">
                                                                    <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                                                                        <PlugIcon size={16} />
                                                                        <h4 className="text-sm font-bold uppercase tracking-wide">Supply Charges</h4>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-purple-600 dark:text-purple-400 font-bold text-base tracking-tight">${(offer.supplyCharge ?? 0).toFixed(4)}/day</div>
                                                                            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider opacity-80">Supply</div>
                                                                        </div>
                                                                        {(offer.vppOrcharge ?? 0) > 0 && (
                                                                            <>
                                                                                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mt-4">
                                                                                    <ActivityIcon size={16} />
                                                                                    <h4 className="text-sm font-bold uppercase tracking-wide">VPP Charges</h4>
                                                                                </div>
                                                                                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-amber-600 dark:text-amber-400 font-bold text-base tracking-tight">${(offer.vppOrcharge ?? 0).toFixed(4)}/day</div>
                                                                                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider opacity-80">Orchestration</div>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Column 3: Solar FiT */}
                                                                {hasFiT && (
                                                                    <div className="space-y-4 min-w-[180px] flex-1">
                                                                        <div className="flex items-center gap-2 text-teal-500 dark:text-teal-400">
                                                                            <ZapIcon size={16} />
                                                                            <h4 className="text-sm font-bold uppercase tracking-wide">Solar FiT</h4>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {(offer.fit ?? 0) > 0 && (
                                                                                <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fit ?? 0).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">Feed-in</div>
                                                                                </div>
                                                                            )}
                                                                            {(offer.fitPeak ?? 0) > 0 && (
                                                                                <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fitPeak ?? 0).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">PREMIUM FIT</div>
                                                                                </div>
                                                                            )}
                                                                            {(offer.fitCritical ?? 0) > 0 && (
                                                                                <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fitCritical ?? 0).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">CRITICAL EVENT FIT</div>
                                                                                </div>
                                                                            )}
                                                                            {(offer.fitVpp ?? 0) > 0 && (
                                                                                <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fitVpp ?? 0).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">BASE FIT</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Column 4: Controlled Load */}
                                                                {hasCL && (
                                                                    <div className="space-y-4 min-w-[180px] flex-1">
                                                                        <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                                                                            <PlugIcon size={16} />
                                                                            <h4 className="text-sm font-bold uppercase tracking-wide">Controlled Load</h4>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {(offer.cl1Usage ?? 0) > 0 && (
                                                                                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-green-600 dark:text-green-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.cl1Usage ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider opacity-80">CL1 Usage</div>
                                                                                </div>
                                                                            )}
                                                                            {(offer.cl2Usage ?? 0) > 0 && (
                                                                                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center space-y-0.5">
                                                                                    <div className="text-green-600 dark:text-green-400 font-bold text-base tracking-tight">${calculateDiscountedRate(offer.cl2Usage ?? 0, discount).toFixed(4)}/kWh</div>
                                                                                    <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider opacity-80">CL2 Usage</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-8">No rate offers available.</p>
                                        )}
                                    </div>
                                )}



                                {selectedDetailSection === 'solar' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <h3 className="text-xl font-semibold text-foreground tracking-tight">Solar System</h3>
                                            <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800">
                                                System Installed
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: 'Has Solar', value: 'Yes' },
                                                { label: 'Solar Capacity', value: selectedCustomerDetails.solarDetails?.solarcapacity ? `${selectedCustomerDetails.solarDetails.solarcapacity} kW` : '—' },
                                                { label: 'Inverter Capacity', value: selectedCustomerDetails.solarDetails?.invertercapacity ? `${selectedCustomerDetails.solarDetails.invertercapacity} kW` : '—' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDetailSection === 'vpp' && selectedCustomerDetails.vppDetails?.vpp === 1 && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <h3 className="text-xl font-semibold text-foreground tracking-tight">VPP Participation</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedCustomerDetails.vppDetails?.vpp === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                                <ConfirmationPopover
                                                    title="Deactivate VPP?"
                                                    description="Are you sure you want to deactivate VPP participation? This will also disconnect VPP services."
                                                    enabled={selectedCustomerDetails.vppDetails?.vpp === 1}
                                                    onConfirm={async () => {
                                                        try {
                                                            await updateCustomer({
                                                                variables: {
                                                                    uid: selectedCustomerDetails.uid,
                                                                    input: { vppDetails: { vpp: 0, vppConnected: 0 } }
                                                                }
                                                            });
                                                            toast.success('VPP deactivated');
                                                            setSelectedCustomerDetails({
                                                                ...selectedCustomerDetails,
                                                                vppDetails: { ...selectedCustomerDetails.vppDetails, vpp: 0, vppConnected: 0 }
                                                            });
                                                            setIsEditingVpp(false);
                                                        } catch (err: any) {
                                                            toast.error('Failed to deactivate VPP');
                                                        }
                                                    }}
                                                >
                                                    <ToggleSwitch
                                                        checked={selectedCustomerDetails.vppDetails?.vpp === 1}
                                                        onChange={(checked) => {
                                                            if (checked) {
                                                                setVppForm({
                                                                    vppSignupBonus: '600',
                                                                    batteryBrand: '',
                                                                    snNumber: '',
                                                                    batteryCapacity: '',
                                                                    exportLimit: '',
                                                                    inverterCapacity: '',
                                                                    checkCode: ''
                                                                });
                                                                setIsEditingVpp(true);
                                                                // Optimistically set VPP to 1 to show the form, but don't save yet
                                                                setSelectedCustomerDetails({
                                                                    ...selectedCustomerDetails,
                                                                    vppDetails: { ...selectedCustomerDetails.vppDetails, vpp: 1 }
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </ConfirmationPopover>
                                            </div>
                                        </div>

                                        {(selectedCustomerDetails.vppDetails?.vpp === 1 || isEditingVpp) && (
                                            <div className="space-y-6">
                                                {/* {!isEditingVpp && (
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setVppForm({
                                                                    vppSignupBonus: selectedCustomerDetails.vppDetails?.vppSignupBonus?.toString() || '',
                                                                    batteryBrand: selectedCustomerDetails.batteryDetails?.batterybrand || '',
                                                                    snNumber: selectedCustomerDetails.batteryDetails?.snnumber || '',
                                                                    batteryCapacity: selectedCustomerDetails.batteryDetails?.batterycapacity?.toString() || '',
                                                                    exportLimit: selectedCustomerDetails.batteryDetails?.exportlimit?.toString() || ''
                                                                });
                                                                setIsEditingVpp(true);
                                                            }}
                                                        >
                                                            <PencilIcon className="w-4 h-4 mr-2" />
                                                            Edit Details
                                                        </Button>
                                                    </div>
                                                )} */}

                                                {isEditingVpp ? (
                                                    <div className="bg-muted/30 rounded-xl border border-dashed border-border p-6 space-y-6">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background rounded-lg border border-border">
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground uppercase tracking-tight">VPP signup bonus</div>
                                                                <div className="text-[10px] text-muted-foreground">Eligible customers receive a $50 monthly bill credit for 12 months.</div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setVppForm({ ...vppForm, vppSignupBonus: vppForm.vppSignupBonus === '600' ? '' : '600' })}
                                                                className={cn(
                                                                    "transition-colors",
                                                                    vppForm.vppSignupBonus === '600'
                                                                        ? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
                                                                        : "border-input hover:bg-accent hover:text-accent-foreground"
                                                                )}
                                                            >
                                                                {vppForm.vppSignupBonus === '600' ? 'Bonus Applied' : 'Add $600 Bonus'}
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Battery Brand</label>
                                                                <Select
                                                                    options={BATTERY_BRAND_OPTIONS}
                                                                    value={vppForm.batteryBrand}
                                                                    onChange={(val) => setVppForm({ ...vppForm, batteryBrand: val as string })}
                                                                    placeholder="Select Brand..."
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-semibold uppercase text-muted-foreground">SN Number</label>
                                                                <Input
                                                                    value={vppForm.snNumber}
                                                                    onChange={(e) => setVppForm({ ...vppForm, snNumber: e.target.value })}
                                                                    placeholder="SN..."
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Capacity (kW)</label>
                                                                <Input
                                                                    type="number"
                                                                    value={vppForm.batteryCapacity}
                                                                    onChange={(e) => setVppForm({ ...vppForm, batteryCapacity: e.target.value })}
                                                                    placeholder="13.5"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Export Limit (kW)</label>
                                                                <Input
                                                                    type="number"
                                                                    value={vppForm.exportLimit}
                                                                    onChange={(e) => setVppForm({ ...vppForm, exportLimit: e.target.value })}
                                                                    placeholder="5.0"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setIsEditingVpp(false);
                                                                    if (selectedCustomerDetails.vppDetails?.vpp !== 1) {
                                                                        setSelectedCustomerDetails({
                                                                            ...selectedCustomerDetails,
                                                                            vppDetails: { ...selectedCustomerDetails.vppDetails, vpp: 0 }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                                onClick={handleSaveVppDetails}
                                                            >
                                                                Save Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {[
                                                            { label: 'VPP Connected', value: selectedCustomerDetails.vppDetails?.vppConnected === 1 ? 'Yes' : 'No' },
                                                            { label: 'Signup Bonus', value: selectedCustomerDetails.vppDetails?.vppSignupBonus ? '$50 monthly bill credit for 12 months (total $600)' : 'None', fullWidth: true },
                                                            { label: 'Battery Brand', value: selectedCustomerDetails.batteryDetails?.batterybrand },
                                                            { label: 'SN Number', value: selectedCustomerDetails.batteryDetails?.snnumber },
                                                            { label: 'Battery Capacity', value: selectedCustomerDetails.batteryDetails?.batterycapacity ? `${selectedCustomerDetails.batteryDetails.batterycapacity} kW` : null },
                                                            { label: 'Export Limit', value: selectedCustomerDetails.batteryDetails?.exportlimit ? `${selectedCustomerDetails.batteryDetails.exportlimit} kW` : null },
                                                            { label: 'Inverter Capacity', value: selectedCustomerDetails.batteryDetails?.inverterCapacity ? `${selectedCustomerDetails.batteryDetails.inverterCapacity} kW` : null },
                                                            { label: 'Check Code', value: selectedCustomerDetails.batteryDetails?.checkCode },
                                                        ].map((item, i) => (
                                                            <div key={i} className={`flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 ${(item as any).fullWidth ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''}`}>
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                                <span className="text-sm font-medium text-foreground">{item.value || '—'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedDetailSection === 'debit' && selectedCustomerDetails.debitDetails && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <h3 className="text-xl font-semibold text-foreground tracking-tight">Direct Debit</h3>
                                            <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                Active
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {[
                                                { label: 'Account Name', value: selectedCustomerDetails.debitDetails.accountType === 0 ? selectedCustomerDetails.debitDetails.companyName : `${selectedCustomerDetails.debitDetails.firstName} ${selectedCustomerDetails.debitDetails.lastName}`, fullWidth: true },
                                                { label: 'Type', value: selectedCustomerDetails.debitDetails.accountType === 0 ? 'Business' : 'Personal' },
                                                ...(selectedCustomerDetails.debitDetails.accountType === 0 ? [{ label: 'ABN', value: selectedCustomerDetails.debitDetails.abn }] : []),
                                                { label: 'Bank Name', value: selectedCustomerDetails.debitDetails.bankName },
                                                { label: 'BSB', value: selectedCustomerDetails.debitDetails.bsb },
                                                { label: 'Account Number', value: selectedCustomerDetails.debitDetails.accountNumber },
                                                {
                                                    label: 'Payment Frequency',
                                                    value: selectedCustomerDetails.debitDetails.paymentFrequency === 0 ? 'Monthly' :
                                                        selectedCustomerDetails.debitDetails.paymentFrequency === 1 ? 'Fortnightly' : 'Weekly'
                                                },
                                                { label: 'Start Date', value: selectedCustomerDetails.debitDetails.firstDebitDate ? formatSydneyTime(selectedCustomerDetails.debitDetails.firstDebitDate, 'DD/MM/YYYY') : '—' },
                                            ].map((item, i) => (
                                                <div key={i} className={`flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 ${item.fullWidth ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''}`}>
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                    <span className="text-sm font-medium text-foreground break-words">{item.value || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedDetailSection === 'utilmate' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-foreground tracking-tight">Utilmate Details</h3>
                                                <p className="text-[10px] text-muted-foreground">Manage connection status and identifiers.</p>
                                            </div>

                                        </div>

                                        {isEditingUtilmate ? (
                                            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-6 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Site Identifier</label>
                                                        <Input
                                                            value={utilmateForm.siteIdentifier}
                                                            onChange={(e) => {
                                                                setUtilmateForm({ ...utilmateForm, siteIdentifier: e.target.value });
                                                                setIsEditingUtilmate(true);
                                                            }}
                                                            placeholder="Site ID..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Account Number</label>
                                                        <Input
                                                            value={utilmateForm.accountNumber}
                                                            onChange={(e) => {
                                                                setUtilmateForm({ ...utilmateForm, accountNumber: e.target.value });
                                                                setIsEditingUtilmate(true);
                                                            }}
                                                            placeholder="Account #..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setIsEditingUtilmate(false);
                                                            setUtilmateForm({
                                                                siteIdentifier: selectedCustomerDetails.utilmateDetails?.siteIdentifier || '',
                                                                accountNumber: selectedCustomerDetails.utilmateDetails?.accountNumber || '',
                                                                utilmateConnected: selectedCustomerDetails.utilmateDetails?.utilmateConnected || 0,
                                                                utilmateConnectedAt: selectedCustomerDetails.utilmateDetails?.utilmateConnectedAt || ''
                                                            });
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                        onClick={handleSaveUtilmateDetails}
                                                    >
                                                        Save Details
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <div
                                                    className="flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 cursor-pointer"
                                                    onClick={() => setIsEditingUtilmate(true)}
                                                >
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Site Identifier</span>
                                                    <span className="text-sm font-medium text-foreground">{selectedCustomerDetails.utilmateDetails?.siteIdentifier || '—'}</span>
                                                </div>
                                                <div
                                                    className="flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 cursor-pointer"
                                                    onClick={() => setIsEditingUtilmate(true)}
                                                >
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Number</span>
                                                    <span className="text-sm font-medium text-foreground">{selectedCustomerDetails.utilmateDetails?.accountNumber || '—'}</span>
                                                </div>
                                                <div className="flex flex-col space-y-1 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Connected At</span>
                                                    <span className="text-sm font-medium text-foreground">{selectedCustomerDetails.utilmateDetails?.utilmateConnectedAt ? formatSydneyTime(selectedCustomerDetails.utilmateDetails.utilmateConnectedAt) : '—'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedDetailSection === 'notes' && (
                                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col h-full">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground tracking-tight">Notes</h3>
                                                <p className="text-[10px] text-muted-foreground">Internal notes about this customer</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-neutral-900 text-white hover:bg-neutral-800"
                                                onClick={() => setNoteModalOpen(true)}
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1" />
                                                Add Note
                                            </Button>
                                        </div>

                                        {/* Notes List */}
                                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px]">
                                            {notesLoading ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                                                </div>
                                            ) : notesData?.customerNotes?.length > 0 ? (
                                                notesData.customerNotes.map((note: any) => (
                                                    <div key={note.uid} className="bg-muted/30 border border-border/50 rounded-lg p-3 group hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-sm text-foreground whitespace-pre-wrap leading-snug">{note.message}</p>
                                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                                    <span className="font-medium">{note.createdByName || 'Unknown'}</span>
                                                                    <span>•</span>
                                                                    <span>{formatSydneyTime(note.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteNote(note.uid)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
                                                                title="Delete note"
                                                            >
                                                                <XIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">No notes yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No customer data available</p>
                )}
            </Modal>

            {/* Freeze Confirmation Modal */}
            <Modal
                isOpen={freezeModalOpen}
                onClose={() => setFreezeModalOpen(false)}
                title="Confirm Freeze Customer"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setFreezeModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                            onClick={handleConfirmFreeze}
                            isLoading={freezingCustomer}
                            loadingText="Freezing..."
                        >
                            Confirm Freeze
                        </Button>
                    </>
                }
            >
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p className="mb-3">
                        Are you sure you want to freeze customer{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {customerToFreeze?.firstName} {customerToFreeze?.lastName}
                        </span>{' '}
                        ({customerToFreeze?.customerId || customerToFreeze?.uid})?
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        This will create a new customer record and mark the current one as Frozen.
                    </p>
                </div>
            </Modal>

            {/* VPP Connection Modal */}
            <Modal
                isOpen={vppConnectModalOpen}
                onClose={() => setVppConnectModalOpen(false)}
                title="Connect VPP - Battery Details"
                size="md"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setVppConnectModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                            onClick={handleConfirmVppConnect}
                        >
                            Connect & Save
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Please provide battery details to connect VPP.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Battery Brand</label>
                            <Select
                                options={BATTERY_BRAND_OPTIONS}
                                value={vppForm.batteryBrand}
                                onChange={(val) => setVppForm({ ...vppForm, batteryBrand: val as string })}
                                placeholder="Select Brand..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">SN Number</label>
                            <Input
                                placeholder="e.g. SN12345678"
                                value={vppForm.snNumber}
                                onChange={(e) => setVppForm({ ...vppForm, snNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Battery Capacity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="13.5"
                                    value={vppForm.batteryCapacity}
                                    onChange={(e) => setVppForm({ ...vppForm, batteryCapacity: e.target.value })}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">kW</span>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Export Limit</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="5.0"
                                    value={vppForm.exportLimit}
                                    onChange={(e) => setVppForm({ ...vppForm, exportLimit: e.target.value })}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">kW</span>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Inverter Capacity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="6.0"
                                    value={vppForm.inverterCapacity}
                                    onChange={(e) => setVppForm({ ...vppForm, inverterCapacity: e.target.value })}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium pointer-events-none">kW</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Check Code</label>
                            <Input
                                placeholder="Verification Code"
                                value={vppForm.checkCode}
                                onChange={(e) => setVppForm({ ...vppForm, checkCode: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Utilmate Connection Modal */}
            <Modal
                isOpen={utilmateConnectModalOpen}
                onClose={() => setUtilmateConnectModalOpen(false)}
                title="Connect Utilmate"
                size="md"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setUtilmateConnectModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                            onClick={handleConfirmUtilmateConnect}
                        >
                            Connect & Save
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Please provide Utilmate details to connect.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Site Identifier</label>
                            <Input
                                placeholder="Site ID..."
                                value={utilmateForm.siteIdentifier}
                                onChange={(e) => setUtilmateForm({ ...utilmateForm, siteIdentifier: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Account Number</label>
                            <Input
                                placeholder="Account #..."
                                value={utilmateForm.accountNumber}
                                onChange={(e) => setUtilmateForm({ ...utilmateForm, accountNumber: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Note Modal */}
            <Modal
                isOpen={noteModalOpen}
                onClose={() => { setNoteModalOpen(false); setNoteText(''); }}
                title="Add Note"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => { setNoteModalOpen(false); setNoteText(''); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-neutral-900 text-white hover:bg-neutral-800"
                            onClick={async () => {
                                await handleAddNote();
                                setNoteModalOpen(false);
                            }}
                            disabled={!noteText.trim() || isAddingNote}
                            isLoading={isAddingNote}
                            loadingText="Adding..."
                        >
                            Add Note
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Add an internal note about this customer.
                    </p>
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write a note..."
                        className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
}
