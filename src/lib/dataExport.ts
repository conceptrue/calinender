import type { CycleData, Period, DaySymptom, FertilityDay, UserSettings } from "@/types";
import { DEFAULT_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS } from "@/types";

/**
 * Validates that an object is a valid Period
 */
function isValidPeriod(obj: unknown): obj is Period {
  if (typeof obj !== "object" || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.startDate === "string" &&
    (p.endDate === null || typeof p.endDate === "string")
  );
}

/**
 * Validates that an object is a valid DaySymptom
 */
function isValidDaySymptom(obj: unknown): obj is DaySymptom {
  if (typeof obj !== "object" || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return typeof s.date === "string";
}

/**
 * Validates that an object is a valid FertilityDay
 */
function isValidFertilityDay(obj: unknown): obj is FertilityDay {
  if (typeof obj !== "object" || obj === null) return false;
  const f = obj as Record<string, unknown>;
  return typeof f.date === "string";
}

/**
 * Validates that an object has valid UserSettings structure
 */
function isValidUserSettings(obj: unknown): obj is UserSettings {
  if (typeof obj !== "object" || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.averageCycleLength === "number" &&
    typeof s.averagePeriodLength === "number"
  );
}

/**
 * Validates the complete CycleData structure
 */
export function validateCycleData(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Data is niet geldig" };
  }

  const d = data as Record<string, unknown>;

  // Check periods array
  if (!Array.isArray(d.periods)) {
    return { valid: false, error: "Periods is verplicht en moet een array zijn" };
  }
  for (const period of d.periods) {
    if (!isValidPeriod(period)) {
      return { valid: false, error: "Ongeldige periode data gevonden" };
    }
  }

  // Check symptoms array
  if (!Array.isArray(d.symptoms)) {
    return { valid: false, error: "Symptoms is verplicht en moet een array zijn" };
  }
  for (const symptom of d.symptoms) {
    if (!isValidDaySymptom(symptom)) {
      return { valid: false, error: "Ongeldige symptoom data gevonden" };
    }
  }

  // Check fertility array (optional, can be empty)
  if (d.fertility !== undefined && !Array.isArray(d.fertility)) {
    return { valid: false, error: "Fertility moet een array zijn" };
  }
  if (Array.isArray(d.fertility)) {
    for (const fertility of d.fertility) {
      if (!isValidFertilityDay(fertility)) {
        return { valid: false, error: "Ongeldige vruchtbaarheids data gevonden" };
      }
    }
  }

  // Check settings (optional, will use defaults if missing)
  if (d.settings !== undefined && !isValidUserSettings(d.settings)) {
    return { valid: false, error: "Ongeldige instellingen gevonden" };
  }

  return { valid: true };
}

/**
 * Migrates imported data to ensure it has all required fields
 */
export function migrateImportedData(data: Record<string, unknown>): CycleData {
  const periods = (data.periods as Period[]) || [];
  const symptoms = (data.symptoms as DaySymptom[]) || [];
  const fertility = (data.fertility as FertilityDay[]) || [];

  // Migrate settings - ensure notifications and language fields exist
  let settings: UserSettings;
  if (data.settings && isValidUserSettings(data.settings)) {
    const importedSettings = data.settings as UserSettings & { notifications?: unknown; language?: unknown };
    const notif = importedSettings.notifications as unknown as Record<string, unknown> | undefined;
    const lang = importedSettings.language;
    settings = {
      averageCycleLength: importedSettings.averageCycleLength,
      averagePeriodLength: importedSettings.averagePeriodLength,
      notifications: notif && typeof notif === "object"
        ? {
            remindersEnabled: notif.remindersEnabled === true,
            daysBeforePeriod: typeof notif.daysBeforePeriod === "number"
              ? notif.daysBeforePeriod
              : DEFAULT_NOTIFICATION_SETTINGS.daysBeforePeriod,
          }
        : DEFAULT_NOTIFICATION_SETTINGS,
      language: lang === "en" ? "en" : "nl",
    };
  } else {
    settings = DEFAULT_SETTINGS;
  }

  return {
    periods,
    symptoms,
    fertility,
    settings,
  };
}

/**
 * Exports cycle data as a JSON file download
 */
export function exportDataAsJSON(data: CycleData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split("T")[0];
  const filename = `calinender-backup-${date}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports and validates cycle data from a JSON file
 */
export function importDataFromJSON(file: File): Promise<CycleData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== "string") {
          reject(new Error("Kan bestand niet lezen"));
          return;
        }

        const data = JSON.parse(content);
        const validation = validateCycleData(data);

        if (!validation.valid) {
          reject(new Error(validation.error || "Ongeldige data"));
          return;
        }

        const migratedData = migrateImportedData(data);
        resolve(migratedData);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error("Ongeldig JSON bestand"));
        } else if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error("Onbekende fout bij importeren"));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("Fout bij lezen van bestand"));
    };

    reader.readAsText(file);
  });
}
