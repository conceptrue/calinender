"use client";

import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DaySymptom } from "@/types";

type ViewType = "recent" | "mood" | "pain" | "energy" | "notes";

interface SymptomsOverviewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
}

const tabs: { value: ViewType; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "mood", label: "Stemming" },
  { value: "pain", label: "Pijn" },
  { value: "energy", label: "Energie" },
  { value: "notes", label: "Notities" },
];

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

function PainBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-sm ${
            i <= level
              ? level >= 3 ? "bg-red-500" : level >= 2 ? "bg-orange-400" : "bg-yellow-400"
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
              ? level >= 4 ? "bg-green-500" : level >= 3 ? "bg-blue-400" : "bg-blue-300"
              : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function SymptomsOverview({ symptoms, onDayClick }: SymptomsOverviewProps) {
  const [activeTab, setActiveTab] = useState<ViewType>("recent");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, DaySymptom>();
    symptoms.forEach((s) => map.set(s.date, s));
    return map;
  }, [symptoms]);

  const recentSymptoms = useMemo(() => {
    return [...symptoms]
      .filter((s) => s.mood || s.pain || s.energy || s.notes)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [symptoms]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

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

  const renderMonthNav = () => (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium capitalize">
        {format(currentMonth, "MMMM yyyy", { locale: nl })}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderCalendarGrid = (renderCell: (dateString: string) => React.ReactNode) => (
    <div className="grid grid-cols-7 gap-1">
      {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
          {day}
        </div>
      ))}
      {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
      {daysInMonth.map((date) => {
        const dateString = format(date, "yyyy-MM-dd");
        return (
          <button
            key={dateString}
            onClick={() => onDayClick(dateString)}
            className="flex flex-col items-center py-1 hover:bg-muted/50 rounded transition-colors"
          >
            <span className="text-xs text-muted-foreground mb-1">
              {date.getDate()}
            </span>
            {renderCell(dateString)}
          </button>
        );
      })}
    </div>
  );

  const renderRecentView = () => {
    if (recentSymptoms.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nog geen symptomen geregistreerd.</p>
          <p className="text-sm mt-1">Klik op een dag in de kalender om te beginnen.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentSymptoms.map((symptom) => {
          const mood = symptom.mood ? moodConfig[symptom.mood] : null;
          const pain = symptom.pain ? painConfig[symptom.pain] : null;

          return (
            <button
              key={symptom.date}
              onClick={() => onDayClick(symptom.date)}
              className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {format(parseISO(symptom.date), "EEE d MMM", { locale: nl })}
                </span>
                <div className="flex items-center gap-2">
                  {mood && <span>{mood.emoji}</span>}
                  {pain && <PainBar level={pain.level} />}
                  {symptom.energy && <EnergyBar level={symptom.energy} />}
                </div>
              </div>
              {symptom.notes && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{symptom.notes}</p>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMoodView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const symptom = symptomsByDate.get(dateString);
        if (!symptom?.mood) return <span className="text-muted-foreground text-xs">—</span>;
        const config = moodConfig[symptom.mood];
        return (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${config.color}`}>
            {config.emoji}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(moodConfig).map(([key, config]) => (
          <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
            {config.emoji} {config.label}
          </span>
        ))}
      </div>
    </>
  );

  const renderPainView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const symptom = symptomsByDate.get(dateString);
        if (!symptom?.pain) return <span className="text-muted-foreground text-xs">—</span>;
        const config = painConfig[symptom.pain];
        return (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${config.color}`}>
            {config.level}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(painConfig).map(([key, config]) => (
          <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
            {config.level} {config.label}
          </span>
        ))}
      </div>
    </>
  );

  const renderEnergyView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const symptom = symptomsByDate.get(dateString);
        if (!symptom?.energy) return <span className="text-muted-foreground text-xs">—</span>;
        const config = energyConfig[symptom.energy as keyof typeof energyConfig];
        if (!config) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${config.color}`}>
            {symptom.energy}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {[1, 2, 3, 4, 5].map((level) => {
          const config = energyConfig[level];
          return (
            <span key={level} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
              {level} {config.label}
            </span>
          );
        })}
      </div>
    </>
  );

  const renderNotesView = () => (
    <>
      {renderMonthNav()}
      {notesForMonth.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Geen notities deze maand.
        </p>
      ) : (
        <div className="space-y-2">
          {notesForMonth.map((item) => (
            <button
              key={item.dateString}
              onClick={() => onDayClick(item.dateString)}
              className="w-full p-3 rounded-lg bg-muted/50 border text-left hover:bg-muted transition-colors"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {format(item.date, "EEEE d MMMM", { locale: nl })}
              </p>
              <p className="text-sm">{item.notes}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 mb-4 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "py-2 text-sm font-medium rounded-md transition-colors text-center",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4">
        {activeTab === "recent" && renderRecentView()}
        {activeTab === "mood" && renderMoodView()}
        {activeTab === "pain" && renderPainView()}
        {activeTab === "energy" && renderEnergyView()}
        {activeTab === "notes" && renderNotesView()}
      </div>
    </div>
  );
}
