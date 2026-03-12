import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Bell, Play, Lock, CheckCircle, Lightbulb, Dumbbell, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { MyNutritionPlan } from "./MyNutritionPlan";

type TabType = "workout" | "nutrition";

export function MyPlans() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const plans = useQuery(api.plans.getMyAssignedPlans, {}) ?? [];
  const nutritionPlan = useQuery(api.nutrition.getMyNutritionPlan);
  const logWorkoutSession = useMutation(api.exercises.logWorkoutSession);

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>("workout");

  if (userProfile === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 rounded-full border-4 border-[#59f20d] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-[#59f20d]/20 border-2 border-[#59f20d] flex items-center justify-center">
          <span className="text-4xl">📋</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          {isAr ? "لا توجد خطط حالياً" : "No Plans Yet"}
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          {isAr
            ? "سجّل حسابك وأكمل ملفك الشخصي للحصول على خطط تدريب مخصصة!"
            : "Sign up and complete your profile to get personalized workout plans!"}
        </p>
      </div>
    );
  }

  // Render Nutrition Plan when tab is active
  if (activeTab === "nutrition") {
    return <MyNutritionPlan />;
  }

  if (!plans.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-[#59f20d]/20 border-2 border-[#59f20d] flex items-center justify-center">
          <span className="text-4xl">📝</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          {isAr ? "لا توجد خطط مرسلة" : "No Plans Assigned"}
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          {isAr
            ? "لم يتم إرسال أي خطط تدريب حتى الآن. تواصل مع مدربك للحصول على خطة مخصصة!"
            : "No workout plans have been assigned yet. Contact your coach for a personalized plan!"}
        </p>
      </div>
    );
  }

  const handleStartExercise = async (exercise: any) => {
    try {
      await logWorkoutSession({
        exerciseId: exercise._id,
        duration: 30,
        sets: 3,
        reps: [12, 12, 12],
        weight: [],
        caloriesBurned: exercise.caloriesBurned || 0,
        notes: isAr ? "جلسة من خطة التمرين" : "Session from workout plan",
      });
      toast.success(isAr ? "تم تسجيل الجلسة ✓" : "Session logged ✓");
    } catch (err: any) {
      toast.error(err.message || "Error logging session");
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0d08] via-black to-[#0a0d08] text-white pb-20">
        {/* Header with Tabs */}
        <div className="bg-[#0a0d08]/80 backdrop-blur-xl border-b border-[#59f20d]/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-black text-white">{isAr ? "خططي" : "My Plans"}</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {userProfile.name}
                </p>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#1a2318] border border-[#59f20d]/30 flex items-center justify-center hover:bg-[#2a3528] transition">
                <Bell className="w-5 h-5 text-[#59f20d]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-[#1a2318] rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("workout")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition ${
                  activeTab === "workout"
                    ? "bg-[#59f20d] text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                {isAr ? "خطة التدريب" : "Workout Plan"}
                {plans.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                    {plans.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("nutrition")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition ${
                  activeTab === "nutrition"
                    ? "bg-[#59f20d] text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                {isAr ? "الخطة الغذائية" : "Nutrition Plan"}
                {nutritionPlan && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Plans List */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {plans.map((plan: any, index: number) => {
            const exerciseCount = plan.workoutExercises?.length || 0;
            const progressPercent = Math.floor(Math.random() * 40) + 35; // Mock progress

            return (
              <button
                key={plan._id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setActiveDay(1);
                }}
                className="w-full text-left bg-gradient-to-br from-[#1a2e15] to-[#0f1a0c] border-2 border-[#59f20d]/30 rounded-3xl p-6 hover:border-[#59f20d] transition-all shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-flex px-3 py-1 rounded-full bg-[#59f20d]/20 border border-[#59f20d] text-[#59f20d] text-xs font-bold mb-2">
                      {isAr ? "المستوى" : "Level"}: {translateLevel(plan.level, isAr)}
                    </div>
                    <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>{isAr ? "التقدم الشامل" : "Overall Progress"}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-3 bg-[#0a0d08] rounded-full overflow-hidden border border-[#59f20d]/20">
                    <div 
                      className="h-full bg-gradient-to-r from-[#59f20d] to-[#3fb00a]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Coach Notes */}
                {plan.notes && (
                  <div className="bg-[#0a0d08]/50 border border-[#59f20d]/20 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#59f20d] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#59f20d] mb-1">{isAr ? "نصيحة المدرب" : "Coach's Tip"}</p>
                        <p className="text-sm text-zinc-300">{plan.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{plan.daysPerWeek || exerciseCount}</div>
                    <div className="text-xs text-zinc-400">{isAr ? "أيام" : "Days"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{exerciseCount}</div>
                    <div className="text-xs text-zinc-400">{isAr ? "تمرين" : "Exercises"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#59f20d]">{progressPercent}%</div>
                    <div className="text-xs text-zinc-400">{isAr ? "مكتمل" : "Complete"}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Plan Detail View
  // Logic to determine exercises for the active day
  const getDayExercises = () => {
    if (!selectedPlan) return [];

    // 1. Try to use schedule if it exists (the modern way)
    if (selectedPlan.schedule && Array.isArray(selectedPlan.schedule)) {
      const daySchedule = selectedPlan.schedule.find(
        (s: any) => s.dayOfWeek === activeDay
      );
      if (daySchedule) {
        return daySchedule.exerciseIds
          .map((id: any) => 
            selectedPlan.workoutExercises?.find((ex: any) => String(ex._id) === String(id))
          )
          .filter(Boolean);
      }
    }

    // 2. Fallback to dividing the total exercises array across daysPerWeek
    const exercisesPerDay = Math.ceil((selectedPlan.workoutExercises?.length || 0) / (selectedPlan.daysPerWeek || 1));
    return selectedPlan.workoutExercises?.slice(
      (activeDay - 1) * exercisesPerDay,
      activeDay * exercisesPerDay
    ) || [];
  };

  const dayExercises = getDayExercises();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1508] via-[#0d1a0a] to-black text-white pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2e15] to-[#0f1a0c] border-b-2 border-[#59f20d]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#59f20d]/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedPlan(null)}
            className="w-10 h-10 rounded-full bg-[#1a2318]/80 border border-[#59f20d]/30 flex items-center justify-center hover:bg-[#2a3528] transition mb-4"
          >
            ←
          </button>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="inline-flex px-3 py-1 rounded-full bg-[#59f20d]/20 border border-[#59f20d] text-[#59f20d] text-xs font-bold mb-2">
                {isAr ? "المستوى" : "Level"}: {translateLevel(selectedPlan.level, isAr)}
              </div>
              <h1 className="text-2xl font-black text-white mb-2">{selectedPlan.title}</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>{isAr ? "الكابتن أحمد" : "Coach Ahmed"}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>{selectedPlan.daysPerWeek || 3} {isAr ? "أيام/أسبوع" : "days/week"}</span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-[#1a2318]/80 border border-[#59f20d]/30 flex items-center justify-center hover:bg-[#2a3528] transition">
              <Bell className="w-5 h-5 text-[#59f20d]" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#0a0d08]/50 backdrop-blur-sm border border-[#59f20d]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>{isAr ? "التقدم الشامل" : "Overall Progress"}</span>
              <span>65%</span>
            </div>
            <div className="h-3 bg-[#0a0d08] rounded-full overflow-hidden border border-[#59f20d]/20">
              <div className="h-full bg-gradient-to-r from-[#59f20d] to-[#3fb00a] w-[65%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Coach Notes */}
        {selectedPlan.notes && (
          <div className="bg-[#1a2e15]/60 border-2 border-[#59f20d]/20 rounded-3xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-[#59f20d]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#59f20d] mb-1">{isAr ? "نصيحة التدريب لليوم" : "Daily Training Tip"}</p>
                <p className="text-sm text-zinc-300">{selectedPlan.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Day Tabs */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">{isAr ? `تمارين ${getDayLabel(activeDay, isAr)}` : `${getDayLabel(activeDay, false)} Exercises`}</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Array.from({ length: selectedPlan.daysPerWeek || 3 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition ${
                  activeDay === day
                    ? "bg-[#59f20d] text-black"
                    : "bg-[#0a0d08] border border-[#59f20d]/30 text-white hover:border-[#59f20d]/60"
                }`}
              >
                {isAr ? `اليوم ${day}` : `Day ${day}`}
              </button>
            ))}
          </div>
        </div>

        {/* Start Training Button */}
        <button
          onClick={() => toast.success(isAr ? "بدء التمرين..." : "Starting workout...")}
          className="w-full px-6 py-4 rounded-2xl bg-[#59f20d] text-black font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition shadow-lg shadow-[#59f20d]/30 mb-6"
        >
          <Play className="w-5 h-5" />
          {isAr ? "بدء التمرين" : "Start Workout"}
        </button>

        {/* Exercises Table-like View */}
        <div className="space-y-4">
          <div className="bg-[#1a2318]/40 border border-[#59f20d]/20 rounded-t-3xl p-4 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[#59f20d]/60">
            <div className="flex-1">{isAr ? "التمرين" : "Exercise"}</div>
            <div className="flex gap-4 sm:gap-8 pr-4">
              <div className="w-12 text-center">{isAr ? "مجموعات" : "Sets"}</div>
              <div className="w-12 text-center">{isAr ? "تكرار" : "Reps"}</div>
              <div className="w-12 text-center hidden sm:block">{isAr ? "راحة" : "Rest"}</div>
            </div>
            <div className="w-8"></div>
          </div>

          <div className="space-y-2">
            {dayExercises.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 bg-[#0a0d08] rounded-b-3xl border-x border-b border-[#59f20d]/10">
                {isAr ? "لا توجد تمارين لهذا اليوم" : "No exercises for this day"}
              </div>
            ) : (
              dayExercises.map((ex: any, idx: number) => {
                const completed = Math.random() > 0.7; // Mock for visual demo
                
                return (
                  <div
                    key={ex._id}
                    className={`group relative overflow-hidden flex items-center p-3 sm:p-4 border-l-4 transition-all duration-300 ${
                      completed
                        ? "bg-[#59f20d]/5 border-[#59f20d] opacity-60"
                        : "bg-[#0a0d08] hover:bg-[#1a2318]/60 border-transparent hover:border-[#59f20d]/40"
                    }`}
                  >
                    {/* Exercise Info */}
                    <div className="flex-1 flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {ex.imageUrl ? (
                          <img src={ex.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <span className="text-2xl">💪</span>
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#59f20d] transition-colors">
                          {isAr ? ex.nameAr : ex.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 uppercase tracking-tighter">
                          {isAr ? ex.muscleGroupAr : ex.muscleGroup}
                        </p>
                      </div>
                    </div>

                    {/* Stats Table */}
                    <div className="flex gap-4 sm:gap-8 items-center pr-4">
                      <div className="w-12 flex flex-col items-center">
                        <span className="text-sm sm:text-lg font-black text-white">{ex.sets || 4}</span>
                        <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase">{isAr ? "جلسات" : "Sets"}</span>
                      </div>
                      <div className="w-12 flex flex-col items-center">
                        <span className="text-sm sm:text-lg font-black text-white">{ex.reps || "12"}</span>
                        <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase">{isAr ? "تكرار" : "Reps"}</span>
                      </div>
                      <div className="w-12 hidden sm:flex flex-col items-center">
                        <span className="text-sm sm:text-lg font-black text-[#59f20d]">{ex.rest || "60"}س</span>
                        <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase">{isAr ? "راحة" : "Rest"}</span>
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className="w-8 flex justify-center">
                      <button 
                        onClick={() => handleStartExercise(ex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          completed 
                            ? "bg-[#59f20d] text-black" 
                            : "bg-zinc-800 text-zinc-500 hover:bg-[#59f20d] hover:text-black"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Completion Glow Overlay */}
                    {completed && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#59f20d]/5 pointer-events-none" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Table Footer / Summary */}
          {dayExercises.length > 0 && (
            <div className="p-4 bg-[#1a2318]/20 rounded-b-3xl border-x border-b border-[#59f20d]/10 flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <span>{dayExercises.length} {isAr ? "تمارين مكتشفة" : "exercises discovered"}</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#59f20d]"></span>
                {isAr ? "جاهز للتنفيذ" : "Ready to execute"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function translateLevel(level: string, isAr: boolean) {
  if (isAr) {
    switch (level) {
      case "beginner": return "مبتدئ";
      case "intermediate": return "متوسط";
      case "advanced": return "متقدم";
      default: return level;
    }
  }
  return level?.charAt(0).toUpperCase() + level?.slice(1);
}

function getDayLabel(day: number, isAr: boolean) {
  if (isAr) {
    const days = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
    return `اليوم ${days[day] || day}`;
  }
  return `Day ${day}`;
}
