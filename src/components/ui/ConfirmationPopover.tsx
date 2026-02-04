import { type ReactNode, useState } from 'react';
import { Popover, type PopoverPlacement } from './Popover';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { AlertCircleIcon } from '@/components/icons';

interface ConfirmationPopoverProps {
    children: ReactNode;
    title?: string;
    description?: ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
    placement?: PopoverPlacement;
    enabled?: boolean; // If false, no confirmation is shown (pass-through)
    className?: string; // Class for the popover content
}

export function ConfirmationPopover({
    children,
    title = 'Are you sure?',
    description,
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmVariant = 'destructive',
    placement = 'top',
    enabled = true,
    className,
}: ConfirmationPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirm();
    };

    const handleCancel = () => {
        setIsOpen(false);
        onCancel?.();
    };

    if (!enabled) {
        return <>{children}</>;
    }

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            placement={placement}
            className={cn("w-[260px] p-0", className)}
            trigger={
                <div
                    onClickCapture={(e) => {
                        e.stopPropagation(); // Stop event from reaching the child
                        e.preventDefault();
                        setIsOpen(true);
                    }}
                    className="inline-flex" // Ensure it doesn't break layout
                >
                    {children}
                </div>
            }
            content={
                <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5 text-amber-500">
                            <AlertCircleIcon size={16} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold leading-none">{title}</h4>
                            {description && <p className="text-xs text-muted-foreground">{description}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-7 px-2 text-xs"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            size="sm"
                            variant={confirmVariant}
                            onClick={handleConfirm}
                            className="h-7 px-2 text-xs"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
