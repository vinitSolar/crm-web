import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { ChevronRightIcon, ShieldCheckIcon, ShieldIcon, CloseIcon, ZapIcon } from '@/components/icons';
import { GET_MENUS, GET_ROLE_PERMISSIONS, GET_USER_PERMISSIONS, UPSERT_USER_PERMISSION, GET_FEATURES, GET_ROLE_FEATURE_PERMISSIONS, GET_USER_FEATURE_PERMISSIONS, UPSERT_USER_FEATURE_PERMISSION } from '@/graphql';
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

interface Feature {
    uid: string;
    name: string;
    code: string;
    description?: string;
    menuUid: string;
}

interface UserFeaturePermission {
    userUid: string;
    featureUid: string;
    isEnabled: TriStateValue;
}

interface RoleFeaturePermission {
    roleUid: string;
    featureUid: string;
    isEnabled: boolean;
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
        if (value === null) return effectiveValue ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        if (value === true) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50';
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50';
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

    // Feature states
    const [userFeaturePermissionsMap, setUserFeaturePermissionsMap] = useState<Record<string, UserFeaturePermission>>({});
    const [initialUserFeaturePermissionsMap, setInitialUserFeaturePermissionsMap] = useState<Record<string, UserFeaturePermission>>({});
    const [roleFeaturePermissionsMap, setRoleFeaturePermissionsMap] = useState<Record<string, RoleFeaturePermission>>({});
    const [featuresMap, setFeaturesMap] = useState<Record<string, Feature[]>>({}); // menuUid -> features

    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial state storage for accurate change tracking
    const [initialUserPermissionsMap, setInitialUserPermissionsMap] = useState<Record<string, UserPermission>>({});


    // Fetch all menus
    const { data: menuData, loading: menusLoading } = useQuery(GET_MENUS, {
        variables: { page: 1, limit: 1000 },
        skip: !isOpen,
    });

    // Fetch role permissions (baseline)
    const { data: rolePermissionData, loading: roleLoading } = useQuery(GET_ROLE_PERMISSIONS, {
        variables: { roleUid: user.roleUid, limit: 1000 },
        skip: !isOpen || !user.roleUid,
        fetchPolicy: 'network-only'
    });

    // Fetch user-specific permissions (overrides)
    const { data: userPermissionData, loading: userPermLoading, refetch: refetchUserPermissions } = useQuery(GET_USER_PERMISSIONS, {
        variables: { userUid: user.uid },
        skip: !isOpen || !user.uid,
        fetchPolicy: 'network-only'
    });

    // Combined loading state
    const isLoading = menusLoading || roleLoading || userPermLoading;

    // Fetch features for specific menu when selected
    const { data: featureData } = useQuery(GET_FEATURES, {
        variables: { menuUid: selectedMenuUid },
        skip: !selectedMenuUid,
        fetchPolicy: 'network-only'
    });

    // Fetch Role Feature Permissions
    const { data: roleFeatureData } = useQuery(GET_ROLE_FEATURE_PERMISSIONS, {
        variables: { roleUid: user.roleUid },
        skip: !isOpen || !user.roleUid,
    });

    // Fetch User Feature Permissions
    const { data: userFeatureData, refetch: refetchUserFeaturePermissions } = useQuery(GET_USER_FEATURE_PERMISSIONS, {
        variables: { userUid: user.uid },
        skip: !isOpen || !user.uid,
    });

    const [upsertUserPermission] = useMutation(UPSERT_USER_PERMISSION);
    const [upsertUserFeaturePermission] = useMutation(UPSERT_USER_FEATURE_PERMISSION);

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
            setInitialUserPermissionsMap(map);
        }
    }, [userPermissionData, isOpen]);

    // Initialize Feature Logic
    useEffect(() => {
        if (selectedMenuUid && featureData?.features) {
            setFeaturesMap(prev => ({
                ...prev,
                [selectedMenuUid]: featureData.features
            }));
        }
    }, [featureData, selectedMenuUid]);

    useEffect(() => {
        if (roleFeatureData?.roleFeaturePermissions) {
            const map: Record<string, RoleFeaturePermission> = {};
            roleFeatureData.roleFeaturePermissions.forEach((p: any) => {
                map[p.featureUid] = {
                    roleUid: p.roleUid,
                    featureUid: p.featureUid,
                    isEnabled: p.isEnabled
                };
            });
            setRoleFeaturePermissionsMap(map);
        }
    }, [roleFeatureData]);

    useEffect(() => {
        if (userFeatureData?.userFeaturePermissions) {
            const map: Record<string, UserFeaturePermission> = {};
            userFeatureData.userFeaturePermissions.forEach((p: any) => {
                map[p.featureUid] = {
                    userUid: p.userUid,
                    featureUid: p.featureUid,
                    isEnabled: p.isEnabled
                };
            });
            setUserFeaturePermissionsMap(map);
            setInitialUserFeaturePermissionsMap(map);
        }
    }, [userFeatureData]);


    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedMenuUid(null);
        }
    }, [isOpen]);

    // Compute changed items by comparing with initial state
    const changedMenus = useMemo(() => {
        const changed = new Set<string>();

        // Check all currently modified menus
        const allMenuUids = new Set([...Object.keys(userPermissionsMap), ...Object.keys(initialUserPermissionsMap)]);

        allMenuUids.forEach(uid => {
            const current = userPermissionsMap[uid];
            const initial = initialUserPermissionsMap[uid];

            if (!current && !initial) return;

            // If one exists but not the other, it's changed (unless both effectively null)
            if (!current || !initial) {
                const effective = current || initial;
                if (effective.canView !== null || effective.canCreate !== null || effective.canEdit !== null || effective.canDelete !== null) {
                    changed.add(uid);
                }
                return;
            }

            // Compare fields
            if (
                current.canView !== initial.canView ||
                current.canCreate !== initial.canCreate ||
                current.canEdit !== initial.canEdit ||
                current.canDelete !== initial.canDelete
            ) {
                changed.add(uid);
            }
        });

        return changed;
    }, [userPermissionsMap, initialUserPermissionsMap]);

    const changedFeatures = useMemo(() => {
        const changed = new Set<string>();

        const allFeatureUids = new Set([...Object.keys(userFeaturePermissionsMap), ...Object.keys(initialUserFeaturePermissionsMap)]);

        allFeatureUids.forEach(uid => {
            const current = userFeaturePermissionsMap[uid];
            const initial = initialUserFeaturePermissionsMap[uid];

            if (!current && !initial) return;

            if (!current || !initial) {
                const effective = current || initial;
                if (effective.isEnabled !== null) {
                    changed.add(uid);
                }
                return;
            }

            if (current.isEnabled !== initial.isEnabled) {
                changed.add(uid);
            }
        });

        return changed;
    }, [userFeaturePermissionsMap, initialUserFeaturePermissionsMap]);

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
    };

    // Feature Permission Logic
    const getRoleFeaturePermission = (featureUid: string): boolean => {
        return roleFeaturePermissionsMap[featureUid]?.isEnabled ?? false;
    };

    const getUserFeaturePermission = (featureUid: string): TriStateValue => {
        return userFeaturePermissionsMap[featureUid]?.isEnabled ?? null;
    };

    const handleFeaturePermissionChange = (featureUid: string, value: TriStateValue) => {
        setUserFeaturePermissionsMap(prev => ({
            ...prev,
            [featureUid]: {
                userUid: user.uid,
                featureUid,
                isEnabled: value
            }
        }));
    };


    // Select All - Set all permissions to explicitly allowed
    const handleSelectAll = () => {
        if (!selectedMenuUid) return;

        setUserPermissionsMap(prev => {
            const updated = { ...prev };

            // Handle Parent
            const isParentWithChildren = currentChildMenus.length > 0;
            updated[selectedMenuUid] = {
                userUid: user.uid,
                menuUid: selectedMenuUid,
                canView: true,
                canCreate: isParentWithChildren ? null : true,
                canEdit: isParentWithChildren ? null : true,
                canDelete: isParentWithChildren ? null : true,
            };

            // Handle Children
            currentChildMenus.forEach((m: Menu) => {
                updated[m.uid] = {
                    userUid: user.uid,
                    menuUid: m.uid,
                    canView: true,
                    canCreate: true,
                    canEdit: true,
                    canDelete: true,
                };
            });

            return updated;
        });

        // Also handle features
        if (currentFeatures.length > 0) {
            setUserFeaturePermissionsMap(prev => {
                const updated = { ...prev };
                currentFeatures.forEach(f => {
                    updated[f.uid] = {
                        userUid: user.uid,
                        featureUid: f.uid,
                        isEnabled: true
                    };
                });
                return updated;
            });
        }
    };

    // Clear - Reset all permissions to inherit from role (null)
    const handleClear = () => {
        if (!selectedMenuUid) return;

        setUserPermissionsMap(prev => {
            const updated = { ...prev };

            // Reset Parent
            updated[selectedMenuUid] = {
                userUid: user.uid,
                menuUid: selectedMenuUid,
                canView: null,
                canCreate: null,
                canEdit: null,
                canDelete: null,
            };

            // Reset Children
            currentChildMenus.forEach((m: Menu) => {
                updated[m.uid] = {
                    userUid: user.uid,
                    menuUid: m.uid,
                    canView: null,
                    canCreate: null,
                    canEdit: null,
                    canDelete: null,
                };
            });

            return updated;
        });

        // Clear features
        if (currentFeatures.length > 0) {
            setUserFeaturePermissionsMap(prev => {
                const updated = { ...prev };
                currentFeatures.forEach(f => {
                    updated[f.uid] = {
                        userUid: user.uid,
                        featureUid: f.uid,
                        isEnabled: null
                    };
                });
                return updated;
            });
        }
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

            // Save changed feature permissions
            for (const featureUid of changedFeatures) {
                const perm = userFeaturePermissionsMap[featureUid];
                if (perm) {
                    await upsertUserFeaturePermission({
                        variables: {
                            input: {
                                userUid: user.uid,
                                featureUid,
                                isEnabled: perm.isEnabled
                            }
                        }
                    });
                }
            }

            toast.success('User permissions updated successfully');
            await refetchUserPermissions();
            await refetchUserFeaturePermissions();
            onClose();

        } catch (error: any) {
            console.error('Failed to save permissions:', error);
            toast.error(error.message || 'Failed to save permissions');
        } finally {
            setIsSaving(false);
        }
    };

    // Features for the selected menu
    const currentFeatures = useMemo(() => {
        if (!selectedMenuUid) return [];
        return featuresMap[selectedMenuUid] || [];
    }, [selectedMenuUid, featuresMap]);


    // Reset - Discard all changes and restore initial maps
    const handleReset = () => {
        setUserPermissionsMap(initialUserPermissionsMap);
        setUserFeaturePermissionsMap(initialUserFeaturePermissionsMap);
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
            className="w-[90vw] max-w-[1200px] h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl bg-white dark:bg-gray-950 border dark:border-gray-800"
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-16 bg-white dark:bg-gray-950">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c8a14]" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading permissions...</p>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-white dark:bg-gray-950">
                    {/* Header */}
                    <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm z-10 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShieldCheckIcon className="text-[#5c8a14] dark:text-[#7ab321]" /> User Access Management
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Configure specific access for <span className="font-semibold text-gray-900 dark:text-gray-200">{user.name}</span>
                                <span className="ml-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs">Overrides role permissions</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Base Role</span>
                                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.roleName || 'User'}</span>
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
                    <div className="px-8 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-6 text-xs">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">LEGEND:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-gray-600 dark:text-gray-300">Inherited from role</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                            <span className="text-gray-600 dark:text-gray-300">Explicitly allowed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
                            <span className="text-gray-600 dark:text-gray-300">Explicitly denied</span>
                        </div>
                    </div>

                    {/* Main Split View */}
                    <div className="flex-1 overflow-hidden flex bg-gray-50/50 dark:bg-gray-900/50">

                        {/* Sidebar: Navigation */}
                        <div className="w-[260px] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
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
                                                    ? "bg-[#5c8a14]/10 dark:bg-[#5c8a14]/20 border-[#5c8a14]/20 text-[#5c8a14] dark:text-[#7ab321]"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
                                                    <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded">CUSTOM</span>
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
                        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-900/30">
                            {/* Toolbar */}
                            <div className="p-4 px-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    {selectedMenuName}
                                </h3>
                                {/* <div className="relative w-72">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        placeholder="Search sub-menus..."
                                        className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-[#5c8a14] focus:ring-[#5c8a14]/20 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div> */}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {selectedMenuUid ? (
                                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">

                                        {/* Parent Permission Card */}
                                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#5c8a14]/10 dark:bg-[#5c8a14]/20 rounded-lg text-[#5c8a14] dark:text-[#7ab321]">
                                                        <ShieldIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">Module Access Control</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to cycle: Inherited → Allowed → Denied</p>
                                                    </div>
                                                </div>
                                                {currentChildMenus.length === 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleSelectAll}
                                                            className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            Allow All
                                                        </button>
                                                        <button
                                                            onClick={handleClear}
                                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                        >
                                                            Reset to Inherit
                                                        </button>
                                                    </div>
                                                )}
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
                                                        <TriStateToggle
                                                            key={field}
                                                            value={getUserPermission(selectedMenuUid, field)}
                                                            onChange={(val) => handlePermissionChange(selectedMenuUid, field, val)}
                                                            roleValue={getRolePermission(selectedMenuUid, field)}
                                                            label={labels[field]}
                                                        />
                                                    ));
                                                })()}
                                            </div>

                                            {/* Role baseline info */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-xs text-gray-400">
                                                    Role baseline:
                                                    {' '}View: {getRolePermission(selectedMenuUid, 'canView') ? '✓' : '✗'}
                                                    {' | '}Edit: {getRolePermission(selectedMenuUid, 'canEdit') ? '✓' : '✗'}
                                                    {' | '}Create: {getRolePermission(selectedMenuUid, 'canCreate') ? '✓' : '✗'}
                                                    {' | '}Delete: {getRolePermission(selectedMenuUid, 'canDelete') ? '✓' : '✗'}
                                                </p>
                                            </div>
                                        </div>



                                        {/* Features Section */}
                                        {currentFeatures.length > 0 && (
                                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                                        <ZapIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">Feature Access</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Granular control for specific features within this module</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {currentFeatures.map(feature => (
                                                        <div key={feature.uid} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                                                            <div>
                                                                <p className="font-medium text-gray-800 dark:text-gray-200">{feature.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description || feature.code}</p>
                                                            </div>
                                                            <TriStateToggle
                                                                value={getUserFeaturePermission(feature.uid)}
                                                                onChange={(val) => handleFeaturePermissionChange(feature.uid, val)}
                                                                roleValue={getRoleFeaturePermission(feature.uid)}
                                                                label={getUserFeaturePermission(feature.uid) === true ? 'Allowed' : (getUserFeaturePermission(feature.uid) === false ? 'Denied' : (getRoleFeaturePermission(feature.uid) ? 'Inherit (Allow)' : 'Inherit (Deny)'))}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub-menus */}
                                        {currentChildMenus.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Sub-Menus</span>
                                                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <button
                                                            onClick={handleSelectAll}
                                                            className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            Allow All
                                                        </button>
                                                        <button
                                                            onClick={handleClear}
                                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                        >
                                                            Reset to Inherit
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    {currentChildMenus.map((child: Menu) => (
                                                        <div key={child.uid} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={cn(
                                                                            "w-2 h-8 rounded-full",
                                                                            getEffectivePermission(child.uid, 'canView') ? "bg-[#5c8a14] dark:bg-[#7ab321]" : "bg-gray-200 dark:bg-gray-700"
                                                                        )}
                                                                    ></div>
                                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{child.name}</span>
                                                                    {hasOverride(child.uid) && (
                                                                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded">CUSTOM</span>
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
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                        <ShieldIcon size={64} className="mb-4 text-gray-200 dark:text-gray-800" />
                                        <p className="font-medium">Select a module to configure permissions</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 z-20 shrink-0">
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                            {changedMenus.size > 0 && (
                                <>
                                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                                        {changedMenus.size + changedFeatures.size} item(s) with unsaved changes
                                    </span>

                                    <button
                                        onClick={handleReset}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
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
                                disabled={isSaving || (changedMenus.size === 0 && changedFeatures.size === 0)}
                                isLoading={isSaving}

                                loadingText="Saving..."
                                className="bg-[#5c8a14] hover:bg-[#4a7010] text-white shadow-lg shadow-[#5c8a14]/20 px-8"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )
            }
        </Modal >
    );
};
