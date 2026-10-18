import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap, timer } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  APPLICATION_STATUSES,
  REMOTE_CITY,
  WORK_MODES,
} from '../../../core/constants/job-applications.constants';
import {
  ApplicationFilters,
  ApplicationSortField,
  JobApplicationStatus,
  SortDirection,
  WorkMode,
} from '../../../core/models/job-applications/job-application-models';
import { JobApplicationsService } from '../../../core/services/job-applications-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Button } from '../../../core/ui/components/button/button';
import { Chip } from '../../../core/ui/components/chip/chip';
import { Entry } from '../../../core/ui/components/entry/entry';
import { Modal } from '../../../core/ui/components/modal/modal';
import { SegmentedControl } from '../../../core/ui/components/segmented-control/segmented-control';
import { SelectOption } from '../../../core/ui/models/select-option';
import { latestValue } from '../../../core/utils/resource-utils';
import { DEFAULT_FILTERS, SORT_FIELDS } from '../application-filters';

const COUNT_DEBOUNCE_MS = 250;

/** Filter & sort window; the draft only applies on confirm. */
@Component({
  selector: 'app-application-filter-modal',
  imports: [FormsModule, TranslocoPipe, Button, Chip, Entry, Modal, SegmentedControl],
  templateUrl: './filter-modal.html',
  styleUrl: '../../../core/ui/styles/filter-window.css',
})
export class ApplicationFilterModal {
  private readonly i18n = inject(TranslationService);
  private readonly applicationsService = inject(JobApplicationsService);

  year = input.required<number>();
  month = input.required<number>();
  cities = input.required<string[]>();
  periodLabel = input.required<string>();

  applied = output<ApplicationFilters>();

  private readonly modal = viewChild.required(Modal);

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly workModes = WORK_MODES;

  protected readonly draft = signal<ApplicationFilters>(DEFAULT_FILTERS);
  protected readonly isOpen = signal(false);
  private readonly openingCount = signal(0);

  protected readonly sortOptions = computed<SelectOption<ApplicationSortField>[]>(() =>
    SORT_FIELDS.map((field) => ({
      label: this.i18n.translate(`jobApplications.filters.fields.${field}`),
      value: field,
    })),
  );

  protected readonly directionOptions = computed<SelectOption<SortDirection>[]>(() =>
    (['asc', 'desc'] as const).map((direction) => ({
      label: this.i18n.translate(
        `jobApplications.filters.orders.${this.draft().sort}.${direction}`,
      ),
      value: direction,
    })),
  );

  private readonly count = rxResource({
    params: () =>
      this.isOpen() ? { year: this.year(), month: this.month(), filters: this.draft() } : undefined,
    stream: ({ params }) =>
      timer(COUNT_DEBOUNCE_MS).pipe(
        switchMap(() =>
          this.applicationsService.countApplicationsIn(params.year, params.month, params.filters),
        ),
      ),
  });
  private readonly latestCount = latestValue(this.count);
  protected readonly matchCount = computed(() => this.latestCount() ?? this.openingCount());

  open(filters: ApplicationFilters, matchCount: number): void {
    this.draft.set({ ...filters });
    this.openingCount.set(matchCount);
    this.isOpen.set(true);
    this.modal().open();
  }

  close(): void {
    this.isOpen.set(false);
    this.modal().close();
  }

  update(patch: Partial<ApplicationFilters>): void {
    this.draft.update((draft) => ({ ...draft, ...patch }));
  }

  toggleStatus(status: JobApplicationStatus): void {
    this.update({ statuses: toggle(this.draft().statuses, status) });
  }

  toggleWorkMode(mode: WorkMode): void {
    this.update({ workModes: toggle(this.draft().workModes, mode) });
  }

  toggleCity(city: string): void {
    this.update({ cities: toggle(this.draft().cities, city) });
  }

  cityLabel(city: string): string {
    return city === REMOTE_CITY ? this.i18n.translate('jobApplications.workModes.Remote') : city;
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
