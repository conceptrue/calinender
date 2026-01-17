"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExerciseOverview } from "@/components/ExerciseOverview";
import type { DaySymptom } from "@/types";

interface ExerciseFullViewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
  currentCycleDay: number | null;
  cycleLength: number;
}

export function ExerciseFullView({ symptoms, onDayClick, currentCycleDay, cycleLength }: ExerciseFullViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Beweging</h1>
        <p className="text-muted-foreground">Bewegingsadvies afgestemd op je energieniveau</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bewegingsplan</CardTitle>
          <CardDescription>
            Ontdek welke activiteiten het beste passen bij je cyclusfase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseOverview
            symptoms={symptoms}
            onDayClick={onDayClick}
            currentCycleDay={currentCycleDay}
            cycleLength={cycleLength}
          />
        </CardContent>
      </Card>
    </div>
  );
}
