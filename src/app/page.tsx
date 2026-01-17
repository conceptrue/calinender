"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarGridVariants } from "@/components/CalendarGridVariants";
import { Legend } from "@/components/Legend";
import { DayDetail } from "@/components/DayDetail";
import { SymptomsOverview } from "@/components/SymptomsOverview";
import { NutritionOverview } from "@/components/NutritionOverview";
import { ExerciseOverview } from "@/components/ExerciseOverview";
import { useCycleData } from "@/hooks/useCycleData";
import { getAllCalculations } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const {
    cycleData,
    isLoaded,
    togglePeriodDay,
    getSymptomForDate,
    updateSymptom,
  } = useCycleData();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Menstruatiekalender
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Menstruatiekalender
          </h1>
          <p className="text-sm text-muted-foreground">
            Privé - alle data blijft lokaal op je apparaat
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Cycle Day Display */}
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

        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <CalendarGridVariants {...calendarProps} variant="classic" />
            <Legend />
          </CardContent>
        </Card>

        {/* Symptoms Overview with Tabs */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Symptomen</h3>
            <SymptomsOverview
              symptoms={cycleData.symptoms}
              onDayClick={handleDayClick}
            />
          </CardContent>
        </Card>

        {/* Nutrition Overview */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Voeding</h3>
            <NutritionOverview
              symptoms={cycleData.symptoms}
              onDayClick={handleDayClick}
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
            />
          </CardContent>
        </Card>

        {/* Exercise Overview */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Beweging</h3>
            <ExerciseOverview
              symptoms={cycleData.symptoms}
              onDayClick={handleDayClick}
              currentCycleDay={currentCycleDay}
              cycleLength={averageCycleLength}
            />
          </CardContent>
        </Card>
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
