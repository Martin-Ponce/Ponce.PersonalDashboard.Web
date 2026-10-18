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
import { ENTRY_TYPES, categoriesFor } from '../../../core/constants/spending.constants';
import {
  EntryType,
  SpendingCategory,
  SpendingEntry,
  SpendingEntryRequest,
} from '../../../core/models/spending/spending-models';
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

export interface EntryFormResult {
  id?: string;
  request: SpendingEntryRequest;
}

const DEFAULT_TYPE: EntryType = 'Expense';
const DEFAULT_CATEGORY: SpendingCategory = 'Groceries';

const notBlank = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };

const positiveAmount = (control: AbstractControl): ValidationErrors | null =>
  Number(control.value) > 0 ? null : { positive: true };

/** Add/edit window for a finance entry. */
@Component({
  selector: 'app-entry-form-modal',
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
  templateUrl: './entry-form-modal.html',
  styleUrl: './entry-form-modal.css',
})
export class EntryFormModal {
  periodLabel = input.required<string>();

  saved = output<EntryFormResult>();
  deleted = output<SpendingEntry>();

  private readonly i18n = inject(TranslationService);
  private readonly modal = viewChild.required(Modal);
  private readonly nameEntry = viewChild.required<Entry>('nameEntry');

  protected readonly currencySymbol = inject(FormattingService).currencySymbol;
  protected readonly typeOptions = computed<SelectOption<EntryType>[]>(() =>
    ENTRY_TYPES.map((t) => ({
      label: this.i18n.translate(`spending.types.${t.value}`),
      value: t.value,
    })),
  );
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: notBlank }),
    amount: new FormControl('', { nonNullable: true, validators: positiveAmount }),
    type: new FormControl<EntryType>(DEFAULT_TYPE, { nonNullable: true }),
    category: new FormControl<SpendingCategory>(DEFAULT_CATEGORY, { nonNullable: true }),
  });

  private readonly selectedType = toSignal(this.form.controls.type.valueChanges, {
    initialValue: DEFAULT_TYPE,
  });

  protected readonly categoryOptions = computed<SelectOption<SpendingCategory>[]>(() =>
    categoriesFor(this.selectedType()).map((category) => ({
      label: this.i18n.translate(`spending.categories.${category}`),
      value: category,
    })),
  );

  protected readonly editing = signal<SpendingEntry | null>(null);
  protected readonly tried = signal(false);
  protected readonly confirmingDelete = signal(false);

  constructor() {
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      const categories = categoriesFor(type);
      if (!categories.includes(this.form.controls.category.value)) {
        this.form.controls.category.setValue(categories[0]);
      }
    });
  }

  open(entry?: SpendingEntry): void {
    this.editing.set(entry ?? null);
    this.tried.set(false);
    this.confirmingDelete.set(false);
    this.form.reset({
      name: entry?.description ?? '',
      amount: entry ? String(entry.amount) : '',
      type: entry?.type ?? DEFAULT_TYPE,
      category: entry?.categoryId ?? DEFAULT_CATEGORY,
    });
    this.modal().open();
    this.nameEntry().focus();
  }

  close(): void {
    this.modal().close();
  }

  protected formError(): string {
    if (!this.tried()) return '';
    if (this.form.controls.name.invalid) {
      return this.i18n.translate('finances.entryForm.nameRequired');
    }
    if (this.form.controls.amount.invalid) {
      return this.i18n.translate('finances.entryForm.amountRequired');
    }
    return '';
  }

  protected save(): void {
    this.tried.set(true);
    if (this.form.invalid) return;

    const { name, amount, type, category } = this.form.getRawValue();
    this.saved.emit({
      id: this.editing()?.id,
      request: {
        description: name.trim(),
        amount: Math.round(Number(amount) * 100) / 100,
        type,
        categoryId: category,
      },
    });
    this.close();
  }

  protected confirmDelete(): void {
    const entry = this.editing();
    if (entry) this.deleted.emit(entry);
    this.close();
  }
}
