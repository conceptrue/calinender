"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CycleCalculations } from "@/lib/calculations";

interface CycleStatsProps {
  calculations: CycleCalculations;
  periodsCount: number;
}

export function CycleStats({ calculations, periodsCount }: CycleStatsProps) {
  const {
    averageCycleLength,
    averagePeriodLength,
    currentCycleDay,
    daysUntilNextPeriod,
  } = calculations;

  if (periodsCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Markeer je eerste periode om statistieken te zien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistieken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cycluslengte</p>
            <p className="text-2xl font-semibold">{averageCycleLength} dagen</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Periodelengte</p>
            <p className="text-2xl font-semibold">{averagePeriodLength} dagen</p>
          </div>
          {currentCycleDay !== null && (
            <div>
              <p className="text-sm text-muted-foreground">Cyclusdag</p>
              <p className="text-2xl font-semibold">Dag {currentCycleDay}</p>
            </div>
          )}
          {daysUntilNextPeriod !== null && (
            <div>
              <p className="text-sm text-muted-foreground">Volgende periode</p>
              <p className="text-2xl font-semibold">
                {daysUntilNextPeriod <= 0
                  ? "Vandaag/binnenkort"
                  : `${daysUntilNextPeriod} dagen`}
              </p>
            </div>
          )}
        </div>
        {periodsCount < 2 && (
          <p className="text-xs text-muted-foreground mt-4">
            Registreer meer periodes voor nauwkeurigere voorspellingen.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
