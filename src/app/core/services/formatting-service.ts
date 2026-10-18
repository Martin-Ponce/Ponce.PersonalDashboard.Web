import { formatCurrency, formatDate, formatNumber, getCurrencySymbol } from '@angular/common';
import { Injectable, computed, inject } from '@angular/core';
import { CURRENCIES_WITHOUT_DECIMALS, CurrencyCode } from '../constants/settings.constants';
import { daysUntil } from '../pipes/days-until-pipe';
import { SettingsService } from './settings-service';
import { TranslationService } from './translation-service';

export interface MoneyFormat {
  /** Angular locale, e.g. "en-US". */
  locale: string;
  currency: CurrencyCode;
  showDecimals: boolean;
}

export function currencySymbol(currency: CurrencyCode, locale: string): string {
  return getCurrencySymbol(currency, 'narrow', locale);
}

/** Formats an amount, dropping cents when decimals are off. */
export function formatMoney(amount: number, format: MoneyFormat): string {
  const decimals = format.showDecimals && !CURRENCIES_WITHOUT_DECIMALS.includes(format.currency);
  return formatCurrency(
    amount,
    format.locale,
    currencySymbol(format.currency, format.locale),
    format.currency,
    decimals ? '1.2-2' : '1.0-0',
  );
}

/** Formats money, dates and numbers per language and user settings. */
@Injectable({
  providedIn: 'root',
})
export class FormattingService {
  private readonly i18n = inject(TranslationService);
  private readonly settings = inject(SettingsService);

  readonly locale = this.i18n.locale;
  readonly datePattern = this.settings.datePattern;
  readonly currencySymbol = computed(() => currencySymbol(this.settings.currency(), this.locale()));

  money(amount: number): string {
    return formatMoney(amount, {
      locale: this.locale(),
      currency: this.settings.currency(),
      showDecimals: this.settings.showDecimals(),
    });
  }

  signedMoney(amount: number): string {
    if (amount === 0) return this.money(0);
    return `${amount < 0 ? '−' : '+'}${this.money(Math.abs(amount))}`;
  }

  /** Month and year in the current language (month is 1-based). */
  monthYear(year: number, month: number): string {
    return formatDate(
      new Date(year, month - 1, 1),
      this.i18n.translate('common.dateFormats.monthYear'),
      this.locale(),
    );
  }

  /** "Today", "Yesterday", or the date in the user's format. */
  lastUpdated(date: string | Date): string {
    const days = daysUntil(date);
    if (days === 0) return this.i18n.translate('common.relativeDays.today');
    if (days === -1) return this.i18n.translate('common.relativeDays.yesterday');
    return formatDate(date, this.datePattern(), this.locale());
  }

  decimal(value: number): string {
    return formatNumber(value, this.locale(), '1.0-1');
  }

  /** Number plus its pluralized unit, e.g. "1.5 hours". */
  quantity(value: number, unitKey: string): string {
    const rounded = Math.round(value * 10) / 10;
    return this.i18n.translate(`${unitKey}.${rounded === 1 ? 'one' : 'other'}`, {
      count: this.decimal(rounded),
    });
  }
}
