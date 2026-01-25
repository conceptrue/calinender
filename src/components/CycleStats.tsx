"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/contexts/LanguageContext";
import type { CycleCalculations } from "@/lib/calculations";

interface CycleStatsProps {
  calculations: CycleCalculations;
  periodsCount: number;
}

export function CycleStats({ calculations, periodsCount }: CycleStatsProps) {
  const { t } = useTranslation();
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
          <CardTitle className="text-lg">{t.symptoms.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t.cycle.markFirstPeriod}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t.symptoms.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t.cycle.cycleLength}</p>
            <p className="text-2xl font-semibold">{averageCycleLength} {t.common.days}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.cycle.periodLength}</p>
            <p className="text-2xl font-semibold">{averagePeriodLength} {t.common.days}</p>
          </div>
          {currentCycleDay !== null && (
            <div>
              <p className="text-sm text-muted-foreground">{t.cycle.cycleDay}</p>
              <p className="text-2xl font-semibold">{t.common.day} {currentCycleDay}</p>
            </div>
          )}
          {daysUntilNextPeriod !== null && (
            <div>
              <p className="text-sm text-muted-foreground">{t.cycle.nextPeriod}</p>
              <p className="text-2xl font-semibold">
                {daysUntilNextPeriod <= 0
                  ? t.cycle.todaySoon
                  : `${daysUntilNextPeriod} ${t.common.days}`}
              </p>
            </div>
          )}
        </div>
        {periodsCount < 2 && (
          <p className="text-xs text-muted-foreground mt-4">
            {t.cycle.registerMorePeriods}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
