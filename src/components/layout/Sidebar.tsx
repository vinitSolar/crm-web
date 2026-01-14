import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logo from '@/assets/main-logo-dark-1.png';
import { useAccessibleMenus } from '@/stores/useAuthStore';
import { CustomerIcon, RatesIcon, UserSettingIcon, FileTextIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, UserIcon, MailIcon } from '@/components/icons';
import { Tooltip } from '@/components/ui/Tooltip';

// Dashboard icon component (locally defined in Header originally)
const DashboardIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

// Icon mapping
const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
    customers: CustomerIcon,
    rates: RatesIcon,
    users: UserIcon, // Child 'users' gets simple user icon
    roles: ShieldCheckIcon,
    audit_logs: FileTextIcon,
    user_management: UserSettingIcon, // Parent gets the management icon
    email_templates: MailIcon,
};

// Path mapping
const pathMap: Record<string, string> = {
    dashboard: '/',
    customers: '/customers',
    rates: '/rates',
    users: '/users',
    roles: '/roles',
    audit_logs: '/audit-logs',
    email_templates: '/email-templates',
    // user_management has no path, it's a grouper
};

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    toggle?: () => void;
}

interface SidebarNavItemProps {
    children: React.ReactNode;
    title: string;
    isActive: boolean;
    isOpen: boolean;
    isChild?: boolean;
}

function SidebarNavItem({ children, title, isActive, isOpen, isChild }: SidebarNavItemProps) {
    const baseClasses = "flex items-center rounded-md font-medium transition-colors";
    const activeClasses = "bg-[hsla(82,100%,87%,1)] text-[hsla(82,67%,33%,1)]";
    const inactiveClasses = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

    const commonActiveStateClasses = isActive ? activeClasses : inactiveClasses;

    if (isOpen) {
        return (
            <div
                className={cn(
                    baseClasses,
                    "gap-3 text-sm",
                    isChild ? "pl-9 pr-3 py-2" : "px-3 py-2", // Indent children
                    commonActiveStateClasses
                )}
            >
                {children}
            </div>
        );
    }

    return (
        <Tooltip content={title} position="right">
            <div
                className={cn(
                    baseClasses,
                    "justify-center p-2 w-10 h-10",
                    commonActiveStateClasses
                )}
            >
                {children}
            </div>
        </Tooltip>
    );
}

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
};

export function Sidebar({ className, isOpen = true, toggle }: SidebarProps) {
    const accessibleMenus = useAccessibleMenus();
    const location = useLocation();

    // Track expanded parent menus
    // Initialize based on current URL to auto-expand
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const parentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const popoverRef = useRef<HTMLDivElement>(null);

    // Group menus
    const rootMenus = accessibleMenus.filter(m => !m.parentUid && m.menuCode !== 'dashboard');
    const getChildren = (parentUid: string) => accessibleMenus.filter(m => m.parentUid === parentUid);

    // Auto-expand parent if child is active
    useEffect(() => {
        const activeChild = accessibleMenus.find(m => {
            const path = pathMap[m.menuCode] || `/${m.menuCode}`;
            return location.pathname.startsWith(path) && path !== '/';
        });

        if (activeChild && activeChild.parentUid) {
            setExpandedMenus(prev => ({
                ...prev,
                [activeChild.parentUid!]: true
            }));
        }
    }, [location.pathname, accessibleMenus]);

    const toggleSubMenu = (uid: string) => {
        if (!isOpen) {
            // Popover mode
            if (activePopover === uid) {
                setActivePopover(null);
            } else {
                setActivePopover(uid);
            }
        } else {
            // Accordion mode
            setExpandedMenus(prev => ({ ...prev, [uid]: !prev[uid] }));
        }
    };

    // Close popover on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !Object.values(parentRefs.current).some(ref => ref?.contains(event.target as Node))
            ) {
                setActivePopover(null);
            }
        };

        if (activePopover) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopover]);

    // Close popover when sidebar expands
    useEffect(() => {
        if (isOpen) {
            setActivePopover(null);
        }
    }, [isOpen]);

    return (
        <aside className={cn(
            "bg-background border-r border-border flex flex-col hidden md:flex transition-all duration-300 relative group",
            isOpen ? "w-64" : "w-16 items-center",
            className
        )}>
            {/* Header / Logo Area */}
            <div className={cn(
                "h-14 flex items-center border-b border-border transition-all overflow-hidden",
                isOpen ? "px-4 justify-between" : "px-0 justify-center w-full"
            )}>
                {isOpen && <img src={logo} alt="Logo" className="h-8 transition-all" />}

                <button
                    onClick={toggle}
                    className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        isOpen ? "" : "w-10 h-10" // Larger touch target when collapsed
                    )}
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isOpen ? <ChevronLeftIcon size={18} /> : <ChevronRightIcon size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 overflow-y-auto py-4 space-y-1",
                isOpen ? "px-3" : "px-2 w-full flex flex-col items-center"
            )}>
                {/* Dashboard - Always visible */}
                <NavLink
                    to="/"
                    end
                >
                    {({ isActive }) => (
                        <SidebarNavItem title="Dashboard" isActive={isActive} isOpen={isOpen || false}>
                            <DashboardIcon
                                className={cn(
                                    "transition-all shrink-0",
                                    isActive ? "text-[hsla(82,67%,33%,1)]" : "text-[#4D4D4D]",
                                    isOpen ? "w-4 h-4" : "w-5 h-5"
                                )}
                            />
                            {isOpen && <span className="truncate">Dashboard</span>}
                        </SidebarNavItem>
                    )}
                </NavLink>

                {/* Dynamic menus */}
                {rootMenus.map((menu) => {
                    const children = getChildren(menu.menuUid);
                    const hasChildren = children.length > 0;
                    const IconComponent = iconMap[menu.menuCode];

                    // Simple item (Leaf)
                    if (!hasChildren) {
                        const path = pathMap[menu.menuCode] || `/${menu.menuCode}`;
                        return (
                            <NavLink
                                key={menu.menuUid}
                                to={path}
                            >
                                {({ isActive }) => (
                                    <SidebarNavItem title={menu.menuName} isActive={isActive} isOpen={isOpen || false}>
                                        {IconComponent && (
                                            <IconComponent
                                                size={isOpen ? 18 : 20}
                                                className={cn(
                                                    "transition-all shrink-0",
                                                    isActive ? "text-[hsla(82,67%,33%,1)]" : "text-[#4D4D4D]"
                                                )}
                                            />
                                        )}
                                        {isOpen && <span className="truncate">{menu.menuName}</span>}
                                    </SidebarNavItem>
                                )}
                            </NavLink>
                        );
                    }

                    // Parent item (Accordion)
                    const isExpanded = expandedMenus[menu.menuUid];
                    // Check if any child is active to highlight parent
                    const isChildActive = children.some(child => {
                        const childPath = pathMap[child.menuCode] || `/${child.menuCode}`;
                        return location.pathname.startsWith(childPath);
                    });

                    // If collapsed, we show parent as a button (or simplified)
                    if (!isOpen) {
                        const isPopoverOpen = activePopover === menu.menuUid;
                        return (
                            <div key={menu.menuUid} className="relative">
                                <Tooltip content={menu.menuName} position="right">
                                    <button
                                        ref={el => { parentRefs.current[menu.menuUid] = el; }}
                                        onClick={() => toggleSubMenu(menu.menuUid)}
                                        className={cn(
                                            "flex items-center justify-center p-2 w-10 h-10 rounded-md transition-colors",
                                            isChildActive || isPopoverOpen
                                                ? "bg-accent text-accent-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {IconComponent && <IconComponent size={20} />}
                                        <div className="absolute right-0.5 bottom-0.5 text-muted-foreground/60">
                                            <ChevronRightIcon size={10} strokeWidth={3} />
                                        </div>
                                    </button>
                                </Tooltip>

                                {/* Popover */}
                                {isPopoverOpen && (
                                    <Portal>
                                        <div
                                            ref={popoverRef}
                                            style={{
                                                position: 'fixed',
                                                top: parentRefs.current[menu.menuUid]?.getBoundingClientRect().top || 0,
                                                left: (parentRefs.current[menu.menuUid]?.getBoundingClientRect().right || 0) + 8,
                                                zIndex: 9999
                                            }}
                                            className="w-48 bg-white text-popover-foreground rounded-md border border-border shadow-md animate-in fade-in zoom-in-95 duration-200"
                                        >
                                            <div className="px-3 py-2 border-b border-border font-medium text-sm bg-muted/50 rounded-t-md">
                                                {menu.menuName}
                                            </div>
                                            <div className="p-1 flex flex-col gap-0.5">
                                                {children.map(child => {
                                                    const childPath = pathMap[child.menuCode] || `/${child.menuCode}`;
                                                    const ChildIcon = iconMap[child.menuCode];
                                                    return (
                                                        <NavLink
                                                            key={child.menuUid}
                                                            to={childPath}
                                                            onClick={() => setActivePopover(null)}
                                                            className={({ isActive }) => cn(
                                                                "flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors",
                                                                isActive
                                                                    ? "bg-[hsla(82,100%,87%,1)] text-[hsla(82,67%,33%,1)]"
                                                                    : "hover:bg-accent hover:text-accent-foreground"
                                                            )}
                                                        >
                                                            {({ isActive }) => (
                                                                <>
                                                                    {ChildIcon && (
                                                                        <ChildIcon
                                                                            size={16}
                                                                            className={cn(
                                                                                "transition-all shrink-0",
                                                                                isActive ? "text-[hsla(82,67%,33%,1)]" : "text-muted-foreground"
                                                                            )}
                                                                        />
                                                                    )}
                                                                    <span>{child.menuName}</span>
                                                                </>
                                                            )}
                                                        </NavLink>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Portal>
                                )}
                            </div>
                        );
                    }

                    // Expanded accordion
                    return (
                        <div key={menu.menuUid} className="space-y-1">
                            <button
                                onClick={() => toggleSubMenu(menu.menuUid)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isChildActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {IconComponent && (
                                        <IconComponent
                                            size={18}
                                            className={cn(isChildActive ? "text-foreground" : "text-[#4D4D4D]")}
                                        />
                                    )}
                                    <span className="truncate">{menu.menuName}</span>
                                </div>
                                <ChevronDownIcon
                                    size={16}
                                    className={cn(
                                        "transition-transform",
                                        isExpanded ? "transform rotate-180" : ""
                                    )}
                                />
                            </button>

                            {isExpanded && (
                                <div className="space-y-1">
                                    {children.map(child => {
                                        const childPath = pathMap[child.menuCode] || `/${child.menuCode}`;
                                        const ChildIcon = iconMap[child.menuCode];
                                        return (
                                            <NavLink
                                                key={child.menuUid}
                                                to={childPath}
                                            >
                                                {({ isActive }) => (
                                                    <SidebarNavItem
                                                        title={child.menuName}
                                                        isActive={isActive}
                                                        isOpen={isOpen}
                                                        isChild
                                                    >
                                                        {ChildIcon && (
                                                            <ChildIcon
                                                                size={18}
                                                                className={cn(
                                                                    "transition-all shrink-0",
                                                                    isActive ? "text-[hsla(82,67%,33%,1)]" : "text-[#4D4D4D]"
                                                                )}
                                                            />
                                                        )}
                                                        <span className="truncate">{child.menuName}</span>
                                                    </SidebarNavItem>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
