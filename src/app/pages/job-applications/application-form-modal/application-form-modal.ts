import { formatDate } from '@angular/common';
import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  APPLICATION_STATUSES,
  WORK_MODES,
} from '../../../core/constants/job-applications.constants';
import {
  JobApplication,
  JobApplicationRequest,
  JobApplicationStatus,
  WorkMode,
} from '../../../core/models/job-applications/job-application-models';
import { FormattingService } from '../../../core/services/formatting-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Banner } from '../../../core/ui/components/banner/banner';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { DeleteConfirmation } from '../../../core/ui/components/delete-confirmation/delete-confirmation';
import { Entry } from '../../../core/ui/components/entry/entry';
import { FormField } from '../../../core/ui/components/form-field/form-field';
import { Icon } from '../../../core/ui/components/icon/icon';
import { Modal } from '../../../core/ui/components/modal/modal';
import { Select } from '../../../core/ui/components/select/select';
import { SelectOption } from '../../../core/ui/models/select-option';
import { dayKey, parseDay } from '../../../core/utils/date-utils';

export interface ApplicationFormResult {
  id?: string;
  request: JobApplicationRequest;
}

const DEFAULT_STATUS: JobApplicationStatus = 'Applied';
const DEFAULT_WORK_MODE: WorkMode = 'Hybrid';

const notBlank = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };

const optionalPositive = (control: AbstractControl): ValidationErrors | null =>
  control.value === '' || Number(control.value) > 0 ? null : { positive: true };

/** Add/edit window for a job application. */
@Component({
  selector: 'app-application-form-modal',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    Banner,
    Button,
    Card,
    DeleteConfirmation,
    Entry,
    FormField,
    Icon,
    Modal,
    Select,
  ],
  templateUrl: './application-form-modal.html',
  styleUrl: './application-form-modal.css',
})
export class ApplicationFormModal {
  private readonly i18n = inject(TranslationService);

  protected readonly currencySymbol = inject(FormattingService).currencySymbol;

  periodLabel = input.required<string>();
  newApplicationDate = input.required<Date>();

  saved = output<ApplicationFormResult>();
  deleted = output<JobApplication>();

  private readonly modal = viewChild.required(Modal);
  private readonly companyEntry = viewChild.required<Entry>('companyEntry');

  protected readonly statuses = APPLICATION_STATUSES;

  protected readonly workModeOptions = computed<SelectOption<WorkMode>[]>(() =>
    WORK_MODES.map((mode) => ({
      label: this.i18n.translate(`jobApplications.workModes.${mode}`),
      value: mode,
    })),
  );

  protected readonly form = new FormGroup({
    company: new FormControl('', { nonNullable: true, validators: notBlank }),
    role: new FormControl('', { nonNullable: true, validators: notBlank }),
    city: new FormControl('', { nonNullable: true }),
    workMode: new FormControl<WorkMode>(DEFAULT_WORK_MODE, { nonNullable: true }),
    status: new FormControl<JobApplicationStatus>(DEFAULT_STATUS, { nonNullable: true }),
    salary: new FormControl('', { nonNullable: true, validators: optionalPositive }),
  });

  protected readonly selectedStatus = toSignal(this.form.controls.status.valueChanges, {
    initialValue: DEFAULT_STATUS,
  });

  protected readonly editing = signal<JobApplication | null>(null);
  protected readonly tried = signal(false);
  protected readonly confirmingDelete = signal(false);

  protected readonly dateLabel = computed(() => {
    const editing = this.editing();
    const date = editing ? parseDay(editing.dateApplied) : this.newApplicationDate();
    return formatDate(date, this.i18n.translate('common.dateFormats.long'), this.i18n.locale());
  });

  constructor() {
    this.form.controls.workMode.valueChanges.pipe(takeUntilDestroyed()).subscribe((mode) => {
      const city = this.form.controls.city;
      if (mode === 'Remote') city.disable({ emitEvent: false });
      else city.enable({ emitEvent: false });
    });
  }

  open(application?: JobApplication): void {
    this.editing.set(application ?? null);
    this.tried.set(false);
    this.confirmingDelete.set(false);
    this.form.reset({
      company: application?.companyName ?? '',
      role: application?.jobTitle ?? '',
      city: application?.city ?? '',
      workMode: application?.workMode ?? DEFAULT_WORK_MODE,
      status: application?.status ?? DEFAULT_STATUS,
      salary: application?.salary == null ? '' : String(application.salary),
    });
    this.modal().open();
    this.companyEntry().focus();
  }

  close(): void {
    this.modal().close();
  }

  protected pickStatus(status: JobApplicationStatus): void {
    this.form.controls.status.setValue(status);
  }

  protected formError(): string {
    if (!this.tried()) return '';
    if (this.form.controls.company.invalid) {
      return this.i18n.translate('jobApplications.form.companyRequired');
    }
    if (this.form.controls.role.invalid) {
      return this.i18n.translate('jobApplications.form.roleRequired');
    }
    if (this.form.controls.salary.invalid) {
      return this.i18n.translate('jobApplications.form.salaryInvalid');
    }
    return '';
  }

  protected save(): void {
    this.tried.set(true);
    if (this.form.invalid) return;
    const { company, role, city, workMode, status, salary } = this.form.getRawValue();
    const editing = this.editing();
    this.saved.emit({
      id: editing?.id,
      request: {
        companyName: company.trim(),
        jobTitle: role.trim(),
        status,
        workMode,
        // getRawValue still has the disabled city, so drop it for Remote.
        city: workMode === 'Remote' ? null : city.trim() || null,
        salary: salary === '' ? null : Math.round(Number(salary) * 100) / 100,
        dateApplied: editing?.dateApplied ?? dayKey(this.newApplicationDate()),
      },
    });
    this.close();
  }

  protected confirmDelete(): void {
    const application = this.editing();
    if (application) this.deleted.emit(application);
    this.close();
  }
}
