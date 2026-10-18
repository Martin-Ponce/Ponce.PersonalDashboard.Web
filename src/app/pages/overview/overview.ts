import { DatePipe, formatDate } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  APPLICATION_STATUSES,
  applicationLocation,
  statusTagColor,
  wasEdited,
} from '../../core/constants/job-applications.constants';
import { SOON_THRESHOLD_DAYS, eventStart } from '../../core/constants/calendar.constants';
import { BUDGET_THRESHOLDS } from '../../core/constants/spending.constants';
import {
  JobApplication,
  JobApplicationStatus,
} from '../../core/models/job-applications/job-application-models';
import { OverviewCategory } from '../../core/models/overview/overview-models';
import { DaysUntilPipe, daysUntil } from '../../core/pipes/days-until-pipe';
import { FormattingService } from '../../core/services/formatting-service';
import { OverviewPreferencesService } from '../../core/services/overview-preferences-service';
import { OverviewService } from '../../core/services/overview-service';
import { TranslationService } from '../../core/services/translation-service';
import { UserService } from '../../core/services/user-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { BarChart, BarChartItem } from '../../core/ui/components/bar-chart/bar-chart';
import { Button } from '../../core/ui/components/button/button';
import { Card } from '../../core/ui/components/card/card';
import { DateChip } from '../../core/ui/components/date-chip/date-chip';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { ProgressBar } from '../../core/ui/components/progress-bar/progress-bar';
import { Stat, StatSubtitleTone } from '../../core/ui/components/stat/stat';
import { Table, TableColumn } from '../../core/ui/components/table/table';
import { Tag, TagColor } from '../../core/ui/components/tag/tag';
import { latestValue } from '../../core/utils/resource-utils';
import { CustomizeOverview } from './customize-overview/customize-overview';
import { pickGreeting } from './greetings';

/** Has to match how many months the API sends. */
const CHART_MONTHS = 6;
const TOP_CATEGORIES_LIMIT = 5;
const ACTIVE_STATUSES: JobApplicationStatus[] = ['Applied', 'Interview'];

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    DatePipe,
    DaysUntilPipe,
    TranslocoPipe,
    Banner,
    BarChart,
    Button,
    Card,
    DateChip,
    PageHeader,
    ProgressBar,
    Stat,
    Table,
    Tag,
    CustomizeOverview,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  host: {
    '(document:keydown.escape)': 'customizeOpen.set(false)',
  },
})
export class Overview {
  private readonly overviewService = inject(OverviewService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  protected readonly today = new Date();
  protected readonly locale = this.i18n.locale;
  protected readonly datePattern = this.formatting.datePattern;
  protected readonly profile = inject(UserService).profile;
  protected readonly widgets = inject(OverviewPreferencesService).widgets;
  protected readonly customizeOpen = signal(false);
  protected readonly chartMonths = CHART_MONTHS;
  protected readonly budgetThresholds = BUDGET_THRESHOLDS;

  // ---------- Data ----------
  private readonly overview = rxResource({
    stream: () => this.overviewService.getOverview(this.today),
  });
  private readonly overviewValue = latestValue(this.overview);
  protected readonly balance = computed(() => this.overviewValue()?.balance ?? null);
  private readonly month = computed(() => this.overviewValue()?.month ?? null);
  private readonly monthlyTotals = computed(() => this.overviewValue()?.monthlyTotals ?? []);
  private readonly upcomingDates = computed(() => this.overviewValue()?.upcomingDates ?? []);
  private readonly applications = computed(() => this.overviewValue()?.applications ?? null);

  protected readonly errorMessage = computed(() =>
    this.overview.status() === 'error' ? this.i18n.translate('overview.loadError') : '',
  );

  // ---------- Header ----------
  private readonly greetingKey = pickGreeting();
  protected readonly greeting = computed(() =>
    this.i18n.translate(`overview.greetings.${this.greetingKey}`, { name: this.profile().name }),
  );
  protected readonly todayLabel = computed(() =>
    formatDate(this.today, this.i18n.translate('common.dateFormats.long'), this.locale()),
  );

  // ---------- At a glance ----------
  protected readonly spentThisMonth = computed(() =>
    this.formatting.signedMoney(-(this.month()?.spent ?? 0)),
  );

  protected readonly balanceLabel = computed(() => this.money(this.balance()?.totalBalance ?? 0));
  protected readonly balanceChange = computed<{ text: string; tone: StatSubtitleTone }>(() => {
    const change = this.balance()?.monthChange ?? 0;
    return {
      text: this.i18n.translate('overview.summary.balanceChange', {
        amount: this.formatting.signedMoney(change),
      }),
      tone: change < 0 ? 'danger' : 'success',
    };
  });

  protected readonly budgetBalance = computed<{ text: string; tone: StatSubtitleTone }>(() => {
    const summary = this.month();
    if (summary?.budget == null) {
      return { text: this.i18n.translate('overview.summary.noBudget'), tone: 'muted' };
    }
    const left = summary.budget - summary.spent;
    return left >= 0
      ? {
          text: this.i18n.translate('overview.summary.leftInBudget', { amount: this.money(left) }),
          tone: 'success',
        }
      : {
          text: this.i18n.translate('overview.summary.overBudget', { amount: this.money(-left) }),
          tone: 'danger',
        };
  });

  protected readonly nextDate = computed(() => this.upcomingDates()[0]);

  protected readonly activeApplications = computed(() => {
    const counts = this.applications()?.statusCounts;
    return counts ? ACTIVE_STATUSES.reduce((total, status) => total + (counts[status] ?? 0), 0) : 0;
  });

  protected readonly newThisWeekLabel = computed(() =>
    this.i18n.plural('overview.summary.newThisWeek', this.applications()?.newThisWeek ?? 0),
  );

  protected readonly upcomingInterviews = signal<string[]>([]).asReadonly();

  // ---------- Monthly spending ----------
  protected readonly chartItems = computed<BarChartItem[]>(() =>
    this.monthlyTotals().map((m) => ({
      label: formatDate(new Date(m.year, m.month - 1), 'MMM', this.locale()),
      value: m.spent,
      valueLabel: this.money(m.spent),
      tone: m.budget === null ? undefined : m.spent > m.budget ? 'danger' : 'success',
    })),
  );

  protected readonly budgetMonthLabel = computed(() =>
    formatDate(this.today, 'MMMM', this.locale()),
  );

  protected readonly budgetUsed = computed(() => {
    const summary = this.month();
    return summary?.budget ? Math.round((summary.spent / summary.budget) * 100) : null;
  });

  protected readonly topCategories = computed(
    () => this.month()?.categories.slice(0, TOP_CATEGORIES_LIMIT) ?? [],
  );

  protected readonly categoryColumns = computed<TableColumn<OverviewCategory>[]>(() => [
    {
      key: 'category',
      label: this.i18n.translate('overview.spending.category'),
      getLabel: (row) => this.i18n.translate(`spending.categories.${row.category}`),
    },
    {
      key: 'amount',
      label: this.i18n.translate('overview.spending.amount'),
      align: 'right',
      getLabel: (row) => this.formatting.signedMoney(-row.amount),
      getTone: () => 'danger',
    },
  ]);

  // ---------- Upcoming dates ----------
  protected readonly dates = computed(() =>
    this.upcomingDates().map((d) => {
      const start = eventStart(d);
      return {
        ...d,
        month: formatDate(start, 'MMM', this.locale()),
        day: formatDate(start, 'd', this.locale()),
        soon: daysUntil(start) <= SOON_THRESHOLD_DAYS,
        meta: [d.time ? formatDate(start, 'EEE HH:mm', this.locale()) : null, d.description]
          .filter(Boolean)
          .join(', '),
      };
    }),
  );

  // ---------- Job applications ----------
  protected readonly recentApplications = computed(() => this.applications()?.recent ?? []);

  protected readonly applicationCounts = computed(() =>
    APPLICATION_STATUSES.map(({ value: status }) =>
      this.i18n.plural(
        `overview.applications.counts.${status}`,
        this.applications()?.statusCounts[status] ?? 0,
      ),
    ).join(' · '),
  );

  protected readonly applicationColumns = computed<TableColumn<JobApplication>[]>(() => [
    {
      key: 'companyName',
      label: this.i18n.translate('overview.applications.columns.company'),
      emphasis: true,
    },
    { key: 'jobTitle', label: this.i18n.translate('overview.applications.columns.role') },
    {
      key: 'status',
      label: this.i18n.translate('overview.applications.columns.status'),
      type: 'tag',
      getLabel: (row) => this.i18n.translate(`jobApplications.status.${row.status}`),
      getTagColor: (row) => this.statusColor(row.status),
    },
    {
      key: 'location',
      label: this.i18n.translate('overview.applications.columns.location'),
      getLabel: (row) => this.location(row),
      muted: true,
    },
    {
      key: 'dateApplied',
      label: this.i18n.translate('overview.applications.columns.appliedOn'),
      type: 'date',
      dateFormat: this.datePattern(),
      align: 'right',
      muted: true,
    },
    {
      key: 'updatedAtUtc',
      label: this.i18n.translate('overview.applications.columns.updatedAt'),
      align: 'right',
      getLabel: (row) => this.formatting.lastUpdated(row.updatedAtUtc),
      getTone: (row) => (wasEdited(row) ? 'strong' : 'muted'),
    },
  ]);

  // ---------- Layout ----------
  protected readonly nothingShown = computed(() => !Object.values(this.widgets()).some(Boolean));

  toggleCustomize(): void {
    this.customizeOpen.update((open) => !open);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  statusColor(status: JobApplicationStatus): TagColor {
    return statusTagColor(status);
  }

  location(application: JobApplication): string {
    return applicationLocation(application, (mode) =>
      this.i18n.translate(`jobApplications.workModes.${mode}`),
    );
  }

  private money(amount: number): string {
    return this.formatting.money(amount);
  }
}
