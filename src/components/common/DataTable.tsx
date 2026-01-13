import { useRef, useEffect, useCallback, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// DataTable Types
// ============================================================

export interface Column<T> {
    /** Unique key for the column */
    key: string;
    /** Column header label */
    header: ReactNode;
    /** Width class (e.g., 'w-[120px]') */
    width?: string;
    /** Render function for cell content */
    render: (row: T, index: number) => ReactNode;
    /** Sticky column configuration */
    sticky?: boolean | 'left' | 'right';
    /** Sticky left offset in px (for multiple sticky columns) */
    stickyOffset?: number;
}

export interface DataTableProps<T> {
    /** Array of column definitions */
    columns: Column<T>[];
    /** Array of data rows */
    data: T[];
    /** Unique key extractor for each row */
    rowKey: (row: T) => string;
    /** Loading state */
    loading?: boolean;
    /** Error message */
    error?: string;
    /** Empty state message */
    emptyMessage?: string;
    /** Loading message */
    loadingMessage?: string;
    /** Enable infinite scroll */
    infiniteScroll?: boolean;
    /** Has more data to load */
    hasMore?: boolean;
    /** Is loading more data */
    isLoadingMore?: boolean;
    /** Callback when scrolled near bottom */
    onLoadMore?: () => void;
    /** Custom max height class */
    maxHeightClass?: string;
    /** Custom class for wrapper */
    className?: string;
    /** Enable row selection */
    enableSelection?: boolean;
    /** Selected row keys */
    selectedRowKeys?: string[];
    /** Callback when selection changes */
    onSelectionChange?: (keys: string[]) => void;
    /** Optional function to apply a class name to a row */
    rowClassName?: (row: T) => string;
}

// ============================================================
// DataTable Component
// ============================================================

export function DataTable<T>({
    columns,
    data,
    rowKey,
    loading = false,
    error,
    emptyMessage = 'No data found.',
    loadingMessage = 'Loading...',
    infiniteScroll = false,
    hasMore = false,
    isLoadingMore = false,
    onLoadMore,
    maxHeightClass = 'max-h-[calc(100vh-270px)]',
    className,
    rowClassName,
    enableSelection = false,
    selectedRowKeys = [],
    onSelectionChange,
}: DataTableProps<T>) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const colSpan = columns.length + (enableSelection ? 1 : 0);
    const [isScrolledHorizontally, setIsScrolledHorizontally] = useState(false);

    // Handle scroll to load more and track horizontal scroll
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Track horizontal scroll for sticky column shadow
        setIsScrolledHorizontally(container.scrollLeft > 0);

        // Infinite scroll logic
        if (!infiniteScroll || !onLoadMore) return;
        if (loading || isLoadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollThreshold = 100;

        if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
            onLoadMore();
        }
    }, [infiniteScroll, onLoadMore, loading, isLoadingMore, hasMore]);

    // Attach scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Selection Logic
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            const allKeys = data.map(rowKey);
            onSelectionChange(allKeys);
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (key: string, checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
            onSelectionChange([...selectedRowKeys, key]);
        } else {
            onSelectionChange(selectedRowKeys.filter(k => k !== key));
        }
    };

    const allSelected = data.length > 0 && data.every(row => selectedRowKeys.includes(rowKey(row)));
    const someSelected = data.length > 0 && selectedRowKeys.length > 0 && !allSelected;

    return (
        <div className={cn('overflow-hidden rounded-md', className)}>
            <div
                ref={scrollContainerRef}
                className={cn(maxHeightClass, 'overflow-auto scrollbar-thin')}
            >
                <table className="w-full relative border-separate border-spacing-0">
                    <thead className="sticky top-0 z-20 bg-background">
                        <tr className="border-b border-border shadow-sm">
                            {enableSelection && (
                                <th className="sticky left-0 z-30 w-[40px] px-3 py-3 text-left bg-background border-b border-border">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = someSelected;
                                        }}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                    />
                                </th>
                            )}
                            {columns.map((col, colIndex) => {
                                const isSticky = col.sticky === true || col.sticky === 'left';
                                // Find if this is the last sticky column
                                const isLastSticky = isSticky && !columns.slice(colIndex + 1).some(c => c.sticky === true || c.sticky === 'left');
                                // sticky offset needs to account for selection column if present
                                const baseOffset = col.stickyOffset ?? 0;
                                const stickyLeft = enableSelection && isSticky ? baseOffset + 40 : baseOffset; // 40px for selection checkbox

                                const stickyStyles: React.CSSProperties = isSticky ? {
                                    position: 'sticky',
                                    left: stickyLeft,
                                    zIndex: 30,
                                } : {};

                                return (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            'px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-background border-b border-border align-top',
                                            col.width,
                                            isLastSticky && isScrolledHorizontally && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                                        )}
                                        style={stickyStyles}
                                    >
                                        {col.header}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                        {loadingMessage}
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12 text-center text-destructive">
                                    {error}
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            <>
                                {data.map((row, rowIndex) => {
                                    const key = rowKey(row);
                                    const isSelected = selectedRowKeys.includes(key);

                                    return (
                                        <tr
                                            key={key}
                                            className={cn(
                                                "bg-background hover:bg-muted/50 group",
                                                isSelected && "bg-muted/30",
                                                rowClassName?.(row)
                                            )}
                                        >
                                            {enableSelection && (
                                                <td className="sticky left-0 z-10 w-[40px] px-3 py-3 bg-local align-top">
                                                    {/* bg-local might not be enough to hide content under sticky, needs background color matching row */}
                                                    <div className={cn(
                                                        "absolute inset-0",
                                                        isSelected ? "bg-muted/30" : "bg-background group-hover:bg-muted/50"
                                                    )} aria-hidden="true" />
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleSelectRow(key, e.target.checked)}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                    </div>
                                                </td>
                                            )}
                                            {columns.map((col, colIndex) => {
                                                const isSticky = col.sticky === true || col.sticky === 'left';
                                                // Find if this is the last sticky column
                                                const isLastSticky = isSticky && !columns.slice(colIndex + 1).some(c => c.sticky === true || c.sticky === 'left');
                                                // sticky offset needs to account for selection column if present
                                                const baseOffset = col.stickyOffset ?? 0;
                                                const stickyLeft = enableSelection && isSticky ? baseOffset + 40 : baseOffset;

                                                const stickyStyles: React.CSSProperties = isSticky ? {
                                                    position: 'sticky',
                                                    left: stickyLeft,
                                                    zIndex: 10,
                                                } : {};

                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={cn(
                                                            "px-3 py-3 text-sm transition-colors",
                                                            isSticky && "bg-background", // Force bg for sticky
                                                            isLastSticky && isScrolledHorizontally && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                                                        )}
                                                        style={stickyStyles}
                                                    >
                                                        {col.render(row, rowIndex)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                                {/* Loading more indicator */}
                                {isLoadingMore && (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-4 text-center text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                Loading more...
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}

export default DataTable;
