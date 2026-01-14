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
    CheckIcon, XIcon, MailIcon, SnowflakeIcon, Settings2Icon, PlugIcon, ZapIcon
} from '@/components/icons';
import { GET_CUSTOMERS_CURSOR, GET_CUSTOMER_BY_ID, SOFT_DELETE_CUSTOMER, SEND_REMINDER_EMAIL, CREATE_CUSTOMER, UPDATE_CUSTOMER } from '@/graphql';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { StatusField } from '@/components/common';
import { formatDateTime, formatDate } from '@/lib/date';
import { SALE_TYPE_LABELS, BILLING_PREF_LABELS, DNSP_LABELS, DNSP_OPTIONS, DISCOUNT_OPTIONS, CUSTOMER_STATUS_OPTIONS, VPP_OPTIONS, VPP_CONNECTED_OPTIONS, ULTIMATE_STATUS_OPTIONS, MSAT_CONNECTED_OPTIONS } from '@/lib/constants';
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
    utilmateStatus?: string | number;
    rateVersion?: number;
    createdAt?: string;
    updatedAt?: string;
}



const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
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

    // State for selection (commented out since checkbox UI is disabled)
    // const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

    const limit = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(searchFilters) !== JSON.stringify(debouncedFilters)) {
                setAllCustomers([]);
                setEndCursor(null);
                setDebouncedFilters(searchFilters);
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
    const hasMore = pageInfo?.hasNextPage ?? false;

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

    // Selection Logic (commented out since checkbox UI is disabled)
    // const allSelected = filteredCustomers.length > 0 && filteredCustomers.every(c => selectedCustomerIds.includes(c.uid));
    // const someSelected = filteredCustomers.length > 0 && selectedCustomerIds.length > 0 && !allSelected;

    // const handleSelectAll = (checked: boolean) => {
    //     if (checked) {
    //         const allIds = filteredCustomers.map(c => c.uid);
    //         // Combine with existing non-visible ids if any?
    //         // For now, simple behavior: check selects visible, uncheck deselects all visible
    //         setSelectedCustomerIds(prev => {
    //             const combined = new Set([...prev, ...allIds]);
    //             return Array.from(combined);
    //         });
    //     } else {
    //         // Uncheck: remove visible IDs from selection
    //         const visibleIds = new Set(filteredCustomers.map(c => c.uid));
    //         setSelectedCustomerIds(prev => prev.filter(id => !visibleIds.has(id)));
    //     }
    // };

    // const handleSelectRow = (uid: string, checked: boolean) => {
    //     if (checked) {
    //         setSelectedCustomerIds(prev => [...prev, uid]);
    //     } else {
    //         setSelectedCustomerIds(prev => prev.filter(id => id !== uid));
    //     }
    // };

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
                <StatusField
                    type="customer_status"
                    value={row.status}
                    mode="badge"
                />
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
                            className="h-7 text-xs w-[65px]"
                        />
                    </div>
                    <Select
                        options={[{ value: '', label: 'All' }, ...VPP_CONNECTED_OPTIONS]}
                        value={searchFilters.vppConnected}
                        onChange={(val) => handleSearchChange('vppConnected', val as string)}
                        placeholder="All"
                        className="h-7 text-xs w-[93px]"
                    />
                </div>
            ),
            render: (row) => (
                <div className="flex justify-center">
                    {row.vppDetails?.vppConnected === 1 ? (
                        <div className="rounded-full bg-green-100 p-1">
                            <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                    ) : (
                        <div className="rounded-full bg-red-100 p-1">
                            <XIcon className="h-4 w-4 text-red-600" />
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
                            <div className="rounded-full bg-green-100 p-1">
                                <CheckIcon className="h-4 w-4 text-green-600" />
                            </div>
                        ) : (
                            <div className="rounded-full bg-red-100 p-1">
                                <XIcon className="h-4 w-4 text-red-600" />
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
                            <div className="rounded-full bg-green-100 p-1">
                                <CheckIcon className="h-4 w-4 text-green-600" />
                            </div>
                        ) : (
                            <div className="rounded-full bg-red-100 p-1">
                                <XIcon className="h-4 w-4 text-red-600" />
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
                                    className={`p-2 border border-blue-200 rounded-lg bg-white text-blue-600 transition-colors ${row.status === 4 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-700'}`}
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
                                    className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
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
                {canCreate && (
                    <Button
                        leftIcon={<PlusIcon size={16} />}
                        onClick={() => navigate('/customers/new')}
                    >
                        Add Customer
                    </Button>
                )}
            </div>

            {/* Customers Table */}
            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex flex-col gap-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                        {Object.values(debouncedFilters).some(v => v)
                            ? `Showing ${filteredCustomers.length} matching results (filtered from ${allCustomers.length} loaded)`
                            : `Loaded ${allCustomers.length} customers${hasMore ? ' (scroll for more)' : ''}`
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
                />
            </div>

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
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        {freezingCustomer && <p className="mt-3 text-sm text-muted-foreground">Freezing customer...</p>}
                    </div>
                ) : selectedCustomerDetails ? (
                    <div className="space-y-3">
                        {/* Progress Timeline with Freeze Button */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Progress timeline</h3>
                                    <p className="text-xs text-gray-500">Track each milestone and when it happened.</p>
                                </div>
                                {selectedCustomerDetails.status === 3 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700"
                                        onClick={() => handleFreezeClick(selectedCustomerDetails)}
                                        disabled={freezingCustomer}
                                        isLoading={freezingCustomer}
                                        loadingText="Freezing..."
                                    >
                                        <SnowflakeIcon size={16} className="mr-1" />
                                        Freeze
                                    </Button>
                                )}
                            </div>
                            <div className="relative flex justify-between items-start">
                                <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-gray-300" />
                                {[
                                    { step: 1, label: 'Offer sent', date: selectedCustomerDetails.createdAt, completed: true },
                                    { step: 2, label: 'Signed by customer', date: selectedCustomerDetails.signDate, completed: selectedCustomerDetails.status >= 2, showReminder: selectedCustomerDetails.status < 2 },
                                    { step: 3, label: 'VPP connect', date: null, completed: selectedCustomerDetails.vppDetails?.vppConnected === 1, showToggle: true },
                                    { step: 4, label: 'Connected to MSAT', date: null, completed: selectedCustomerDetails.msatDetails?.msatConnected === 1, showToggle: true },
                                    { step: 5, label: 'Utilmate Connect', date: null, completed: !!selectedCustomerDetails.utilmateStatus, showToggle: true },
                                ].map((item, index, arr) => (
                                    <div key={item.step} className="relative flex flex-col items-center" style={{ width: '20%' }}>
                                        {index > 0 && arr[index - 1].completed && (
                                            <div className={`absolute top-[18px] h-0.5 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} style={{ right: '50%', left: '-50%' }} />
                                        )}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-white border-2 z-10 ${item.completed ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-400'}`}>
                                            {item.completed ? <CheckIcon size={16} strokeWidth={3} /> : item.step}
                                        </div>
                                        <span className={`text-xs mt-2 text-center font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
                                        {item.date && <span className="text-[10px] text-gray-400">{formatDateTime(item.date)}</span>}
                                        {item.showReminder && (
                                            <button
                                                onClick={() => handleSendReminder(selectedCustomerDetails.uid)}
                                                disabled={sendingReminder || reminderSent}
                                                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg mt-1 ${reminderSent ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'} ${sendingReminder ? 'opacity-70' : ''}`}
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
                                            <div className="mt-1">
                                                <ToggleSwitch
                                                    checked={item.completed}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Customer Info Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Customer Info</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Business', value: selectedCustomerDetails.businessName },
                                        { label: 'ABN', value: selectedCustomerDetails.abn },
                                        { label: 'Email', value: selectedCustomerDetails.email },
                                        { label: 'Mobile', value: selectedCustomerDetails.number },
                                        { label: 'DOB', value: selectedCustomerDetails.dob ? formatDate(selectedCustomerDetails.dob) : null },
                                        { label: 'ID Number', value: selectedCustomerDetails.enrollmentDetails?.idnumber },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-800 text-right max-w-[180px] truncate">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Location & Meter</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Address', value: selectedCustomerDetails.address?.fullAddress || [selectedCustomerDetails.address?.streetNumber, selectedCustomerDetails.address?.streetName, selectedCustomerDetails.address?.suburb].filter(Boolean).join(' ') },
                                        { label: 'State', value: selectedCustomerDetails.address?.state },
                                        { label: 'Postcode', value: selectedCustomerDetails.address?.postcode },
                                        { label: 'NMI', value: selectedCustomerDetails.address?.nmi },
                                        { label: 'Tariff Code', value: selectedCustomerDetails.tariffCode },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500 shrink-0 w-24">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-800 text-right flex-1 break-words">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Account Settings Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Account Settings</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Sale Type', value: SALE_TYPE_LABELS[selectedCustomerDetails.enrollmentDetails?.saletype ?? 0] || 'Direct' },
                                        { label: 'Billing', value: BILLING_PREF_LABELS[selectedCustomerDetails.enrollmentDetails?.billingpreference ?? 0] || 'eBill' },
                                        { label: 'Discount', value: selectedCustomerDetails.discount ? `${selectedCustomerDetails.discount}%` : '0%' },
                                        { label: 'Rate Version', value: selectedCustomerDetails.rateVersion ?? '—' },
                                        { label: 'Connection', value: selectedCustomerDetails.enrollmentDetails?.connectiondate ? formatDate(selectedCustomerDetails.enrollmentDetails.connectiondate) : null },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-800">{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* VPP & Solar Details Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* VPP Details Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">VPP Details</h3>
                                    {selectedCustomerDetails.vppDetails?.vpp === 1 && (
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Enrolled</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'VPP Enrolled', value: selectedCustomerDetails.vppDetails?.vpp === 1 ? 'Yes' : 'No' },
                                        { label: 'VPP Connected', value: selectedCustomerDetails.vppDetails?.vppConnected === 1 ? 'Yes' : 'No' },
                                        { label: 'Signup Bonus', value: selectedCustomerDetails.vppDetails?.vppSignupBonus ? '$50 monthly bill credit for 12 months (total $600)' : '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500 shrink-0 w-24 pt-0.5">{item.label}</span>
                                            <span className={`text-xs font-medium text-gray-800 text-right flex-1 ${item.value && item.value.length > 30 ? 'leading-relaxed' : ''}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* MSAT Details Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">MSAT Details</h3>
                                    {selectedCustomerDetails.msatDetails?.msatConnected === 1 && (
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Connected</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'MSAT Connected', value: selectedCustomerDetails.msatDetails?.msatConnected === 1 ? 'Yes' : 'No' },
                                        { label: 'Connected At', value: selectedCustomerDetails.msatDetails?.msatConnectedAt ? formatDateTime(selectedCustomerDetails.msatDetails.msatConnectedAt) : '—' },
                                        { label: 'Updated At', value: selectedCustomerDetails.msatDetails?.msatUpdatedAt ? formatDateTime(selectedCustomerDetails.msatDetails.msatUpdatedAt) : '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500 shrink-0 w-24 pt-0.5">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-800 text-right flex-1">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Solar System Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Solar System Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Solar System</h3>
                                    {selectedCustomerDetails.solarDetails?.hassolar === 1 && (
                                        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Has Solar</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Has Solar', value: selectedCustomerDetails.solarDetails?.hassolar === 1 ? 'Yes' : 'No' },
                                        { label: 'Solar Capacity', value: selectedCustomerDetails.solarDetails?.solarcapacity ? `${selectedCustomerDetails.solarDetails.solarcapacity} kW` : '—' },
                                        { label: 'Inverter Capacity', value: selectedCustomerDetails.solarDetails?.invertercapacity ? `${selectedCustomerDetails.solarDetails.invertercapacity} kW` : '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                            <span className="text-xs text-gray-500">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rate Plan Section */}
                        {selectedCustomerDetails.ratePlan && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800">Rate Plan: {selectedCustomerDetails.tariffCode || selectedCustomerDetails.ratePlan?.tariff}</h3>
                                                <p className="text-xs text-gray-500">DNSP: {DNSP_LABELS[selectedCustomerDetails.ratePlan?.dnsp ?? -1]} • VPP: {selectedCustomerDetails.vppDetails?.vpp === 1 ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedCustomerDetails.ratePlan.offers && selectedCustomerDetails.ratePlan.offers.length > 0 && (
                                    <div className="p-5">
                                        {selectedCustomerDetails.ratePlan.offers.map((offer, idx) => {
                                            const discount = selectedCustomerDetails.discount ?? 0;
                                            const hasCL = (offer.cl1Usage || 0) > 0 || (offer.cl2Usage || 0) > 0;
                                            const hasFiT = (offer.fit || 0) > 0;

                                            const renderRate = (label: string, value: number, colorClass: string = 'blue') => {
                                                const finalRate = calculateDiscountedRate(value, discount);
                                                const colors = {
                                                    blue: 'bg-blue-50 border-blue-200 text-blue-600',
                                                    orange: 'bg-orange-50 border-orange-200 text-orange-600',
                                                };
                                                const theme = colors[colorClass as keyof typeof colors] || colors.blue;

                                                return (
                                                    <div className={`${theme.split(' ')[0]} border ${theme.split(' ')[1]} rounded-lg p-3 text-center space-y-0.5`}>
                                                        <div className={`${theme.split(' ')[2]} font-bold text-base tracking-tight`}>${finalRate.toFixed(4)}/kWh</div>
                                                        <div className={`text-[10px] font-bold ${theme.split(' ')[2]} uppercase tracking-wider opacity-80`}>{label}</div>
                                                    </div>
                                                );
                                            };

                                            const renderCL = (label: string, value: number) => {
                                                const finalRate = calculateDiscountedRate(value, discount);
                                                return (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center space-y-0.5">
                                                        <div className="text-green-600 font-bold text-base tracking-tight">${finalRate.toFixed(4)}/kWh</div>
                                                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider opacity-80">{label}</div>
                                                    </div>
                                                );
                                            };

                                            return (
                                                <div key={offer.uid || idx}>
                                                    <div className={`grid grid-cols-1 ${hasFiT && hasCL ? 'md:grid-cols-4' : (hasFiT || hasCL ? 'md:grid-cols-3' : 'md:grid-cols-2')} gap-8`}>
                                                        {/* Column 1: Energy Rates */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-[#2563EB]">
                                                                <Settings2Icon size={16} />
                                                                <h4 className="text-sm font-bold uppercase tracking-wide">Energy Rates</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {(offer.peak ?? 0) > 0 && renderRate('Peak', offer.peak ?? 0, 'blue')}
                                                                {(offer.offPeak ?? 0) > 0 && renderRate('Off-Peak', offer.offPeak ?? 0, 'blue')}
                                                                {(offer.shoulder ?? 0) > 0 && renderRate('Shoulder', offer.shoulder ?? 0, 'blue')}
                                                                {(offer.anytime ?? 0) > 0 && renderRate('Anytime', offer.anytime ?? 0, 'orange')}
                                                            </div>
                                                        </div>

                                                        {/* Column 2: Supply Charges */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-purple-600">
                                                                <PlugIcon size={16} />
                                                                <h4 className="text-sm font-bold uppercase tracking-wide">Supply Charges</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center space-y-0.5">
                                                                    <div className="text-purple-600 font-bold text-base tracking-tight">${(offer.supplyCharge ?? 0).toFixed(4)}/day</div>
                                                                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider opacity-80">Supply</div>
                                                                </div>
                                                                {(offer.vppOrcharge ?? 0) > 0 && (
                                                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center space-y-0.5">
                                                                        <div className="text-indigo-600 font-bold text-base tracking-tight">${(offer.vppOrcharge ?? 0).toFixed(4)}/day</div>
                                                                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider opacity-80">VPP Charge</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Column 3: Solar FiT */}
                                                        {hasFiT && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-[rgb(22,163,74)]">
                                                                    <ZapIcon size={16} />
                                                                    <h4 className="text-sm font-bold uppercase tracking-wide">Solar FiT</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center space-y-0.5">
                                                                        <div className="text-green-600 font-bold text-base tracking-tight">${(offer.fit ?? 0).toFixed(4)}/kWh</div>
                                                                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider opacity-80">Feed-in</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Column 4: Controlled Load */}
                                                        {hasCL && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-green-600">
                                                                    <PlugIcon size={16} />
                                                                    <h4 className="text-sm font-bold uppercase tracking-wide">Controlled Load</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {(offer.cl1Usage ?? 0) > 0 && renderCL('CL1 Usage', offer.cl1Usage ?? 0)}
                                                                    {(offer.cl2Usage ?? 0) > 0 && renderCL('CL2 Usage', offer.cl2Usage ?? 0)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No customer data available</p>
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
                <div className="text-sm text-gray-600">
                    <p className="mb-3">
                        Are you sure you want to freeze customer{' '}
                        <span className="font-semibold text-gray-900">
                            {customerToFreeze?.firstName} {customerToFreeze?.lastName}
                        </span>{' '}
                        ({customerToFreeze?.customerId || customerToFreeze?.uid})?
                    </p>
                    <p className="text-gray-500">
                        This will create a new customer record and mark the current one as Frozen.
                    </p>
                </div>
            </Modal>
        </div>
    );
}