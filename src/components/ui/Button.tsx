import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpinnerIcon } from '@/components/icons';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    loadingText?: string;
    unstyled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10',
};

const baseStyles = [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
];

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'default',
        size = 'default',
        isLoading,
        loadingText,
        disabled,
        unstyled = false,
        leftIcon,
        rightIcon,
        fullWidth,
        children,
        ...props
    }, ref) => {
        if (unstyled) {
            return (
                <button
                    className={className}
                    ref={ref}
                    disabled={disabled || isLoading}
                    {...props}
                >
                    {children}
                </button>
            );
        }

        return (
            <button
                className={cn(
                    ...baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && 'w-full',
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading && <SpinnerIcon className="mr-2 h-4 w-4" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {isLoading && loadingText ? loadingText : children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
