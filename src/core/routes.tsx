// Route definitions with lazy loading for code splitting
import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Outlet, useSearchParams } from 'react-router-dom';
import { ProtectedRoute, RequirePermission } from '@/components/auth';
import { MainLayout } from '@/components/layout';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('@/pages/user/UsersPage').then(m => ({ default: m.UsersPage })));
const CustomersPage = lazy(() => import('@/pages/customer/CustomersPage').then(m => ({ default: m.CustomersPage })));
const CustomerFormPage = lazy(() => import('@/pages/customer/CustomerFormPage').then(m => ({ default: m.CustomerFormPage })));
const RatesPage = lazy(() => import('@/pages/rates/RatesPage').then(m => ({ default: m.RatesPage })));
const OfferAccessPage = lazy(() => import('@/pages/OfferAccessPage').then(m => ({ default: m.OfferAccessPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const RolePage = lazy(() => import('@/pages/role/RolePage').then(m => ({ default: m.RolePage })));
const AuditLogsPage = lazy(() => import('@/pages/logs/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const EmailTemplatesPage = lazy(() => import('@/pages/email/EmailTemplatesPage').then(m => ({ default: m.EmailTemplatesPage })));

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const RootRouteHandler = () => {
    const [searchParams] = useSearchParams();
    if (searchParams.get('offer')) {
        return <OfferAccessPage />;
    }
    return (
        <ProtectedRoute>
            <MainLayout>
                <DashboardPage />
            </MainLayout>
        </ProtectedRoute>
    );
};

const LayoutWithSuspense = () => (
    <Suspense fallback={<PageLoader />}>
        <Outlet />
    </Suspense>
);

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<LayoutWithSuspense />}>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root handler for Offer Page (public) vs Dashboard (protected) */}
            <Route path="/" element={<RootRouteHandler />} />

            {/* Other protected routes - single ProtectedRoute wrapper with MainLayout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                {/* Dashboard route is now handled by RootRouteHandler at '/' */}

                {/* Routes with specific menu permissions */}
                <Route path="/customers" element={<RequirePermission menuCode="customers"><CustomersPage /></RequirePermission>} />
                <Route path="/customers/new" element={<RequirePermission menuCode="customers"><CustomerFormPage /></RequirePermission>} />
                <Route path="/customers/:uid" element={<RequirePermission menuCode="customers"><CustomerFormPage /></RequirePermission>} />
                <Route path="/users" element={<RequirePermission menuCode="users"><UsersPage /></RequirePermission>} />
                <Route path="/roles" element={<RequirePermission menuCode="roles"><RolePage /></RequirePermission>} />
                <Route path="/rates" element={<RequirePermission menuCode="rates"><RatesPage /></RequirePermission>} />
                <Route path="/audit-logs" element={<RequirePermission menuCode="audit_logs"><AuditLogsPage /></RequirePermission>} />
                <Route path="/email-templates" element={<EmailTemplatesPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

export function AppRoutes() {
    return <RouterProvider router={router} />;
}

