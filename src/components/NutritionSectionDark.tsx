import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Salad,
  Droplets,
  Flame,
  Plus,
  Trash2,
  Minus,
  Utensils,
  ClipboardCheck,
  ScanLine,
  Bell,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { AIMealSuggestion } from "./AIMealSuggestion";
import { BarcodeScanner } from "./BarcodeScanner";

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

export default function NutritionSectionDark({ targetGroup = "general" }: NutritionSectionProps) {
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

  // Modal state for adding food to meal
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<Exclude<MealType, "">>("breakfast");

  // Notification dismissal state
  const [dismissWaterReminder, setDismissWaterReminder] = useState(false);

  // Quick barcode scanner state for hero area
  const [heroScanMeal, setHeroScanMeal] = useState<Exclude<MealType, "">>('breakfast');

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
  const addScanned = useMutation(api.nutrition.addScannedFoodToLog);

  const userProfile = useQuery(api.profiles.getCurrentProfile);

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
    if (userProfile?.calories) return userProfile.calories;
    if (targetGroup === "children") return 1600;
    if (targetGroup === "seniors") return 1800;
    if (targetGroup === "diabetes") return 1900;
    return 2200;
  }, [targetGroup, userProfile]);

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
      className="min-h-screen bg-black text-white py-6 px-4 space-y-5"
    >
      {/* Header with Search */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#59f20d] flex items-center justify-center">
          <Salad className="h-6 w-6 text-black" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={isAr ? "ابحث عن طعام أو احسب السعرات الحرارية..." : "Search food..."}
            className="w-full bg-zinc-900 text-white placeholder-gray-500 rounded-2xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#59f20d]/50"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Daily Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 space-y-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#59f20d]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{isAr ? "الملخص اليومي" : "Daily Summary"}</h3>
            <p className="text-sm text-gray-400">
              {isAr ? "الأربعاء 14 فبراير" : todayISO()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BarcodeScanner
              onAddFood={(food, mealType) => {
                addScanned({
                  mealType: mealType as any,
                  barcode: food.barcode,
                  foodData: {
                    nameEn: food.nameEn,
                    nameAr: food.nameAr,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                  }
                });
              }}
              triggerLabel={isAr ? "مسح الباركود" : "Scan QR"}
              triggerClassName="px-4 py-2 bg-[#59f20d]/10 border border-[#59f20d] rounded-2xl text-[#59f20d] text-sm font-bold hover:bg-[#59f20d]/20 transition-colors flex items-center gap-2"
            />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center py-6">
          <div className="relative w-full max-w-[16rem] aspect-square mx-auto">
            <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke="#1a1a1a"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke="#59f20d"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)
                  }`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-400 mb-1">
                {isAr ? "إجمالي السعرات اليومية" : "Total Daily Calories"}
              </div>
              <div className="text-5xl font-black">{dayCalories}</div>
              <div className="text-sm text-[#59f20d] mt-1">
                {isAr ? "سعرة حرارية" : "calories"}
              </div>
            </div>
          </div>
        </div>

        {/* Macro Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400">{isAr ? "بروتين" : "Protein"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.3 / 4)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{isAr ? "كاربوهيدرات" : "Carbs"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.5 / 4)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{isAr ? "دهون" : "Fat"}</div>
            <div className="text-2xl font-black text-white">{Math.round(dayCalories * 0.2 / 9)}</div>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "بروتين" : "Protein"} (30%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.3 / 4)}g / {Math.round(targetCalories * 0.3 / 4)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#59f20d] rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "كاربوهيدرات" : "Carbs"} (50%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.5 / 4)}g / {Math.round(targetCalories * 0.5 / 4)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{isAr ? "دهون" : "Fat"} (20%)</span>
              <span className="text-white">
                {Math.round(dayCalories * 0.2 / 9)}g / {Math.round(targetCalories * 0.2 / 9)}g
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dayCalories / Math.max(1, targetCalories)) * 100)}%` }}
                transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Water Intake */}
      <div className="bg-zinc-900 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <button
            onClick={() => setWater({ waterIntake: waterMl + 250, date: todayISO() })}
            className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center flex-shrink-0 hover:scale-110 active:scale-95 transition-transform shadow-[0_0_12px_rgba(89,242,13,0.3)]"
          >
            <Plus className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={() => setWater({ waterIntake: Math.max(0, waterMl - 250), date: todayISO() })}
            disabled={waterMl === 0}
            className="w-12 h-12 rounded-full bg-zinc-800 disabled:opacity-50 text-gray-400 flex items-center justify-center flex-shrink-0 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                animate={{ height: waterMl >= i * 250 ? 32 : 20, opacity: waterMl >= i * 250 ? 1 : 0.35 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-2 rounded-full",
                  waterMl >= i * 250
                    ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                    : "bg-zinc-700"
                )}
              />
            ))}
          </div>
          <div>
            <div className="text-sm font-bold">{isAr ? "شرب الماء" : "Water Intake"}</div>
            <div className="text-xs text-gray-400">{waterMl}ml {isAr ? "من 2000 ml" : "of 2000 ml"}</div>
          </div>
        </div>
        <Droplets className="h-8 w-8 text-blue-400 flex-shrink-0" />
      </div>

      {/* AI Meal Suggestion */}
      <AIMealSuggestion />

      {/* Daily Meals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isAr ? "الوجبات اليومية" : "Daily Meals"}</h3>
          <button
            onClick={() => clearLog({ date: todayISO() })}
            className="text-sm text-[#59f20d]"
          >
            {isAr ? "تعديل خطة" : "Edit Plan"}
          </button>
        </div>

        {/* Meal Cards */}
        {mealBlocks.map((meal) => {
          const mealName = mealLabel(t, meal.mealType);
          const mealIcon = meal.mealType === "breakfast" ? "🍳" :
            meal.mealType === "lunch" ? "🥗" :
              meal.mealType === "dinner" ? "🍽️" : "🍎";

          return (
            <div
              key={meal.mealType}
              className="bg-zinc-900 rounded-3xl border-2 border-[#59f20d]/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMealForAdd(meal.mealType as any);
                        setShowFoodModal(true);
                      }}
                      className="w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center hover:scale-110 transition-transform"
                      title={isAr ? "إضافة طعام" : "Add food"}
                    >
                      <Plus className="w-5 h-5 text-black" />
                    </button>
                    <BarcodeScanner
                      onAddFood={(food, mealType) => {
                        addScanned({
                          mealType: mealType as any,
                          barcode: food.barcode,
                          foodData: {
                            nameEn: food.nameEn,
                            nameAr: food.nameAr,
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                          }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold flex items-center gap-2">
                      <span>{mealIcon}</span>
                      {mealName}
                    </h4>
                    <p className="text-xs text-gray-400">{meal.totalCalories} {isAr ? "سعرة حرارية" : "calories"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{isAr ? "وجبة" : "Meal"}</div>
                  <div className="text-sm font-bold">{meal.foods.length} {isAr ? "عناصر" : "items"}</div>
                </div>
              </div>

              {/* Foods in this meal */}
              {meal.foods.length > 0 ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800">
                  {meal.foods.map((f: any) => {
                    const food = foods?.find((fd) => fd._id === f.foodId);
                    if (!food) return null;
                    return (
                      <div key={f.foodId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDec(meal.mealType, f.foodId, f.quantity)}
                            className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm">{foodName(food)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{f.quantity}g</span>
                          <button
                            onClick={() => onInc(meal.mealType, f.foodId, f.quantity)}
                            className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemove(meal.mealType, f.foodId)}
                            className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center ml-1"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {isAr
                      ? `لم يتم تسجيل وجبة ${mealName} بعد`
                      : `No ${mealName} logged yet`}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMealForAdd(meal.mealType as any);
                      setShowFoodModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#59f20d]/10 hover:bg-[#59f20d]/20 border border-[#59f20d]/30 rounded-xl text-[#59f20d] text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    {isAr ? "سجل الآن" : "Log Now"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Meal Suggestion */}
      <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-5 flex items-center gap-4 backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-orange-50">{isAr ? "وجبات خفيفة" : "Snack Meals"}</h4>
          <p className="text-xs text-orange-200/60 mt-0.5">{isAr ? "6-7 وجبات • مستحسنة" : "6-7 meals • Recommended"}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMealForAdd("snack");
            setShowFoodModal(true);
          }}
          className="ml-auto w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center shadow-[0_0_15px_rgba(89,242,13,0.3)] hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Floating Inline Water Reminder */}
      <AnimatePresence>
        {!dismissWaterReminder && waterMl < 2000 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-zinc-950/80 backdrop-blur-xl border border-blue-500/30 rounded-[1.5rem] p-5 shadow-[0_0_30px_rgba(59,130,246,0.15)] mt-4"
          >
            {/* Inner Glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/5 blur-xl pointer-events-none rounded-b-[1.5rem]" />
            
            <button
              onClick={() => setDismissWaterReminder(true)}
              className="absolute top-3 left-3 w-6 h-6 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2 px-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-bold text-base mb-1">
                {isAr ? "تذكير شرب الماء" : "Water Reminder"}
              </h4>
              <p className="text-sm text-gray-400 mb-5">
                {isAr ? "هل شربت كمية كافية من الماء اليوم؟" : "Did you drink enough water today?"}
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDismissWaterReminder(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-medium transition-colors"
                >
                  {isAr ? "لا، ذكرني لاحقاً" : "No, remind later"}
                </button>
                <button
                  onClick={() => {
                    setWater({ waterIntake: waterMl + 250, date: todayISO() });
                    // Optional: auto-dismiss on adding a certain amount
                    if (waterMl + 250 >= 2000) setDismissWaterReminder(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isAr ? "نعم، أضف كوباً" : "Yes, add a cup"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      <button 
        onClick={() => {
          setSelectedMealForAdd("breakfast"); // default
          setShowFoodModal(true);
        }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#59f20d] flex items-center justify-center shadow-[0_0_25px_rgba(89,242,13,0.5)] hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-7 h-7 text-black" />
      </button>

      {/* Food Selection Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-3xl border-2 border-[#59f20d]/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">
                {isAr ? "اختر الطعام" : "Select Food"}
              </h3>
              <button
                onClick={() => setShowFoodModal(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Meal Type Badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/30">
              <span className="text-sm font-bold text-[#59f20d]">
                {mealLabel(t, selectedMealForAdd)}
              </span>
            </div>

            {/* Food List */}
            <div className="space-y-2">
              {foods && foods.length > 0 ? (
                foods.map((food) => (
                  <button
                    key={food._id}
                    onClick={() => {
                      addToMeal({
                        mealType: selectedMealForAdd as any,
                        foodId: food._id as any,
                        quantity: 100,
                        date: todayISO(),
                      });
                      setShowFoodModal(false);
                    }}
                    className="w-full p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-[#59f20d]/50 transition-all text-right flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-white mb-1">{foodName(food)}</h4>
                      <p className="text-xs text-gray-400">
                        {food.calories} {isAr ? "سعرة حرارية" : "cal"} •
                        {food.protein}g {isAr ? "بروتين" : "protein"} •
                        {food.carbs}g {isAr ? "كارب" : "carbs"}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#59f20d]/20 group-hover:bg-[#59f20d] flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-[#59f20d] group-hover:text-black transition-colors" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {isAr ? "لا توجد أطعمة متاحة" : "No foods available"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer for Navigation */}
      <div className="h-20"></div>
    </div>
  );
}
