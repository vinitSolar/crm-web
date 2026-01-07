import * as React from 'react';
import { cn } from '@/lib/utils';

type EmptyStateSize = 'sm' | 'md' | 'lg';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    size?: EmptyStateSize;
}

const sizeConfig = {
    sm: {
        container: 'py-8 px-4',
        iconWrapper: 'w-14 h-14',
        iconSize: 24,
        title: 'text-base font-medium',
        description: 'text-xs max-w-xs',
    },
    md: {
        container: 'py-12 px-6',
        iconWrapper: 'w-20 h-20',
        iconSize: 36,
        title: 'text-lg font-semibold',
        description: 'text-sm max-w-sm',
    },
    lg: {
        container: 'py-20 px-8',
        iconWrapper: 'w-28 h-28',
        iconSize: 48,
        title: 'text-2xl font-bold',
        description: 'text-base max-w-md',
    },
};

export function EmptyState({
    icon,
    title = 'No data found',
    description,
    action,
    className,
    size = 'md',
}: EmptyStateProps) {
    const config = sizeConfig[size];

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                config.container,
                className
            )}
        >
            {/* Icon Container */}
            <div className="relative mb-6 group">
                {/* Animated gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-2xl scale-[1.8] opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Icon circle */}
                <div
                    className={cn(
                        "relative flex items-center justify-center rounded-full",
                        "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5",
                        "border-2 border-primary/20 shadow-lg shadow-primary/10",
                        "backdrop-blur-sm",
                        config.iconWrapper
                    )}
                >
                    {/* Inner highlight */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-50" />

                    {/* Icon */}
                    <div className="relative text-primary">
                        {icon ?? <DefaultEmptyIcon size={config.iconSize} />}
                    </div>
                </div>
            </div>

            {/* Title */}
            <h3 className={cn("text-foreground mb-2", config.title)}>
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className={cn("text-muted-foreground mb-6 leading-relaxed", config.description)}>
                    {description}
                </p>
            )}

            {/* Action */}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}

// Default empty state icon
function DefaultEmptyIcon({ size = 36 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Folder with documents */}
            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" />
            <path d="M9 13H15" strokeOpacity="0.6" />
            <path d="M9 16H12" strokeOpacity="0.4" />
        </svg>
    );
}
