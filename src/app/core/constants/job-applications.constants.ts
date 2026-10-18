import {
  JobApplication,
  JobApplicationStatus,
  WorkMode,
} from '../models/job-applications/job-application-models';
import { TagColor } from '../ui/components/tag/tag';
import { dayKey } from '../utils/date-utils';

export const APPLICATION_STATUSES: { value: JobApplicationStatus; tagColor: TagColor }[] = [
  { value: 'Applied', tagColor: 'info' },
  { value: 'Interview', tagColor: 'warning' },
  { value: 'Offer', tagColor: 'success' },
  { value: 'Rejected', tagColor: 'neutral' },
];

export function statusTagColor(status: JobApplicationStatus): TagColor {
  return APPLICATION_STATUSES.find((s) => s.value === status)?.tagColor ?? 'neutral';
}

export const WORK_MODES: WorkMode[] = ['OnSite', 'Hybrid', 'Remote'];

const COMPANY_COLORS = [
  'var(--color-data-blue)',
  'var(--color-data-orange)',
  'var(--color-data-purple)',
  'var(--color-data-teal)',
  'var(--color-data-pink)',
  'var(--color-data-green)',
  'var(--color-data-slate)',
  'var(--color-data-red)',
];

export function companyColor(company: string): string {
  return COMPANY_COLORS[company.length % COMPANY_COLORS.length];
}

export function wasEdited(application: JobApplication): boolean {
  return dayKey(application.updatedAtUtc) !== application.dateApplied;
}

/** Must match the API's value. */
export const REMOTE_CITY = 'Remote';

export function applicationLocation(
  application: JobApplication,
  workModeLabel: (mode: WorkMode) => string,
): string {
  const mode = workModeLabel(application.workMode);
  if (application.workMode === 'Remote' || !application.city) return mode;
  return `${application.city} · ${mode}`;
}
