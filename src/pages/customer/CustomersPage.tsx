import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { calculateDiscountedRate } from '../../lib/rate-utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, type Column, Modal } from '@/components/common';
import {
    PlusIcon, PencilIcon,
    // TrashIcon,
    CheckIcon, XIcon, MailIcon, Settings2Icon, PlugIcon, ZapIcon,
    ActivityIcon, ChevronRightIcon, InfoIcon
} from '@/components/icons';
import { GET_CUSTOMERS_CURSOR, GET_CUSTOMER_BY_ID, SOFT_DELETE_CUSTOMER, SEND_REMINDER_EMAIL, CREATE_CUSTOMER, UPDATE_CUSTOMER, GET_ALL_FILTERED_CUSTOMER_IDS } from '@/graphql';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { StatusField } from '@/components/common';
import { formatDateTime, formatDate } from '@/lib/date';
import BulkEmailModal from './BulkEmailModal';
import { SALE_TYPE_LABELS, BILLING_PREF_LABELS, DNSP_LABELS, DNSP_OPTIONS, DISCOUNT_OPTIONS, CUSTOMER_STATUS_OPTIONS, VPP_OPTIONS, VPP_CONNECTED_OPTIONS, ULTIMATE_STATUS_OPTIONS, MSAT_CONNECTED_OPTIONS, ID_TYPE_MAP } from '@/lib/constants';
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
    createdAt: string;
    rateVersion?: number;
    address?: CustomerAddress;
    ratePlan?: {
        dnsp?: string;
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
}



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

const AccordionCard = ({ title, icon, children, badge }: { title: string, icon: React.ReactNode, children: React.ReactNode, badge?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div
                className="flex items-center justify-between p-5 cursor-pointer select-none"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    {badge}
                </div>
                <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRightIcon size={16} />
                </div>
            </div>
            {isOpen && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

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
    const [endCursor, setEndCursor] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Customer details modal state
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<CustomerDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Lazy query for customer details
    const [fetchCustomerDetails] = useLazyQuery(GET_CUSTOMER_BY_ID, {
        fetchPolicy: 'network-only',
    });

    // Lazy query for fetching all filtered customer IDs (for Select All)
    const [fetchAllFilteredIds] = useLazyQuery(GET_ALL_FILTERED_CUSTOMER_IDS, {
        fetchPolicy: 'network-only',
    });

    // State for selection
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [bulkEmailModalOpen, setBulkEmailModalOpen] = useState(false);
    const [isSelectingAll, setIsSelectingAll] = useState(false);
    const [totalFilteredCount, setTotalFilteredCount] = useState<number | undefined>(undefined);

    const limit = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(searchFilters) !== JSON.stringify(debouncedFilters)) {
                setAllCustomers([]);
                setEndCursor(null);
                setDebouncedFilters(searchFilters);
                // Reset selection when filters change
                setSelectedCustomerIds([]);
                setTotalFilteredCount(undefined);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchFilters, debouncedFilters]);

    const { data, loading, error, fetchMore, refetch } = useQuery<CustomersCursorResponse>(GET_CUSTOMERS_CURSOR, {
        variables: {
            first: limit,
            after: null,
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
    const hasMore = hasNextPage; // Use local state instead of derived prop which might be stale

    // Refetch when search changes
    useEffect(() => {
        refetch({
            first: limit,
            after: null,
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
        });
    }, [debouncedFilters, refetch]);

    // Update customers when data changes
    useEffect(() => {
        if (data?.customersCursor?.data) {
            const newCustomers = data.customersCursor.data;
            if (!endCursor) {
                // Initial load or search reset
                setAllCustomers(newCustomers);
            }
            if (data.customersCursor.pageInfo.endCursor) {
                setEndCursor(data.customersCursor.pageInfo.endCursor);
            }
            // Initialize hasNextPage from initial data
            if (data.customersCursor.pageInfo) {
                setHasNextPage(data.customersCursor.pageInfo.hasNextPage);
            }
            setIsLoadingMore(false);
        }
    }, [data]);

    const handleLoadMore = useCallback(async () => {
        if (!hasMore || isLoadingMore || !endCursor) return;

        setIsLoadingMore(true);
        try {
            const result = await fetchMore({
                variables: {
                    first: limit,
                    after: endCursor,
                    searchId: debouncedFilters.id || undefined,
                    searchName: debouncedFilters.name || undefined,
                    searchMobile: debouncedFilters.mobile || undefined,
                    searchAddress: debouncedFilters.address || undefined,
                    searchDnsp: debouncedFilters.dnsp || undefined,
                    searchDiscount: debouncedFilters.discount ? parseInt(debouncedFilters.discount) : undefined,
                    searchStatus: debouncedFilters.status ? parseInt(debouncedFilters.status) : undefined,
                    searchVpp: debouncedFilters.vpp ? parseInt(debouncedFilters.vpp) : undefined,
                    searchVppConnected: debouncedFilters.vppConnected ? parseInt(debouncedFilters.vppConnected) : undefined,
                    searchUtilmateStatus: debouncedFilters.utilmateStatus ? parseInt(debouncedFilters.utilmateStatus) : undefined,
                    searchMsatConnected: debouncedFilters.msatConnected ? parseInt(debouncedFilters.msatConnected) : undefined,
                },
            });


            if (result.data?.customersCursor?.data) {
                setAllCustomers(prev => {
                    const existingIds = new Set(prev.map(c => c.uid));
                    const uniqueNew = result.data.customersCursor.data.filter(c => !existingIds.has(c.uid));
                    return [...prev, ...uniqueNew];
                });
                if (result.data.customersCursor.pageInfo.endCursor) {
                    setEndCursor(result.data.customersCursor.pageInfo.endCursor);
                }
                // Update hasNextPage from fetchMore result
                if (result.data.customersCursor.pageInfo) {
                    setHasNextPage(result.data.customersCursor.pageInfo.hasNextPage);
                }
            }
        } catch (err) {
            console.error('Error loading more customers:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, endCursor, fetchMore, debouncedFilters]);

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
    const [updateCustomer] = useMutation(UPDATE_CUSTOMER);

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
                setEndCursor(null);
                refetch();
            }
        } catch (error: any) {
            console.error('Error freezing customer:', error);
            toast.error(error.message || 'Failed to freeze customer');
        } finally {
            setFreezingCustomer(false);
        }
    };

    const handleVppToggle = async (customerUid: string, newValue: boolean) => {
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
            const { data } = await fetchCustomerDetails({
                variables: { uid: customer.uid }
            });
            if (data?.customer) {
                setSelectedCustomerDetails(data.customer);
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
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Ultimate Status</span>
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
                        {row.utilmateStatus === 1 ? (
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
                            <span className="text-xs font-semibold uppercase text-muted-foreground">MSAT Connected</span>
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
            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex flex-col gap-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                        {Object.values(debouncedFilters).some(v => v)
                            ? `Showing ${filteredCustomers.length} matching results${pageInfo?.totalCount ? ` (filtered from ${pageInfo.totalCount} total matching)` : ` (filtered from ${allCustomers.length} loaded)`}`
                            : `Loaded ${allCustomers.length}${pageInfo?.totalCount ? ` of ${pageInfo.totalCount}` : ''} customers${hasMore ? ' (scroll for more)' : ''}`
                        }
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
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    enableSelection={true}
                    selectedRowKeys={selectedCustomerIds}
                    onSelectionChange={setSelectedCustomerIds}
                    onSelectAll={handleSelectAll}
                    isSelectingAll={isSelectingAll}
                    totalFilteredCount={totalFilteredCount}
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
                title={selectedCustomerDetails ? `Customer details · ${selectedCustomerDetails.firstName} ${selectedCustomerDetails.lastName}` : 'Customer details'}
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
                                {selectedCustomerDetails.status === 3 && (
                                    <Button
                                        size="sm"
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                        onClick={() => handleFreezeClick(selectedCustomerDetails)}
                                        disabled={freezingCustomer}
                                        isLoading={freezingCustomer}
                                        loadingText="Freezing..."
                                    >
                                        {/* <SnowflakeIcon size={16} className="mr-1" /> */}
                                        Freeze
                                    </Button>
                                )}
                            </div>
                            <div className="relative flex justify-between items-start">
                                {[
                                    { label: 'Offer sent', date: selectedCustomerDetails.createdAt, completed: true, step: 1 },
                                    { label: 'Signed by customer', date: selectedCustomerDetails.signDate, completed: selectedCustomerDetails.status >= 2, showReminder: selectedCustomerDetails.status < 2, step: 2 },
                                    ...(selectedCustomerDetails.vppDetails?.vpp === 1 ? [
                                        { label: 'VPP connect', date: null, completed: selectedCustomerDetails.vppDetails?.vppConnected === 1, showToggle: true, disabled: selectedCustomerDetails.status < 2, step: 3 },
                                    ] : []),
                                    { label: 'Connected to MSAT', date: null, completed: selectedCustomerDetails.msatDetails?.msatConnected === 1, showToggle: true, disabled: selectedCustomerDetails.vppDetails?.vpp === 1 && selectedCustomerDetails.vppDetails?.vppConnected !== 1, step: 4 },
                                    { label: 'Utilmate Connect', date: null, completed: !!selectedCustomerDetails.utilmateStatus, showToggle: true, step: 5 },
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
                                                                    <span>{selectedCustomerDetails.msatDetails?.msatConnectedAt ? formatDateTime(selectedCustomerDetails.msatDetails.msatConnectedAt) : '—'}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Updated:</span>
                                                                    <span>{selectedCustomerDetails.msatDetails?.msatUpdatedAt ? formatDateTime(selectedCustomerDetails.msatDetails.msatUpdatedAt) : '—'}</span>
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
                                        {item.date && <span className="text-[10px] text-muted-foreground">{formatDateTime(item.date)}</span>}
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
                                                <ToggleSwitch
                                                    checked={item.completed}
                                                    disabled={item.disabled}
                                                    onChange={(val) => {
                                                        if (item.step === 3) {
                                                            handleVppToggle(selectedCustomerDetails.uid, val);
                                                        } else if (item.step === 4) {
                                                            handleMsatToggle(selectedCustomerDetails.uid, val);
                                                        } else {
                                                            console.log('Toggle', item.label, val);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Three Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                            {/* Customer Info Card */}
                            <AccordionCard
                                title="Customer Info"
                                icon={
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {[
                                        { label: 'Customer Id', value: selectedCustomerDetails.customerId },
                                        { label: 'Business', value: selectedCustomerDetails.businessName },
                                        { label: 'ABN', value: selectedCustomerDetails.abn },
                                        { label: 'Email', value: selectedCustomerDetails.email },
                                        { label: 'Mobile', value: selectedCustomerDetails.number },
                                        { label: 'DOB', value: selectedCustomerDetails.dob ? formatDate(selectedCustomerDetails.dob) : null },
                                        { label: 'ID Type', value: ID_TYPE_MAP[selectedCustomerDetails.enrollmentDetails?.idtype ?? -1] },
                                        { label: 'ID Number', value: selectedCustomerDetails.enrollmentDetails?.idnumber },
                                        { label: 'ID State', value: selectedCustomerDetails.enrollmentDetails?.idstate },
                                        { label: 'ID Expiry', value: selectedCustomerDetails.enrollmentDetails?.idexpiry ? formatDate(selectedCustomerDetails.enrollmentDetails.idexpiry) : null },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <span className="text-xs font-medium text-foreground text-right max-w-[180px] truncate">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionCard>

                            {/* Location Card */}
                            <AccordionCard
                                title="Location & Meter"
                                icon={
                                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {[
                                        { label: 'Address', value: selectedCustomerDetails.address?.fullAddress || [selectedCustomerDetails.address?.streetNumber, selectedCustomerDetails.address?.streetName, selectedCustomerDetails.address?.suburb].filter(Boolean).join(' ') },
                                        { label: 'State', value: selectedCustomerDetails.address?.state },
                                        { label: 'Postcode', value: selectedCustomerDetails.address?.postcode },
                                        { label: 'NMI', value: selectedCustomerDetails.address?.nmi },
                                        { label: 'Tariff Code', value: selectedCustomerDetails.tariffCode },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-border last:border-0">
                                            <span className="text-xs text-muted-foreground shrink-0 w-24">{item.label}</span>
                                            <span className="text-xs font-medium text-foreground text-right flex-1 break-words">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionCard>

                            {/* Account Settings Card */}
                            <AccordionCard
                                title="Account Settings"
                                icon={
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {[
                                        { label: 'Sale Type', value: SALE_TYPE_LABELS[selectedCustomerDetails.enrollmentDetails?.saletype ?? 0] || 'Direct' },
                                        { label: 'Billing', value: BILLING_PREF_LABELS[selectedCustomerDetails.enrollmentDetails?.billingpreference ?? 0] || 'eBill' },
                                        { label: 'Discount', value: selectedCustomerDetails.discount ? `${selectedCustomerDetails.discount}%` : '-' },
                                        { label: 'Rate Version', value: selectedCustomerDetails.rateVersion ?? '—' },
                                        { label: 'Connection Date', value: selectedCustomerDetails.enrollmentDetails?.connectiondate ? formatDate(selectedCustomerDetails.enrollmentDetails.connectiondate) : null },
                                        { label: 'Concession', value: selectedCustomerDetails.enrollmentDetails?.concession === 1 ? 'Yes' : 'No' },
                                        { label: 'Life Support', value: selectedCustomerDetails.enrollmentDetails?.lifesupport === 1 ? 'Yes' : 'No' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <span className="text-xs font-medium text-foreground">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionCard>
                        </div>

                        {/* VPP, MSAT, Solar & Debit Details Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                            {/* VPP Participant Card */}
                            {selectedCustomerDetails.vppDetails?.vpp === 1 && (
                                <AccordionCard
                                    title="VPP Participant"
                                    icon={
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                    }
                                    badge={
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">Enrolled</span>
                                    }
                                >
                                    <div className="space-y-3">
                                        {[
                                            { label: 'VPP Enrolled', value: 'Yes' },
                                            { label: 'VPP Connected', value: selectedCustomerDetails.vppDetails?.vppConnected === 1 ? 'Yes' : 'No' },
                                            { label: 'Signup Bonus', value: selectedCustomerDetails.vppDetails?.vppSignupBonus ? '$50 monthly bill credit for 12 months (total $600)' : '—' },
                                            // VPP Participant / Battery Details
                                            ...(selectedCustomerDetails.batteryDetails ? [
                                                { label: 'Battery Brand', value: selectedCustomerDetails.batteryDetails.batterybrand },
                                                { label: 'SN Number', value: selectedCustomerDetails.batteryDetails.snnumber },
                                                { label: 'Battery Capacity', value: selectedCustomerDetails.batteryDetails.batterycapacity ? `${selectedCustomerDetails.batteryDetails.batterycapacity} kW` : null },
                                                { label: 'Export Limit', value: selectedCustomerDetails.batteryDetails.exportlimit ? `${selectedCustomerDetails.batteryDetails.exportlimit} kW` : null },
                                            ] : [])
                                        ].map((item, i) => (
                                            item.value ? ( // Only show if value exists (for battery props) or keep existing logic
                                                <div key={i} className="flex justify-between items-start py-1.5 border-b border-border last:border-0">
                                                    <span className="text-xs text-muted-foreground shrink-0 w-24 pt-0.5">{item.label}</span>
                                                    <span className={`text-xs font-medium text-foreground text-right flex-1 ${item.value.toString().length > 30 ? 'leading-relaxed' : ''}`}>{item.value}</span>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </AccordionCard>
                            )}



                            {/* Solar System Card */}
                            <AccordionCard
                                title="Solar System"
                                icon={
                                    <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                    </div>
                                }
                                badge={
                                    selectedCustomerDetails.solarDetails?.hassolar === 1 ? (
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-full">Has Solar</span>
                                    ) : null
                                }
                            >
                                <div className="space-y-3">
                                    {[
                                        { label: 'Has Solar', value: selectedCustomerDetails.solarDetails?.hassolar === 1 ? 'Yes' : 'No' },
                                        { label: 'Solar Capacity', value: selectedCustomerDetails.solarDetails?.solarcapacity ? `${selectedCustomerDetails.solarDetails.solarcapacity} kW` : '—' },
                                        { label: 'Inverter Capacity', value: selectedCustomerDetails.solarDetails?.invertercapacity ? `${selectedCustomerDetails.solarDetails.invertercapacity} kW` : '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <span className="text-xs font-medium text-foreground">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionCard>

                            {/* Debit Details Card */}
                            {selectedCustomerDetails.debitDetails?.optIn === 1 && (
                                <AccordionCard
                                    title="Debit Details"
                                    icon={
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                    }
                                    badge={
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full">Active</span>
                                    }
                                >
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Name', value: selectedCustomerDetails.debitDetails.accountType === 0 ? selectedCustomerDetails.debitDetails.companyName : `${selectedCustomerDetails.debitDetails.firstName} ${selectedCustomerDetails.debitDetails.lastName}` },
                                            { label: 'Type', value: selectedCustomerDetails.debitDetails.accountType === 0 ? 'Business' : 'Personal' },
                                            ...(selectedCustomerDetails.debitDetails.accountType === 0 ? [{ label: 'ABN', value: selectedCustomerDetails.debitDetails.abn }] : []),
                                            { label: 'Bank', value: selectedCustomerDetails.debitDetails.bankName },
                                            { label: 'BSB', value: selectedCustomerDetails.debitDetails.bsb },
                                            { label: 'Account', value: selectedCustomerDetails.debitDetails.accountNumber },
                                            {
                                                label: 'Frequency',
                                                value: selectedCustomerDetails.debitDetails.paymentFrequency === 0 ? 'Monthly' :
                                                    selectedCustomerDetails.debitDetails.paymentFrequency === 1 ? 'Fortnightly' : 'Weekly'
                                            },
                                            { label: 'Start Date', value: selectedCustomerDetails.debitDetails.firstDebitDate ? formatDate(selectedCustomerDetails.debitDetails.firstDebitDate) : '—' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                                <span className="text-xs font-medium text-foreground text-right">{item.value || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionCard>
                            )}
                        </div>

                        {/* Rate Plan Section */}
                        {selectedCustomerDetails.ratePlan && (
                            <details className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group">
                                <summary className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-4 border-b border-border list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">Rate Plan: {selectedCustomerDetails.tariffCode || selectedCustomerDetails.ratePlan?.tariff}</h3>
                                                <p className="text-xs text-muted-foreground">DNSP: {DNSP_LABELS[selectedCustomerDetails.ratePlan?.dnsp ?? -1]} • VPP: {selectedCustomerDetails.vppDetails?.vpp === 1 ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                        <div className="transform transition-transform duration-200 group-open:rotate-90">
                                            <ChevronRightIcon size={16} />
                                        </div>
                                    </div>
                                </summary>

                                {selectedCustomerDetails.ratePlan.offers && selectedCustomerDetails.ratePlan.offers.length > 0 && (
                                    <div className="p-5 animate-in slide-in-from-top-2 duration-200">
                                        {selectedCustomerDetails.ratePlan.offers.map((offer, idx) => {
                                            const discount = selectedCustomerDetails.discount ?? 0;
                                            const hasCL = (offer.cl1Usage || 0) > 0 || (offer.cl2Usage || 0) > 0;
                                            const hasFiT = (offer.fit || 0) > 0 || (offer.fitPeak || 0) > 0 || (offer.fitCritical || 0) > 0 || (offer.fitVpp || 0) > 0;

                                            return (
                                                <div key={offer.uid || idx}>
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
                                                                            <h4 className="text-sm font-bold uppercase tracking-wide">VPP Orchestration Charges</h4>
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
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Peak</div>
                                                                        </div>
                                                                    )}
                                                                    {(offer.fitCritical ?? 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fitCritical ?? 0).toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT Critical</div>
                                                                        </div>
                                                                    )}
                                                                    {(offer.fitVpp ?? 0) > 0 && (
                                                                        <div className="bg-teal-100 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center space-y-0.5">
                                                                            <div className="text-teal-800 dark:text-teal-300 font-bold text-base tracking-tight">${(offer.fitVpp ?? 0).toFixed(4)}/kWh</div>
                                                                            <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider opacity-80">FiT VPP</div>
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
                                )}
                            </details>
                        )}
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
        </div>
    );
}