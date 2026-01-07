import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchIcon, ChevronRightIcon, ShieldCheckIcon, ShieldIcon, CloseIcon } from '@/components/icons';
import { GET_MENUS, GET_ROLE_PERMISSIONS, GET_USER_PERMISSIONS, UPSERT_USER_PERMISSION } from '@/graphql';
import { cn } from '@/lib/utils';

// Types
interface UserPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        uid: string;
        name: string;
        roleUid: string;
        roleName?: string;
    };
}

interface Menu {
    uid: string;
    name: string;
    code: string;
    parentUid?: string;
}

// Tri-state: null = inherit, true = allow, false = deny
type TriStateValue = boolean | null;

interface UserPermission {
    userUid: string;
    menuUid: string;
    canView: TriStateValue;
    canCreate: TriStateValue;
    canEdit: TriStateValue;
    canDelete: TriStateValue;
}

interface RolePermission {
    roleUid: string;
    menuUid: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

// Tri-state Toggle Component
const TriStateToggle = ({
    value,
    onChange,
    roleValue,
    label,
    disabled = false
}: {
    value: TriStateValue;
    onChange: (value: TriStateValue) => void;
    roleValue: boolean;
    label: string;
    disabled?: boolean;
}) => {
    // Determine effective value
    const effectiveValue = value === null ? roleValue : value;

    // Cycle through: Inherit -> Allow -> Deny -> Inherit
    const handleClick = () => {
        if (disabled) return;
        if (value === null) {
            // Currently inherit -> set to explicit allow
            onChange(true);
        } else if (value === true) {
            // Currently allow -> set to deny
            onChange(false);
        } else {
            // Currently deny -> reset to inherit
            onChange(null);
        }
    };

    // Visual states
    const getStateLabel = () => {
        if (value === null) return 'Inherited';
        if (value === true) return 'Allowed';
        return 'Denied';
    };

    const getStateColor = () => {
        if (value === null) return effectiveValue ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200';
        if (value === true) return 'bg-green-100 text-green-700 border-green-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getIndicatorColor = () => {
        if (value === null) return effectiveValue ? 'bg-blue-400' : 'bg-gray-300';
        if (value === true) return 'bg-green-500';
        return 'bg-red-500';
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium",
                getStateColor(),
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm"
            )}
        >
            <div className={cn("w-2 h-2 rounded-full", getIndicatorColor())} />
            <span>{label}</span>
            <span className="text-xs opacity-70">({getStateLabel()})</span>
        </button>
    );
};

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({ isOpen, onClose, user }) => {
    const [selectedMenuUid, setSelectedMenuUid] = useState<string | null>(null);
    const [userPermissionsMap, setUserPermissionsMap] = useState<Record<string, UserPermission>>({});
    const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, RolePermission>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [changedMenus, setChangedMenus] = useState<Set<string>>(new Set());

    // Fetch all menus
    const { data: menuData } = useQuery(GET_MENUS, {
        variables: { page: 1, limit: 1000 },
        skip: !isOpen,
    });

    // Fetch role permissions (baseline)
    const { data: rolePermissionData } = useQuery(GET_ROLE_PERMISSIONS, {
        variables: { roleUid: user.roleUid, limit: 1000 },
        skip: !isOpen || !user.roleUid,
        fetchPolicy: 'network-only'
    });

    // Fetch user-specific permissions (overrides)
    const { data: userPermissionData, refetch: refetchUserPermissions } = useQuery(GET_USER_PERMISSIONS, {
        variables: { userUid: user.uid },
        skip: !isOpen || !user.uid,
        fetchPolicy: 'network-only'
    });

    const [upsertUserPermission] = useMutation(UPSERT_USER_PERMISSION);

    // Initialize role permissions
    useEffect(() => {
        if (isOpen && rolePermissionData?.rolePermissions?.data) {
            const map: Record<string, RolePermission> = {};
            rolePermissionData.rolePermissions.data.forEach((p: any) => {
                map[p.menuUid] = {
                    roleUid: p.roleUid,
                    menuUid: p.menuUid,
                    canView: p.canView,
                    canCreate: p.canCreate,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                };
            });
            setRolePermissionsMap(map);
        }
    }, [rolePermissionData, isOpen]);

    // Initialize user permissions
    useEffect(() => {
        if (isOpen && userPermissionData?.userPermissions) {
            const map: Record<string, UserPermission> = {};
            userPermissionData.userPermissions.forEach((p: any) => {
                map[p.menuUid] = {
                    userUid: p.userUid,
                    menuUid: p.menuUid,
                    canView: p.canView,
                    canCreate: p.canCreate,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                };
            });
            setUserPermissionsMap(map);
        }
    }, [userPermissionData, isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setChangedMenus(new Set());
            setSearchQuery('');
            setSelectedMenuUid(null);
        }
    }, [isOpen]);

    const menus = useMemo(() => menuData?.menus?.data || [], [menuData]);

    const topLevelMenus = useMemo(() =>
        menus.filter((m: Menu) => !m.parentUid),
        [menus]);

    const getChildMenus = useCallback((parentUid: string) =>
        menus.filter((m: Menu) => m.parentUid === parentUid),
        [menus]);

    // Default Selection
    useEffect(() => {
        if (isOpen && topLevelMenus.length > 0 && !selectedMenuUid) {
            setSelectedMenuUid(topLevelMenus[0].uid);
        }
    }, [isOpen, topLevelMenus, selectedMenuUid]);

    // Get role permission for a menu (defaults to false)
    const getRolePermission = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'): boolean => {
        return rolePermissionsMap[menuUid]?.[field] ?? false;
    };

    // Get user permission override for a menu
    const getUserPermission = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'): TriStateValue => {
        return userPermissionsMap[menuUid]?.[field] ?? null;
    };

    // Get effective permission (user override > role)
    const getEffectivePermission = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'): boolean => {
        const userPerm = getUserPermission(menuUid, field);
        if (userPerm !== null) return userPerm;
        return getRolePermission(menuUid, field);
    };

    // Handle permission change
    const handlePermissionChange = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: TriStateValue) => {
        setUserPermissionsMap(prev => {
            const existing = prev[menuUid] || {
                userUid: user.uid,
                menuUid,
                canView: null,
                canCreate: null,
                canEdit: null,
                canDelete: null,
            };

            const updated = { ...existing, [field]: value };

            // Logic: if View is denied, deny all others
            if (field === 'canView' && value === false) {
                updated.canCreate = false;
                updated.canEdit = false;
                updated.canDelete = false;
            }

            // If Create/Edit/Delete is allowed, View must be allowed
            if (field !== 'canView' && value === true) {
                if (updated.canView === false || (updated.canView === null && !getRolePermission(menuUid, 'canView'))) {
                    updated.canView = true;
                }
            }

            return { ...prev, [menuUid]: updated };
        });

        setChangedMenus(prev => new Set(prev).add(menuUid));
    };

    // Select All - Set all permissions to explicitly allowed
    const handleSelectAll = () => {
        if (!selectedMenuUid) return;

        const menusToUpdate = [selectedMenuUid, ...currentChildMenus.map((m: Menu) => m.uid)];

        setUserPermissionsMap(prev => {
            const updated = { ...prev };
            menusToUpdate.forEach(menuUid => {
                updated[menuUid] = {
                    userUid: user.uid,
                    menuUid,
                    canView: true,
                    canCreate: true,
                    canEdit: true,
                    canDelete: true,
                };
            });
            return updated;
        });

        setChangedMenus(prev => {
            const newSet = new Set(prev);
            menusToUpdate.forEach(uid => newSet.add(uid));
            return newSet;
        });
    };

    // Clear - Reset all permissions to inherit from role (null)
    const handleClear = () => {
        if (!selectedMenuUid) return;

        const menusToUpdate = [selectedMenuUid, ...currentChildMenus.map((m: Menu) => m.uid)];

        setUserPermissionsMap(prev => {
            const updated = { ...prev };
            menusToUpdate.forEach(menuUid => {
                updated[menuUid] = {
                    userUid: user.uid,
                    menuUid,
                    canView: null,
                    canCreate: null,
                    canEdit: null,
                    canDelete: null,
                };
            });
            return updated;
        });

        setChangedMenus(prev => {
            const newSet = new Set(prev);
            menusToUpdate.forEach(uid => newSet.add(uid));
            return newSet;
        });
    };

    const currentChildMenus = useMemo(() => {
        if (!selectedMenuUid) return [];
        let children = getChildMenus(selectedMenuUid);
        if (searchQuery) {
            children = children.filter((m: Menu) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return children;
    }, [selectedMenuUid, getChildMenus, searchQuery]);

    const selectedMenuName = menus.find((m: Menu) => m.uid === selectedMenuUid)?.name;

    // Save changes
    const handleSave = async () => {
        if (changedMenus.size === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            // Save each changed menu permission
            for (const menuUid of changedMenus) {
                const perm = userPermissionsMap[menuUid];
                if (perm) {
                    await upsertUserPermission({
                        variables: {
                            input: {
                                userUid: user.uid,
                                menuUid,
                                canView: perm.canView,
                                canCreate: perm.canCreate,
                                canEdit: perm.canEdit,
                                canDelete: perm.canDelete,
                            }
                        }
                    });
                }
            }

            toast.success('User permissions updated successfully');
            await refetchUserPermissions();
            onClose();
        } catch (error: any) {
            console.error('Failed to save permissions:', error);
            toast.error(error.message || 'Failed to save permissions');
        } finally {
            setIsSaving(false);
        }
    };

    // Reset - Discard all changes and reload from server
    const handleReset = () => {
        setChangedMenus(new Set());
        // Reinitialize from server data
        if (userPermissionData?.userPermissions) {
            const map: Record<string, UserPermission> = {};
            userPermissionData.userPermissions.forEach((p: any) => {
                map[p.menuUid] = {
                    userUid: p.userUid,
                    menuUid: p.menuUid,
                    canView: p.canView,
                    canCreate: p.canCreate,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                };
            });
            setUserPermissionsMap(map);
        } else {
            setUserPermissionsMap({});
        }
    };

    // Check if menu has any user override
    const hasOverride = (menuUid: string): boolean => {
        const perm = userPermissionsMap[menuUid];
        if (!perm) return false;
        return perm.canView !== null || perm.canCreate !== null || perm.canEdit !== null || perm.canDelete !== null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            fullContent={true}
            showCloseButton={false}
            className="w-[90vw] max-w-[1200px] h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white"
        >
            <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 bg-white shadow-sm z-10 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheckIcon className="text-[#5c8a14]" /> User Access Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure specific access for <span className="font-semibold text-gray-900">{user.name}</span>
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs">Overrides role permissions</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Role</span>
                            <div className="h-4 w-px bg-gray-300 mx-1"></div>
                            <span className="text-sm font-medium text-gray-800">{user.roleName || 'User'}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <CloseIcon size={20} />
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="px-8 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-6 text-xs">
                    <span className="font-semibold text-gray-500">LEGEND:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-gray-600">Inherited from role</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600">Explicitly allowed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-600">Explicitly denied</span>
                    </div>
                </div>

                {/* Main Split View */}
                <div className="flex-1 overflow-hidden flex bg-gray-50/50">

                    {/* Sidebar: Navigation */}
                    <div className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Modules</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-3 space-y-1 custom-scrollbar">
                            {topLevelMenus.map((menu: Menu) => {
                                const isSelected = selectedMenuUid === menu.uid;
                                const hasAccess = getEffectivePermission(menu.uid, 'canView');
                                const hasUserOverride = hasOverride(menu.uid);

                                return (
                                    <div
                                        key={menu.uid}
                                        onClick={() => setSelectedMenuUid(menu.uid)}
                                        className={cn(
                                            "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                                            isSelected
                                                ? "bg-[#5c8a14]/10 border-[#5c8a14]/20 text-[#5c8a14]"
                                                : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {/* Status Dot */}
                                            <div className={cn(
                                                "w-2 h-2 rounded-full transition-colors shrink-0",
                                                hasAccess ? "bg-[#5c8a14]" : "bg-gray-300"
                                            )} />
                                            <span className="font-semibold text-sm truncate">{menu.name}</span>
                                            {hasUserOverride && (
                                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded">CUSTOM</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {isSelected && <ChevronRightIcon size={16} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                        {/* Toolbar */}
                        <div className="p-4 px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/60 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {selectedMenuName}
                            </h3>
                            <div className="relative w-72">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Search sub-menus..."
                                    className="pl-10 bg-white border-gray-200 focus:border-[#5c8a14] focus:ring-[#5c8a14]/20 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {selectedMenuUid ? (
                                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">

                                    {/* Parent Permission Card */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#5c8a14]/10 rounded-lg text-[#5c8a14]">
                                                    <ShieldIcon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Module Access Control</h4>
                                                    <p className="text-sm text-gray-500">Click to cycle: Inherited → Allowed → Denied</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    Allow All
                                                </button>
                                                <button
                                                    onClick={handleClear}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Reset to Inherit
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {(['canView', 'canEdit', 'canCreate', 'canDelete'] as const).map((field) => {
                                                const labels: Record<string, string> = {
                                                    canView: 'View',
                                                    canEdit: 'Edit',
                                                    canCreate: 'Create',
                                                    canDelete: 'Delete'
                                                };

                                                return (
                                                    <TriStateToggle
                                                        key={field}
                                                        value={getUserPermission(selectedMenuUid, field)}
                                                        onChange={(val) => handlePermissionChange(selectedMenuUid, field, val)}
                                                        roleValue={getRolePermission(selectedMenuUid, field)}
                                                        label={labels[field]}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* Role baseline info */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-400">
                                                Role baseline:
                                                {' '}View: {getRolePermission(selectedMenuUid, 'canView') ? '✓' : '✗'}
                                                {' | '}Edit: {getRolePermission(selectedMenuUid, 'canEdit') ? '✓' : '✗'}
                                                {' | '}Create: {getRolePermission(selectedMenuUid, 'canCreate') ? '✓' : '✗'}
                                                {' | '}Delete: {getRolePermission(selectedMenuUid, 'canDelete') ? '✓' : '✗'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub-menus */}
                                    {currentChildMenus.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Sub-Menus</span>
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {currentChildMenus.map((child: Menu) => (
                                                    <div key={child.uid} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={cn(
                                                                        "w-2 h-8 rounded-full",
                                                                        getEffectivePermission(child.uid, 'canView') ? "bg-[#5c8a14]" : "bg-gray-200"
                                                                    )}
                                                                ></div>
                                                                <span className="font-bold text-gray-800">{child.name}</span>
                                                                {hasOverride(child.uid) && (
                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded">CUSTOM</span>
                                                                )}
                                                            </div>

                                                            <div className="flex gap-3">
                                                                {(['canView', 'canEdit', 'canCreate', 'canDelete'] as const).map((field) => {
                                                                    const labels: Record<string, string> = {
                                                                        canView: 'View',
                                                                        canEdit: 'Edit',
                                                                        canCreate: 'Add',
                                                                        canDelete: 'Delete'
                                                                    };

                                                                    return (
                                                                        <TriStateToggle
                                                                            key={field}
                                                                            value={getUserPermission(child.uid, field)}
                                                                            onChange={(val) => handlePermissionChange(child.uid, field, val)}
                                                                            roleValue={getRolePermission(child.uid, field)}
                                                                            label={labels[field]}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <ShieldIcon size={64} className="mb-4 text-gray-200" />
                                    <p className="font-medium">Select a module to configure permissions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50 z-20 shrink-0">
                    <div className="text-sm text-gray-500 flex items-center gap-3">
                        {changedMenus.size > 0 && (
                            <>
                                <span className="text-orange-600 font-medium">
                                    {changedMenus.size} menu(s) with unsaved changes
                                </span>
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                    Reset
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || changedMenus.size === 0}
                            isLoading={isSaving}
                            loadingText="Saving..."
                            className="bg-[#5c8a14] hover:bg-[#4a7010] text-white shadow-lg shadow-[#5c8a14]/20 px-8"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
