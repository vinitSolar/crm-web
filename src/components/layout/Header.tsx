import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logo from '@/assets/main-logo-dark-1.png';
import { useAccessibleMenus, useUser, useAuthStore } from '@/stores/useAuthStore';
import { CustomerIcon, RatesIcon, UserSettingIcon, LogOutIcon, MenuIcon, XIcon, ChevronDownIcon, FileTextIcon, ShieldCheckIcon, LockIcon } from '@/components/icons';


interface HeaderProps {
    className?: string;
    isSidebarCollapsed?: boolean;
}

// Dashboard icon component
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

// Icon mapping by menu code - using React components
const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
    customers: CustomerIcon,
    rates: RatesIcon,
    users: UserSettingIcon,
    roles: ShieldCheckIcon,
    audit_logs: FileTextIcon,
};

// Path mapping by menu code
const pathMap: Record<string, string> = {
    dashboard: '/',
    customers: '/customers',
    rates: '/rates',
    users: '/users',
    audit_logs: '/audit-logs',
};

export function Header({ className, isSidebarCollapsed }: HeaderProps) {
    const accessibleMenus = useAccessibleMenus();
    const user = useUser();
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            {/* Dashboard - Always visible */}
            <NavLink
                to="/"
                end
                onClick={() => mobile && setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                        ? "bg-[hsla(82,100%,87%,1)] text-[hsla(82,67%,33%,1)]"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    mobile && "w-full"
                )}
            >
                {({ isActive }) => (
                    <>
                        <DashboardIcon
                            className={cn(
                                "w-4 h-4 transition-all",
                                isActive ? "text-[hsla(82,67%,33%,1)]" : "text-[#4D4D4D]"
                            )}
                        />
                        <span>Dashboard</span>
                    </>
                )}
            </NavLink>

            {/* Dynamic menus from API */}
            {accessibleMenus
                .filter(menu => menu.canView && menu.menuCode !== 'dashboard')
                .map((menu) => {
                    const path = pathMap[menu.menuCode] || `/${menu.menuCode}`;
                    const IconComponent = iconMap[menu.menuCode];

                    return (
                        <NavLink
                            key={menu.menuUid}
                            to={path}
                            onClick={() => mobile && setMobileMenuOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[hsla(82,100%,87%,1)] text-[hsla(82,67%,33%,1)]"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                mobile && "w-full"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {IconComponent && (
                                        <IconComponent
                                            size={16}
                                            className={cn(
                                                "transition-all",
                                                isActive ? "text-[hsla(82,67%,33%,1)]" : "text-[#4D4D4D]"
                                            )}
                                        />
                                    )}
                                    <span>{menu.menuName}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
        </>
    );

    return (
        <header className={cn(
            "h-14 border-b border-border bg-background flex items-center px-4",
            className
        )}>
            {/* Better Implementation of Logo Visibility */}
            <div className={cn(
                "items-center mr-4",
                // Mobile: Always visible
                "flex md:hidden",
                // Desktop: Visible ONLY if collapsed
                isSidebarCollapsed && "md:flex"
            )}>
                <img src={logo} alt="Logo" className="h-8" />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* User Menu */}
            <div className="relative">
                <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {getInitials(user?.name)}
                    </div>
                    {/* Name - hidden on mobile */}
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                        {user?.name || 'User'}
                    </span>
                    <ChevronDownIcon size={16} className="text-muted-foreground hidden sm:block" />
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setUserDropdownOpen(false)}
                        />
                        {/* Menu */}
                        <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-lg shadow-lg z-50 py-1">
                            <div className="px-3 py-2 border-b border-border">
                                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigate('/change-password');
                                    setUserDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                            >
                                <LockIcon size={16} />
                                <span>Change Password</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOutIcon size={16} />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
                {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-14 left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden">
                    <nav className="flex flex-col p-4 gap-1">
                        <NavItems mobile />
                    </nav>
                </div>
            )}


        </header>
    );
}
