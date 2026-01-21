import { useQuery } from '@apollo/client';
import { GET_CUSTOMER_DASHBOARD } from '../graphql';
import { useState } from 'react';

interface CustomerSummaryItem {
    uid: string;
    customerId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    status: number | null;
    utilmateStatus?: number | null;
    vppConnected?: number | null;
}

interface SummaryCategory {
    count: number;
    customers: CustomerSummaryItem[];
}

interface CustomerDashboardData {
    customerDashboard: {
        utilmateStatusSummary: SummaryCategory;
        signedStatusSummary: SummaryCategory;
        vppPendingSummary: SummaryCategory;
    };
}

// Status badge config
const getStatusBadge = (status: number | null) => {
    switch (status) {
        case 0: return { label: 'Pending', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
        case 1: return { label: 'In Progress', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
        case 2: return { label: 'Submitted', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
        case 3: return { label: 'Signed', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        default: return { label: 'Unknown', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
    }
};

// Card component
interface StatCardProps {
    title: string;
    count: number;
    customers: CustomerSummaryItem[];
    accentColor: string;
    isExpanded: boolean;
    onToggle: () => void;
}

const StatCard = ({ title, count, customers, accentColor, isExpanded, onToggle }: StatCardProps) => {
    return (
        <div className="flex flex-col">
            {/* Card */}
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={onToggle}
            >
                {/* Accent bar */}
                <div className={`h-1 ${accentColor}`} />

                <div className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {isExpanded ? 'Hide' : 'Show'}
                            </span>
                            <svg
                                className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded list */}
            {isExpanded && customers.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {customers.map((customer) => {
                                    const badge = getStatusBadge(customer.status);
                                    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '-';
                                    return (
                                        <tr key={customer.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {customer.customerId || '-'}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.email || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${badge.bg}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isExpanded && customers.length === 0 && (
                <div className="mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No customers found</p>
                </div>
            )}
        </div>
    );
};

export function DashboardPage() {
    const { data, loading, error } = useQuery<CustomerDashboardData>(GET_CUSTOMER_DASHBOARD);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

    const toggleCard = (cardId: string) => {
        setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer summary overview</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
                            <div className="h-4 bg-muted dark:bg-gray-800 rounded w-1/2 mb-3" />
                            <div className="h-8 bg-muted dark:bg-gray-800 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer summary overview</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-400">Error loading dashboard: {error.message}</p>
                </div>
            </div>
        );
    }

    const { utilmateStatusSummary, signedStatusSummary, vppPendingSummary } = data?.customerDashboard || {
        utilmateStatusSummary: { count: 0, customers: [] },
        signedStatusSummary: { count: 0, customers: [] },
        vppPendingSummary: { count: 0, customers: [] },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer summary overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Utilmate Active"
                    count={utilmateStatusSummary.count}
                    customers={utilmateStatusSummary.customers}
                    accentColor="bg-emerald-500"
                    isExpanded={expandedCards['utilmate'] || false}
                    onToggle={() => toggleCard('utilmate')}
                />

                <StatCard
                    title="Signed Customers"
                    count={signedStatusSummary.count}
                    customers={signedStatusSummary.customers}
                    accentColor="bg-blue-500"
                    isExpanded={expandedCards['signed'] || false}
                    onToggle={() => toggleCard('signed')}
                />

                <StatCard
                    title="VPP Pending"
                    count={vppPendingSummary.count}
                    customers={vppPendingSummary.customers}
                    accentColor="bg-amber-500"
                    isExpanded={expandedCards['vpp'] || false}
                    onToggle={() => toggleCard('vpp')}
                />
            </div>
        </div>
    );
}
