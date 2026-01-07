import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Table Types
// ============================================================

export interface Column<T> {
    /** Unique key for the column */
    key: string;
    /** Column header label */
    header: string;
    /** Width class (e.g., 'w-[120px]') */
    width?: string;
    /** Render function for cell content */
    render: (row: T, index: number) => ReactNode;
}

export interface TableProps<T> {
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
}

// ============================================================
// Table Component
// ============================================================

export function Table<T>({
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
    maxHeightClass = 'max-h-[calc(100vh-350px)]',
    className,
}: TableProps<T>) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const colSpan = columns.length;

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (!infiniteScroll || !onLoadMore) return;
        const container = scrollContainerRef.current;
        if (!container || loading || isLoadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollThreshold = 100;

        if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
            onLoadMore();
        }
    }, [infiniteScroll, onLoadMore, loading, isLoadingMore, hasMore]);

    // Attach scroll listener
    useEffect(() => {
        if (!infiniteScroll) return;
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, infiniteScroll]);

    return (
        <div className={cn('overflow-hidden rounded-md', className)}>
            <div
                ref={scrollContainerRef}
                className={cn(maxHeightClass, 'overflow-y-auto scrollbar-thin')}
            >
                <table className="w-full">
                    <thead className="sticky top-0 bg-background z-10">
                        <tr className="border-b border-border">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                                        col.width
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
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
                                {data.map((row, index) => (
                                    <tr key={rowKey(row)} className="hover:bg-muted/50">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-3 py-3 text-sm">
                                                {col.render(row, index)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
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
        </div>
    );
}

export default Table;
