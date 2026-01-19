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
        const [isYearSelection, setIsYearSelection] = React.useState(false);
        const [inputValue, setInputValue] = React.useState('');
        const [internalError, setInternalError] = React.useState<string>('');
        const selectedYearRef = React.useRef<HTMLButtonElement>(null);

        // Current view (month/year being displayed)
        const selectedDate = parseDate(value);
        const [viewDate, setViewDate] = React.useState<Date>(() =>
            selectedDate || new Date()
        );

        // Update input value when selected date changes
        React.useEffect(() => {
            if (selectedDate) {
                setInputValue(formatDate(selectedDate, dateFormat));
                setInternalError('');
            } else {
                setInputValue('');
            }
        }, [selectedDate, dateFormat]);

        // Auto-scroll to selected year
        React.useEffect(() => {
            if (isYearSelection && selectedYearRef.current) {
                selectedYearRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }, [isYearSelection]);

        // Close on outside click
        React.useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    setIsYearSelection(false);
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
                    setIsYearSelection(false);
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
            setInternalError(''); // Clear error while typing new value

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
                    // Create date at noon (12:00) to prevent timezone shift issues
                    const parsed = new Date(year, month - 1, day, 12, 0, 0);

                    // Validate that the day exists (e.g. prevent 31/04 from rolling to 01/05)
                    // and check min/max range
                    if (!isNaN(parsed.getTime()) &&
                        parsed.getDate() === day &&
                        parsed.getMonth() === month - 1) {

                        if (isDateInRange(parsed)) {
                            onChange?.(parsed);
                            setViewDate(parsed);
                            setInternalError('');
                        } else {
                            setInternalError('Date is disabled');
                        }
                    } else if (!isNaN(parsed.getTime())) {
                        setInternalError('Invalid date');
                    }
                }
            }
        };

        const handleInputFocus = () => {
            if (!disabled) {
                setIsOpen(true);
            }
        };

        const handleInputBlur = () => {
            // If there is an internal error, keep it shown and don't revert immediately
            // so user sees why it failed. However, if they leave it empty/invalid, 
            // we might want to revert logic or keep error. 
            // User requested "red out like and give validation err".

            // If valid selected date exists and we have no error, ensure input matches
            if (!internalError) {
                if (selectedDate) {
                    const currentFormatted = formatDate(selectedDate, dateFormat);
                    if (inputValue !== currentFormatted) {
                        setInputValue(currentFormatted);
                    }
                } else {
                    setInputValue('');
                }
            }
        };

        const isDateInRange = (date: Date): boolean => {
            if (minDate) {
                // Determine if 'date' is before 'minDate'
                // We compare timestamps at 00:00:00 to avoid time issues
                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                if (d < min) return false;
            }
            if (maxDate) {
                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
                if (d > max) return false;
            }
            return true;
        };

        const isYearDisabled = (year: number): boolean => {
            if (minDate && year < minDate.getFullYear()) return true;
            if (maxDate && year > maxDate.getFullYear()) return true;
            return false;
        };

        const isDateDisabled = (date: Date): boolean => {
            return !isDateInRange(date);
        };

        const handleDateSelect = (day: number) => {
            // Create date at noon (12:00) to prevent timezone shift when converting to UTC
            const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12, 0, 0);
            if (!isDateDisabled(newDate)) {
                onChange?.(newDate);
                setIsOpen(false);
                setInternalError('');
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
            setInternalError('');
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

        const displayError = error || internalError;

        return (
            <div ref={containerRef} className={cn("relative w-full space-y-1", className)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-title leading-none block"
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
                        onBlur={handleInputBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                        className={cn(
                            "flex w-full h-10 rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm",
                            "ring-offset-background file:border-0 file:bg-transparent",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            displayError && "border-destructive focus-visible:ring-destructive"
                        )}
                        aria-invalid={!!displayError}
                        aria-describedby={displayError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
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
                {displayError && (
                    <p id={`${inputId}-error`} className="text-sm text-destructive mt-1" role="alert">
                        {displayError}
                    </p>
                )}
                {helperText && !displayError && (
                    <p id={`${inputId}-helper`} className="text-sm text-muted-foreground mt-1">
                        {helperText}
                    </p>
                )}

                {isOpen && !disabled && (
                    <div
                        className={cn(
                            "absolute z-50 mt-2 p-4 bg-background border border-border rounded-xl shadow-lg",
                            "animate-in fade-in-0 zoom-in-95 duration-200"
                        )}
                        style={{ minWidth: '300px' }}
                    >
                        {isYearSelection ? (
                            <div className="h-64 overflow-y-auto grid grid-cols-4 gap-2">
                                {Array.from({ length: 150 }, (_, i) => new Date().getFullYear() - 100 + i).map(year => {
                                    const isDisabled = isYearDisabled(year);
                                    return (
                                        <button
                                            key={year}
                                            ref={year === viewDate.getFullYear() ? selectedYearRef : undefined}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => {
                                                setViewDate(new Date(year, viewDate.getMonth(), 1));
                                                setIsYearSelection(false);
                                            }}
                                            className={cn(
                                                "px-2 py-1 text-sm rounded-md transition-colors",
                                                year === viewDate.getFullYear()
                                                    ? "bg-primary text-primary-foreground font-bold"
                                                    : "hover:bg-muted text-foreground",
                                                isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                            )}
                                        >
                                            {year}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <>
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
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-sm font-semibold text-foreground">
                                                {MONTH_NAMES[viewDate.getMonth()]}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsYearSelection(true)}
                                                className="text-sm font-semibold text-foreground hover:bg-muted px-2 py-0.5 rounded transition-colors"
                                            >
                                                {viewDate.getFullYear()}
                                            </button>
                                        </div>
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
                                            setViewDate(today);
                                        }}
                                        className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                                    >
                                        Today
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
