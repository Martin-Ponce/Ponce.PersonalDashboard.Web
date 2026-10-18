// Mirrors the API's Goals DTOs; enums come over as their names.

export type GoalUnit = 'Minutes' | 'Hours' | 'Times';

export type DayOfWeekName =
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/** Monday = 0 ... Sunday = 6. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A daily habit plus how it's going this week. */
export interface DailyGoal {
  id: string;
  title: string;
  amount: number;
  unit: GoalUnit;
  plannedDays: DayOfWeekName[];
  /** ISO date-time (UTC). */
  createdAtUtc: string;
  /** Local "yyyy-MM-dd" (today). */
  date: string;
  checked: boolean;
  /** Local "yyyy-MM-dd" days this week it was done. */
  checkedDates: string[];
  weeklyGoal: WeeklyGoal | null;
}

/** Weekly target that lives on a daily goal. */
export interface WeeklyGoal {
  id: string;
  title: string;
  /** Days per week (1-7). */
  targetCount: number;
  progress: number;
  completed: boolean;
  /** "yyyy-MM-dd", Monday and Sunday. */
  weekStart: string;
  weekEnd: string;
}

/** Creates or replaces a daily goal and its weekly goal. */
export interface DailyGoalRequest {
  title: string;
  amount: number;
  unit: GoalUnit;
  plannedDays: DayOfWeekName[];
  /** null removes the weekly goal. */
  weeklyGoal: WeeklyGoalRequest | null;
}

export interface WeeklyGoalRequest {
  title: string | null;
  /** Days per week (1-7). */
  targetCount: number;
}
