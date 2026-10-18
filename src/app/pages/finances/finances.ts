import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  BUDGET_THRESHOLDS,
  ENTRY_TYPES,
  SPENDING_CATEGORIES,
} from '../../core/constants/spending.constants';
import {
  EntryFilters,
  EntryType,
  SpendingCategory,
  SpendingEntry,
} from '../../core/models/spending/spending-models';
import { daysUntil } from '../../core/pipes/days-until-pipe';
import { FormattingService } from '../../core/services/formatting-service';
import { SpendingService } from '../../core/services/spending-service';
import { TranslationService } from '../../core/services/translation-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { Button } from '../../core/ui/components/button/button';
import { Card } from '../../core/ui/components/card/card';
import { KeyFigure } from '../../core/ui/components/key-figure/key-figure';
import { Metric, MetricTone } from '../../core/ui/components/metric/metric';
import { MonthPicker } from '../../core/ui/components/month-picker/month-picker';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { DEFAULT_PAGE_SIZE, Paginator } from '../../core/ui/components/paginator/paginator';
import { ProgressBar } from '../../core/ui/components/progress-bar/progress-bar';
import { Table, TableColumn } from '../../core/ui/components/table/table';
import { Tag, TagColor } from '../../core/ui/components/tag/tag';
import { BudgetModal } from './budget-modal/budget-modal';
import { EntryFormModal, EntryFormResult } from './entry-form-modal/entry-form-modal';
import { latestValue } from '../../core/utils/resource-utils';
import { DEFAULT_FILTERS, activeFilterCount, withoutFilters } from './entry-filters';
import { FilterModal } from './filter-modal/filter-modal';

const YEARS_BACK = 1;

const TYPE_TAG_COLORS = new Map(ENTRY_TYPES.map((t) => [t.value, t.tagColor]));
const CATEGORY_COLORS = new Map(SPENDING_CATEGORIES.map((c) => [c.value, c.color]));

interface BalanceView {
  label: string;
  tone: MetricTone;
  note: string;
  tag: TagColor;
}

interface EmptyState {
  title: string;
  text: string;
  setBudget: boolean;
}

@Component({
  selector: 'app-finances',
  imports: [
    DatePipe,
    TranslocoPipe,
    Banner,
    Button,
    Card,
    KeyFigure,
    Metric,
    MonthPicker,
    PageHeader,
    Paginator,
    ProgressBar,
    Table,
    Tag,
    BudgetModal,
    EntryFormModal,
    FilterModal,
  ],
  templateUrl: './finances.html',
  styleUrl: './finances.css',
})
export class Finances {
  private readonly spendingService = inject(SpendingService);
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  protected readonly locale = this.i18n.locale;
  protected readonly datePattern = this.formatting.datePattern;
  protected readonly budgetThresholds = BUDGET_THRESHOLDS;

  private readonly entryModal = viewChild.required(EntryFormModal);
  private readonly budgetModal = viewChild.required(BudgetModal);
  private readonly filterModal = viewChild.required(FilterModal);

  private readonly today = new Date();
  protected readonly minYear = this.today.getFullYear() - YEARS_BACK;
  protected readonly maxYear = this.today.getFullYear();

  // ---------- Month (bound two-way to the month picker) ----------
  protected readonly year = signal(this.today.getFullYear());
  protected readonly month = signal(this.today.getMonth() + 1);

  // ---------- Data ----------
  private readonly period = computed(() => ({ year: this.year(), month: this.month() }));
  private readonly previousPeriod = computed(() => {
    const date = new Date(this.year(), this.month() - 2, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  // ---------- Filters ----------
  protected readonly filters = signal<EntryFilters>(DEFAULT_FILTERS);
  protected readonly activeFilters = computed(() => activeFilterCount(this.filters()));

  // ---------- Pages ----------
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  /** 1-based. */
  protected readonly page = linkedSignal({
    source: () => [this.year(), this.month(), this.filters()],
    computation: () => 1,
  });

  private readonly entriesPage = rxResource({
    params: () => ({
      ...this.period(),
      filters: this.filters(),
      page: this.page(),
      pageSize: this.pageSize(),
    }),
    stream: ({ params }) =>
      this.spendingService.getEntries(
        params.year,
        params.month,
        params.page,
        params.pageSize,
        params.filters,
      ),
  });
  private readonly entriesResult = latestValue(this.entriesPage);
  protected readonly pagedEntries = computed(() => this.entriesResult()?.data.transactions ?? []);
  protected readonly matchCount = computed(() => this.entriesResult()?.pagination?.totalCount ?? 0);
  protected readonly monthCount = computed(() => this.entriesResult()?.data.monthCount ?? 0);

  private readonly summary = rxResource({
    params: this.period,
    stream: ({ params }) => this.spendingService.getMonthlySummary(params.year, params.month),
  });
  private readonly summaryValue = latestValue(this.summary);
  protected readonly budget = computed(() => {
    const summary = this.summaryValue();
    return summary?.hasBudget ? summary.budget : null;
  });

  private readonly accountBalance = rxResource({
    stream: () => this.spendingService.getBalance(),
  });
  private readonly accountBalanceValue = latestValue(this.accountBalance);
  protected readonly accountBalanceTotal = computed(
    () => this.accountBalanceValue()?.totalBalance ?? 0,
  );
  protected readonly accountBalanceLabel = computed(() =>
    this.formatting.money(this.accountBalanceTotal()),
  );

  private readonly previousBudgetResource = rxResource({
    params: this.previousPeriod,
    stream: ({ params }) => this.spendingService.getBudget(params.year, params.month),
  });
  protected readonly previousBudget = computed(() =>
    this.previousBudgetResource.hasValue() ? (this.previousBudgetResource.value() ?? null) : null,
  );

  protected readonly needsBudget = computed(
    () => this.summaryValue() !== null && this.budget() === null,
  );

  // ---------- Errors ----------
  protected readonly loadFailed = computed(
    () => this.entriesPage.status() === 'error' || this.summary.status() === 'error',
  );
  protected readonly saveFailed = signal(false);
  protected readonly errorMessage = computed(() =>
    this.loadFailed()
      ? this.i18n.translate('finances.loadError')
      : this.saveFailed()
        ? this.i18n.translate('finances.saveError')
        : '',
  );

  protected readonly sortSummary = computed(() => {
    const { sort, direction } = this.filters();
    return this.i18n.translate('common.filters.sortSummary', {
      field: this.i18n.translate(`finances.filters.fields.${sort}`).toLocaleLowerCase(),
      order: this.i18n
        .translate(`finances.filters.orders.${sort}.${direction}`)
        .toLocaleLowerCase(),
    });
  });

  // ---------- Labels ----------
  protected readonly periodLabel = computed(() =>
    this.formatting.monthYear(this.year(), this.month()),
  );

  protected readonly countLabel = computed(() => {
    const count = this.monthCount();
    return this.activeFilters()
      ? this.i18n.plural('finances.countFiltered', count, { shown: this.matchCount() })
      : this.i18n.plural('finances.count', count);
  });

  protected readonly emptyState = computed<EmptyState>(() => {
    const period = this.periodLabel();
    if (this.needsBudget()) {
      return {
        title: this.i18n.translate('finances.noBudgetTitle', { period }),
        text: this.i18n.translate('finances.noBudgetText'),
        setBudget: true,
      };
    }
    if (this.monthCount()) {
      return {
        title: this.i18n.translate('finances.noMatchTitle'),
        text: this.i18n.translate('common.filters.noMatchText'),
        setBudget: false,
      };
    }
    return {
      title: this.i18n.translate('finances.emptyTitle', { period }),
      text: this.i18n.translate('finances.emptyText'),
      setBudget: false,
    };
  });

  // ---------- Totals ----------
  protected readonly spent = computed(() => this.summaryValue()?.totalExpense ?? 0);
  protected readonly earned = computed(() => this.summaryValue()?.totalIncome ?? 0);
  protected readonly net = computed(() => this.summaryValue()?.netBalance ?? 0);
  protected readonly spentLabel = computed(() => this.formatting.signedMoney(-this.spent()));
  protected readonly earnedLabel = computed(() => this.formatting.signedMoney(this.earned()));
  protected readonly netLabel = computed(() => this.formatting.signedMoney(this.net()));
  protected readonly filteredNet = computed(() => this.entriesResult()?.data.filteredTotal ?? 0);

  protected readonly filteredSummary = computed(() =>
    this.i18n.translate('finances.filteredSummary', {
      shown: this.matchCount(),
      count: this.monthCount(),
      net: `<b>${this.formatting.signedMoney(this.filteredNet())}</b>`,
    }),
  );

  protected readonly budgetLabel = computed(() => {
    const budget = this.budget();
    return budget === null ? this.i18n.translate('finances.notSet') : this.money(budget);
  });

  protected readonly budgetUsed = computed(() => {
    const budget = this.budget();
    return budget ? Math.round((this.spent() / budget) * 100) : null;
  });

  protected readonly balance = computed<BalanceView>(() => {
    const budget = this.budget();
    if (budget === null) {
      return {
        label: '—',
        tone: 'muted',
        note: this.i18n.translate('finances.noBudget'),
        tag: 'neutral-solid',
      };
    }
    const balance = budget - this.spent();
    return balance < 0
      ? {
          label: this.formatting.signedMoney(balance),
          tone: 'danger',
          note: this.i18n.translate('finances.overBudget'),
          tag: 'danger-solid',
        }
      : {
          label: this.formatting.signedMoney(balance),
          tone: 'success',
          note: this.i18n.translate('finances.withinBudget'),
          tag: 'success-solid',
        };
  });

  // ---------- Table ----------
  protected readonly columns = computed<TableColumn<SpendingEntry>[]>(() => [
    { key: 'description', label: this.i18n.translate('finances.columns.name'), emphasis: true },
    {
      key: 'type',
      label: this.i18n.translate('finances.columns.type'),
      type: 'tag',
      getLabel: (row) => this.typeLabel(row.type),
      getTagColor: (row) => this.typeColor(row.type),
    },
    {
      key: 'categoryId',
      label: this.i18n.translate('finances.columns.category'),
      type: 'dot',
      getLabel: (row) => this.categoryLabel(row.categoryId),
      getDotColor: (row) => this.categoryColor(row.categoryId),
    },
    {
      key: 'amount',
      label: this.i18n.translate('finances.columns.amount'),
      align: 'right',
      getLabel: (row) => this.signedAmount(row),
      getTone: (row) => (row.type === 'Income' ? 'success' : 'danger'),
    },
    {
      key: 'createdAtUtc',
      label: this.i18n.translate('finances.columns.createdAt'),
      type: 'date',
      dateFormat: this.datePattern(),
      align: 'right',
      muted: true,
    },
    {
      key: 'updatedAtUtc',
      label: this.i18n.translate('finances.columns.updatedAt'),
      align: 'right',
      getLabel: (row) => this.formatting.lastUpdated(row.updatedAtUtc),
      getTone: (row) => (this.wasEdited(row) ? 'strong' : 'muted'),
    },
    {
      key: 'actions',
      label: this.i18n.translate('finances.columns.actions'),
      type: 'actions',
      actions: [
        {
          icon: 'pencil',
          title: (row) => this.i18n.translate('finances.editEntryLabel', { name: row.description }),
          action: (row) => this.editEntry(row),
        },
      ],
    },
  ]);

  constructor() {
    // Step back a page when a delete empties the last one.
    effect(() => {
      const pagination = this.entriesResult()?.pagination;
      if (
        pagination &&
        pagination.totalPages > 0 &&
        pagination.currentPage > pagination.totalPages
      ) {
        this.page.set(pagination.totalPages);
      }
    });
  }

  // ---------- Entries ----------
  addOrSetBudget(): void {
    if (this.needsBudget()) this.openBudget();
    else this.openNewEntry();
  }

  openNewEntry(): void {
    this.entryModal().open();
  }

  editEntry(entry: SpendingEntry): void {
    this.entryModal().open(entry);
  }

  onEntrySaved({ id, request }: EntryFormResult): void {
    const save$ = id
      ? this.spendingService.updateEntry(id, request)
      : this.spendingService.createEntry(this.year(), this.month(), request);
    save$.subscribe(this.afterSave(() => this.reloadEntries()));
  }

  onEntryDeleted(entry: SpendingEntry): void {
    this.spendingService
      .deleteEntry(entry.id)
      .subscribe(this.afterSave(() => this.reloadEntries()));
  }

  private reloadEntries(): void {
    this.entriesPage.reload();
    this.summary.reload();
    this.accountBalance.reload();
  }

  private afterSave(reload: () => void) {
    return {
      next: () => {
        this.saveFailed.set(false);
        reload();
      },
      error: () => this.saveFailed.set(true),
    };
  }

  // ---------- Filters ----------
  openFilters(): void {
    this.filterModal().open(this.filters(), this.matchCount());
  }

  clearFilters(): void {
    this.filters.update(withoutFilters);
  }

  // ---------- Budget ----------
  openBudget(): void {
    this.budgetModal().open(this.budget());
  }

  onBudgetSaved(amount: number): void {
    this.spendingService
      .setBudget(this.year(), this.month(), amount)
      .subscribe(this.afterSave(() => this.summary.reload()));
  }

  // ---------- Display helpers ----------
  typeLabel(type: EntryType): string {
    return this.i18n.translate(`spending.types.${type}`);
  }

  categoryLabel(category: SpendingCategory): string {
    return this.i18n.translate(`spending.categories.${category}`);
  }

  typeColor(type: EntryType): TagColor {
    return TYPE_TAG_COLORS.get(type) ?? 'neutral';
  }

  categoryColor(category: SpendingCategory): string {
    return CATEGORY_COLORS.get(category) ?? 'var(--color-data-gray)';
  }

  signedAmount(entry: SpendingEntry): string {
    return this.formatting.signedMoney(entry.type === 'Income' ? entry.amount : -entry.amount);
  }

  private wasEdited(entry: SpendingEntry): boolean {
    return daysUntil(entry.updatedAtUtc) !== daysUntil(entry.createdAtUtc);
  }

  private money(amount: number): string {
    return this.formatting.money(amount);
  }
}
