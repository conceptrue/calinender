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
import { Sidebar, type ViewType } from "@/components/Sidebar";
import { useCycleData } from "@/hooks/useCycleData";
import { getAllCalculations } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const {
    cycleData,
    isLoaded,
    togglePeriodDay,
    getSymptomForDate,
    updateSymptom,
  } = useCycleData();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("kalender");

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
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">Laden...</p>
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
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
        {/* Kalender View */}
        {activeView === "kalender" && (
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Kalender</h1>
              <p className="text-muted-foreground">
                Volg je cyclus privé en lokaal
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
                        {currentCycleDay ? `Dag ${currentCycleDay}` : "Geen data"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        van je cyclus
                      </p>
                    </div>
                  </div>

                  {daysUntilNextPeriod !== null && (
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-foreground">
                        {daysUntilNextPeriod <= 0 ? "Nu" : daysUntilNextPeriod}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {daysUntilNextPeriod <= 0 ? "Periode verwacht" : "dagen tot periode"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-around mt-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-semibold">{averageCycleLength}</p>
                    <p className="text-xs text-muted-foreground">Cycluslengte</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{averagePeriodLength}</p>
                    <p className="text-xs text-muted-foreground">Periodelengte</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{cycleData.periods.length}</p>
                    <p className="text-xs text-muted-foreground">Periodes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar + Symptoms side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Kalender</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarGridVariants {...calendarProps} variant="classic" />
                  <Legend />
                </CardContent>
              </Card>

              {/* Symptoms Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Symptomen</CardTitle>
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
          <div className="max-w-4xl mx-auto">
            <PregnancyView
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
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
    </div>
  );
}
