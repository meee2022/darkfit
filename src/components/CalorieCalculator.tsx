import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { ChevronLeft, Weight, Ruler, Calendar, User, Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

export function CalorieCalculator() {
  const { t, language, dir } = useLanguage();
  const isAr = language === "ar";

  const { isAuthenticated } = useConvexAuth();
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderate",
  });

  const [goal, setGoal] = useState<Goal>("maintenance");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill from user profile
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

  const handleApplyToProfile = async () => {
    if (!isAuthenticated || !userProfile) {
      toast.error(isAr ? "يرجى تسجيل الدخول وحفظ ملفك الشخصي أولاً" : "Please sign in and complete profile first");
      return;
    }
    if (!targetCalories || targetCalories <= 0) return;

    setIsSaving(true);
    try {
      await updateProfile({
        calories: targetCalories,
        goal: goalLabel(goal),
      });
      toast.success(isAr ? "تم حفظ الهدف في ملفك الشخصي بنجاح! 🎯" : "Target saved to your profile! 🎯");
    } catch (err) {
      toast.error(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving to profile");
    } finally {
      setIsSaving(false);
    }
  };

  const goalLabel = (g: Goal) =>
    g === "cut" ? (isAr ? "تنشيف" : "Cut") : g === "bulk" ? (isAr ? "تضخيم" : "Bulk") : isAr ? "ثبات" : "Maintenance";

  return (
    <div dir={dir} className="min-h-screen bg-[#0c0c0c] text-white py-6 px-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center"
      >
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {isAr ? "حاسبة السعرات" : "Calorie Calculator"}
        </h1>
      </motion.div>

      {/* Banner */}
      {!isAuthenticated || (isAuthenticated && !userProfile) ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 backdrop-blur-2xl p-6 flex flex-col items-center text-center gap-3 w-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.05),transparent_60%)]" />
          <User className="w-10 h-10 text-amber-500" />
          <div>
            <h3 className="text-xl font-black text-amber-500 mb-2">
              {isAr ? "يرجى إكمال الملف الشخصي" : "Please complete your profile"}
            </h3>
            <p className="text-xs text-amber-500/80 max-w-sm mx-auto">
              {isAr
                ? "يرجى تسجيل الدخول وإكمال الملف الشخصي للحصول على أدق التفاصيل واقتراحات السعرات."
                : "Please sign in and complete your profile to get the most accurate details and calorie suggestions."}
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* User Profile Data Display */}
      {userProfile && userProfile.weight && userProfile.height && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#1a1a1a] backdrop-blur-2xl shadow-2xl p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#59f20d] to-[#4ed10a] flex items-center justify-center shadow-[0_10px_30px_rgba(89,242,13,0.3)] group hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {userProfile.name || (isAr ? "بياناتك" : "Your Data")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#59f20d] animate-pulse" />
                    <p className="text-xs text-zinc-400 font-medium">
                      {isAr ? "البيانات الحالية من ملفك الشخصي" : "Current profile data"}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {userProfile.goal && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-2 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/30 backdrop-blur-sm"
                  >
                    <span className="text-xs font-black text-[#59f20d] uppercase tracking-wider">
                      {isAr ? "الهدف" : "Goal"}: {userProfile.goal}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: isAr ? "الوزن" : "Weight", value: userProfile.weight, unit: isAr ? "كجم" : "kg", icon: Weight, color: "text-[#59f20d]", bg: "bg-[#59f20d]/5" },
                { label: isAr ? "الطول" : "Height", value: userProfile.height, unit: isAr ? "سم" : "cm", icon: Ruler, color: "text-blue-400", bg: "bg-blue-400/5" },
                { label: isAr ? "العمر" : "Age", value: userProfile.age, unit: isAr ? "سنة" : "yr", icon: Calendar, color: "text-amber-400", bg: "bg-amber-400/5" },
                { label: "BMI", value: (userProfile.weight / ((userProfile.height / 100) ** 2)).toFixed(1), unit: "", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/5" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("backdrop-blur-md rounded-3xl p-4 border border-white/5 hover:border-[#59f20d]/30 transition-all group bg-white/2")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1">
                    {stat.value}
                    <span className="text-[10px] font-medium text-zinc-500">{stat.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-center">
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
                className="group relative px-8 py-3.5 rounded-2xl bg-[#59f20d] hover:bg-[#4ed10a] text-black font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Activity className="w-5 h-5 animate-pulse" />
                {isAr ? "استخدم في الحاسبة" : "Use in Calculator"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Big Circular Progress */}
      <div className="flex justify-center py-10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(89,242,13,0.05),transparent_70%)]" />
        <div className="relative w-full max-w-[20rem] aspect-square">
          <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="160" cy="160" r="140" stroke="#1a1a1a" strokeWidth="24" fill="none" opacity="0.3" />
            <motion.circle
              initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 140 * (1 - Math.min(1.2, (targetCalories / 3500)) * 0.75) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="160"
              cy="160"
              r="140"
              stroke="#59f20d"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 140}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn">
            <div className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-2">
              {isAr ? "السعرات المستهدفة" : "Target Calories"}
            </div>
            <motion.div
              key={targetCalories}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black tabular-nums tracking-tighter text-white"
            >
              {targetCalories || "0"}
            </motion.div>
            <div className="text-sm text-[#59f20d]/80 font-bold mt-2 uppercase tracking-widest">
              {isAr ? "سعرة حرارية" : "kcal"}
            </div>

            {/* Save Button below the circle */}
            <AnimatePresence>
              {targetCalories > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleApplyToProfile}
                  disabled={isSaving}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full border border-[#59f20d]/30 bg-[#59f20d]/5 text-[#59f20d] text-[10px] font-black uppercase tracking-widest hover:bg-[#59f20d]/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-3 h-3 border-2 border-[#59f20d] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {isAr ? "اعتماد كهدف" : "Apply as Goal"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-white/30 text-center uppercase tracking-[0.3em]">{isAr ? "هدفك" : "Your Goal"}</h3>
        <div className="flex gap-3 bg-[#1a1a1a] backdrop-blur-xl rounded-[2rem] p-2 border border-white/5 shadow-2xl">
          {(["cut", "maintenance", "bulk"] as Goal[]).map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={cn(
                "flex-1 py-4 rounded-[1.5rem] font-black text-xs transition-all duration-300 relative overflow-hidden",
                goal === g
                  ? "bg-[#59f20d] text-black shadow-lg scale-[1.02]"
                  : "bg-transparent text-white/40 hover:text-white"
              )}
            >
              {goalLabel(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Input Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Weight, label: isAr ? "الوزن" : "Weight", value: calculatorData.weight, field: "weight", min: 40, max: 200, unit: isAr ? "كجم" : "kg" },
          { icon: Ruler, label: isAr ? "الطول" : "Height", value: calculatorData.height, field: "height", min: 120, max: 230, unit: isAr ? "سم" : "cm" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-[#1a1a1a] rounded-[2.5rem] p-6 space-y-4 border border-white/5 hover:border-[#59f20d]/20 transition-all shadow-xl"
          >
            <div className="flex items-center gap-3 text-white/30">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={item.value}
              onChange={(e) => setCalculatorData((prev) => ({ ...prev, [item.field]: e.target.value }))}
              className="w-full bg-transparent text-5xl font-black text-white outline-none tabular-nums"
              placeholder="0"
            />
            <div className="space-y-2">
              <input
                type="range"
                min={item.min}
                max={item.max}
                step="0.5"
                value={item.value || (item.min + item.max) / 2}
                onChange={(e) => setCalculatorData((prev) => ({ ...prev, [item.field]: e.target.value }))}
                className="w-full accent-[#59f20d] h-1.5 rounded-full bg-white/5"
              />
              <div className="text-[10px] font-bold text-white/20 text-center uppercase">{item.unit}</div>
            </div>
          </motion.div>
        ))}

        {/* Gender Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#1a1a1a] rounded-[2.5rem] p-6 space-y-4 border border-white/5 shadow-xl"
        >
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? "الجنس" : "Gender"}</span>
          </div>
          <div className="flex gap-2 h-full py-4">
            <button
              onClick={() => setCalculatorData((prev) => ({ ...prev, gender: "male" }))}
              className={cn(
                "flex-1 rounded-2xl font-black text-xs transition-all h-14",
                calculatorData.gender === "male" 
                  ? "bg-[#59f20d] text-black shadow-lg" 
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              {isAr ? "ذكر" : "Male"}
            </button>
            <button
              onClick={() => setCalculatorData((prev) => ({ ...prev, gender: "female" }))}
              className={cn(
                "flex-1 rounded-2xl font-black text-xs transition-all h-14",
                calculatorData.gender === "female" 
                  ? "bg-[#ff4d94] text-white shadow-lg" 
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              {isAr ? "أنثى" : "Female"}
            </button>
          </div>
        </motion.div>

        {/* Age Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#1a1a1a] rounded-[2.5rem] p-6 space-y-4 border border-white/5 shadow-xl"
        >
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? "العمر" : "Age"}</span>
          </div>
          <input
            type="number"
            value={calculatorData.age}
            onChange={(e) => setCalculatorData((prev) => ({ ...prev, age: e.target.value }))}
            className="w-full bg-transparent text-5xl font-black text-white outline-none"
            placeholder="0"
          />
          <div className="space-y-2">
            <input
              type="range"
              min="15"
              max="80"
              value={calculatorData.age || 25}
              onChange={(e) => setCalculatorData((prev) => ({ ...prev, age: e.target.value }))}
              className="w-full accent-[#59f20d] h-1.5 rounded-full bg-white/5"
            />
            <div className="text-[10px] font-bold text-white/20 text-center uppercase">{isAr ? "سنة" : "yr"}</div>
          </div>
        </motion.div>
      </div>

      {/* Activity Level */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white/30">
          <div className="w-8 h-8 rounded-xl bg-[#59f20d]/5 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#59f20d]" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? "مستوى النشاط" : "Activity Level"}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(activityLevels).map(([key, label], idx) => {
            const active = calculatorData.activityLevel === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setCalculatorData((prev) => ({ ...prev, activityLevel: key as ActivityLevel }))}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-300",
                  active ? "bg-[#59f20d]/10 border-2 border-[#59f20d]" : "bg-[#1a1a1a] border border-white/5 hover:border-white/10 shadow-xl"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      active ? "border-[#59f20d] scale-110" : "border-zinc-800"
                    )}
                  >
                    {active && <motion.div layoutId="activeDot" className="w-3 h-3 rounded-full bg-[#59f20d]" />}
                  </div>
                  <span className={cn("text-sm font-black tracking-tight", active ? "text-[#59f20d]" : "text-white/40")}>{label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Macro Distribution */}
      {macros && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-[10px] font-black text-white/30 text-center uppercase tracking-[0.3em]">{isAr ? "توزيع الماكروز" : "Macros Distribution"}</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: isAr ? "بروتين" : "Protein", value: macros.proteinG, color: "bg-orange-500", percent: "30%" },
              { label: isAr ? "كارب" : "Carbs", value: macros.carbsG, color: "bg-blue-500", percent: "50%" },
              { label: isAr ? "دهون" : "Fat", value: macros.fatG, color: "bg-[#59f20d]", percent: "20%" },
            ].map((macro, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-[2rem] p-5 border border-white/5 space-y-3 hover:border-white/10 transition-all shadow-xl">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{macro.label}</div>
                <div className="text-2xl font-black tabular-nums text-white">{macro.value}<span className="text-[10px] text-zinc-600 ml-1">g</span></div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: macro.percent }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.05)]", macro.color)}
                  />
                </div>
                <div className="text-[10px] font-black text-white/20">{macro.percent}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom Spacer */}
      <div className="h-24"></div>
    </div>
  );
}
