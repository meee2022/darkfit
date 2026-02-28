import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";

export function MyNutritionPlan() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const myPlan = useQuery(api.nutrition.getMyNutritionPlan);
  const [selectedDay, setSelectedDay] = useState(1);

  if (!myPlan) {
    return (
      <div className="min-h-screen bg-[#0a0d08] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
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
    <div className="min-h-screen bg-[#0a0d08] text-white pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0d08]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{isAr ? "خطتي الغذائية" : "My Nutrition Plan"}</h1>
          <button className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
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
            <div className="relative w-32 h-32">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#1a2318"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#59f20d"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-white">{dayTotals.calories}</div>
                <div className="text-[10px] text-zinc-500">{isAr ? "متبقي" : "remaining"}</div>
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
                    <button className="w-full py-3 rounded-xl border-2 border-dashed border-[#2a3528] text-[#59f20d] text-sm font-medium hover:border-[#59f20d]/50 hover:bg-[#59f20d]/5 transition">
                      + {isAr ? "إضافة طعام" : "Add Food"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
