import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column, Modal } from '@/components/common';
import {
    RefreshCwIcon,
    SearchIcon,
    EyeIcon,
    MailIcon,
    ChevronRightIcon,
} from '@/components/icons';
import { GET_ALL_EMAIL_LOGS } from '@/graphql';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/date';
import {
    EMAIL_STATUS_MAP,
    EMAIL_STATUS_OPTIONS,
    EMAIL_TYPE_LABELS,
    EMAIL_TYPE_OPTIONS,
} from '@/lib/constants';

// Types
interface EmailLog {
    id: string;
    customerUid: string;
    customerId: string | null;
    emailTo: string | null;
    emailType: string | null;
    subject: string | null;
    body: string | null;
    status: number;
    errorMessage: string | null;
    sentAt: string | null;
    verifiedAt: string | null;
    createdAt: string;
    createdBy: string | null;
    tenant: string | null;
    verificationCode: string | null;
}

interface EmailLogsResponse {
    allEmailLogs: {
        meta: {
            totalRecords: number;
            currentPage: number;
            totalPages: number;
            recordsPerPage: number;
        };
        data: EmailLog[];
    };
}

export function EmailLogsPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [emailTypeFilter, setEmailTypeFilter] = useState<string>('');
    const [allLogs, setAllLogs] = useState<EmailLog[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Modal states
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

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

    // Fetch email logs
    const { data, loading, error, refetch } = useQuery<EmailLogsResponse>(GET_ALL_EMAIL_LOGS, {
        variables: {
            page,
            limit,
            search: debouncedSearch || undefined,
            status: statusFilter ? parseInt(statusFilter, 10) : undefined,
            emailType: emailTypeFilter || undefined,
        },
        fetchPolicy: 'cache-and-network',
    });

    const meta = data?.allEmailLogs?.meta;
    const hasMore = meta ? page < meta.totalPages : false;

    // Update allLogs when data changes
    useEffect(() => {
        if (data?.allEmailLogs?.data) {
            const fetchedLogs = data.allEmailLogs.data;

            if (page === 1) {
                setAllLogs(fetchedLogs);
            } else {
                setAllLogs(prev => {
                    const existingIds = new Set(prev.map(l => l.id));
                    const newLogs = fetchedLogs.filter(l => !existingIds.has(l.id));
                    return [...prev, ...newLogs];
                });
            }
            setIsLoadingMore(false);
        }
    }, [data, page]);

    // Handle filter changes
    const handleStatusFilterChange = (val: string) => {
        setAllLogs([]);
        setPage(1);
        setStatusFilter(val);
    };

    const handleEmailTypeFilterChange = (val: string) => {
        setAllLogs([]);
        setPage(1);
        setEmailTypeFilter(val);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setIsLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    // View log details
    const handleViewDetails = (log: EmailLog) => {
        setSelectedLog(log);
        setDetailModalOpen(true);
    };

    // Get status display
    const getStatusDisplay = (status: number) => {
        const statusInfo = EMAIL_STATUS_MAP[status as keyof typeof EMAIL_STATUS_MAP] || { label: 'Unknown', color: 'bg-gray-100 text-gray-600' };
        return statusInfo;
    };

    // Toggle batch expansion
    const toggleBatchExpansion = (batchKey: string) => {
        setExpandedBatches(prev => {
            const next = new Set(prev);
            if (next.has(batchKey)) {
                next.delete(batchKey);
            } else {
                next.add(batchKey);
            }
            return next;
        });
    };

    // Process logs to group bulk emails by sentAt
    const processedLogs = useMemo(() => {
        const result: Array<EmailLog & { _isBatchHeader?: boolean; _batchKey?: string; _batchCount?: number; _isChild?: boolean }> = [];
        const processedBatchKeys = new Set<string>();

        for (const log of allLogs) {
            // For non-bulk emails, just add them
            if (log.emailType !== 'BULK_EMAIL' || !log.sentAt) {
                result.push(log);
                continue;
            }

            // For bulk emails, group by sentAt
            const batchKey = `bulk_${log.sentAt}`;

            // Skip if we've already processed this batch
            if (processedBatchKeys.has(batchKey)) {
                continue;
            }

            // Mark this batch as processed
            processedBatchKeys.add(batchKey);

            // Get all items in this batch
            const batchItems = allLogs.filter(l =>
                l.emailType === 'BULK_EMAIL' &&
                l.sentAt === log.sentAt
            );

            const batchCount = batchItems.length;

            // Only create a batch header if there's more than 1 email
            if (batchCount > 1) {
                // Add the header row (summary only, no specific email)
                result.push({
                    ...log,
                    id: `batch_header_${batchKey}`,
                    emailTo: null, // Clear email - this is just a summary row
                    subject: `Bulk Email Batch`, // Generic subject for header
                    _isBatchHeader: true,
                    _batchKey: batchKey,
                    _batchCount: batchCount,
                });

                // If expanded, add ALL items in batch as children
                if (expandedBatches.has(batchKey)) {
                    for (const item of batchItems) {
                        result.push({ ...item, _isChild: true, _batchKey: batchKey });
                    }
                }
            } else {
                // Single bulk email - just show it normally
                result.push(log);
            }
        }

        return result;
    }, [allLogs, expandedBatches]);

    // Table Columns - handle both regular logs and grouped bulk emails
    type ProcessedEmailLog = EmailLog & { _isBatchHeader?: boolean; _batchKey?: string; _batchCount?: number; _isChild?: boolean };

    const columns: Column<ProcessedEmailLog>[] = useMemo(() => [
        {
            key: 'emailTo',
            header: 'Email To',
            width: 'w-[200px]',
            render: (log: ProcessedEmailLog) => {
                const isChild = log._isChild;
                const isBatchHeader = log._isBatchHeader;
                const batchCount = log._batchCount || 0;
                const batchKey = log._batchKey || '';
                const isExpanded = expandedBatches.has(batchKey);

                return (
                    <div className={cn("flex items-center gap-2", isChild && "pl-6")}>
                        {isBatchHeader ? (
                            <button
                                onClick={() => toggleBatchExpansion(batchKey)}
                                className="flex items-center gap-2 text-left group"
                            >
                                <ChevronRightIcon
                                    size={14}
                                    className={cn(
                                        "text-orange-500 transition-transform flex-shrink-0",
                                        isExpanded && "rotate-90"
                                    )}
                                />
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-semibold">
                                    {batchCount} emails
                                </span>
                            </button>
                        ) : (
                            <>
                                {isChild && <span className="w-3.5 border-l-2 border-b-2 border-orange-200 dark:border-orange-700 h-3 rounded-bl flex-shrink-0" />}
                                <MailIcon size={14} className={cn("text-muted-foreground flex-shrink-0", isChild && "text-orange-400")} />
                                <span className="text-sm text-foreground truncate max-w-[140px]" title={log.emailTo || ''}>
                                    {log.emailTo || <span className="text-muted-foreground italic">No email</span>}
                                </span>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'subject',
            header: 'Subject',
            width: 'w-[250px]',
            render: (log: ProcessedEmailLog) => (
                <span className="text-sm text-foreground truncate block max-w-[240px]" title={log.subject || ''}>
                    {log._isBatchHeader ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">{log.subject || 'Bulk Email Batch'}</span>
                    ) : (
                        log.subject || <span className="text-muted-foreground italic">No subject</span>
                    )}
                </span>
            )
        },
        {
            key: 'emailType',
            header: 'Type',
            width: 'w-[160px]',
            render: (log: ProcessedEmailLog) => {
                if (log._isBatchHeader) {
                    return (
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                            Bulk Email
                        </span>
                    );
                }

                if (log._isChild) {
                    return (
                        <span className="text-xs font-medium text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                            Bulk Email
                        </span>
                    );
                }

                return (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {EMAIL_TYPE_LABELS[log.emailType || ''] || log.emailType || 'Unknown'}
                    </span>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            width: 'w-[100px]',
            render: (log: ProcessedEmailLog) => {
                if (log._isBatchHeader) {
                    return <span className="text-xs text-muted-foreground">—</span>;
                }
                const statusInfo = getStatusDisplay(log.status);
                return (
                    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full border', statusInfo.color)}>
                        {statusInfo.label}
                    </span>
                );
            }
        },
        {
            key: 'sentAt',
            header: 'Sent At',
            width: 'w-[150px]',
            render: (log: ProcessedEmailLog) => (
                <span className="text-foreground text-sm">
                    {log.sentAt ? formatDateTime(log.sentAt) : <span className="text-muted-foreground italic">Not sent</span>}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            width: 'w-[100px]',
            render: (log: ProcessedEmailLog) => {
                if (log._isBatchHeader) {
                    const batchKey = log._batchKey || '';
                    const isExpanded = expandedBatches.has(batchKey);
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBatchExpansion(batchKey)}
                            className="h-8 px-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                    );
                }
                return (
                    <button
                        onClick={() => handleViewDetails(log)}
                        className="p-2 border rounded-lg transition-colors bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40"
                    >
                        <EyeIcon size={16} />
                    </button>
                );
            }
        }
    ], [expandedBatches, toggleBatchExpansion, getStatusDisplay, handleViewDetails]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Email Logs</h1>
                    <p className="text-muted-foreground">View all emails sent from the system</p>
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

            {/* Main Content Card */}
            <div className="p-5 bg-background rounded-lg border border-border shadow-sm">
                {/* Filters Row */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-[60px] flex-shrink-0">
                            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                        </div>
                        <Select
                            options={EMAIL_STATUS_OPTIONS}
                            value={statusFilter}
                            onChange={(val) => handleStatusFilterChange(val as string)}
                            placeholder="All Statuses"
                            containerClassName="w-[150px]"
                        />
                        <Select
                            options={EMAIL_TYPE_OPTIONS}
                            value={emailTypeFilter}
                            onChange={(val) => handleEmailTypeFilterChange(val as string)}
                            placeholder="All Types"
                            containerClassName="w-[170px]"
                        />
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Search by email or subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                containerClassName="w-full"
                                type='search'
                            />
                        </div>
                        {/* Clear Filters Button */}
                        {(searchQuery || statusFilter || emailTypeFilter) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    handleStatusFilterChange('');
                                    handleEmailTypeFilterChange('');
                                }}
                                className="text-muted-foreground"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Total Records Info */}
                {meta && (
                    <div className="mb-4 text-sm text-muted-foreground">
                        Showing {allLogs.length} of {meta.totalRecords} email logs
                    </div>
                )}

                {/* Data Table */}
                <DataTable
                    columns={columns as Column<EmailLog>[]}
                    data={processedLogs}
                    rowKey={(log) => log.id}
                    loading={loading && page === 1}
                    error={error?.message}
                    emptyMessage="No email logs found matching your criteria."
                    loadingMessage="Loading email logs..."
                    infiniteScroll
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    maxHeightClass="max-h-[calc(100vh-350px)]"
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Email Log Details"
                size="full"
                footer={
                    <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                        Close
                    </Button>
                }
            >
                {selectedLog && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Details */}
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Email Information</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email To</label>
                                        <p className="text-sm font-medium text-foreground break-all">
                                            {selectedLog.emailTo || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</label>
                                        <div className="mt-1">
                                            <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full border', getStatusDisplay(selectedLog.status).color)}>
                                                {getStatusDisplay(selectedLog.status).label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subject</label>
                                        <p className="text-sm text-foreground mt-1 font-medium">
                                            {selectedLog.subject || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email Type</label>
                                        <p className="text-sm text-foreground">
                                            {EMAIL_TYPE_LABELS[selectedLog.emailType || ''] || selectedLog.emailType || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sent At</label>
                                        <p className="text-sm text-foreground">
                                            {selectedLog.sentAt ? formatDateTime(selectedLog.sentAt) : 'Not sent'}
                                        </p>
                                    </div>
                                    {selectedLog.verifiedAt && (
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verified At</label>
                                            <p className="text-sm text-foreground">
                                                {formatDateTime(selectedLog.verifiedAt)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Created At</label>
                                        <p className="text-sm text-foreground">
                                            {formatDateTime(selectedLog.createdAt)}
                                        </p>
                                    </div>
                                    {selectedLog.verificationCode && (
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verification Code</label>
                                            <p className="text-sm font-mono text-foreground bg-card px-2 py-1 rounded border border-border mt-1">
                                                {selectedLog.verificationCode}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Customer ID</label>
                                        <p className="text-xs font-mono text-foreground break-all bg-card px-2 py-1 rounded border border-border mt-1">
                                            {selectedLog.customerId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedLog.errorMessage && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <label className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider font-semibold">Error Message</label>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        {selectedLog.errorMessage}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Email Preview */}
                        <div className="flex flex-col">
                            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Email Preview</h4>
                            <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-border bg-card min-h-[400px]">
                                {/* Email Header */}
                                <div className="border-b border-border bg-muted/50">
                                    <div className="flex items-center px-4 py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground w-16">To</span>
                                        <div className="flex-1 text-sm text-foreground">
                                            {selectedLog.emailTo || '—'}
                                        </div>
                                    </div>
                                    <div className="flex items-center px-4 py-2">
                                        <span className="text-sm text-muted-foreground w-16">Subject</span>
                                        <div className="flex-1 text-sm text-foreground font-medium">
                                            {selectedLog.subject || '(No subject)'}
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="flex-1 overflow-y-auto p-4 bg-card">
                                    {selectedLog.body ? (
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <div className="text-center">
                                                <MailIcon size={32} className="mx-auto mb-2 text-muted-foreground/50" />
                                                <p className="text-sm">No email body available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

