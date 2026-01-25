"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Clock, Users, ChevronRight, X, Check } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import type { Translations } from "@/i18n/types";

interface Recipe {
  name: string;
  emoji: string;
  ingredients: string[];
  description: string;
  prepTime: string;
  servings: number;
  steps: string[];
  tip?: string;
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

function getAllPhaseRecipes(cycleLength: number, t: Translations): Phase[] {
  return [
    {
      name: t.phases.menstruation,
      emoji: "🌙",
      color: "text-red-700",
      bgColor: "bg-red-50",
      recipes: [
        {
          name: "Spinazie-linzensoep",
          emoji: "🥣",
          ingredients: ["200g rode linzen", "200g spinazie", "400g tomatenblokjes", "1 stuk gember (2cm)", "3 teentjes knoflook", "1 tl komijn", "1 ui", "1L groentebouillon", "Citroensap"],
          description: "Verwarmende soep vol ijzer. Voeg citroensap toe voor vitamine C.",
          prepTime: "25 min",
          servings: 4,
          steps: [
            "Snipper de ui en bak glazig in een grote pan met olijfolie",
            "Voeg de fijngehakte knoflook en geraspte gember toe, bak 1 minuut mee",
            "Roer de komijn erdoor en bak 30 seconden",
            "Voeg de tomatenblokjes, linzen en bouillon toe",
            "Breng aan de kook en laat 15-20 minuten zachtjes koken tot de linzen gaar zijn",
            "Roer de spinazie erdoor tot deze geslonken is",
            "Breng op smaak met zout, peper en een scheut citroensap",
            "Serveer met een scheutje olijfolie en eventueel brood"
          ],
          tip: "De vitamine C uit de citroen helpt je lichaam het ijzer beter op te nemen!"
        },
        {
          name: "Zalm met bietensalade",
          emoji: "🐟",
          ingredients: ["2 zalmfilets", "300g gekookte rode biet", "100g rucola", "50g walnoten", "100g geitenkaas", "2 el balsamico", "3 el olijfolie", "Zout en peper"],
          description: "Omega-3 en ijzer in één gerecht. Perfect voor herstel.",
          prepTime: "20 min",
          servings: 2,
          steps: [
            "Verwarm de oven voor op 200°C",
            "Dep de zalmfilets droog en breng op smaak met zout en peper",
            "Leg de zalm op een bakplaat en bak 12-15 minuten in de oven",
            "Snijd de bieten in blokjes",
            "Rooster de walnoten kort in een droge pan",
            "Maak een dressing van balsamico en olijfolie",
            "Verdeel de rucola over de borden, leg de bieten erop",
            "Verkruimel de geitenkaas erover en strooi de walnoten erover",
            "Leg de zalm ernaast en besprenkel met de dressing"
          ],
          tip: "Biet is een uitstekende bron van ijzer en foliumzuur."
        },
        {
          name: "Chocolade-bananensmoothie",
          emoji: "🍫",
          ingredients: ["2 rijpe bananen (bevroren)", "2 el cacao poeder", "Handvol spinazie", "300ml amandelmelk", "4 dadels (ontpit)", "1 el pindakaas (optioneel)"],
          description: "Zoet maar gezond. Magnesium helpt tegen krampen.",
          prepTime: "5 min",
          servings: 2,
          steps: [
            "Doe alle ingrediënten in een blender",
            "Blend tot een gladde smoothie",
            "Voeg eventueel meer amandelmelk toe voor een dunnere consistentie",
            "Schenk in glazen en serveer direct"
          ],
          tip: "Bevries je bananen in stukjes voor een extra romige smoothie!"
        },
        {
          name: "Rundvlees stoofpot",
          emoji: "🥘",
          ingredients: ["400g runderstoofvlees", "3 wortels", "2 aardappels", "1 ui", "2 teentjes knoflook", "500ml runderbouillon", "2 el tomatenpuree", "Tijm", "Laurier"],
          description: "Hartverwarmende stoofpot rijk aan ijzer en B12.",
          prepTime: "2 uur",
          servings: 4,
          steps: [
            "Snijd het vlees in blokjes en dep droog",
            "Bak het vlees rondom bruin in een braadpan",
            "Haal het vlees eruit en fruit de ui en knoflook",
            "Voeg tomatenpuree toe en roer 1 minuut",
            "Doe het vlees terug en voeg bouillon, tijm en laurier toe",
            "Laat 1,5 uur sudderen op laag vuur",
            "Voeg de groenten toe en kook nog 30 minuten",
            "Breng op smaak met zout en peper"
          ],
          tip: "Rundvlees is een van de beste bronnen van heemijzer, dat makkelijk wordt opgenomen."
        },
        {
          name: "Warme havermout met kaneel",
          emoji: "🥣",
          ingredients: ["80g havermout", "250ml melk", "1 banaan", "1 tl kaneel", "1 el honing", "Handvol walnoten", "1 el lijnzaad"],
          description: "Troostend ontbijt dat energie geeft en krampen vermindert.",
          prepTime: "10 min",
          servings: 1,
          steps: [
            "Breng melk aan de kook in een pannetje",
            "Voeg havermout toe en roer goed",
            "Laat 5 minuten zachtjes koken terwijl je roert",
            "Voeg kaneel en lijnzaad toe",
            "Schep in een kom",
            "Top met plakjes banaan, walnoten en honing"
          ],
          tip: "Kaneel helpt bij het stabiliseren van je bloedsuiker en vermindert krampen."
        },
        {
          name: "Kippenlever met ui",
          emoji: "🍳",
          ingredients: ["300g kippenlever", "2 uien", "2 el boter", "1 tl tijm", "Splash cognac (optioneel)", "Zout en peper", "Peterselie"],
          description: "Supervol ijzer en B-vitamines. Traditioneel gerecht voor bloedopbouw.",
          prepTime: "20 min",
          servings: 2,
          steps: [
            "Maak de levers schoon en dep droog",
            "Snijd de uien in halve ringen",
            "Smelt boter in een pan en bak de uien zacht",
            "Haal de uien uit de pan en bak de levers op hoog vuur",
            "Voeg tijm, zout en peper toe",
            "Blus af met cognac indien gewenst",
            "Doe de uien terug in de pan",
            "Garneer met peterselie en serveer met brood"
          ],
          tip: "Kippenlever bevat 3x zoveel ijzer als spinazie!"
        },
      ],
    },
    {
      name: t.phases.follicular,
      emoji: "🌱",
      color: "text-green-700",
      bgColor: "bg-green-50",
      recipes: [
        {
          name: "Poké bowl met kip",
          emoji: "🥗",
          ingredients: ["200g kipfilet", "200g sushi rijst", "1 avocado", "100g edamame", "1 komkommer", "2 el sesamzaad", "Sojasaus", "Rijstazijn", "Sesamolie"],
          description: "Lichte, eiwitrijke bowl vol energie voor actieve dagen.",
          prepTime: "30 min",
          servings: 2,
          steps: [
            "Kook de sushi rijst volgens de verpakking, voeg een scheut rijstazijn toe",
            "Snijd de kipfilet in reepjes en bak in een pan met sesamolie",
            "Breng op smaak met sojasaus",
            "Snijd de komkommer in halve plakjes",
            "Halveer de avocado en snijd in plakjes",
            "Kook de edamame 3-4 minuten en laat uitlekken",
            "Verdeel de rijst over kommen",
            "Schik de kip, avocado, komkommer en edamame erop",
            "Bestrooi met sesamzaad en serveer met extra sojasaus"
          ],
          tip: "Edamame bevat veel plantaardige eiwitten en foliumzuur."
        },
        {
          name: "Shakshuka",
          emoji: "🥚",
          ingredients: ["4 eieren", "400g tomatenblokjes", "2 paprika's", "1 ui", "2 teentjes knoflook", "1 tl komijn", "1 tl paprikapoeder", "100g feta", "Verse peterselie"],
          description: "Mediterraans ontbijt vol eiwitten en groenten.",
          prepTime: "25 min",
          servings: 2,
          steps: [
            "Snipper de ui en snijd de paprika in stukjes",
            "Fruit de ui in een koekenpan met olijfolie",
            "Voeg de paprika en knoflook toe, bak 5 minuten mee",
            "Roer komijn en paprikapoeder erdoor",
            "Voeg de tomatenblokjes toe en laat 10 minuten pruttelen",
            "Maak 4 kuiltjes in de saus en breek de eieren erin",
            "Dek af en laat de eieren in 5-7 minuten gaar worden",
            "Verkruimel de feta erover en garneer met peterselie",
            "Serveer met brood om te dippen"
          ],
          tip: "Eieren zijn een complete eiwitbron met alle essentiële aminozuren."
        },
        {
          name: "Bessen-yoghurt parfait",
          emoji: "🫐",
          ingredients: ["400g Griekse yoghurt", "200g gemengde bessen", "100g granola", "2 el honing", "2 el chiazaad", "Verse munt"],
          description: "Probiotica en antioxidanten voor hormoonbalans.",
          prepTime: "10 min",
          servings: 2,
          steps: [
            "Meng de chiazaad door de yoghurt",
            "Pak twee glazen of kommen",
            "Begin met een laag yoghurt op de bodem",
            "Voeg een laag bessen toe",
            "Strooi wat granola erover",
            "Herhaal de lagen tot de glazen vol zijn",
            "Eindig met bessen en granola bovenop",
            "Druppel de honing erover en garneer met munt"
          ],
          tip: "Griekse yoghurt bevat probiotica die helpen bij hormoonbalans."
        },
        {
          name: "Quinoa tabbouleh",
          emoji: "🥗",
          ingredients: ["150g quinoa", "1 bos peterselie", "1 bos munt", "3 tomaten", "1 komkommer", "Sap van 2 citroenen", "4 el olijfolie", "Zout en peper"],
          description: "Frisse salade vol plantaardige eiwitten en ijzer.",
          prepTime: "25 min",
          servings: 4,
          steps: [
            "Kook de quinoa volgens de verpakking en laat afkoelen",
            "Hak de peterselie en munt fijn",
            "Snijd de tomaten en komkommer in kleine blokjes",
            "Meng alles in een grote kom",
            "Maak een dressing van citroensap, olijfolie, zout en peper",
            "Giet de dressing over de salade",
            "Meng goed en laat 15 minuten intrekken",
            "Serveer op kamertemperatuur"
          ],
          tip: "Quinoa bevat alle 9 essentiële aminozuren - perfect voor celvernieuwing."
        },
        {
          name: "Gegrilde kip met citroen",
          emoji: "🍗",
          ingredients: ["4 kipfilets", "2 citroenen", "4 teentjes knoflook", "2 el olijfolie", "1 tl oregano", "Verse rozemarijn", "Zout en peper"],
          description: "Lichte, eiwitrijke maaltijd voor energie en spieropbouw.",
          prepTime: "30 min",
          servings: 4,
          steps: [
            "Meng olijfolie, citroensap, gehakte knoflook en kruiden",
            "Marineer de kipfilets minimaal 30 minuten",
            "Verwarm een grillpan of bbq",
            "Grill de kip 6-7 minuten per kant",
            "Laat 5 minuten rusten voor het snijden",
            "Serveer met schijfjes citroen en verse kruiden"
          ],
          tip: "Kip is een magere eiwitbron die helpt bij het opbouwen van oestrogeen."
        },
        {
          name: "Groene detox salade",
          emoji: "🥬",
          ingredients: ["100g gemengde sla", "1 avocado", "100g edamame", "1 komkommer", "50g pompoenpitten", "2 el appelazijn", "3 el olijfolie", "1 tl mosterd"],
          description: "Reinigende salade die je lever ondersteunt.",
          prepTime: "15 min",
          servings: 2,
          steps: [
            "Was en droog de sla",
            "Snijd de avocado en komkommer",
            "Kook de edamame en laat afkoelen",
            "Rooster de pompoenpitten licht in een pan",
            "Maak dressing van azijn, olijfolie en mosterd",
            "Meng alle ingrediënten in een kom",
            "Besprenkel met dressing en serveer"
          ],
          tip: "De lever is extra actief in deze fase - ondersteun hem met groene groenten."
        },
      ],
    },
    {
      name: t.phases.ovulation,
      emoji: "☀️",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      recipes: [
        {
          name: "Rainbow salade",
          emoji: "🥗",
          ingredients: ["200g broccoli roosjes", "150g rode kool (geschaafd)", "2 wortels (geraspt)", "1 gele paprika", "150g quinoa", "Sap van 1 citroen", "3 el olijfolie", "1 tl honing", "Zout en peper"],
          description: "Kleurrijke salade vol vezels en antioxidanten.",
          prepTime: "25 min",
          servings: 2,
          steps: [
            "Kook de quinoa volgens de verpakking en laat afkoelen",
            "Stoom of blancheer de broccoli 3-4 minuten, moet nog knapperig zijn",
            "Snijd de paprika in dunne reepjes",
            "Maak de dressing: meng citroensap, olijfolie, honing, zout en peper",
            "Doe de quinoa in een grote kom",
            "Voeg alle groenten toe: broccoli, rode kool, wortel en paprika",
            "Giet de dressing erover en schep goed om",
            "Laat 10 minuten intrekken voor serveren"
          ],
          tip: "De vezels helpen overtollig oestrogeen af te voeren via de darmen."
        },
        {
          name: "Groene smoothie bowl",
          emoji: "🥬",
          ingredients: ["50g boerenkool", "1 mango (bevroren)", "1 banaan (bevroren)", "200ml kokoswater", "2 el chiazaad", "2 el kokosrasp", "Vers fruit voor topping"],
          description: "Detox smoothie die je lever ondersteunt.",
          prepTime: "10 min",
          servings: 1,
          steps: [
            "Doe de boerenkool, mango, banaan en kokoswater in een blender",
            "Blend tot een dikke, gladde smoothie",
            "Voeg eventueel meer kokoswater toe als het te dik is",
            "Schenk in een kom",
            "Top met chiazaad, kokosrasp en vers fruit",
            "Serveer direct"
          ],
          tip: "Boerenkool ondersteunt de lever bij het afbreken van hormonen."
        },
        {
          name: "Geroosterde bloemkoolsteak",
          emoji: "🥦",
          ingredients: ["1 grote bloemkool", "2 tl kurkuma", "3 el tahini", "50g granaatappelpitjes", "Verse peterselie", "2 el olijfolie", "1 citroen", "Zout en peper"],
          description: "Kruisbloemige groente die oestrogeen balanceert.",
          prepTime: "35 min",
          servings: 2,
          steps: [
            "Verwarm de oven voor op 200°C",
            "Snijd de bloemkool in 2-3 dikke plakken (steaks)",
            "Meng olijfolie met kurkuma, zout en peper",
            "Bestrijk de bloemkoolsteaks met dit mengsel",
            "Leg op een bakplaat en rooster 25-30 minuten tot goudbruin",
            "Meng tahini met citroensap en een beetje water tot een gladde saus",
            "Leg de bloemkoolsteaks op borden",
            "Druppel de tahini erover",
            "Garneer met granaatappelpitjes en peterselie"
          ],
          tip: "Kruisbloemige groenten bevatten stoffen die helpen oestrogeen te balanceren."
        },
        {
          name: "Gazpacho",
          emoji: "🍅",
          ingredients: ["6 rijpe tomaten", "1 komkommer", "1 rode paprika", "2 teentjes knoflook", "3 el olijfolie", "2 el rode wijnazijn", "Zeezout", "Basilicum"],
          description: "Verfrissende koude soep vol antioxidanten en lycopeen.",
          prepTime: "15 min + koelen",
          servings: 4,
          steps: [
            "Snijd de tomaten, komkommer en paprika grof",
            "Doe alles in een blender met knoflook",
            "Voeg olijfolie en azijn toe",
            "Blend tot een gladde soep",
            "Breng op smaak met zout",
            "Zet minimaal 2 uur in de koelkast",
            "Serveer koud met een scheut olijfolie en basilicum"
          ],
          tip: "Lycopeen uit tomaten is een krachtige antioxidant die beter opneembaar is met olijfolie."
        },
        {
          name: "Zeebaars met venkel",
          emoji: "🐟",
          ingredients: ["2 zeebaarsfilets", "2 venkelknollen", "1 citroen", "3 el olijfolie", "2 teentjes knoflook", "Verse dille", "Witte wijn", "Zout en peper"],
          description: "Lichte visschotel rijk aan omega-3 en antioxidanten.",
          prepTime: "30 min",
          servings: 2,
          steps: [
            "Verwarm de oven voor op 180°C",
            "Snijd de venkel in dunne plakken",
            "Leg de venkel in een ovenschaal met olijfolie en knoflook",
            "Rooster 15 minuten tot zacht",
            "Leg de vis erop, besprenkel met wijn en citroensap",
            "Bak nog 12-15 minuten tot de vis gaar is",
            "Garneer met dille en serveer"
          ],
          tip: "Venkel ondersteunt de spijsvertering en bevat fyto-oestrogenen."
        },
        {
          name: "Spruitjes met granaatappel",
          emoji: "🥬",
          ingredients: ["400g spruitjes", "100g granaatappelpitjes", "50g pecannoten", "2 el balsamico", "3 el olijfolie", "1 el honing", "Zout en peper"],
          description: "Kruisbloemige groente met zoete en zure smaken.",
          prepTime: "25 min",
          servings: 4,
          steps: [
            "Verwarm de oven voor op 200°C",
            "Halveer de spruitjes",
            "Meng met olijfolie, zout en peper",
            "Rooster 20-25 minuten tot goudbruin",
            "Rooster de pecannoten de laatste 5 minuten mee",
            "Meng balsamico met honing voor dressing",
            "Schep de spruitjes in een schaal",
            "Strooi granaatappel en noten erover, druppel dressing"
          ],
          tip: "Spruitjes zijn kampioen in het ondersteunen van een gezonde oestrogeenbalans."
        },
      ],
    },
    {
      name: t.phases.earlyLuteal,
      emoji: "🍂",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      recipes: [
        {
          name: "Zoete aardappel curry",
          emoji: "🍠",
          ingredients: ["2 zoete aardappels", "400g kikkererwten (uit blik)", "400ml kokosmelk", "200g spinazie", "2 el currypasta", "1 stuk gember (2cm)", "2 teentjes knoflook", "1 ui", "Rijst voor erbij"],
          description: "Comfortfood met complexe koolhydraten en eiwitten.",
          prepTime: "35 min",
          servings: 4,
          steps: [
            "Schil de zoete aardappels en snijd in blokjes",
            "Snipper de ui en fruit in een grote pan",
            "Voeg knoflook en geraspte gember toe",
            "Roer de currypasta erdoor en bak 1 minuut",
            "Voeg de zoete aardappel toe en roer goed",
            "Giet de kokosmelk erbij en breng aan de kook",
            "Laat 20 minuten zachtjes koken tot de aardappel gaar is",
            "Voeg de kikkererwten en spinazie toe",
            "Roer tot de spinazie geslonken is",
            "Serveer met rijst"
          ],
          tip: "Zoete aardappel heeft een lage glycemische index en houdt je bloedsuiker stabiel."
        },
        {
          name: "Overnight oats",
          emoji: "🥣",
          ingredients: ["100g havermout", "250ml amandelmelk", "2 el chiazaad", "1 banaan", "2 el pindakaas", "1 tl kaneel", "1 el maple syrup", "Toppings naar keuze"],
          description: "Makkelijk ontbijt dat bloedsuiker stabiel houdt.",
          prepTime: "5 min + nacht wachten",
          servings: 2,
          steps: [
            "Meng havermout, amandelmelk en chiazaad in een kom of pot",
            "Voeg de kaneel en maple syrup toe en roer goed",
            "Dek af en zet minimaal 6 uur (of een nacht) in de koelkast",
            "Haal de volgende ochtend uit de koelkast",
            "Snijd de banaan in plakjes",
            "Top de overnight oats met banaan, pindakaas en andere toppings",
            "Eet koud of warm kort op in de magnetron"
          ],
          tip: "Bereidt dit 's avonds voor en je hebt 's ochtends direct een gezond ontbijt klaar!"
        },
        {
          name: "Buddha bowl",
          emoji: "🍚",
          ingredients: ["150g bruine rijst", "200g hummus", "1 courgette", "1 paprika", "1 avocado", "100g kikkererwten", "3 el tahini", "Citroen", "Olijfolie"],
          description: "Voedzame bowl met langzame koolhydraten.",
          prepTime: "35 min",
          servings: 2,
          steps: [
            "Kook de bruine rijst volgens de verpakking",
            "Verwarm de oven voor op 200°C",
            "Snijd de courgette en paprika in stukken",
            "Meng met olijfolie, zout en peper",
            "Rooster 20-25 minuten in de oven",
            "Laat de kikkererwten uitlekken en rooster de laatste 10 minuten mee",
            "Snijd de avocado in plakjes",
            "Verdeel de rijst over kommen",
            "Schik de geroosterde groenten, avocado en hummus eromheen",
            "Druppel tahini erover en serveer met een partje citroen"
          ],
          tip: "Bruine rijst geeft langdurig energie door de langzame koolhydraten."
        },
        {
          name: "Pompoensoep met gember",
          emoji: "🎃",
          ingredients: ["800g pompoen", "1 ui", "2 teentjes knoflook", "3cm gember", "500ml groentebouillon", "100ml kokosmelk", "1 tl kurkuma", "Pompoenpitten", "Zout en peper"],
          description: "Verwarmende soep die bloedsuiker stabiliseert.",
          prepTime: "40 min",
          servings: 4,
          steps: [
            "Schil de pompoen en snijd in blokjes",
            "Fruit ui en knoflook in een grote pan",
            "Voeg geraspte gember en kurkuma toe",
            "Doe de pompoen erbij en roer goed",
            "Voeg bouillon toe en breng aan de kook",
            "Laat 25 minuten koken tot pompoen zacht is",
            "Blend glad en roer kokosmelk erdoor",
            "Serveer met pompoenpitten en een druppel olijfolie"
          ],
          tip: "Pompoen is rijk aan bètacaroteen en stabiliseert je bloedsuiker."
        },
        {
          name: "Linzen dahl",
          emoji: "🍛",
          ingredients: ["250g rode linzen", "400ml kokosmelk", "1 ui", "3 teentjes knoflook", "2cm gember", "2 tl garam masala", "1 tl kurkuma", "400g tomatenblokjes", "Koriander"],
          description: "Romige Indiase linzencurry vol eiwitten en vezels.",
          prepTime: "30 min",
          servings: 4,
          steps: [
            "Spoel de linzen af onder koud water",
            "Fruit de ui tot glazig",
            "Voeg knoflook, gember en specerijen toe",
            "Bak 1 minuut tot het geurt",
            "Voeg tomaten, linzen en kokosmelk toe",
            "Laat 20-25 minuten zachtjes koken",
            "Roer regelmatig en voeg water toe indien nodig",
            "Garneer met verse koriander"
          ],
          tip: "Linzen zijn een uitstekende bron van B-vitamines die je stemming ondersteunen."
        },
        {
          name: "Bananen pannenkoeken",
          emoji: "🥞",
          ingredients: ["2 rijpe bananen", "2 eieren", "50g havermout", "1/2 tl kaneel", "Snuf zout", "Kokosolie", "Bessen en honing voor topping"],
          description: "Gezonde pannenkoeken zonder toegevoegde suiker.",
          prepTime: "15 min",
          servings: 2,
          steps: [
            "Prak de bananen fijn in een kom",
            "Klop de eieren erdoor",
            "Meng havermout, kaneel en zout erdoor",
            "Laat 5 minuten rusten",
            "Verhit kokosolie in een pan",
            "Schep kleine hoopjes beslag in de pan",
            "Bak 2-3 minuten per kant tot goudbruin",
            "Serveer met verse bessen en honing"
          ],
          tip: "Bananen zijn rijk aan vitamine B6 die helpt bij de aanmaak van serotonine."
        },
      ],
    },
    {
      name: t.phases.lateLuteal,
      emoji: "🌧️",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      recipes: [
        {
          name: "Gouden melk",
          emoji: "🍵",
          ingredients: ["400ml amandelmelk", "1 tl kurkuma", "1/2 tl gemberpoeder", "1/2 tl kaneel", "1 el honing", "Snufje zwarte peper", "1 tl kokosolie"],
          description: "Ontstekingsremmende warme drank voor ontspanning.",
          prepTime: "10 min",
          servings: 2,
          steps: [
            "Doe de amandelmelk in een steelpan",
            "Voeg kurkuma, gember, kaneel en zwarte peper toe",
            "Verwarm op laag vuur terwijl je roert",
            "Voeg de kokosolie toe en roer tot deze gesmolten is",
            "Laat zachtjes warm worden (niet koken)",
            "Zeef eventueel door een theezeef",
            "Schenk in mokken en roer de honing erdoor",
            "Drink warm, het liefst voor het slapen"
          ],
          tip: "Zwarte peper verhoogt de opname van kurkuma met wel 2000%!"
        },
        {
          name: "Zalm met groenten",
          emoji: "🐟",
          ingredients: ["2 zalmfilets", "200g broccoli", "1 bos asperges", "1 citroen", "Verse dille", "3 el olijfolie", "2 teentjes knoflook", "Zout en peper"],
          description: "Omega-3 rijke maaltijd die stemming ondersteunt.",
          prepTime: "25 min",
          servings: 2,
          steps: [
            "Verwarm de oven voor op 200°C",
            "Leg de zalmfilets op een bakplaat",
            "Verdeel de broccoli en asperges eromheen",
            "Snijd de knoflook in plakjes en verdeel over de groenten",
            "Besprenkel alles met olijfolie",
            "Snijd de citroen in plakjes en leg op de zalm",
            "Breng op smaak met zout en peper",
            "Bak 18-20 minuten in de oven",
            "Garneer met verse dille en serveer"
          ],
          tip: "Omega-3 vetzuren uit zalm kunnen helpen bij stemmingswisselingen tijdens PMS."
        },
        {
          name: "Chocolade energy balls",
          emoji: "🍫",
          ingredients: ["150g dadels (ontpit)", "3 el cacao poeder", "100g walnoten", "50g havermout", "3 el kokosrasp", "Snufje zeezout", "1 el kokosolie"],
          description: "Gezonde snack voor chocolade cravings.",
          prepTime: "15 min",
          servings: 12,
          steps: [
            "Week de dadels 10 minuten in warm water als ze hard zijn",
            "Doe de walnoten en havermout in een keukenmachine en maal fijn",
            "Voeg de dadels, cacao, kokosolie en zeezout toe",
            "Maal tot een kleverig deeg",
            "Rol met je handen balletjes van het mengsel",
            "Rol de balletjes door de kokosrasp",
            "Leg op een bord en zet minimaal 30 minuten in de koelkast",
            "Bewaar in de koelkast, blijft 2 weken goed"
          ],
          tip: "Deze gezonde snack stilt je chocolade craving zonder de suikerdip!"
        },
        {
          name: "Makreel salade",
          emoji: "🐟",
          ingredients: ["2 gerookte makreelfilets", "200g gemengde sla", "1 rode ui", "1 appel", "50g walnoten", "2 el mierikswortel", "3 el crème fraîche", "Citroensap"],
          description: "Omega-3 rijke salade die helpt tegen PMS-klachten.",
          prepTime: "15 min",
          servings: 2,
          steps: [
            "Prak de makreel in grove stukken",
            "Snijd de ui in dunne ringen",
            "Snijd de appel in dunne partjes",
            "Meng crème fraîche met mierikswortel en citroensap",
            "Verdeel de sla over borden",
            "Schik makreel, ui en appel erop",
            "Strooi walnoten erover",
            "Druppel de dressing erover"
          ],
          tip: "Makreel bevat nog meer omega-3 dan zalm en is goedkoper!"
        },
        {
          name: "Avocado chocolademousse",
          emoji: "🥑",
          ingredients: ["2 rijpe avocado's", "4 el cacao poeder", "4 el maple syrup", "1 tl vanille extract", "Snufje zeezout", "100ml amandelmelk", "Bessen voor topping"],
          description: "Romige, gezonde chocolademousse zonder schuldgevoel.",
          prepTime: "10 min",
          servings: 4,
          steps: [
            "Halveer de avocado's en verwijder de pit",
            "Schep het vruchtvlees in een blender",
            "Voeg cacao, maple syrup, vanille en zout toe",
            "Blend tot een gladde mousse",
            "Voeg amandelmelk toe voor gewenste dikte",
            "Verdeel over kommetjes",
            "Zet 30 minuten in de koelkast",
            "Serveer met verse bessen"
          ],
          tip: "Avocado maakt deze mousse romig én zit vol gezonde vetten."
        },
        {
          name: "Kamillethee latte",
          emoji: "🍵",
          ingredients: ["2 zakjes kamillethee", "200ml havermelk", "1 tl honing", "1/2 tl kaneel", "Snufje nootmuskaat"],
          description: "Kalmerende drank voor ontspanning en beter slapen.",
          prepTime: "5 min",
          servings: 1,
          steps: [
            "Zet de kamillethee in 150ml heet water",
            "Laat 5 minuten trekken",
            "Verwarm de havermelk",
            "Schuim de melk op met een garde of melkopschuimer",
            "Verwijder de theezakjes",
            "Giet de opgeklopte melk erbij",
            "Roer honing, kaneel en nootmuskaat erdoor",
            "Drink voor het slapen"
          ],
          tip: "Kamille helpt bij ontspanning en kan krampen verlichten."
        },
        {
          name: "Walnoot-dadel hapjes",
          emoji: "🥜",
          ingredients: ["12 medjool dadels", "12 walnoten", "50g pure chocolade (70%)", "Zeezout"],
          description: "Simpele zoete snack met gezonde vetten en magnesium.",
          prepTime: "15 min",
          servings: 12,
          steps: [
            "Snijd de dadels open en verwijder de pit",
            "Druk een walnoot in elke dadel",
            "Smelt de chocolade au bain-marie",
            "Dip de dadels half in de chocolade",
            "Leg op bakpapier",
            "Bestrooi met een snufje zeezout",
            "Laat opstijven in de koelkast",
            "Bewaar in de koelkast"
          ],
          tip: "Walnoten bevatten omega-3 en magnesium - perfect tegen PMS!"
        },
      ],
    },
  ];
}

function getCurrentPhaseName(cycleDay: number, cycleLength: number, t: Translations): string {
  const ovulationDay = Math.round(cycleLength / 2);

  if (cycleDay <= 5) return t.phases.menstruation;
  if (cycleDay <= ovulationDay - 2) return t.phases.follicular;
  if (cycleDay <= ovulationDay + 2) return t.phases.ovulation;
  if (cycleDay <= ovulationDay + 7) return t.phases.earlyLuteal;
  return t.phases.lateLuteal;
}

export function RecipesView({ currentCycleDay, cycleLength }: RecipesViewProps) {
  const { t } = useTranslation();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<{ recipe: Recipe; phase: Phase } | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const allPhases = useMemo(() => getAllPhaseRecipes(cycleLength, t), [cycleLength, t]);

  const currentPhaseName = useMemo(() => {
    if (!currentCycleDay) return null;
    return getCurrentPhaseName(currentCycleDay, cycleLength, t);
  }, [currentCycleDay, cycleLength, t]);

  const filteredPhases = selectedPhase
    ? allPhases.filter(p => p.name === selectedPhase)
    : allPhases;

  const handleOpenRecipe = (recipe: Recipe, phase: Phase) => {
    setSelectedRecipe({ recipe, phase });
    setCheckedSteps(new Set());
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
    setCheckedSteps(new Set());
  };

  const toggleStep = (stepIndex: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(stepIndex)) {
      newChecked.delete(stepIndex);
    } else {
      newChecked.add(stepIndex);
    }
    setCheckedSteps(newChecked);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.recipes.title}</h1>
        <p className="text-muted-foreground">{t.nav.recipes}</p>
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
              {t.phases.allPhases}
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
                  <span className="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded">{t.phases.now}</span>
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
                  {t.phases.currentPhase}
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phase.recipes.map((recipe, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleOpenRecipe(recipe, phase)}
              >
                <CardHeader className={`${phase.bgColor} pb-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{recipe.emoji}</span>
                      <CardTitle className={`text-lg ${phase.color}`}>{recipe.name}</CardTitle>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${phase.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-sm mb-4">
                    {recipe.description}
                  </CardDescription>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} {t.common.persons}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">{t.recipes.ingredients}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredients.slice(0, 4).map((ingredient, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-md text-xs ${phase.bgColor} ${phase.color}`}
                        >
                          {ingredient.split(' ').slice(-1)[0]}
                        </span>
                      ))}
                      {recipe.ingredients.length > 4 && (
                        <span className={`px-2 py-1 rounded-md text-xs ${phase.bgColor} ${phase.color}`}>
                          +{recipe.ingredients.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRecipe(recipe, phase);
                    }}
                  >
                    {t.recipes.openRecipe}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Recipe Detail Dialog */}
      <Dialog open={selectedRecipe !== null} onOpenChange={() => handleCloseRecipe()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader className={`${selectedRecipe.phase.bgColor} -mx-6 -mt-6 px-6 pt-6 pb-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedRecipe.recipe.emoji}</span>
                  <div>
                    <DialogTitle className={`text-2xl ${selectedRecipe.phase.color}`}>
                      {selectedRecipe.recipe.name}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRecipe.recipe.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className={`flex items-center gap-1.5 ${selectedRecipe.phase.color}`}>
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.recipe.prepTime}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${selectedRecipe.phase.color}`}>
                    <Users className="w-4 h-4" />
                    <span>{selectedRecipe.recipe.servings} {t.common.persons}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${selectedRecipe.phase.bgColor} ${selectedRecipe.phase.color} border`}>
                    <span>{selectedRecipe.phase.emoji}</span>
                    <span>{selectedRecipe.phase.name}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold mb-3">{t.recipes.ingredients}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecipe.recipe.ingredients.map((ingredient, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg ${selectedRecipe.phase.bgColor} ${selectedRecipe.phase.color} text-sm`}
                      >
                        {ingredient}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-semibold mb-3">{t.recipes.instructions}</h3>
                  <div className="space-y-2">
                    {selectedRecipe.recipe.steps.map((step, i) => (
                      <button
                        key={i}
                        onClick={() => toggleStep(i)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                          checkedSteps.has(i)
                            ? "bg-green-50 text-green-700"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                          checkedSteps.has(i)
                            ? "bg-green-500 text-white"
                            : `${selectedRecipe.phase.bgColor} ${selectedRecipe.phase.color}`
                        )}>
                          {checkedSteps.has(i) ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={cn(
                          "text-sm",
                          checkedSteps.has(i) && "line-through"
                        )}>
                          {step}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                {selectedRecipe.recipe.tip && (
                  <div className={`${selectedRecipe.phase.bgColor} rounded-lg p-4`}>
                    <p className={`text-sm ${selectedRecipe.phase.color}`}>
                      <span className="font-semibold">💡 {t.recipes.tips}: </span>
                      {selectedRecipe.recipe.tip}
                    </p>
                  </div>
                )}

                {/* Progress */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    {checkedSteps.size} {t.common.of} {selectedRecipe.recipe.steps.length} {t.recipes.stepsCompleted}
                  </span>
                  {checkedSteps.size === selectedRecipe.recipe.steps.length && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ {t.recipes.recipeCompleted}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
