import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// ============================================================
// Tooltip Types
// ============================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    /** Tooltip content - when null/undefined, renders just children without tooltip */
    content: string | null | undefined;
    /** Children to wrap */
    children: ReactNode;
    /** Tooltip position */
    position?: TooltipPosition;
    /** Delay before showing (ms) */
    delay?: number;
    /** Custom class for tooltip */
    className?: string;
    /** Whether the trigger wrapper should be full width */
    fullWidth?: boolean;
}

// ============================================================
// Tooltip Component
// ============================================================

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200,
    className,
    fullWidth,
}: TooltipProps) {
    // All hooks must be called unconditionally to comply with Rules of Hooks
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        // Calculate anchor point on the trigger element
        switch (position) {
            case 'top':
                top = rect.top - 8; // 8px margin
                left = rect.left + rect.width / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - 8;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 8;
                break;
        }

        setCoords({ top, left });
    };

    const handleMouseEnter = () => {
        // Don't show tooltip if no content
        if (!content) return;

        updatePosition(); // Calculate initial position
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            requestAnimationFrame(updatePosition);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    // Update position on scroll/resize
    useEffect(() => {
        if (!isVisible) return;
        const handleUpdate = () => updatePosition();

        // Capture scroll events from any parent
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        return () => {
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('resize', handleUpdate);
        }
    }, [isVisible]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // If no content, just render children without tooltip wrapper
    if (!content) {
        return <>{children}</>;
    }

    const transformStyle =
        position === 'top' ? 'translate(-50%, -100%)' :
            position === 'bottom' ? 'translate(-50%, 0)' :
                position === 'left' ? 'translate(-100%, -50%)' :
                    'translate(0, -50%)'; // right

    return (
        <>
            <div
                ref={triggerRef}
                className={cn("inline-flex", fullWidth && "w-full")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {isVisible && content && createPortal(
                <div
                    className={cn(
                        'fixed z-[9999] px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap pointer-events-none',
                        'animate-in fade-in zoom-in-95 duration-150',
                        className
                    )}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: transformStyle
                    }}
                    role="tooltip"
                >
                    {content}
                    {/* Arrow */}
                    <span
                        className={cn(
                            'absolute w-0 h-0 border-4',
                            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent' :
                                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent' :
                                    position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent' :
                                        'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent'
                        )}
                    />
                </div>,
                document.body
            )}
        </>
    );
}

export default Tooltip;
