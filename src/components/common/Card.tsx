import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
}

export function Card({ children, className, title, description, footer }: CardProps) {
    return (
        <div className={cn("rounded-lg border border-border bg-background p-6", className)}>
            {(title || description) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-semibold text-title">{title}</h3>}
                    {description && <p className="text-sm text-subtitle">{description}</p>}
                </div>
            )}
            {children}
            {footer && (
                <div className="mt-4 pt-4 border-t border-border">
                    {footer}
                </div>
            )}
        </div>
    );
}
