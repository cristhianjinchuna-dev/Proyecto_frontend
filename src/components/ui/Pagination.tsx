import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../../hooks/usePagination';

interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

// e.g. [0, 'ellipsis', 4, 5, 6, 'ellipsis', 19]
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const candidates = [0, current - 1, current, current + 1, total - 1];
  const pages = [...new Set(candidates)].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1] > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
}

const ARROW_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
}: PaginationProps) {
  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row"
    >
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-semibold text-gray-900">{from}</span>–
        <span className="font-semibold text-gray-900">{to}</span> de{' '}
        <span className="font-semibold text-gray-900">{totalElements}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className={ARROW_BUTTON}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        {getPageNumbers(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${
                item === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className={ARROW_BUTTON}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {onSizeChange && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Por página
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
}