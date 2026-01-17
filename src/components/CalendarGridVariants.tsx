"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateCalendarGrid,
  getMonthYear,
  navigateMonth,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { CycleData } from "@/types";

interface CalendarGridVariantsProps {
  cycleData: CycleData;
  predictedPeriodDates: string[];
  ovulationDates: string[];
  fertileDates: string[];
  onDayClick: (dateString: string) => void;
  variant: "classic" | "minimal" | "rounded" | "dots" | "gradient";
}

export function CalendarGridVariants({
  cycleData,
  predictedPeriodDates,
  ovulationDates,
  fertileDates,
  onDayClick,
  variant,
}: CalendarGridVariantsProps) {
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
    // Nutrition and exercise are excluded - they have their own sections
  };

  const goToToday = () => setCurrentDate(new Date());

  const getStatus = (dateString: string) => ({
    isPeriod: isPeriodDay(dateString),
    isPredicted: predictedPeriodDates.includes(dateString),
    isOvulation: ovulationDates.includes(dateString),
    isFertile: fertileDates.includes(dateString),
    hasSymptoms: hasSymptoms(dateString),
  });

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
      <div className={cn(
        "grid grid-cols-7 mb-2",
        variant === "minimal" && "gap-0",
        variant === "classic" && "gap-1",
        variant === "rounded" && "gap-2",
        variant === "dots" && "gap-1",
        variant === "gradient" && "gap-1"
      )}>
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className={cn(
              "flex items-center justify-center text-xs font-medium text-muted-foreground",
              variant === "minimal" && "h-6",
              variant === "classic" && "h-8",
              variant === "rounded" && "h-8",
              variant === "dots" && "h-8",
              variant === "gradient" && "h-8"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn(
        "grid grid-cols-7",
        variant === "minimal" && "gap-0 border border-border rounded-lg overflow-hidden",
        variant === "classic" && "gap-1",
        variant === "rounded" && "gap-2",
        variant === "dots" && "gap-1",
        variant === "gradient" && "gap-1"
      )}>
        {calendarDays.map((day) => {
          const status = getStatus(day.dateString);

          if (variant === "minimal") {
            return (
              <button
                key={day.dateString}
                onClick={() => onDayClick(day.dateString)}
                className={cn(
                  "relative h-12 flex items-center justify-center text-sm border-r border-b border-border last:border-r-0",
                  "[&:nth-child(7n)]:border-r-0",
                  !day.isCurrentMonth && "text-muted-foreground/40 bg-muted/30",
                  day.isToday && "font-bold",
                  status.isPeriod && "bg-red-50 text-red-700",
                  !status.isPeriod && status.isPredicted && "bg-red-50/50",
                  !status.isPeriod && !status.isPredicted && status.isOvulation && "bg-blue-50 text-blue-700",
                  !status.isPeriod && !status.isPredicted && !status.isOvulation && status.isFertile && "bg-blue-50/50",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <span>{day.dayNumber}</span>
                {day.isToday && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
                {status.hasSymptoms && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                )}
              </button>
            );
          }

          if (variant === "rounded") {
            return (
              <button
                key={day.dateString}
                onClick={() => onDayClick(day.dateString)}
                className={cn(
                  "relative h-12 w-12 mx-auto flex items-center justify-center text-sm rounded-full transition-all",
                  "hover:scale-110 hover:shadow-md",
                  !day.isCurrentMonth && "text-muted-foreground/40",
                  day.isToday && "ring-2 ring-primary ring-offset-2",
                  status.isPeriod && "bg-red-400 text-white shadow-md",
                  !status.isPeriod && status.isPredicted && "bg-red-200 text-red-800",
                  !status.isPeriod && !status.isPredicted && status.isOvulation && "bg-blue-500 text-white shadow-md",
                  !status.isPeriod && !status.isPredicted && !status.isOvulation && status.isFertile && "bg-blue-200 text-blue-800",
                  !status.isPeriod && !status.isPredicted && !status.isOvulation && !status.isFertile && "hover:bg-muted"
                )}
              >
                <span className="font-medium">{day.dayNumber}</span>
                {status.hasSymptoms && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 border-2 border-background" />
                )}
              </button>
            );
          }

          if (variant === "dots") {
            return (
              <button
                key={day.dateString}
                onClick={() => onDayClick(day.dateString)}
                className={cn(
                  "relative h-14 flex flex-col items-center justify-center text-sm rounded-md transition-colors",
                  "hover:bg-muted",
                  !day.isCurrentMonth && "text-muted-foreground/40",
                  day.isToday && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <span className="font-medium">{day.dayNumber}</span>
                <div className="flex gap-0.5 mt-1">
                  {status.isPeriod && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {status.isPredicted && !status.isPeriod && <span className="w-1.5 h-1.5 rounded-full bg-red-300" />}
                  {status.isOvulation && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {status.isFertile && !status.isOvulation && <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />}
                  {status.hasSymptoms && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                </div>
              </button>
            );
          }

          if (variant === "gradient") {
            return (
              <button
                key={day.dateString}
                onClick={() => onDayClick(day.dateString)}
                className={cn(
                  "relative h-11 flex items-center justify-center text-sm rounded-lg transition-all",
                  "hover:scale-105",
                  !day.isCurrentMonth && "text-muted-foreground/40",
                  day.isToday && "ring-2 ring-offset-1 ring-primary",
                  status.isPeriod && "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-sm",
                  !status.isPeriod && status.isPredicted && "bg-gradient-to-br from-red-100 to-rose-200 text-red-800",
                  !status.isPeriod && !status.isPredicted && status.isOvulation && "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm",
                  !status.isPeriod && !status.isPredicted && !status.isOvulation && status.isFertile && "bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800",
                  !status.isPeriod && !status.isPredicted && !status.isOvulation && !status.isFertile && "hover:bg-muted"
                )}
              >
                <span className="font-medium">{day.dayNumber}</span>
                {status.hasSymptoms && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            );
          }

          // Classic variant (default)
          return (
            <button
              key={day.dateString}
              onClick={() => onDayClick(day.dateString)}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !day.isCurrentMonth && "text-muted-foreground/50",
                day.isToday && "ring-2 ring-primary ring-offset-2",
                status.isPeriod && "bg-red-200 hover:bg-red-300 text-red-900",
                !status.isPeriod && status.isPredicted && "bg-red-100 hover:bg-red-200 text-red-800",
                !status.isPeriod && !status.isPredicted && status.isOvulation && "bg-blue-300 hover:bg-blue-400 text-blue-900",
                !status.isPeriod && !status.isPredicted && !status.isOvulation && status.isFertile && "bg-blue-100 hover:bg-blue-200 text-blue-800"
              )}
            >
              <span>{day.dayNumber}</span>
              {status.hasSymptoms && (
                <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
