"use client";

import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import type { DaySymptom } from "@/types";
import type { Translations } from "@/i18n/types";

type ViewType = "plan" | "fases" | "recent" | "calendar";

interface ExerciseOverviewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
  currentCycleDay: number | null;
  cycleLength: number;
}

function getExerciseConfig(t: Translations) {
  return {
    walking: { emoji: "🚶", label: t.exercise.walking, color: "bg-blue-100 text-blue-800" },
    running: { emoji: "🏃", label: t.exercise.running, color: "bg-blue-200 text-blue-900" },
    cycling: { emoji: "🚴", label: t.exercise.cycling, color: "bg-green-100 text-green-800" },
    swimming: { emoji: "🏊", label: t.exercise.swimming, color: "bg-cyan-100 text-cyan-800" },
    gym: { emoji: "🏋️", label: t.exercise.gym, color: "bg-orange-100 text-orange-800" },
    yoga: { emoji: "🧘", label: t.exercise.yoga, color: "bg-purple-100 text-purple-800" },
    sports: { emoji: "⚽", label: t.exercise.sports, color: "bg-yellow-100 text-yellow-800" },
    other: { emoji: "💪", label: t.exercise.other, color: "bg-gray-100 text-gray-800" },
  };
}

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

function getCyclePhase(cycleDay: number, cycleLength: number, t: Translations): CyclePhase {
  const ovulationDay = Math.round(cycleLength / 2);

  // Menstruation (day 1-5)
  if (cycleDay <= 5) {
    return {
      name: t.phases.menstruation,
      emoji: "🌙",
      energyLevel: t.energy.low,
      color: "text-red-700",
      bgColor: "bg-red-50",
      intensity: t.exercise.lightIntensity,
      description: t.exercise.menstruationDesc,
      recommended: [t.exercise.walkingRec, t.exercise.yogaRec, t.exercise.swimmingRec, t.exercise.stretchingRec],
      avoid: [t.exercise.intensiveGym, t.exercise.runningRec, t.exercise.competitionSports],
    };
  }

  // Follicular phase (day 6 to ovulation)
  if (cycleDay <= ovulationDay - 2) {
    return {
      name: t.phases.follicular,
      emoji: "🌱",
      energyLevel: t.energy.rising,
      color: "text-green-700",
      bgColor: "bg-green-50",
      intensity: t.exercise.moderateToHigh,
      description: t.exercise.follicularDesc,
      recommended: [t.exercise.runningRec, t.exercise.cyclingRec, t.exercise.strengthRec, t.exercise.teamSportsRec],
      avoid: [],
    };
  }

  // Ovulation (around day 14)
  if (cycleDay <= ovulationDay + 2) {
    return {
      name: t.phases.ovulation,
      emoji: "☀️",
      energyLevel: t.energy.peak,
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      intensity: t.exercise.highIntensity,
      description: t.exercise.ovulationDesc,
      recommended: [t.exercise.heavyStrength, t.exercise.intervalTraining, t.exercise.competitions, t.exercise.longCycling],
      avoid: [],
    };
  }

  // Early luteal phase (after ovulation, first half)
  if (cycleDay <= ovulationDay + 7) {
    return {
      name: t.phases.earlyLuteal,
      emoji: "🍂",
      energyLevel: t.energy.stable,
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      intensity: t.exercise.moderateIntensity,
      description: t.exercise.earlyLutealDesc,
      recommended: [t.exercise.cyclingRec, t.exercise.swimmingRec, t.exercise.yogaRec, t.exercise.walkingRec],
      avoid: [t.exercise.extremeHeavy],
    };
  }

  // Late luteal phase (PMS period)
  return {
    name: t.phases.lateLuteal,
    emoji: "🌧️",
    energyLevel: t.energy.declining,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    intensity: t.exercise.lightToModerate,
    description: t.exercise.lateLutealDesc,
    recommended: [t.exercise.walkingRec, t.exercise.calmYoga, t.exercise.swimmingRec, t.exercise.meditation],
    avoid: [t.exercise.intensiveCardio, t.exercise.heavyWeights],
  };
}

export function ExerciseOverview({ symptoms, onDayClick, currentCycleDay, cycleLength }: ExerciseOverviewProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<ViewType>("plan");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateLocale = language === "en" ? enUS : nl;
  const exerciseConfig = useMemo(() => getExerciseConfig(t), [t]);

  const weekdays = useMemo(() => [
    t.weekdaysShort.mon,
    t.weekdaysShort.tue,
    t.weekdaysShort.wed,
    t.weekdaysShort.thu,
    t.weekdaysShort.fri,
    t.weekdaysShort.sat,
    t.weekdaysShort.sun,
  ], [t]);

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
    return getCyclePhase(currentCycleDay, cycleLength, t);
  }, [currentCycleDay, cycleLength, t]);

  const allPhases = useMemo(() => {
    const ovulationDay = Math.round(cycleLength / 2);
    return [
      { day: 3, phase: getCyclePhase(3, cycleLength, t) },
      { day: ovulationDay - 4, phase: getCyclePhase(ovulationDay - 4, cycleLength, t) },
      { day: ovulationDay, phase: getCyclePhase(ovulationDay, cycleLength, t) },
      { day: ovulationDay + 4, phase: getCyclePhase(ovulationDay + 4, cycleLength, t) },
      { day: cycleLength - 3, phase: getCyclePhase(cycleLength - 3, cycleLength, t) },
    ];
  }, [cycleLength, t]);

  const renderPlanView = () => {
    if (!currentCycleDay || !currentPhase) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>{t.exercise.registerPeriodFirst}</p>
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
              <p className="text-sm text-muted-foreground">{t.common.day} {currentCycleDay} {t.cycle.ofYourCycle}</p>
            </div>
          </div>
          <p className="text-sm mb-3">{currentPhase.description}</p>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t.dayDetail.energyLevel}:</span>
              <span className={`ml-1 font-medium ${currentPhase.color}`}>{currentPhase.energyLevel}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t.exercise.intensity}:</span>
              <span className={`ml-1 font-medium ${currentPhase.color}`}>{currentPhase.intensity}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-green-700 mb-2">✓ {t.exercise.recommended}</h4>
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
            <h4 className="font-medium text-red-700 mb-2">✗ {t.exercise.avoid}</h4>
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
          <h4 className="font-medium mb-3">{t.nutrition.next7Days}</h4>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const futureDay = currentCycleDay + offset;
              const adjustedDay = futureDay > cycleLength ? futureDay - cycleLength : futureDay;
              const phase = getCyclePhase(adjustedDay, cycleLength, t);
              const date = new Date();
              date.setDate(date.getDate() + offset);

              return (
                <div key={offset} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-muted-foreground">
                      {offset === 0 ? t.common.today : format(date, "EEE d", { locale: dateLocale })}
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

  const renderFasesView = () => {
    return (
      <div className="space-y-4">
        {allPhases.map(({ phase }) => {
          const isCurrentPhase = currentPhase?.name === phase.name;

          return (
            <div
              key={phase.name}
              className={cn(
                "rounded-lg border overflow-hidden",
                isCurrentPhase && "ring-2 ring-primary"
              )}
            >
              {/* Phase Header */}
              <div className={`p-4 ${phase.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{phase.emoji}</span>
                    <div>
                      <h4 className={`font-semibold ${phase.color}`}>
                        {phase.name}
                        {isCurrentPhase && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            {t.phases.now}
                          </span>
                        )}
                      </h4>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{t.dayDetail.energyLevel}: {phase.energyLevel}</span>
                        <span>{t.exercise.intensity}: {phase.intensity}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">{phase.description}</p>
              </div>

              {/* Phase Content */}
              <div className="p-4 space-y-3">
                {/* Recommended */}
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">✓ {t.exercise.recommended}</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.recommended.map((item) => (
                      <span key={item} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Avoid */}
                {phase.avoid.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-2">✗ {t.exercise.avoid}</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.avoid.map((item) => (
                        <span key={item} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecentView = () => {
    if (recentExercise.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>{t.exercise.noDataYet}</p>
          <p className="text-sm mt-1">{t.exercise.clickToStart}</p>
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
                {format(parseISO(symptom.date), "EEE d MMM", { locale: dateLocale })}
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
          {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
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
        {weekdays.map((day) => (
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
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveTab("plan")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "plan"
              ? "bg-primary text-primary-foreground"
              : "bg-blue-50 text-blue-700 hover:opacity-80"
          )}
        >
          <span>📋</span>
          <span>{t.exercise.plan}</span>
        </button>
        <button
          onClick={() => setActiveTab("fases")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "fases"
              ? "bg-primary text-primary-foreground"
              : "bg-purple-50 text-purple-700 hover:opacity-80"
          )}
        >
          <span>🔄</span>
          <span>{t.exercise.phases}</span>
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "recent"
              ? "bg-primary text-primary-foreground"
              : "bg-green-50 text-green-700 hover:opacity-80"
          )}
        >
          <span>🏃</span>
          <span>{t.exercise.activity}</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-orange-50 text-orange-700 hover:opacity-80"
          )}
        >
          <span>📅</span>
          <span>{t.exercise.calendar}</span>
        </button>
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4">
        {activeTab === "plan" && renderPlanView()}
        {activeTab === "fases" && renderFasesView()}
        {activeTab === "recent" && renderRecentView()}
        {activeTab === "calendar" && renderCalendarView()}
      </div>
    </div>
  );
}
