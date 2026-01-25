"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { nl, enUS } from "date-fns/locale";
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
import { useTranslation } from "@/contexts/LanguageContext";
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

// Inner component that uses key to reset state when date changes
function DayDetailContent({
  dateString,
  symptom,
  isPeriod,
  onClose,
  onTogglePeriod,
  onUpdateSymptom,
}: DayDetailProps) {
  const { t, language } = useTranslation();
  const [notes, setNotes] = useState(symptom?.notes ?? "");
  const [localMood, setLocalMood] = useState<Mood>(symptom?.mood ?? null);
  const [localPain, setLocalPain] = useState<PainLevel>(symptom?.pain ?? null);
  const [localEnergy, setLocalEnergy] = useState<EnergyLevel>(symptom?.energy ?? null);
  const [localNutrition, setLocalNutrition] = useState<NutritionLevel>(symptom?.nutrition ?? null);
  const [localExercise, setLocalExercise] = useState<ExerciseType>(symptom?.exercise ?? null);
  const [localExerciseMinutes, setLocalExerciseMinutes] = useState<number | null>(symptom?.exerciseMinutes ?? null);

  const moodOptions = useMemo(() => [
    { value: "happy" as Mood, emoji: "😊", label: t.moods.happy },
    { value: "neutral" as Mood, emoji: "😐", label: t.moods.neutral },
    { value: "irritable" as Mood, emoji: "😤", label: t.moods.irritable },
    { value: "sad" as Mood, emoji: "😢", label: t.moods.sad },
    { value: "emotional" as Mood, emoji: "🥺", label: t.moods.emotional },
  ], [t]);

  const painOptions = useMemo(() => [
    { value: "none" as PainLevel, label: t.pain.none },
    { value: "light" as PainLevel, label: t.pain.light },
    { value: "moderate" as PainLevel, label: t.pain.moderate },
    { value: "intense" as PainLevel, label: t.pain.intense },
    { value: "severe" as PainLevel, label: t.pain.severe },
  ], [t]);

  const energyLabels = useMemo(() => ({
    1: t.energy.veryLow,
    2: t.energy.low,
    3: t.energy.normal,
    4: t.energy.high,
    5: t.energy.veryHigh,
  }), [t]);

  const nutritionOptions = useMemo(() => [
    { value: "healthy" as NutritionLevel, emoji: "🥗", label: t.nutrition.healthy },
    { value: "balanced" as NutritionLevel, emoji: "🍽️", label: t.nutrition.balanced },
    { value: "unhealthy" as NutritionLevel, emoji: "🍕", label: t.nutrition.unhealthy },
    { value: "cravings" as NutritionLevel, emoji: "🍫", label: t.nutrition.cravings },
  ], [t]);

  const exerciseOptions = useMemo(() => [
    { value: "walking" as ExerciseType, emoji: "🚶", label: t.exercise.walking },
    { value: "running" as ExerciseType, emoji: "🏃", label: t.exercise.running },
    { value: "cycling" as ExerciseType, emoji: "🚴", label: t.exercise.cycling },
    { value: "swimming" as ExerciseType, emoji: "🏊", label: t.exercise.swimming },
    { value: "gym" as ExerciseType, emoji: "🏋️", label: t.exercise.gym },
    { value: "yoga" as ExerciseType, emoji: "🧘", label: t.exercise.yoga },
    { value: "sports" as ExerciseType, emoji: "⚽", label: t.exercise.sports },
    { value: "other" as ExerciseType, emoji: "💪", label: t.exercise.other },
  ], [t]);

  if (!dateString) return null;

  const dateLocale = language === "en" ? enUS : nl;
  const formattedDate = format(parseISO(dateString), "EEEE d MMMM yyyy", {
    locale: dateLocale,
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
      <DialogHeader className="sticky top-0 bg-background pb-4 -mt-2 pt-2 z-10">
        <DialogTitle className="capitalize">{formattedDate}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Period Toggle */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t.cycle.period}</label>
          <Button
            variant={isPeriod ? "default" : "outline"}
            onClick={onTogglePeriod}
            className={cn(isPeriod && "bg-red-500 hover:bg-red-600")}
          >
            {isPeriod
              ? t.dayDetail.periodClickToRemove
              : t.dayDetail.markAsPeriod}
          </Button>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t.dayDetail.mood}</label>
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
          <label className="text-sm font-medium mb-2 block">{t.dayDetail.painLevel}</label>
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
            {t.dayDetail.energyLevel}: {localEnergy ? energyLabels[localEnergy] : t.common.notSet}
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
              <span>{t.common.low}</span>
              <span>{t.common.high}</span>
            </div>
          </div>
        </div>

        {/* Nutrition Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t.dayDetail.nutritionToday}</label>
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
          <label className="text-sm font-medium mb-2 block">{t.dayDetail.exerciseToday}</label>
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
                {t.exercise.duration}: {localExerciseMinutes ?? 30} {t.common.minutes}
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
                <span>3 {t.common.hours}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t.dayDetail.notes}</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.dayDetail.notesPlaceholder}
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 sticky bottom-0 bg-background pb-2 -mb-2">
          <Button onClick={handleSave} className="w-full sm:w-auto">{t.common.save}</Button>
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
