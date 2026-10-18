import { formatDate } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { WEEKDAYS } from '../../core/constants/goals.constants';
import { DailyGoal, Weekday } from '../../core/models/goals/goal-models';
import { GoalsService } from '../../core/services/goals-service';
import { TranslationService } from '../../core/services/translation-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { Tag } from '../../core/ui/components/tag/tag';
import { addDays, startOfWeek, weekdayIndex } from '../../core/utils/date-utils';
import { latestValue } from '../../core/utils/resource-utils';
import { DailyGoalToggle, DailyGoals } from './daily-goals/daily-goals';
import {
  DailyGoalFormResult,
  GoalFormModal,
  WeeklyGoalFormResult,
} from './goal-form-modal/goal-form-modal';
import { WeeklyGoals } from './weekly-goals/weekly-goals';

@Component({
  selector: 'app-goals',
  imports: [TranslocoPipe, Banner, PageHeader, Tag, DailyGoals, GoalFormModal, WeeklyGoals],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class Goals {
  private readonly goalsService = inject(GoalsService);
  private readonly i18n = inject(TranslationService);

  private readonly formModal = viewChild.required(GoalFormModal);

  private readonly now = new Date();
  protected readonly weekStart = startOfWeek(this.now);
  protected readonly today = weekdayIndex(this.now) as Weekday;
  protected readonly selectedDay = signal<Weekday>(this.today);

  // ---------- Data ----------
  private readonly goals = rxResource({
    stream: () => this.goalsService.getGoals(this.now),
  });
  private readonly goalsValue = latestValue(this.goals);
  protected readonly dailies = computed(() => this.goalsValue() ?? []);

  // ---------- Errors ----------
  private readonly saveFailed = signal(false);
  protected readonly errorMessage = computed(() =>
    this.goals.status() === 'error'
      ? this.i18n.translate('goals.loadError')
      : this.saveFailed()
        ? this.i18n.translate('goals.saveError')
        : '',
  );

  // ---------- Header ----------
  protected readonly weekRange = computed(() => {
    const end = addDays(this.weekStart, WEEKDAYS.length - 1);
    return [
      formatDate(this.weekStart, 'd MMM', this.i18n.locale()),
      formatDate(end, 'd MMM y', this.i18n.locale()),
    ].join(' – ');
  });

  protected readonly resetLabel = computed(() =>
    this.i18n.plural('goals.resetIn', WEEKDAYS.length - this.today),
  );

  // ---------- Goals ----------
  openNewDaily(): void {
    this.formModal().open('daily');
  }

  openNewWeekly(): void {
    this.formModal().open('weekly');
  }

  editDaily(goal: DailyGoal): void {
    this.formModal().open('daily', goal);
  }

  editWeekly(goal: DailyGoal): void {
    this.formModal().open('weekly', goal);
  }

  onToggled({ goal, day, done }: DailyGoalToggle): void {
    this.save(this.goalsService.setCompleted(goal.id, day, done));
  }

  onDailySaved({ id, request }: DailyGoalFormResult): void {
    this.save(
      id
        ? this.goalsService.updateDailyGoal(id, request, this.now)
        : this.goalsService.createDailyGoal(request, this.now),
    );
  }

  onWeeklySaved({ goal, weeklyGoal }: WeeklyGoalFormResult): void {
    this.save(this.goalsService.setWeeklyGoal(goal, weeklyGoal, this.now));
  }

  onDailyDeleted(goal: DailyGoal): void {
    this.save(this.goalsService.deleteDailyGoal(goal.id));
  }

  onWeeklyDeleted(goal: DailyGoal): void {
    this.save(this.goalsService.setWeeklyGoal(goal, null, this.now));
  }

  /** Runs a change, then reloads the goals or flags the error. */
  private save(change$: Observable<unknown>): void {
    change$.subscribe({
      next: () => {
        this.saveFailed.set(false);
        this.goals.reload();
      },
      error: () => this.saveFailed.set(true),
    });
  }
}
