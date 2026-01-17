"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Recipe {
  name: string;
  emoji: string;
  ingredients: string[];
  description: string;
}

interface Phase {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  recipes: Recipe[];
}

interface RecipesViewProps {
  currentCycleDay: number | null;
  cycleLength: number;
}

function getAllPhaseRecipes(cycleLength: number): Phase[] {
  return [
    {
      name: "Menstruatie",
      emoji: "🌙",
      color: "text-red-700",
      bgColor: "bg-red-50",
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
          name: "Chocolade-bananensmoothie",
          emoji: "🍫",
          ingredients: ["Banaan", "Cacao", "Spinazie", "Amandelmelk", "Dadels"],
          description: "Zoet maar gezond. Magnesium helpt tegen krampen.",
        },
      ],
    },
    {
      name: "Folliculaire fase",
      emoji: "🌱",
      color: "text-green-700",
      bgColor: "bg-green-50",
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
    },
    {
      name: "Ovulatie",
      emoji: "☀️",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
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
    },
    {
      name: "Vroege luteale fase",
      emoji: "🍂",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
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
    },
    {
      name: "Late luteale fase",
      emoji: "🌧️",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
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
    },
  ];
}

function getCurrentPhaseName(cycleDay: number, cycleLength: number): string {
  const ovulationDay = Math.round(cycleLength / 2);

  if (cycleDay <= 5) return "Menstruatie";
  if (cycleDay <= ovulationDay - 2) return "Folliculaire fase";
  if (cycleDay <= ovulationDay + 2) return "Ovulatie";
  if (cycleDay <= ovulationDay + 7) return "Vroege luteale fase";
  return "Late luteale fase";
}

export function RecipesView({ currentCycleDay, cycleLength }: RecipesViewProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const allPhases = useMemo(() => getAllPhaseRecipes(cycleLength), [cycleLength]);

  const currentPhaseName = useMemo(() => {
    if (!currentCycleDay) return null;
    return getCurrentPhaseName(currentCycleDay, cycleLength);
  }, [currentCycleDay, cycleLength]);

  const filteredPhases = selectedPhase
    ? allPhases.filter(p => p.name === selectedPhase)
    : allPhases;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recepten</h1>
        <p className="text-muted-foreground">Recepten afgestemd op elke fase van je cyclus</p>
      </div>

      {/* Phase Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPhase(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedPhase === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Alle fases
            </button>
            {allPhases.map((phase) => (
              <button
                key={phase.name}
                onClick={() => setSelectedPhase(phase.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                  selectedPhase === phase.name
                    ? "bg-primary text-primary-foreground"
                    : `${phase.bgColor} ${phase.color} hover:opacity-80`
                )}
              >
                <span>{phase.emoji}</span>
                <span>{phase.name}</span>
                {currentPhaseName === phase.name && (
                  <span className="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded">Nu</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      {filteredPhases.map((phase) => (
        <div key={phase.name} className="space-y-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${phase.bgColor}`}>
            <span className="text-2xl">{phase.emoji}</span>
            <h2 className={`text-lg font-semibold ${phase.color}`}>
              {phase.name}
              {currentPhaseName === phase.name && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Huidige fase
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phase.recipes.map((recipe, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className={`${phase.bgColor} pb-3`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{recipe.emoji}</span>
                    <CardTitle className={`text-lg ${phase.color}`}>{recipe.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-sm mb-4">
                    {recipe.description}
                  </CardDescription>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Ingrediënten</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredients.map((ingredient, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-md text-xs ${phase.bgColor} ${phase.color}`}
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
