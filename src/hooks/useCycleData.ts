"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "@/lib/utils";
import type {
  CycleData,
  Period,
  DaySymptom,
  FertilityDay,
  UserSettings,
  Mood,
  PainLevel,
  EnergyLevel,
  NutritionLevel,
  ExerciseType,
  CervicalMucus,
  OvulationTest,
} from "@/types";
import { DEFAULT_CYCLE_DATA } from "@/types";

export function useCycleData() {
  const [cycleData, setCycleData, isLoaded] = useLocalStorage<CycleData>(
    "menstruatie-kalender-data",
    DEFAULT_CYCLE_DATA
  );

  // Toggle period for a specific date
  const togglePeriodDay = useCallback(
    (dateString: string) => {
      setCycleData((prev) => {
        // Find if this date is already in a period
        const existingPeriodIndex = prev.periods.findIndex((period) => {
          if (!period.endDate) {
            return dateString === period.startDate;
          }
          return dateString >= period.startDate && dateString <= period.endDate;
        });

        if (existingPeriodIndex !== -1) {
          // Date is in a period - remove or shrink it
          const period = prev.periods[existingPeriodIndex];

          if (period.startDate === dateString && period.endDate === dateString) {
            // Single day period - remove entirely
            return {
              ...prev,
              periods: prev.periods.filter((_, i) => i !== existingPeriodIndex),
            };
          } else if (period.startDate === dateString) {
            // Remove from start
            const nextDay = new Date(dateString);
            nextDay.setDate(nextDay.getDate() + 1);
            const newStart = nextDay.toISOString().split("T")[0];
            return {
              ...prev,
              periods: prev.periods.map((p, i) =>
                i === existingPeriodIndex ? { ...p, startDate: newStart } : p
              ),
            };
          } else if (period.endDate === dateString) {
            // Remove from end
            const prevDay = new Date(dateString);
            prevDay.setDate(prevDay.getDate() - 1);
            const newEnd = prevDay.toISOString().split("T")[0];
            return {
              ...prev,
              periods: prev.periods.map((p, i) =>
                i === existingPeriodIndex ? { ...p, endDate: newEnd } : p
              ),
            };
          } else if (!period.endDate) {
            // Single day, remove it
            return {
              ...prev,
              periods: prev.periods.filter((_, i) => i !== existingPeriodIndex),
            };
          } else {
            // Middle of period - split into two or just remove (for simplicity, remove entire period)
            return {
              ...prev,
              periods: prev.periods.filter((_, i) => i !== existingPeriodIndex),
            };
          }
        } else {
          // Date is not in a period - add it or extend existing
          // Check if adjacent to an existing period
          const dayBefore = new Date(dateString);
          dayBefore.setDate(dayBefore.getDate() - 1);
          const dayBeforeString = dayBefore.toISOString().split("T")[0];

          const dayAfter = new Date(dateString);
          dayAfter.setDate(dayAfter.getDate() + 1);
          const dayAfterString = dayAfter.toISOString().split("T")[0];

          // Find period ending the day before
          const periodEndingBefore = prev.periods.findIndex(
            (p) => p.endDate === dayBeforeString || (!p.endDate && p.startDate === dayBeforeString)
          );

          // Find period starting the day after
          const periodStartingAfter = prev.periods.findIndex(
            (p) => p.startDate === dayAfterString
          );

          if (periodEndingBefore !== -1 && periodStartingAfter !== -1) {
            // Merge two periods
            const beforePeriod = prev.periods[periodEndingBefore];
            const afterPeriod = prev.periods[periodStartingAfter];
            return {
              ...prev,
              periods: prev.periods
                .filter((_, i) => i !== periodEndingBefore && i !== periodStartingAfter)
                .concat({
                  id: beforePeriod.id,
                  startDate: beforePeriod.startDate,
                  endDate: afterPeriod.endDate || afterPeriod.startDate,
                }),
            };
          } else if (periodEndingBefore !== -1) {
            // Extend period forward
            return {
              ...prev,
              periods: prev.periods.map((p, i) =>
                i === periodEndingBefore
                  ? { ...p, endDate: dateString }
                  : p
              ),
            };
          } else if (periodStartingAfter !== -1) {
            // Extend period backward
            return {
              ...prev,
              periods: prev.periods.map((p, i) =>
                i === periodStartingAfter
                  ? { ...p, startDate: dateString }
                  : p
              ),
            };
          } else {
            // Create new period
            return {
              ...prev,
              periods: [
                ...prev.periods,
                {
                  id: generateId(),
                  startDate: dateString,
                  endDate: dateString,
                },
              ],
            };
          }
        }
      });
    },
    [setCycleData]
  );

  // Get or create symptom for a date
  const getSymptomForDate = useCallback(
    (dateString: string): DaySymptom | null => {
      return cycleData.symptoms.find((s) => s.date === dateString) || null;
    },
    [cycleData.symptoms]
  );

  // Update symptom for a date
  const updateSymptom = useCallback(
    (
      dateString: string,
      updates: {
        mood?: Mood;
        pain?: PainLevel;
        energy?: EnergyLevel;
        nutrition?: NutritionLevel;
        exercise?: ExerciseType;
        exerciseMinutes?: number | null;
        notes?: string;
      }
    ) => {
      setCycleData((prev) => {
        const existingIndex = prev.symptoms.findIndex((s) => s.date === dateString);

        if (existingIndex !== -1) {
          // Update existing
          return {
            ...prev,
            symptoms: prev.symptoms.map((s, i) =>
              i === existingIndex ? { ...s, ...updates } : s
            ),
          };
        } else {
          // Create new
          return {
            ...prev,
            symptoms: [
              ...prev.symptoms,
              {
                date: dateString,
                mood: updates.mood ?? null,
                pain: updates.pain ?? null,
                energy: updates.energy ?? null,
                nutrition: updates.nutrition ?? null,
                exercise: updates.exercise ?? null,
                exerciseMinutes: updates.exerciseMinutes ?? null,
                notes: updates.notes ?? "",
              },
            ],
          };
        }
      });
    },
    [setCycleData]
  );

  // Get fertility data for a date
  const getFertilityForDate = useCallback(
    (dateString: string): FertilityDay | null => {
      return cycleData.fertility?.find((f) => f.date === dateString) || null;
    },
    [cycleData.fertility]
  );

  // Update fertility data for a date
  const updateFertility = useCallback(
    (
      dateString: string,
      updates: {
        temperature?: number | null;
        cervicalMucus?: CervicalMucus;
        ovulationTest?: OvulationTest;
        intercourse?: boolean;
        supplements?: boolean;
        notes?: string;
      }
    ) => {
      setCycleData((prev) => {
        const fertility = prev.fertility || [];
        const existingIndex = fertility.findIndex((f) => f.date === dateString);

        if (existingIndex !== -1) {
          // Update existing
          return {
            ...prev,
            fertility: fertility.map((f, i) =>
              i === existingIndex ? { ...f, ...updates } : f
            ),
          };
        } else {
          // Create new
          return {
            ...prev,
            fertility: [
              ...fertility,
              {
                date: dateString,
                temperature: updates.temperature ?? null,
                cervicalMucus: updates.cervicalMucus ?? null,
                ovulationTest: updates.ovulationTest ?? null,
                intercourse: updates.intercourse ?? false,
                supplements: updates.supplements ?? false,
                notes: updates.notes ?? "",
              },
            ],
          };
        }
      });
    },
    [setCycleData]
  );

  // Update settings
  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setCycleData((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));
    },
    [setCycleData]
  );

  // Get all periods sorted by start date
  const getSortedPeriods = useCallback((): Period[] => {
    return [...cycleData.periods].sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
  }, [cycleData.periods]);

  return {
    cycleData,
    isLoaded,
    togglePeriodDay,
    getSymptomForDate,
    updateSymptom,
    getFertilityForDate,
    updateFertility,
    updateSettings,
    getSortedPeriods,
  };
}
