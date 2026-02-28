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
  ScanLine,
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
      <div className="bg-zinc-900 rounded-3xl border-2 border-[#59f20d]/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{isAr ? "الملخص اليومي" : "Daily Summary"}</h3>
            <p className="text-sm text-gray-400">
              {isAr ? "الأربعاء 14 فبراير" : todayISO()}
            </p>
          </div>
          <button className="px-4 py-2 bg-[#59f20d]/10 border border-[#59f20d] rounded-2xl text-[#59f20d] text-sm font-bold">
            {isAr ? "قراءة المسح" : "Scan QR"}
          </button>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center py-6">
          <div className="relative w-64 h-64">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#1a1a1a"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#59f20d"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 110}`}
                strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)
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
              <div
                className="h-full bg-[#59f20d] rounded-full"
                style={{ width: `${Math.min(100, (dayCalories / targetCalories) * 100)}%` }}
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
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(100, (dayCalories / targetCalories) * 100)}%` }}
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
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(100, (dayCalories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Water Intake */}
      <div className="bg-zinc-900 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWater({ waterIntake: waterMl + 250, date: todayISO() })}
            className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={() => setWater({ waterIntake: Math.max(0, waterMl - 250), date: todayISO() })}
            disabled={waterMl === 0}
            className="w-12 h-12 rounded-full bg-zinc-800 disabled:opacity-50 text-gray-400 flex items-center justify-center flex-shrink-0 hover:bg-red-500/20 hover:text-red-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-8 rounded-full transition-colors",
                  waterMl >= i * 250 ? "bg-blue-500" : "bg-zinc-800"
                )}
              />
            ))}
          </div>
          <div>
            <div className="text-sm font-bold">{isAr ? "شرب الماء" : "Water"}</div>
            <div className="text-xs text-gray-400">{waterMl}ml {isAr ? "من 8 أكواب" : "of 8 cups"}</div>
          </div>
        </div>
        <Droplets className="h-8 w-8 text-blue-400" />
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
              {meal.foods.length > 0 && (
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
              )}
            </div>
          );
        })}
      </div>

      {/* Empty Meal Placeholder */}
      <div className="bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800 p-8 text-center">
        <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-gray-400 mb-1">{isAr ? "عشاء" : "Dinner"}</h4>
        <p className="text-sm text-gray-500 mb-3">{isAr ? "لم يتم تسجيل أي طعام بعد" : "No food logged yet"}</p>
        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-medium transition-colors">
          {isAr ? "سجل الآن" : "Log Now"}
        </button>
      </div>

      {/* Quick Meal Suggestion */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 rounded-3xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold">{isAr ? "وجبات خفيفة" : "Snack Meals"}</h4>
          <p className="text-sm text-gray-300">{isAr ? "6-7 وجبات • مستحسنة" : "6-7 meals • Recommended"}</p>
        </div>
        <button className="ml-auto w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center">
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#59f20d] flex items-center justify-center shadow-2xl shadow-[#59f20d]/50">
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
