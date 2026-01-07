import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// List of major Australian banks
const AUSTRALIAN_BANKS = [
    'Australia and New Zealand Banking Group (ANZ)',
    'Bank of Melbourne',
    'Bank of Queensland',
    'Bank of Sydney',
    'Bankwest',
    'Bendigo and Adelaide Bank',
    'Beyond Bank Australia',
    'Commonwealth Bank of Australia',
    'Greater Bank',
    'Heritage Bank',
    'Horizon Bank',
    'HSBC Australia',
    'IMB Bank',
    'ING Australia',
    'Macquarie Bank',
    'ME Bank',
    'NAB (National Australia Bank)',
    'Newcastle Permanent',
    'P&N Bank',
    'People\'s Choice',
    'Police Bank',
    'RACQ Bank',
    'Rabobank Australia',
    'St.George Bank',
    'Suncorp Bank',
    'Teachers Mutual Bank',
    'Ubank',
    'Westpac Banking Corporation',
];

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    zIndexClass?: string;
};

export default function BankAutocomplete({
    value,
    onChange,
    placeholder = 'Start typing bank name',
    className = '',
    zIndexClass = 'z-50',
}: Props) {
    const [options, setOptions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLUListElement | null>(null);
    const [dropdownRect, setDropdownRect] = useState<{ width: number; top: number; left: number } | null>(null);

    const updateDropdownPosition = useCallback(() => {
        const inputEl = inputRef.current;
        if (!inputEl) return;
        const rect = inputEl.getBoundingClientRect();
        setDropdownRect({
            width: rect.width,
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
    }, []);

    // Close on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node;
            const insideInput = containerRef.current?.contains(target);
            const insideDropdown = dropdownRef.current?.contains(target);
            if (!insideInput && !insideDropdown) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(() => {
        if (!open) return;
        updateDropdownPosition();
        const handle = () => updateDropdownPosition();
        window.addEventListener('resize', handle);
        window.addEventListener('scroll', handle, true);
        return () => {
            window.removeEventListener('resize', handle);
            window.removeEventListener('scroll', handle, true);
        };
    }, [open, options.length, updateDropdownPosition]);

    const filterBanks = (text: string) => {
        if (!text.trim()) {
            setOptions([]);
            setOpen(false);
            return;
        }
        const lower = text.toLowerCase();
        const filtered = AUSTRALIAN_BANKS.filter(bank =>
            bank.toLowerCase().includes(lower)
        );
        setOptions(filtered);
        setActiveIndex(-1);
        setOpen(filtered.length > 0);
        updateDropdownPosition();
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onChange(text);
        filterBanks(text);
    };

    const selectBank = (bank: string) => {
        onChange(bank);
        setOpen(false);
        setDropdownRect(null);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !options.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0) {
                e.preventDefault();
                selectBank(options[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setDropdownRect(null);
        }
    };

    const dropdown = open && dropdownRect
        ? createPortal(
            <ul
                ref={node => { dropdownRef.current = node; }}
                role="listbox"
                className={`${zIndexClass} bg-white border rounded-xl shadow-xl max-h-72 overflow-auto`}
                style={{ position: 'absolute', top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
            >
                {options.length === 0 && (
                    <li className="px-3 py-2 text-sm text-neutral-500">No matches</li>
                )}
                {options.map((opt, idx) => (
                    <li
                        key={opt}
                        role="option"
                        aria-selected={idx === activeIndex}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-neutral-50 ${idx === activeIndex ? 'bg-neutral-100' : ''}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectBank(opt)}
                    >
                        {opt}
                    </li>
                ))}
            </ul>,
            document.body
        )
        : null;

    return (
        <div className="relative" ref={containerRef}>
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                onFocus={() => { if (value.trim()) filterBanks(value); }}
                autoComplete="off"
                className={className || 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors'}
            />
            {dropdown}
        </div>
    );
}
