import { formatDate } from '@angular/common';
import { Component, computed, inject, input, model, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { WEEKDAYS, plannedWeekdays, schedulePreset } from '../../../core/constants/goals.constants';
import { DailyGoal, Weekday } from '../../../core/models/goals/goal-models';
import { FormattingService } from '../../../core/services/formatting-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { CheckButton } from '../../../core/ui/components/check-button/check-button';
import { ProgressBar } from '../../../core/ui/components/progress-bar/progress-bar';
import { Tag, TagColor } from '../../../core/ui/components/tag/tag';
import { addDays, dayKey } from '../../../core/utils/date-utils';
import { GoalDot, GoalDotState } from '../goal-dot/goal-dot';

export interface DailyGoalToggle {
  goal: DailyGoal;
  day: Date;
  done: boolean;
}

/** Tick off this week's daily goals, one day at a time. */
@Component({
  selector: 'app-daily-goals',
  imports: [TranslocoPipe, Button, Card, CheckButton, ProgressBar, Tag, GoalDot],
  templateUrl: './daily-goals.html',
  styleUrl: './daily-goals.css',
})
export class DailyGoals {
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  goals = input.required<DailyGoal[]>();
  /** Monday of this week. */
  weekStart = input.required<Date>();
  /** Monday = 0. */
  today = input.required<Weekday>();
  selectedDay = model.required<Weekday>();

  added = output<void>();
  edited = output<DailyGoal>();
  toggled = output<DailyGoalToggle>();

  private readonly locale = this.i18n.locale;

  private readonly dates = computed(() => WEEKDAYS.map((day) => addDays(this.weekStart(), day)));
  private readonly dayNames = computed(() =>
    this.dates().map((date) => formatDate(date, 'EEEE', this.locale())),
  );

  protected readonly tabs = computed(() =>
    this.dates().map((date, day) => ({
      day: day as Weekday,
      weekday: formatDate(date, 'EEE', this.locale()),
      number: date.getDate(),
      future: day > this.today(),
      today: day === this.today(),
      title:
        day > this.today()
          ? this.i18n.translate('goals.daily.future')
          : day === this.today()
            ? this.i18n.translate('goals.daily.today')
            : this.i18n.translate('goals.daily.past', { day: this.dayNames()[day] }),
    })),
  );

  private readonly selectedDate = computed(() => this.dates()[this.selectedDay()]);
  private readonly isToday = computed(() => this.selectedDay() === this.today());

  protected readonly dayHeading = computed(() => {
    const day = formatDate(this.selectedDate(), 'EEEE d MMM', this.locale());
    return this.isToday() ? this.i18n.translate('goals.daily.todayHeading', { day }) : day;
  });

  // ---------- Progress for the selected day ----------
  private readonly plannedOnDay = computed(() =>
    this.goals().filter((g) => this.isPlanned(g, this.selectedDay())),
  );
  private readonly doneOnDay = computed(
    () => this.plannedOnDay().filter((g) => this.isDone(g, this.selectedDay())).length,
  );
  private readonly bonusOnDay = computed(
    () =>
      this.goals().filter(
        (g) => !this.isPlanned(g, this.selectedDay()) && this.isDone(g, this.selectedDay()),
      ).length,
  );

  protected readonly dayProgress = computed(() => {
    const planned = this.plannedOnDay().length;
    return planned ? Math.round((this.doneOnDay() / planned) * 100) : 100;
  });

  protected readonly dayProgressLabel = computed(() =>
    [
      this.i18n.translate('goals.daily.progress', {
        done: this.doneOnDay(),
        planned: this.plannedOnDay().length,
      }),
      this.bonusOnDay()
        ? this.i18n.translate('goals.daily.bonus', { count: this.bonusOnDay() })
        : null,
    ]
      .filter(Boolean)
      .join(' · '),
  );

  /** Planned days already missed this week, across all goals. */
  protected readonly missedThisWeek = computed(() =>
    this.goals().reduce(
      (total, goal) => total + WEEKDAYS.filter((day) => this.isMissed(goal, day)).length,
      0,
    ),
  );
  protected readonly missedLabel = computed(() =>
    this.i18n.plural('goals.daily.missedWeek', this.missedThisWeek()),
  );

  // ---------- Goals ----------
  protected readonly rows = computed(() => {
    const day = this.selectedDay();
    const dayName = this.dayNames()[day];
    return this.goals().map((goal) => {
      const done = this.isDone(goal, day);
      const planned = this.isPlanned(goal, day);
      const missed = this.isMissed(goal, day);
      const available = this.existed(goal, day);
      const schedule = this.schedule(plannedWeekdays(goal));
      const doneDays = WEEKDAYS.filter((d) => this.isDone(goal, d)).map((d) => this.dayNames()[d]);
      return {
        goal,
        done,
        available,
        state: done ? 'done' : missed ? 'missed' : planned ? 'planned' : 'off',
        amount: this.formatting.quantity(goal.amount, `goals.units.${goal.unit}`),
        tag: available
          ? this.tag(done, planned, missed, dayName)
          : {
              text: this.i18n.translate('goals.daily.tags.notCreated'),
              color: 'neutral' as TagColor,
            },
        schedule,
        feeds: goal.weeklyGoal
          ? this.i18n.translate('goals.daily.addsTo', { goals: goal.weeklyGoal.title })
          : '',
        checkLabel: this.i18n.translate(done ? 'goals.daily.undo' : 'goals.daily.complete', {
          title: goal.title,
          day: dayName,
        }),
        weekLabel: this.i18n.translate('goals.daily.weekLabel', {
          title: goal.title,
          schedule,
          days: doneDays.join(', ') || this.i18n.translate('goals.daily.noDays'),
        }),
        dots: WEEKDAYS.map((d) => {
          const state = this.dotState(goal, d);
          return {
            day: d,
            state,
            letter: this.dayNames()[d].charAt(0),
            title: this.i18n.translate(`goals.daily.dots.${state}`, { day: this.dayNames()[d] }),
          };
        }),
      };
    });
  });

  protected pick(day: Weekday): void {
    if (day <= this.today()) this.selectedDay.set(day);
  }

  protected toggle(goal: DailyGoal, done: boolean): void {
    this.toggled.emit({ goal, day: this.selectedDate(), done });
  }

  private isDone(goal: DailyGoal, day: number): boolean {
    return goal.checkedDates.includes(dayKey(this.dates()[day]));
  }

  private isPlanned(goal: DailyGoal, day: number): boolean {
    return plannedWeekdays(goal).includes(day as Weekday) && this.existed(goal, day);
  }

  private existed(goal: DailyGoal, day: number): boolean {
    return dayKey(this.dates()[day]) >= dayKey(goal.createdAtUtc);
  }

  private isMissed(goal: DailyGoal, day: number): boolean {
    return this.isPlanned(goal, day) && day < this.today() && !this.isDone(goal, day);
  }

  private dotState(goal: DailyGoal, day: number): GoalDotState {
    const planned = this.isPlanned(goal, day);
    if (this.isDone(goal, day)) return planned ? 'done' : 'bonus';
    if (this.isMissed(goal, day)) return 'missed';
    return planned ? 'planned' : 'off';
  }

  private tag(
    done: boolean,
    planned: boolean,
    missed: boolean,
    dayName: string,
  ): { text: string; color: TagColor } | null {
    const on = (key: string) =>
      this.isToday()
        ? this.i18n.translate(`goals.daily.tags.${key}Today`)
        : this.i18n.translate(`goals.daily.tags.${key}On`, { day: dayName });
    if (missed) return { text: this.i18n.translate('goals.daily.tags.missed'), color: 'alert' };
    if (!planned && done)
      return { text: this.i18n.translate('goals.daily.tags.bonus'), color: 'success' };
    if (!planned) return { text: on('optional'), color: 'neutral' };
    if (!done) return { text: on('planned'), color: 'accent-soft' };
    return null;
  }

  /** "Every day", "Weekdays", or something like "Mon, Wed, Fri". */
  private schedule(days: Weekday[]): string {
    const preset = schedulePreset(days);
    if (preset) return this.i18n.translate(`goals.schedule.${preset}`);
    if (!days.length) return this.i18n.translate('goals.schedule.none');
    return [...days]
      .sort()
      .map((d) => formatDate(this.dates()[d], 'EEE', this.locale()))
      .join(', ');
  }
}
