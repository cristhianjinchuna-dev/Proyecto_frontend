import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RoomSearchParams, RoomSort } from '../types/room';

export interface RoomFilterValues {
    search: string;
    minPrice: string;
    maxPrice: string;
    sort: RoomSort;
}

export const DEFAULT_SORT: RoomSort = 'recomendadas';
const SORTS: RoomSort[] = ['recomendadas', 'precio_asc', 'precio_desc', 'area_desc'];

// URL param for each filter: /?q=barranco&minPrice=500&maxPrice=900&sort=precio_asc
const URL_KEYS: Record<keyof RoomFilterValues, string> = {
    search: 'q',
    minPrice: 'minPrice',
    maxPrice: 'maxPrice',
    sort: 'sort',
};

// Ignores prices typed by hand in the URL that are not valid numbers (?minPrice=abc)
function toPriceParam(value: string | null): string {
    return value !== null && Number.isFinite(Number(value)) && Number(value) >= 0 ? value : '';
}

// Filters live in the URL, so they survive a reload and can be shared
export function useRoomFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('q') ?? '';
    const minPrice = toPriceParam(searchParams.get('minPrice'));
    const maxPrice = toPriceParam(searchParams.get('maxPrice'));
    const sortParam = searchParams.get('sort') as RoomSort | null;
    const sort = sortParam && SORTS.includes(sortParam) ? sortParam : DEFAULT_SORT;

    const filters = useMemo<RoomFilterValues>(
        () => ({ search, minPrice, maxPrice, sort }),
        [search, minPrice, maxPrice, sort],
    );

    const hasFilters = search !== '' || minPrice !== '' || maxPrice !== '' || sort !== DEFAULT_SORT;

    const updateFilters = useCallback(
        (changes: Partial<RoomFilterValues>) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(changes) as [keyof RoomFilterValues, string][]) {
            const isDefault = value.trim() === '' || (key === 'sort' && value === DEFAULT_SORT);
            if (isDefault) next.delete(URL_KEYS[key]);
            else next.set(URL_KEYS[key], value.trim());
            }
            next.delete('page'); // new filters -> back to page 1
            return next;
        });
        },
        [setSearchParams],
    );

    const clearFilters = useCallback(() => {
        updateFilters({ search: '', minPrice: '', maxPrice: '', sort: DEFAULT_SORT });
    }, [updateFilters]);

    // Backend query params (axios omits the undefined ones)
    const apiParams = useMemo<Omit<RoomSearchParams, 'page' | 'size'>>(
        () => ({
        q: search || undefined,
        precioMin: minPrice ? Number(minPrice) : undefined,
        precioMax: maxPrice ? Number(maxPrice) : undefined,
        orden: sort === DEFAULT_SORT ? undefined : sort,
        }),
        [search, minPrice, maxPrice, sort],
    );

    return { filters, apiParams, hasFilters, updateFilters, clearFilters };
}