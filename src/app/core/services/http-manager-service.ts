import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Thin HttpClient wrapper that every API call goes through. */
@Injectable({
  providedIn: 'root',
})
export class HttpManagerService {
  private readonly http = inject(HttpClient);

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  /** GET with params; `observe: 'response'` lets you read headers like X-Pagination. */
  getWithParams<T>(
    url: string,
    options: { params?: HttpParams; observe: 'response' },
  ): Observable<HttpResponse<T>>;
  getWithParams<T>(url: string, options: { params?: HttpParams }): Observable<T>;
  getWithParams<T>(
    url: string,
    options: { params?: HttpParams; observe?: 'response' },
  ): Observable<T | HttpResponse<T>> {
    return options.observe === 'response'
      ? this.http.get<T>(url, { params: options.params, observe: 'response' })
      : this.http.get<T>(url, { params: options.params });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(url, body === undefined ? {} : { body });
  }
}
