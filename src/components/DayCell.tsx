"use client";

import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/lib/calendar";

interface DayCellProps {
  day: CalendarDay;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  hasSymptoms: boolean;
  onClick: (dateString: string) => void;
}

export function DayCell({
  day,
  isPeriod,
  isPredictedPeriod,
  isOvulation,
  isFertile,
  hasSymptoms,
  onClick,
}: DayCellProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(day.dateString)}
      className={cn(
        "relative flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        !day.isCurrentMonth && "text-muted-foreground/50",
        day.isToday && "ring-2 ring-primary ring-offset-2",
        // Period styling (highest priority for actual periods)
        isPeriod && "bg-red-200 hover:bg-red-300 text-red-900",
        // Predicted period (lower priority)
        !isPeriod && isPredictedPeriod && "bg-red-100 hover:bg-red-200 text-red-800",
        // Ovulation (only if not period)
        !isPeriod && !isPredictedPeriod && isOvulation && "bg-blue-300 hover:bg-blue-400 text-blue-900",
        // Fertile window (only if not period or ovulation)
        !isPeriod && !isPredictedPeriod && !isOvulation && isFertile && "bg-blue-100 hover:bg-blue-200 text-blue-800"
      )}
    >
      <span>{day.dayNumber}</span>
      {hasSymptoms && (
        <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-purple-500" />
      )}
    </button>
  );
}
