import { EntryType, SpendingCategory } from '../models/spending/spending-models';
import { TagColor } from '../ui/components/tag/tag';

export const ENTRY_TYPES: { value: EntryType; tagColor: TagColor }[] = [
  { value: 'Expense', tagColor: 'danger' },
  { value: 'Income', tagColor: 'success' },
];

export const SPENDING_CATEGORIES: { value: SpendingCategory; type: EntryType; color: string }[] = [
  { value: 'Housing', type: 'Expense', color: 'var(--color-data-blue)' },
  { value: 'Groceries', type: 'Expense', color: 'var(--color-data-orange)' },
  { value: 'EatingOut', type: 'Expense', color: 'var(--color-data-purple)' },
  { value: 'Transport', type: 'Expense', color: 'var(--color-data-teal)' },
  { value: 'Subscriptions', type: 'Expense', color: 'var(--color-data-gray)' },
  { value: 'Shopping', type: 'Expense', color: 'var(--color-data-pink)' },
  { value: 'Gifts', type: 'Expense', color: 'var(--color-data-red)' },
  { value: 'Travel', type: 'Expense', color: 'var(--color-data-green)' },
  { value: 'Electronics', type: 'Expense', color: 'var(--color-data-slate)' },
  { value: 'Freelance', type: 'Income', color: 'var(--color-data-emerald)' },
  { value: 'Sales', type: 'Income', color: 'var(--color-data-gold)' },
  { value: 'Refunds', type: 'Income', color: 'var(--color-data-periwinkle)' },
  { value: 'GiftsReceived', type: 'Income', color: 'var(--color-data-rose)' },
];

export function categoriesFor(type: EntryType): SpendingCategory[] {
  return SPENDING_CATEGORIES.filter((c) => c.type === type).map((c) => c.value);
}

/** Percent of the budget used. */
export const BUDGET_THRESHOLDS = { warning: 50, danger: 75 };
