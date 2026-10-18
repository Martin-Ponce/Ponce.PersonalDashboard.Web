import { DatePipe, formatDate } from '@angular/common';
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
  APPLICATION_STATUSES,
  applicationLocation,
  companyColor,
  statusTagColor,
  wasEdited,
} from '../../core/constants/job-applications.constants';
import {
  ApplicationFilters,
  JobApplication,
  JobApplicationStatus,
} from '../../core/models/job-applications/job-application-models';
import { FormattingService } from '../../core/services/formatting-service';
import { JobApplicationsService } from '../../core/services/job-applications-service';
import { TranslationService } from '../../core/services/translation-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { Button } from '../../core/ui/components/button/button';
import { Card } from '../../core/ui/components/card/card';
import { Metric } from '../../core/ui/components/metric/metric';
import { MonthPicker } from '../../core/ui/components/month-picker/month-picker';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { DEFAULT_PAGE_SIZE, Paginator } from '../../core/ui/components/paginator/paginator';
import { Table, TableColumn } from '../../core/ui/components/table/table';
import { Tag, TagColor } from '../../core/ui/components/tag/tag';
import { latestValue } from '../../core/utils/resource-utils';
import {
  ApplicationFormModal,
  ApplicationFormResult,
} from './application-form-modal/application-form-modal';
import { DEFAULT_FILTERS, activeFilterCount, withoutFilters } from './application-filters';
import { ApplicationFilterModal } from './filter-modal/filter-modal';

const YEARS_BACK = 1;

const RESPONDED: JobApplicationStatus[] = ['Interview', 'Offer', 'Rejected'];
const ACTIVE: JobApplicationStatus[] = ['Applied', 'Interview', 'Offer'];

@Component({
  selector: 'app-job-applications',
  imports: [
    DatePipe,
    TranslocoPipe,
    Banner,
    Button,
    Card,
    Metric,
    MonthPicker,
    PageHeader,
    Paginator,
    Table,
    Tag,
    ApplicationFilterModal,
    ApplicationFormModal,
  ],
  templateUrl: './job-applications.html',
  styleUrl: './job-applications.css',
})
export class JobApplications {
  private readonly applicationsService = inject(JobApplicationsService);
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  protected readonly locale = this.i18n.locale;
  protected readonly datePattern = this.formatting.datePattern;
  protected readonly statuses = APPLICATION_STATUSES;

  private readonly formModal = viewChild.required(ApplicationFormModal);
  private readonly filterModal = viewChild.required(ApplicationFilterModal);

  private readonly today = new Date();
  protected readonly minYear = this.today.getFullYear() - YEARS_BACK;
  protected readonly maxYear = this.today.getFullYear();

  // ---------- Month (bound two-way to the month picker) ----------
  protected readonly year = signal(this.today.getFullYear());
  protected readonly month = signal(this.today.getMonth() + 1);

  // ---------- Filters ----------
  protected readonly filters = signal<ApplicationFilters>(DEFAULT_FILTERS);
  protected readonly activeFilters = computed(() => activeFilterCount(this.filters()));

  // ---------- Pages ----------
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  /** 1-based. */
  protected readonly page = linkedSignal({
    source: () => [this.year(), this.month(), this.filters()],
    computation: () => 1,
  });

  // ---------- Data ----------
  private readonly period = computed(() => ({ year: this.year(), month: this.month() }));

  private readonly applicationsPage = rxResource({
    params: () => ({
      ...this.period(),
      filters: this.filters(),
      page: this.page(),
      pageSize: this.pageSize(),
    }),
    stream: ({ params }) =>
      this.applicationsService.getApplicationsIn(
        params.year,
        params.month,
        params.page,
        params.pageSize,
        params.filters,
      ),
  });
  private readonly applicationsResult = latestValue(this.applicationsPage);
  protected readonly pagedApplications = computed(() => this.applicationsResult()?.data ?? []);
  protected readonly matchCount = computed(
    () => this.applicationsResult()?.pagination?.totalCount ?? 0,
  );

  private readonly summary = rxResource({
    params: this.period,
    stream: ({ params }) => this.applicationsService.getMonthlySummary(params.year, params.month),
  });
  private readonly summaryValue = latestValue(this.summary);
  protected readonly monthCount = computed(() => this.summaryValue()?.total ?? 0);
  protected readonly cities = computed(() => this.summaryValue()?.cities ?? []);

  protected readonly newApplicationDate = computed(() =>
    this.applicationsService.applicationDate(this.year(), this.month()),
  );

  // ---------- Errors ----------
  protected readonly loadFailed = computed(
    () => this.applicationsPage.status() === 'error' || this.summary.status() === 'error',
  );
  protected readonly saveFailed = signal(false);
  protected readonly errorMessage = computed(() =>
    this.loadFailed()
      ? this.i18n.translate('jobApplications.loadError')
      : this.saveFailed()
        ? this.i18n.translate('jobApplications.saveError')
        : '',
  );

  protected readonly sortSummary = computed(() => {
    const { sort, direction } = this.filters();
    return this.i18n.translate('common.filters.sortSummary', {
      field: this.i18n.translate(`jobApplications.filters.fields.${sort}`).toLocaleLowerCase(),
      order: this.i18n
        .translate(`jobApplications.filters.orders.${sort}.${direction}`)
        .toLocaleLowerCase(),
    });
  });

  // ---------- Labels ----------
  protected readonly periodLabel = computed(() =>
    this.formatting.monthYear(this.year(), this.month()),
  );
  protected readonly periodShort = computed(() =>
    formatDate(new Date(this.year(), this.month() - 1, 1), 'MMM y', this.locale()),
  );

  protected readonly countLabel = computed(() => {
    const count = this.monthCount();
    return this.activeFilters()
      ? this.i18n.plural('jobApplications.countFiltered', count, { shown: this.matchCount() })
      : this.i18n.plural('jobApplications.count', count);
  });

  protected readonly emptyState = computed(() =>
    this.monthCount()
      ? {
          title: this.i18n.translate('jobApplications.noMatchTitle'),
          text: this.i18n.translate('common.filters.noMatchText'),
        }
      : {
          title: this.i18n.translate('jobApplications.emptyTitle', {
            period: this.periodLabel(),
          }),
          text: this.i18n.translate('jobApplications.emptyText'),
        },
  );

  protected readonly filteredSummary = computed(() =>
    this.i18n.translate('jobApplications.filteredSummary', {
      shown: this.matchCount(),
      count: this.monthCount(),
    }),
  );

  // ---------- Totals (always the whole month) ----------
  protected readonly pipeline = computed(() =>
    APPLICATION_STATUSES.map((status) => ({
      ...status,
      count: this.countWith([status.value]),
    })),
  );

  protected readonly sent = computed(() => this.monthCount());
  protected readonly stillActive = computed(() => this.countWith(ACTIVE));
  protected readonly responseRate = computed(() =>
    this.sent() ? `${Math.round((this.countWith(RESPONDED) / this.sent()) * 100)}%` : '—',
  );

  // ---------- Table ----------
  protected readonly columns = computed<TableColumn<JobApplication>[]>(() => [
    {
      key: 'companyName',
      label: this.i18n.translate('jobApplications.columns.company'),
      type: 'initial',
      emphasis: true,
      getBadgeColor: (row) => companyColor(row.companyName),
    },
    { key: 'jobTitle', label: this.i18n.translate('jobApplications.columns.role') },
    {
      key: 'status',
      label: this.i18n.translate('jobApplications.columns.status'),
      type: 'tag',
      getLabel: (row) => this.statusLabel(row.status),
      getTagColor: (row) => this.statusColor(row.status),
    },
    {
      key: 'location',
      label: this.i18n.translate('jobApplications.columns.location'),
      getLabel: (row) => this.location(row),
      muted: true,
    },
    {
      key: 'salary',
      label: this.i18n.translate('jobApplications.columns.salary'),
      align: 'right',
      getLabel: (row) => this.salaryLabel(row),
      muted: true,
    },
    {
      key: 'dateApplied',
      label: this.i18n.translate('jobApplications.columns.appliedOn'),
      type: 'date',
      dateFormat: this.datePattern(),
      align: 'right',
      muted: true,
    },
    {
      key: 'updatedAtUtc',
      label: this.i18n.translate('jobApplications.columns.updatedAt'),
      align: 'right',
      getLabel: (row) => this.formatting.lastUpdated(row.updatedAtUtc),
      getTone: (row) => (wasEdited(row) ? 'strong' : 'muted'),
    },
    {
      key: 'actions',
      label: this.i18n.translate('jobApplications.columns.actions'),
      type: 'actions',
      actions: [
        {
          icon: 'pencil',
          title: (row) =>
            this.i18n.translate('jobApplications.editLabel', { company: row.companyName }),
          action: (row) => this.editApplication(row),
        },
      ],
    },
  ]);

  constructor() {
    // Step back a page when a delete empties the last one.
    effect(() => {
      const pagination = this.applicationsResult()?.pagination;
      if (
        pagination &&
        pagination.totalPages > 0 &&
        pagination.currentPage > pagination.totalPages
      ) {
        this.page.set(pagination.totalPages);
      }
    });
  }

  // ---------- Applications ----------
  openNewApplication(): void {
    this.formModal().open();
  }

  editApplication(application: JobApplication): void {
    this.formModal().open(application);
  }

  onApplicationSaved({ id, request }: ApplicationFormResult): void {
    const save$ = id
      ? this.applicationsService.updateApplication(id, request)
      : this.applicationsService.createApplication(request);
    save$.subscribe(this.afterSave());
  }

  onApplicationDeleted(application: JobApplication): void {
    this.applicationsService.deleteApplication(application.id).subscribe(this.afterSave());
  }

  private afterSave() {
    return {
      next: () => {
        this.saveFailed.set(false);
        this.applicationsPage.reload();
        this.summary.reload();
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

  // ---------- Display helpers ----------
  statusLabel(status: JobApplicationStatus): string {
    return this.i18n.translate(`jobApplications.status.${status}`);
  }

  statusColor(status: JobApplicationStatus): TagColor {
    return statusTagColor(status);
  }

  location(application: JobApplication): string {
    return applicationLocation(application, (mode) =>
      this.i18n.translate(`jobApplications.workModes.${mode}`),
    );
  }

  salaryLabel(application: JobApplication): string {
    return application.salary === null ? '—' : this.formatting.money(application.salary);
  }

  companyColor(application: JobApplication): string {
    return companyColor(application.companyName);
  }

  private countWith(statuses: JobApplicationStatus[]): number {
    const counts = this.summaryValue()?.statusCounts;
    return counts ? statuses.reduce((total, status) => total + (counts[status] ?? 0), 0) : 0;
  }
}
