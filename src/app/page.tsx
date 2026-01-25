"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarGridVariants } from "@/components/CalendarGridVariants";
import { Legend } from "@/components/Legend";
import { DayDetail } from "@/components/DayDetail";
import { SymptomsOverview } from "@/components/SymptomsOverview";
import { NutritionFullView } from "@/components/NutritionFullView";
import { ExerciseFullView } from "@/components/ExerciseFullView";
import { RecipesView } from "@/components/RecipesView";
import { PregnancyView } from "@/components/PregnancyView";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Sidebar, type ViewType } from "@/components/Sidebar";
import { useCycleData } from "@/hooks/useCycleData";
import { getAllCalculations } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageProvider, useTranslation } from "@/contexts/LanguageContext";

export default function Home() {
  const {
    cycleData,
    isLoaded,
    togglePeriodDay,
    getSymptomForDate,
    updateSymptom,
    getFertilityForDate,
    updateFertility,
    updateSettings,
    replaceAllData,
    deleteDataCategory,
    deleteAllData,
  } = useCycleData();

  // Get language from settings (with fallback to "nl")
  const language = cycleData.settings?.language || "nl";

  return (
    <LanguageProvider language={language}>
      <HomeContent
        cycleData={cycleData}
        isLoaded={isLoaded}
        togglePeriodDay={togglePeriodDay}
        getSymptomForDate={getSymptomForDate}
        updateSymptom={updateSymptom}
        getFertilityForDate={getFertilityForDate}
        updateFertility={updateFertility}
        updateSettings={updateSettings}
        replaceAllData={replaceAllData}
        deleteDataCategory={deleteDataCategory}
        deleteAllData={deleteAllData}
      />
    </LanguageProvider>
  );
}

interface HomeContentProps {
  cycleData: ReturnType<typeof useCycleData>["cycleData"];
  isLoaded: boolean;
  togglePeriodDay: ReturnType<typeof useCycleData>["togglePeriodDay"];
  getSymptomForDate: ReturnType<typeof useCycleData>["getSymptomForDate"];
  updateSymptom: ReturnType<typeof useCycleData>["updateSymptom"];
  getFertilityForDate: ReturnType<typeof useCycleData>["getFertilityForDate"];
  updateFertility: ReturnType<typeof useCycleData>["updateFertility"];
  updateSettings: ReturnType<typeof useCycleData>["updateSettings"];
  replaceAllData: ReturnType<typeof useCycleData>["replaceAllData"];
  deleteDataCategory: ReturnType<typeof useCycleData>["deleteDataCategory"];
  deleteAllData: ReturnType<typeof useCycleData>["deleteAllData"];
}

function HomeContent({
  cycleData,
  isLoaded,
  togglePeriodDay,
  getSymptomForDate,
  updateSymptom,
  getFertilityForDate,
  updateFertility,
  updateSettings,
  replaceAllData,
  deleteDataCategory,
  deleteAllData,
}: HomeContentProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("kalender");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const calculations = useMemo(() => {
    return getAllCalculations(cycleData.periods, cycleData.settings);
  }, [cycleData.periods, cycleData.settings]);

  const isSelectedDatePeriod = useMemo(() => {
    if (!selectedDate) return false;
    return cycleData.periods.some((period) => {
      if (!period.endDate) {
        return selectedDate === period.startDate;
      }
      return selectedDate >= period.startDate && selectedDate <= period.endDate;
    });
  }, [selectedDate, cycleData.periods]);

  const selectedSymptom = useMemo(() => {
    if (!selectedDate) return null;
    return getSymptomForDate(selectedDate);
  }, [selectedDate, getSymptomForDate]);

  const handleDayClick = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleTogglePeriod = useCallback(() => {
    if (selectedDate) {
      togglePeriodDay(selectedDate);
    }
  }, [selectedDate, togglePeriodDay]);

  const handleUpdateSymptom = useCallback(
    (updates: Parameters<typeof updateSymptom>[1]) => {
      if (selectedDate) {
        updateSymptom(selectedDate, updates);
      }
    },
    [selectedDate, updateSymptom]
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </main>
      </div>
    );
  }

  const {
    currentCycleDay,
    daysUntilNextPeriod,
    averageCycleLength,
    averagePeriodLength,
  } = calculations;

  const calendarProps = {
    cycleData,
    predictedPeriodDates: calculations.predictedPeriodDates,
    ovulationDates: calculations.ovulationDates,
    fertileDates: calculations.fertileDates,
    onDayClick: handleDayClick,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
        {/* Kalender View */}
        {activeView === "kalender" && (
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">{t.nav.calendar}</h1>
              <p className="text-muted-foreground">
                {t.app.tagline}
              </p>
            </div>

            {/* Cycle Day Card - Full Width */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 border-4 border-rose-300">
                      <span className="text-3xl font-bold text-rose-700">
                        {currentCycleDay ?? "—"}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {currentCycleDay ? `${t.cycle.cycleDay} ${currentCycleDay}` : t.cycle.noData}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.cycle.ofYourCycle}
                      </p>
                    </div>
                  </div>

                  {daysUntilNextPeriod !== null && (
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-foreground">
                        {daysUntilNextPeriod <= 0 ? t.phases.now : daysUntilNextPeriod}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {daysUntilNextPeriod <= 0 ? t.cycle.periodExpected : t.cycle.daysUntilPeriod}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-around mt-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-semibold">{averageCycleLength}</p>
                    <p className="text-xs text-muted-foreground">{t.cycle.cycleLength}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{averagePeriodLength}</p>
                    <p className="text-xs text-muted-foreground">{t.cycle.periodLength}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{cycleData.periods.length}</p>
                    <p className="text-xs text-muted-foreground">{t.cycle.periods}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar + Symptoms side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.nav.calendar}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarGridVariants {...calendarProps} variant="classic" />
                  <Legend />
                </CardContent>
              </Card>

              {/* Symptoms Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.symptoms.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SymptomsOverview
                    symptoms={cycleData.symptoms}
                    onDayClick={handleDayClick}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Voeding View */}
        {activeView === "voeding" && (
          <div className="max-w-4xl mx-auto">
            <NutritionFullView
              symptoms={cycleData.symptoms}
              onDayClick={handleDayClick}
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
            />
          </div>
        )}

        {/* Beweging View */}
        {activeView === "beweging" && (
          <div className="max-w-4xl mx-auto">
            <ExerciseFullView
              symptoms={cycleData.symptoms}
              onDayClick={handleDayClick}
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
            />
          </div>
        )}

        {/* Recepten View */}
        {activeView === "recepten" && (
          <div className="max-w-6xl mx-auto">
            <RecipesView
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
            />
          </div>
        )}

        {/* Zwanger worden View */}
        {activeView === "zwanger" && (
          <div className="max-w-6xl mx-auto">
            <PregnancyView
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
              fertility={cycleData.fertility || []}
              periods={cycleData.periods}
              getFertilityForDate={getFertilityForDate}
              updateFertility={updateFertility}
            />
          </div>
        )}
      </main>

      {/* Day Detail Dialog */}
      <DayDetail
        dateString={selectedDate}
        symptom={selectedSymptom}
        isPeriod={isSelectedDatePeriod}
        onClose={handleCloseDetail}
        onTogglePeriod={handleTogglePeriod}
        onUpdateSymptom={handleUpdateSymptom}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cycleData={cycleData}
        onUpdateSettings={updateSettings}
        onReplaceAllData={replaceAllData}
        onDeleteCategory={deleteDataCategory}
        onDeleteAllData={deleteAllData}
      />
    </div>
  );
}
