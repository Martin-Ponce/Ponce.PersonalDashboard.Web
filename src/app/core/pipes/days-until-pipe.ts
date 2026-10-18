import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation-service';
import { parseDay } from '../utils/date-utils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const KEY = 'common.relativeDays';

/** Local "yyyy-MM-dd". */
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar days until `date` (0 = today, negative = past). */
export function daysUntil(date: string | Date, today = new Date()): number {
  const target = typeof date === 'string' && DAY_KEY.test(date) ? parseDay(date) : new Date(date);
  const startOfTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const startOfToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((startOfTarget - startOfToday) / MS_PER_DAY);
}

/** short gives "3 days", phrase gives "In 3 days". */
export type DaysUntilStyle = 'short' | 'phrase';

/** Relative day text like "Tomorrow", in the current language. */
@Pipe({
  name: 'daysUntil',
  // Impure so it picks up language changes.
  pure: false,
})
export class DaysUntilPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(date: string | Date | null | undefined, style: DaysUntilStyle = 'short'): string {
    if (!date) return '';
    const days = daysUntil(date);
    if (days === 0) return this.i18n.translate(`${KEY}.today`);
    if (days === 1) return this.i18n.translate(`${KEY}.tomorrow`);
    if (days === -1) return this.i18n.translate(`${KEY}.yesterday`);

    const amount = Math.abs(days);
    const value =
      amount < 7
        ? this.i18n.plural(`${KEY}.days`, amount)
        : this.i18n.plural(`${KEY}.weeks`, Math.round(amount / 7));

    if (days < 0) return this.i18n.translate(`${KEY}.ago`, { value });
    return style === 'phrase' ? this.i18n.translate(`${KEY}.in`, { value }) : value;
  }
}
