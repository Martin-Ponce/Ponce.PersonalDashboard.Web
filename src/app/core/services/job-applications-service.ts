import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationFilters,
  ApplicationSortField,
  JobApplication,
  JobApplicationRequest,
  JobApplicationsSummary,
} from '../models/job-applications/job-application-models';
import { PaginatedResult } from '../models/pagination/pagination-models';
import { HttpManagerService } from './http-manager-service';
import { PaginationService } from './pagination-service';

const SORT_KEYS: Record<ApplicationSortField, string> = {
  appliedOn: 'dateapplied',
  updatedAt: 'updatedat',
  company: 'company',
  role: 'jobtitle',
  status: 'status',
};

@Injectable({
  providedIn: 'root',
})
export class JobApplicationsService {
  private readonly httpService = inject(HttpManagerService);
  private readonly paginationService = inject(PaginationService);
  private readonly urlJobApplications = `${environment.apiUrl}/api/jobapplications`;

  /** One page (1-based) of the month's filtered applications. */
  getApplicationsIn(
    year: number,
    month: number,
    page: number,
    pageSize: number,
    filters: ApplicationFilters,
  ): Observable<PaginatedResult<JobApplication[]>> {
    const params = filterParams(year, month, filters)
      .set('pageNumber', page)
      .set('pageSize', pageSize);
    return this.httpService
      .getWithParams<JobApplication[]>(this.urlJobApplications, { params, observe: 'response' })
      .pipe(this.paginationService.extractPagination<JobApplication[]>());
  }

  countApplicationsIn(
    year: number,
    month: number,
    filters: ApplicationFilters,
  ): Observable<number> {
    return this.getApplicationsIn(year, month, 1, 1, filters).pipe(
      map(({ pagination }) => pagination?.totalCount ?? 0),
    );
  }

  getMonthlySummary(year: number, month: number): Observable<JobApplicationsSummary> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.httpService.getWithParams<JobApplicationsSummary>(
      `${this.urlJobApplications}/summary`,
      { params },
    );
  }

  /** Today if it's the current month, else that month's last day. */
  applicationDate(year: number, month: number): Date {
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    return isCurrentMonth ? now : new Date(year, month, 0, 12);
  }

  createApplication(request: JobApplicationRequest): Observable<JobApplication> {
    return this.httpService.post<JobApplication>(this.urlJobApplications, request);
  }

  updateApplication(id: string, request: JobApplicationRequest): Observable<JobApplication> {
    return this.httpService.put<JobApplication>(`${this.urlJobApplications}/${id}`, request);
  }

  deleteApplication(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.urlJobApplications}/${id}`);
  }
}

/** Month, filters and sort as API query params. */
function filterParams(year: number, month: number, filters: ApplicationFilters): HttpParams {
  let params = new HttpParams()
    .set('year', year)
    .set('month', month)
    .set('sort', SORT_KEYS[filters.sort] + (filters.direction === 'desc' ? '_desc' : ''));
  const search = filters.search.trim();
  if (search) params = params.set('filter', search);
  for (const status of filters.statuses) params = params.append('statuses', status);
  for (const mode of filters.workModes) params = params.append('workModes', mode);
  for (const city of filters.cities) params = params.append('cities', city);
  return params;
}
