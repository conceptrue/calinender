"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { DaySymptom, Mood, PainLevel, EnergyLevel, NutritionLevel, ExerciseType } from "@/types";

interface DayDetailProps {
  dateString: string | null;
  symptom: DaySymptom | null;
  isPeriod: boolean;
  onClose: () => void;
  onTogglePeriod: () => void;
  onUpdateSymptom: (updates: {
    mood?: Mood;
    pain?: PainLevel;
    energy?: EnergyLevel;
    nutrition?: NutritionLevel;
    exercise?: ExerciseType;
    exerciseMinutes?: number | null;
    notes?: string;
  }) => void;
}

const moodOptions: { value: Mood; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😊", label: "Blij" },
  { value: "neutral", emoji: "😐", label: "Neutraal" },
  { value: "irritable", emoji: "😤", label: "Prikkelbaar" },
  { value: "sad", emoji: "😢", label: "Verdrietig" },
  { value: "emotional", emoji: "🥺", label: "Emotioneel" },
];

const painOptions: { value: PainLevel; label: string }[] = [
  { value: "none", label: "Geen" },
  { value: "light", label: "Licht" },
  { value: "moderate", label: "Matig" },
  { value: "intense", label: "Hevig" },
  { value: "severe", label: "Ernstig" },
];

const energyLabels: Record<number, string> = {
  1: "Zeer laag",
  2: "Laag",
  3: "Normaal",
  4: "Hoog",
  5: "Zeer hoog",
};

const nutritionOptions: { value: NutritionLevel; emoji: string; label: string }[] = [
  { value: "healthy", emoji: "🥗", label: "Gezond" },
  { value: "balanced", emoji: "🍽️", label: "Normaal" },
  { value: "unhealthy", emoji: "🍕", label: "Ongezond" },
  { value: "cravings", emoji: "🍫", label: "Cravings" },
];

const exerciseOptions: { value: ExerciseType; emoji: string; label: string }[] = [
  { value: "walking", emoji: "🚶", label: "Wandelen" },
  { value: "running", emoji: "🏃", label: "Hardlopen" },
  { value: "cycling", emoji: "🚴", label: "Fietsen" },
  { value: "swimming", emoji: "🏊", label: "Zwemmen" },
  { value: "gym", emoji: "🏋️", label: "Fitness" },
  { value: "yoga", emoji: "🧘", label: "Yoga" },
  { value: "sports", emoji: "⚽", label: "Sport" },
  { value: "other", emoji: "💪", label: "Anders" },
];

// Inner component that uses key to reset state when date changes
function DayDetailContent({
  dateString,
  symptom,
  isPeriod,
  onClose,
  onTogglePeriod,
  onUpdateSymptom,
}: DayDetailProps) {
  const [notes, setNotes] = useState(symptom?.notes ?? "");
  const [localMood, setLocalMood] = useState<Mood>(symptom?.mood ?? null);
  const [localPain, setLocalPain] = useState<PainLevel>(symptom?.pain ?? null);
  const [localEnergy, setLocalEnergy] = useState<EnergyLevel>(symptom?.energy ?? null);
  const [localNutrition, setLocalNutrition] = useState<NutritionLevel>(symptom?.nutrition ?? null);
  const [localExercise, setLocalExercise] = useState<ExerciseType>(symptom?.exercise ?? null);
  const [localExerciseMinutes, setLocalExerciseMinutes] = useState<number | null>(symptom?.exerciseMinutes ?? null);

  if (!dateString) return null;

  const formattedDate = format(parseISO(dateString), "EEEE d MMMM yyyy", {
    locale: nl,
  });

  const handleSave = () => {
    onUpdateSymptom({
      mood: localMood,
      pain: localPain,
      energy: localEnergy,
      nutrition: localNutrition,
      exercise: localExercise,
      exerciseMinutes: localExerciseMinutes,
      notes,
    });
    onClose();
  };

  const handleEnergyChange = (value: number[]) => {
    setLocalEnergy(value[0] as EnergyLevel);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="capitalize">{formattedDate}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Period Toggle */}
        <div>
          <label className="text-sm font-medium mb-2 block">Periode</label>
          <Button
            variant={isPeriod ? "default" : "outline"}
            onClick={onTogglePeriod}
            className={cn(isPeriod && "bg-red-500 hover:bg-red-600")}
          >
            {isPeriod
              ? "Periode (klik om te verwijderen)"
              : "Markeer als periode"}
          </Button>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Stemming</label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setLocalMood(localMood === option.value ? null : option.value)
                }
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border transition-colors",
                  localMood === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs mt-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pain Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Pijn</label>
          <div className="flex flex-wrap gap-2">
            {painOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setLocalPain(localPain === option.value ? null : option.value)
                }
                className={cn(
                  "py-2 px-3 rounded-lg border text-sm transition-colors",
                  localPain === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy Slider */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Energie: {localEnergy ? energyLabels[localEnergy] : "Niet ingesteld"}
          </label>
          <div className="px-2">
            <Slider
              value={localEnergy ? [localEnergy] : [3]}
              onValueChange={handleEnergyChange}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Laag</span>
              <span>Hoog</span>
            </div>
          </div>
        </div>

        {/* Nutrition Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Voeding</label>
          <div className="flex flex-wrap gap-2">
            {nutritionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setLocalNutrition(localNutrition === option.value ? null : option.value)
                }
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border transition-colors",
                  localNutrition === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs mt-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Beweging / Sport</label>
          <div className="flex flex-wrap gap-2">
            {exerciseOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (localExercise === option.value) {
                    setLocalExercise(null);
                    setLocalExerciseMinutes(null);
                  } else {
                    setLocalExercise(option.value);
                  }
                }}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border transition-colors",
                  localExercise === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-xs mt-1">{option.label}</span>
              </button>
            ))}
          </div>
          {localExercise && (
            <div className="mt-3">
              <label className="text-sm text-muted-foreground mb-2 block">
                Duur: {localExerciseMinutes ?? 30} minuten
              </label>
              <Slider
                value={[localExerciseMinutes ?? 30]}
                onValueChange={(value) => setLocalExerciseMinutes(value[0])}
                min={5}
                max={180}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 min</span>
                <span>3 uur</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Notities</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Voeg notities toe..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave}>Opslaan</Button>
        </div>
      </div>
    </>
  );
}

export function DayDetail({
  dateString,
  symptom,
  isPeriod,
  onClose,
  onTogglePeriod,
  onUpdateSymptom,
}: DayDetailProps) {
  return (
    <Dialog open={!!dateString} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        {/* Use key to reset component state when date changes */}
        <DayDetailContent
          key={dateString}
          dateString={dateString}
          symptom={symptom}
          isPeriod={isPeriod}
          onClose={onClose}
          onTogglePeriod={onTogglePeriod}
          onUpdateSymptom={onUpdateSymptom}
        />
      </DialogContent>
    </Dialog>
  );
}
