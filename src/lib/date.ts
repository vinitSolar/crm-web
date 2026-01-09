// Date utilities with timezone support using dayjs
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// ============================================================
// Timezone Configuration
// ============================================================

// Default timezone - can be overridden by user preference from DB/API
const DEFAULT_TIMEZONE = 'Australia/Sydney';

// This function can be enhanced to fetch timezone from user settings/API
// For now it returns the default, but structure allows future DB integration
let userTimezone: string | null = null;

/**
 * Set the user's timezone (call this after fetching from API/DB)
 * @param tz - IANA timezone string (e.g., 'Asia/Kolkata', 'Australia/Sydney')
 */
export function setUserTimezone(tz: string): void {
    userTimezone = tz;
}

/**
 * Get the current timezone to use
 * Returns user's timezone if set, otherwise falls back to DEFAULT_TIMEZONE
 */
export function getUserTimezone(): string {
    return userTimezone || DEFAULT_TIMEZONE;
}

// ============================================================
// Date Formatting Functions
// ============================================================

/**
 * Format a date for display (date only, no time)
 * @param date - Date string, Date object, or null
 * @param format - Display format (default: 'DD/MM/YYYY')
 */
export function formatDate(
    date: Date | string | null | undefined,
    format: string = 'DD/MM/YYYY'
): string {
    if (!date) return '-';
    return dayjs(date).tz(getUserTimezone()).format(format);
}

/**
 * Format a datetime for display with AM/PM
 * @param date - Date string, Date object, or null
 * @param format - Display format (default: 'DD/MM/YYYY, hh:mm A')
 */
export function formatDateTime(
    date: Date | string | null | undefined,
    format: string = 'DD/MM/YYYY, hh:mm A'
): string {
    if (!date) return '-';
    return dayjs(date).tz(getUserTimezone()).format(format);
}

/**
 * Format a time for display in the configured timezone
 * @param date - Date string, Date object, or null
 * @param format - Display format (default: 'hh:mm A')
 */
export function formatTime(
    date: Date | string | null | undefined,
    format: string = 'hh:mm A'
): string {
    if (!date) return '-';
    return dayjs(date).tz(getUserTimezone()).format(format);
}

// ============================================================
// Date Parsing Functions
// ============================================================

/**
 * Parse a date string in a given format
 * Handles timezone correctly to avoid day shift issues
 * @param dateStr - Date string to parse
 * @param format - Expected format (default: 'DD/MM/YYYY')
 */
export function parseDate(dateStr: string, format: string = 'DD/MM/YYYY'): Date | null {
    if (!dateStr) return null;
    const parsed = dayjs(dateStr, format);
    return parsed.isValid() ? parsed.toDate() : null;
}

/**
 * Parse an ISO date string without timezone issues
 * Creates date in local timezone
 * @param dateStr - ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 */
export function parseISODate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.toDate() : null;
}

/**
 * Convert a date to start of day in specified timezone
 * @param date - Date to convert
 * @param tz - Timezone to use
 */
export function startOfDay(date: Date | string, tz: string = DEFAULT_TIMEZONE): Date {
    return dayjs(date).tz(tz).startOf('day').toDate();
}

/**
 * Convert a date to end of day in specified timezone
 * @param date - Date to convert
 * @param tz - Timezone to use
 */
export function endOfDay(date: Date | string, tz: string = DEFAULT_TIMEZONE): Date {
    return dayjs(date).tz(tz).endOf('day').toDate();
}

// ============================================================
// Date Comparison Functions
// ============================================================

/**
 * Check if two dates are the same day (ignoring time)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
    return dayjs(date1).isSame(dayjs(date2), 'day');
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string, tz: string = DEFAULT_TIMEZONE): boolean {
    return dayjs(date).tz(tz).isSame(dayjs().tz(tz), 'day');
}

/**
 * Check if a date is before another date
 */
export function isBefore(date1: Date | string, date2: Date | string): boolean {
    return dayjs(date1).isBefore(dayjs(date2));
}

/**
 * Check if a date is after another date
 */
export function isAfter(date1: Date | string, date2: Date | string): boolean {
    return dayjs(date1).isAfter(dayjs(date2));
}

// ============================================================
// Date Manipulation Functions
// ============================================================

/**
 * Add time to a date
 */
export function addDays(date: Date | string, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
}

export function addMonths(date: Date | string, months: number): Date {
    return dayjs(date).add(months, 'month').toDate();
}

export function addYears(date: Date | string, years: number): Date {
    return dayjs(date).add(years, 'year').toDate();
}

// ============================================================
// Relative Time
// ============================================================

/**
 * Get relative time string (e.g., "2 hours ago")
 */
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export function fromNow(date: Date | string): string {
    return dayjs(date).fromNow();
}

// ============================================================
// Export dayjs for direct use if needed
// ============================================================
export { dayjs };
