import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap, timer } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { ENTRY_TYPES, SPENDING_CATEGORIES } from '../../../core/constants/spending.constants';
import {
  EntryFilters,
  EntrySortField,
  EntryType,
  SortDirection,
  SpendingCategory,
} from '../../../core/models/spending/spending-models';
import { FormattingService } from '../../../core/services/formatting-service';
import { SpendingService } from '../../../core/services/spending-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Button } from '../../../core/ui/components/button/button';
import { Chip } from '../../../core/ui/components/chip/chip';
import { Entry } from '../../../core/ui/components/entry/entry';
import { Modal } from '../../../core/ui/components/modal/modal';
import { SegmentedControl } from '../../../core/ui/components/segmented-control/segmented-control';
import { SelectOption } from '../../../core/ui/models/select-option';
import { latestValue } from '../../../core/utils/resource-utils';
import { DEFAULT_FILTERS, SORT_FIELDS } from '../entry-filters';

const COUNT_DEBOUNCE_MS = 250;

/** Filter & sort window; the draft only applies on confirm. */
@Component({
  selector: 'app-filter-modal',
  imports: [FormsModule, TranslocoPipe, Button, Chip, Entry, Modal, SegmentedControl],
  templateUrl: './filter-modal.html',
  styleUrl: '../../../core/ui/styles/filter-window.css',
})
export class FilterModal {
  private readonly i18n = inject(TranslationService);
  private readonly spendingService = inject(SpendingService);

  year = input.required<number>();
  month = input.required<number>();
  periodLabel = input.required<string>();

  applied = output<EntryFilters>();

  private readonly modal = viewChild.required(Modal);

  protected readonly currencySymbol = inject(FormattingService).currencySymbol;
  protected readonly types = ENTRY_TYPES;
  protected readonly categories = SPENDING_CATEGORIES;

  protected readonly draft = signal<EntryFilters>(DEFAULT_FILTERS);
  protected readonly isOpen = signal(false);
  private readonly openingCount = signal(0);

  protected readonly sortOptions = computed<SelectOption<EntrySortField>[]>(() =>
    SORT_FIELDS.map((field) => ({
      label: this.i18n.translate(`finances.filters.fields.${field}`),
      value: field,
    })),
  );

  protected readonly directionOptions = computed<SelectOption<SortDirection>[]>(() =>
    (['asc', 'desc'] as const).map((direction) => ({
      label: this.i18n.translate(`finances.filters.orders.${this.draft().sort}.${direction}`),
      value: direction,
    })),
  );

  private readonly count = rxResource({
    params: () =>
      this.isOpen() ? { year: this.year(), month: this.month(), filters: this.draft() } : undefined,
    stream: ({ params }) =>
      timer(COUNT_DEBOUNCE_MS).pipe(
        switchMap(() =>
          this.spendingService.countEntries(params.year, params.month, params.filters),
        ),
      ),
  });
  private readonly latestCount = latestValue(this.count);
  protected readonly matchCount = computed(() => this.latestCount() ?? this.openingCount());

  open(filters: EntryFilters, matchCount: number): void {
    this.draft.set({ ...filters });
    this.openingCount.set(matchCount);
    this.isOpen.set(true);
    this.modal().open();
  }

  close(): void {
    this.isOpen.set(false);
    this.modal().close();
  }

  update(patch: Partial<EntryFilters>): void {
    this.draft.update((draft) => ({ ...draft, ...patch }));
  }

  toggleType(type: EntryType): void {
    this.update({ types: toggle(this.draft().types, type) });
  }

  toggleCategory(category: SpendingCategory): void {
    this.update({ categories: toggle(this.draft().categories, category) });
  }

  setAmountLimit(limit: 'minAmount' | 'maxAmount', value: string): void {
    const amount = value === '' ? null : Number(value);
    this.update({ [limit]: amount !== null && amount >= 0 ? amount : null });
  }

  resetAll(): void {
    this.draft.set(DEFAULT_FILTERS);
  }

  apply(): void {
    this.applied.emit(this.draft());
    this.close();
  }
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
