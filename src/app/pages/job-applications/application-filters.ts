import {
  ApplicationFilters,
  ApplicationSortField,
} from '../../core/models/job-applications/job-application-models';

export const SORT_FIELDS: ApplicationSortField[] = [
  'appliedOn',
  'updatedAt',
  'company',
  'role',
  'status',
];

export const DEFAULT_FILTERS: ApplicationFilters = {
  sort: 'appliedOn',
  direction: 'desc',
  search: '',
  statuses: [],
  workModes: [],
  cities: [],
};

export function activeFilterCount(filters: ApplicationFilters): number {
  return [
    filters.search.trim() !== '',
    filters.statuses.length > 0,
    filters.workModes.length > 0,
    filters.cities.length > 0,
  ].filter(Boolean).length;
}

export function withoutFilters(filters: ApplicationFilters): ApplicationFilters {
  return { ...DEFAULT_FILTERS, sort: filters.sort, direction: filters.direction };
}
