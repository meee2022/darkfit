import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { ChevronLeft, Gauge, Weight, Ruler, Calendar, User, Activity } from "lucide-react";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type Goal = "cut" | "maintenance" | "bulk";

interface CalculatorData {
  age: string;
  gender: Gender;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
}

interface CalorieCalculatorDarkProps {
  onBack?: () => void;
}

export function CalorieCalculatorDark({ onBack }: CalorieCalculatorDarkProps) {
  const { t, language, dir } = useLanguage();
  const isAr = language === "ar";

  const userProfile = useQuery(api.profiles.getCurrentProfile);

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderate",
  });

  const [goal, setGoal] = useState<Goal>("maintenance");

  const activityLevels: Record<ActivityLevel, string> = {
    sedentary: isAr ? "قليل الحركة (لا رياضة)" : "Sedentary (no exercise)",
    light: isAr ? "خفيف (1-3 أيام/أسبوع)" : "Light (1-3 days/week)",
    moderate: isAr ? "متوسط (3-5 أيام/أسبوع)" : "Moderate (3-5 days/week)",
    active: isAr ? "نشط (6-7 أيام/أسبوع)" : "Active (6-7 days/week)",
    veryActive: isAr ? "نشط جداً (تمرين مكثف يومياً)" : "Very Active (intense daily)",
  };

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: Gender): number => {
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calorieNeeds = useMemo(() => {
    const weight = parseFloat(calculatorData.weight);
    const height = parseFloat(calculatorData.height);
    const age = parseInt(calculatorData.age, 10);

    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
      return { bmr: 0, maintenanceCalories: 0 };
    }

    const bmr = calculateBMR(weight, height, age, calculatorData.gender);
    const maintenanceCalories = bmr * activityMultipliers[calculatorData.activityLevel];

    return { bmr, maintenanceCalories };
  }, [calculatorData]);

  const targetCalories = useMemo(() => {
    if (calorieNeeds.maintenanceCalories === 0) return 0;
    const maintenance = Math.round(calorieNeeds.maintenanceCalories);
    const cut = Math.round(calorieNeeds.maintenanceCalories - 500);
    const bulk = Math.round(calorieNeeds.maintenanceCalories + 500);
    return goal === "cut" ? cut : goal === "bulk" ? bulk : maintenance;
  }, [calorieNeeds, goal]);

  const macros = useMemo(() => {
    if (!targetCalories) return null;
    const proteinG = Math.round((targetCalories * 0.3) / 4);
    const carbsG = Math.round((targetCalories * 0.5) / 4);
    const fatG = Math.round((targetCalories * 0.2) / 9);
    return { proteinG, carbsG, fatG };
  }, [targetCalories]);

  const goalLabel = (g: Goal) =>
    g === "cut" ? (isAr ? "تنشيف" : "Cut") : g === "bulk" ? (isAr ? "تضخيم" : "Bulk") : isAr ? "ثبات" : "Maintenance";

  return (
    <div dir={dir} className="min-h-screen bg-black text-white py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{isAr ? "حاسبة السعرات" : "Calorie Calculator"}</h1>
        <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Big Circular Progress */}
      <div className="flex justify-center py-8">
        <div className="relative w-80 h-80">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="160" cy="160" r="140" stroke="#1a1a1a" strokeWidth="20" fill="none" />
            {targetCalories > 0 && (
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="#59f20d"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * 0.25}`}
                className="transition-all duration-1000"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-400 mb-2">{isAr ? "السعرات المستهدفة" : "Target Calories"}</div>
            <div className="text-6xl font-black">{targetCalories || "0"}</div>
            <div className="text-sm text-[#59f20d] mt-1">{isAr ? "سعرة حرارية" : "kcal"}</div>
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      <div className="space-y-3">
        <h3 className="text-sm text-gray-400 text-center">{isAr ? "هدفك" : "Your Goal"}</h3>
        <div className="flex gap-3 bg-zinc-900 rounded-3xl p-2">
          {(["cut", "maintenance", "bulk"] as Goal[]).map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all",
                goal === g ? "bg-[#59f20d] text-black" : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              {goalLabel(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Input Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Card */}
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Weight className="w-5 h-5" />
            <span>{isAr ? "الوزن" : "Weight"}</span>
          </div>
          <input
            type="number"
            step="0.1"
            value={calculatorData.weight}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, weight: e.target.value }))}
            className="w-full bg-transparent text-4xl font-black text-white outline-none"
            placeholder="0"
          />
          <input
            type="range"
            min="40"
            max="200"
            step="0.5"
            value={calculatorData.weight || 70}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, weight: e.target.value }))}
            className="w-full accent-[#59f20d]"
          />
          <div className="text-xs text-gray-500 text-center">{isAr ? "كجم" : "kg"}</div>
        </div>

        {/* Height Card */}
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Ruler className="w-5 h-5" />
            <span>{isAr ? "الطول" : "Height"}</span>
          </div>
          <input
            type="number"
            value={calculatorData.height}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, height: e.target.value }))}
            className="w-full bg-transparent text-4xl font-black text-white outline-none"
            placeholder="0"
          />
          <input
            type="range"
            min="140"
            max="220"
            value={calculatorData.height || 170}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, height: e.target.value }))}
            className="w-full accent-[#59f20d]"
          />
          <div className="text-xs text-gray-500 text-center">{isAr ? "سم" : "cm"}</div>
        </div>

        {/* Gender Card */}
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <User className="w-5 h-5" />
            <span>{isAr ? "الجنس" : "Gender"}</span>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCalculatorData((prev) => ({ ...prev, gender: "male" }))}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all",
                calculatorData.gender === "male" ? "bg-[#59f20d] text-black" : "bg-zinc-800 text-gray-400"
              )}
            >
              {isAr ? "ذكر" : "Male"}
            </button>
            <button
              onClick={() => setCalculatorData((prev) => ({ ...prev, gender: "female" }))}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all",
                calculatorData.gender === "female" ? "bg-[#59f20d] text-black" : "bg-zinc-800 text-gray-400"
              )}
            >
              {isAr ? "أنثى" : "Female"}
            </button>
          </div>
        </div>

        {/* Age Card */}
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-5 h-5" />
            <span>{isAr ? "العمر" : "Age"}</span>
          </div>
          <input
            type="number"
            value={calculatorData.age}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, age: e.target.value }))}
            className="w-full bg-transparent text-4xl font-black text-white outline-none"
            placeholder="0"
          />
          <input
            type="range"
            min="15"
            max="80"
            value={calculatorData.age || 25}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, age: e.target.value }))}
            className="w-full accent-[#59f20d]"
          />
          <div className="text-xs text-gray-500 text-center">{isAr ? "سنة" : "years"}</div>
        </div>
      </div>

      {/* Activity Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-semibold">{isAr ? "مستوى النشاط" : "Activity Level"}</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(activityLevels).map(([key, label]) => {
            const active = calculatorData.activityLevel === key;
            return (
              <button
                key={key}
                onClick={() => setCalculatorData((prev) => ({ ...prev, activityLevel: key as ActivityLevel }))}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                  active ? "bg-[#59f20d]/10 border-2 border-[#59f20d]" : "bg-zinc-900 border-2 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      active ? "border-[#59f20d]" : "border-gray-600"
                    )}
                  >
                    {active && <div className="w-3 h-3 rounded-full bg-[#59f20d]" />}
                  </div>
                  <span className="font-medium text-left">{label}</span>
                </div>
                {active && (
                  <svg className="w-5 h-5 text-[#59f20d]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Macro Distribution */}
      {macros && (
        <div className="space-y-3">
          <h3 className="text-sm text-gray-400">{isAr ? "توزيع الماكروز" : "Macros Distribution"}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-400">{isAr ? "بروتين" : "Protein"}</div>
              <div className="text-3xl font-black">{macros.proteinG}g</div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "30%" }} />
              </div>
              <div className="text-xs text-gray-500">30%</div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-400">{isAr ? "كارب" : "Carbs"}</div>
              <div className="text-3xl font-black">{macros.carbsG}g</div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "50%" }} />
              </div>
              <div className="text-xs text-gray-500">50%</div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-400">{isAr ? "دهون" : "Fat"}</div>
              <div className="text-3xl font-black">{macros.fatG}g</div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#59f20d] rounded-full" style={{ width: "20%" }} />
              </div>
              <div className="text-xs text-gray-500">20%</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
