/** Paging info from the X-Pagination header. */
export interface PaginationResponse {
  totalPages: number;
  /** 1-based. */
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResult<T> {
  data: T;
  pagination: PaginationResponse | null;
}
