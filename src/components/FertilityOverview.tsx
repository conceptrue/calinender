"use client";

import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ThermometerSun, Droplets, Heart, Pill, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import type { FertilityDay } from "@/types";
import type { Translations } from "@/i18n/types";

type ViewType = "recent" | "temp" | "mucus" | "tests" | "activity";

interface FertilityOverviewProps {
  fertility: FertilityDay[];
  onDayClick: (dateString: string) => void;
}

function getTabs(t: Translations): { value: ViewType; label: string }[] {
  return [
    { value: "recent", label: t.symptoms.recent },
    { value: "temp", label: t.fertility.temp },
    { value: "mucus", label: t.fertility.mucus },
    { value: "tests", label: t.fertility.tests },
    { value: "activity", label: t.fertility.activity },
  ];
}

function getMucusConfig(t: Translations): Record<string, { label: string; color: string; short: string }> {
  return {
    dry: { label: t.fertility.dry, color: "bg-gray-100 text-gray-800", short: "D" },
    sticky: { label: t.fertility.sticky, color: "bg-yellow-100 text-yellow-800", short: "S" },
    creamy: { label: t.fertility.creamy, color: "bg-orange-100 text-orange-800", short: "C" },
    watery: { label: t.fertility.watery, color: "bg-blue-100 text-blue-800", short: "W" },
    eggwhite: { label: t.fertility.eggwhite, color: "bg-green-100 text-green-800", short: "E" },
  };
}

export function FertilityOverview({ fertility, onDayClick }: FertilityOverviewProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<ViewType>("recent");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateLocale = language === "en" ? enUS : nl;
  const tabs = useMemo(() => getTabs(t), [t]);
  const mucusConfig = useMemo(() => getMucusConfig(t), [t]);

  const fertilityByDate = useMemo(() => {
    const map = new Map<string, FertilityDay>();
    fertility.forEach((f) => map.set(f.date, f));
    return map;
  }, [fertility]);

  const recentFertility = useMemo(() => {
    return [...fertility]
      .filter((f) =>
        f.temperature !== null ||
        f.cervicalMucus !== null ||
        f.ovulationTest !== null ||
        f.intercourse ||
        f.supplements
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [fertility]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const renderMonthNav = () => (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium capitalize">
        {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const weekdays = useMemo(() => [
    t.weekdaysShort.mon, t.weekdaysShort.tue, t.weekdaysShort.wed,
    t.weekdaysShort.thu, t.weekdaysShort.fri, t.weekdaysShort.sat, t.weekdaysShort.sun
  ], [t]);

  const renderCalendarGrid = (renderCell: (dateString: string) => React.ReactNode) => (
    <div className="grid grid-cols-7 gap-1">
      {weekdays.map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
          {day}
        </div>
      ))}
      {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
      {daysInMonth.map((date) => {
        const dateString = format(date, "yyyy-MM-dd");
        return (
          <button
            key={dateString}
            onClick={() => onDayClick(dateString)}
            className="flex flex-col items-center py-1 hover:bg-muted/50 rounded transition-colors"
          >
            <span className="text-xs text-muted-foreground mb-1">
              {date.getDate()}
            </span>
            {renderCell(dateString)}
          </button>
        );
      })}
    </div>
  );

  const renderRecentView = () => {
    if (recentFertility.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t.fertility.noDataYet}</p>
          <p className="text-sm mt-1">{t.fertility.clickToStart}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentFertility.map((f) => (
          <button
            key={f.date}
            onClick={() => onDayClick(f.date)}
            className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {format(parseISO(f.date), "EEE d MMM", { locale: dateLocale })}
              </span>
              <div className="flex items-center gap-2">
                {f.temperature && (
                  <span className="flex items-center gap-1 text-xs text-orange-600">
                    <ThermometerSun className="w-3 h-3" />
                    {f.temperature}°
                  </span>
                )}
                {f.cervicalMucus && (
                  <span className={cn("px-1.5 py-0.5 rounded text-xs", mucusConfig[f.cervicalMucus].color)}>
                    {mucusConfig[f.cervicalMucus].short}
                  </span>
                )}
                {f.ovulationTest === "positive" && (
                  <FlaskConical className="w-3 h-3 text-green-600" />
                )}
                {f.intercourse && (
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                )}
                {f.supplements && (
                  <Pill className="w-3 h-3 text-purple-500" />
                )}
              </div>
            </div>
            {f.notes && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{f.notes}</p>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderTempView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const f = fertilityByDate.get(dateString);
        if (!f?.temperature) return <span className="text-muted-foreground text-xs">—</span>;
        const temp = f.temperature;
        const isHigh = temp >= 36.5;
        return (
          <span className={cn(
            "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-medium",
            isHigh ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
          )}>
            {temp.toFixed(1)}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t text-xs">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100" />
          {t.fertility.belowTemp}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-100" />
          {t.fertility.aboveTemp}
        </span>
      </div>
    </>
  );

  const renderMucusView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const f = fertilityByDate.get(dateString);
        if (!f?.cervicalMucus) return <span className="text-muted-foreground text-xs">—</span>;
        const config = mucusConfig[f.cervicalMucus];
        return (
          <span className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium",
            config.color
          )}>
            {config.short}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(mucusConfig).map(([key, config]) => (
          <span key={key} className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs", config.color)}>
            {config.short} {config.label}
          </span>
        ))}
      </div>
    </>
  );

  const renderTestsView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const f = fertilityByDate.get(dateString);
        if (!f?.ovulationTest) return <span className="text-muted-foreground text-xs">—</span>;
        const isPositive = f.ovulationTest === "positive";
        return (
          <span className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium",
            isPositive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          )}>
            {isPositive ? "+" : "−"}
          </span>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
          {t.fertility.lhPeak}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
          − {t.fertility.negative}
        </span>
      </div>
    </>
  );

  const renderActivityView = () => (
    <>
      {renderMonthNav()}
      {renderCalendarGrid((dateString) => {
        const f = fertilityByDate.get(dateString);
        const hasIntercourse = f?.intercourse;
        const hasSupplements = f?.supplements;

        if (!hasIntercourse && !hasSupplements) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        return (
          <div className="flex gap-0.5">
            {hasIntercourse && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
            {hasSupplements && <Pill className="w-4 h-4 text-purple-500" />}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-50 text-red-800">
          <Heart className="w-3 h-3 fill-red-500" /> {t.fertility.intercourse}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-50 text-purple-800">
          <Pill className="w-3 h-3" /> {t.fertility.supplements}
        </span>
      </div>
    </>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 mb-4 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-center",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4">
        {activeTab === "recent" && renderRecentView()}
        {activeTab === "temp" && renderTempView()}
        {activeTab === "mucus" && renderMucusView()}
        {activeTab === "tests" && renderTestsView()}
        {activeTab === "activity" && renderActivityView()}
      </div>
    </div>
  );
}
