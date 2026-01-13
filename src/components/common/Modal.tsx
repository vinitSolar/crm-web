import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { CloseIcon } from '@/components/icons';

// ============================================================
// Modal Types
// ============================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: ReactNode;
    /** Modal content */
    children: ReactNode;
    /** Modal size */
    size?: ModalSize;
    /** Show close button */
    showCloseButton?: boolean;
    /** Close on backdrop click */
    closeOnBackdrop?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Footer content */
    footer?: ReactNode;
    /** Custom class for content */
    className?: string;
    /** Render content without default padding/scroll wrapper */
    fullContent?: boolean;
}

// Size mappings
const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-6xl', // Increased for 'full' to be wider generally, though UserPermissionsModal overrides it
};

// ============================================================
// Modal Component
// ============================================================

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    footer,
    className,
    fullContent = false,
}: ModalProps) {
    // Handle escape key
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    // Attach/detach escape listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleBackdropClick}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full mx-4 bg-background rounded-lg shadow-xl border border-border',
                    'animate-in zoom-in-95 fade-in duration-200',
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4  border-border">
                        {title && (
                            <h2 className="text-lg font-semibold text-foreground">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto"
                                aria-label="Close"
                            >
                                <CloseIcon size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                {fullContent ? (
                    children
                ) : (
                    <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto bg-muted/30 custom-scrollbar">
                        {children}
                    </div>
                )}

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4  border-border bg-muted/30">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
