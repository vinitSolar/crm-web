import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchIcon, ChevronRightIcon, ShieldCheckIcon, ShieldIcon, CloseIcon } from '@/components/icons';
import { GET_MENUS, GET_ROLE_PERMISSIONS, UPDATE_PERMISSIONS } from '@/graphql';
import { cn } from '@/lib/utils';

// Types
import type { Menu, RolePermission, RolePermissionsModalProps } from '@/types';

// Simple Boolean Toggle Component for Role Permissions
const PermissionToggle = ({
    value,
    onChange,
    label,
    disabled = false
}: {
    value: boolean;
    onChange: (value: boolean) => void;
    label: string;
    disabled?: boolean;
}) => {
    const handleClick = () => {
        if (!disabled) {
            onChange(!value);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium",
                value
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm"
            )}
        >
            <div className={cn("w-2 h-2 rounded-full", value ? "bg-green-500" : "bg-gray-300")} />
            <span>{label}</span>
            <span className="text-xs opacity-70">({value ? 'Enabled' : 'Disabled'})</span>
        </button>
    );
};

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ isOpen, onClose, role }) => {
    const [selectedMenuUid, setSelectedMenuUid] = useState<string | null>(null);
    const [permissionsMap, setPermissionsMap] = useState<Record<string, RolePermission>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [changedMenus, setChangedMenus] = useState<Set<string>>(new Set());

    // Fetch all menus
    const { data: menuData } = useQuery(GET_MENUS, {
        variables: { page: 1, limit: 1000 },
        skip: !isOpen,
    });

    // Fetch role permissions
    const { data: rolePermissionData, refetch: refetchPermissions } = useQuery(GET_ROLE_PERMISSIONS, {
        variables: { roleUid: role.uid, limit: 1000 },
        skip: !isOpen || !role.uid,
        fetchPolicy: 'network-only'
    });

    const [updatePermissions] = useMutation(UPDATE_PERMISSIONS);

    // Initialize permissions from server
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
            setPermissionsMap(map);
        }
    }, [rolePermissionData, isOpen]);

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

    // Get permission for a menu (defaults to false)
    const getPermission = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'): boolean => {
        return permissionsMap[menuUid]?.[field] ?? false;
    };

    // Handle permission change
    const handlePermissionChange = (menuUid: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: boolean) => {
        const children = getChildMenus(menuUid);
        const hasChildren = children.length > 0;

        setPermissionsMap(prev => {
            const newMap = { ...prev };

            const updateSingle = (uid: string, f: typeof field, v: boolean) => {
                const existing = newMap[uid] || {
                    roleUid: role.uid,
                    menuUid: uid,
                    canView: false,
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                };

                const updated = { ...existing, [f]: v };

                // Logic: if View is disabled, disable all others
                if (f === 'canView' && !v) {
                    updated.canCreate = false;
                    updated.canEdit = false;
                    updated.canDelete = false;
                }

                // If Create/Edit/Delete is enabled, View must be enabled
                if (f !== 'canView' && v) {
                    updated.canView = true;
                }

                newMap[uid] = updated;
            };

            // Update the target menu
            updateSingle(menuUid, field, value);

            // If we are enabling View for a parent, enable View for all children
            if (hasChildren && field === 'canView' && value === true) {
                children.forEach((child: Menu) => {
                    updateSingle(child.uid, 'canView', true);
                });
            }

            return newMap;
        });

        setChangedMenus(prev => {
            const newSet = new Set(prev);
            newSet.add(menuUid);
            if (hasChildren && field === 'canView' && value === true) {
                children.forEach((c: Menu) => newSet.add(c.uid));
            }
            return newSet;
        });
    };

    // Select All permissions for current module and its sub-menus
    const handleSelectAll = () => {
        if (!selectedMenuUid) return;

        const menusToUpdate = [selectedMenuUid, ...currentChildMenus.map((m: Menu) => m.uid)];

        setPermissionsMap(prev => {
            const updated = { ...prev };
            menusToUpdate.forEach(menuUid => {
                updated[menuUid] = {
                    roleUid: role.uid,
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

    // Clear all permissions for current module and its sub-menus
    const handleClear = () => {
        if (!selectedMenuUid) return;

        const menusToUpdate = [selectedMenuUid, ...currentChildMenus.map((m: Menu) => m.uid)];

        setPermissionsMap(prev => {
            const updated = { ...prev };
            menusToUpdate.forEach(menuUid => {
                updated[menuUid] = {
                    roleUid: role.uid,
                    menuUid,
                    canView: false,
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
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
            const permissionsToUpdate = Array.from(changedMenus).map(menuUid => {
                const perm = permissionsMap[menuUid];
                return {
                    roleUid: role.uid,
                    menuUid,
                    canView: perm?.canView ?? false,
                    canCreate: perm?.canCreate ?? false,
                    canEdit: perm?.canEdit ?? false,
                    canDelete: perm?.canDelete ?? false,
                };
            });

            await updatePermissions({
                variables: {
                    input: permissionsToUpdate
                }
            });

            toast.success('Role permissions updated successfully');
            await refetchPermissions();
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
        if (rolePermissionData?.rolePermissions?.data) {
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
            setPermissionsMap(map);
        }
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
                            <ShieldCheckIcon className="text-[#5c8a14]" /> Role Access Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure base permissions for role <span className="font-semibold text-gray-900">{role.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
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
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600">Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-gray-600">Disabled</span>
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
                                const hasAccess = getPermission(menu.uid, 'canView');

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
                                                    <p className="text-sm text-gray-500">Click to toggle permission on/off</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    onClick={handleClear}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {(() => {
                                                const allFields = ['canView', 'canEdit', 'canCreate', 'canDelete'] as const;
                                                // If parent has submenus, only allow 'canView'
                                                const availableFields = currentChildMenus.length > 0
                                                    ? ['canView'] as const
                                                    : allFields;

                                                const labels: Record<string, string> = {
                                                    canView: 'View',
                                                    canEdit: 'Edit',
                                                    canCreate: 'Create',
                                                    canDelete: 'Delete'
                                                };

                                                return availableFields.map((field) => (
                                                    <PermissionToggle
                                                        key={field}
                                                        value={getPermission(selectedMenuUid, field)}
                                                        onChange={(val) => handlePermissionChange(selectedMenuUid, field as any, val)}
                                                        label={labels[field]}
                                                    />
                                                ));
                                            })()}
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
                                                                        getPermission(child.uid, 'canView') ? "bg-[#5c8a14]" : "bg-gray-200"
                                                                    )}
                                                                ></div>
                                                                <span className="font-bold text-gray-800">{child.name}</span>
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
                                                                        <PermissionToggle
                                                                            key={field}
                                                                            value={getPermission(child.uid, field)}
                                                                            onChange={(val) => handlePermissionChange(child.uid, field, val)}
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
