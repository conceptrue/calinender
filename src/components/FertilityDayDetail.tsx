"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ThermometerSun,
  Droplets,
  Heart,
  Pill,
  FlaskConical,
  Calendar,
} from "lucide-react";
import type { FertilityDay, CervicalMucus, OvulationTest } from "@/types";

interface FertilityDayDetailProps {
  dateString: string | null;
  fertilityData: FertilityDay | null;
  onClose: () => void;
  onUpdate: (updates: {
    temperature?: number | null;
    cervicalMucus?: CervicalMucus;
    ovulationTest?: OvulationTest;
    intercourse?: boolean;
    supplements?: boolean;
    notes?: string;
  }) => void;
}

const MUCUS_OPTIONS: { value: CervicalMucus; label: string; description: string }[] = [
  { value: "dry", label: "Droog", description: "Geen slijm voelbaar" },
  { value: "sticky", label: "Plakkerig", description: "Dik, plakkerig slijm" },
  { value: "creamy", label: "Crèmig", description: "Wit, lotionachtig" },
  { value: "watery", label: "Waterig", description: "Helder en vloeibaar" },
  { value: "eggwhite", label: "Eiwit", description: "Elastisch, helder (meest vruchtbaar)" },
];

const OVULATION_TEST_OPTIONS: { value: OvulationTest; label: string }[] = [
  { value: "negative", label: "Negatief" },
  { value: "positive", label: "Positief" },
];

export function FertilityDayDetail({
  dateString,
  fertilityData,
  onClose,
  onUpdate,
}: FertilityDayDetailProps) {
  const [temperature, setTemperature] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus>(null);
  const [ovulationTest, setOvulationTest] = useState<OvulationTest>(null);
  const [intercourse, setIntercourse] = useState(false);
  const [supplements, setSupplements] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fertilityData) {
      setTemperature(fertilityData.temperature?.toString() ?? "");
      setCervicalMucus(fertilityData.cervicalMucus);
      setOvulationTest(fertilityData.ovulationTest);
      setIntercourse(fertilityData.intercourse);
      setSupplements(fertilityData.supplements);
      setNotes(fertilityData.notes);
    } else {
      setTemperature("");
      setCervicalMucus(null);
      setOvulationTest(null);
      setIntercourse(false);
      setSupplements(false);
      setNotes("");
    }
  }, [fertilityData, dateString]);

  const handleSave = () => {
    const tempValue = temperature ? parseFloat(temperature) : null;
    onUpdate({
      temperature: tempValue,
      cervicalMucus,
      ovulationTest,
      intercourse,
      supplements,
      notes,
    });
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!dateString) return null;

  return (
    <Dialog open={!!dateString} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="sticky top-0 bg-background pb-4 -mt-2 pt-2 z-10">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            {formatDate(dateString)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Temperature */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <ThermometerSun className="w-4 h-4 text-orange-500" />
              Basale lichaamstemperatuur
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="35"
                max="40"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="36.50"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-sm text-muted-foreground">°C</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Meet elke ochtend direct na het wakker worden
            </p>
          </div>

          {/* Cervical Mucus */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="w-4 h-4 text-blue-500" />
              Cervixslijm
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUCUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setCervicalMucus(
                      cervicalMucus === option.value ? null : option.value
                    )
                  }
                  className={cn(
                    "p-2 rounded-lg border text-left transition-colors",
                    cervicalMucus === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-input hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Ovulation Test */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <FlaskConical className="w-4 h-4 text-green-600" />
              Ovulatietest
            </label>
            <div className="flex gap-2">
              {OVULATION_TEST_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setOvulationTest(
                      ovulationTest === option.value ? null : option.value
                    )
                  }
                  className={cn(
                    "flex-1 p-3 rounded-lg border text-center transition-colors",
                    ovulationTest === option.value
                      ? option.value === "positive"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-500 bg-gray-50"
                      : "border-input hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Intercourse */}
            <button
              onClick={() => setIntercourse(!intercourse)}
              className={cn(
                "p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors",
                intercourse
                  ? "border-red-500 bg-red-50"
                  : "border-input hover:bg-muted"
              )}
            >
              <Heart
                className={cn(
                  "w-6 h-6",
                  intercourse ? "text-red-500 fill-red-500" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">Gemeenschap</span>
            </button>

            {/* Supplements */}
            <button
              onClick={() => setSupplements(!supplements)}
              className={cn(
                "p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors",
                supplements
                  ? "border-purple-500 bg-purple-50"
                  : "border-input hover:bg-muted"
              )}
            >
              <Pill
                className={cn(
                  "w-6 h-6",
                  supplements ? "text-purple-500" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">Supplementen</span>
            </button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notities</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra opmerkingen..."
              rows={3}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 sticky bottom-0 bg-background pb-2 -mb-2">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
