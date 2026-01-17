"use client";

import { useRef, useEffect, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CycleData } from "@/types";

interface CalendarTimelineProps {
  cycleData: CycleData;
  predictedPeriodDates: string[];
  ovulationDates: string[];
  fertileDates: string[];
  onDayClick: (dateString: string) => void;
}

export function CalendarTimeline({
  cycleData,
  predictedPeriodDates,
  ovulationDates,
  fertileDates,
  onDayClick,
}: CalendarTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Generate 60 days before and after today
  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = -30; i <= 30; i++) {
      const date = i < 0 ? subDays(today, Math.abs(i)) : addDays(today, i);
      result.push({
        date,
        dateString: format(date, "yyyy-MM-dd"),
        dayNumber: date.getDate(),
        dayName: format(date, "EEE", { locale: nl }),
        monthName: format(date, "MMM", { locale: nl }),
        isToday: i === 0,
      });
    }
    return result;
  }, []);

  const isPeriodDay = (dateString: string): boolean => {
    return cycleData.periods.some((period) => {
      if (!period.endDate) {
        return dateString === period.startDate;
      }
      return dateString >= period.startDate && dateString <= period.endDate;
    });
  };

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayElement = todayRef.current;
      const scrollPosition = todayElement.offsetLeft - container.offsetWidth / 2 + todayElement.offsetWidth / 2;
      container.scrollLeft = scrollPosition;
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">Tijdlijn</h3>

      {/* Month labels */}
      <div className="text-center text-sm text-muted-foreground mb-2">
        {format(new Date(), "MMMM yyyy", { locale: nl })}
      </div>

      {/* Timeline scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-4"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="flex gap-1 px-4 min-w-max">
          {days.map((day) => {
            const isPeriod = isPeriodDay(day.dateString);
            const isPredicted = predictedPeriodDates.includes(day.dateString);
            const isOvulation = ovulationDates.includes(day.dateString);
            const isFertile = fertileDates.includes(day.dateString);

            return (
              <button
                key={day.dateString}
                ref={day.isToday ? todayRef : undefined}
                onClick={() => onDayClick(day.dateString)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg min-w-[48px] transition-all",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                  day.isToday && "ring-2 ring-primary ring-offset-2",
                  isPeriod && "bg-red-200 hover:bg-red-300",
                  !isPeriod && isPredicted && "bg-red-100 hover:bg-red-200",
                  !isPeriod && !isPredicted && isOvulation && "bg-blue-400 hover:bg-blue-500 text-white",
                  !isPeriod && !isPredicted && !isOvulation && isFertile && "bg-blue-100 hover:bg-blue-200"
                )}
              >
                <span className="text-[10px] text-muted-foreground uppercase">
                  {day.dayName}
                </span>
                <span className={cn(
                  "text-lg font-semibold",
                  isOvulation && !isPeriod && !isPredicted && "text-white"
                )}>
                  {day.dayNumber}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection line */}
      <div className="relative h-2 mx-4 mt-2">
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-200" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-3 w-6 rounded bg-red-200" />
          <span>Periode</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-6 rounded bg-red-100" />
          <span>Voorspeld</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-6 rounded bg-blue-100" />
          <span>Vruchtbaar</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-6 rounded bg-blue-400" />
          <span>Ovulatie</span>
        </div>
      </div>
    </div>
  );
}
