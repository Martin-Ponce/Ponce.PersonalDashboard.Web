import { formatDate } from '@angular/common';
import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  DAY_PRESETS,
  GOAL_UNITS,
  MAX_WEEKLY_TARGET,
  WEEKDAYS,
  dayNames,
  plannedWeekdays,
} from '../../../core/constants/goals.constants';
import {
  DailyGoal,
  DailyGoalRequest,
  GoalUnit,
  Weekday,
  WeeklyGoalRequest,
} from '../../../core/models/goals/goal-models';
import { FormattingService } from '../../../core/services/formatting-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Banner } from '../../../core/ui/components/banner/banner';
import { Button } from '../../../core/ui/components/button/button';
import { Chip } from '../../../core/ui/components/chip/chip';
import { DeleteConfirmation } from '../../../core/ui/components/delete-confirmation/delete-confirmation';
import { Entry } from '../../../core/ui/components/entry/entry';
import { FormField } from '../../../core/ui/components/form-field/form-field';
import { Modal } from '../../../core/ui/components/modal/modal';
import { Select } from '../../../core/ui/components/select/select';
import { SelectOption } from '../../../core/ui/models/select-option';
import { addDays, startOfWeek } from '../../../core/utils/date-utils';

export type GoalKind = 'daily' | 'weekly';

export interface DailyGoalFormResult {
  id?: string;
  request: DailyGoalRequest;
}

export interface WeeklyGoalFormResult {
  goal: DailyGoal;
  weeklyGoal: WeeklyGoalRequest;
}

const DEFAULT_DAILY_UNIT: GoalUnit = 'Hours';

const notBlank = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };

const positive = (control: AbstractControl): ValidationErrors | null =>
  Number(control.value) > 0 ? null : { positive: true };

const daysPerWeek = (control: AbstractControl): ValidationErrors | null => {
  const days = Number(control.value);
  return Number.isInteger(days) && days >= 1 && days <= MAX_WEEKLY_TARGET ? null : { days: true };
};

/** Add/edit window for daily and weekly goals. */
@Component({
  selector: 'app-goal-form-modal',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    Banner,
    Button,
    Chip,
    DeleteConfirmation,
    Entry,
    FormField,
    Modal,
    Select,
  ],
  templateUrl: './goal-form-modal.html',
  styleUrl: './goal-form-modal.css',
})
export class GoalFormModal {
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  dailies = input.required<DailyGoal[]>();

  dailySaved = output<DailyGoalFormResult>();
  weeklySaved = output<WeeklyGoalFormResult>();
  dailyDeleted = output<DailyGoal>();
  weeklyDeleted = output<DailyGoal>();

  private readonly modal = viewChild.required(Modal);
  private readonly titleEntry = viewChild.required<Entry>('titleEntry');

  protected readonly presets = DAY_PRESETS;
  protected readonly maxWeeklyTarget = MAX_WEEKLY_TARGET;

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    amount: new FormControl('', { nonNullable: true, validators: positive }),
    unit: new FormControl<GoalUnit>(DEFAULT_DAILY_UNIT, { nonNullable: true }),
    sourceId: new FormControl('', { nonNullable: true }),
    targetCount: new FormControl('', { nonNullable: true, validators: daysPerWeek }),
  });

  protected readonly kind = signal<GoalKind>('daily');
  protected readonly editing = signal<DailyGoal | null>(null);
  protected readonly plannedDays = signal<Weekday[]>([]);
  protected readonly tried = signal(false);
  protected readonly confirmingDelete = signal(false);

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly isWeekly = computed(() => this.kind() === 'weekly');

  protected readonly title = computed(() => {
    const action = this.editing() ? 'edit' : 'new';
    const kind = this.isWeekly() ? 'Weekly' : 'Daily';
    return this.i18n.translate(`goals.form.${action}${kind}`);
  });

  protected readonly editingTitle = computed(() => {
    const goal = this.editing();
    return this.isWeekly() ? goal?.weeklyGoal?.title : goal?.title;
  });

  private readonly source = computed(() =>
    this.dailies().find((d) => d.id === this.values().sourceId),
  );

  // ---------- Options ----------
  private readonly dayDates = computed(() => {
    const monday = startOfWeek(new Date());
    return WEEKDAYS.map((day) => addDays(monday, day));
  });

  protected readonly dayChips = computed(() =>
    this.dayDates().map((date, i) => ({
      day: i as Weekday,
      label: formatDate(date, 'EEE', this.i18n.locale()),
    })),
  );

  protected readonly unitOptions = computed<SelectOption<GoalUnit>[]>(() =>
    GOAL_UNITS.map((unit) => ({
      label: this.i18n.translate(`goals.unitNames.${unit}`),
      value: unit,
    })),
  );

  /** Daily goals without a weekly goal yet, plus the one being edited. */
  protected readonly sourceOptions = computed<SelectOption[]>(() =>
    this.dailies()
      .filter((d) => !d.weeklyGoal || d.id === this.editing()?.id)
      .map((d) => ({
        label: this.i18n.translate('goals.form.sourceOption', {
          title: d.title,
          amount: this.formatting.quantity(d.amount, `goals.units.${d.unit}`),
        }),
        value: d.id,
      })),
  );

  protected readonly deleteText = computed(() => {
    if (this.isWeekly()) return this.i18n.translate('goals.form.deleteWeekly');
    return this.editing()?.weeklyGoal
      ? this.i18n.translate('goals.form.deleteDailyLinked')
      : this.i18n.translate('goals.form.deleteDaily');
  });

  /** Opens for a new goal, or to edit a daily goal or its weekly goal. */
  open(kind: GoalKind, goal?: DailyGoal): void {
    this.kind.set(kind);
    this.editing.set(goal ?? null);
    this.tried.set(false);
    this.confirmingDelete.set(false);

    const weekly = kind === 'weekly' ? goal?.weeklyGoal : null;
    this.form.reset({
      title: (kind === 'weekly' ? weekly?.title : goal?.title) ?? '',
      amount: goal ? String(goal.amount) : '1',
      unit: goal?.unit ?? DEFAULT_DAILY_UNIT,
      sourceId: kind === 'weekly' ? (goal?.id ?? this.sourceOptions()[0]?.value ?? '') : '',
      targetCount: weekly ? String(weekly.targetCount) : '',
    });
    // A weekly goal can't move to another daily goal.
    if (goal && kind === 'weekly') this.form.controls.sourceId.disable();
    else this.form.controls.sourceId.enable();
    this.plannedDays.set(kind === 'daily' && goal ? plannedWeekdays(goal) : []);

    this.modal().open();
    this.titleEntry().focus();
  }

  close(): void {
    this.modal().close();
  }

  protected toggleDay(day: Weekday): void {
    this.plannedDays.update((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );
  }

  protected setDays(days: Weekday[]): void {
    this.plannedDays.set([...days]);
  }

  /** First validation error in field order, or '' if none (or not tried yet). */
  protected formError(): string {
    if (!this.tried()) return '';
    const { controls } = this.form;
    if (this.isWeekly()) {
      if (!this.source()) return this.i18n.translate('goals.form.sourceRequired');
      if (controls.targetCount.invalid) {
        return this.i18n.translate('goals.form.targetRequired', { max: MAX_WEEKLY_TARGET });
      }
      return '';
    }
    if (notBlank(controls.title)) return this.i18n.translate('goals.form.nameRequired');
    if (controls.amount.invalid) return this.i18n.translate('goals.form.amountRequired');
    if (!this.plannedDays().length) return this.i18n.translate('goals.form.daysRequired');
    return '';
  }

  protected save(): void {
    this.tried.set(true);
    if (this.formError()) return;

    const { title, amount, unit, targetCount } = this.form.getRawValue();
    if (this.isWeekly()) {
      this.weeklySaved.emit({
        goal: this.source()!,
        weeklyGoal: { title: title.trim() || null, targetCount: Number(targetCount) },
      });
    } else {
      const editing = this.editing();
      this.dailySaved.emit({
        id: editing?.id,
        request: {
          title: title.trim(),
          amount: Number(amount),
          unit,
          plannedDays: dayNames(this.plannedDays()),
          // Saving replaces the whole goal, so send the weekly goal back too.
          weeklyGoal: editing?.weeklyGoal
            ? {
                // The API fills in the daily goal's title when the weekly one has none.
                title: editing.weeklyGoal.title === editing.title ? null : editing.weeklyGoal.title,
                targetCount: editing.weeklyGoal.targetCount,
              }
            : null,
        },
      });
    }
    this.close();
  }

  protected confirmDelete(): void {
    const goal = this.editing();
    if (goal && this.isWeekly()) this.weeklyDeleted.emit(goal);
    else if (goal) this.dailyDeleted.emit(goal);
    this.close();
  }
}
