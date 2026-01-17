# Calinender - Project Context

## URLs

- **Production**: https://calinender.vercel.app/
- **GitHub**: https://github.com/conceptrue/calinender

## Project Overview

Menstruatiekalender app met focus op privacy. Alle data wordt lokaal opgeslagen in de browser (localStorage).

## Key Components

- `src/app/page.tsx` - Main page with view routing
- `src/components/Sidebar.tsx` - Navigation sidebar
- `src/components/DayDetail.tsx` - Dialog for adding/editing daily data
- `src/components/RecipesView.tsx` - Recipes page with interactive step tracking
- `src/components/NutritionOverview.tsx` - Nutrition advice per cycle phase
- `src/components/ExerciseOverview.tsx` - Exercise advice per cycle phase

## Data Storage

All data is stored in localStorage via `src/hooks/useCycleData.ts`

## Cycle Phases

1. Menstruatie (dag 1-5)
2. Folliculaire fase (dag 6 tot ovulatie)
3. Ovulatie (rond dag 14)
4. Vroege luteale fase (na ovulatie, eerste helft)
5. Late luteale fase (PMS periode)
