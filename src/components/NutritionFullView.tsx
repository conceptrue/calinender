"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NutritionOverview } from "@/components/NutritionOverview";
import type { DaySymptom } from "@/types";

interface NutritionFullViewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
  currentCycleDay: number | null;
  cycleLength: number;
}

export function NutritionFullView({ symptoms, onDayClick, currentCycleDay, cycleLength }: NutritionFullViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Voeding</h1>
        <p className="text-muted-foreground">Voedingsadvies afgestemd op je cyclus</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voedingsplan</CardTitle>
          <CardDescription>
            Bekijk wat je het beste kunt eten op basis van je cyclusfase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NutritionOverview
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
