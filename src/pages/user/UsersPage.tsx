import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { useAccessibleMenus } from '@/stores/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { DataTable, type Column, Modal } from '@/components/common';
import {
    PlusIcon, PencilIcon, TrashIcon, ShieldCheckIcon,
    // EyeIcon, EyeOffIcon, CopyIcon,
    RefreshCwIcon
} from '@/components/icons';
import { UserPermissionsModal } from '@/components/users/UserPermissionsModal';
import { GET_USERS, UPDATE_USER, SOFT_DELETE_USER, RESTORE_USER, GET_ROLES, CREATE_USER } from '@/graphql';
import { formatDateTime } from '@/lib/date';
import { StatusField } from '@/components/common';

// Types
interface User {
    uid: string;
    email?: string;
    password?: string;
    name: string;
    number?: string;
    tenant?: string;
    roleUid: string;
    roleName: string;
    status: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    message?: string;
}

interface Role {
    uid: string;
    name: string;
    isDeleted: boolean;
}

interface UsersResponse {
    users: {
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
        data: User[];
    };
}

// Role badge colors
const getRoleBadgeClass = (role: string) => {
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('master') || roleLower.includes('admin')) {
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    if (roleLower.includes('retention')) {
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
    if (roleLower.includes('manager')) {
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

export function UsersPage() {
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Restore modal state
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [userToRestore, setUserToRestore] = useState<User | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    // Create/Edit modal state
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        number: '',
        roleUid: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Permissions Modal State
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);

    const limit = 20;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchQuery) {
                setAllUsers([]);
                setPage(1);
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    const { data, loading, error, refetch } = useQuery<UsersResponse>(GET_USERS, {
        variables: {
            page,
            limit,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            search: debouncedSearch || undefined,
            roleUid: roleFilter || undefined // Pass roleUid if selected
        },
        fetchPolicy: 'network-only',
    });

    // Fetch roles for dropdown
    const { data: rolesData } = useQuery(GET_ROLES);
    const roles = rolesData?.roles?.data || [];

    // Create role options for the filter dropdown
    const filterRoleOptions = [
        { value: '', label: 'All Roles' },
        ...roles.filter((r: Role) => !r.isDeleted).map((r: Role) => ({ value: r.uid, label: r.name }))
    ];

    // Prepend "All Roles" option if desired, or just handle empty value as "All"
    // The Select component usually handles clearing if allowed, or we can add an "All" option manually if needed.
    // For now, let's keep it simple: if roleFilter is empty string, it shows placeholder "Role" and filters by nothing (which means all).

    const roleDropdownOptions = roles.filter((r: Role) => !r.isDeleted).map((r: Role) => ({ value: r.uid, label: r.name }));

    const [createUser] = useMutation(CREATE_USER);
    const [updateUser] = useMutation(UPDATE_USER);
    const [softDeleteUser] = useMutation(SOFT_DELETE_USER);
    const [restoreUser] = useMutation(RESTORE_USER);

    const meta = data?.users?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Update allUsers when data changes
    useEffect(() => {
        if (data?.users?.data) {
            let fetchedUsers = data.users.data;

            // If status filter is ACTIVE, ensure we only keep non-deleted and active users
            // Or if filter is INACTIVE, keep non-deleted and inactive.
            // However, the API *should* ideally handle this via the `status` variable passed to it.
            // But if the API returns mixed results or if we are doing client side logic:

            if (statusFilter === 'ACTIVE') {
                fetchedUsers = fetchedUsers.filter(u => !u.isDeleted && u.isActive);
            } else if (statusFilter === 'INACTIVE') {
                fetchedUsers = fetchedUsers.filter(u => !u.isDeleted && !u.isActive);
            }
            // If ALL, show everything (including deleted if API returns them)

            if (page === 1) {
                setAllUsers(fetchedUsers);
            } else {
                setAllUsers(prev => {
                    const existingIds = new Set(prev.map(u => u.uid));
                    const newUsers = fetchedUsers.filter(u => !existingIds.has(u.uid));
                    return [...prev, ...newUsers];
                });
            }
            setIsLoadingMore(false);
        }
    }, [data, page, statusFilter]);

    // // Toggle password visibility
    // const togglePasswordVisibility = (uid: string) => {
    //     setVisiblePasswords(prev => {
    //         const next = new Set(prev);
    //         if (next.has(uid)) {
    //             next.delete(uid);
    //         } else {
    //             next.add(uid);
    //         }
    //         return next;
    //     });
    // };

    // // Copy to clipboard
    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard.writeText(text);
    // };

    // Toggle user status (ACTIVE <-> INACTIVE)
    const toggleUserStatus = async (user: User) => {
        const newStatus = user.status === 'ACTIVE' ? 0 : 1;
        const newStatusString = newStatus === 1 ? 'ACTIVE' : 'INACTIVE';

        setAllUsers(prev =>
            prev.map(u => u.uid === user.uid ? { ...u, status: newStatusString } : u)
        );

        try {
            await updateUser({
                variables: {
                    uid: user.uid,
                    input: { status: newStatus }
                }
            });
        } catch (err) {
            setAllUsers(prev =>
                prev.map(u => u.uid === user.uid ? { ...u, status: user.status } : u)
            );
            console.error('Failed to update user status:', err);
        }
    };

    // Handle load more
    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
    };

    // Open delete modal
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmName('');
        setDeleteModalOpen(true);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!userToDelete || deleteConfirmName !== userToDelete.name) return;

        setIsDeleting(true);
        try {
            const { data } = await softDeleteUser({ variables: { uid: userToDelete.uid } });

            if (data?.softDeleteUser?.message) {
                toast.success(data.softDeleteUser.message);
            }

            setAllUsers(prev =>
                prev.map(u => u.uid === userToDelete.uid ? { ...u, isDeleted: true } : u)
            );
            setDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            toast.error(err.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    // Open Add User Modal
    const handleAddUser = () => {
        setModalMode('create');
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            number: '',
            roleUid: '',
        });
        setErrors({});
        setUserModalOpen(true);
    };

    // Open Permissions Modal
    const handleManagePermissions = (user: User) => {
        setSelectedUserForPermissions(user);
        setPermissionsModalOpen(true);
    };

    // Open Edit User Modal
    const handleEditUser = (user: User) => {
        setModalMode('edit');
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: user.password || '', // Prefill with actual password hash
            number: user.number || '',
            roleUid: user.roleUid || '',
        });
        setErrors({});
        setUserModalOpen(true);
    };

    // Handle Form Submit
    const handleUserSubmit = async () => {
        // Validation
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.number) newErrors.number = 'Phone number is required';
        if (!formData.roleUid) newErrors.roleUid = 'Role is required';

        if (modalMode === 'create') {
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.password) newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            let response;
            if (modalMode === 'create') {
                response = await createUser({
                    variables: {
                        input: {
                            name: formData.name,
                            email: formData.email,
                            password: formData.password,
                            number: formData.number,
                            roleUid: formData.roleUid,
                        }
                    }
                });
                if (response.data?.createUser?.message) {
                    toast.success(response.data.createUser.message);
                }
            } else {
                if (!editingUser) return;
                const updateInput: any = {
                    name: formData.name,
                    number: formData.number,
                    role_uid: formData.roleUid,
                };

                // Only update password if it has changed from the original (hash)
                if (formData.password && formData.password !== editingUser.password) {
                    updateInput.password = formData.password;
                }

                // Only send fields that changed or are relevant
                response = await updateUser({
                    variables: {
                        uid: editingUser.uid,
                        input: updateInput
                    }
                });
                if (response.data?.updateUser?.message) {
                    toast.success(response.data.updateUser.message);
                }
            }

            // Refresh list and close modal
            setUserModalOpen(false);
            await refetch();
        } catch (err: any) {
            console.error('Failed to save user:', err);
            toast.error(err.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Restore click handler - open modal
    const handleRestoreClick = (user: User) => {
        setUserToRestore(user);
        setRestoreModalOpen(true);
    };

    // Confirm restore
    const handleConfirmRestore = async () => {
        if (!userToRestore) return;

        setIsRestoring(true);
        try {
            const { data } = await restoreUser({ variables: { uid: userToRestore.uid } });

            if (data?.restoreUser?.message) {
                toast.success(data.restoreUser.message);
            }

            setAllUsers(prev =>
                prev.map(u => u.uid === userToRestore.uid ? { ...u, isDeleted: false } : u)
            );
            setRestoreModalOpen(false);
            setUserToRestore(null);
        } catch (err: any) {
            console.error('Failed to restore user:', err);
            toast.error(err.message || 'Failed to restore user');
        } finally {
            setIsRestoring(false);
        }
    };

    // Get User Permissions
    const accessibleMenus = useAccessibleMenus();
    const userPermissions = useMemo(() => {
        return accessibleMenus.find(menu => menu.menuCode === 'users') || { canCreate: false, canEdit: false, canDelete: false };
    }, [accessibleMenus]);

    // Column definitions
    const columns: Column<User>[] = [
        {
            key: 'name',
            header: 'Name',
            width: 'w-[120px]',
            render: (user) => <span className="text-foreground">{user.name || '-'}</span>,
        },
        {
            key: 'email',
            header: 'Email',
            width: 'w-[200px]',
            render: (user) => <span className="text-foreground">{user.email}</span>,
        },
        // {
        //     key: 'password',
        //     header: 'Password',
        //     width: 'w-[140px]',
        //     render: (user) => (
        //         <div className="flex items-center gap-2">
        //             <div className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg bg-white w-[100px] overflow-hidden">
        //                 <span className="text-foreground font-mono text-sm tracking-wider truncate">
        //                     {visiblePasswords.has(user.uid)
        //                         ? (user.password?.substring(0, 12) || '••••••••')
        //                         : '••••••••'}
        //                 </span>
        //             </div>
        //             <Tooltip content={visiblePasswords.has(user.uid) ? 'Hide password' : 'Show password'}>
        //                 <button
        //                     className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        //                     onClick={() => togglePasswordVisibility(user.uid)}
        //                 >
        //                     {visiblePasswords.has(user.uid) ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        //                 </button>
        //             </Tooltip>
        //             <Tooltip content="Copy password">
        //                 <button
        //                     className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        //                     onClick={() => copyToClipboard(user.password || '')}
        //                 >
        //                     <CopyIcon size={16} />
        //                 </button>
        //             </Tooltip>
        //         </div> // Close div
        //     ),
        // },
        //         </div>
        //     ),
        // },
        {
            key: 'role',
            header: 'Role',
            width: 'w-[100px]',
            render: (user) => (
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleBadgeClass(user.roleName)}`}>
                    {user.roleName || 'N/A'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            width: 'w-[80px]',
            render: (user) => {
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (userPermissions.canEdit) {
                                    toggleUserStatus(user);
                                }
                            }}
                            disabled={!userPermissions.canEdit}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${user.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-300'
                                } ${!userPermissions.canEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${user.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                        <StatusField type="user_status" value={user.status} mode="text" className="text-sm text-gray-700 dark:text-gray-300" />
                    </div>
                );
            },
        },
        {
            key: 'createdAt',
            header: 'Created on',
            width: 'w-[150px]',
            render: (user) => <span className="text-muted-foreground dark:text-gray-400">{formatDateTime(user.createdAt)}</span>,
        },
    ];

    // Add Manage Access column only if user has edit permissions
    if (userPermissions.canEdit) {
        columns.push({
            key: 'manageAccess',
            header: 'Manage Access',
            width: 'w-[180px]',
            render: (user) => <button
                className="inline-flex items-center gap-2 h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => handleManagePermissions(user)}
            >
                <ShieldCheckIcon size={16} />
                Manage Access
            </button>
        });
    }

    // Add Actions column only if user has create or delete permissions (or edit)
    if (userPermissions.canEdit || userPermissions.canDelete) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            width: 'w-[80px]',
            render: (user) => (
                <div className="flex items-center gap-2">
                    {user.isDeleted ? (
                        userPermissions.canDelete && ( // Restore usually considered 'delete' or 'edit', sticking to delete/edit logic or just check delete
                            <Tooltip content="Restore user">
                                <button
                                    className="p-2 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                    onClick={() => handleRestoreClick(user)}
                                >
                                    <RefreshCwIcon size={16} />
                                </button>
                            </Tooltip>
                        )
                    ) : (
                        <>
                            {userPermissions.canEdit && (
                                <Tooltip content="Edit user">
                                    <button
                                        className="p-2 border border-border dark:border-gray-700 rounded-lg bg-card dark:bg-gray-800 hover:bg-accent dark:hover:bg-gray-700 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-200 transition-colors"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        <PencilIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                            {userPermissions.canDelete && (
                                <Tooltip content="Delete user">
                                    <button
                                        className="p-2 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                        onClick={() => handleDeleteClick(user)}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            ),
        });
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">Manage user roles, access, and permissions</p>
                </div>
                {userPermissions.canCreate && (
                    <Button
                        leftIcon={<PlusIcon size={16} />}
                        onClick={handleAddUser}
                    >
                        Add User
                    </Button>
                )}
            </div>
            {/* Users Table */}
            <div className="p-5 bg-background dark:bg-card rounded-lg border border-border dark:border-border shadow-sm">
                {/* Filters and Search */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Select
                            options={filterRoleOptions}
                            value={roleFilter}
                            onChange={(val) => {
                                setAllUsers([]);
                                setPage(1);
                                setRoleFilter(val as string);
                            }}
                            placeholder="All Roles"
                            containerClassName="w-[180px]"
                        />
                        <StatusField
                            type="user_status"
                            mode="select"
                            showAllOption
                            value={statusFilter}
                            onChange={(val) => {
                                setAllUsers([]);
                                setPage(1);
                                setStatusFilter(val as 'ALL' | 'ACTIVE' | 'INACTIVE');
                            }}
                            placeholder="All"
                            className="w-[120px]"
                        />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            containerClassName="w-[30%]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {meta ? `Showing ${allUsers.length} out of ${meta.totalRecords} users` : 'Loading...'}
                    </p>
                </div>

                <DataTable
                    columns={columns}
                    data={allUsers}
                    rowKey={(user) => user.uid}
                    loading={loading}
                    error={error?.message}
                    emptyMessage='No users found. Click "Add User" to create one.'
                    loadingMessage="Loading users..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                />
            </div>

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
                            disabled={deleteConfirmName !== userToDelete?.name || isDeleting}
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
                        Type the name <span className="font-semibold text-foreground">{userToDelete?.name}</span> to delete this user.
                    </p>
                    <Input
                        placeholder="Enter user name"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && deleteConfirmName === userToDelete?.name) {
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
                        Are you sure you want to restore <span className="font-semibold text-foreground">{userToRestore?.name}</span>?
                        This will make the user visible and active again.
                    </p>
                </div>
            </Modal>

            {/* Create/Edit User Modal */}
            <Modal
                isOpen={userModalOpen}
                onClose={() => { setUserModalOpen(false); setErrors({}); }}
                title={modalMode === 'create' ? 'Add User' : 'Edit User'}
                size="md"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => { setUserModalOpen(false); setErrors({}); }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUserSubmit}
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                        >
                            {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Name <span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                placeholder="Full name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                error={errors.name}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Phone Number <span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                placeholder="+61..."
                                value={formData.number}
                                onChange={(e) => {
                                    // Allow only numbers and optional leading '+'
                                    const val = e.target.value;
                                    if (/^[\d+]*$/.test(val)) {
                                        setFormData(prev => ({ ...prev, number: val }));
                                        if (errors.number) setErrors(prev => ({ ...prev, number: '' }));
                                    }
                                }}
                                error={errors.number}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Email <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, email: e.target.value }));
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            error={errors.email}
                            disabled={modalMode === 'edit'} // Email usually non-editable or handled separately
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            type="password"
                            placeholder={modalMode === 'create' ? "Enter password" : "Enter new password"}
                            value={formData.password}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, password: e.target.value }));
                                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            error={errors.password}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Role <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            options={roleDropdownOptions}
                            value={formData.roleUid}
                            onChange={(val) => {
                                setFormData(prev => ({ ...prev, roleUid: val as string }));
                                if (errors.roleUid) setErrors(prev => ({ ...prev, roleUid: '' }));
                            }}
                            error={errors.roleUid}
                            placeholder="Select role"
                            containerClassName="w-full"
                        />
                    </div>
                </div>
            </Modal>

            {/* Permissions Modal */}
            {permissionsModalOpen && selectedUserForPermissions && (
                <UserPermissionsModal
                    isOpen={permissionsModalOpen}
                    onClose={() => setPermissionsModalOpen(false)}
                    user={selectedUserForPermissions}
                />
            )}
        </div>
    );
}
