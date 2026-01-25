"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { FertilityOverview } from "@/components/FertilityOverview";
import { FertilityDayDetail } from "@/components/FertilityDayDetail";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Baby,
  Calendar,
  Apple,
  Dumbbell,
  Heart,
  Moon,
  Droplets,
  Pill,
  ThermometerSun,
  Clock,
  Fish,
  Egg,
  Leaf,
  AlertCircle,
} from "lucide-react";
import type { FertilityDay, Period, CervicalMucus, OvulationTest } from "@/types";
import type { Translations } from "@/i18n/types";

interface PregnancyViewProps {
  currentCycleDay: number | null;
  cycleLength: number;
  fertility: FertilityDay[];
  periods: Period[];
  getFertilityForDate: (dateString: string) => FertilityDay | null;
  updateFertility: (
    dateString: string,
    updates: {
      temperature?: number | null;
      cervicalMucus?: CervicalMucus;
      ovulationTest?: OvulationTest;
      intercourse?: boolean;
      supplements?: boolean;
      notes?: string;
    }
  ) => void;
}

interface FertilityTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface NutrientInfo {
  name: string;
  benefit: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ExerciseInfo {
  name: string;
  benefit: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AvoidItem {
  name: string;
  description: string;
}

function getFertilityTips(t: Translations): FertilityTip[] {
  return [
    {
      icon: Calendar,
      title: t.pregnancy.knowFertileDays,
      description: t.pregnancy.knowFertileDaysDesc,
    },
    {
      icon: ThermometerSun,
      title: t.pregnancy.measureTemp,
      description: t.pregnancy.measureTempDesc,
    },
    {
      icon: Droplets,
      title: t.pregnancy.watchMucus,
      description: t.pregnancy.watchMucusDesc,
    },
    {
      icon: Clock,
      title: t.pregnancy.timingMatters,
      description: t.pregnancy.timingMattersDesc,
    },
    {
      icon: Moon,
      title: t.pregnancy.prioritizeSleep,
      description: t.pregnancy.prioritizeSleepDesc,
    },
    {
      icon: Heart,
      title: t.pregnancy.avoidStress,
      description: t.pregnancy.avoidStressDesc,
    },
  ];
}

function getNutrients(t: Translations): NutrientInfo[] {
  return [
    {
      name: t.pregnancy.folicAcid,
      benefit: t.pregnancy.folicAcidDesc,
      icon: Leaf,
    },
    {
      name: t.pregnancy.iron,
      benefit: t.pregnancy.ironDesc,
      icon: Droplets,
    },
    {
      name: t.pregnancy.omega3,
      benefit: t.pregnancy.omega3Desc,
      icon: Fish,
    },
    {
      name: t.pregnancy.vitaminD,
      benefit: t.pregnancy.vitaminDDesc,
      icon: ThermometerSun,
    },
    {
      name: t.pregnancy.zinc,
      benefit: t.pregnancy.zincDesc,
      icon: Egg,
    },
    {
      name: t.pregnancy.vitaminB12,
      benefit: t.pregnancy.vitaminB12Desc,
      icon: Pill,
    },
  ];
}

function getExercises(t: Translations): ExerciseInfo[] {
  return [
    {
      name: t.exercise.walking,
      benefit: t.pregnancy.walkingDesc,
      icon: Dumbbell,
    },
    {
      name: t.exercise.yoga,
      benefit: t.pregnancy.yogaDesc,
      icon: Heart,
    },
    {
      name: t.exercise.swimming,
      benefit: t.pregnancy.swimmingDesc,
      icon: Droplets,
    },
    {
      name: t.pregnancy.lightWeights,
      benefit: t.pregnancy.lightWeightsDesc,
      icon: Dumbbell,
    },
    {
      name: t.pregnancy.pilates,
      benefit: t.pregnancy.pilatesDesc,
      icon: Heart,
    },
  ];
}

function getAvoidList(t: Translations): AvoidItem[] {
  return [
    { name: t.pregnancy.alcohol, description: t.pregnancy.alcoholDesc },
    { name: t.pregnancy.smoking, description: t.pregnancy.smokingDesc },
    { name: t.pregnancy.caffeine, description: t.pregnancy.caffeineDesc },
    { name: t.pregnancy.heavyExercise, description: t.pregnancy.heavyExerciseDesc },
    { name: t.pregnancy.rawFish, description: t.pregnancy.rawFishDesc },
    { name: t.pregnancy.stress, description: t.pregnancy.stressDesc },
    { name: t.pregnancy.chemicals, description: t.pregnancy.chemicalsDesc },
  ];
}

type TabType = "calendar" | "tips" | "nutrition" | "exercise" | "avoid" | "supplements";

export function PregnancyView({
  currentCycleDay,
  cycleLength,
  fertility,
  periods,
  getFertilityForDate,
  updateFertility,
}: PregnancyViewProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  const fertilityTips = useMemo(() => getFertilityTips(t), [t]);
  const nutrients = useMemo(() => getNutrients(t), [t]);
  const exercises = useMemo(() => getExercises(t), [t]);
  const avoidList = useMemo(() => getAvoidList(t), [t]);

  const getFertileWindow = () => {
    const ovulationDay = Math.round(cycleLength - 14);
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;
    return { ovulationDay, fertileStart, fertileEnd };
  };

  const { ovulationDay, fertileStart, fertileEnd } = getFertileWindow();

  const isInFertileWindow =
    currentCycleDay !== null &&
    currentCycleDay >= fertileStart &&
    currentCycleDay <= fertileEnd;

  const isOvulationDay = currentCycleDay === ovulationDay;

  const handleDayClick = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleUpdateFertility = useCallback(
    (updates: Parameters<typeof updateFertility>[1]) => {
      if (selectedDate) {
        updateFertility(selectedDate, updates);
      }
    },
    [selectedDate, updateFertility]
  );

  const selectedFertilityData = selectedDate ? getFertilityForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Baby className="w-7 h-7 text-pink-500" />
          {t.pregnancy.title}
        </h1>
        <p className="text-muted-foreground">
          {t.pregnancy.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-pink-50 text-pink-700 hover:opacity-80"
          )}
        >
          <span>📅</span>
          <span>{t.nav.calendar}</span>
        </button>
        <button
          onClick={() => setActiveTab("tips")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "tips"
              ? "bg-primary text-primary-foreground"
              : "bg-rose-50 text-rose-700 hover:opacity-80"
          )}
        >
          <span>💡</span>
          <span>{t.pregnancy.tips}</span>
        </button>
        <button
          onClick={() => setActiveTab("nutrition")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "nutrition"
              ? "bg-primary text-primary-foreground"
              : "bg-green-50 text-green-700 hover:opacity-80"
          )}
        >
          <span>🥗</span>
          <span>{t.nav.nutrition}</span>
        </button>
        <button
          onClick={() => setActiveTab("exercise")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "exercise"
              ? "bg-primary text-primary-foreground"
              : "bg-blue-50 text-blue-700 hover:opacity-80"
          )}
        >
          <span>🏃</span>
          <span>{t.nav.exercise}</span>
        </button>
        <button
          onClick={() => setActiveTab("avoid")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "avoid"
              ? "bg-primary text-primary-foreground"
              : "bg-amber-50 text-amber-700 hover:opacity-80"
          )}
        >
          <span>⚠️</span>
          <span>{t.pregnancy.avoidTitle}</span>
        </button>
        <button
          onClick={() => setActiveTab("supplements")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "supplements"
              ? "bg-primary text-primary-foreground"
              : "bg-purple-50 text-purple-700 hover:opacity-80"
          )}
        >
          <span>💊</span>
          <span>{t.pregnancy.supplementsTitle}</span>
        </button>
      </div>

      {/* Calendar Tab Content */}
      {activeTab === "calendar" && (
        <>
          {/* Fertility Status Card */}
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            {t.pregnancy.fertileWindow}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">{t.pregnancy.currentCycleDay}</p>
              <p className="text-3xl font-bold text-pink-600">
                {currentCycleDay ?? "—"}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">{t.pregnancy.fertileDays}</p>
              <p className="text-3xl font-bold text-green-600">
                {fertileStart} - {fertileEnd}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">{t.pregnancy.estimatedOvulation}</p>
              <p className="text-3xl font-bold text-purple-600">{t.cycle.cycleDay} {ovulationDay}</p>
            </div>
          </div>

          {currentCycleDay !== null && (
            <div className="mt-4">
              {isOvulationDay ? (
                <Badge className="bg-purple-500 text-white text-sm px-4 py-2">
                  {t.pregnancy.maxFertility}
                </Badge>
              ) : isInFertileWindow ? (
                <Badge className="bg-green-500 text-white text-sm px-4 py-2">
                  {t.pregnancy.fertileWindow}
                </Badge>
              ) : currentCycleDay < fertileStart ? (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {fertileStart - currentCycleDay} {t.common.days}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {t.cycle.nextPeriod}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fertility Tracking - Calendar + Overview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              {t.pregnancy.trackFertility}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FertilityCalendar
              fertility={fertility}
              periods={periods}
              fertileStart={fertileStart}
              fertileEnd={fertileEnd}
              ovulationDay={ovulationDay}
              currentCycleDay={currentCycleDay}
              onDayClick={handleDayClick}
            />
          </CardContent>
        </Card>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t.pregnancy.overview}</CardTitle>
          </CardHeader>
          <CardContent>
            <FertilityOverview
              fertility={fertility}
              onDayClick={handleDayClick}
            />
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* Tips Tab Content */}
      {activeTab === "tips" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            {t.pregnancy.optimalTips}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {fertilityTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow text-center"
                  title={tip.description}
                >
                  <Icon className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <h3 className="text-xs font-medium leading-tight">{tip.title}</h3>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Nutrition Tab Content */}
      {activeTab === "nutrition" && (
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-500" />
              {t.nav.nutrition}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nutrients.map((nutrient, index) => {
                const Icon = nutrient.icon;
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <h3 className="font-medium text-sm text-green-800">{nutrient.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{nutrient.benefit}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
      </Card>
      )}

      {/* Exercise Tab Content */}
      {activeTab === "exercise" && (
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              {t.nav.exercise}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercises.map((exercise, index) => {
                const Icon = exercise.icon;
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <h3 className="font-medium text-sm text-blue-800">{exercise.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{exercise.benefit}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
      </Card>
      )}

      {/* Avoid Tab Content */}
      {activeTab === "avoid" && (
      <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              {t.pregnancy.avoidTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {avoidList.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-muted-foreground">{item.name} - {item.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
      </Card>
      )}

      {/* Supplements Tab Content */}
      {activeTab === "supplements" && (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Pill className="w-5 h-5" />
              {t.pregnancy.supplementsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg">
                <h3 className="font-medium text-sm text-purple-800">{t.pregnancy.folicAcid}</h3>
                <p className="text-xs text-muted-foreground">{t.pregnancy.folicAcidDesc}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <h3 className="font-medium text-sm text-purple-800">{t.pregnancy.vitaminD}</h3>
                <p className="text-xs text-muted-foreground">{t.pregnancy.vitaminDDesc}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <h3 className="font-medium text-sm text-purple-800">{t.pregnancy.omega3}</h3>
                <p className="text-xs text-muted-foreground">{t.pregnancy.omega3Desc}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <h3 className="font-medium text-sm text-purple-800">{t.pregnancy.vitaminB12}</h3>
                <p className="text-xs text-muted-foreground">{t.pregnancy.vitaminB12Desc}</p>
              </div>
            </div>
          </CardContent>
      </Card>
      )}

      {/* Fertility Day Detail Dialog */}
      <FertilityDayDetail
        dateString={selectedDate}
        fertilityData={selectedFertilityData}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateFertility}
      />
    </div>
  );
}
