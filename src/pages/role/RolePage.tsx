import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
// import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { DataTable, type Column, Modal, StatusField } from '@/components/common';
import { PlusIcon, PencilIcon, TrashIcon, RefreshCwIcon, ShieldCheckIcon } from '@/components/icons';
import { GET_ROLES, CREATE_ROLE, UPDATE_ROLE, SOFT_DELETE_ROLE, RESTORE_ROLE } from '@/graphql';
import { formatDateTime } from '@/lib/date';
import { RolePermissionsModal } from '@/components/roles/RolePermissionsModal';
import { useAuthStore } from '@/stores/useAuthStore';

// Types
interface Role {
    uid: string;
    name: string;
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
}

interface RolesResponse {
    roles: {
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
        data: Role[];
    };
}

export function RolePage() {
    // Permissions
    const canCreate = useAuthStore((state) => state.canCreateInMenu('roles'));
    const canEdit = useAuthStore((state) => state.canEditInMenu('roles'));
    const canDelete = useAuthStore((state) => state.canDeleteInMenu('roles'));

    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Modal States
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Restore Modal State
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [roleToRestore, setRoleToRestore] = useState<Role | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    // Permissions Modal State
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);

    const limit = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchQuery) {
                setAllRoles([]);
                setPage(1);
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    // Query
    const { data, loading, error, refetch } = useQuery<RolesResponse>(GET_ROLES, {
        variables: {
            page,
            limit,
            // search: debouncedSearch || undefined // API might not support search on roles yet, but let's assume or handle client side if needed. 
            // Note: Schema doesn't show search param for roles(page, limit). Clientside filtering might be needed if API doesn't support it.
            // Update: We checked GET_ROLES query and it was `roles(page: 1, limit: 100)`. Schema says `roles(page: Int, limit: Int): PaginatedRoles!`.
            // So search is NOT supported by API for roles.
        },
        fetchPolicy: 'network-only',
    });

    // Mutations
    const [createRole] = useMutation(CREATE_ROLE);
    const [updateRole] = useMutation(UPDATE_ROLE);
    const [softDeleteRole] = useMutation(SOFT_DELETE_ROLE);
    const [restoreRole] = useMutation(RESTORE_ROLE);

    const meta = data?.roles?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Update allRoles
    useEffect(() => {
        if (data?.roles?.data) {
            let fetchedRoles = data.roles.data;

            // Client-side filtering since API doesn't support search
            if (debouncedSearch) {
                // This logic only filters "fetched" roles. For proper search we need API support or fetch all.
                // Given pagination, client-side search is imperfect. But acceptable if list is small.
            }

            if (page === 1) {
                setAllRoles(fetchedRoles);
            } else {
                setAllRoles(prev => {
                    const existingIds = new Set(prev.map(r => r.uid));
                    const newRoles = fetchedRoles.filter(r => !existingIds.has(r.uid));
                    return [...prev, ...newRoles];
                });
            }
            setIsLoadingMore(false);
        }
    }, [data, page, debouncedSearch]);

    // Handle Client-Side Search Filtering for Display
    const displayedRoles = allRoles.filter(role => {
        const matchesSearch = !debouncedSearch ||
            role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'ACTIVE') {
            matchesStatus = !role.isDeleted && role.isActive;
        } else if (statusFilter === 'INACTIVE') {
            matchesStatus = !role.isDeleted && !role.isActive;
        }

        return matchesSearch && matchesStatus;
    });


    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
    };

    // Form Handling
    const handleAddRole = () => {
        setModalMode('create');
        setEditingRole(null);
        setFormData({ name: '', description: '', isActive: true });
        setErrors({});
        setRoleModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setModalMode('edit');
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            isActive: role.isActive
        });
        setErrors({});
        setRoleModalOpen(true);
    };

    const handleSubmit = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Role name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            if (modalMode === 'create') {
                const { data } = await createRole({
                    variables: {
                        input: {
                            name: formData.name,
                            description: formData.description,
                        }
                    }
                });
                if (data?.createRole) {
                    toast.success('Role created successfully');
                }
            } else {
                if (!editingRole) return;
                const { data } = await updateRole({
                    variables: {
                        uid: editingRole.uid,
                        input: {
                            name: formData.name,
                            description: formData.description,
                            isActive: formData.isActive
                        }
                    }
                });
                if (data?.updateRole) {
                    toast.success('Role updated successfully');
                }
            }
            setRoleModalOpen(false);
            await refetch();
        } catch (err: any) {
            console.error('Failed to save role:', err);
            toast.error(err.message || 'Failed to save role');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Handling
    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setDeleteConfirmName('');
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete || deleteConfirmName !== roleToDelete.name) return;

        setIsDeleting(true);
        try {
            await softDeleteRole({ variables: { uid: roleToDelete.uid } });
            toast.success('Role deleted successfully');
            setDeleteModalOpen(false);
            setRoleToDelete(null);

            // Optimistically update
            setAllRoles(prev => prev.map(r => r.uid === roleToDelete.uid ? { ...r, isDeleted: true } : r));

        } catch (err: any) {
            console.error('Failed to delete role:', err);
            toast.error(err.message || 'Failed to delete role');
        } finally {
            setIsDeleting(false);
        }
    };

    // Restore Handling
    const handleRestoreClick = (role: Role) => {
        setRoleToRestore(role);
        setRestoreModalOpen(true);
    };

    const handleConfirmRestore = async () => {
        if (!roleToRestore) return;
        setIsRestoring(true);
        try {
            await restoreRole({ variables: { uid: roleToRestore.uid } });
            toast.success('Role restored successfully');
            setRestoreModalOpen(false);
            setRoleToRestore(null);

            // Optimistically update
            setAllRoles(prev => prev.map(r => r.uid === roleToRestore.uid ? { ...r, isDeleted: false } : r));

        } catch (err: any) {
            console.error('Failed to restore role:', err);
            toast.error(err.message || 'Failed to restore role');
        } finally {
            setIsRestoring(false);
        }
    };

    // Manage Permissions
    const handleManagePermissions = (role: Role) => {
        setSelectedRoleForPermissions(role);
        setPermissionsModalOpen(true);
    };

    // Handle Status Toggle
    const handleStatusToggle = async (role: Role, isActive: boolean) => {
        try {
            const { data } = await updateRole({
                variables: {
                    uid: role.uid,
                    input: {
                        isActive: isActive
                    }
                }
            });

            if (data?.updateRole) {
                toast.success(`Role ${isActive ? 'activated' : 'deactivated'} successfully`);
                // Optimistic update
                setAllRoles(prev => prev.map(r => r.uid === role.uid ? { ...r, isActive } : r));
            }
        } catch (err: any) {
            console.error('Failed to update role status:', err);
            toast.error(err.message || 'Failed to update role status');
        }
    };

    const columns: Column<Role>[] = [
        // Actions column - only show if user has edit or delete permissions
        ...((canEdit || canDelete) ? [{
            key: 'actions',
            header: 'Actions',
            width: 'w-[100px]',
            render: (role: Role) => (
                <div className="flex items-center gap-2">
                    {role.isDeleted ? (
                        canEdit && (
                            <Tooltip content="Restore Role">
                                <button
                                    className="p-2 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                                    onClick={() => handleRestoreClick(role)}
                                >
                                    <RefreshCwIcon size={16} />
                                </button>
                            </Tooltip>
                        )
                    ) : (
                        <>
                            {canEdit && (
                                <Tooltip content="Edit Role">
                                    <button
                                        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                                        onClick={() => handleEditRole(role)}
                                    >
                                        <PencilIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                            {canDelete && (
                                <Tooltip content="Delete Role">
                                    <button
                                        className="p-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                                        onClick={() => handleDeleteClick(role)}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            )
        }] : []),
        {
            key: 'name',
            header: 'Role Name',
            width: 'w-[200px]',
            render: (role) => <span className="font-medium text-foreground">{role.name}</span>
        },
        {
            key: 'description',
            header: 'Description',
            width: 'w-[300px]',
            render: (role) => <span className="text-muted-foreground">{role.description || '-'}</span>
        },
        {
            key: 'status',
            header: 'Status',
            width: 'w-[100px]',
            render: (role) => (
                role.isDeleted ? (
                    <StatusField
                        type="user_status"
                        value='INACTIVE'
                        mode="text"
                        className="text-red-500"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={role.isActive}
                            onChange={(checked) => canEdit && handleStatusToggle(role, checked)}
                            disabled={!canEdit}
                            className={role.isActive ? "bg-[#5c8a14]" : "bg-gray-200"}
                        />
                        <span className={`text-sm ${role.isActive ? 'text-[#5c8a14]' : 'text-gray-500'}`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                )
            )
        },
        {
            key: 'createdAt',
            header: 'Created On',
            width: 'w-[150px]',
            render: (role) => <span className="text-muted-foreground">{formatDateTime(role.createdAt)}</span>
        },
        // Access Control column - only show if user has edit permissions
        ...(canEdit ? [{
            key: 'permissions',
            header: 'Access Control',
            width: 'w-[150px]',
            render: (role: Role) => (
                !role.isDeleted && (
                    <button
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#5c8a14] bg-[#5c8a14]/10 border border-[#5c8a14]/20 rounded-md hover:bg-[#5c8a14]/20 transition-colors"
                        onClick={() => handleManagePermissions(role)}
                    >
                        <ShieldCheckIcon size={14} />
                        Manage Access
                    </button>
                )
            )
        }] : [])
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Role Management
                    </h1>
                    <p className="text-muted-foreground">Manage system roles and their permissions</p>
                </div>
                {canCreate && (
                    <Button
                        leftIcon={<PlusIcon size={16} />}
                        onClick={handleAddRole}
                    >
                        Add Role
                    </Button>
                )}
            </div>

            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <StatusField
                        type="user_status"
                        mode="select"
                        showAllOption
                        value={statusFilter === 'ALL' ? '' : statusFilter}
                        onChange={(val) => setStatusFilter(val ? (val as 'ACTIVE' | 'INACTIVE') : 'ALL')}
                        placeholder="All"
                        className="w-[120px]"
                    />
                    <Input
                        type="search"
                        placeholder="Search roles..."
                        containerClassName="w-[30%]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={displayedRoles}
                    rowKey={(role) => role.uid}
                    loading={loading}
                    error={error?.message}
                    emptyMessage="No roles found."
                    loadingMessage="Loading roles..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={modalMode === 'create' ? 'Add new role' : 'Edit role'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} isLoading={isSubmitting}>
                            {modalMode === 'create' ? 'Create Role' : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role Name <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="e.g. Sales Manager"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }));
                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                            }}
                            error={errors.name}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            placeholder="Description of the role scope"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    {modalMode === 'edit' && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm deletion"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirmName !== roleToDelete?.name || isDeleting}
                            isLoading={isDeleting}
                        >
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Type the name <span className="font-semibold text-foreground">{roleToDelete?.name}</span> to delete this role.
                    </p>
                    <Input
                        placeholder="Enter role name"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && deleteConfirmName === roleToDelete?.name) {
                                handleConfirmDelete();
                            }
                        }}
                    />
                </div>
            </Modal>

            {/* Restore Modal */}
            <Modal
                isOpen={restoreModalOpen}
                onClose={() => setRestoreModalOpen(false)}
                title="Confirm restoration"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRestoreModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmRestore} isLoading={isRestoring}>Restore</Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to restore <span className="font-semibold text-foreground">{roleToRestore?.name}</span>?
                </p>
            </Modal>

            {/* Permissions Modal */}
            {permissionsModalOpen && selectedRoleForPermissions && (
                <RolePermissionsModal
                    isOpen={permissionsModalOpen}
                    onClose={() => setPermissionsModalOpen(false)}
                    role={{
                        uid: selectedRoleForPermissions.uid,
                        name: selectedRoleForPermissions.name,
                    }}
                />
            )}
        </div>
    );
}
