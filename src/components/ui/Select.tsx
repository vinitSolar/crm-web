import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, CloseIcon, CheckIcon } from '@/components/icons';

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
};

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps {
    options: SelectOption[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    multiple?: boolean;

    className?: string;
    containerClassName?: string;
    required?: boolean;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    error,
    disabled = false,
    multiple = false,

    className,
    containerClassName,
    required,
}: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);


    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const listRef = React.useRef<HTMLUListElement>(null);

    // Normalize value to array for easier handling
    const selectedValues = React.useMemo(() => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    }, [value]);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;

        // If the search query explicitly matches the selected value's label (for single select),
        // we assume the user hasn't typed a new search yet, so show all options.
        // Note: Use explicit null/undefined check because value can be empty string ''
        if (!multiple && value !== undefined && value !== null) {
            const selectedLabel = options.find(o => o.value === value)?.label || '';
            if (searchQuery === selectedLabel) {
                return options;
            }
        }

        return options.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery, value, multiple]);

    // Reset focused index when options change or search query changes
    React.useEffect(() => {
        setFocusedIndex(filteredOptions.length > 0 ? 0 : -1);
    }, [filteredOptions.length, searchQuery]);

    // Sync search query with selected value for single select
    React.useEffect(() => {
        if (!multiple && !isOpen) {
            const label = options.find(o => o.value === value)?.label || '';
            setSearchQuery(label);
        }
    }, [value, isOpen, multiple, options]);

    // Scroll focused item into view
    React.useEffect(() => {
        if (isOpen && focusedIndex >= 0 && listRef.current) {
            const list = listRef.current;
            const element = list.children[focusedIndex] as HTMLElement;
            if (element) {
                const listTop = list.scrollTop;
                const listBottom = listTop + list.clientHeight;
                const elementTop = element.offsetTop;
                const elementBottom = elementTop + element.clientHeight;

                if (elementTop < listTop) {
                    list.scrollTop = elementTop;
                } else if (elementBottom > listBottom) {
                    list.scrollTop = elementBottom - list.clientHeight;
                }
            }
        }
    }, [focusedIndex, isOpen]);

    // Get display label for selected values
    const displayLabel = React.useMemo(() => {
        if (selectedValues.length === 0) return '';
        if (multiple) {
            return selectedValues
                .map(v => options.find(o => o.value === v)?.label)
                .filter(Boolean)
                .join(', ');
        }
        return options.find(o => o.value === selectedValues[0])?.label || '';
    }, [selectedValues, options, multiple]);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard input for type-ahead search when dropdown is open
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Handle Escape to close dropdown
            if (event.key === 'Escape') {
                setIsOpen(false);
                setSearchQuery('');
                return;
            }

            // Handle Backspace to remove last character from search
            if (event.key === 'Backspace') {
                setSearchQuery(prev => prev.slice(0, -1));
                return;
            }

            // Handle ArrowDown
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setFocusedIndex(prev =>
                    filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : -1
                );
                return;
            }

            // Handle ArrowUp
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setFocusedIndex(prev =>
                    filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : -1
                );
                return;
            }

            // Handle Enter
            if (event.key === 'Enter') {
                event.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    const option = filteredOptions[focusedIndex];
                    if (!option.disabled) {
                        handleSelect(option.value);
                    }
                }
                return;
            }

            // Remove global character handling as input handles it now
            // if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            //    setSearchQuery(prev => prev + event.key);
            // }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, focusedIndex, filteredOptions]); // Added focusedIndex and filteredOptions dependencies logic inside


    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchQuery('');
                setFocusedIndex(-1);
            }
        }
    };

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(v => v !== optionValue)
                : [...selectedValues, optionValue];
            onChange?.(newValues);
        } else {
            onChange?.(optionValue);
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple) {
            onChange?.(selectedValues.filter(v => v !== optionValue));
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(multiple ? [] : '');
        setSearchQuery('');
    };

    return (
        <div className={cn("space-y-1", containerClassName)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-title leading-none block">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {/* Trigger Button */}
                {/* Trigger Input */}
                <div
                    className={cn(
                        "flex items-center justify-between w-full h-10 px-3 py-2",
                        "border border-input rounded-md bg-background text-sm",
                        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        "min-w-0",
                        disabled && "opacity-50 cursor-not-allowed",
                        error && "border-destructive focus-within:ring-destructive",
                        className
                    )}
                    onClick={() => !disabled && !isOpen && setIsOpen(true)}
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => !disabled && setIsOpen(true)}
                        placeholder={multiple && selectedValues.length > 0 ? displayLabel : placeholder}
                        disabled={disabled}
                        className={cn(
                            "flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground truncate",
                            "disabled:cursor-not-allowed"
                        )}
                    />
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                        {((!multiple && searchQuery && searchQuery !== (options.find(o => o.value === value)?.label || '')) || (multiple && selectedValues.length > 0)) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-0.5 hover:bg-muted rounded"
                            >
                                <CloseIcon size={14} />
                            </button>
                        )}
                        <ChevronDownIcon
                            size={16}
                            className={cn(
                                "transition-transform text-muted-foreground",
                                isOpen && "rotate-180"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggle();
                            }}
                        />
                    </div>
                </div>

                {/* Dropdown with Portal */}
                {isOpen && (
                    <Portal>
                        <div
                            ref={dropdownRef}
                            style={{
                                position: 'fixed',
                                top: containerRef.current ? containerRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
                                left: containerRef.current ? containerRef.current.getBoundingClientRect().left + window.scrollX : 0,
                                minWidth: containerRef.current ? containerRef.current.getBoundingClientRect().width : 'auto',
                                zIndex: 9999
                            }}
                            className="bg-background border border-border rounded-md shadow-lg max-h-60 overflow-hidden"
                        >



                            {/* Options List */}
                            <ul ref={listRef} className="overflow-auto max-h-48 py-1">
                                {filteredOptions.length === 0 ? (
                                    <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                                        No options found
                                    </li>
                                ) : (
                                    filteredOptions.map((option, index) => {
                                        const isSelected = selectedValues.includes(option.value);
                                        const isFocused = index === focusedIndex;
                                        return (
                                            <li
                                                key={option.value}
                                                onClick={() => !option.disabled && handleSelect(option.value)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    isFocused && "bg-accent text-accent-foreground", // Focus style
                                                    isSelected && "bg-accent/50",
                                                    option.disabled && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {multiple && (
                                                    <div className={cn(
                                                        "w-4 h-4 border rounded flex items-center justify-center",
                                                        isSelected ? "bg-primary border-primary" : "border-input"
                                                    )}>
                                                        {isSelected && <CheckIcon size={12} className="text-primary-foreground" />}
                                                    </div>
                                                )}
                                                <span className="flex-1">{option.label}</span>
                                                {!multiple && isSelected && (
                                                    <CheckIcon size={16} className="text-primary" />
                                                )}
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </Portal>
                )}
            </div>

            {/* Selected Tags for Multi-select */}
            {multiple && selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedValues.map((val) => {
                        const option = options.find(o => o.value === val);
                        return (
                            <span
                                key={val}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-md"
                            >
                                {option?.label}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemoveTag(val, e)}
                                    className="hover:text-destructive"
                                >
                                    <CloseIcon size={12} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
