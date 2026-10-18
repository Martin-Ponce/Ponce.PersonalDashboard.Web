import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Overview } from '../models/overview/overview-models';
import { dayKey } from '../utils/date-utils';
import { HttpManagerService } from './http-manager-service';

/** The overview page's data, gathered by the API in one call. */
@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private readonly httpService = inject(HttpManagerService);
  private readonly urlOverview = `${environment.apiUrl}/api/overview`;

  /** The overview for the month and week that contain `today` (the local date). */
  getOverview(today: Date): Observable<Overview> {
    const params = new HttpParams().set('date', dayKey(today));
    return this.httpService.getWithParams<Overview>(this.urlOverview, { params });
  }
}
