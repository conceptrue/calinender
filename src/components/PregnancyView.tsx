"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { FertilityDayDetail } from "@/components/FertilityDayDetail";
import {
  Baby,
  Calendar,
  Apple,
  Dumbbell,
  Heart,
  Moon,
  Droplets,
  Pill,
  ThermometerSun,
  Clock,
  Fish,
  Egg,
  Leaf,
  AlertCircle,
} from "lucide-react";
import type { FertilityDay, Period, CervicalMucus, OvulationTest } from "@/types";

interface PregnancyViewProps {
  currentCycleDay: number | null;
  cycleLength: number;
  fertility: FertilityDay[];
  periods: Period[];
  getFertilityForDate: (dateString: string) => FertilityDay | null;
  updateFertility: (
    dateString: string,
    updates: {
      temperature?: number | null;
      cervicalMucus?: CervicalMucus;
      ovulationTest?: OvulationTest;
      intercourse?: boolean;
      supplements?: boolean;
      notes?: string;
    }
  ) => void;
}

interface FertilityTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface NutrientInfo {
  name: string;
  benefit: string;
  sources: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface ExerciseInfo {
  name: string;
  benefit: string;
  frequency: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fertilityTips: FertilityTip[] = [
  {
    icon: Calendar,
    title: "Ken je vruchtbare dagen",
    description:
      "Je bent het meest vruchtbaar rond de ovulatie (dag 12-16 van een 28-daagse cyclus). De eicel leeft 12-24 uur, zaadcellen tot 5 dagen.",
  },
  {
    icon: ThermometerSun,
    title: "Meet je basale lichaamstemperatuur",
    description:
      "Na de ovulatie stijgt je temperatuur met 0.2-0.5°C. Meet elke ochtend voor het opstaan om je ovulatie te voorspellen.",
  },
  {
    icon: Droplets,
    title: "Let op cervixslijm",
    description:
      "Rond de ovulatie wordt het slijm helder, elastisch en lijkt op rauw eiwit. Dit is je meest vruchtbare periode.",
  },
  {
    icon: Clock,
    title: "Timing is belangrijk",
    description:
      "Heb regelmatig gemeenschap (elke 2-3 dagen) tijdens je vruchtbare venster, vooral de 2-3 dagen vóór de ovulatie.",
  },
  {
    icon: Moon,
    title: "Prioriteer slaap",
    description:
      "7-9 uur slaap per nacht ondersteunt hormoonbalans en vruchtbaarheid. Vermijd schermtijd voor het slapen.",
  },
  {
    icon: Heart,
    title: "Verminder stress",
    description:
      "Chronische stress kan de ovulatie verstoren. Probeer yoga, meditatie of ademhalingsoefeningen.",
  },
];

const nutrients: NutrientInfo[] = [
  {
    name: "Foliumzuur",
    benefit: "Essentieel voor de ontwikkeling van de neurale buis. Start minimaal 1 maand voor conceptie.",
    sources: ["Donkergroene bladgroenten", "Linzen", "Asperges", "Broccoli", "Sinaasappels"],
    icon: Leaf,
  },
  {
    name: "IJzer",
    benefit: "Ondersteunt de bloedaanmaak en voorkomt bloedarmoede tijdens zwangerschap.",
    sources: ["Rood vlees", "Spinazie", "Kikkererwten", "Pompoenpitten", "Quinoa"],
    icon: Droplets,
  },
  {
    name: "Omega-3 vetzuren",
    benefit: "Belangrijk voor de hersenontwikkeling van de baby en hormoonbalans.",
    sources: ["Vette vis (zalm, makreel)", "Walnoten", "Chiazaad", "Lijnzaad"],
    icon: Fish,
  },
  {
    name: "Vitamine D",
    benefit: "Ondersteunt de hormoonproductie en immuunsysteem.",
    sources: ["Zonlicht", "Vette vis", "Eieren", "Verrijkte zuivel"],
    icon: ThermometerSun,
  },
  {
    name: "Zink",
    benefit: "Cruciaal voor eicelkwaliteit en hormoonregulatie.",
    sources: ["Oesters", "Rundvlees", "Pompoenpitten", "Cashewnoten", "Kikkererwten"],
    icon: Egg,
  },
  {
    name: "Vitamine B12",
    benefit: "Belangrijk voor DNA-synthese en zenuwstelsel.",
    sources: ["Vlees", "Vis", "Eieren", "Zuivelproducten"],
    icon: Pill,
  },
];

const exercises: ExerciseInfo[] = [
  {
    name: "Wandelen",
    benefit: "Verbetert de bloedcirculatie naar de baarmoeder zonder overbelasting.",
    frequency: "30 minuten, 5x per week",
    icon: Dumbbell,
  },
  {
    name: "Yoga",
    benefit: "Vermindert stress, verbetert flexibiliteit en ondersteunt hormoonbalans.",
    frequency: "2-3x per week",
    icon: Heart,
  },
  {
    name: "Zwemmen",
    benefit: "Laag-impact cardio die het hele lichaam traint zonder gewrichten te belasten.",
    frequency: "2-3x per week",
    icon: Droplets,
  },
  {
    name: "Lichte krachttraining",
    benefit: "Verbetert insulinegevoeligheid en hormoonbalans.",
    frequency: "2x per week, matige gewichten",
    icon: Dumbbell,
  },
  {
    name: "Pilates",
    benefit: "Versterkt de core en bekkenbodemspieren.",
    frequency: "2-3x per week",
    icon: Heart,
  },
];

const avoidList = [
  "Alcohol - vermindert vruchtbaarheid bij beide partners",
  "Roken - schaadt eicel- en zaadcelkwaliteit",
  "Overmatig cafeïne - max 200mg per dag (2 kopjes koffie)",
  "Intensieve sport - kan de ovulatie verstoren",
  "Transvetten - negatief effect op ovulatie",
  "Bewerkte voeding - verstoort hormoonbalans",
  "Stress - kan de menstruatiecyclus beïnvloeden",
];

export function PregnancyView({
  currentCycleDay,
  cycleLength,
  fertility,
  periods,
  getFertilityForDate,
  updateFertility,
}: PregnancyViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getFertileWindow = () => {
    const ovulationDay = Math.round(cycleLength - 14);
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;
    return { ovulationDay, fertileStart, fertileEnd };
  };

  const { ovulationDay, fertileStart, fertileEnd } = getFertileWindow();

  const isInFertileWindow =
    currentCycleDay !== null &&
    currentCycleDay >= fertileStart &&
    currentCycleDay <= fertileEnd;

  const isOvulationDay = currentCycleDay === ovulationDay;

  const handleDayClick = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleUpdateFertility = useCallback(
    (updates: Parameters<typeof updateFertility>[1]) => {
      if (selectedDate) {
        updateFertility(selectedDate, updates);
      }
    },
    [selectedDate, updateFertility]
  );

  const selectedFertilityData = selectedDate ? getFertilityForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Baby className="w-7 h-7 text-pink-500" />
          Zwanger worden
        </h1>
        <p className="text-muted-foreground">
          Tips en advies voor een gezonde conceptie
        </p>
      </div>

      {/* Fertility Status Card */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Jouw vruchtbare venster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Huidige cyclusdag</p>
              <p className="text-3xl font-bold text-pink-600">
                {currentCycleDay ?? "—"}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Vruchtbare dagen</p>
              <p className="text-3xl font-bold text-green-600">
                {fertileStart} - {fertileEnd}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Ovulatie (geschat)</p>
              <p className="text-3xl font-bold text-purple-600">Dag {ovulationDay}</p>
            </div>
          </div>

          {currentCycleDay !== null && (
            <div className="mt-4">
              {isOvulationDay ? (
                <Badge className="bg-purple-500 text-white text-sm px-4 py-2">
                  Vandaag is je geschatte ovulatiedag - maximale vruchtbaarheid!
                </Badge>
              ) : isInFertileWindow ? (
                <Badge className="bg-green-500 text-white text-sm px-4 py-2">
                  Je bent in je vruchtbare venster - goede kans op conceptie
                </Badge>
              ) : currentCycleDay < fertileStart ? (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Je vruchtbare venster begint over {fertileStart - currentCycleDay} dagen
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Je vruchtbare venster is voorbij - volgende cyclus proberen
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fertility Tracking Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Vruchtbaarheid bijhouden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Klik op een dag om temperatuur, cervixslijm, ovulatietests en andere gegevens bij te houden.
          </p>
          <FertilityCalendar
            fertility={fertility}
            periods={periods}
            fertileStart={fertileStart}
            fertileEnd={fertileEnd}
            ovulationDay={ovulationDay}
            currentCycleDay={currentCycleDay}
            onDayClick={handleDayClick}
          />
        </CardContent>
      </Card>

      {/* Fertility Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Tips voor optimale vruchtbaarheid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fertilityTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-pink-500" />
                    <h3 className="font-medium">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            Voeding voor vruchtbaarheid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Een gebalanceerd dieet rijk aan deze voedingsstoffen ondersteunt je
            vruchtbaarheid en bereidt je lichaam voor op een gezonde zwangerschap.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutrients.map((nutrient, index) => {
              const Icon = nutrient.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">{nutrient.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {nutrient.benefit}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {nutrient.sources.map((source, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            Beweging voor vruchtbaarheid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Matige beweging verbetert de bloedcirculatie, hormoonbalans en algemene
            gezondheid. Vermijd echter overtraining, wat de ovulatie kan verstoren.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise, index) => {
              const Icon = exercise.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">{exercise.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exercise.benefit}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {exercise.frequency}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* What to Avoid */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-5 h-5" />
            Wat te vermijden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {avoidList.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Supplements Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Pill className="w-5 h-5" />
            Aanbevolen supplementen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Foliumzuur</h3>
              <p className="text-sm text-muted-foreground">
                400-800 mcg per dag. Start minimaal 1 maand vóór conceptie en
                continueer tot 12 weken zwangerschap.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Vitamine D</h3>
              <p className="text-sm text-muted-foreground">
                10-25 mcg per dag. Vooral belangrijk in de wintermaanden of bij
                weinig zonblootstelling.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Omega-3</h3>
              <p className="text-sm text-muted-foreground">
                250-500 mg DHA per dag. Kies voor algenolie als vegetarisch
                alternatief voor visolie.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Prenatale multivitamine</h3>
              <p className="text-sm text-muted-foreground">
                Een complete prenatale multivitamine vult eventuele tekorten aan
                en ondersteunt een gezonde zwangerschap.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Raadpleeg altijd je arts of verloskundige voordat je supplementen gaat gebruiken.
          </p>
        </CardContent>
      </Card>

      {/* Fertility Day Detail Dialog */}
      <FertilityDayDetail
        dateString={selectedDate}
        fertilityData={selectedFertilityData}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateFertility}
      />
    </div>
  );
}
