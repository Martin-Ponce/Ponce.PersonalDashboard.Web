// Mirrors the API's Finances DTOs; enums come over as their names.

export type EntryType = 'Expense' | 'Income';

export type ExpenseCategory =
  | 'Housing'
  | 'Groceries'
  | 'EatingOut'
  | 'Transport'
  | 'Subscriptions'
  | 'Shopping'
  | 'Gifts'
  | 'Travel'
  | 'Electronics';

export type IncomeCategory = 'Freelance' | 'Sales' | 'Refunds' | 'GiftsReceived';

export type SpendingCategory = ExpenseCategory | IncomeCategory;

/** An expense or income in one month. */
export interface SpendingEntry {
  id: string;
  /** 1-12 */
  month: number;
  year: number;
  type: EntryType;
  categoryId: SpendingCategory;
  description: string;
  /** Always positive; `type` gives the sign. */
  amount: number;
  /** ISO date-time (UTC). */
  createdAtUtc: string;
  /** ISO date-time (UTC). */
  updatedAtUtc: string;
}

/** Fields the user can edit on an entry. */
export interface SpendingEntryRequest {
  type: EntryType;
  categoryId: SpendingCategory;
  description: string;
  amount: number;
}

/** A new entry plus its month. */
export interface CreateSpendingEntryRequest extends SpendingEntryRequest {
  month: number;
  year: number;
}

/** Saved entry plus the month's new net total. */
export interface SaveSpendingEntryResponse {
  transaction: SpendingEntry;
  monthTotal: number;
}

/** A page of entries; paging info comes in X-Pagination. */
export interface SpendingEntriesPage {
  transactions: SpendingEntry[];
  total: number;
  monthCount: number;
  filteredTotal: number;
}

export type EntrySortField = 'createdAt' | 'updatedAt' | 'name' | 'amount' | 'category';
export type SortDirection = 'asc' | 'desc';

/** List filters and sort; empty lists or null limits mean "any". */
export interface EntryFilters {
  sort: EntrySortField;
  direction: SortDirection;
  nameContains: string;
  types: EntryType[];
  categories: SpendingCategory[];
  minAmount: number | null;
  maxAmount: number | null;
}

/** Totals and budget for one month. */
export interface MonthlySummary {
  year: number;
  /** 1-12 */
  month: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budget: number;
  hasBudget: boolean;
  remainingBudget: number | null;
  isOverBudget: boolean;
  totalBalance: number | null;
}

/** The account balance. */
export interface Balance {
  initialBalance: number;
  asOfMonth: number | null;
  asOfYear: number | null;
  netSinceStart: number;
  totalBalance: number;
}

export interface SetMonthlyBudgetRequest {
  /** 0 removes the budget. */
  budget: number;
}
