export interface Period {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string | null;
}

export type Mood = "happy" | "neutral" | "irritable" | "sad" | "emotional" | null;
export type PainLevel = "none" | "light" | "moderate" | "intense" | "severe" | null;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | null;
export type NutritionLevel = "healthy" | "balanced" | "unhealthy" | "cravings" | null;
export type ExerciseType = "walking" | "running" | "cycling" | "swimming" | "gym" | "yoga" | "sports" | "other" | null;

export interface DaySymptom {
  date: string; // "YYYY-MM-DD"
  mood: Mood;
  pain: PainLevel;
  energy: EnergyLevel;
  nutrition: NutritionLevel;
  exercise: ExerciseType;
  exerciseMinutes: number | null;
  notes: string;
}

export interface UserSettings {
  averageCycleLength: number; // default: 28
  averagePeriodLength: number; // default: 5
}

export interface CycleData {
  periods: Period[];
  symptoms: DaySymptom[];
  settings: UserSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
};

export const DEFAULT_CYCLE_DATA: CycleData = {
  periods: [],
  symptoms: [],
  settings: DEFAULT_SETTINGS,
};
