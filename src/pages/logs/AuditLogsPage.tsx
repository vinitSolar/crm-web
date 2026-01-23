import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column, Modal } from '@/components/common';
import {
    FileTextIcon,
    RefreshCwIcon,
    SearchIcon,
    EyeIcon,
} from '@/components/icons';
import { GET_AUDIT_LOGS, GET_RECORD_AUDIT_HISTORY } from '@/graphql';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/date';

// Types
interface AuditLog {
    id: string;
    uid: string;
    tableName: string;
    recordId: string;
    operation: string;
    oldValues: string | null;
    newValues: string | null;
    changedAt: string;
    changedBy: string;
}

interface AuditLogsResponse {
    auditLogs: {
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
        data: AuditLog[];
    };
}

interface RecordAuditHistoryResponse {
    recordAuditHistory: {
        tableName: string;
        recordId: string;
        currentRecord: string | null;
        auditHistory: AuditLog[];
    };
}

// Table name display mapping
const tableNameMap: Record<string, string> = {
    users: 'Users',
    roles: 'Roles',
    menus: 'Menus',
    customers: 'Customers',
    role_menu_permissions: 'Role Permissions',
    user_menu_permissions: 'User Permissions',
    rates: 'Rates',
    rate_offers: 'Rate Offers',
    customer_address: 'Customer Address',
    customer_enrollment_details: 'Customer Enrollment',
    customer_solar_system: 'Customer Solar',
    customer_battery_system: 'Customer Battery',
    customer_vpp: 'Customer VPP',
    customer_msat: 'Customer MSAT',
    customer_debit_details: 'Customer Debit',
};

// Operation badge colors
const operationColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50',
    UPDATE: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50',
    DELETE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50',
};

export const AuditLogsPage = () => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [tableFilter, setTableFilter] = useState<string>('');
    const [allLogs, setAllLogs] = useState<AuditLog[]>([]);

    // Modal states
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<{ tableName: string; recordId: string } | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const limit = 20;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchQuery) {
                setAllLogs([]);
                setPage(1);
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    // Fetch audit logs
    const { data, loading, error, refetch } = useQuery<AuditLogsResponse>(GET_AUDIT_LOGS, {
        variables: {
            page,
            limit,
            tableName: tableFilter || undefined
        },
        fetchPolicy: 'cache-and-network',
    });

    // Fetch record history when modal is open
    const { data: historyData, loading: historyLoading } = useQuery<RecordAuditHistoryResponse>(
        GET_RECORD_AUDIT_HISTORY,
        {
            variables: { tableName: selectedRecord?.tableName, recordId: selectedRecord?.recordId },
            skip: !selectedRecord || !historyModalOpen,
            fetchPolicy: 'network-only',
        }
    );

    const meta = data?.auditLogs?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Update allLogs when data changes
    useEffect(() => {
        if (data?.auditLogs?.data) {
            let fetchedLogs = data.auditLogs.data;

            // Client-side filtering for search query if API doesn't support it fully
            // (The API might support 'tableName', but check if it supports general search. 
            // The logic below mimics UsersPage accumulation pattern)

            if (debouncedSearch) {
                const query = debouncedSearch.toLowerCase();
                fetchedLogs = fetchedLogs.filter(log =>
                    log.tableName.toLowerCase().includes(query) ||
                    log.recordId?.toLowerCase().includes(query) ||
                    log.operation.toLowerCase().includes(query) ||
                    log.changedBy?.toLowerCase().includes(query)
                );
            }

            if (page === 1) {
                setAllLogs(fetchedLogs);
            } else {
                setAllLogs(prev => {
                    const existingIds = new Set(prev.map(l => l.uid));
                    const newLogs = fetchedLogs.filter(l => !existingIds.has(l.uid));
                    return [...prev, ...newLogs];
                });
            }
            setIsLoadingMore(false);
        }
    }, [data, page, debouncedSearch]);


    // Handle filter changes
    const handleTableFilterChange = (val: string) => {
        setAllLogs([]);
        setPage(1);
        setTableFilter(val);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setIsLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    // View log details
    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setDetailModalOpen(true);
    };

    // View record history
    const handleViewHistory = (log: AuditLog) => {
        setSelectedRecord({ tableName: log.tableName, recordId: log.recordId });
        setHistoryModalOpen(true);
    };

    // Parse JSON safely
    const parseJSON = (str: string | null) => {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch {
            return str;
        }
    };
    // Table Columns
    const columns: Column<AuditLog>[] = useMemo(() => [
        {
            key: 'changedAt',
            header: 'Timestamp',
            width: 'w-[180px]',
            render: (log) => <span className="text-gray-600 dark:text-gray-400 text-sm">{formatDateTime(log.changedAt)}</span>
        },
        {
            key: 'tableName',
            header: 'Table',
            width: 'w-[150px]',
            render: (log) => (
                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {tableNameMap[log.tableName] || log.tableName}
                </span>
            )
        },
        {
            key: 'operation',
            header: 'Operation',
            width: 'w-[100px]',
            render: (log) => (
                <span
                    className={cn(
                        'px-2 py-1 text-xs font-semibold rounded-full border',
                        operationColors[log.operation] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    )}
                >
                    {log.operation}
                </span>
            )
        },
        {
            key: 'changedBy',
            header: 'Changed By',
            width: 'w-[150px]',
            render: (log) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm truncate block max-w-[140px]">
                    {log.changedBy ? log.changedBy : <span className="text-gray-400 dark:text-gray-500 italic">System</span>}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            width: 'w-[180px]',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                        className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-900/50"
                        title="View Details"
                    >
                        <EyeIcon size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(log)}
                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                        title="View History"
                    >
                        <RefreshCwIcon size={16} />
                    </Button>
                </div>
            )
        }
    ], []);

    // Filter options for select
    const tableOptions = Object.entries(tableNameMap).map(([value, label]) => ({ value, label }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground dark:text-white">Audit Logs</h1>
                    <p className="text-muted-foreground dark:text-gray-400">View system changes and record history</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        setAllLogs([]);
                        setPage(1);
                        refetch();
                    }}
                    disabled={loading}
                    leftIcon={<RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />}
                >
                    Refresh
                </Button>
            </div>

            {/* Main Content Info Card */}
            <div className="p-5 bg-background dark:bg-card rounded-lg border border-border dark:border-border shadow-sm">

                {/* Filters Row */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-[60px] flex-shrink-0">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filters:</span>
                        </div>
                        <Select
                            options={[{ value: '', label: 'All Tables' }, ...tableOptions]}
                            value={tableFilter}
                            onChange={(val) => handleTableFilterChange(val as string)}
                            placeholder="All Tables"
                            containerClassName="w-[200px]"
                        />
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search by ID, operation..."
                                className=""
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                containerClassName="w-full"
                                type='search'
                            />
                        </div>
                        {/* Clear Filters Button */}
                        {(searchQuery || tableFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    handleTableFilterChange('');
                                }}
                                className="text-gray-500"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={allLogs}
                    rowKey={(log) => log.uid}
                    loading={loading && page === 1}
                    error={error?.message}
                    emptyMessage="No audit logs found matching your criteria."
                    loadingMessage="Loading audit logs..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    maxHeightClass="max-h-[calc(100vh-300px)]"
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Audit Log Details"
                size="lg"
                footer={
                    <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                        Close
                    </Button>
                }
            >
                {selectedLog && (
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Table</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {tableNameMap[selectedLog.tableName] || selectedLog.tableName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Operation</label>
                                <div className="mt-1">
                                    <span
                                        className={cn(
                                            'px-2 py-0.5 text-xs font-semibold rounded-full border',
                                            operationColors[selectedLog.operation]
                                        )}
                                    >
                                        {selectedLog.operation}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Record ID</label>
                                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all bg-white dark:bg-gray-950 px-2 py-1 rounded border border-gray-200 dark:border-gray-800 mt-1">
                                    {selectedLog.recordId}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Changed At</label>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDateTime(selectedLog.changedAt)}</p>
                            </div>
                            <div className="col-span-2 border-t border-gray-200 dark:border-gray-800 pt-2 mt-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Changed By</label>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                                    {selectedLog.changedBy || 'System'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            {(() => {
                                const oldData = parseJSON(selectedLog.oldValues);
                                const newData = parseJSON(selectedLog.newValues);

                                if (selectedLog.operation === 'UPDATE' && oldData && newData) {
                                    const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)])).sort();

                                    return (
                                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 w-1/3">Field</th>
                                                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 w-1/3">Old Value</th>
                                                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 w-1/3">New Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {allKeys.map((key) => {
                                                        const oldValue = oldData[key];
                                                        const newValue = newData[key];
                                                        const isChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

                                                        if (!isChanged) return null; // Only show changed fields? Or show all? User said "highlight a part that what is being changed", implying showing context might be good, but usually only changes are relevant. Let's show only changes to be cleaner, or maybe all. "highlight a part" suggests showing structure. Let's show all but highlight changes.
                                                        // Actually, for a clean audit log, usually only changed fields are interesting for UPDATE.
                                                        // But let's show all for now? No, if the object is huge, it's bad.
                                                        // Let's filter to only changed fields for clarity, or maybe show all.
                                                        // "highlight a part that what is being changed" -> This implies show the whole thing and highlight the diff.
                                                        // Let's show all for now.

                                                        return (
                                                            <tr key={key} className={isChanged ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 'bg-white dark:bg-gray-950'}>
                                                                <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">{key}</td>
                                                                <td className={cn("px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs", isChanged && "text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-900/20")}>
                                                                    {JSON.stringify(oldValue) || '-'}
                                                                </td>
                                                                <td className={cn("px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs", isChanged && "text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-900/20")}>
                                                                    {JSON.stringify(newValue) || '-'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                }

                                // For INSERT or DELETE (or single value availability)
                                const displayData = newData || oldData;

                                if (!displayData) return <p className="text-gray-500 italic">No data available.</p>;

                                const isInsert = selectedLog.operation === 'INSERT';
                                const isDelete = selectedLog.operation === 'DELETE';

                                const borderColor = isInsert ? 'border-green-200' : isDelete ? 'border-red-200' : 'border-gray-200';
                                const headerBg = isInsert ? 'bg-green-50' : isDelete ? 'bg-red-50' : 'bg-gray-50';
                                const headerText = isInsert ? 'text-green-800' : isDelete ? 'text-red-800' : 'text-gray-700';
                                const label = isInsert ? 'New Record Created' : isDelete ? 'Deleted Record Data' : 'Record Data';

                                return (
                                    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
                                        <div className={`${headerBg} px-4 py-2 border-b ${borderColor} font-semibold ${headerText} text-sm flex items-center gap-2`}>
                                            {isInsert && <span className="text-lg">+</span>}
                                            {isDelete && <span className="text-lg">-</span>}
                                            {label}
                                        </div>
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {Object.entries(displayData).map(([key, value]) => (
                                                    <tr key={key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 w-1/3 bg-gray-50/30 dark:bg-gray-900/30">{key}</td>
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{JSON.stringify(value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}

                        </div>
                    </div>
                )}
            </Modal>


            {/* History Modal */}
            < Modal
                isOpen={historyModalOpen}
                onClose={() => {
                    setHistoryModalOpen(false);
                    setSelectedRecord(null);
                }}
                title="Record Audit History"
                size="lg"
                footer={
                    < Button
                        variant="outline"
                        onClick={() => {
                            setHistoryModalOpen(false);
                            setSelectedRecord(null);
                        }}
                    >
                        Close
                    </Button >
                }
            >
                {
                    historyLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="mt-4 text-sm text-muted-foreground">Loading audit history...</p>
                        </div>
                    ) : historyData?.recordAuditHistory ? (
                        <div className="space-y-4 py-2">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        {tableNameMap[historyData.recordAuditHistory.tableName] ||
                                            historyData.recordAuditHistory.tableName}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                                        {historyData.recordAuditHistory.recordId}
                                    </span>
                                </div>
                                {historyData.recordAuditHistory.currentRecord && (
                                    <details className="mt-2 group">
                                        <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium select-none">
                                            View Current Record Data
                                        </summary>
                                        <div className="mt-2 text-xs">
                                            <pre className="bg-white dark:bg-gray-950 p-3 rounded border border-blue-100 dark:border-gray-800 text-xs overflow-x-auto max-h-48 text-gray-600 dark:text-gray-300">
                                                {JSON.stringify(
                                                    parseJSON(historyData.recordAuditHistory.currentRecord),
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    </details>
                                )}
                            </div>

                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <RefreshCwIcon size={14} />
                                Change History
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-auto">
                                    {historyData.recordAuditHistory.auditHistory.length} entries found
                                </span>
                            </h4>

                            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                {historyData.recordAuditHistory.auditHistory.map((log, index) => (
                                    <div
                                        key={log.uid}
                                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'px-2 py-0.5 text-xs font-semibold rounded-full border',
                                                        operationColors[log.operation]
                                                    )}
                                                >
                                                    {log.operation}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">#{historyData.recordAuditHistory.auditHistory.length - index}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatDateTime(log.changedAt)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">By:</span>
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                {log.changedBy ? log.changedBy.substring(0, 20) + (log.changedBy.length > 20 ? '...' : '') : 'System'}
                                            </span>
                                        </div>

                                        <details className="text-xs group">
                                            <summary className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium select-none flex items-center gap-1">
                                                <span>Show Changes</span>
                                                <span className="group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                                                {log.oldValues && (
                                                    <div>
                                                        <span className="text-red-600 dark:text-red-400 font-bold block mb-1">Old Values:</span>
                                                        <pre className="bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/30 mt-1 overflow-x-auto max-h-40 text-[10px] leading-relaxed dark:text-gray-300">
                                                            {JSON.stringify(parseJSON(log.oldValues), null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {log.newValues && (
                                                    <div>
                                                        <span className="text-green-600 dark:text-green-400 font-bold block mb-1">New Values:</span>
                                                        <pre className="bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-900/30 mt-1 overflow-x-auto max-h-40 text-[10px] leading-relaxed dark:text-gray-300">
                                                            {JSON.stringify(parseJSON(log.newValues), null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileTextIcon size={48} className="mx-auto mb-3 text-gray-200" />
                            <p className="text-gray-500 font-medium">No audit history found for this record</p>
                        </div>
                    )}
            </Modal >
        </div >
    );
};

