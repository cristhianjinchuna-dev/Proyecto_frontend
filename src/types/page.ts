// Spring Page serialized as { content, page: { size, number, totalElements, totalPages } }
export interface PageInfo {
  size: number;
  number: number; // 0-based
  totalElements: number;
  totalPages: number;
}

export interface Page<T> {
  content: T[];
  page: PageInfo;
}

export interface PageParams {
  page: number; // 0-based
  size: number;
}