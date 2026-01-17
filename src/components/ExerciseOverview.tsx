"use client";

import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DaySymptom } from "@/types";

type ViewType = "plan" | "recent" | "calendar";

interface ExerciseOverviewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
  currentCycleDay: number | null;
  cycleLength: number;
}

const exerciseConfig: Record<string, { emoji: string; label: string; color: string }> = {
  walking: { emoji: "🚶", label: "Wandelen", color: "bg-blue-100 text-blue-800" },
  running: { emoji: "🏃", label: "Hardlopen", color: "bg-blue-200 text-blue-900" },
  cycling: { emoji: "🚴", label: "Fietsen", color: "bg-green-100 text-green-800" },
  swimming: { emoji: "🏊", label: "Zwemmen", color: "bg-cyan-100 text-cyan-800" },
  gym: { emoji: "🏋️", label: "Fitness", color: "bg-orange-100 text-orange-800" },
  yoga: { emoji: "🧘", label: "Yoga", color: "bg-purple-100 text-purple-800" },
  sports: { emoji: "⚽", label: "Sport", color: "bg-yellow-100 text-yellow-800" },
  other: { emoji: "💪", label: "Anders", color: "bg-gray-100 text-gray-800" },
};

interface CyclePhase {
  name: string;
  emoji: string;
  energyLevel: string;
  color: string;
  bgColor: string;
  intensity: string;
  description: string;
  recommended: string[];
  avoid: string[];
}

function getCyclePhase(cycleDay: number, cycleLength: number): CyclePhase {
  const ovulationDay = Math.round(cycleLength / 2);

  // Menstruatie (dag 1-5)
  if (cycleDay <= 5) {
    return {
      name: "Menstruatie",
      emoji: "🌙",
      energyLevel: "Laag",
      color: "text-red-700",
      bgColor: "bg-red-50",
      intensity: "Licht",
      description: "Je lichaam heeft rust nodig. Focus op zachte beweging en herstel.",
      recommended: ["🚶 Wandelen", "🧘 Yoga", "🏊 Zwemmen", "🧘 Stretchen"],
      avoid: ["🏋️ Intensieve fitness", "🏃 Hardlopen", "⚽ Competitiesport"],
    };
  }

  // Folliculaire fase (dag 6 tot ovulatie)
  if (cycleDay <= ovulationDay - 2) {
    return {
      name: "Folliculaire fase",
      emoji: "🌱",
      energyLevel: "Stijgend",
      color: "text-green-700",
      bgColor: "bg-green-50",
      intensity: "Matig tot hoog",
      description: "Je energie neemt toe! Ideaal moment om nieuwe uitdagingen aan te gaan.",
      recommended: ["🏃 Hardlopen", "🚴 Fietsen", "🏋️ Krachttraining", "⚽ Teamsport"],
      avoid: [],
    };
  }

  // Ovulatie (rond dag 14)
  if (cycleDay <= ovulationDay + 2) {
    return {
      name: "Ovulatie",
      emoji: "☀️",
      energyLevel: "Piek",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      intensity: "Hoog",
      description: "Je bent op je sterkst! Perfecte tijd voor intensieve training en PR's.",
      recommended: ["🏋️ Zware krachttraining", "🏃 Intervaltraining", "⚽ Wedstrijden", "🚴 Lange fietstochten"],
      avoid: [],
    };
  }

  // Vroege luteale fase (na ovulatie, eerste helft)
  if (cycleDay <= ovulationDay + 7) {
    return {
      name: "Vroege luteale fase",
      emoji: "🍂",
      energyLevel: "Stabiel",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      intensity: "Matig",
      description: "Energie is nog goed maar begint af te nemen. Geniet van je training.",
      recommended: ["🚴 Fietsen", "🏊 Zwemmen", "🧘 Yoga", "🚶 Wandelen"],
      avoid: ["🏋️ Extreem zware training"],
    };
  }

  // Late luteale fase (PMS periode)
  return {
    name: "Late luteale fase",
    emoji: "🌧️",
    energyLevel: "Dalend",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    intensity: "Licht tot matig",
    description: "Luister naar je lichaam. Kies voor rustgevende beweging.",
    recommended: ["🚶 Wandelen", "🧘 Rustige yoga", "🏊 Zwemmen", "🧘 Meditatie"],
    avoid: ["🏃 Intensief cardio", "🏋️ Zware gewichten"],
  };
}

export function ExerciseOverview({ symptoms, onDayClick, currentCycleDay, cycleLength }: ExerciseOverviewProps) {
  const [activeTab, setActiveTab] = useState<ViewType>("plan");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, DaySymptom>();
    symptoms.forEach((s) => map.set(s.date, s));
    return map;
  }, [symptoms]);

  const recentExercise = useMemo(() => {
    return [...symptoms]
      .filter((s) => s.exercise)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [symptoms]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const currentPhase = useMemo(() => {
    if (!currentCycleDay) return null;
    return getCyclePhase(currentCycleDay, cycleLength);
  }, [currentCycleDay, cycleLength]);

  const renderPlanView = () => {
    if (!currentCycleDay || !currentPhase) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Registreer eerst een periode om je bewegingsplan te zien.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Current Phase Card */}
        <div className={`rounded-lg p-4 ${currentPhase.bgColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentPhase.emoji}</span>
            <div>
              <h4 className={`font-semibold ${currentPhase.color}`}>{currentPhase.name}</h4>
              <p className="text-sm text-muted-foreground">Dag {currentCycleDay} van je cyclus</p>
            </div>
          </div>
          <p className="text-sm mb-3">{currentPhase.description}</p>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Energie:</span>
              <span className={`ml-1 font-medium ${currentPhase.color}`}>{currentPhase.energyLevel}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Intensiteit:</span>
              <span className={`ml-1 font-medium ${currentPhase.color}`}>{currentPhase.intensity}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-green-700 mb-2">✓ Aanbevolen</h4>
          <div className="flex flex-wrap gap-2">
            {currentPhase.recommended.map((item) => (
              <span key={item} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        {currentPhase.avoid.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-red-700 mb-2">✗ Vermijd</h4>
            <div className="flex flex-wrap gap-2">
              {currentPhase.avoid.map((item) => (
                <span key={item} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Komende 7 dagen</h4>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const futureDay = currentCycleDay + offset;
              const adjustedDay = futureDay > cycleLength ? futureDay - cycleLength : futureDay;
              const phase = getCyclePhase(adjustedDay, cycleLength);
              const date = new Date();
              date.setDate(date.getDate() + offset);

              return (
                <div key={offset} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-muted-foreground">
                      {offset === 0 ? "Vandaag" : format(date, "EEE d", { locale: nl })}
                    </span>
                    <span>{phase.emoji}</span>
                    <span className={phase.color}>{phase.name}</span>
                  </div>
                  <span className="text-muted-foreground">{phase.intensity}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRecentView = () => {
    if (recentExercise.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Nog geen beweging geregistreerd.</p>
          <p className="text-sm mt-1">Klik op een dag om te beginnen.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentExercise.map((symptom) => {
          const exercise = symptom.exercise ? exerciseConfig[symptom.exercise] : null;
          if (!exercise) return null;

          return (
            <button
              key={symptom.date}
              onClick={() => onDayClick(symptom.date)}
              className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
            >
              <span className="font-medium text-sm">
                {format(parseISO(symptom.date), "EEE d MMM", { locale: nl })}
              </span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm ${exercise.color}`}>
                  {exercise.emoji} {exercise.label}
                </span>
                {symptom.exerciseMinutes && (
                  <span className="text-xs text-muted-foreground">
                    {symptom.exerciseMinutes} min
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => (
    <>
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
          const symptom = symptomsByDate.get(dateString);
          const exercise = symptom?.exercise ? exerciseConfig[symptom.exercise] : null;

          return (
            <button
              key={dateString}
              onClick={() => onDayClick(dateString)}
              className="flex flex-col items-center py-1 hover:bg-muted/50 rounded transition-colors"
            >
              <span className="text-xs text-muted-foreground mb-1">
                {date.getDate()}
              </span>
              {exercise ? (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${exercise.color}`} title={symptom?.exerciseMinutes ? `${symptom.exerciseMinutes} min` : undefined}>
                  {exercise.emoji}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(exerciseConfig).map(([key, config]) => (
          <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
            {config.emoji} {config.label}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 mb-4 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab("plan")}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-colors text-center",
            activeTab === "plan"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Plan
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-colors text-center",
            activeTab === "recent"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-colors text-center",
            activeTab === "calendar"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Kalender
        </button>
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4">
        {activeTab === "plan" && renderPlanView()}
        {activeTab === "recent" && renderRecentView()}
        {activeTab === "calendar" && renderCalendarView()}
      </div>
    </div>
  );
}
