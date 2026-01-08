import * as React from 'react';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

// ============================================================
// DatePicker Types
// ============================================================

export interface DatePickerProps {
    /** Currently selected date */
    value?: Date | string | null;
    /** Change handler */
    onChange?: (date: Date | null) => void;
    /** Input label */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Error message */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Minimum selectable date */
    minDate?: Date;
    /** Maximum selectable date */
    maxDate?: Date;
    /** Display format */
    dateFormat?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
    /** Required field */
    required?: boolean;
    /** Container class */
    className?: string;
    /** Input ID */
    id?: string;
}

// ============================================================
// Utility Functions
// ============================================================

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
        case 'MM/dd/yyyy':
            return `${month}/${day}/${year}`;
        case 'yyyy-MM-dd':
            return `${year}-${month}-${day}`;
        case 'dd/MM/yyyy':
        default:
            return `${day}/${month}/${year}`;
    }
}

function parseDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    // Handle ISO date strings (yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss) to avoid timezone issues
    if (typeof value === 'string') {
        // Check if it's an ISO date format (starts with yyyy-MM-dd)
        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            // Create date using local timezone (not UTC)
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

// ============================================================
// DatePicker Component
// ============================================================

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
    ({
        value,
        onChange,
        label,
        placeholder = 'Select date',
        error,
        helperText,
        disabled = false,
        minDate,
        maxDate,
        dateFormat = 'dd/MM/yyyy',
        required,
        className,
        id,
    }, ref) => {
        const inputId = id || React.useId();
        const containerRef = React.useRef<HTMLDivElement>(null);
        const [isOpen, setIsOpen] = React.useState(false);
        const [inputValue, setInputValue] = React.useState('');

        // Current view (month/year being displayed)
        const selectedDate = parseDate(value);
        const [viewDate, setViewDate] = React.useState<Date>(() =>
            selectedDate || new Date()
        );

        // Update input value when selected date changes
        React.useEffect(() => {
            if (selectedDate) {
                setInputValue(formatDate(selectedDate, dateFormat));
            } else {
                setInputValue('');
            }
        }, [selectedDate, dateFormat]);

        // Close on outside click
        React.useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // Close on Escape key
        React.useEffect(() => {
            function handleKeyDown(event: KeyboardEvent) {
                if (event.key === 'Escape') {
                    setIsOpen(false);
                }
            }
            if (isOpen) {
                document.addEventListener('keydown', handleKeyDown);
                return () => document.removeEventListener('keydown', handleKeyDown);
            }
        }, [isOpen]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setInputValue(val);

            // Try to parse the input
            const parts = val.split(/[\/\-]/);
            if (parts.length === 3) {
                let day: number, month: number, year: number;

                if (dateFormat === 'MM/dd/yyyy') {
                    [month, day, year] = parts.map(Number);
                } else if (dateFormat === 'yyyy-MM-dd') {
                    [year, month, day] = parts.map(Number);
                } else {
                    [day, month, year] = parts.map(Number);
                }

                if (day && month && year && year > 1900) {
                    const parsed = new Date(year, month - 1, day);
                    if (!isNaN(parsed.getTime())) {
                        if (isDateInRange(parsed)) {
                            onChange?.(parsed);
                            setViewDate(parsed);
                        }
                    }
                }
            }
        };

        const handleInputFocus = () => {
            if (!disabled) {
                setIsOpen(true);
            }
        };

        const isDateInRange = (date: Date): boolean => {
            if (minDate && date < minDate) return false;
            if (maxDate && date > maxDate) return false;
            return true;
        };

        const isDateDisabled = (date: Date): boolean => {
            return !isDateInRange(date);
        };

        const handleDateSelect = (day: number) => {
            const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            if (!isDateDisabled(newDate)) {
                onChange?.(newDate);
                setIsOpen(false);
            }
        };

        const navigateMonth = (delta: number) => {
            setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
        };

        const navigateYear = (delta: number) => {
            setViewDate(prev => new Date(prev.getFullYear() + delta, prev.getMonth(), 1));
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.(null);
            setInputValue('');
        };

        // Generate calendar days
        const renderCalendarDays = () => {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);
            const days: React.ReactNode[] = [];

            // Empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
            }

            // Day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                const isDisabled = isDateDisabled(date);

                days.push(
                    <button
                        key={day}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                            "w-9 h-9 rounded-full text-sm font-medium transition-all duration-150",
                            "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                            !isSelected && isTodayDate && "border-2 border-primary text-primary",
                            isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                        )}
                    >
                        {day}
                    </button>
                );
            }

            return days;
        };

        return (
            <div ref={containerRef} className={cn("relative w-full", className)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-title leading-none block mb-1"
                    >
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </label>
                )}

                {/* Input Field */}
                <div className="relative" ref={ref}>
                    <input
                        id={inputId}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            "flex w-full h-10 rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm",
                            "ring-offset-background file:border-0 file:bg-transparent",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-destructive focus-visible:ring-destructive"
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {inputValue && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                                aria-label="Clear date"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                            disabled={disabled}
                            className={cn(
                                "p-1.5 rounded-md text-muted-foreground transition-colors",
                                "hover:text-foreground hover:bg-muted",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                disabled && "cursor-not-allowed opacity-50"
                            )}
                            aria-label="Open calendar"
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <p id={`${inputId}-error`} className="text-sm text-destructive mt-1" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="text-sm text-muted-foreground mt-1">
                        {helperText}
                    </p>
                )}

                {/* Calendar Popup */}
                {isOpen && !disabled && (
                    <div
                        className={cn(
                            "absolute z-50 mt-2 p-4 bg-background border border-border rounded-xl shadow-lg",
                            "animate-in fade-in-0 zoom-in-95 duration-200"
                        )}
                        style={{ minWidth: '300px' }}
                    >
                        {/* Header with Month/Year Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => navigateYear(-1)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Previous year"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="11 17 6 12 11 7" />
                                    <polyline points="18 17 13 12 18 7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateMonth(-1)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Previous month"
                            >
                                <ChevronLeftIcon size={18} />
                            </button>

                            <div className="flex-1 text-center">
                                <span className="text-sm font-semibold text-foreground">
                                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigateMonth(1)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Next month"
                            >
                                <ChevronRightIcon size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateYear(1)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Next year"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="13 17 18 12 13 7" />
                                    <polyline points="6 17 11 12 6 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Names Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAY_NAMES.map(day => (
                                <div key={day} className="w-9 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendarDays()}
                        </div>

                        {/* Today Button */}
                        <div className="mt-4 pt-3 border-t border-border flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    if (isDateInRange(today)) {
                                        onChange?.(today);
                                        setIsOpen(false);
                                    }
                                }}
                                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
