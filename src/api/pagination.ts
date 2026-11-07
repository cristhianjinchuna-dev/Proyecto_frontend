import type { Page } from '../types/page';

// Classic Spring Page JSON: pagination fields at the root
interface ClassicSpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

type RawPage<T> = Page<T> | ClassicSpringPage<T>;

// Accepts both Spring formats and always returns { content, page: {...} }
export function toPage<T>(raw: RawPage<T>): Page<T> {
  if ('page' in raw && raw.page) return raw;

  const classic = raw as ClassicSpringPage<T>;
  return {
    content: classic.content ?? [],
    page: {
      number: classic.number ?? 0,
      size: classic.size ?? classic.content?.length ?? 0,
      totalElements: classic.totalElements ?? 0,
      totalPages: classic.totalPages ?? 0,
    },
  };
}