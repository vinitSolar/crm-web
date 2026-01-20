// App constants
export const APP_NAME = 'CRM Web';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    CUSTOMERS: {
        LIST: '/customers',
        DETAIL: (id: string) => `/customers/${id}`,
    },
    RATES: {
        LIST: '/rates',
        DETAIL: (id: string) => `/rates/${id}`,
    },
    USERS: {
        LIST: '/users',
        DETAIL: (id: string) => `/users/${id}`,
    },
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    CUSTOMERS: '/customers',
    RATES: '/rates',
    USERS: '/users',
    SETTINGS: '/settings',
} as const;

// --- Domain Constants ---

// Customer Status
export const CUSTOMER_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Draft', color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300' },
    1: { label: 'Initial Offer', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
    2: { label: 'Signature Pending', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' },
    3: { label: 'Signed', color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' },
    4: { label: 'Frozen', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' },
};

export const CUSTOMER_STATUS_OPTIONS = Object.entries(CUSTOMER_STATUS_MAP).map(([k, v]) => ({
    value: k,
    label: v.label
}));

export const CUSTOMER_LEGACY_STATUS_MAP: Record<string, string> = {
    'ACTIVE': 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
    'INACTIVE': 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
    'LEAD': 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
};

// User Status
export const USER_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

export const USER_FILTER_STATUS_OPTIONS = [
    { value: 'ALL', label: 'All' },
    ...USER_STATUS_OPTIONS,
];

// DNSP (Distributors)
// DNSP (Distributors)
export const DNSP_MAP: Record<string, string> = {
    '0': 'Ausgrid',
    '1': 'Endeavour',
    '2': 'Essential',
    '3': 'Evoenergy',
};

export const DNSP_OPTIONS = [
    { value: '0', label: 'Ausgrid' },
    { value: '1', label: 'Endeavour' },
    { value: '2', label: 'Essential' },
    { value: '3', label: 'Evoenergy' },
];
export const DISCOUNT_OPTIONS = [0, 5, 7, 10, 13, 15].map(i => ({
    value: i.toString(),
    label: `${i}%`
}));

export const VPP_OPTIONS = [
    { value: '1', label: 'With VPP' },
    { value: '0', label: 'Without VPP' },
];

export const VPP_CONNECTED_OPTIONS = [
    { value: '0', label: 'Pending' },
    { value: '1', label: 'Done' },
];

export const ULTIMATE_STATUS_OPTIONS = [
    { value: '1', label: 'Approved' },
    { value: '0', label: 'Pending' },
];

export const MSAT_CONNECTED_OPTIONS = [
    { value: '1', label: 'Connected' },
    { value: '0', label: 'Not Connected' },
];
export const RATE_TYPE_MAP: Record<string, string> = {
    '0': 'Business',
    '1': 'Residential',
};

export const RATE_TYPE_OPTIONS = [
    { value: '0', label: 'Business' },
    { value: '1', label: 'Residential' },
];

// Australian States
export const AUS_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'ACT', 'TAS', 'NT'];

export const STATE_OPTIONS = AUS_STATES.map(s => ({ value: s, label: s }));

// ID Types
export const ID_TYPE_MAP: Record<number, string> = {
    0: 'Licence',
    1: 'Medicare',
    2: 'Passport',
};

export const ID_TYPE_OPTIONS = [
    { value: '0', label: 'Licence' },
    { value: '1', label: 'Medicare' },
    { value: '2', label: 'Passport' },
];

// Sale Types
export const SALE_TYPE_LABELS: Record<number, string> = {
    0: 'Transfer',
    1: 'Move-in',
    2: 'Recontract',
};

// Billing Preferences
export const BILLING_PREF_LABELS: Record<number, string> = {
    0: 'eBill (Email)',
    1: 'SMS',
    2: 'Post',
};

// DNSP (Distributors) - Merged with existing if needed, but for now specific to the user request
export const DNSP_LABELS: Record<number, string> = {
    0: 'Ausgrid',
    1: 'Endeavour',
    2: 'Essential',
    3: 'Evoenergy',
};

// --- Options Helpers (derived from labels) ---

export const SALE_TYPE_OPTIONS = Object.entries(SALE_TYPE_LABELS).map(([value, label]) => ({
    value: value,
    label,
}));

export const BILLING_PREF_OPTIONS = Object.entries(BILLING_PREF_LABELS).map(([value, label]) => ({
    value: value,
    label,
}));

// --- Email Constants ---

// Email Status
export const EMAIL_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
    1: { label: 'Sent', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
    2: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    3: { label: 'Verified', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
};

export const EMAIL_STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: '0', label: 'Pending' },
    { value: '1', label: 'Sent' },
    { value: '2', label: 'Failed' },
    { value: '3', label: 'Verified' },
];

// Email Types
export const EMAIL_TYPE_LABELS: Record<string, string> = {
    CUSTOMER_CREATED: 'Customer Created',
    SIGNATURE_REQUEST: 'Signature Request',
    PASSWORD_RESET: 'Password Reset',
    ACCOUNT_VERIFICATION: 'Account Verification',
    REMINDER: 'Reminder',
    BULK_EMAIL: 'Bulk Email',
    AGREEMENT_SIGNED: 'Agreement Signed',
};

export const EMAIL_TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'CUSTOMER_CREATED', label: 'Customer Created' },
    { value: 'REMINDER', label: 'Reminder' },
    { value: 'BULK_EMAIL', label: 'Bulk Email' },
    { value: 'AGREEMENT_SIGNED', label: 'Agreement Signed' },
    { value: 'SIGNATURE_REQUEST', label: 'Signature Request' },
    { value: 'PASSWORD_RESET', label: 'Password Reset' },
    { value: 'ACCOUNT_VERIFICATION', label: 'Account Verification' },
];
