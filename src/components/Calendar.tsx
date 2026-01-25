"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayCell } from "@/components/DayCell";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  generateCalendarGrid,
  navigateMonth,
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
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = generateCalendarGrid(currentDate);

  const dateLocale = language === "en" ? enUS : nl;

  const weekdays = useMemo(() => [
    t.weekdaysShort.mon,
    t.weekdaysShort.tue,
    t.weekdaysShort.wed,
    t.weekdaysShort.thu,
    t.weekdaysShort.fri,
    t.weekdaysShort.sat,
    t.weekdaysShort.sun,
  ], [t]);

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
            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
          </h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            {t.common.today}
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
        {weekdays.map((day) => (
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
