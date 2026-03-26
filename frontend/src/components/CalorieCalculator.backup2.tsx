import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Beef,
  Wheat,
  Droplets,
  Flame,
  Target,
  Split,
  Gauge,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

type Gender = "male" | "female";
type Goal = "cut" | "maintenance" | "bulk";

type FatPercent = 0.2 | 0.25 | 0.3;
type ProteinPerKg = 1.6 | 2.0 | 2.2;
type MealsPerDay = 3 | 4 | 5;

function round(n: number) {
  return Math.round(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmt(n: number) {
  return Number.isFinite(n) ? round(n) : 0;
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function goalAccent(goal: Goal) {
  if (goal === "cut") return "from-red-500 to-pink-600";
  if (goal === "bulk") return "from-orange-500 to-yellow-600";
  return "from-green-500 to-[#4ed10a]";
}

/**
 * Smart macros:
 * - Protein grams = weight * proteinPerKg
 * - Fat calories = calories * fatPercent
 * - Carbs calories = remaining
 */
function calculateMacros({
  calories,
  weightKg,
  proteinPerKg,
  fatPercent,
}: {
  calories: number;
  weightKg: number;
  proteinPerKg: ProteinPerKg;
  fatPercent: FatPercent;
}) {
  const proteinG = weightKg * proteinPerKg;
  const proteinCals = proteinG * 4;

  const fatCals = calories * fatPercent;
  const fatG = fatCals / 9;

  const remainingCals = calories - (proteinCals + fatCals);
  const carbsG = remainingCals / 4;

  return {
    calories: round(clamp(calories, 0, 999999)),
    proteinG: round(clamp(proteinG, 0, 9999)),
    carbsG: round(clamp(carbsG, 0, 9999)),
    fatG: round(clamp(fatG, 0, 9999)),

    proteinCals: round(clamp(proteinCals, 0, 999999)),
    carbsCals: round(clamp(carbsG * 4, 0, 999999)),
    fatCals: round(clamp(fatCals, 0, 999999)),
  };
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-bold border-2 transition-all shadow-md hover:shadow-lg",
        active
          ? "bg-gradient-to-br from-[#59f20d] to-[#4ed10a] text-white border-[#59f20d] dark:shadow-[0_8px_30px_rgba(89,242,13,0.5)]"
          : "bg-white text-slate-700 border-slate-200 hover:border-[#59f20d] hover:bg-[#59f20d]/5 dark:bg-[#0a0d08] dark:text-slate-200 dark:border-slate-700 dark:hover:border-[#59f20d]"
      )}
    >
      {children}
    </button>
  );
}

export function CalorieCalculator() {
  const { t, language, dir } = useLanguage();

  const userProfile = useQuery(api.profiles.getCurrentProfile);

  const textAlign = dir === "rtl" ? "text-right" : "text-left";

  const [calculatorData, setCalculatorData] = useState({
    age: "",
    gender: "male" as Gender,
    weight: "",
    height: "",
    activityLevel: "moderate" as ActivityLevel,
  });

  useEffect(() => {
    if (!userProfile) return;

    setCalculatorData((prev) => {
      const isEmpty =
        !prev.age && !prev.weight && !prev.height && prev.gender === "male";

      if (!isEmpty) return prev;

      return {
        age: userProfile.age ? String(userProfile.age) : "",
        gender: (userProfile.gender as Gender) || "male",
        weight: userProfile.weight ? String(userProfile.weight) : "",
        height: userProfile.height ? String(userProfile.height) : "",
        activityLevel: "moderate",
      };
    });
  }, [userProfile]);

  const [goal, setGoal] = useState<Goal>("maintenance");
  const [fatPercent, setFatPercent] = useState<FatPercent>(0.25);
  const [proteinPerKg, setProteinPerKg] = useState<ProteinPerKg>(1.6);
  const [mealsPerDay, setMealsPerDay] = useState<MealsPerDay>(4);

  const [selectedFoods, setSelectedFoods] = useState<
    Array<{ foodId: string; quantity: number }>
  >([]);
  const [showFoodSelector, setShowFoodSelector] = useState(false);

  const calorieNeeds = useQuery(
    api.nutrition.calculateDailyCalorieNeeds,
    calculatorData.age && calculatorData.weight && calculatorData.height
      ? {
          age: parseInt(calculatorData.age),
          gender: calculatorData.gender,
          weight: parseFloat(calculatorData.weight),
          height: parseFloat(calculatorData.height),
          activityLevel: calculatorData.activityLevel,
        }
      : "skip"
  );

  const foods = useQuery(api.nutrition.getAllFoods, {});
  const foodCalories = useQuery(
    api.nutrition.calculateCalories,
    selectedFoods.length > 0
      ? {
          foods: selectedFoods.map((f) => ({
            foodId: f.foodId as any,
            quantity: f.quantity,
          })),
        }
      : "skip"
  );

  const activityLevels: Record<ActivityLevel, string> = {
    sedentary: t("sedentary"),
    light: t("light_activity"),
    moderate: t("moderate_activity"),
    active: t("active"),
    very_active: t("very_active"),
  };

  const weightKg = useMemo(() => {
    const w = parseFloat(calculatorData.weight || "");
    return Number.isFinite(w) ? w : 0;
  }, [calculatorData.weight]);

  const targetCalories = useMemo(() => {
    if (!calorieNeeds) return null;
    const maintenance = round(calorieNeeds.maintenanceCalories);
    const cut = round(calorieNeeds.maintenanceCalories - 500);
    const bulk = round(calorieNeeds.maintenanceCalories + 500);
    return goal === "cut" ? cut : goal === "bulk" ? bulk : maintenance;
  }, [calorieNeeds, goal]);

  const macros = useMemo(() => {
    if (!targetCalories || !weightKg) return null;
    return calculateMacros({
      calories: targetCalories,
      weightKg,
      proteinPerKg,
      fatPercent,
    });
  }, [targetCalories, weightKg, proteinPerKg, fatPercent]);

  const perMeal = useMemo(() => {
    if (!macros) return null;
    const m = mealsPerDay;
    return {
      calories: fmt(macros.calories / m),
      proteinG: fmt(macros.proteinG / m),
      carbsG: fmt(macros.carbsG / m),
      fatG: fmt(macros.fatG / m),
    };
  }, [macros, mealsPerDay]);

  const smartSummary = useMemo(() => {
    if (!macros) return null;

    const items = [
      { label: t("protein"), cals: macros.proteinCals },
      { label: t("carbs"), cals: macros.carbsCals },
      { label: t("fat"), cals: macros.fatCals },
    ].sort((a, b) => b.cals - a.cals);

    const top = items[0];

    const tip =
      goal === "cut" ? t("tip_cut") : goal === "bulk" ? t("tip_bulk") : t("tip_maint");

    return { top, tip };
  }, [macros, goal, t]);

  const goalLabel = (g: Goal) =>
    g === "cut" ? t("cut") : g === "bulk" ? t("bulk") : t("maintenance");
  const goalShort = (g: Goal) =>
    g === "cut"
      ? t("goal_short_cut")
      : g === "bulk"
      ? t("goal_short_bulk")
      : t("goal_short_maintenance");

  const addFood = (foodId: string) => {
    setSelectedFoods((prev) => {
      if (prev.some((x) => x.foodId === foodId)) return prev;
      return [...prev, { foodId, quantity: 100 }];
    });
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    setSelectedFoods((prev) =>
      prev.map((food, i) => (i === index ? { ...food, quantity } : food))
    );
  };

  const removeFood = (index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const getFoodName = (food: any) => {
    if (language === "ar") return food.nameAr || t("no_ar_name");
    return food.name || t("no_en_name");
  };

  const totalMealCalories = foodCalories?.totalCalories ?? 0;
  const totalMealPercent =
    macros && macros.calories > 0
      ? Math.round((totalMealCalories / macros.calories) * 100)
      : 0;

  return (
    <div
      dir={dir}
      className="
        space-y-6 py-6 px-3 sm:px-4 rounded-3xl min-h-screen
        bg-gradient-to-br from-slate-50 via-white to-slate-100
        dark:from-[#0a0d08] dark:via-[#0f1410] dark:to-[#0a0d08]
      "
    >
      {/* HERO + SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-[#59f20d]/20 bg-gradient-to-br from-white via-slate-50 to-white shadow-2xl p-6 sm:p-8 dark:border-[#59f20d]/40 dark:from-[#1a2318] dark:via-[#0a0d08] dark:to-[#1a2318] dark:shadow-[0_0_80px_-20px_rgba(89,242,13,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(89,242,13,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(89,242,13,0.15),transparent_70%)]" />
        <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#59f20d]/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className={cn("space-y-3", textAlign)}>
            <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#59f20d]/60 bg-[#59f20d]/10 px-4 py-2 text-sm font-bold text-[#59f20d] dark:border-[#59f20d] dark:bg-[#59f20d]/20 dark:text-[#59f20d] shadow-lg">
              <Gauge className="h-4 w-4" />
              <span>{t("macros_title")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("macros_subtitle")}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl dark:text-slate-400 leading-relaxed">
              {t("macros_hero_hint")}
            </p>
          </div>

          {macros && targetCalories && (
            <div className="relative rounded-3xl bg-gradient-to-br from-[#59f20d]/5 to-[#59f20d]/10 border-2 border-[#59f20d]/30 px-6 py-5 flex flex-col sm:flex-row items-stretch gap-4 min-w-[280px] dark:from-[#59f20d]/10 dark:to-[#59f20d]/5 dark:border-[#59f20d]/50 shadow-xl">
              <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("target_calories")}
                </div>
                <div className="text-4xl font-black text-[#59f20d] dark:text-[#59f20d] flex items-baseline gap-2">
                  {targetCalories}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("kcal")}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/30 px-3 py-1 rounded-full">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#59f20d] animate-pulse shadow-lg shadow-[#59f20d]/50" />
                  {goalLabel(goal)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 px-3 py-3 dark:from-blue-500/20 dark:to-blue-600/10 dark:border-blue-500/50 shadow-md">
                  <Beef className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <div className="font-black text-lg text-blue-700 dark:text-blue-300">
                    {macros.proteinG}g
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                    {t("protein")}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/30 border-2 border-[#59f20d] px-3 py-3 dark:from-[#59f20d]/30 dark:to-[#59f20d]/20 dark:border-[#59f20d] shadow-md">
                  <Wheat className="h-5 w-5 text-[#59f20d] mx-auto mb-1" />
                  <div className="font-black text-lg text-[#59f20d] dark:text-[#59f20d]">
                    {macros.carbsG}g
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-[#59f20d] dark:text-[#59f20d]">
                    {t("carbs")}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 px-3 py-3 dark:from-amber-500/20 dark:to-amber-600/10 dark:border-amber-500/50 shadow-md">
                  <Droplets className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                  <div className="font-black text-lg text-amber-700 dark:text-amber-300">
                    {macros.fatG}g
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                    {t("fat")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Body data */}
          <div className="rounded-3xl border-2 border-[#59f20d]/20 bg-gradient-to-br from-white to-slate-50 backdrop-blur p-6 shadow-xl dark:border-[#59f20d]/40 dark:from-[#1a2318]/50 dark:to-[#0a0d08] dark:shadow-[0_20px_70px_-30px_rgba(89,242,13,0.3)]">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={cn(
                  "text-lg sm:text-xl font-black text-slate-900 flex items-center gap-3 dark:text-white",
                  textAlign
                )}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/10 border-2 border-[#59f20d]/40 dark:from-[#59f20d]/30 dark:to-[#59f20d]/10 dark:border-[#59f20d] shadow-lg">
                  <Target className="h-5 w-5 text-[#59f20d]" />
                </span>
                {t("daily_needs_smart")}
              </h3>

              {userProfile && (
                <button
                  type="button"
                  onClick={() =>
                    setCalculatorData({
                      age: userProfile.age ? String(userProfile.age) : "",
                      gender: (userProfile.gender as Gender) || "male",
                      weight: userProfile.weight ? String(userProfile.weight) : "",
                      height: userProfile.height ? String(userProfile.height) : "",
                      activityLevel: "moderate",
                    })
                  }
                  className="text-xs font-semibold px-4 py-2 rounded-2xl border-2 border-[#59f20d] text-[#59f20d] bg-[#59f20d]/10 hover:bg-[#59f20d]/20 dark:border-[#59f20d] dark:text-[#59f20d] dark:bg-[#59f20d]/20 dark:hover:bg-[#59f20d]/30 transition-all shadow-md hover:shadow-lg"
                >
                  {t("use_profile_data", "استخدام بيانات البروفايل")}
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={cn(
                      "block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300",
                      textAlign
                    )}
                  >
                    {t("age")}
                  </label>
                  <input
                    type="number"
                    value={calculatorData.age}
                    onChange={(e) =>
                      setCalculatorData((prev) => ({ ...prev, age: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-base font-medium outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/30 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-white dark:focus:border-[#59f20d] transition-all shadow-sm hover:shadow-md"
                    placeholder={t("age_placeholder")}
                    min={1}
                    max={120}
                  />
                </div>

                <div>
                  <label
                    className={cn(
                      "block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300",
                      textAlign
                    )}
                  >
                    {t("gender")}
                  </label>
                  <select
                    value={calculatorData.gender}
                    onChange={(e) =>
                      setCalculatorData((prev) => ({
                        ...prev,
                        gender: e.target.value as Gender,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-base font-medium outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/30 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-white dark:focus:border-[#59f20d] transition-all shadow-sm hover:shadow-md"
                  >
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                  </select>
                </div>
              </div>

              {/* Weight + Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={cn(
                      "block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300",
                      textAlign
                    )}
                  >
                    {t("weight")} ({t("kg")})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={calculatorData.weight}
                    onChange={(e) =>
                      setCalculatorData((prev) => ({ ...prev, weight: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-base font-medium outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/30 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-white dark:focus:border-[#59f20d] transition-all shadow-sm hover:shadow-md"
                    placeholder={t("weight_placeholder")}
                    min={1}
                    max={500}
                  />
                </div>

                <div>
                  <label
                    className={cn(
                      "block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300",
                      textAlign
                    )}
                  >
                    {t("height")} ({t("cm")})
                  </label>
                  <input
                    type="number"
                    value={calculatorData.height}
                    onChange={(e) =>
                      setCalculatorData((prev) => ({ ...prev, height: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#59f20d] focus:ring-1 focus:ring-[#59f20d]/40 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-slate-50"
                    placeholder={t("height_placeholder")}
                    min={50}
                    max={250}
                  />
                </div>
              </div>

              {/* Activity */}
              <div>
                <label
                  className={cn(
                    "block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300",
                    textAlign
                  )}
                >
                  {t("activity_level")}
                </label>
                <select
                  value={calculatorData.activityLevel}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({
                      ...prev,
                      activityLevel: e.target.value as ActivityLevel,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-base font-medium outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/30 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-white dark:focus:border-[#59f20d] transition-all shadow-sm hover:shadow-md"
                >
                  {Object.entries(activityLevels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Goal + macros */}
          <div className="rounded-3xl border-2 border-[#59f20d]/20 bg-gradient-to-br from-white to-slate-50 backdrop-blur p-6 shadow-xl space-y-5 dark:border-[#59f20d]/40 dark:from-[#1a2318]/50 dark:to-[#0a0d08] dark:shadow-[0_20px_70px_-30px_rgba(89,242,13,0.3)]">
            <h3
              className={cn(
                "text-lg sm:text-xl font-black text-slate-900 flex items-center gap-3 dark:text-white",
                textAlign
              )}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/10 border-2 border-[#59f20d]/40 dark:from-[#59f20d]/30 dark:to-[#59f20d]/10 dark:border-[#59f20d] shadow-lg">
                <Target className="w-5 h-5 text-[#59f20d]" />
              </span>
              {t("your_goal")}
            </h3>

            {/* Goal pills */}
            <div className="grid grid-cols-3 gap-3">
              {(["cut", "maintenance", "bulk"] as Goal[]).map((g) => {
                const active = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={cn(
                      "rounded-2xl px-4 py-4 text-sm font-black border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-xl",
                      active
                        ? `bg-gradient-to-br ${goalAccent(g)} text-white border-transparent dark:shadow-[0_10px_40px_-10px_rgba(89,242,13,0.6)]`
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#59f20d] hover:bg-[#59f20d]/5 dark:bg-[#0a0d08] dark:text-slate-200 dark:border-slate-700 dark:hover:border-[#59f20d]"
                    )}
                  >
                    <span className="text-base">{goalShort(g)}</span>
                  </button>
                );
              })}
            </div>

            {/* Protein per KG */}
            <div className="space-y-2">
              <label
                className={cn(
                  "block text-xs font-medium text-slate-600 dark:text-slate-300",
                  textAlign
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Beef className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  {t("protein_per_kg")}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([1.6, 2.0, 2.2] as ProteinPerKg[]).map((p) => (
                  <PillButton
                    key={p}
                    active={proteinPerKg === p}
                    onClick={() => setProteinPerKg(p)}
                  >
                    {p} g/kg
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Fat percent */}
            <div className="space-y-2">
              <label
                className={cn(
                  "block text-xs font-medium text-slate-600 dark:text-slate-300",
                  textAlign
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                  {t("fat_percentage")}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([0.2, 0.25, 0.3] as FatPercent[]).map((f) => (
                  <PillButton
                    key={f}
                    active={fatPercent === f}
                    onClick={() => setFatPercent(f)}
                  >
                    {round(f * 100)}%
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Meals per day */}
            <div className="space-y-2">
              <label
                className={cn(
                  "block text-xs font-medium text-slate-600 dark:text-slate-300",
                  textAlign
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Split className="w-4 h-4 text-[#59f20d] dark:text-[#59f20d]" />
                  {t("split_title")}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 4, 5] as MealsPerDay[]).map((m) => (
                  <PillButton
                    key={m}
                    active={mealsPerDay === m}
                    onClick={() => setMealsPerDay(m)}
                  >
                    {m} {t("meals")}
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Detailed macros */}
            {calorieNeeds && targetCalories && macros && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3 dark:bg-[#0a0d08]/80 dark:border-slate-700">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                      <Flame className="w-4 h-4 text-[#59f20d] dark:text-[#59f20d]" />
                    </div>
                    <div className={cn("flex-1", textAlign)}>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        BMR
                      </div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {calorieNeeds.bmr}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3 dark:bg-[#0a0d08]/80 dark:border-[#4ed10a]/60">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-[#59f20d]/15">
                      <Target className="w-4 h-4 text-[#4ed10a] dark:text-[#59f20d]" />
                    </div>
                    <div className={cn("flex-1", textAlign)}>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t("target_calories")}
                      </div>
                      <div className="text-lg font-semibold text-emerald-700 dark:text-[#59f20d]">
                        {targetCalories}
                      </div>
                    </div>
                  </div>
                </div>

                {perMeal && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 dark:bg-[#0a0d08]/80 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={cn(
                          "text-xs font-semibold text-slate-800 flex items-center gap-2 dark:text-slate-200",
                          textAlign
                        )}
                      >
                        <Gauge className="w-4 h-4 text-[#59f20d] dark:text-[#59f20d]" />
                        {t("per_meal")} ({mealsPerDay})
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-slate-700 dark:text-slate-300">
                      <div className="rounded-2xl bg-white border border-slate-200 px-2 py-1.5 dark:bg-[#0a0d08]/70 dark:border-slate-700">
                        <div className="font-semibold text-emerald-700 dark:text-[#59f20d]">
                          {perMeal.calories}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t("kcal")}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white border border-blue-200 px-2 py-1.5 dark:bg-[#0a0d08]/70 dark:border-blue-700/60">
                        <div className="font-semibold text-blue-700 dark:text-blue-300">
                          {perMeal.proteinG}g
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t("protein")}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white border border-emerald-200 px-2 py-1.5 dark:bg-[#0a0d08]/70 dark:border-emerald-700/60">
                        <div className="font-semibold text-emerald-700 dark:text-[#59f20d]">
                          {perMeal.carbsG}g
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t("carbs")}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white border border-amber-200 px-2 py-1.5 dark:bg-[#0a0d08]/70 dark:border-amber-700/60">
                        <div className="font-semibold text-amber-700 dark:text-amber-300">
                          {perMeal.fatG}g
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t("fat")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {smartSummary && (
                  <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50 to-slate-50 border border-emerald-200 px-3 py-3 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-700">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#59f20d] mt-0.5 dark:text-[#59f20d]" />
                      <div
                        className={cn(
                          "text-xs text-slate-700 space-y-1 dark:text-slate-200",
                          textAlign
                        )}
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-50">
                          {t("smart_summary")}
                        </div>
                        <div>
                          {t("top_cal_source")}{" "}
                          <span className="font-semibold text-emerald-700 dark:text-[#59f20d]">
                            {smartSummary.top.label}
                          </span>
                          .
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {smartSummary.tip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Food calculator */}
          <div className="rounded-3xl border border-emerald-200 bg-white backdrop-blur p-5 shadow-soft dark:border-[#59f20d]/40 dark:bg-[#0a0d08]/80 dark:shadow-[0_26px_80px_-60px_rgba(0,0,0,1)]">
            <h3
              className={cn(
                "text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 dark:text-slate-50",
                textAlign
              )}
            >
              <span className="text-xl">🍽️</span>
              {t("food_calculator_title")}
            </h3>

            <button
              onClick={() => setShowFoodSelector(!showFoodSelector)}
              className="w-full mb-4 px-4 py-2.5 bg-gradient-to-r from-[#59f20d] to-[#4ed10a] text-sm text-white rounded-2xl hover:shadow-[0_18px_40px_rgba(16,185,129,0.7)] transition-all font-semibold"
              type="button"
            >
              {showFoodSelector ? t("hide_foods") : t("add_food")}
            </button>

            {showFoodSelector && foods && (
              <div className="mb-4 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0a0d08]/90">
                <div
                  className={cn(
                    "px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200",
                    textAlign
                  )}
                >
                  {t("choose_foods")}
                </div>
                {foods.map((food: any) => (
                  <button
                    key={food._id}
                    onClick={() => addFood(food._id)}
                    className={cn(
                      "w-full px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 dark:text-slate-200 dark:hover:bg-[#0a0d08] dark:border-slate-900",
                      textAlign
                    )}
                    type="button"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{getFoodName(food)}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === "ar"
                          ? food.name || null
                          : food.nameAr || null}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap dark:text-slate-400">
                      {food.caloriesPer100g} {t("kcal")}/100g
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              {selectedFoods.map((selectedFood, index) => {
                const food = foods?.find((f: any) => f._id === selectedFood.foodId);
                if (!food) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 dark:bg-[#0a0d08]/80 dark:border-slate-800"
                  >
                    <div className={cn("flex-1 text-xs sm:text-sm", textAlign)}>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {getFoodName(food)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === "ar"
                          ? food.name || null
                          : food.nameAr || null}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 dark:text-slate-300">
                        {Math.round(
                          (food.caloriesPer100g * selectedFood.quantity) / 100
                        )}{" "}
                        {t("kcal")}
                      </div>
                    </div>

                    <input
                      type="number"
                      value={selectedFood.quantity}
                      onChange={(e) =>
                        updateFoodQuantity(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 border border-slate-200 rounded-xl bg-white text-slate-900 text-xs outline-none focus:border-[#59f20d] focus:ring-1 focus:ring-[#59f20d]/40 dark:bg-[#0a0d08] dark:border-slate-700 dark:text-slate-50"
                      min={0}
                      step={10}
                    />

                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      g
                    </span>

                    <button
                      onClick={() => removeFood(index)}
                      className="px-2 py-1 bg-red-50 text-[11px] text-red-600 rounded-xl hover:bg-red-100 transition-all dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {foodCalories && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-slate-50 border border-emerald-200 p-4 space-y-3 dark:from-emerald-950 dark:via-slate-950 dark:to-slate-950 dark:border-[#59f20d]/40">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "text-xs font-semibold text-slate-800 dark:text-slate-100",
                      textAlign
                    )}
                  >
                    {t("total_meal")}
                  </div>
                  {macros && (
                    <div className="text-[10px] text-emerald-700 dark:text-[#59f20d]">
                      {totalMealCalories} / {macros.calories} {t("kcal")} ·{" "}
                      {clamp(totalMealPercent, 0, 999)}%
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-white border border-amber-200 p-3 dark:bg-[#0a0d08]/80 dark:border-amber-500/50">
                    <div
                      className={cn(
                        "text-[11px] text-slate-500 mb-1 dark:text-slate-400",
                        textAlign
                      )}
                    >
                      {t("calories")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold text-amber-700 dark:text-amber-300",
                        textAlign
                      )}
                    >
                      {foodCalories.totalCalories}
                    </div>
                    <div
                      className={cn(
                        "text-[11px] text-slate-500 dark:text-slate-400",
                        textAlign
                      )}
                    >
                      {t("kcal")}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-blue-200 p-3 dark:bg-[#0a0d08]/80 dark:border-blue-500/50">
                    <div
                      className={cn(
                        "text-[11px] text-slate-500 mb-1 dark:text-slate-400",
                        textAlign
                      )}
                    >
                      {t("protein")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold text-blue-700 dark:text-blue-300",
                        textAlign
                      )}
                    >
                      {foodCalories.totalProtein}g
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-emerald-200 p-3 dark:bg-[#0a0d08]/80 dark:border-[#59f20d]/50">
                    <div
                      className={cn(
                        "text-[11px] text-slate-500 mb-1 dark:text-slate-400",
                        textAlign
                      )}
                    >
                      {t("carbs")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold text-emerald-700 dark:text-[#59f20d]",
                        textAlign
                      )}
                    >
                      {foodCalories.totalCarbs}g
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-amber-200 p-3 dark:bg-[#0a0d08]/80 dark:border-amber-500/60">
                    <div
                      className={cn(
                        "text-[11px] text-slate-500 mb-1 dark:text-slate-400",
                        textAlign
                      )}
                    >
                      {t("fat")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold text-amber-700 dark:text-amber-300",
                        textAlign
                      )}
                    >
                      {foodCalories.totalFat}g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedFoods.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm dark:text-slate-500">
                <div className="text-3xl mb-2">🍽️</div>
                <p>{t("no_foods_selected")}</p>
              </div>
            )}
          </div>

          {/* Tips card */}
          <div className="rounded-3xl border border-slate-200 bg-white backdrop-blur p-5 shadow-soft dark:border-slate-800 dark:bg-[#0a0d08]/80 dark:shadow-[0_26px_80px_-60px_rgba(0,0,0,1)]">
            <h3
              className={cn(
                "text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 dark:text-slate-50",
                textAlign
              )}
            >
              <span className="text-xl">💡</span>
              {t("tips_title")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="rounded-2xl bg-rose-50 border border-red-200 p-3 dark:bg-[#0a0d08]/80 dark:border-red-500/40">
                <div
                  className={cn(
                    "flex items-center gap-2 font-semibold text-slate-900 mb-2 dark:text-slate-100",
                    textAlign
                  )}
                >
                  <Sparkles className="w-4 h-4 text-red-500 dark:text-red-300" />
                  {t("tips_cut_title")}
                </div>
                <ul
                  className={cn(
                    "space-y-1 text-slate-700 dark:text-slate-300",
                    textAlign
                  )}
                >
                  <li>• {t("tips_cut_1")}</li>
                  <li>• {t("tips_cut_2")}</li>
                  <li>• {t("tips_cut_3")}</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-[#0a0d08]/80 dark:border-[#59f20d]/40">
                <div
                  className={cn(
                    "flex items-center gap-2 font-semibold text-slate-900 mb-2 dark:text-slate-100",
                    textAlign
                  )}
                >
                  <Flame className="w-4 h-4 text-[#59f20d] dark:text-[#59f20d]" />
                  {t("tips_maint_title")}
                </div>
                <ul
                  className={cn(
                    "space-y-1 text-slate-700 dark:text-slate-300",
                    textAlign
                  )}
                >
                  <li>• {t("tips_maint_1")}</li>
                  <li>• {t("tips_maint_2")}</li>
                  <li>• {t("tips_maint_3")}</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 dark:bg-[#0a0d08]/80 dark:border-indigo-500/40">
                <div
                  className={cn(
                    "flex items-center gap-2 font-semibold text-slate-900 mb-2 dark:text-slate-100",
                    textAlign
                  )}
                >
                  <Gauge className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
                  {t("tips_bulk_title")}
                </div>
                <ul
                  className={cn(
                    "space-y-1 text-slate-700 dark:text-slate-300",
                    textAlign
                  )}
                >
                  <li>• {t("tips_bulk_1")}</li>
                  <li>• {t("tips_bulk_2")}</li>
                  <li>• {t("tips_bulk_3")}</li>
                </ul>
              </div>
            </div>

            <div
              className={cn(
                "mt-3 text-[11px] text-slate-500 dark:text-slate-400",
                textAlign
              )}
            >
              {t("pro_mode_note")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}