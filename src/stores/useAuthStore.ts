import { create } from 'zustand';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';
import { apolloClient } from '@/lib/apollo';
import { GET_ME } from '@/graphql/queries/auth';

// Accessible menu type from API
export interface AccessibleMenu {
    menuUid: string;
    menuName: string;
    menuCode: string;
    parentUid: string | null;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

// Full user info from API
export interface UserInfo {
    id: string;
    uid: string;
    email: string;
    name: string | null;
    number: string | null;
    tenant: string;
    roleUid: string | null;
    roleName: string | null;
    status: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    accessibleMenus: AccessibleMenu[];
}

interface AuthState {
    // User data
    user: UserInfo | null;
    accessibleMenus: AccessibleMenu[];

    // Tokens
    token: string | null;
    refreshToken: string | null;

    // State flags
    isAuthenticated: boolean;
    isLoading: boolean;
    hasFetched: boolean;

    // Actions
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => void;
    updateTokens: (accessToken: string, refreshToken: string) => void;
    hydrate: () => Promise<void>;
    fetchUser: () => Promise<void>;

    // Permission helpers
    hasMenuAccess: (menuCode: string) => boolean;
    canViewMenu: (menuCode: string) => boolean;
    canCreateInMenu: (menuCode: string) => boolean;
    canEditInMenu: (menuCode: string) => boolean;
    canDeleteInMenu: (menuCode: string) => boolean;
    setUser: (user: UserInfo) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    accessibleMenus: [],
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    hasFetched: false,

    // Login - stores tokens and fetches user data
    login: async (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({ token: accessToken, refreshToken, isAuthenticated: true });
        await get().fetchUser();
    },

    // Logout - clears everything
    logout: () => {
        clearTokens();
        apolloClient.clearStore();
        set({
            user: null,
            accessibleMenus: [],
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            hasFetched: false,
        });
    },

    // Update tokens (for refresh)
    updateTokens: (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({ token: accessToken, refreshToken });
    },

    // Hydrate from localStorage on app startup
    hydrate: async () => {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (accessToken) {
            set({ token: accessToken, refreshToken, isAuthenticated: true });
            // Fetch user data if we have a token
            await get().fetchUser();
        }
    },

    // Fetch current user data from API (called once)
    fetchUser: async () => {
        const { token, hasFetched, isLoading } = get();

        // Don't fetch if no token, already fetched, or currently loading
        if (!token || hasFetched || isLoading) return;

        set({ isLoading: true });

        try {
            const { data } = await apolloClient.query({
                query: GET_ME,
                fetchPolicy: 'network-only',
            });

            if (data?.me) {
                const user = data.me as UserInfo;
                set({
                    user,
                    accessibleMenus: user.accessibleMenus || [],
                    hasFetched: true,
                    isLoading: false,
                });
            } else {
                // No user data - clear auth
                get().logout();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            set({ isLoading: false, hasFetched: true });
            // If 401, clear auth
            get().logout();
        }
    },

    // Helper: Check if user has access to a menu by code
    hasMenuAccess: (menuCode: string) => {
        const menu = get().accessibleMenus.find(m => m.menuCode === menuCode);
        return menu?.canView ?? false;
    },

    // Permission helpers
    canViewMenu: (menuCode: string) => {
        const menu = get().accessibleMenus.find(m => m.menuCode === menuCode);
        return menu?.canView ?? false;
    },

    canCreateInMenu: (menuCode: string) => {
        const menu = get().accessibleMenus.find(m => m.menuCode === menuCode);
        return menu?.canCreate ?? false;
    },

    canEditInMenu: (menuCode: string) => {
        const menu = get().accessibleMenus.find(m => m.menuCode === menuCode);
        return menu?.canEdit ?? false;
    },

    canDeleteInMenu: (menuCode: string) => {
        const menu = get().accessibleMenus.find(m => m.menuCode === menuCode);
        return menu?.canDelete ?? false;
    },

    setUser: (user: UserInfo) => {
        set({ user });
    },
}));

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useAccessibleMenus = () => useAuthStore((state) => state.accessibleMenus);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
