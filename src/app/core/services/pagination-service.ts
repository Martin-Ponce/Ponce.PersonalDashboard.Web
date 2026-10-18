import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OperatorFunction, map } from 'rxjs';
import { PaginatedResult, PaginationResponse } from '../models/pagination/pagination-models';

const PAGINATION_HEADER = 'X-Pagination';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  /** Pairs the body with the paging info from the X-Pagination header. */
  extractPagination<T>(): OperatorFunction<HttpResponse<T>, PaginatedResult<T>> {
    return map((response) => {
      const header = response.headers.get(PAGINATION_HEADER);
      return {
        data: response.body as T,
        pagination: header ? (JSON.parse(header) as PaginationResponse) : null,
      };
    });
  }
}
