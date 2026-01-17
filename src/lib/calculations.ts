import { addDays, differenceInDays, format, parseISO } from "date-fns";
import type { Period, UserSettings } from "@/types";

export interface CycleCalculations {
  averageCycleLength: number;
  averagePeriodLength: number;
  predictedNextPeriodStart: string | null;
  predictedPeriodDates: string[];
  ovulationDates: string[];
  fertileDates: string[];
  currentCycleDay: number | null;
  daysUntilNextPeriod: number | null;
}

// Calculate the average cycle length from completed periods
export function calculateAverageCycleLength(periods: Period[]): number {
  const sortedPeriods = [...periods].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  if (sortedPeriods.length < 2) {
    return 28; // Default
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < sortedPeriods.length; i++) {
    const prevStart = parseISO(sortedPeriods[i - 1].startDate);
    const currStart = parseISO(sortedPeriods[i].startDate);
    const length = differenceInDays(currStart, prevStart);
    // Only count reasonable cycle lengths (21-45 days)
    if (length >= 21 && length <= 45) {
      cycleLengths.push(length);
    }
  }

  if (cycleLengths.length === 0) {
    return 28;
  }

  return Math.round(
    cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
  );
}

// Calculate average period length
export function calculateAveragePeriodLength(periods: Period[]): number {
  const completedPeriods = periods.filter((p) => p.endDate);

  if (completedPeriods.length === 0) {
    return 5; // Default
  }

  const lengths = completedPeriods.map((p) =>
    differenceInDays(parseISO(p.endDate!), parseISO(p.startDate)) + 1
  );

  return Math.round(
    lengths.reduce((sum, len) => sum + len, 0) / lengths.length
  );
}

// Predict the next upcoming period start date (first one in the future)
export function predictNextPeriod(
  periods: Period[],
  averageCycleLength: number
): string | null {
  if (periods.length === 0) {
    return null;
  }

  const sortedPeriods = [...periods].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const lastPeriodStart = parseISO(sortedPeriods[0].startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the next period that's in the future
  let nextStart = addDays(lastPeriodStart, averageCycleLength);
  while (nextStart < today) {
    nextStart = addDays(nextStart, averageCycleLength);
  }

  return format(nextStart, "yyyy-MM-dd");
}

// Get array of predicted period dates for multiple cycles
export function getPredictedPeriodDates(
  periods: Period[],
  averageCycleLength: number,
  averagePeriodLength: number,
  numberOfCycles: number = 6
): string[] {
  if (periods.length === 0) {
    return [];
  }

  const sortedPeriods = [...periods].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const lastPeriodStart = parseISO(sortedPeriods[0].startDate);
  const dates: string[] = [];

  // Generate predicted periods for multiple cycles ahead
  for (let cycle = 1; cycle <= numberOfCycles; cycle++) {
    const cycleStart = addDays(lastPeriodStart, averageCycleLength * cycle);
    for (let day = 0; day < averagePeriodLength; day++) {
      dates.push(format(addDays(cycleStart, day), "yyyy-MM-dd"));
    }
  }

  return dates;
}

// Calculate ovulation days for multiple cycles (past and future)
export function calculateOvulationDays(
  periods: Period[],
  averageCycleLength: number,
  numberOfCycles: number = 12
): string[] {
  if (periods.length === 0) {
    return [];
  }

  const sortedPeriods = [...periods].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const lastPeriodStart = parseISO(sortedPeriods[0].startDate);
  const ovulationDays: string[] = [];

  // Generate ovulation dates for past cycles (going back) and future cycles
  for (let cycle = -6; cycle <= numberOfCycles; cycle++) {
    const cycleStart = addDays(lastPeriodStart, averageCycleLength * cycle);
    // Ovulation typically occurs 14 days before the next period (so cycleLength - 14 days after period start)
    const ovulationDay = addDays(cycleStart, averageCycleLength - 14);
    ovulationDays.push(format(ovulationDay, "yyyy-MM-dd"));
  }

  return ovulationDays;
}

// Get fertile window for multiple ovulation dates
export function getFertileWindows(ovulationDates: string[]): string[] {
  const dates: string[] = [];

  for (const ovulationDate of ovulationDates) {
    const ovulation = parseISO(ovulationDate);

    // 5 days before ovulation
    for (let i = 5; i > 0; i--) {
      dates.push(format(addDays(ovulation, -i), "yyyy-MM-dd"));
    }
    // Day after ovulation
    dates.push(format(addDays(ovulation, 1), "yyyy-MM-dd"));
  }

  return dates;
}

// Calculate current cycle day (accounts for multiple cycles passed)
export function getCurrentCycleDay(
  periods: Period[],
  averageCycleLength: number
): number | null {
  if (periods.length === 0) {
    return null;
  }

  const sortedPeriods = [...periods].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  const lastPeriodStart = parseISO(sortedPeriods[0].startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysSinceLastPeriod = differenceInDays(today, lastPeriodStart);

  // If more than one cycle has passed, calculate position in current cycle
  if (daysSinceLastPeriod > averageCycleLength) {
    daysSinceLastPeriod = daysSinceLastPeriod % averageCycleLength;
  }

  const cycleDay = daysSinceLastPeriod + 1;

  // Only return if it's a reasonable value
  if (cycleDay > 0 && cycleDay <= averageCycleLength) {
    return cycleDay;
  }

  return null;
}

// Calculate days until next period
export function getDaysUntilNextPeriod(
  predictedStart: string | null
): number | null {
  if (!predictedStart) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextStart = parseISO(predictedStart);
  const days = differenceInDays(nextStart, today);

  return days;
}

// Get all calculations at once
export function getAllCalculations(
  periods: Period[],
  settings: UserSettings
): CycleCalculations {
  const averageCycleLength =
    periods.length >= 2
      ? calculateAverageCycleLength(periods)
      : settings.averageCycleLength;

  const averagePeriodLength =
    periods.length >= 1
      ? calculateAveragePeriodLength(periods)
      : settings.averagePeriodLength;

  const predictedNextPeriodStart = predictNextPeriod(periods, averageCycleLength);
  const predictedPeriodDates = getPredictedPeriodDates(
    periods,
    averageCycleLength,
    averagePeriodLength
  );

  const ovulationDates = calculateOvulationDays(periods, averageCycleLength);
  const fertileDates = getFertileWindows(ovulationDates);

  const currentCycleDay = getCurrentCycleDay(periods, averageCycleLength);
  const daysUntilNextPeriod = getDaysUntilNextPeriod(predictedNextPeriodStart);

  return {
    averageCycleLength,
    averagePeriodLength,
    predictedNextPeriodStart,
    predictedPeriodDates,
    ovulationDates,
    fertileDates,
    currentCycleDay,
    daysUntilNextPeriod,
  };
}
