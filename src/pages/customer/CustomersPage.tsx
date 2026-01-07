import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, type Column, Modal } from '@/components/common';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, MailIcon, XIcon } from '@/components/icons';
import { GET_CUSTOMERS_CURSOR, GET_CUSTOMER_BY_ID, SOFT_DELETE_CUSTOMER, SEND_REMINDER_EMAIL } from '@/graphql';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { StatusField } from '@/components/common';
import { formatDate } from '@/lib/utils';
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
    email?: string;
    number?: string;
    dob?: string;
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
    };
    msatDetails?: {
        msatConnected?: number;
        msatConnectedAt?: string;
    };
    utilmateStatus?: string | number;
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
    const [sendingReminder, setSendingReminder] = useState(false);

    const handleSendReminder = async (customerUid: string) => {
        setSendingReminder(true);
        try {
            const { data } = await sendReminderEmail({
                variables: { customerUid }
            });

            if (data?.sendReminderEmail?.success) {
                toast.success(data.sendReminderEmail.message || 'Reminder sent successfully');
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

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setDeleteConfirmName('');
        setDeleteModalOpen(true);
    };

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

    const columns: Column<Customer>[] = [
        // Only show actions column if user has at least one action permission
        ...(showActionsColumn ? [{
            key: 'actions' as const,
            header: (
                <div className="flex flex-col gap-1 min-w-[100px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Actions</span>
                    </div>
                    <div className="h-7"></div>
                </div>
            ),
            width: 'w-[120px]',
            render: (row: Customer) => (
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
                    {canEdit && (
                        <Tooltip content="Edit Customer">
                            <button
                                className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={() => handleEdit(row)}
                            >
                                <PencilIcon size={16} />
                            </button>
                        </Tooltip>
                    )}
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
                </div>
            ),
        }] : []),
        {
            key: 'id',
            header: (
                <div className="flex flex-col gap-1 min-w-[90px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">ID</span>
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
                    <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                        {row.customerId || row.uid.slice(0, 8)}
                    </span>
                ) : (
                    <button
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
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
                <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Customer</span>
                    </div>
                    <Input
                        value={searchFilters.name}
                        onChange={(e) => handleSearchChange('name', e.target.value)}
                        placeholder="Search name..."
                        className="h-7 text-xs"
                    />
                </div>
            ),
            width: 'w-[180px]',
            render: (row) => <span className="font-medium text-foreground">{row.firstName} {row.lastName}</span>,
        },
        {
            key: 'mobile',
            header: (
                <div className="flex flex-col gap-1 min-w-[110px]">
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
                <div className="flex flex-col gap-1 min-w-[160px]">
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
                <div className="flex flex-col gap-1 min-w-[100px]">
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
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">DNSP</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'All DNSPs' }, ...DNSP_OPTIONS]}
                        value={searchFilters.dnsp}
                        onChange={(val) => handleSearchChange('dnsp', val as string)}
                        placeholder="All DNSPs"
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => <StatusField type="dnsp" value={row.ratePlan?.dnsp} mode="badge" />,
        },
        {
            key: 'discount',
            header: (
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Discount</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'All discounts' }, ...DISCOUNT_OPTIONS]}
                        value={searchFilters.discount}
                        onChange={(val) => handleSearchChange('discount', val as string)}
                        placeholder="All discounts"
                        className="h-7 text-xs"
                    />
                </div>
            ),
            render: (row) => <span className="text-foreground">{row.discount ? `${row.discount} %` : '0 %'}</span>,
        },
        {
            key: 'status',
            header: (
                <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className="h-7 flex items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
                    </div>
                    <Select
                        options={[{ value: '', label: 'Select Status' }, ...CUSTOMER_STATUS_OPTIONS]}
                        value={searchFilters.status}
                        onChange={(val) => handleSearchChange('status', val as string)}
                        placeholder="Select Status"
                        className="h-7 text-xs"
                    />
                </div>
            ),
            width: 'w-[150px]',
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
                <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className='flex gap-2 items-center'>
                        <span className="text-xs font-semibold uppercase text-muted-foreground whitespace-nowrap">VPP</span>
                        <Select
                            options={[{ value: '', label: 'Select VPP' }, ...VPP_OPTIONS]}
                            value={searchFilters.vpp}
                            onChange={(val) => handleSearchChange('vpp', val as string)}
                            placeholder="Select VPP"
                            className="h-7 text-xs flex-1"
                        />
                    </div>
                    <Select
                        options={[{ value: '', label: 'Select Connected' }, ...VPP_CONNECTED_OPTIONS]}
                        value={searchFilters.vppConnected}
                        onChange={(val) => handleSearchChange('vppConnected', val as string)}
                        placeholder="Select Connected"
                        className="h-7 text-xs"
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
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <div className="h-7 flex items-center">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Ultimate Status</span>
                        </div>
                        <Select
                            options={[{ value: '', label: 'All' }, ...ULTIMATE_STATUS_OPTIONS]}
                            value={searchFilters.utilmateStatus}
                            onChange={(val) => handleSearchChange('utilmateStatus', val as string)}
                            placeholder="All"
                            className="h-7 text-xs"
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
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <div className="h-7 flex items-center">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">MSAT Connected</span>
                        </div>
                        <Select
                            options={[{ value: '', label: 'All' }, ...MSAT_CONNECTED_OPTIONS]}
                            value={searchFilters.msatConnected}
                            onChange={(val) => handleSearchChange('msatConnected', val as string)}
                            placeholder="All"
                            className="h-7 text-xs"
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
        ] : [])
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
                onClose={() => setDetailsModalOpen(false)}
                title={selectedCustomerDetails ? `Customer details · ${selectedCustomerDetails.firstName} ${selectedCustomerDetails.lastName}` : 'Customer details'}
                size="full"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDetailsModalOpen(false)}
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
                {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : selectedCustomerDetails ? (
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <StatusField
                                type="customer_status"
                                value={selectedCustomerDetails.status}
                                mode="badge"
                            />
                        </div>

                        {/* Progress Timeline */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Progress timeline</h3>
                            <p className="text-xs text-gray-500 mb-5">Track each milestone and when it happened.</p>
                            <div className="relative flex justify-between items-start">
                                {/* Connecting line background */}
                                <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-gray-300" />

                                {[
                                    { step: 1, label: 'Offer sent', date: selectedCustomerDetails.createdAt, completed: true },
                                    {
                                        step: 2,
                                        label: 'Signed by customer',
                                        date: selectedCustomerDetails.signDate,
                                        completed: selectedCustomerDetails.status >= 2,
                                        action: selectedCustomerDetails.status < 2 ? (
                                            <button
                                                onClick={() => handleSendReminder(selectedCustomerDetails.uid)}
                                                disabled={sendingReminder}
                                                className={`flex items-center gap-2 bg-primary text-primary-foreground text-[10px] font-medium px-3 py-1.5 rounded-lg mt-2 transition-colors ${sendingReminder ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                                            >
                                                <MailIcon size={12} />
                                                {sendingReminder ? 'Sending...' : 'Send reminder'}
                                            </button>
                                        ) : null
                                    },
                                    {
                                        step: 3,
                                        label: 'VPP connect',
                                        date: null,
                                        completed: selectedCustomerDetails.vppDetails?.vppConnected === 1,
                                        action: selectedCustomerDetails.vppDetails?.vpp === 1 ? (
                                            <div className="flex flex-col items-center mt-2 gap-1">
                                                <ToggleSwitch
                                                    checked={selectedCustomerDetails.vppDetails?.vpp === 1}
                                                    onChange={(val) => console.log('Toggle VPP', val)}
                                                />
                                                {selectedCustomerDetails.vppDetails?.vppConnected !== 1 && (
                                                    <span className="text-[10px] text-gray-400 text-center w-32 leading-tight">
                                                        Sign the quote to enable VPP connection
                                                    </span>
                                                )}
                                            </div>
                                        ) : null
                                    },
                                    {
                                        step: 4,
                                        label: 'Connected to MSAT',
                                        date: null,
                                        completed: selectedCustomerDetails.msatDetails?.msatConnected === 1,
                                        action: (
                                            <div className="flex flex-col items-center mt-2">
                                                <ToggleSwitch
                                                    checked={selectedCustomerDetails.msatDetails?.msatConnected === 1}
                                                    onChange={(val) => console.log('Toggle MSAT', val)}
                                                />
                                                {selectedCustomerDetails.msatDetails?.msatConnected === 1 && selectedCustomerDetails.msatDetails?.msatConnectedAt && (
                                                    <span className="text-[10px] text-gray-400 mt-1">
                                                        {formatDate(selectedCustomerDetails.msatDetails.msatConnectedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        step: 5,
                                        label: 'Utilmate Connect',
                                        date: null,
                                        completed: !!selectedCustomerDetails.utilmateStatus,
                                        action: (
                                            <div className="flex flex-col items-center mt-2">
                                                <ToggleSwitch
                                                    checked={!!selectedCustomerDetails.utilmateStatus}
                                                    onChange={(val) => console.log('Toggle Utilmate', val)}
                                                />
                                            </div>
                                        )
                                    },
                                ].map((item, index, arr) => {
                                    // Calculate if the line segment before this step is completed
                                    const prevCompleted = index > 0 && arr[index - 1].completed && item.completed;
                                    return (
                                        <div key={item.step} className="relative flex flex-col items-center z-10" style={{ width: '20%' }}>
                                            {/* Green line overlay for completed segments */}
                                            {index > 0 && prevCompleted && (
                                                <div
                                                    className="absolute top-[18px] h-0.5 bg-green-500 transition-all duration-500 -z-10"
                                                    style={{ right: '50%', width: '100%' }}
                                                />
                                            )}
                                            {/* Step circle */}
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-white border-2 transition-all duration-300 z-10 ${item.completed
                                                    ? 'border-green-500 text-green-500'
                                                    : 'border-gray-200 text-gray-400'
                                                    }`}
                                            >
                                                {item.completed ? <CheckIcon size={16} strokeWidth={3} /> : item.step}
                                            </div>
                                            {/* Label */}
                                            <span className={`text-xs mt-3 text-center font-medium transition-colors duration-300 ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {item.label}
                                            </span>
                                            {/* Action or Date */}
                                            {item.action ? (
                                                item.action
                                            ) : item.date ? (
                                                <span className="text-[10px] text-gray-400 mt-1">
                                                    {formatDate(item.date)}
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Two Column Layout - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                            {/* Customer Summary - Left Column */}
                            <div className="p-5 border-r border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Customer summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Customer ID</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.customerId || selectedCustomerDetails.uid.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">NMI</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.address?.nmi || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Tariff</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.tariffCode || selectedCustomerDetails.ratePlan?.tariff || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">DNSP</span>
                                        <span className="font-medium text-gray-900">{DNSP_LABELS[selectedCustomerDetails.ratePlan?.dnsp ?? -1] || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Discount</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.discount ? `${selectedCustomerDetails.discount}%` : '0%'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Sale type</span>
                                        <span className="font-medium text-gray-900">{SALE_TYPE_LABELS[selectedCustomerDetails.enrollmentDetails?.saletype ?? 0] || 'Direct'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Connection date</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedCustomerDetails.enrollmentDetails?.connectiondate
                                                ? new Date(selectedCustomerDetails.enrollmentDetails.connectiondate).toLocaleDateString()
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">DOB</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedCustomerDetails.dob ? new Date(selectedCustomerDetails.dob).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Identification</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.enrollmentDetails?.idnumber || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">Billing preference</span>
                                        <span className="font-medium text-gray-900">{BILLING_PREF_LABELS[selectedCustomerDetails.enrollmentDetails?.billingpreference ?? 0] || 'eBill (Email)'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">VPP</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.vppDetails?.vpp === 1 ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-36 shrink-0">VPP connection</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.vppDetails?.vppConnected === 1 ? 'Connected' : 'Not connected'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Contact - Right Column */}
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Customer contact</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex">
                                        <span className="text-gray-500 w-24 shrink-0">Name</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.firstName} {selectedCustomerDetails.lastName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24 shrink-0">Email</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.email || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24 shrink-0">Mobile</span>
                                        <span className="font-medium text-gray-900">{selectedCustomerDetails.number || '—'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24 shrink-0">Address</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedCustomerDetails.address?.fullAddress ||
                                                [
                                                    selectedCustomerDetails.address?.unitNumber ? `${selectedCustomerDetails.address.unitNumber}/` : '',
                                                    selectedCustomerDetails.address?.streetNumber,
                                                    selectedCustomerDetails.address?.streetName,
                                                    selectedCustomerDetails.address?.suburb,
                                                    selectedCustomerDetails.address?.state,
                                                    selectedCustomerDetails.address?.postcode
                                                ].filter(Boolean).join(' ') || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No customer data available</p>
                )}
            </Modal>
        </div>
    );
}
