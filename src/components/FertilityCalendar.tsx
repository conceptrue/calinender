"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";
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

export function FertilityCalendar({
  fertility,
  periods,
  fertileStart,
  fertileEnd,
  ovulationDay,
  onDayClick,
}: FertilityCalendarProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekdays = useMemo(() => [
    t.weekdaysShort.mon, t.weekdaysShort.tue, t.weekdaysShort.wed,
    t.weekdaysShort.thu, t.weekdaysShort.fri, t.weekdaysShort.sat, t.weekdaysShort.sun
  ], [t]);

  const monthNames = useMemo(() => [
    t.months.january, t.months.february, t.months.march, t.months.april,
    t.months.may, t.months.june, t.months.july, t.months.august,
    t.months.september, t.months.october, t.months.november, t.months.december
  ], [t]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: { date: Date | null; isCurrentMonth: boolean }[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
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

  const goToToday = () => setCurrentMonth(new Date());

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold capitalize">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            {t.common.today}
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center h-8 text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day.date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const dateString = day.date.toISOString().split("T")[0];
          const fertilityData = getFertilityForDate(dateString);
          const isPeriod = isPeriodDay(dateString);
          const cycleDay = getCycleDayForDate(dateString);
          const isFertile = isFertileDay(cycleDay);
          const isOvulation = isOvulationDay(cycleDay);
          const isToday = dateString === today;

          const hasData = fertilityData && (
            fertilityData.temperature !== null ||
            fertilityData.cervicalMucus !== null ||
            fertilityData.ovulationTest !== null ||
            fertilityData.intercourse ||
            fertilityData.supplements
          );

          return (
            <button
              key={dateString}
              onClick={() => onDayClick(dateString)}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !day.isCurrentMonth && "text-muted-foreground/50",
                isToday && "ring-2 ring-pink-500 ring-offset-2",
                isPeriod && "bg-rose-200 hover:bg-rose-300 text-rose-900",
                !isPeriod && isOvulation && "bg-purple-200 hover:bg-purple-300 text-purple-900",
                !isPeriod && !isOvulation && isFertile && "bg-green-100 hover:bg-green-200 text-green-800"
              )}
            >
              <span>{day.date.getDate()}</span>
              {hasData && (
                <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-pink-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Compact Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-3 mt-3 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-200" />
          <span>{t.phases.menstruation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span>{t.cycle.fertile}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-200" />
          <span>{t.cycle.ovulation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <span>{t.fertility.dataFilled}</span>
        </div>
      </div>
    </div>
  );
}
