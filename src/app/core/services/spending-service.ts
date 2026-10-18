import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult } from '../models/pagination/pagination-models';
import {
  Balance,
  CreateSpendingEntryRequest,
  EntryFilters,
  EntrySortField,
  MonthlySummary,
  SaveSpendingEntryResponse,
  SetMonthlyBudgetRequest,
  SpendingEntriesPage,
  SpendingEntryRequest,
} from '../models/spending/spending-models';
import { HttpManagerService } from './http-manager-service';
import { PaginationService } from './pagination-service';

const SORT_KEYS: Record<EntrySortField, string> = {
  createdAt: 'createdat',
  updatedAt: 'updatedat',
  name: 'description',
  amount: 'amount',
  category: 'category',
};

/** Entries (the API's "transactions"), monthly budgets and the account balance. */
@Injectable({
  providedIn: 'root',
})
export class SpendingService {
  private readonly httpService = inject(HttpManagerService);
  private readonly paginationService = inject(PaginationService);
  private readonly urlFinances = `${environment.apiUrl}/api/finances`;
  private readonly urlTransactions = `${this.urlFinances}/transactions`;

  /** One page (1-based) of the month's filtered entries. */
  getEntries(
    year: number,
    month: number,
    page: number,
    pageSize: number,
    filters: EntryFilters,
  ): Observable<PaginatedResult<SpendingEntriesPage>> {
    const params = filterParams(year, month, filters)
      .set('pageNumber', page)
      .set('pageSize', pageSize);
    return this.httpService
      .getWithParams<SpendingEntriesPage>(this.urlTransactions, { params, observe: 'response' })
      .pipe(this.paginationService.extractPagination<SpendingEntriesPage>());
  }

  countEntries(year: number, month: number, filters: EntryFilters): Observable<number> {
    return this.getEntries(year, month, 1, 1, filters).pipe(
      map(({ pagination }) => pagination?.totalCount ?? 0),
    );
  }

  createEntry(
    year: number,
    month: number,
    request: SpendingEntryRequest,
  ): Observable<SaveSpendingEntryResponse> {
    const body: CreateSpendingEntryRequest = { ...request, month, year };
    return this.httpService.post<SaveSpendingEntryResponse>(this.urlTransactions, body);
  }

  updateEntry(id: string, request: SpendingEntryRequest): Observable<SaveSpendingEntryResponse> {
    return this.httpService.put<SaveSpendingEntryResponse>(
      `${this.urlTransactions}/${id}`,
      request,
    );
  }

  deleteEntry(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.urlTransactions}/${id}`);
  }

  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.httpService.getWithParams<MonthlySummary>(`${this.urlFinances}/summary`, {
      params,
    });
  }

  getBudget(year: number, month: number): Observable<number | null> {
    return this.getMonthlySummary(year, month).pipe(map(budgetOf));
  }

  setBudget(year: number, month: number, amount: number): Observable<MonthlySummary> {
    const body: SetMonthlyBudgetRequest = { budget: amount };
    return this.httpService.put<MonthlySummary>(
      `${this.urlFinances}/summary/budget?year=${year}&month=${month}`,
      body,
    );
  }

  getBalance(): Observable<Balance> {
    return this.httpService.get<Balance>(`${this.urlFinances}/balance`);
  }
}

function budgetOf(summary: MonthlySummary): number | null {
  return summary.hasBudget ? summary.budget : null;
}

/** Month, filters and sort as API query params. */
function filterParams(year: number, month: number, filters: EntryFilters): HttpParams {
  let params = new HttpParams()
    .set('year', year)
    .set('month', month)
    .set('sort', SORT_KEYS[filters.sort] + (filters.direction === 'desc' ? '_desc' : ''));
  const name = filters.nameContains.trim();
  if (name) params = params.set('filter', name);
  for (const type of filters.types) params = params.append('types', type);
  for (const category of filters.categories) params = params.append('categories', category);
  if (filters.minAmount !== null) params = params.set('minAmount', filters.minAmount);
  if (filters.maxAmount !== null) params = params.set('maxAmount', filters.maxAmount);
  return params;
}
