import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { X, Search, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onBack?: () => void;
}

export function MyNutritionPlan({ onBack }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const myPlan = useQuery(api.nutrition.getMyNutritionPlan);
  const allFoods = useQuery(api.nutrition.getAllFoods, {});
  const addFoodToMyPlan = useMutation(api.nutrition.addFoodToMyPlan);

  const [selectedDay, setSelectedDay] = useState(1);
  const [addingToMeal, setAddingToMeal] = useState<{ mealIndex: number; mealName: string } | null>(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [adding, setAdding] = useState(false);

  const filteredFoods = useMemo(() => {
    if (!allFoods || !foodSearch.trim()) return (allFoods || []).slice(0, 10);
    const q = foodSearch.trim().toLowerCase();
    return allFoods.filter((f: any) =>
      (f.name || "").toLowerCase().includes(q) ||
      (f.nameAr || "").toLowerCase().includes(q)
    ).slice(0, 15);
  }, [allFoods, foodSearch]);

  const handleAddFood = async (food: any) => {
    if (!addingToMeal || !myPlan) return;
    setAdding(true);
    try {
      await addFoodToMyPlan({
        dayNumber: selectedDay,
        mealIndex: addingToMeal.mealIndex,
        foodId: food._id,
        quantity,
      });
      toast.success(isAr ? "تمت إضافة الطعام!" : "Food added!");
      setAddingToMeal(null);
      setFoodSearch("");
      setQuantity(100);
    } catch (e: any) {
      toast.error(e.message || (isAr ? "حدث خطأ" : "Error"));
    } finally {
      setAdding(false);
    }
  };

  if (!myPlan) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold mb-2">{isAr ? "لا توجد خطة غذائية" : "No Nutrition Plan"}</h2>
          <p className="text-zinc-400">{isAr ? "لم يتم تعيين خطة غذائية لك بعد" : "No nutrition plan has been assigned to you yet"}</p>
        </div>
      </div>
    );
  }

  const currentDay = myPlan.days?.find((d: any) => d.dayNumber === selectedDay) || myPlan.days?.[0];
  const totalDays = myPlan.days?.length || 0;

  const calculateDayTotals = (day: any) => {
    if (!day || !day.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return day.meals.reduce(
      (acc: any, meal: any) => {
        meal.foods?.forEach((food: any) => {
          acc.calories += food.calories || 0;
          acc.protein += food.protein || 0;
          acc.carbs += food.carbs || 0;
          acc.fat += food.fat || 0;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const dayTotals = calculateDayTotals(currentDay);
  const progressPercentage = myPlan.targetCalories > 0 
    ? Math.round((dayTotals.calories / myPlan.targetCalories) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{isAr ? "خطتي الغذائية" : "My Nutrition Plan"}</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition"
            >
              <X className="w-5 h-5 text-zinc-300" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Days Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {myPlan.days?.map((day: any, index: number) => {
            const isActive = selectedDay === day.dayNumber;
            const dayNames = [
              { ar: "السبت", en: "Saturday" },
              { ar: "الأحد", en: "Sunday" },
              { ar: "الاثنين", en: "Monday" },
              { ar: "الثلاثاء", en: "Tuesday" },
              { ar: "الأربعاء", en: "Wednesday" },
              { ar: "الخميس", en: "Thursday" },
              { ar: "الجمعة", en: "Friday" },
            ];
            const dayName = dayNames[index % 7] || dayNames[0];

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`flex-shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold transition ${
                  isActive
                    ? "bg-[#59f20d] text-black shadow-lg scale-110"
                    : "bg-[#1a2318] text-zinc-400 border border-[#2a3528]"
                }`}
              >
                <div className="text-xs opacity-70">{isAr ? dayName.ar : dayName.en}</div>
                <div className="text-2xl mt-1">{day.dayNumber}</div>
              </button>
            );
          })}
        </div>

        {/* Daily Summary Card */}
        <div className="bg-gradient-to-br from-[#1a2318] to-[#0f1410] rounded-3xl p-6 border border-[#2a3528]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-zinc-500 mb-1">{isAr ? "الهدف اليومي" : "Daily Target"}</div>
              <div className="text-3xl font-black text-white">
                {myPlan.targetCalories?.toLocaleString() || 0}
                <span className="text-sm text-zinc-500 ml-2">{isAr ? "سعرة" : "kcal"}</span>
              </div>
              <div className="text-xs text-[#59f20d] mt-1">{isAr ? `تم ${progressPercentage}%` : `${progressPercentage}% done`}</div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="#1a2318"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="#59f20d"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - Math.min(progressPercentage, 100) / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-base sm:text-xl font-black text-white leading-none">{dayTotals.calories}</div>
                <div className="text-[9px] text-zinc-500 mt-0.5">{isAr ? "متبقي" : "remaining"}</div>
              </div>
            </div>
          </div>

          {/* Macros Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "بروتين" : "Protein"}</span>
                <span className="text-white font-medium">{dayTotals.protein}g / {myPlan.targetProtein || 0}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#59f20d] rounded-full transition-all"
                  style={{ width: `${Math.min((dayTotals.protein / (myPlan.targetProtein || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "كربوهيدرات" : "Carbs"}</span>
                <span className="text-white font-medium">{dayTotals.carbs}g / {myPlan.targetCarbs || 0}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min((dayTotals.carbs / (myPlan.targetCarbs || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">{isAr ? "دهون" : "Fat"}</span>
                <span className="text-white font-medium">{dayTotals.fat}g / {myPlan.targetFat || 0}g</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${Math.min((dayTotals.fat / (myPlan.targetFat || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Composition Tracker */}
        <div className="bg-[#1a2318] rounded-3xl p-5 border border-[#2a3528]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">{isAr ? "تركيب الجسم" : "Body Composition"}</h3>
                <p className="text-xs text-zinc-500">{isAr ? "6 من أكثر أب" : "6 of October"}</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-[#59f20d]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#59f20d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#59f20d]">{isAr ? "عرض الكل" : "View All"}</span>
            </h3>
            <span className="text-sm text-zinc-400">{isAr ? "الوجبات المقررة" : "Planned Meals"}</span>
          </div>

          {!currentDay?.meals || currentDay.meals.length === 0 ? (
            <div className="bg-[#1a2318] rounded-3xl p-8 border border-[#2a3528] text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm text-zinc-400">{isAr ? "لا توجد وجبات لهذا اليوم" : "No meals for this day"}</p>
            </div>
          ) : (
            currentDay.meals.map((meal: any, mealIndex: number) => {
              const mealIcons: Record<string, string> = {
                breakfast: "🌅",
                lunch: "🍽️",
                dinner: "🌙",
                snack: "🥤",
              };
              const mealIcon = mealIcons[meal.name?.toLowerCase()] || "🍽️";
              const mealTotalCals = meal.foods?.reduce((sum: number, f: any) => sum + (f.calories || 0), 0) || 0;

              return (
                <div key={mealIndex} className="bg-[#1a2318] rounded-3xl overflow-hidden border border-[#2a3528]">
                  {/* Meal Header */}
                  <div className="p-5 flex items-center justify-between bg-gradient-to-r from-[#1a2318] to-[#0f1410]">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{mealIcon}</div>
                      <div>
                        <h4 className="font-bold text-white">{isAr ? meal.nameAr : meal.name}</h4>
                        <p className="text-xs text-zinc-500">{mealTotalCals} {isAr ? "سعرة" : "kcal"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Foods List */}
                  <div className="p-5 space-y-3 bg-[#0a0d08]/30">
                    {meal.foods?.map((food: any, foodIndex: number) => (
                      <div key={foodIndex} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden flex-shrink-0">
                          {food.imageUrl ? (
                            <img src={food.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍴</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {isAr ? food.foodNameAr : food.foodName}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {food.quantity}g • {food.protein || 0}g {isAr ? "بروتين" : "protein"} • {food.carbs || 0}g {isAr ? "كربوهيدرات" : "carbs"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-lg bg-[#59f20d]/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Food Button */}
                  <div className="p-4 border-t border-[#2a3528] bg-[#0a0d08]/50">
                    <button
                      onClick={() => setAddingToMeal({ mealIndex, mealName: isAr ? meal.nameAr : meal.name })}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-[#59f20d]/40 text-[#59f20d] text-sm font-medium hover:border-[#59f20d]/70 hover:bg-[#59f20d]/5 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {isAr ? "إضافة طعام" : "Add Food"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========= Food Picker Modal ========= */}
      {addingToMeal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAddingToMeal(null)}>
          <div
            className="w-full max-w-lg bg-[#111] border border-zinc-800 rounded-t-[2rem] p-5 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white text-lg">
                {isAr ? `إضافة إلى ${addingToMeal.mealName}` : `Add to ${addingToMeal.mealName}`}
              </h3>
              <button onClick={() => setAddingToMeal(null)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-sm text-zinc-400 flex-shrink-0">{isAr ? "الكمية (غرام)" : "Quantity (g)"}</span>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-transparent text-white text-center font-bold text-lg focus:outline-none"
                min={1}
                max={2000}
              />
              <div className="flex gap-1">
                {[50, 100, 150, 200].map((g) => (
                  <button key={g} onClick={() => setQuantity(g)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${quantity === g ? "bg-[#59f20d] text-black" : "bg-zinc-800 text-zinc-400"}`}>
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder={isAr ? "ابحث عن طعام..." : "Search food..."}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/50"
                autoFocus
              />
            </div>

            {/* Foods List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredFoods.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-6">{isAr ? "لا توجد نتائج" : "No results found"}</p>
              ) : (
                filteredFoods.map((food: any) => {
                  const cals = Math.round((food.caloriesPer100g || 0) * quantity / 100);
                  const prot = Math.round((food.proteinPer100g || 0) * quantity / 100 * 10) / 10;
                  return (
                    <button
                      key={food._id}
                      onClick={() => handleAddFood(food)}
                      disabled={adding}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#59f20d]/30 transition-all text-start"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{isAr ? food.nameAr : food.name}</p>
                        <p className="text-xs text-zinc-500">{cals} kcal • {prot}g {isAr ? "بروتين" : "protein"}</p>
                      </div>
                      <Plus className="w-5 h-5 text-[#59f20d] flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
