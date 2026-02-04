import React from 'react';
import { Select } from '@/components/ui/Select';
import {
    CUSTOMER_STATUS_MAP,
    CUSTOMER_LEGACY_STATUS_MAP,
    USER_STATUS_OPTIONS,
    DNSP_MAP,
    DNSP_OPTIONS,
    RATE_TYPE_MAP,
    RATE_TYPE_OPTIONS,
    STATE_OPTIONS,
    VPP_OPTIONS
} from '@/lib/constants';

export type StatusFieldType = 'customer_status' | 'user_status' | 'dnsp' | 'rate_type' | 'state' | 'vpp';

interface StatusFieldProps {
    value: string | number | null | undefined;
    type: StatusFieldType;
    mode?: 'badge' | 'select' | 'text';
    onChange?: (value: any) => void;
    className?: string;
    placeholder?: string;
    showAllOption?: boolean; // For filter Selects
}

export const StatusField: React.FC<StatusFieldProps> = ({
    value,
    type,
    mode = 'badge',
    onChange,
    className = '',
    placeholder,
    showAllOption = false,
}) => {
    // 1. Determine Label and Color for View Mode
    let label = '-';
    let colorClass = 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';

    if (type === 'customer_status') {
        if (typeof value === 'number' && CUSTOMER_STATUS_MAP[value]) {
            label = CUSTOMER_STATUS_MAP[value].label;
            colorClass = CUSTOMER_STATUS_MAP[value].color;
        } else if (typeof value === 'string' && CUSTOMER_LEGACY_STATUS_MAP[value]) {
            label = value; // Legacy map keys are the labels (e.g. 'ACTIVE')
            colorClass = CUSTOMER_LEGACY_STATUS_MAP[value];
        } else {
            label = String(value || '-');
        }
    } else if (type === 'user_status') {
        const valStr = String(value || '');
        label = valStr === 'ACTIVE' ? 'Active' : valStr === 'INACTIVE' ? 'Inactive' : valStr;
        if (valStr === 'ACTIVE') colorClass = 'text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400';
        else if (valStr === 'INACTIVE') colorClass = 'text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400';
    } else if (type === 'dnsp') {
        const valStr = value !== null && value !== undefined ? String(value) : '';
        label = DNSP_MAP[valStr] || valStr || '-';

        // Specific colors for DNSPs
        if (valStr === '0') colorClass = 'text-blue-700 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400';
        else if (valStr === '1') colorClass = 'text-orange-700 bg-orange-50 dark:bg-orange-900/10 dark:text-orange-400';
        else if (valStr === '2') colorClass = 'text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400';
        else if (valStr === '3') colorClass = 'text-purple-700 bg-purple-50 dark:bg-purple-900/10 dark:text-purple-400';
    } else if (type === 'rate_type') {
        const valStr = String(value ?? '');
        label = RATE_TYPE_MAP[valStr] || valStr || '-';
    } else if (type === 'state') {
        label = String(value || '-');
    } else if (type === 'vpp') {
        const valStr = String(value ?? '');
        label = valStr === '1' ? 'With VPP' : 'No VPP';
        if (valStr === '1') colorClass = 'text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400';
        else colorClass = 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }

    // 2. Render View Mode
    if (mode === 'badge') {
        // For DNSP/Type/State/VPP, maybe just text or simple badge
        if (type === 'dnsp' || type === 'rate_type' || type === 'state' || type === 'vpp') {
            if (type === 'vpp' || type === 'dnsp') {
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClass} ${className}`}>
                        {label}
                    </span>
                );
            }
            return <span className={`text-sm ${className}`}>{label}</span>;
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
                {label}
            </span>
        );
    }

    if (mode === 'text') {
        return <span className={className}>{label}</span>;
    }

    // 3. Render Select Mode
    let options: { value: string; label: string }[] = [];

    if (type === 'customer_status') {
        // Construct options from map
        options = Object.entries(CUSTOMER_STATUS_MAP).map(([k, v]) => ({
            value: k, // Keep as string for Select
            label: v.label
        }));
    } else if (type === 'user_status') {
        options = USER_STATUS_OPTIONS;
    } else if (type === 'dnsp') {
        options = DNSP_OPTIONS;
    } else if (type === 'rate_type') {
        options = RATE_TYPE_OPTIONS;
    } else if (type === 'state') {
        options = STATE_OPTIONS;
    } else if (type === 'vpp') {
        options = VPP_OPTIONS;
    }

    if (showAllOption) {
        options = [{ value: '', label: 'All' }, ...options];
    }

    const handleChange = (val: string | string[]) => {
        if (!onChange) return;

        // We assume single select for now as this component is for status fields
        const valueStr = Array.isArray(val) ? val[0] : val;

        // Convert back to number if needed
        if (type === 'customer_status' && valueStr !== '') {
            onChange(Number(valueStr));
        } else {
            onChange(valueStr);
        }
    };

    return (
        <Select
            options={options}
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={handleChange}
            placeholder={placeholder}
            containerClassName={className}
        />
    );
};
