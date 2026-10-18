import { EntryFilters, EntrySortField } from '../../core/models/spending/spending-models';

export const SORT_FIELDS: EntrySortField[] = [
  'createdAt',
  'updatedAt',
  'name',
  'amount',
  'category',
];

export const DEFAULT_FILTERS: EntryFilters = {
  sort: 'createdAt',
  direction: 'asc',
  nameContains: '',
  types: [],
  categories: [],
  minAmount: null,
  maxAmount: null,
};

export function activeFilterCount(filters: EntryFilters): number {
  return [
    filters.nameContains.trim() !== '',
    filters.types.length > 0,
    filters.categories.length > 0,
    filters.minAmount !== null || filters.maxAmount !== null,
  ].filter(Boolean).length;
}

export function withoutFilters(filters: EntryFilters): EntryFilters {
  return { ...DEFAULT_FILTERS, sort: filters.sort, direction: filters.direction };
}
