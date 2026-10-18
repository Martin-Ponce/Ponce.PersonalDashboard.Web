import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { BUDGET_THRESHOLDS } from '../../../core/constants/spending.constants';
import { FormattingService } from '../../../core/services/formatting-service';
import { TranslationService } from '../../../core/services/translation-service';
import { Banner } from '../../../core/ui/components/banner/banner';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { Chip } from '../../../core/ui/components/chip/chip';
import { Entry } from '../../../core/ui/components/entry/entry';
import { FormField } from '../../../core/ui/components/form-field/form-field';
import { Icon } from '../../../core/ui/components/icon/icon';
import { Modal } from '../../../core/ui/components/modal/modal';
import { ProgressBar } from '../../../core/ui/components/progress-bar/progress-bar';

const positiveAmount = (control: AbstractControl): ValidationErrors | null =>
  Number(control.value) > 0 ? null : { positive: true };

const SUGGESTION_ROUNDING = 50;

interface BudgetSuggestion {
  label: string;
  amount: number;
}

/** Set or change a month's budget. */
@Component({
  selector: 'app-budget-modal',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    Banner,
    Button,
    Card,
    Chip,
    Entry,
    FormField,
    Icon,
    Modal,
    ProgressBar,
  ],
  templateUrl: './budget-modal.html',
  styleUrl: './budget-modal.css',
})
export class BudgetModal {
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  periodLabel = input.required<string>();
  spent = input(0);
  previousBudget = input<number | null>(null);

  saved = output<number>();

  private readonly modal = viewChild.required(Modal);
  private readonly amountEntry = viewChild.required<Entry>('amountEntry');

  protected readonly currencySymbol = this.formatting.currencySymbol;
  protected readonly thresholds = BUDGET_THRESHOLDS;
  protected readonly amount = new FormControl('', {
    nonNullable: true,
    validators: positiveAmount,
  });
  private readonly amountValue = toSignal(this.amount.valueChanges, { initialValue: '' });

  protected readonly isEdit = signal(false);
  protected readonly tried = signal(false);

  private readonly budget = computed(() => {
    const value = Number(this.amountValue());
    return value > 0 ? value : null;
  });

  protected readonly usedPercent = computed(() => {
    const budget = this.budget();
    return budget ? Math.round((this.spent() / budget) * 100) : null;
  });

  protected readonly spentText = computed(() =>
    this.spent() > 0
      ? this.i18n.translate('finances.budgetForm.alreadySpent', {
          amount: this.formatting.money(this.spent()),
        })
      : this.i18n.translate('finances.budgetForm.nothingSpent'),
  );

  protected readonly suggestions = computed<BudgetSuggestion[]>(() => {
    const suggestions: BudgetSuggestion[] = [];
    const previous = this.previousBudget();
    if (previous !== null && previous !== this.budget()) {
      suggestions.push({
        label: this.i18n.translate('finances.budgetForm.sameAsLast', {
          amount: this.formatting.money(previous),
        }),
        amount: previous,
      });
    }
    if (this.spent() > 0) {
      const amount = Math.ceil((this.spent() * 1.1) / SUGGESTION_ROUNDING) * SUGGESTION_ROUNDING;
      suggestions.push({
        label: this.i18n.translate('finances.budgetForm.spentPlus10', {
          amount: this.formatting.money(amount),
        }),
        amount,
      });
    }
    return suggestions;
  });

  open(current: number | null): void {
    this.isEdit.set(current !== null);
    this.tried.set(false);
    this.amount.reset(current === null ? '' : String(current));
    this.modal().open();
    this.amountEntry().focus();
  }

  close(): void {
    this.modal().close();
  }

  protected pick(amount: number): void {
    this.amount.setValue(String(amount));
  }

  protected save(): void {
    this.tried.set(true);
    if (this.amount.invalid) return;
    this.saved.emit(Math.round(Number(this.amount.value) * 100) / 100);
    this.close();
  }
}
