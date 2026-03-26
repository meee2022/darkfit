import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Salad,
  Droplets,
  Flame,
  Plus,
  Trash2,
  Minus,
  Utensils,
  ClipboardCheck,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface NutritionSectionProps {
  targetGroup?: "general" | "diabetes" | "seniors" | "children";
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "";

const CATEGORY_AR_TO_EN: Record<string, string> = {
  فواكه: "Fruits",
  خضروات: "Vegetables",
  بروتينات: "Proteins",
  حبوب: "Grains",
  "حبوب كاملة": "Whole Grains",
  "منتجات الألبان": "Dairy",
  "دهون صحية": "Healthy Fats",
  مكسرات: "Nuts",
  مشروبات: "Drinks",
  "مشروبات بدون سكر": "Sugar-free Drinks",
  شوربات: "Soups",
  "سناكات صحية": "Healthy Snacks",
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function mealLabel(t: any, mt: Exclude<MealType, "">) {
  return mt === "breakfast"
    ? t("breakfast" as any)
    : mt === "lunch"
    ? t("lunch" as any)
    : mt === "dinner"
    ? t("dinner" as any)
    : t("snack" as any);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function NutritionSection({ targetGroup = "general" }: NutritionSectionProps) {
  const { language, dir, t } = useLanguage();
  const isAr = language === "ar";

  const [selectedMealType, setSelectedMealType] = useState<MealType>("");
  const [selectedCategoryAr, setSelectedCategoryAr] = useState<string>("");
  const [quickAddMeal, setQuickAddMeal] =
    useState<Exclude<MealType, "">>("breakfast");
  const [grams, setGrams] = useState<number>(150);
  const [foodTab, setFoodTab] = useState<"all" | "byMeal" | "byCategory">(
    "all"
  );

  const foods = useQuery(api.nutrition.getAllFoods, {
    category: selectedCategoryAr || undefined,
    mealType: (selectedMealType || undefined) as any,
    isDiabeticFriendly: targetGroup === "diabetes" ? true : undefined,
    isSeniorFriendly: targetGroup === "seniors" ? true : undefined,
    isChildFriendly: targetGroup === "children" ? true : undefined,
  });

  const plans = useQuery(api.nutrition.getNutritionPlans, { targetGroup });
  const log = useQuery(api.nutrition.getUserNutritionLog, {
    date: todayISO(),
  });

  const applyPlan = useMutation(api.nutrition.applyPlanToTodayLog);
  const addToMeal = useMutation(api.nutrition.addFoodToLogMeal);
  const updateQty = useMutation(api.nutrition.updateLogMealFoodQuantity);
  const clearLog = useMutation(api.nutrition.clearTodayLog);
  const setWater = useMutation(api.nutrition.setWaterIntake);

  const header = useMemo(() => {
    if (targetGroup === "diabetes") {
      return {
        icon: "🩺",
        title: isAr ? "تغذية لمرضى السكري" : "Diabetes Nutrition",
        desc: isAr
          ? "اختيارات تقلل تذبذب السكر (ألياف أعلى + سكر أقل) مع خطط جاهزة."
          : "Choices that stabilize blood sugar (more fiber, less sugar) with ready plans.",
      };
    }
    if (targetGroup === "seniors") {
      return {
        icon: "👴",
        title: isAr ? "تغذية لكبار السن" : "Seniors Nutrition",
        desc: isAr
          ? "وجبات سهلة تدعم العضلات والعظام وتقلل الإرهاق."
          : "Easy meals that support muscles & bones and reduce fatigue.",
      };
    }
    if (targetGroup === "children") {
      return {
        icon: "👶",
        title: isAr ? "تغذية للأطفال" : "Kids Nutrition",
        desc: isAr
          ? "أفكار وجبات ممتعة ومتوازنة للنمو والطاقة."
          : "Fun, balanced meal ideas for growth and energy.",
      };
    }
    return {
      icon: "🥗",
      title: isAr ? "قسم التغذية" : "Nutrition",
      desc: isAr
        ? "تعرّف على سعراتك اليومية، وطبّق خطة أو سجّل وجباتك بسهولة."
        : "See your daily calories, apply a plan or log meals with ease.",
    };
  }, [targetGroup, isAr]);

  const categoriesShown = useMemo(() => {
    const arList = (() => {
      if (targetGroup === "diabetes")
        return [
          "خضروات",
          "بروتينات",
          "حبوب كاملة",
          "دهون صحية",
          "مشروبات بدون سكر",
        ];
      if (targetGroup === "seniors")
        return ["بروتينات", "منتجات الألبان", "شوربات", "حبوب", "خضروات"];
      if (targetGroup === "children")
        return ["فواكه", "خضروات", "منتجات الألبان", "سناكات صحية", "حبوب"];
      return [
        "فواكه",
        "خضروات",
        "بروتينات",
        "حبوب",
        "منتجات الألبان",
        "دهون صحية",
        "مكسرات",
        "مشروبات",
      ];
    })();

    if (!isAr) return arList.map((ar) => CATEGORY_AR_TO_EN[ar] || ar);
    return arList;
  }, [targetGroup, isAr]);

  const dayCalories = Number(log?.totalDailyCalories || 0);
  const targetCalories = useMemo(() => {
    if (targetGroup === "children") return 1600;
    if (targetGroup === "seniors") return 1800;
    if (targetGroup === "diabetes") return 1900;
    return 2200;
  }, [targetGroup]);

  const progress = Math.min(
    100,
    Math.round((dayCalories / Math.max(1, targetCalories)) * 100)
  );
  const waterMl = Number(log?.waterIntake || 0);

  const foodName = (f: any) =>
    (isAr ? f.nameAr : f.name) || (isAr ? "بدون اسم" : "Untitled");
  const foodSubName = (f: any) => (isAr ? f.name : f.nameAr);

  const mealTypesArr: Array<Exclude<MealType, "">> = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
  ];

  const mealBlocks = useMemo(() => {
    const meals = log?.meals || [];
    const byType: Record<string, any> = {};
    for (const m of meals) byType[m.mealType] = m;
    return mealTypesArr.map(
      (mt) => byType[mt] || { mealType: mt, foods: [], totalCalories: 0 }
    );
  }, [log]);

  async function onApplyPlan(planId: string) {
    await applyPlan({ planId: planId as any, mode: "merge" });
  }

  async function onQuickAdd(foodId: string) {
    await addToMeal({
      mealType: quickAddMeal as any,
      foodId: foodId as any,
      quantity: grams,
      date: todayISO(),
    });
  }

  async function onInc(mt: any, foodId: any, current: number) {
    await updateQty({
      mealType: mt,
      foodId,
      quantity: current + 50,
      date: todayISO(),
    });
  }
  async function onDec(mt: any, foodId: any, current: number) {
    const next = Math.max(0, current - 50);
    await updateQty({
      mealType: mt,
      foodId,
      quantity: next,
      date: todayISO(),
    });
  }
  async function onRemove(mt: any, foodId: any) {
    await updateQty({ mealType: mt, foodId, quantity: 0, date: todayISO() });
  }

  return (
    <div
      dir={dir}
      lang={language}
      className="
        space-y-6 min-h-[70vh] px-3 sm:px-0 py-4 sm:py-6
        bg-gradient-to-b from-herb-50 to-herb-100
        dark:bg-[#020617] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(0,255,102,0.08),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(0,255,102,0.06),transparent_55%)]
      "
    >
      {/* HERO / SUMMARY */}
      <div className="rounded-3xl border bg-white shadow-soft border-herb-100/70 dark:border-[#00ff66]/35 dark:bg-black/60 backdrop-blur-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
          {/* title + desc */}
          <div
            className={cn(
              "flex items-start gap-3",
              isAr ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className="h-12 w-12 rounded-3xl bg-gradient-to-br from-herb-500 via-[#00ff66]/70 to-herb-700 border border-[#00ff66]/60 flex items-center justify-center">
              <Salad className="h-6 w-6 text-white" />
            </div>
            <div className={isAr ? "text-right" : "text-left"}>
              <div
                className={cn(
                  "flex items-center gap-2",
                  isAr ? "flex-row-reverse" : "flex-row"
                )}
              >
                <span className="text-2xl">{header.icon}</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50">
                  {header.title}
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {header.desc}
              </p>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {isAr ? "تاريخ اليوم:" : "Today:"}{" "}
                <span
                  className="font-extrabold text-slate-900 dark:text-slate-50"
                  dir="ltr"
                >
                  {todayISO()}
                </span>
              </div>
            </div>
          </div>

          {/* calories + water */}
          <div className="flex flex-1 flex-col sm:flex-row gap-4 justify-end w-full">
            {/* calories */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-white dark:bg-black/60 border border-slate-200 dark:border-slate-800" />
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-herb-300/60 to-transparent dark:from-[#00ff66]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50" dir="ltr">
                      {dayCalories}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      kcal
                    </div>
                  </div>
                </div>
              </div>
              <div className={isAr ? "text-right" : "text-left"}>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? "هدف اليوم" : "Daily target"}
                </div>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-50" dir="ltr">
                  {targetCalories} kcal
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ff66] to-[#59f20d]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400" dir="ltr">
                  {progress}% {isAr ? "من الهدف" : "of target"}
                </div>
              </div>
            </div>

            {/* water */}
            <div className="flex-1 rounded-2xl border bg-white border-sky-200 shadow-soft dark:border-sky-500/40 dark:bg-black/50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className={isAr ? "text-right" : "text-left"}>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? "شرب الماء" : "Water intake"}
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-50" dir="ltr">
                    {waterMl} ml
                  </div>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-b from-sky-200 to-sky-500/80 border border-sky-300 dark:from-black dark:to-sky-600/70 dark:border-sky-500/60 grid place-items-center">
                  <Droplets className="h-5 w-5 text-sky-800 dark:text-sky-100" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={100}
                  value={waterMl}
                  onChange={(e) =>
                    setWater({
                      waterIntake: Number(e.target.value),
                      date: todayISO(),
                    })
                  }
                  className="w-full accent-sky-400"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-2xl bg-sky-500 text-[11px] text-white font-extrabold hover:bg-sky-600"
                  onClick={() =>
                    setWater({
                      waterIntake: waterMl + 250,
                      date: todayISO(),
                    })
                  }
                >
                  +250
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? "استهدف 2000–3000ml يوميًا"
                  : "Aim for 2000–3000 ml daily"}
              </div>
            </div>
          </div>
        </div>

        {/* quick CTA */}
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:bg-black/60 dark:hover:bg-[#0a0d08]"
            onClick={() => clearLog({ date: todayISO() })}
          >
            {isAr ? "تفريغ سجل اليوم" : "Clear today log"}
          </button>
          <a
            href="#foods"
            className="px-4 py-2 rounded-2xl bg-[#00ff66] text-black text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            {isAr ? "إضافة طعام" : "Add food"}
          </a>
        </div>
      </div>

      {/* PLANS */}
      <div className="rounded-3xl border bg-white border-herb-100 shadow-soft dark:border-slate-800 dark:bg-black/60 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1",
                isAr ? "flex-row-reverse" : "flex-row"
              )}
            >
              <ClipboardCheck className="h-5 w-5 text-[#00ff66]" />
              <span>
                {isAr
                  ? "خطط جاهزة (تضاف تلقائيًا لسجل اليوم)"
                  : "Ready plans (auto-log to today)"}
              </span>
            </span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr
              ? "يمكنك التعديل بعد التطبيق"
              : "You can edit after applying"}
          </span>
        </div>

        {!plans ? (
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t("loading" as any)}
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {isAr ? "لا توجد خطط مفعلة حاليًا." : "No active plans yet."}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {plans.map((p: any) => (
              <div
                key={p._id}
                className="rounded-2xl border border-herb-100 bg-white shadow-soft dark:border-slate-800 dark:bg-gradient-to-br dark:from-black dark:via-[#020617] dark:to-black p-4 flex items-start justify-between gap-3"
              >
                <div
                  className={cn(
                    "min-w-0",
                    isAr ? "text-right" : "text-left"
                  )}
                >
                  <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">
                    {isAr ? p.nameAr : p.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {isAr ? p.descriptionAr : p.description}
                  </div>
                  <div
                    className="mt-2 text-[11px] text-slate-500 dark:text-slate-400"
                    dir="ltr"
                  >
                    {p.totalDailyCalories} kcal / day
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-2xl bg-[#00ff66] text-black text-xs font-extrabold hover:brightness-110 whitespace-nowrap"
                  onClick={() => onApplyPlan(String(p._id))}
                >
                  {isAr ? "تطبيق الخطة" : "Apply plan"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODAY LOG / MEALS */}
      <div className="rounded-3xl border bg-white border-herb-100 shadow-soft dark:border-slate-800 dark:bg-black/60 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50">
            <span
              className={cn(
                "flex items-center gap-2",
                isAr ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Utensils className="h-5 w-5 text-[#00ff66]" />
              <span>{isAr ? "وجبات اليوم" : "Today meals"}</span>
            </span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr
              ? "تعديل سريع للكميات (+50/-50)"
              : "Quick adjust quantities (+50/-50)"}
          </span>
        </div>

        {!log ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-black/70 dark:text-slate-300">
            {isAr
              ? "لم تسجّل أي وجبة اليوم بعد — طبّق خطة أو أضف طعامًا من الأسفل."
              : "No meals logged yet — apply a plan or add foods below."}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {mealBlocks.map((m: any) => (
              <div
                key={m.mealType}
                className="rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-gradient-to-b dark:from-[#020617] dark:to-black p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "min-w-0",
                      isAr ? "text-right" : "text-left"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isAr ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Flame className="h-5 w-5 text-[#59f20d] dark:text-emerald-100" />
                      <span className="font-extrabold text-slate-900 dark:text-slate-50">
                        {mealLabel(t, m.mealType)}
                      </span>
                    </div>
                    <div
                      className="text-[11px] text-slate-500 dark:text-slate-400 mt-1"
                      dir="ltr"
                    >
                      {Math.round(Number(m.totalCalories || 0))} kcal
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ff66] to-[#59f20d]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (Number(m.totalCalories || 0) /
                            Math.max(1, targetCalories / 4)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>

                {(!m.foods || m.foods.length === 0) ? (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? "لا توجد عناصر في هذه الوجبة بعد."
                      : "No items in this meal yet."}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {m.foods.map((it: any) => {
                      const food = (foods || []).find(
                        (x: any) => String(x._id) === String(it.foodId)
                      );
                      const title = food
                        ? foodName(food)
                        : isAr
                        ? "عنصر"
                        : "Item";

                      return (
                        <div
                          key={String(it.foodId)}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-black/70"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div
                              className={cn(
                                "min-w-0",
                                isAr ? "text-right" : "text-left"
                              )}
                            >
                              <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">
                                {title}
                              </div>
                              <div
                                className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2"
                                dir="ltr"
                              >
                                <span>
                                  {Math.round(Number(it.quantity || 0))} g
                                </span>
                                <span className="opacity-60">•</span>
                                <span>
                                  {Math.round(Number(it.calories || 0))} kcal
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="h-8 w-8 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-black/70 dark:hover:bg-[#0a0d08] grid place-items-center"
                                onClick={() =>
                                  onInc(
                                    m.mealType,
                                    it.foodId,
                                    Number(it.quantity || 0)
                                  )
                                }
                                title="+50g"
                              >
                                <Plus className="h-4 w-4 text-slate-800 dark:text-slate-100" />
                              </button>
                              <button
                                type="button"
                                className="h-8 w-8 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-black/70 dark:hover:bg-[#0a0d08] grid place-items-center"
                                onClick={() =>
                                  onDec(
                                    m.mealType,
                                    it.foodId,
                                    Number(it.quantity || 0)
                                  )
                                }
                                title="-50g"
                              >
                                <Minus className="h-4 w-4 text-slate-800 dark:text-slate-100" />
                              </button>
                              <button
                                type="button"
                                className="h-8 w-8 rounded-2xl border border-rose-300 bg-rose-50 hover:bg-rose-100 dark:border-rose-500/50 dark:bg-black/70 dark:hover:bg-rose-600/20 grid place-items-center"
                                onClick={() => onRemove(m.mealType, it.foodId)}
                                title={isAr ? "حذف" : "Remove"}
                              >
                                <Trash2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <a
                    href="#foods"
                    className="text-[11px] font-extrabold text-[#4ed10a] hover:underline dark:text-[#00ff66]"
                    onClick={() => setQuickAddMeal(m.mealType)}
                  >
                    {isAr
                      ? "أضف طعامًا لهذه الوجبة"
                      : "Add food to this meal"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOODS PICKER */}
      <div
        id="foods"
        className="rounded-3xl border bg-white border-herb-100 shadow-soft dark:border-slate-800 dark:bg-black/60 backdrop-blur-xl p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50">
            {isAr
              ? "اختيار طعام وإضافته للسجل"
              : "Pick a food and log it"}
          </h3>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold",
                foodTab === "all"
                  ? "bg-[#00ff66] text-black"
                  : "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
              )}
              onClick={() => setFoodTab("all")}
            >
              {isAr ? "كل الأطعمة" : "All foods"}
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold",
                foodTab === "byMeal"
                  ? "bg-[#00ff66] text-black"
                  : "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
              )}
              onClick={() => setFoodTab("byMeal")}
            >
              {isAr ? "حسب الوجبة" : "By meal"}
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold",
                foodTab === "byCategory"
                  ? "bg-[#00ff66] text-black"
                  : "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
              )}
              onClick={() => setFoodTab("byCategory")}
            >
              {isAr ? "حسب الفئة" : "By category"}
            </button>
          </div>
        </div>

        {/* quick add controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2 justify-end">
          <select
            className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 dark:border-slate-700 dark:bg-black/70 dark:text-slate-100"
            value={quickAddMeal}
            onChange={(e) => setQuickAddMeal(e.target.value as any)}
          >
            {mealTypesArr.map((mt) => (
              <option key={mt} value={mt}>
                {mealLabel(t, mt)}
              </option>
            ))}
          </select>

          <input
            className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 w-24 dark:border-slate-700 dark:bg-black/70 dark:text-slate-100"
            type="number"
            min={10}
            step={10}
            value={grams}
            onChange={(e) => setGrams(Number(e.target.value))}
            dir="ltr"
          />
        </div>

        {/* filters */}
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          {foodTab === "byMeal" && (
            <>
              <button
                type="button"
                className={
                  selectedMealType === ""
                    ? "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-[#00ff66] text-black"
                    : "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
                }
                onClick={() => setSelectedMealType("")}
              >
                {isAr ? "كل الوجبات" : "All"}
              </button>
              {mealTypesArr.map((mt) => (
                <button
                  key={mt}
                  type="button"
                  className={
                    selectedMealType === mt
                      ? "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-[#00ff66] text-black"
                      : "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
                  }
                  onClick={() => setSelectedMealType(mt)}
                >
                  {mealLabel(t, mt)}
                </button>
              ))}
            </>
          )}

          {foodTab === "byCategory" && (
            <>
              <button
                type="button"
                className={
                  selectedCategoryAr === ""
                    ? "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-[#00ff66] text-black"
                    : "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
                }
                onClick={() => setSelectedCategoryAr("")}
              >
                {isAr ? "كل الفئات" : "All categories"}
              </button>
              {categoriesShown.map((catShown) => {
                const catAr = isAr
                  ? catShown
                  : Object.keys(CATEGORY_AR_TO_EN).find(
                      (k) => CATEGORY_AR_TO_EN[k] === catShown
                    ) || "";
                return (
                  <button
                    key={catShown}
                    type="button"
                    className={
                      selectedCategoryAr === catAr
                        ? "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-[#00ff66] text-black"
                        : "px-3 py-1.5 rounded-2xl text-[11px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/70 dark:text-slate-200 dark:border-slate-700"
                    }
                    onClick={() => setSelectedCategoryAr(catAr)}
                  >
                    {catShown}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* FOODS GRID */}
        <div className="mt-4">
          {foods === undefined ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("loading" as any)}
            </div>
          ) : foods.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-black/70 dark:text-slate-300">
              {isAr
                ? "لا توجد نتائج — غيّر الفلاتر أو أضف أطعمة من لوحة الإدارة."
                : "No results — change filters or add foods from admin."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {foods.map((f: any) => (
                <div
                  key={f._id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-soft p-4 hover:border-herb-300 hover:-translate-y-1 transition-all dark:border-slate-800 dark:bg-gradient-to-b dark:from-[#020617] dark:to-black dark:hover:border-[#00ff66]/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "min-w-0",
                        isAr ? "text-right" : "text-left"
                      )}
                    >
                      <div className="font-extrabold text-slate-900 dark:text-slate-50 truncate">
                        {foodName(f)}
                      </div>
                      {foodSubName(f) && (
                        <div
                          className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                          dir={isAr ? "ltr" : "rtl"}
                        >
                          {foodSubName(f)}
                        </div>
                      )}
                      <div
                        className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2"
                        dir="ltr"
                      >
                        <span>{f.caloriesPer100g} kcal / 100g</span>
                        <span className="opacity-60">•</span>
                        <span>P {f.proteinPer100g}g</span>
                        <span>C {f.carbsPer100g}g</span>
                        <span>F {f.fatPer100g}g</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-2 rounded-2xl bg-[#00ff66] text-black text-[11px] font-extrabold hover:brightness-110 flex items-center gap-1"
                      onClick={() => onQuickAdd(String(f._id))}
                    >
                      <Plus className="h-3 w-3" />
                      {isAr ? "إضافة" : "Add"}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 justify-end">
                    {f.isDiabeticFriendly && (
                      <span className="px-3 py-1 rounded-full text-[10px] bg-sky-100 border border-sky-200 text-sky-700 font-extrabold dark:bg-sky-500/20 dark:border-sky-400/40 dark:text-sky-100">
                        {isAr ? "مناسب للسكري" : "Diabetes"}
                      </span>
                    )}
                    {f.isSeniorFriendly && (
                      <span className="px-3 py-1 rounded-full text-[10px] bg-violet-100 border border-violet-200 text-violet-700 font-extrabold dark:bg-violet-500/20 dark:border-violet-400/40 dark:text-violet-100">
                        {isAr ? "كبار السن" : "Seniors"}
                      </span>
                    )}
                    {f.isChildFriendly && (
                      <span className="px-3 py-1 rounded-full text-[10px] bg-rose-100 border border-rose-200 text-rose-700 font-extrabold dark:bg-rose-500/20 dark:border-rose-400/40 dark:text-rose-100">
                        {isAr ? "أطفال" : "Kids"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
