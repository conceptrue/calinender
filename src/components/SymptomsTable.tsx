"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import type { DaySymptom } from "@/types";

export type OverviewType = "mood" | "pain" | "energy" | "notes";

interface SymptomsTableProps {
  symptoms: DaySymptom[];
  onRowClick: (dateString: string) => void;
  onHeaderClick: (type: OverviewType) => void;
}

const moodLabels: Record<string, { emoji: string; label: string }> = {
  happy: { emoji: "😊", label: "Blij" },
  neutral: { emoji: "😐", label: "Neutraal" },
  irritable: { emoji: "😤", label: "Prikkelbaar" },
  sad: { emoji: "😢", label: "Verdrietig" },
  emotional: { emoji: "🥺", label: "Emotioneel" },
};

const painLabels: Record<string, { level: number; label: string }> = {
  none: { level: 0, label: "Geen" },
  light: { level: 1, label: "Licht" },
  moderate: { level: 2, label: "Matig" },
  intense: { level: 3, label: "Hevig" },
  severe: { level: 4, label: "Ernstig" },
};

function PainBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-sm ${
            i <= level
              ? level >= 3
                ? "bg-red-500"
                : level >= 2
                ? "bg-orange-400"
                : "bg-yellow-400"
              : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function EnergyBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-3 w-2 rounded-sm ${
            i <= level
              ? level >= 4
                ? "bg-green-500"
                : level >= 3
                ? "bg-blue-400"
                : "bg-blue-300"
              : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function SymptomsTable({ symptoms, onRowClick, onHeaderClick }: SymptomsTableProps) {
  // Sort symptoms by date (most recent first), show only 5
  const sortedSymptoms = useMemo(() => {
    return [...symptoms]
      .filter((s) => s.mood || s.pain || s.energy || s.notes)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [symptoms]);

  if (sortedSymptoms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nog geen symptomen geregistreerd.</p>
        <p className="text-sm mt-1">Klik op een dag om symptomen toe te voegen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">
              Datum
            </th>
            <th
              className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              onClick={() => onHeaderClick("mood")}
            >
              Stemming ↗
            </th>
            <th
              className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              onClick={() => onHeaderClick("pain")}
            >
              Pijn ↗
            </th>
            <th
              className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              onClick={() => onHeaderClick("energy")}
            >
              Energie ↗
            </th>
            <th
              className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              onClick={() => onHeaderClick("notes")}
            >
              Notities ↗
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSymptoms.map((symptom) => {
            const mood = symptom.mood ? moodLabels[symptom.mood] : null;
            const pain = symptom.pain ? painLabels[symptom.pain] : null;

            return (
              <tr
                key={symptom.date}
                onClick={() => onRowClick(symptom.date)}
                className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <td className="py-2 px-2">
                  <span className="font-medium">
                    {format(parseISO(symptom.date), "EEE d MMM", { locale: nl })}
                  </span>
                </td>
                <td className="py-2 px-2">
                  {mood ? (
                    <span className="flex items-center gap-1">
                      <span>{mood.emoji}</span>
                      <span className="hidden sm:inline text-muted-foreground">{mood.label}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 px-2">
                  {pain ? (
                    <div className="flex items-center gap-2">
                      <PainBar level={pain.level} />
                      <span className="hidden sm:inline text-xs text-muted-foreground">
                        {pain.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 px-2">
                  {symptom.energy ? (
                    <EnergyBar level={symptom.energy} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 px-2 max-w-[120px]">
                  {symptom.notes ? (
                    <span className="truncate block text-muted-foreground">
                      {symptom.notes}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
