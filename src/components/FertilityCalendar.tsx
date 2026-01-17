"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ThermometerSun, Droplets, Heart, Pill, FlaskConical } from "lucide-react";
import type { FertilityDay, Period } from "@/types";

interface FertilityCalendarProps {
  fertility: FertilityDay[];
  periods: Period[];
  fertileStart: number;
  fertileEnd: number;
  ovulationDay: number;
  currentCycleDay: number | null;
  onDayClick: (dateString: string) => void;
}

const DAYS_NL = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MONTHS_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

export function FertilityCalendar({
  fertility,
  periods,
  fertileStart,
  fertileEnd,
  ovulationDay,
  currentCycleDay,
  onDayClick,
}: FertilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const getFertilityForDate = (dateString: string): FertilityDay | null => {
    return fertility.find((f) => f.date === dateString) || null;
  };

  const isPeriodDay = (dateString: string): boolean => {
    return periods.some((period) => {
      if (!period.endDate) {
        return dateString === period.startDate;
      }
      return dateString >= period.startDate && dateString <= period.endDate;
    });
  };

  const getCycleDayForDate = (dateString: string): number | null => {
    // Find the most recent period start before this date
    const sortedPeriods = [...periods].sort((a, b) =>
      b.startDate.localeCompare(a.startDate)
    );

    for (const period of sortedPeriods) {
      if (period.startDate <= dateString) {
        const start = new Date(period.startDate);
        const current = new Date(dateString);
        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
      }
    }
    return null;
  };

  const isFertileDay = (cycleDay: number | null): boolean => {
    if (cycleDay === null) return false;
    return cycleDay >= fertileStart && cycleDay <= fertileEnd;
  };

  const isOvulationDay = (cycleDay: number | null): boolean => {
    if (cycleDay === null) return false;
    return cycleDay === ovulationDay;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-lg">
          {MONTHS_NL[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS_NL.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateString = date.toISOString().split("T")[0];
          const fertilityData = getFertilityForDate(dateString);
          const isPeriod = isPeriodDay(dateString);
          const cycleDay = getCycleDayForDate(dateString);
          const isFertile = isFertileDay(cycleDay);
          const isOvulation = isOvulationDay(cycleDay);
          const isToday = dateString === today;

          const hasTemperature = fertilityData?.temperature !== null && fertilityData?.temperature !== undefined;
          const hasMucus = fertilityData?.cervicalMucus !== null;
          const hasIntercourse = fertilityData?.intercourse === true;
          const hasSupplements = fertilityData?.supplements === true;
          const hasOvulationTest = fertilityData?.ovulationTest !== null;

          return (
            <button
              key={dateString}
              onClick={() => onDayClick(dateString)}
              className={cn(
                "aspect-square p-1 rounded-lg transition-all relative flex flex-col items-center justify-start",
                "hover:ring-2 hover:ring-pink-300",
                isToday && "ring-2 ring-pink-500",
                isPeriod && "bg-rose-100",
                isOvulation && !isPeriod && "bg-purple-100",
                isFertile && !isOvulation && !isPeriod && "bg-green-50"
              )}
            >
              {/* Date number */}
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday && "text-pink-600",
                  isPeriod && "text-rose-700"
                )}
              >
                {date.getDate()}
              </span>

              {/* Indicators */}
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                {hasTemperature && (
                  <ThermometerSun className="w-3 h-3 text-orange-500" />
                )}
                {hasMucus && (
                  <Droplets className="w-3 h-3 text-blue-500" />
                )}
                {hasIntercourse && (
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                )}
                {hasSupplements && (
                  <Pill className="w-3 h-3 text-purple-500" />
                )}
                {hasOvulationTest && (
                  <FlaskConical className={cn(
                    "w-3 h-3",
                    fertilityData?.ovulationTest === "positive" ? "text-green-600" : "text-gray-400"
                  )} />
                )}
              </div>

              {/* Fertility indicator dot */}
              {(isFertile || isOvulation) && !isPeriod && (
                <div
                  className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                    isOvulation ? "bg-purple-500" : "bg-green-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-100" />
          <span>Menstruatie</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
          <span>Vruchtbaar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-100" />
          <span>Ovulatie</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThermometerSun className="w-3 h-3 text-orange-500" />
          <span>Temperatuur</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-blue-500" />
          <span>Slijm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>Gemeenschap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Pill className="w-3 h-3 text-purple-500" />
          <span>Supplementen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FlaskConical className="w-3 h-3 text-green-600" />
          <span>Ovulatietest</span>
        </div>
      </div>
    </div>
  );
}
