// Auth utilities - common functions for token management

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set both tokens in localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user has a valid access token
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}
