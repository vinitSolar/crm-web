import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ForbiddenPage } from '@/pages/ForbiddenPage';

interface ProtectedRouteProps {
    children: React.ReactNode;
    menuCode?: string; // Optional: required menu code for access
}

export function ProtectedRoute({ children, menuCode }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, accessibleMenus, hasFetched } = useAuthStore();
    const location = useLocation();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Still loading user data - show loading spinner
    if (isLoading || !hasFetched) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If menuCode is specified, check if user has access
    if (menuCode) {
        const hasAccess = accessibleMenus.some(
            menu => menu.menuCode === menuCode && menu.canView
        );

        if (!hasAccess) {
            return <ForbiddenPage />;
        }
    }

    return <>{children}</>;
}
