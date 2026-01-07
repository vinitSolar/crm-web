import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date based on user's browser timezone
 * Users in India will see IST, Australia will see AEST/AEDT, etc.
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

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    const { includeTime = true, format = 'datetime' } = options || {};

    // User's browser timezone is automatically used
    if (format === 'short') {
        return date.toLocaleDateString();
    }

    if (format === 'long') {
        return date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    // Default: datetime format
    if (includeTime) {
        return date.toLocaleString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }

    return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

/**
 * Format time only based on user's browser timezone
 */
export const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 */
export const formatRelativeTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return formatDate(dateStr, { includeTime: false });
};
