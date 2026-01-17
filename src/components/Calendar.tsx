"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayCell } from "@/components/DayCell";
import {
  generateCalendarGrid,
  getMonthYear,
  navigateMonth,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import type { CycleData } from "@/types";

interface CalendarProps {
  cycleData: CycleData;
  predictedPeriodDates: string[];
  ovulationDates: string[];
  fertileDates: string[];
  onDayClick: (dateString: string) => void;
}

export function Calendar({
  cycleData,
  predictedPeriodDates,
  ovulationDates,
  fertileDates,
  onDayClick,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = generateCalendarGrid(currentDate);

  const isPeriodDay = (dateString: string): boolean => {
    return cycleData.periods.some((period) => {
      if (!period.endDate) {
        return dateString === period.startDate;
      }
      return dateString >= period.startDate && dateString <= period.endDate;
    });
  };

  const hasSymptoms = (dateString: string): boolean => {
    const symptom = cycleData.symptoms.find((s) => s.date === dateString);
    if (!symptom) return false;
    return !!(symptom.mood || symptom.pain || symptom.energy || symptom.notes);
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(navigateMonth(currentDate, "prev"))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold capitalize">
            {getMonthYear(currentDate)}
          </h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Vandaag
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(navigateMonth(currentDate, "next"))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <DayCell
            key={day.dateString}
            day={day}
            isPeriod={isPeriodDay(day.dateString)}
            isPredictedPeriod={predictedPeriodDates.includes(day.dateString)}
            isOvulation={ovulationDates.includes(day.dateString)}
            isFertile={fertileDates.includes(day.dateString)}
            hasSymptoms={hasSymptoms(day.dateString)}
            onClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}
