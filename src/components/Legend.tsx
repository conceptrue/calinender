"use client";

import { useMemo } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

interface LegendItem {
  color: string;
  label: string;
}

export function Legend() {
  const { t } = useTranslation();

  const legendItems: LegendItem[] = useMemo(() => [
    { color: "bg-red-200", label: t.cycle.period },
    { color: "bg-red-100", label: t.cycle.predictedPeriod },
    { color: "bg-blue-300", label: t.cycle.ovulation },
    { color: "bg-blue-100", label: t.cycle.fertile },
  ], [t]);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-4 w-4 rounded ${item.color}`} />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="text-muted-foreground">{t.cycle.symptoms}</span>
      </div>
    </div>
  );
}
