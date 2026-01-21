/// <reference types="google.maps" />
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { loadPlaces } from './googleLoader';
import { Input } from '@/components/ui/Input';

type Prediction = { description: string; place_id: string };
type Props = {
    /** Controlled address string */
    value: string;
    /** Called on free-typed change (keeps your form controlled) */
    onChange: (text: string) => void;
    /** Called when the user selects a place (returns address + parsed bits) */
    onSelect: (payload: {
        address: string;
        state?: string;
        suburb?: string;
        postcode?: string;
        unitNumber?: string;
        streetNumber?: string;
        streetName?: string;
        streetType?: string;
        country?: string;
        placeId?: string;
        lat?: number;
        lng?: number;
    }) => void;
    placeholder?: string;
    /** Restrict to certain countries (default AU) */
    countries?: string[];
    /** Optional: z-index for the dropdown */
    zIndexClass?: string; // e.g. "z-50"
};

export default function LocationAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = 'Start typing address',
    countries = ['au'],
    zIndexClass = 'z-50',
}: Props) {
    const [googleReady, setGoogleReady] = useState(false);
    const [options, setOptions] = useState<Prediction[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);

    const acRef = useRef<google.maps.places.AutocompleteService | null>(null);
    const psRef = useRef<google.maps.places.PlacesService | null>(null);
    const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLUListElement | null>(null);
    const debounceId = useRef<number | null>(null);
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

    useEffect(() => {
        let mounted = true;
        (async () => {
            const google = await loadPlaces();
            if (!mounted) return;
            acRef.current = new google.maps.places.AutocompleteService();
            psRef.current = new google.maps.places.PlacesService(document.createElement('div'));
            tokenRef.current = new google.maps.places.AutocompleteSessionToken();
            setGoogleReady(true);
        })();
        return () => {
            mounted = false;
            if (debounceId.current) window.clearTimeout(debounceId.current);
        };
    }, []);

    // close on outside click
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

    useLayoutEffect(() => {
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

    const fetchPredictions = (text: string) => {
        if (!acRef.current || !googleReady) return;
        setLoading(true);
        acRef.current.getPlacePredictions(
            {
                input: text,
                types: ['geocode'],
                componentRestrictions: { country: countries },
                sessionToken: tokenRef.current || undefined,
            },
            (preds) => {
                setOptions((preds || []).map((p: any) => ({ description: p.description, place_id: p.place_id! })));
                setLoading(false);
                setOpen(true);
                setActiveIndex(-1);
                updateDropdownPosition();
            }
        );
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onChange(text);
        if (!text.trim()) {
            setOptions([]);
            setOpen(false);
            setDropdownRect(null);
            return;
        }
        if (debounceId.current) window.clearTimeout(debounceId.current);
        debounceId.current = window.setTimeout(() => fetchPredictions(text), 220);
        updateDropdownPosition();
    };

    const parseComponents = (place: google.maps.places.PlaceResult) => {
        const comps = place.address_components || [];
        const byType = (t: string, field: 'long_name' | 'short_name' = 'long_name') =>
            comps.find(c => c.types.includes(t))?.[field] || '';
        const state = byType('administrative_area_level_1', 'short_name');
        const suburb = byType('locality') || byType('sublocality') || byType('postal_town');
        const postcode = byType('postal_code');
        const unitNumber = byType('subpremise');
        const streetNumber = byType('street_number');
        const route = byType('route');
        const routeParts = route.trim().split(/\s+/).filter(Boolean);
        const streetType = routeParts.length > 1 ? routeParts[routeParts.length - 1] : '';
        const streetName = routeParts.length > 1 ? routeParts.slice(0, -1).join(' ') : route;
        const country = byType('country', 'short_name') || byType('country');
        const loc = place.geometry?.location;
        return {
            state,
            suburb,
            postcode,
            unitNumber,
            streetNumber,
            streetName,
            streetType,
            country,
            lat: loc?.lat?.(),
            lng: loc?.lng?.(),
        };
    };

    const selectPlaceId = (p: Prediction) => {
        const closeDropdown = () => {
            setOpen(false);
            setDropdownRect(null);
        };
        if (!psRef.current) {
            onSelect({
                address: p.description,
                placeId: p.place_id,
                unitNumber: '',
                streetNumber: '',
                streetName: '',
                streetType: '',
                suburb: '',
                postcode: '',
                state: '',
                country: '',
            });
            closeDropdown();
            return;
        }
        psRef.current.getDetails(
            {
                placeId: p.place_id,
                fields: ['formatted_address', 'address_components', 'geometry', 'place_id'],
                sessionToken: tokenRef.current || undefined,
            },
            (place: any, status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    const address = place.formatted_address || p.description;
                    const parts = parseComponents(place);
                    onSelect({ address, placeId: place.place_id!, ...parts });
                } else {
                    onSelect({ address: p.description, placeId: p.place_id });
                }
                // refresh token for next session
                tokenRef.current = new google.maps.places.AutocompleteSessionToken();
                closeDropdown();
            }
        );
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
                selectPlaceId(options[activeIndex]);
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
                className={`${zIndexClass} bg-white dark:bg-neutral-900 text-foreground border border-border rounded-xl shadow-xl max-h-72 overflow-auto`}
                style={{ position: 'absolute', top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
            >
                {loading && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
                )}
                {!loading && options.length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
                )}
                {options.map((opt, idx) => (
                    <li
                        key={opt.place_id}
                        role="option"
                        aria-selected={idx === activeIndex}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${idx === activeIndex ? 'bg-accent text-accent-foreground' : ''}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                        onClick={() => selectPlaceId(opt)}
                        title={opt.description}
                    >
                        {opt.description}
                    </li>
                ))}
            </ul>,
            document.body
        )
        : null;

    return (
        <div className="relative" ref={containerRef}>
            <Input
                ref={inputRef}
                placeholder={placeholder}
                value={value}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                onFocus={() => { if (options.length) { setOpen(true); updateDropdownPosition(); } }}
                autoComplete="off"
            />

            {dropdown}

        </div>
    );
}
