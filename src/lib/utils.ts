import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDateTime, formatDate as formatDateOnly, formatTime as formatTimeOnly, fromNow } from './date';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date based on configured timezone (delegates to date.ts)
 * @param dateStr - ISO date string from API
 * @param options - Format options
 */
export const formatDate = (
    dateStr: string | null | undefined,
    options?: {
        includeTime?: boolean;
        format?: 'short' | 'long' | 'datetime';
    }
) => {
    if (!dateStr) return '—';

    const { includeTime = true, format = 'datetime' } = options || {};

    if (format === 'short') {
        return formatDateOnly(dateStr);
    }

    // For 'long' format, we can extend date.ts later if needed, 
    // for now map to standard date format
    if (format === 'long') {
        return formatDateOnly(dateStr, 'DD MMMM YYYY');
    }

    if (includeTime) {
        return formatDateTime(dateStr);
    }

    return formatDateOnly(dateStr);
};

/**
 * Format time only based on configured timezone
 */
export const formatTime = (dateStr: string | null | undefined) => {
    return formatTimeOnly(dateStr);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return fromNow(dateStr);
};
