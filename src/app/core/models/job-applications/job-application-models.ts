// Mirrors the API's JobApplications DTOs; enums come over as their names.

export type JobApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export type WorkMode = 'OnSite' | 'Hybrid' | 'Remote';

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  city: string | null;
  workMode: WorkMode;
  salary: number | null;
  /** Local "yyyy-MM-dd". */
  dateApplied: string;
  /** ISO date-time (UTC). */
  updatedAtUtc: string;
}

/** Body to create or update an application. */
export interface JobApplicationRequest {
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  city: string | null;
  workMode: WorkMode;
  salary: number | null;
  /** "yyyy-MM-dd", not after today. */
  dateApplied: string;
}

/** Counts for one month's applications, ignoring filters. */
export interface JobApplicationsSummary {
  year: number;
  /** 1-12 */
  month: number;
  total: number;
  statusCounts: Record<JobApplicationStatus, number>;
  cities: string[];
}

export type ApplicationSortField = 'appliedOn' | 'updatedAt' | 'company' | 'role' | 'status';
export type SortDirection = 'asc' | 'desc';

/** List filters and sort; empty lists mean "any". */
export interface ApplicationFilters {
  sort: ApplicationSortField;
  direction: SortDirection;
  search: string;
  statuses: JobApplicationStatus[];
  workModes: WorkMode[];
  cities: string[];
}
