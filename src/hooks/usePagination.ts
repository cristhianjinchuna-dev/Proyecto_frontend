import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface UsePaginationOptions {
  pageParam?: string;
  sizeParam?: string;
  defaultSize?: number;
}

export function usePagination({
  pageParam = 'page',
  sizeParam = 'size',
  defaultSize = 10,
}: UsePaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is 1-based (?page=1) for users; the backend is 0-based
  const urlPage = Number(searchParams.get(pageParam));
  const page = Number.isInteger(urlPage) && urlPage >= 1 ? urlPage - 1 : 0;

  const urlSize = Number(searchParams.get(sizeParam));
  const size = (PAGE_SIZE_OPTIONS as readonly number[]).includes(urlSize) ? urlSize : defaultSize;

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage <= 0) next.delete(pageParam);
        else next.set(pageParam, String(newPage + 1));
        return next;
      });
    },
    [setSearchParams, pageParam],
  );

  const setSize = useCallback(
    (newSize: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(sizeParam, String(newSize));
        next.delete(pageParam); // back to the first page
        return next;
      });
    },
    [setSearchParams, sizeParam, pageParam],
  );

  return { page, size, setPage, setSize };
}