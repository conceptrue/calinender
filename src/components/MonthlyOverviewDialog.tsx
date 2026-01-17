"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DaySymptom } from "@/types";

type OverviewType = "mood" | "pain" | "energy" | "notes" | null;

interface MonthlyOverviewDialogProps {
  symptoms: DaySymptom[];
  type: OverviewType;
  onClose: () => void;
}

const moodConfig: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: "😊", label: "Blij", color: "bg-green-100 text-green-800" },
  neutral: { emoji: "😐", label: "Neutraal", color: "bg-gray-100 text-gray-800" },
  irritable: { emoji: "😤", label: "Prikkelbaar", color: "bg-orange-100 text-orange-800" },
  sad: { emoji: "😢", label: "Verdrietig", color: "bg-blue-100 text-blue-800" },
  emotional: { emoji: "🥺", label: "Emotioneel", color: "bg-purple-100 text-purple-800" },
};

const painConfig: Record<string, { level: number; label: string; color: string }> = {
  none: { level: 0, label: "Geen", color: "bg-green-100 text-green-800" },
  light: { level: 1, label: "Licht", color: "bg-yellow-100 text-yellow-800" },
  moderate: { level: 2, label: "Matig", color: "bg-orange-100 text-orange-800" },
  intense: { level: 3, label: "Hevig", color: "bg-red-100 text-red-800" },
  severe: { level: 4, label: "Ernstig", color: "bg-red-200 text-red-900" },
};

const energyConfig: { [key: number]: { label: string; color: string } } = {
  1: { label: "Zeer laag", color: "bg-red-100 text-red-800" },
  2: { label: "Laag", color: "bg-orange-100 text-orange-800" },
  3: { label: "Normaal", color: "bg-gray-100 text-gray-800" },
  4: { label: "Hoog", color: "bg-green-100 text-green-800" },
  5: { label: "Zeer hoog", color: "bg-green-200 text-green-900" },
};

const energyLevels = [1, 2, 3, 4, 5] as const;

export function MonthlyOverviewDialog({ symptoms, type, onClose }: MonthlyOverviewDialogProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, DaySymptom>();
    symptoms.forEach((s) => map.set(s.date, s));
    return map;
  }, [symptoms]);

  const getTitle = () => {
    switch (type) {
      case "mood": return "Stemming Overzicht";
      case "pain": return "Pijn Overzicht";
      case "energy": return "Energie Overzicht";
      case "notes": return "Notities Overzicht";
      default: return "";
    }
  };

  // Get notes for the current month
  const notesForMonth = useMemo(() => {
    return daysInMonth
      .map((date) => {
        const dateString = format(date, "yyyy-MM-dd");
        const symptom = symptomsByDate.get(dateString);
        if (symptom?.notes) {
          return { date, dateString, notes: symptom.notes };
        }
        return null;
      })
      .filter((item): item is { date: Date; dateString: string; notes: string } => item !== null);
  }, [daysInMonth, symptomsByDate]);

  const renderCell = (dateString: string) => {
    const symptom = symptomsByDate.get(dateString);

    if (type === "mood") {
      if (!symptom?.mood) return <span className="text-muted-foreground text-xs">—</span>;
      const config = moodConfig[symptom.mood];
      return (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.color}`}>
          {config.emoji}
        </span>
      );
    }

    if (type === "pain") {
      if (!symptom?.pain) return <span className="text-muted-foreground text-xs">—</span>;
      const config = painConfig[symptom.pain];
      return (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${config.color}`}>
          {config.level}
        </span>
      );
    }

    if (type === "energy") {
      if (!symptom?.energy) return <span className="text-muted-foreground text-xs">—</span>;
      const config = energyConfig[symptom.energy as keyof typeof energyConfig];
      if (!config) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${config.color}`}>
          {symptom.energy}
        </span>
      );
    }

    return null;
  };

  const renderLegend = () => {
    if (type === "mood") {
      return (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {Object.entries(moodConfig).map(([key, config]) => (
            <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
              {config.emoji} {config.label}
            </span>
          ))}
        </div>
      );
    }

    if (type === "pain") {
      return (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {Object.entries(painConfig).map(([key, config]) => (
            <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
              {config.level} {config.label}
            </span>
          ))}
        </div>
      );
    }

    if (type === "energy") {
      return (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {energyLevels.map((level) => {
            const config = energyConfig[level];
            return (
              <span key={level} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
                {level} {config.label}
              </span>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={type !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: nl })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Notes list view */}
        {type === "notes" ? (
          <div className="space-y-3">
            {notesForMonth.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Geen notities deze maand.
              </p>
            ) : (
              notesForMonth.map((item) => (
                <div
                  key={item.dateString}
                  className="p-3 rounded-lg bg-muted/50 border"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {format(item.date, "EEEE d MMMM", { locale: nl })}
                  </p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days */}
              {daysInMonth.map((date) => {
                const dateString = format(date, "yyyy-MM-dd");
                return (
                  <div key={dateString} className="flex flex-col items-center py-1">
                    <span className="text-xs text-muted-foreground mb-1">
                      {date.getDate()}
                    </span>
                    {renderCell(dateString)}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {renderLegend()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
