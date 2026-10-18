import { Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DailyGoal } from '../../../core/models/goals/goal-models';
import { FormattingService } from '../../../core/services/formatting-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { Icon } from '../../../core/ui/components/icon/icon';
import { ProgressBar, ProgressTone } from '../../../core/ui/components/progress-bar/progress-bar';
import { Tag } from '../../../core/ui/components/tag/tag';

/** Percent cutoffs for red, then yellow bars. */
const LOW_PROGRESS = 34;
const MID_PROGRESS = 67;

/** Weekly targets, filled by ticking the daily goals. */
@Component({
  selector: 'app-weekly-goals',
  imports: [TranslocoPipe, Button, Card, Icon, ProgressBar, Tag],
  templateUrl: './weekly-goals.html',
  styleUrl: './weekly-goals.css',
})
export class WeeklyGoals {
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  goals = input.required<DailyGoal[]>();

  added = output<void>();
  edited = output<DailyGoal>();

  protected readonly rows = computed(() =>
    this.goals()
      .filter((goal) => goal.weeklyGoal)
      .map((goal) => {
        const weekly = goal.weeklyGoal!;
        const percent = Math.min(100, (weekly.progress / weekly.targetCount) * 100);
        const left = Math.max(0, weekly.targetCount - weekly.progress);
        return {
          goal,
          title: weekly.title,
          complete: weekly.completed,
          percent,
          tone: this.tone(weekly.completed, percent),
          progressText: this.i18n.translate('goals.weekly.of', {
            value: Math.min(weekly.progress, weekly.targetCount),
            target: this.times(weekly.targetCount),
          }),
          source: this.i18n.translate('goals.weekly.from', {
            title: goal.title,
            amount: this.formatting.quantity(goal.amount, `goals.units.${goal.unit}`),
          }),
          toGo: weekly.completed
            ? ''
            : this.i18n.plural('goals.weekly.toGo', left, { amount: this.times(left) }),
        };
      }),
  );

  protected readonly completedCount = computed(() => this.rows().filter((r) => r.complete).length);

  private times(count: number): string {
    return this.formatting.quantity(count, 'goals.units.Times');
  }

  private tone(complete: boolean, percent: number): ProgressTone {
    if (complete) return 'success';
    if (percent < LOW_PROGRESS) return 'danger';
    return percent < MID_PROGRESS ? 'warning' : 'accent';
  }
}
