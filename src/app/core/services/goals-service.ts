import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DailyGoal, DailyGoalRequest, WeeklyGoalRequest } from '../models/goals/goal-models';
import { dayKey } from '../utils/date-utils';
import { HttpManagerService } from './http-manager-service';

/** Daily goals and their weekly goals, for the week of `today`. */
@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private readonly httpService = inject(HttpManagerService);
  private readonly urlGoals = `${environment.apiUrl}/api/goals`;

  getGoals(today: Date): Observable<DailyGoal[]> {
    const params = new HttpParams().set('date', dayKey(today)).set('sort', 'createdat');
    return this.httpService.getWithParams<DailyGoal[]>(this.urlGoals, { params });
  }

  createDailyGoal(request: DailyGoalRequest, today: Date): Observable<DailyGoal> {
    return this.httpService.post<DailyGoal>(`${this.urlGoals}?date=${dayKey(today)}`, request);
  }

  updateDailyGoal(id: string, request: DailyGoalRequest, today: Date): Observable<DailyGoal> {
    return this.httpService.put<DailyGoal>(`${this.urlGoals}/${id}?date=${dayKey(today)}`, request);
  }

  setWeeklyGoal(
    goal: DailyGoal,
    weeklyGoal: WeeklyGoalRequest | null,
    today: Date,
  ): Observable<DailyGoal> {
    const { title, amount, unit, plannedDays } = goal;
    return this.updateDailyGoal(goal.id, { title, amount, unit, plannedDays, weeklyGoal }, today);
  }

  setCompleted(id: string, day: Date, completed: boolean): Observable<DailyGoal> {
    const url = `${this.urlGoals}/${id}/checkins/${dayKey(day)}`;
    return completed
      ? this.httpService.put<DailyGoal>(url, null)
      : this.httpService.delete<DailyGoal>(url);
  }

  deleteDailyGoal(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.urlGoals}/${id}`);
  }
}
