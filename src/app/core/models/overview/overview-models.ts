// Mirrors the API's OverviewResponse.
import { CalendarEvent } from '../calendar/calendar-models';
import { JobApplication, JobApplicationStatus } from '../job-applications/job-application-models';
import { SpendingCategory } from '../spending/spending-models';

/** Everything the overview page shows. */
export interface Overview {
  /** Local "yyyy-MM-dd" (today). */
  date: string;
  balance: OverviewBalance;
  month: OverviewMonth;
  monthlyTotals: OverviewMonthlyTotal[];
  upcomingDates: CalendarEvent[];
  applications: OverviewApplications;
}

export interface OverviewBalance {
  totalBalance: number;
  monthChange: number;
}

export interface OverviewMonth {
  year: number;
  /** 1-12 */
  month: number;
  spent: number;
  earned: number;
  budget: number | null;
  categories: OverviewCategory[];
}

export interface OverviewCategory {
  category: SpendingCategory;
  amount: number;
}

export interface OverviewMonthlyTotal {
  year: number;
  /** 1-12 */
  month: number;
  spent: number;
  budget: number | null;
}

export interface OverviewApplications {
  statusCounts: Record<JobApplicationStatus, number>;
  newThisWeek: number;
  recent: JobApplication[];
}
