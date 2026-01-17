"use client";

import { useMemo } from "react";
import type { CycleCalculations } from "@/lib/calculations";

interface CalendarCircularProps {
  calculations: CycleCalculations;
  onDayClick?: (day: number) => void;
}

export function CalendarCircular({ calculations, onDayClick }: CalendarCircularProps) {
  const { averageCycleLength, currentCycleDay, averagePeriodLength } = calculations;

  const cyclePhases = useMemo(() => {
    const ovulationDay = averageCycleLength - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    return {
      periodEnd: averagePeriodLength,
      fertileStart,
      ovulationDay,
      fertileEnd,
    };
  }, [averageCycleLength, averagePeriodLength]);

  const getPhaseForDay = (day: number) => {
    if (day <= cyclePhases.periodEnd) return "period";
    if (day >= cyclePhases.fertileStart && day < cyclePhases.ovulationDay) return "fertile";
    if (day === cyclePhases.ovulationDay) return "ovulation";
    if (day === cyclePhases.fertileEnd) return "fertile";
    return "normal";
  };

  const days = Array.from({ length: averageCycleLength }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">Circulaire Cyclus</h3>

      <div className="relative aspect-square max-w-[320px] mx-auto">
        {/* Center info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-muted-foreground">Cyclusdag</span>
          <span className="text-4xl font-bold">{currentCycleDay ?? "—"}</span>
          {calculations.daysUntilNextPeriod !== null && (
            <span className="text-xs text-muted-foreground mt-2">
              Nog {calculations.daysUntilNextPeriod} dagen
            </span>
          )}
        </div>

        {/* Circular days */}
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {days.map((day) => {
            const angle = (day - 1) * (360 / averageCycleLength);
            const radians = (angle * Math.PI) / 180;
            const radius = 85;
            const x = 100 + radius * Math.cos(radians);
            const y = 100 + radius * Math.sin(radians);

            const phase = getPhaseForDay(day);
            const isToday = day === currentCycleDay;

            let fillColor = "#e5e7eb"; // gray-200
            if (phase === "period") fillColor = "#fca5a5"; // red-300
            if (phase === "fertile") fillColor = "#93c5fd"; // blue-300
            if (phase === "ovulation") fillColor = "#3b82f6"; // blue-500
            if (isToday) fillColor = "#000";

            return (
              <g key={day}>
                <circle
                  cx={x}
                  cy={y}
                  r={day === currentCycleDay ? 10 : 8}
                  fill={fillColor}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onDayClick?.(day)}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="rotate-90 origin-center text-[6px] font-medium pointer-events-none"
                  fill={isToday ? "#fff" : "#374151"}
                  style={{ transform: `rotate(90deg)`, transformOrigin: `${x}px ${y}px` }}
                >
                  {day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span>Periode</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-blue-300" />
          <span>Vruchtbaar</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          <span>Ovulatie</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-black" />
          <span>Vandaag</span>
        </div>
      </div>
    </div>
  );
}
