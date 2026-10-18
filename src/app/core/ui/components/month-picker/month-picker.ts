import { formatDate } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslationService } from '../../../services/translation-service';
import { SelectOption } from '../../models/select-option';
import { Button } from '../button/button';
import { FormField } from '../form-field/form-field';
import { Select } from '../select/select';

/** Prev/next month buttons plus Year and Month dropdowns. */
@Component({
  selector: 'app-month-picker',
  imports: [FormsModule, TranslocoPipe, Button, FormField, Select],
  template: `
    <div class="month-picker">
      <app-button
        variant="icon"
        iconName="chevron-left"
        [ariaLabel]="'common.monthPicker.previous' | transloco"
        [isDisabled]="!canGoBack()"
        (clicked)="shift(-1)"
      />
      <app-form-field
        [label]="'common.monthPicker.year' | transloco"
        variant="caption"
        [labelFor]="idPrefix() + '-year'"
      >
        <app-select
          class="month-picker__year"
          [selectId]="idPrefix() + '-year'"
          [items]="yearOptions()"
          [ngModel]="year()"
          (ngModelChange)="year.set($event)"
        />
      </app-form-field>
      <app-form-field
        [label]="'common.monthPicker.month' | transloco"
        variant="caption"
        [labelFor]="idPrefix() + '-month'"
      >
        <app-select
          class="month-picker__month"
          [selectId]="idPrefix() + '-month'"
          [items]="monthOptions()"
          [ngModel]="month()"
          (ngModelChange)="month.set($event)"
        />
      </app-form-field>
      <app-button
        variant="icon"
        iconName="chevron-right"
        [ariaLabel]="'common.monthPicker.next' | transloco"
        [isDisabled]="!canGoForward()"
        (clicked)="shift(1)"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .month-picker {
      display: flex;
      align-items: flex-end;
      gap: 12px;
    }

    .month-picker__year {
      width: 110px;
    }

    .month-picker__month {
      width: 160px;
    }

    @media (max-width: 760px) {
      .month-picker {
        flex-wrap: wrap;
      }
    }
  `,
})
export class MonthPicker {
  private readonly locale = inject(TranslationService).locale;

  year = model.required<number>();
  /** 1-12 */
  month = model.required<number>();
  minYear = input.required<number>();
  maxYear = input.required<number>();
  idPrefix = input('month-picker');

  protected readonly yearOptions = computed<SelectOption<number>[]>(() =>
    Array.from({ length: this.maxYear() - this.minYear() + 1 }, (_, i) => ({
      label: String(this.minYear() + i),
      value: this.minYear() + i,
    })),
  );

  protected readonly monthOptions = computed<SelectOption<number>[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      // Spanish month names come lowercase.
      label: capitalize(formatDate(new Date(2000, i, 1), 'LLLL', this.locale())),
      value: i + 1,
    })),
  );

  protected readonly canGoBack = computed(() => this.year() > this.minYear() || this.month() > 1);
  protected readonly canGoForward = computed(
    () => this.year() < this.maxYear() || this.month() < 12,
  );

  shift(delta: number): void {
    const date = new Date(this.year(), this.month() - 1 + delta, 1);
    if (date.getFullYear() < this.minYear() || date.getFullYear() > this.maxYear()) return;
    this.year.set(date.getFullYear());
    this.month.set(date.getMonth() + 1);
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
