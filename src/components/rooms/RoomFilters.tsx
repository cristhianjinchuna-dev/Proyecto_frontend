import { useEffect, useState } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import type { RoomFilterValues } from '../../hooks/useRoomFilters';
import type { RoomSort } from '../../types/room';

const SORT_OPTIONS: { value: RoomSort; label: string }[] = [
    { value: 'recomendadas', label: 'Recomendadas (destacadas primero)' },
    { value: 'precio_asc', label: 'Precio: menor a mayor' },
    { value: 'precio_desc', label: 'Precio: mayor a menor' },
    { value: 'area_desc', label: 'Área: mayor a menor' },
];

type TextFilters = Pick<RoomFilterValues, 'search' | 'minPrice' | 'maxPrice'>;

interface RoomFiltersProps {
    filters: RoomFilterValues;
    hasFilters: boolean;
    onChange: (changes: Partial<RoomFilterValues>) => void;
    onClear: () => void;
}

const INPUT_BASE = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// Search + price range + sort for the room list (EP 008)
export function RoomFilters({ filters, hasFilters, onChange, onClear }: RoomFiltersProps) {
    // While typing we keep a local draft; the URL (and the request) waits for the debounce
    const [draft, setDraft] = useState<TextFilters | null>(null);
    const shown: TextFilters = draft ?? filters;

    const min = shown.minPrice === '' ? null : Number(shown.minPrice);
    const max = shown.maxPrice === '' ? null : Number(shown.maxPrice);
    const priceError = min !== null && max !== null && min > max ? 'El mínimo no puede ser mayor que el máximo' : null;

    // Debounce: apply the filters 400 ms after the user stops typing
    useEffect(() => {
        if (draft === null) return;
        const { minPrice, maxPrice } = draft;
        if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) return; // invalid range

        const timer = window.setTimeout(() => {
        onChange(draft);
        setDraft(null); // from now on the inputs follow the URL again
        }, 400);
        return () => window.clearTimeout(timer); // typed again -> restart the countdown
    }, [draft, onChange]);

    function updateDraft(changes: Partial<TextFilters>) {
        setDraft((prev) => ({ ...(prev ?? filters), ...changes }));
    }

    function handleClear() {
        setDraft(null);
        onClear();
    }

    return (
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
            <div className="relative">
            <label htmlFor="room-search" className="sr-only">
                Buscar por dirección o distrito
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
                id="room-search"
                type="search"
                value={shown.search}
                onChange={(e) => updateDraft({ search: e.target.value })}
                placeholder="Buscar por dirección o distrito (ej. Barranco)"
                maxLength={100}
                className={`${INPUT_BASE} pl-9`}
            />
            </div>

            <div>
            <label htmlFor="min-price" className="sr-only">
                Precio mínimo
            </label>
            <input
                id="min-price"
                type="number"
                inputMode="numeric"
                min={0}
                value={shown.minPrice}
                onChange={(e) => updateDraft({ minPrice: e.target.value })}
                placeholder="S/ mín."
                aria-invalid={Boolean(priceError)}
                className={INPUT_BASE}
            />
            </div>

            <div>
            <label htmlFor="max-price" className="sr-only">
                Precio máximo
            </label>
            <input
                id="max-price"
                type="number"
                inputMode="numeric"
                min={0}
                value={shown.maxPrice}
                onChange={(e) => updateDraft({ maxPrice: e.target.value })}
                placeholder="S/ máx."
                aria-invalid={Boolean(priceError)}
                className={INPUT_BASE}
            />
            </div>

            <div className="relative">
            <label htmlFor="room-sort" className="sr-only">
                Ordenar por
            </label>
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <select
                id="room-sort"
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value as RoomSort })}
                className={`${INPUT_BASE} pl-9`}
            >
                {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
            </select>
            </div>
        </div>

        {(priceError || hasFilters) && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-red-600">{priceError}</p>
            {hasFilters && (
                <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                >
                <X className="h-4 w-4" aria-hidden /> Limpiar filtros
                </button>
            )}
            </div>
        )}
        </div>
    );
}