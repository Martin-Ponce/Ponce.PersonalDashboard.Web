import { DailyGoal, DayOfWeekName, GoalUnit, Weekday } from '../models/goals/goal-models';
import { addDays, dayKey } from '../utils/date-utils';

export const GOAL_UNITS: GoalUnit[] = ['Minutes', 'Hours', 'Times'];

export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Indexed Monday = 0. */
const DAY_NAMES: DayOfWeekName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MAX_WEEKLY_TARGET = WEEKDAYS.length;

export const DAY_PRESETS: { key: 'everyDay' | 'weekdays' | 'weekends'; days: Weekday[] }[] = [
  { key: 'everyDay', days: [0, 1, 2, 3, 4, 5, 6] },
  { key: 'weekdays', days: [0, 1, 2, 3, 4] },
  { key: 'weekends', days: [5, 6] },
];

export function plannedWeekdays(goal: DailyGoal): Weekday[] {
  return WEEKDAYS.filter((day) => goal.plannedDays.includes(DAY_NAMES[day]));
}

export function dayNames(days: Weekday[]): DayOfWeekName[] {
  return [...days].sort().map((day) => DAY_NAMES[day]);
}

export function completedWeekdays(goal: DailyGoal, weekStart: Date): Weekday[] {
  return WEEKDAYS.filter((day) => goal.checkedDates.includes(dayKey(addDays(weekStart, day))));
}

export function schedulePreset(days: Weekday[]): string | null {
  const sorted = [...days].sort().join();
  return DAY_PRESETS.find((p) => p.days.join() === sorted)?.key ?? null;
}
