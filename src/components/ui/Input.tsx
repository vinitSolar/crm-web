import * as React from 'react';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon, SpinnerIcon, SearchIcon } from '@/components/icons';

type InputVariant = 'default' | 'underline';
type InputSize = 'default' | 'sm' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    unstyled?: boolean;
    variant?: InputVariant;
    inputSize?: InputSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    required?: boolean;
    containerClassName?: string;
    onSearch?: () => void;
}

const variantStyles: Record<InputVariant, string[]> = {
    default: [
        'flex w-full rounded-md border border-input bg-background px-3 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    underline: [
        'w-full border-0 border-b border-border bg-transparent text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ],
};

const sizeStyles: Record<InputSize, string> = {
    sm: 'h-8 text-xs py-1',
    default: 'h-10 py-2',
    lg: 'h-12 text-base py-3',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        containerClassName,
        type = 'text',
        label,
        error,
        helperText,
        id,
        unstyled = false,
        variant = 'default',
        inputSize = 'default',
        isLoading = false,
        leftIcon,
        rightIcon,
        required,
        disabled,
        onSearch,
        onKeyDown,
        ...props
    }, ref) => {
        const inputId = id || React.useId();
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';
        const isSearch = type === 'search';
        const inputType = isPassword && showPassword ? 'text' : isSearch ? 'text' : type;

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (isSearch && e.key === 'Enter' && onSearch) {
                onSearch();
            }
            onKeyDown?.(e);
        };

        if (unstyled) {
            return (
                <input
                    type={inputType}
                    id={inputId}
                    className={className}
                    ref={ref}
                    disabled={disabled || isLoading}
                    onKeyDown={handleKeyDown}
                    {...props}
                />
            );
        }

        const hasRightElement = rightIcon || isLoading || isPassword || isSearch;

        return (
            <div className={cn("w-full space-y-1", containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "text-sm leading-none block",
                            variant === 'underline' ? 'text-subtitle' : 'font-medium text-title'
                        )}
                    >
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={inputType}
                        id={inputId}
                        className={cn(
                            ...variantStyles[variant],
                            sizeStyles[inputSize],
                            error && 'border-destructive focus:border-destructive focus-visible:ring-destructive',
                            leftIcon && 'pl-10',
                            hasRightElement && 'pr-10',
                            className
                        )}
                        ref={ref}
                        disabled={disabled || isLoading}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        onKeyDown={handleKeyDown}
                        {...props}
                    />
                    {hasRightElement && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {isLoading ? (
                                <SpinnerIcon size={16} />
                            ) : isPassword ? (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="hover:text-foreground transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            ) : isSearch ? (
                                <button
                                    type="button"
                                    onClick={onSearch}
                                    className="hover:text-foreground transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label="Search"
                                >
                                    <SearchIcon size={18} />
                                </button>
                            ) : (
                                rightIcon
                            )}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };

