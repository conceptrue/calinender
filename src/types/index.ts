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

// Fertility tracking types
export type CervicalMucus = "dry" | "sticky" | "creamy" | "watery" | "eggwhite" | null;
export type OvulationTest = "negative" | "positive" | null;

export interface FertilityDay {
  date: string; // "YYYY-MM-DD"
  temperature: number | null; // Basal body temperature in Celsius
  cervicalMucus: CervicalMucus;
  ovulationTest: OvulationTest;
  intercourse: boolean;
  supplements: boolean; // Took fertility supplements
  notes: string;
}

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

export interface NotificationSettings {
  remindersEnabled: boolean;
  daysBeforePeriod: number; // 1-7 days
}

export type Language = "nl" | "en";

export interface UserSettings {
  averageCycleLength: number; // default: 28
  averagePeriodLength: number; // default: 5
  notifications: NotificationSettings;
  language: Language;
}

export interface CycleData {
  periods: Period[];
  symptoms: DaySymptom[];
  fertility: FertilityDay[];
  settings: UserSettings;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  remindersEnabled: false,
  daysBeforePeriod: 2,
};

export const DEFAULT_SETTINGS: UserSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  language: "nl",
};

export const DEFAULT_CYCLE_DATA: CycleData = {
  periods: [],
  symptoms: [],
  fertility: [],
  settings: DEFAULT_SETTINGS,
};
