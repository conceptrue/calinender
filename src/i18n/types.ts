export type Language = "nl" | "en";

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    close: string;
    today: string;
    loading: string;
    days: string;
    day: string;
    minutes: string;
    hours: string;
    persons: string;
    of: string;
    completed: string;
    notSet: string;
    low: string;
    high: string;
    none: string;
  };

  // Weekdays (short)
  weekdaysShort: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };

  // Months
  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };

  // Navigation
  nav: {
    calendar: string;
    nutrition: string;
    exercise: string;
    recipes: string;
    pregnancy: string;
    settings: string;
  };

  // App
  app: {
    name: string;
    tagline: string;
    dataLocal: string;
    version: string;
  };

  // Calendar & Cycle
  cycle: {
    period: string;
    predictedPeriod: string;
    ovulation: string;
    fertile: string;
    symptoms: string;
    cycleDay: string;
    cycleLength: string;
    periodLength: string;
    daysUntilPeriod: string;
    periodExpected: string;
    noData: string;
    ofYourCycle: string;
    periods: string;
    markFirstPeriod: string;
    registerMorePeriods: string;
    nextPeriod: string;
    todaySoon: string;
  };

  // Phases
  phases: {
    menstruation: string;
    follicular: string;
    ovulation: string;
    earlyLuteal: string;
    lateLuteal: string;
    currentPhase: string;
    now: string;
    allPhases: string;
  };

  // Moods
  moods: {
    happy: string;
    neutral: string;
    irritable: string;
    sad: string;
    emotional: string;
  };

  // Pain levels
  pain: {
    none: string;
    light: string;
    moderate: string;
    intense: string;
    severe: string;
  };

  // Energy levels
  energy: {
    veryLow: string;
    low: string;
    normal: string;
    high: string;
    veryHigh: string;
    rising: string;
    peak: string;
    stable: string;
    declining: string;
  };

  // Nutrition
  nutrition: {
    title: string;
    plan: string;
    advice: string;
    healthy: string;
    balanced: string;
    unhealthy: string;
    cravings: string;
    recommended: string;
    avoid: string;
    tips: string;
    focus: string;
    next7Days: string;
    noDataYet: string;
    clickToStart: string;
    registerPeriodFirst: string;
    calendar: string;
    phases: string;
    activity: string;
    // Focus areas
    ironRecovery: string;
    energyGrowth: string;
    antioxidantsFiber: string;
    complexCarbs: string;
    antiInflammatory: string;
    // Phase descriptions
    menstruationDesc: string;
    follicularDesc: string;
    ovulationDesc: string;
    earlyLutealDesc: string;
    lateLutealDesc: string;
    // Food items
    redMeat: string;
    spinachGreens: string;
    lentilsBeans: string;
    darkChocolate: string;
    gingerTea: string;
    fattyFish: string;
    eggs: string;
    freshSalads: string;
    leanProteins: string;
    avocado: string;
    berries: string;
    nutsSeeds: string;
    cruciferous: string;
    peppersTomat: string;
    freshFruit: string;
    wholeGrains: string;
    cucumberCelery: string;
    extraWater: string;
    sweetPotato: string;
    brownRice: string;
    oatmeal: string;
    banana: string;
    peanutButter: string;
    chickpeas: string;
    darkChoc70: string;
    leafyGreens: string;
    chamomileTea: string;
    walnuts: string;
    turmericGinger: string;
    // Avoid items
    salt: string;
    tooMuchCaffeine: string;
    alcohol: string;
    refinedSugar: string;
    friedFood: string;
    sugaryDrinks: string;
    fattyMeat: string;
    fullFatDairy: string;
    candyCookies: string;
    whiteBread: string;
    saltedSnacks: string;
    sugarMoodSwings: string;
    // Tips
    tipIronVitC: string;
    tipWarmSoups: string;
    tipMagnesium: string;
    tipProbiotics: string;
    tipFermented: string;
    tipLightColorful: string;
    tipFiberEstrogen: string;
    tipExtraWater: string;
    tipRawVeggies: string;
    tipEatRegularly: string;
    tipBVitamins: string;
    tipMagnesiumPMS: string;
    tipDarkChocOk: string;
    tipOmega3Mood: string;
    tipAvoidSaltBloat: string;
  };

  // Exercise
  exercise: {
    title: string;
    plan: string;
    advice: string;
    walking: string;
    running: string;
    cycling: string;
    swimming: string;
    gym: string;
    yoga: string;
    sports: string;
    other: string;
    recommended: string;
    avoid: string;
    intensity: string;
    lightIntensity: string;
    moderateIntensity: string;
    highIntensity: string;
    moderateToHigh: string;
    lightToModerate: string;
    duration: string;
    noDataYet: string;
    clickToStart: string;
    registerPeriodFirst: string;
    calendar: string;
    phases: string;
    activity: string;
    // Phase descriptions
    menstruationDesc: string;
    follicularDesc: string;
    ovulationDesc: string;
    earlyLutealDesc: string;
    lateLutealDesc: string;
    // Recommended exercises with emoji
    walkingRec: string;
    yogaRec: string;
    swimmingRec: string;
    stretchingRec: string;
    runningRec: string;
    cyclingRec: string;
    strengthRec: string;
    teamSportsRec: string;
    heavyStrength: string;
    intervalTraining: string;
    competitions: string;
    longCycling: string;
    extremeHeavy: string;
    calmYoga: string;
    meditation: string;
    // Avoid items
    intensiveGym: string;
    competitionSports: string;
    intensiveCardio: string;
    heavyWeights: string;
  };

  // Day Detail
  dayDetail: {
    mood: string;
    painLevel: string;
    energyLevel: string;
    nutritionToday: string;
    exerciseToday: string;
    notes: string;
    notesPlaceholder: string;
    markAsPeriod: string;
    periodClickToRemove: string;
  };

  // Symptoms Overview
  symptoms: {
    title: string;
    recent: string;
    noSymptomsYet: string;
    clickDayToStart: string;
    noNotesThisMonth: string;
  };

  // Fertility
  fertility: {
    title: string;
    basalTemp: string;
    basalTempHelper: string;
    cervicalMucus: string;
    ovulationTest: string;
    intercourse: string;
    supplements: string;
    dry: string;
    sticky: string;
    creamy: string;
    watery: string;
    eggwhite: string;
    negative: string;
    positive: string;
    dryHelper: string;
    stickyHelper: string;
    creamyHelper: string;
    wateryHelper: string;
    eggwhiteHelper: string;
    noDataYet: string;
    clickToStart: string;
    temp: string;
    mucus: string;
    tests: string;
    activity: string;
    belowTemp: string;
    aboveTemp: string;
    lhPeak: string;
    dataFilled: string;
  };

  // Pregnancy
  pregnancy: {
    title: string;
    subtitle: string;
    tips: string;
    avoidTitle: string;
    supplementsTitle: string;
    fertileWindow: string;
    trackFertility: string;
    overview: string;
    optimalTips: string;
    estimatedOvulation: string;
    fertileDays: string;
    maxFertility: string;
    currentCycleDay: string;
    // Tips
    knowFertileDays: string;
    knowFertileDaysDesc: string;
    measureTemp: string;
    measureTempDesc: string;
    watchMucus: string;
    watchMucusDesc: string;
    timingMatters: string;
    timingMattersDesc: string;
    prioritizeSleep: string;
    prioritizeSleepDesc: string;
    avoidStress: string;
    avoidStressDesc: string;
    // Nutrients
    folicAcid: string;
    folicAcidDesc: string;
    iron: string;
    ironDesc: string;
    omega3: string;
    omega3Desc: string;
    vitaminD: string;
    vitaminDDesc: string;
    zinc: string;
    zincDesc: string;
    vitaminB12: string;
    vitaminB12Desc: string;
    // Exercises
    walkingDesc: string;
    yogaDesc: string;
    swimmingDesc: string;
    lightWeights: string;
    lightWeightsDesc: string;
    pilates: string;
    pilatesDesc: string;
    // Avoid items
    alcohol: string;
    alcoholDesc: string;
    smoking: string;
    smokingDesc: string;
    caffeine: string;
    caffeineDesc: string;
    rawFish: string;
    rawFishDesc: string;
    stress: string;
    stressDesc: string;
    heavyExercise: string;
    heavyExerciseDesc: string;
    chemicals: string;
    chemicalsDesc: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    cycleParams: string;
    notifications: string;
    dataManagement: string;
    reminders: string;
    daysBefore: string;
    notificationsLocal: string;
    export: string;
    import: string;
    selectiveDelete: string;
    deleteAll: string;
    deleteAllConfirm: string;
    deleteConfirm: string;
    deleteWarning: string;
    yesDeleteAll: string;
    yesDelete: string;
    importSuccess: string;
    language: string;
    languageNl: string;
    languageEn: string;
  };

  // Recipes
  recipes: {
    title: string;
    ingredients: string;
    instructions: string;
    tips: string;
    openRecipe: string;
    stepsCompleted: string;
    recipeCompleted: string;
  };

  // Data export errors
  errors: {
    invalidData: string;
    invalidFile: string;
    readError: string;
    unknownError: string;
    periodsRequired: string;
    symptomsRequired: string;
    fertilityRequired: string;
    invalidPeriod: string;
    invalidSymptom: string;
    invalidFertility: string;
    invalidSettings: string;
  };
}
