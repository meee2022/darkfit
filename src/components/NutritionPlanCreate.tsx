import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../lib/i18n";
import { Id } from "../../convex/_generated/dataModel";

type MealFood = {
  foodId: Id<"foods"> | null;
  foodName: string;
  foodNameAr: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Meal = {
  name: string;
  nameAr: string;
  foods: MealFood[];
  totalCalories: number;
};

type DayPlan = {
  dayNumber: number;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export function NutritionPlanCreate({ clientId, onClose }: { clientId?: Id<"profiles">; onClose?: () => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const profiles = useQuery(api.profiles.listAllProfiles);
  const foods = useQuery(api.nutrition.getAllFoods, {});
  const createPlan = useMutation(api.nutrition.createUserNutritionPlan);

  const [selectedClient, setSelectedClient] = useState<Id<"profiles"> | "">(clientId || "");
  const [selectedDay, setSelectedDay] = useState(1);
  const [days, setDays] = useState<DayPlan[]>([
    {
      dayNumber: 1,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    },
  ]);

  const [targetCalories, setTargetCalories] = useState(2450);
  const [targetProtein, setTargetProtein] = useState(180);
  const [targetCarbs, setTargetCarbs] = useState(300);
  const [targetFat, setTargetFat] = useState(70);

  const currentDay = days.find((d) => d.dayNumber === selectedDay) || days[0];

  const addDay = () => {
    const newDayNumber = Math.max(...days.map((d) => d.dayNumber), 0) + 1;
    setDays([
      ...days,
      {
        dayNumber: newDayNumber,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      },
    ]);
    setSelectedDay(newDayNumber);
  };

  const addMeal = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    const mealNames: Record<string, { en: string; ar: string }> = {
      breakfast: { en: "Breakfast", ar: "الفطور" },
      lunch: { en: "Lunch", ar: "الغداء" },
      dinner: { en: "Dinner", ar: "العشاء" },
      snack: { en: "Snack", ar: "وجبة خفيفة" },
    };

    const newMeal: Meal = {
      name: mealNames[mealType].en,
      nameAr: mealNames[mealType].ar,
      foods: [],
      totalCalories: 0,
    };

    setDays(
      days.map((d) =>
        d.dayNumber === selectedDay
          ? { ...d, meals: [...d.meals, newMeal] }
          : d
      )
    );
  };

  const addFoodToMeal = (mealIndex: number, foodId: Id<"foods">) => {
    const food = foods?.find((f) => f._id === foodId);
    if (!food) return;

    const newFood: MealFood = {
      foodId: food._id,
      foodName: food.name || "",
      foodNameAr: food.nameAr || "",
      quantity: 100,
      unit: food.unit || "g",
      calories: food.caloriesPer100 || 0,
      protein: food.proteinPer100 || 0,
      carbs: food.carbsPer100 || 0,
      fat: food.fatPer100 || 0,
    };

    setDays(
      days.map((d) =>
        d.dayNumber === selectedDay
          ? {
              ...d,
              meals: d.meals.map((m, i) =>
                i === mealIndex
                  ? {
                      ...m,
                      foods: [...m.foods, newFood],
                      totalCalories: m.totalCalories + newFood.calories,
                    }
                  : m
              ),
              totalCalories: d.totalCalories + newFood.calories,
              totalProtein: d.totalProtein + newFood.protein,
              totalCarbs: d.totalCarbs + newFood.carbs,
              totalFat: d.totalFat + newFood.fat,
            }
          : d
      )
    );
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    setDays(
      days.map((d) =>
        d.dayNumber === selectedDay
          ? {
              ...d,
              meals: d.meals.map((m, i) => {
                if (i === mealIndex) {
                  const foodToRemove = m.foods[foodIndex];
                  return {
                    ...m,
                    foods: m.foods.filter((_, fi) => fi !== foodIndex),
                    totalCalories: m.totalCalories - foodToRemove.calories,
                  };
                }
                return m;
              }),
              totalCalories: d.totalCalories - d.meals[mealIndex].foods[foodIndex].calories,
              totalProtein: d.totalProtein - d.meals[mealIndex].foods[foodIndex].protein,
              totalCarbs: d.totalCarbs - d.meals[mealIndex].foods[foodIndex].carbs,
              totalFat: d.totalFat - d.meals[mealIndex].foods[foodIndex].fat,
            }
          : d
      )
    );
  };

  const updateFoodQuantity = (mealIndex: number, foodIndex: number, newQuantity: number) => {
    setDays(
      days.map((d) =>
        d.dayNumber === selectedDay
          ? {
              ...d,
              meals: d.meals.map((m, i) => {
                if (i === mealIndex) {
                  const updatedFoods = m.foods.map((f, fi) => {
                    if (fi === foodIndex) {
                      const food = foods?.find((fd) => fd._id === f.foodId);
                      if (!food) return f;
                      const multiplier = newQuantity / 100;
                      return {
                        ...f,
                        quantity: newQuantity,
                        calories: Math.round((food.caloriesPer100 || 0) * multiplier),
                        protein: Math.round((food.proteinPer100 || 0) * multiplier),
                        carbs: Math.round((food.carbsPer100 || 0) * multiplier),
                        fat: Math.round((food.fatPer100 || 0) * multiplier),
                      };
                    }
                    return f;
                  });

                  return {
                    ...m,
                    foods: updatedFoods,
                    totalCalories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
                  };
                }
                return m;
              }),
            }
          : d
      )
    );

    // Recalculate day totals
    const updatedDay = days.find((d) => d.dayNumber === selectedDay);
    if (updatedDay) {
      const newTotals = updatedDay.meals.reduce(
        (acc, m) => {
          m.foods.forEach((f) => {
            acc.calories += f.calories;
            acc.protein += f.protein;
            acc.carbs += f.carbs;
            acc.fat += f.fat;
          });
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setDays(
        days.map((d) =>
          d.dayNumber === selectedDay
            ? {
                ...d,
                totalCalories: newTotals.calories,
                totalProtein: newTotals.protein,
                totalCarbs: newTotals.carbs,
                totalFat: newTotals.fat,
              }
            : d
        )
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error(isAr ? "يرجى اختيار المتدرب" : "Please select a client");
      return;
    }

    if (days.length === 0 || days.every((d) => d.meals.length === 0)) {
      toast.error(isAr ? "يرجى إضافة وجبات للخطة" : "Please add meals to the plan");
      return;
    }

    try {
      const planData = days.map((d) => ({
        dayNumber: d.dayNumber,
        meals: d.meals.map((m) => ({
          name: m.name,
          nameAr: m.nameAr,
          foods: m.foods.map((f) => ({
            foodId: f.foodId!,
            quantity: f.quantity,
            unit: f.unit,
          })),
        })),
      }));

      await createPlan({
        clientProfileId: selectedClient as Id<"profiles">,
        days: planData as any,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
      });

      toast.success(isAr ? "تم إنشاء الخطة الغذائية بنجاح" : "Nutrition plan created successfully");
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error.message || (isAr ? "فشل إنشاء الخطة" : "Failed to create plan"));
    }
  };

  const progressPercentage = currentDay.totalCalories > 0 ? Math.round((currentDay.totalCalories / targetCalories) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0d08] text-white py-6 px-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{isAr ? "إنشاء خطة غذائية" : "Create Nutrition Plan"}</h1>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-[#59f20d] text-black font-bold hover:bg-[#4ed10a] transition"
        >
          {isAr ? "حفظ" : "Save"}
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Client Selection */}
        <div className="bg-[#1a2318] rounded-2xl p-5 border border-[#2a3528]">
          <label className="block text-sm text-zinc-400 mb-2">
            {isAr ? "اختر المتدرب" : "Select Client"}
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value as any)}
            className="w-full bg-[#0a0d08] border border-[#2a3528] rounded-xl px-4 py-3 text-white outline-none focus:border-[#59f20d]"
          >
            <option value="">{isAr ? "ابحث عن اسم المتدرب..." : "Search for client name..."}</option>
            {profiles?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name || p.email || "No name"}
              </option>
            ))}
          </select>
        </div>

        {/* Day Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-zinc-400">{isAr ? "حدد اليوم" : "Select Day"}</h3>
            <button
              onClick={addDay}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30 hover:bg-[#59f20d]/20 transition"
            >
              + {isAr ? "يوم جديد" : "New Day"}
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition ${
                  selectedDay === day.dayNumber
                    ? "bg-[#59f20d] text-black"
                    : "bg-[#1a2318] text-zinc-400 border border-[#2a3528] hover:border-[#59f20d]/50"
                }`}
              >
                <div className="text-xs opacity-70">{isAr ? "اليوم" : "Day"}</div>
                <div className="text-2xl">0{day.dayNumber}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calorie Summary */}
        <div className="bg-gradient-to-br from-[#1a2318] to-[#0f1410] rounded-2xl p-5 border border-[#2a3528]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-zinc-500">{isAr ? "تم تحديد" : "Set"}</div>
              <div className="text-sm text-zinc-400 mt-1">
                {targetCalories.toLocaleString()} / {currentDay.totalCalories.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">{isAr ? "إجمالي السعرات المستهدفة" : "Total Target Calories"}</div>
              <div className="text-3xl font-black text-[#59f20d] mt-1">
                {targetCalories.toLocaleString()}
                <span className="text-sm text-zinc-500 ml-2">{isAr ? "سعرة" : "kcal"}</span>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "بروتين" : "Protein"}</span>
                <span className="text-white font-medium">{currentDay.totalProtein}g / {targetProtein}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#59f20d] rounded-full transition-all"
                  style={{ width: `${Math.min((currentDay.totalProtein / targetProtein) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "كربوهيدرات" : "Carbs"}</span>
                <span className="text-white font-medium">{currentDay.totalCarbs}g / {targetCarbs}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min((currentDay.totalCarbs / targetCarbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "دهون" : "Fat"}</span>
                <span className="text-white font-medium">{currentDay.totalFat}g / {targetFat}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${Math.min((currentDay.totalFat / targetFat) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Targets */}
          <div className="mt-5 pt-5 border-t border-[#2a3528]">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#59f20d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-white">{isAr ? "الأهداف اليومية (جرام) - السبت" : "Daily Goals (grams) - Saturday"}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0d08]/50 rounded-xl p-3 text-center">
                <div className="text-xs text-zinc-500">{isAr ? "بروتين" : "Protein"}</div>
                <div className="text-2xl font-black text-white mt-1">{targetProtein}</div>
              </div>
              <div className="bg-[#0a0d08]/50 rounded-xl p-3 text-center">
                <div className="text-xs text-zinc-500">{isAr ? "كربوهيدرات" : "Carbs"}</div>
                <div className="text-2xl font-black text-white mt-1">{targetCarbs}</div>
              </div>
              <div className="bg-[#0a0d08]/50 rounded-xl p-3 text-center">
                <div className="text-xs text-zinc-500">{isAr ? "دهون" : "Fat"}</div>
                <div className="text-2xl font-black text-white mt-1">{targetFat}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">{isAr ? "الوجبات المخططة" : "Planned Meals"}</h3>
            <button
              onClick={() => addMeal("breakfast")}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30 hover:bg-[#59f20d]/20 transition"
            >
              + {isAr ? "إضافة طعام" : "Add Food"}
            </button>
          </div>

          {currentDay.meals.length === 0 ? (
            <div className="bg-[#1a2318] rounded-2xl p-8 border border-[#2a3528] text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm text-zinc-400">{isAr ? "لم تضف أي الطعام بعد" : "No meals added yet"}</p>
              <button
                onClick={() => addMeal("breakfast")}
                className="mt-4 px-4 py-2 rounded-xl bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30 text-sm font-medium hover:bg-[#59f20d]/20 transition"
              >
                {isAr ? "إضافة طعام" : "Add Food"}
              </button>
            </div>
          ) : (
            currentDay.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="bg-[#1a2318] rounded-2xl p-5 border border-[#2a3528]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#59f20d]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#59f20d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{isAr ? meal.nameAr : meal.name}</h4>
                      <p className="text-xs text-zinc-500">{meal.totalCalories} {isAr ? "سعرة" : "kcal"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (foods && foods.length > 0) {
                        addFoodToMeal(mealIndex, foods[0]._id);
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0a0d08] text-zinc-400 border border-[#2a3528] hover:text-[#59f20d] hover:border-[#59f20d]/50 transition"
                  >
                    + {isAr ? "طعام" : "Food"}
                  </button>
                </div>

                <div className="space-y-2">
                  {meal.foods.map((food, foodIndex) => (
                    <div
                      key={foodIndex}
                      className="bg-[#0a0d08]/50 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white">{isAr ? food.foodNameAr : food.foodName}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {food.protein}g {isAr ? "بروتين" : "protein"} • {food.carbs}g {isAr ? "كربوهيدرات" : "carbs"} • {food.fat}g {isAr ? "دهون" : "fat"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => updateFoodQuantity(mealIndex, foodIndex, Number(e.target.value))}
                          className="w-20 bg-[#0a0d08] border border-[#2a3528] rounded-lg px-2 py-1 text-sm text-white text-center outline-none focus:border-[#59f20d]"
                        />
                        <span className="text-xs text-zinc-500">{food.unit}</span>
                        <button
                          onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Spacer */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
