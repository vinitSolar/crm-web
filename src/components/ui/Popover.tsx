import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface PopoverProps {
    trigger: ReactNode;
    content: ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    placement?: PopoverPlacement;
    className?: string;
    showArrow?: boolean;
}

export function Popover({
    trigger,
    content,
    isOpen,
    onOpenChange,
    placement = 'top',
    className,
    showArrow = true,
}: PopoverProps) {
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [transformOrigin, setTransformOrigin] = useState('center bottom'); // Default for 'top'
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let top = 0;
        let left = 0;
        let origin = 'center center';

        // Basic positioning (can be enhanced with more precise measurements if popover ref is available)
        // Note: For precise centering, we'd need the popover dimensions, which we can get via ref after render
        // For now, we use CSS transforms to handle the element's own dimensions (-translate-x-1/2 etc)

        switch (placement) {
            case 'top':
                top = rect.top + scrollY - 8;
                left = rect.left + scrollX + rect.width / 2;
                origin = 'center bottom';
                break;
            case 'bottom':
                top = rect.bottom + scrollY + 8;
                left = rect.left + scrollX + rect.width / 2;
                origin = 'center top';
                break;
            case 'left':
                top = rect.top + scrollY + rect.height / 2;
                left = rect.left + scrollX - 8;
                origin = 'right center';
                break;
            case 'right':
                top = rect.top + scrollY + rect.height / 2;
                left = rect.right + scrollX + 8;
                origin = 'left center';
                break;
            case 'top-start':
                top = rect.top + scrollY - 8;
                left = rect.left + scrollX;
                origin = 'left bottom';
                break;
            case 'top-end':
                top = rect.top + scrollY - 8;
                left = rect.right + scrollX;
                origin = 'right bottom';
                break;
            case 'bottom-start':
                top = rect.bottom + scrollY + 8;
                left = rect.left + scrollX;
                origin = 'left top';
                break;
            case 'bottom-end':
                top = rect.bottom + scrollY + 8;
                left = rect.right + scrollX;
                origin = 'right top';
                break;
        }

        setCoords({ top, left });
        setTransformOrigin(origin);
    };

    // Update position on open/scroll/resize
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            // Interaction outside
            const handleClickOutside = (e: MouseEvent) => {
                if (
                    popoverRef.current &&
                    !popoverRef.current.contains(e.target as Node) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(e.target as Node)
                ) {
                    onOpenChange(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, placement]);

    // Calculate transform style based on placement
    // This allows centering or alignment without knowing exact popover width/height beforehand
    const getTransformStyle = () => {
        switch (placement) {
            case 'top': return 'translate(-50%, -100%)';
            case 'bottom': return 'translate(-50%, 0)';
            case 'left': return 'translate(-100%, -50%)';
            case 'right': return 'translate(0, -50%)';
            case 'top-start': return 'translate(0, -100%)';
            case 'top-end': return 'translate(-100%, -100%)';
            case 'bottom-start': return 'translate(0, 0)';
            case 'bottom-end': return 'translate(-100%, 0)';
            default: return 'translate(-50%, -100%)';
        }
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="inline-flex"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent bubbling 
                    onOpenChange(!isOpen);
                }}
            >
                {trigger}
            </div>
            {isOpen && createPortal(
                <div
                    ref={popoverRef}
                    className="fixed z-[9999]"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: getTransformStyle(),
                        transformOrigin: transformOrigin
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside popover
                >
                    <div className={cn(
                        'bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-lg',
                        'animate-in fade-in zoom-in-95 duration-200',
                        className
                    )}>
                        {content}

                        {showArrow && (
                            <div
                                className={cn(
                                    "absolute w-0 h-0 border-[6px]",
                                    placement.startsWith('top') ? "top-full border-t-zinc-900/10 dark:border-t-white/10 border-x-transparent border-b-transparent" :
                                        placement.startsWith('bottom') ? "bottom-full border-b-zinc-900/10 dark:border-b-white/10 border-x-transparent border-t-transparent" :
                                            ""
                                )}
                                style={{
                                    left: placement === 'top' || placement === 'bottom' ? '50%' :
                                        placement.endsWith('start') ? '16px' : 'auto',
                                    right: placement.endsWith('end') ? '16px' : 'auto',
                                    transform: placement === 'top' || placement === 'bottom' ? 'translateX(-50%)' : 'none'
                                }}
                            >
                                {/* Inner arrow for border effect / color match */}
                                <div className={cn(
                                    "absolute w-0 h-0 border-[5px]",
                                    placement.startsWith('top') ? "-top-[6px] -left-[5px] border-t-white dark:border-t-zinc-900 border-x-transparent border-b-transparent" :
                                        placement.startsWith('bottom') ? "-bottom-[6px] -left-[5px] border-b-white dark:border-b-zinc-900 border-x-transparent border-t-transparent" :
                                            ""
                                )} />
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
