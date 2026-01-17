"use client";

import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DaySymptom } from "@/types";

type ViewType = "plan" | "fases" | "recent" | "calendar";

interface NutritionOverviewProps {
  symptoms: DaySymptom[];
  onDayClick: (dateString: string) => void;
  currentCycleDay: number | null;
  cycleLength: number;
}

const nutritionConfig: Record<string, { emoji: string; label: string; color: string }> = {
  healthy: { emoji: "🥗", label: "Gezond", color: "bg-green-100 text-green-800" },
  balanced: { emoji: "🍽️", label: "Normaal", color: "bg-gray-100 text-gray-800" },
  unhealthy: { emoji: "🍕", label: "Ongezond", color: "bg-orange-100 text-orange-800" },
  cravings: { emoji: "🍫", label: "Cravings", color: "bg-purple-100 text-purple-800" },
};

interface Recipe {
  name: string;
  emoji: string;
  ingredients: string[];
  description: string;
}

interface NutritionPhase {
  name: string;
  emoji: string;
  focus: string;
  color: string;
  bgColor: string;
  description: string;
  recommended: string[];
  avoid: string[];
  tips: string[];
  recipes: Recipe[];
}

function getNutritionPhase(cycleDay: number, cycleLength: number): NutritionPhase {
  const ovulationDay = Math.round(cycleLength / 2);

  // Menstruatie (dag 1-5)
  if (cycleDay <= 5) {
    return {
      name: "Menstruatie",
      emoji: "🌙",
      focus: "IJzer & Herstel",
      color: "text-red-700",
      bgColor: "bg-red-50",
      description: "Focus op ijzerrijke voeding om bloedverlies te compenseren. Warm, voedzaam eten helpt.",
      recommended: [
        "🥩 Rood vlees / lever",
        "🥬 Spinazie & bladgroenten",
        "🫘 Linzen & bonen",
        "🍫 Pure chocolade",
        "🍵 Gemberthee",
        "🐟 Vette vis (zalm)",
      ],
      avoid: [
        "🧂 Zout (vocht vasthouden)",
        "☕ Te veel cafeïne",
        "🍷 Alcohol",
        "🍬 Geraffineerde suiker",
      ],
      tips: [
        "Combineer ijzer met vitamine C voor betere opname",
        "Warme soepen en stoofpotten zijn ideaal",
        "Magnesiumrijk voedsel helpt tegen krampen",
      ],
      recipes: [
        {
          name: "Spinazie-linzensoep",
          emoji: "🥣",
          ingredients: ["Rode linzen", "Spinazie", "Tomaten", "Gember", "Knoflook", "Komijn"],
          description: "Verwarmende soep vol ijzer. Voeg citroensap toe voor vitamine C.",
        },
        {
          name: "Zalm met bietensalade",
          emoji: "🐟",
          ingredients: ["Zalmfilet", "Rode biet", "Rucola", "Walnoten", "Geitenkaas"],
          description: "Omega-3 en ijzer in één gerecht. Perfect voor herstel.",
        },
        {
          name: "Chocolade-bananensmothie",
          emoji: "🍫",
          ingredients: ["Banaan", "Cacao", "Spinazie", "Amandelmelk", "Dadels"],
          description: "Zoet maar gezond. Magnesium helpt tegen krampen.",
        },
      ],
    };
  }

  // Folliculaire fase (dag 6 tot ovulatie)
  if (cycleDay <= ovulationDay - 2) {
    return {
      name: "Folliculaire fase",
      emoji: "🌱",
      focus: "Energie & Groei",
      color: "text-green-700",
      bgColor: "bg-green-50",
      description: "Je metabolisme versnelt. Ideaal moment voor lichtere, frisse maaltijden met veel eiwitten.",
      recommended: [
        "🥚 Eieren",
        "🥗 Verse salades",
        "🍗 Magere eiwitten",
        "🥑 Avocado",
        "🫐 Bessen",
        "🥜 Noten & zaden",
      ],
      avoid: [
        "🍟 Gefrituurde voeding",
        "🥤 Suikerhoudende dranken",
      ],
      tips: [
        "Probiotische voeding ondersteunt oestrogeenbalans",
        "Gefermenteerde groenten zijn nu extra goed",
        "Lichte, kleurrijke maaltijden passen bij je energie",
      ],
      recipes: [
        {
          name: "Poké bowl met kip",
          emoji: "🥗",
          ingredients: ["Kipfilet", "Sushi rijst", "Avocado", "Edamame", "Komkommer", "Sesamzaad"],
          description: "Lichte, eiwitrijke bowl vol energie voor actieve dagen.",
        },
        {
          name: "Shakshuka",
          emoji: "🥚",
          ingredients: ["Eieren", "Tomaten", "Paprika", "Ui", "Komijn", "Feta"],
          description: "Mediterraans ontbijt vol eiwitten en groenten.",
        },
        {
          name: "Bessen-yoghurt parfait",
          emoji: "🫐",
          ingredients: ["Griekse yoghurt", "Gemengde bessen", "Granola", "Honing", "Chiazaad"],
          description: "Probiotica en antioxidanten voor hormoonbalans.",
        },
      ],
    };
  }

  // Ovulatie (rond dag 14)
  if (cycleDay <= ovulationDay + 2) {
    return {
      name: "Ovulatie",
      emoji: "☀️",
      focus: "Antioxidanten & Vezels",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      description: "Je bent op je piek! Ondersteun je lever met vezelrijk voedsel voor hormoonbalans.",
      recommended: [
        "🥦 Kruisbloemige groenten",
        "🫑 Paprika & tomaten",
        "🍓 Vers fruit",
        "🌾 Volkoren granen",
        "🥒 Komkommer & selderij",
        "💧 Extra water",
      ],
      avoid: [
        "🍖 Vet vlees",
        "🧀 Volle zuivel",
        "🍺 Alcohol",
      ],
      tips: [
        "Vezels helpen overtollig oestrogeen af te voeren",
        "Drink extra water voor optimale hydratatie",
        "Rauwe groenten ondersteunen je energie",
      ],
      recipes: [
        {
          name: "Rainbow salade",
          emoji: "🥗",
          ingredients: ["Broccoli", "Rode kool", "Wortel", "Paprika", "Quinoa", "Citroendressing"],
          description: "Kleurrijke salade vol vezels en antioxidanten.",
        },
        {
          name: "Groene smoothie bowl",
          emoji: "🥬",
          ingredients: ["Boerenkool", "Mango", "Banaan", "Kokoswater", "Chiazaad", "Kokos"],
          description: "Detox smoothie die je lever ondersteunt.",
        },
        {
          name: "Geroosterde bloemkoolsteak",
          emoji: "🥦",
          ingredients: ["Bloemkool", "Kurkuma", "Tahini", "Granaatappel", "Peterselie"],
          description: "Kruisbloemige groente die oestrogeen balanceert.",
        },
      ],
    };
  }

  // Vroege luteale fase (na ovulatie, eerste helft)
  if (cycleDay <= ovulationDay + 7) {
    return {
      name: "Vroege luteale fase",
      emoji: "🍂",
      focus: "Complexe Koolhydraten",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      description: "Progesteron stijgt. Complexe koolhydraten helpen je bloedsuiker stabiel te houden.",
      recommended: [
        "🍠 Zoete aardappel",
        "🍚 Bruine rijst",
        "🥣 Havermout",
        "🍌 Banaan",
        "🥜 Pindakaas",
        "🫘 Kikkererwten",
      ],
      avoid: [
        "🍭 Snoep & koekjes",
        "🥐 Wit brood",
        "🍿 Gezouten snacks",
      ],
      tips: [
        "Eet regelmatig om bloedsuikerdips te voorkomen",
        "B-vitamines ondersteunen je stemming",
        "Magnesium helpt tegen vroege PMS-klachten",
      ],
      recipes: [
        {
          name: "Zoete aardappel curry",
          emoji: "🍠",
          ingredients: ["Zoete aardappel", "Kikkererwten", "Kokosmelk", "Spinazie", "Curry", "Gember"],
          description: "Comfortfood met complexe koolhydraten en eiwitten.",
        },
        {
          name: "Overnight oats",
          emoji: "🥣",
          ingredients: ["Havermout", "Amandelmelk", "Chiazaad", "Banaan", "Pindakaas", "Kaneel"],
          description: "Makkelijk ontbijt dat bloedsuiker stabiel houdt.",
        },
        {
          name: "Buddha bowl",
          emoji: "🍚",
          ingredients: ["Bruine rijst", "Hummus", "Geroosterde groenten", "Avocado", "Tahini"],
          description: "Voedzame bowl met langzame koolhydraten.",
        },
      ],
    };
  }

  // Late luteale fase (PMS periode)
  return {
    name: "Late luteale fase",
    emoji: "🌧️",
    focus: "Anti-inflammatoir & Comfort",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    description: "PMS-periode. Focus op ontstekingsremmend voedsel en geef toe aan gezonde cravings.",
    recommended: [
      "🍫 Pure chocolade (70%+)",
      "🐟 Vette vis (omega-3)",
      "🥬 Bladgroenten",
      "🍵 Kamillethee",
      "🥜 Walnoten",
      "🫚 Kurkuma & gember",
    ],
    avoid: [
      "🧂 Zout (opgeblazen gevoel)",
      "☕ Te veel cafeïne",
      "🍷 Alcohol",
      "🍬 Suiker (stemmingswisselingen)",
    ],
    tips: [
      "Pure chocolade (met mate) is prima bij cravings",
      "Omega-3 helpt tegen stemmingswisselingen",
      "Vermijd zout om opgeblazen gevoel te beperken",
    ],
    recipes: [
      {
        name: "Gouden melk",
        emoji: "🍵",
        ingredients: ["Amandelmelk", "Kurkuma", "Gember", "Kaneel", "Honing", "Zwarte peper"],
        description: "Ontstekingsremmende warme drank voor ontspanning.",
      },
      {
        name: "Zalm met groenten",
        emoji: "🐟",
        ingredients: ["Zalmfilet", "Broccoli", "Asperges", "Citroen", "Dille", "Olijfolie"],
        description: "Omega-3 rijke maaltijd die stemming ondersteunt.",
      },
      {
        name: "Chocolade energy balls",
        emoji: "🍫",
        ingredients: ["Dadels", "Cacao", "Walnoten", "Havermout", "Kokos", "Zeezout"],
        description: "Gezonde snack voor chocolade cravings.",
      },
    ],
  };
}

export function NutritionOverview({ symptoms, onDayClick, currentCycleDay, cycleLength }: NutritionOverviewProps) {
  const [activeTab, setActiveTab] = useState<ViewType>("plan");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, DaySymptom>();
    symptoms.forEach((s) => map.set(s.date, s));
    return map;
  }, [symptoms]);

  const recentNutrition = useMemo(() => {
    return [...symptoms]
      .filter((s) => s.nutrition)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [symptoms]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const currentPhase = useMemo(() => {
    if (!currentCycleDay) return null;
    return getNutritionPhase(currentCycleDay, cycleLength);
  }, [currentCycleDay, cycleLength]);

  const allPhases = useMemo(() => {
    // Bereken representatieve dagen voor elke fase
    const ovulationDay = Math.round(cycleLength / 2);
    return [
      { day: 3, phase: getNutritionPhase(3, cycleLength) },
      { day: ovulationDay - 4, phase: getNutritionPhase(ovulationDay - 4, cycleLength) },
      { day: ovulationDay, phase: getNutritionPhase(ovulationDay, cycleLength) },
      { day: ovulationDay + 4, phase: getNutritionPhase(ovulationDay + 4, cycleLength) },
      { day: cycleLength - 3, phase: getNutritionPhase(cycleLength - 3, cycleLength) },
    ];
  }, [cycleLength]);

  const renderPlanView = () => {
    if (!currentCycleDay || !currentPhase) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Registreer eerst een periode om je voedingsplan te zien.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Current Phase Card */}
        <div className={`rounded-lg p-4 ${currentPhase.bgColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentPhase.emoji}</span>
            <div>
              <h4 className={`font-semibold ${currentPhase.color}`}>{currentPhase.name}</h4>
              <p className="text-sm text-muted-foreground">Dag {currentCycleDay} van je cyclus</p>
            </div>
          </div>
          <p className="text-sm mb-3">{currentPhase.description}</p>

          <div className="text-sm">
            <span className="text-muted-foreground">Focus:</span>
            <span className={`ml-1 font-medium ${currentPhase.color}`}>{currentPhase.focus}</span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-green-700 mb-2">✓ Aanbevolen voeding</h4>
          <div className="flex flex-wrap gap-2">
            {currentPhase.recommended.map((item) => (
              <span key={item} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        {currentPhase.avoid.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-red-700 mb-2">✗ Beperk of vermijd</h4>
            <div className="flex flex-wrap gap-2">
              {currentPhase.avoid.map((item) => (
                <span key={item} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-blue-700 mb-2">💡 Tips</h4>
          <ul className="space-y-1">
            {currentPhase.tips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Weekly Overview */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Komende 7 dagen</h4>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const futureDay = currentCycleDay + offset;
              const adjustedDay = futureDay > cycleLength ? futureDay - cycleLength : futureDay;
              const phase = getNutritionPhase(adjustedDay, cycleLength);
              const date = new Date();
              date.setDate(date.getDate() + offset);

              return (
                <div key={offset} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-muted-foreground">
                      {offset === 0 ? "Vandaag" : format(date, "EEE d", { locale: nl })}
                    </span>
                    <span>{phase.emoji}</span>
                    <span className={phase.color}>{phase.name}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{phase.focus}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFasesView = () => {
    return (
      <div className="space-y-4">
        {allPhases.map(({ phase }, index) => {
          const isCurrentPhase = currentPhase?.name === phase.name;

          return (
            <div
              key={phase.name}
              className={cn(
                "rounded-lg border overflow-hidden",
                isCurrentPhase && "ring-2 ring-primary"
              )}
            >
              {/* Phase Header */}
              <div className={`p-4 ${phase.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{phase.emoji}</span>
                    <div>
                      <h4 className={`font-semibold ${phase.color}`}>
                        {phase.name}
                        {isCurrentPhase && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Nu
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">Focus: {phase.focus}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">{phase.description}</p>
              </div>

              {/* Phase Content */}
              <div className="p-4 space-y-3">
                {/* Recommended */}
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">✓ Aanbevolen</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.recommended.map((item) => (
                      <span key={item} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Avoid */}
                {phase.avoid.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-2">✗ Vermijd</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.avoid.map((item) => (
                        <span key={item} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2">💡 Tips</h5>
                  <ul className="space-y-1">
                    {phase.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-blue-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecentView = () => {
    if (recentNutrition.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Nog geen voeding geregistreerd.</p>
          <p className="text-sm mt-1">Klik op een dag om te beginnen.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentNutrition.map((symptom) => {
          const nutrition = symptom.nutrition ? nutritionConfig[symptom.nutrition] : null;
          if (!nutrition) return null;

          return (
            <button
              key={symptom.date}
              onClick={() => onDayClick(symptom.date)}
              className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
            >
              <span className="font-medium text-sm">
                {format(parseISO(symptom.date), "EEE d MMM", { locale: nl })}
              </span>
              <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm ${nutrition.color}`}>
                {nutrition.emoji} {nutrition.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: nl })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
        {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((date) => {
          const dateString = format(date, "yyyy-MM-dd");
          const symptom = symptomsByDate.get(dateString);
          const nutrition = symptom?.nutrition ? nutritionConfig[symptom.nutrition] : null;

          return (
            <button
              key={dateString}
              onClick={() => onDayClick(dateString)}
              className="flex flex-col items-center py-1 hover:bg-muted/50 rounded transition-colors"
            >
              <span className="text-xs text-muted-foreground mb-1">
                {date.getDate()}
              </span>
              {nutrition ? (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${nutrition.color}`}>
                  {nutrition.emoji}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {Object.entries(nutritionConfig).map(([key, config]) => (
          <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
            {config.emoji} {config.label}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveTab("plan")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "plan"
              ? "bg-primary text-primary-foreground"
              : "bg-green-50 text-green-700 hover:opacity-80"
          )}
        >
          <span>📋</span>
          <span>Plan</span>
        </button>
        <button
          onClick={() => setActiveTab("fases")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "fases"
              ? "bg-primary text-primary-foreground"
              : "bg-purple-50 text-purple-700 hover:opacity-80"
          )}
        >
          <span>🔄</span>
          <span>Fases</span>
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "recent"
              ? "bg-primary text-primary-foreground"
              : "bg-blue-50 text-blue-700 hover:opacity-80"
          )}
        >
          <span>🍽️</span>
          <span>Voeding</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-orange-50 text-orange-700 hover:opacity-80"
          )}
        >
          <span>📅</span>
          <span>Kalender</span>
        </button>
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4">
        {activeTab === "plan" && renderPlanView()}
        {activeTab === "fases" && renderFasesView()}
        {activeTab === "recent" && renderRecentView()}
        {activeTab === "calendar" && renderCalendarView()}
      </div>
    </div>
  );
}
