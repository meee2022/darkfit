import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Bell, Play, Lock, CheckCircle, Lightbulb, Dumbbell, UtensilsCrossed, ChevronLeft, X, CheckCircle2, Info } from "lucide-react";
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

  // Workout Session State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [sessionCompletedExercises, setSessionCompletedExercises] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<any | null>(null);

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



  if (!plans.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0c0c0c] text-white pb-20">
        {/* Header with Tabs */}
        <div className="bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-black text-white">{isAr ? "خططي" : "My Plans"}</h1>
                <p className="text-sm text-zinc-500 mt-0.5">{userProfile.name}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition">
                <Bell className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-zinc-900 rounded-2xl p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab("workout")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition ${
                  activeTab === "workout"
                    ? "bg-[#59f20d] text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                {isAr ? "خطة التدريب" : "Workout Plan"}
                {plans.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "workout" ? "bg-black/20" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {plans.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("nutrition")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition ${
                  activeTab === "nutrition"
                    ? "bg-[#59f20d] text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                {isAr ? "الخطة الغذائية" : "Nutrition Plan"}
                {nutritionPlan && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "nutrition" ? "bg-black/20" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content based on Tab */}
        {activeTab === "workout" ? (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2.5rem]">
                <Dumbbell className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{isAr ? "لا توجد خطط حالياً" : "No plans assigned yet"}</h3>
                <p className="text-zinc-500 mb-6">{isAr ? "سيقوم كابتن أحمد بإضافة خطتك قريباً" : "Coach Ahmed will add your plan soon"}</p>
                <button
                  onClick={() => window.location.href = "/coach"}
                  className="px-8 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition"
                >
                  {isAr ? "اكتشف المدربين" : "Discover Coaches"}
                </button>
              </div>
            ) : (
              plans.map((plan: any, index: number) => {
                const exerciseCount = plan.workoutExercises?.length || 0;
                const progressPercent = Math.floor(Math.random() * 40) + 35;
                const accentColors = [
                  "border-l-[#59f20d]",
                  "border-l-blue-500",
                  "border-l-violet-500",
                  "border-l-amber-500",
                ];
                const accent = accentColors[index % accentColors.length];

                return (
                  <button
                    key={plan._id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setActiveDay(1);
                    }}
                    className={`w-full text-left bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 border-l-4 ${accent} rounded-3xl p-6 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-semibold mb-2 border border-zinc-700">
                          {isAr ? "المستوى" : "Level"}: {translateLevel(plan.level, isAr)}
                        </div>
                        <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-zinc-500">{isAr ? "التقدم الشامل" : "Overall Progress"}</span>
                        <span className="text-[#59f20d] font-bold">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#59f20d] to-[#3fb00a] rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Coach Notes */}
                    {plan.notes && (
                      <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-amber-400 mb-1">{isAr ? "نصيحة المدرب" : "Coach's Tip"}</p>
                            <p className="text-sm text-zinc-300">{plan.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800/60">
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">{plan.daysPerWeek || exerciseCount}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{isAr ? "أيام" : "Days"}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">{exerciseCount}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{isAr ? "تمرين" : "Exercises"}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-[#59f20d]">{progressPercent}%</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{isAr ? "مكتمل" : "Complete"}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <MyNutritionPlan onBack={() => setActiveTab("workout")} />
        )}
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
    <div className="min-h-screen bg-[#0c0c0c] text-white pb-20">
      {/* Header */}
      <div className="bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedPlan(null)}
              className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition"
            >
              <ChevronLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white truncate max-w-[200px]">{selectedPlan.title}</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{translateLevel(selectedPlan.level, isAr)}</p>
            </div>
            <button 
              onClick={() => toast.info(isAr ? "لا توجد تنبيهات جديدة" : "No new notifications")}
              className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition"
            >
              <Bell className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Session Progress Bar */}
          {isWorkoutActive && !showCelebration && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{isAr ? "تقدم التمرين" : "Workout Progress"}</span>
                <span className="font-bold text-[#59f20d]">{sessionCompletedExercises.size}/{dayExercises.length}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#59f20d] rounded-full transition-all duration-500"
                  style={{ width: `${(sessionCompletedExercises.size / (dayExercises.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Celebration State */}
        {showCelebration ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 text-center space-y-6">
            <div className="w-24 h-24 bg-[#59f20d]/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-[#59f20d]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">{isAr ? "كفو! وحش!" : "Great Job, Champ!"}</h2>
              <p className="text-zinc-500 mt-2">
                {isAr 
                  ? "لقد أتممت تمرين اليوم بنجاح. استمر في هذا الأداء" 
                  : "You've successfully completed today's workout. Keep it up!"}
              </p>
            </div>
            <button
              onClick={() => {
                setShowCelebration(false);
                setSelectedPlan(null);
              }}
              className="px-10 py-4 rounded-2xl bg-[#59f20d] text-black font-black hover:brightness-105 transition shadow-lg shadow-[#59f20d]/20"
            >
              {isAr ? "العودة لخططي" : "Back to My Plans"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Coach Notes Card */}
            {selectedPlan.notes && !isWorkoutActive && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 mb-1">{isAr ? "نصيحة التدريب" : "Training Tip"}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedPlan.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Day Selector */}
            {!isWorkoutActive && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg font-bold text-white">
                    {isAr ? "جدول التمارين" : "Workout Schedule"}
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {selectedPlan.daysPerWeek || 3} {isAr ? "أيام" : "Days"}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Array.from({ length: selectedPlan.daysPerWeek || 3 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeDay === day
                          ? "bg-[#59f20d] text-black shadow-lg shadow-[#59f20d]/20"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {isAr ? `اليوم ${day}` : `Day ${day}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Session Button */}
            {!isWorkoutActive && (
              <button
                onClick={() => setIsWorkoutActive(true)}
                className="w-full py-4 rounded-2xl bg-[#59f20d] text-black font-black text-lg flex items-center justify-center gap-3 hover:brightness-105 transition shadow-xl shadow-[#59f20d]/10"
              >
                <Play className="w-5 h-5 fill-current" />
                {isAr ? "ابدأ حصة التدريب" : "Start Training Session"}
              </button>
            )}

            {/* Exercises List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  {isAr ? getDayLabel(activeDay, true) : getDayLabel(activeDay, false)}
                </h3>
                <span className="text-[10px] text-zinc-600 font-bold uppercase">
                  {dayExercises.length} {isAr ? "تمارين" : "Exercises"}
                </span>
              </div>

              <div className="space-y-3">
                {dayExercises.length === 0 ? (
                  <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl py-12 text-center">
                    <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">{isAr ? "لا توجد تمارين لهذا اليوم" : "No exercises for today"}</p>
                  </div>
                ) : (
                  dayExercises.map((ex: any) => {
                    const isCompleted = sessionCompletedExercises.has(ex._id);
                    return (
                      <div
                        key={ex._id}
                        className={`group relative bg-zinc-900 border transition-all duration-300 rounded-[1.5rem] overflow-hidden ${
                          isCompleted 
                            ? "border-[#59f20d]/30 opacity-60 scale-[0.98]" 
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="p-4 flex items-center gap-4">
                          {/* Exercise Image */}
                          <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 flex-shrink-0 overflow-hidden relative group">
                            {ex.imageUrl ? (
                              <img src={ex.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <Dumbbell className="w-6 h-6 text-zinc-600" />
                              </div>
                            )}
                            <button 
                              onClick={() => setSelectedExerciseDetail(ex)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <Info className="w-5 h-5 text-white" />
                            </button>
                          </div>

                          {/* Exercise Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-base truncate pr-2">
                              {isAr ? ex.nameAr : ex.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{isAr ? "الجلسات" : "Sets"}</span>
                                <span className="text-sm font-bold text-white">{ex.sets || 4}</span>
                              </div>
                              <div className="w-[1px] h-4 bg-zinc-800" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{isAr ? "تكرار" : "Reps"}</span>
                                <span className="text-sm font-bold text-white">{ex.reps || "12"}</span>
                              </div>
                              <div className="w-[1px] h-4 bg-zinc-800" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{isAr ? "راحة" : "Rest"}</span>
                                <span className="text-sm font-bold text-[#59f20d]">{ex.rest || 60}s</span>
                              </div>
                            </div>
                          </div>

                          {/* Session Action */}
                          {isWorkoutActive ? (
                            <button
                              onClick={() => {
                                const next = new Set(sessionCompletedExercises);
                                if (next.has(ex._id)) next.delete(ex._id);
                                else next.add(ex._id);
                                setSessionCompletedExercises(next);
                              }}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                isCompleted 
                                  ? "bg-[#59f20d] text-black shadow-lg shadow-[#59f20d]/20" 
                                  : "bg-zinc-800 border border-zinc-700 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
                              }`}
                            >
                              <CheckCircle className="w-6 h-6" />
                            </button>
                          ) : (
                            <button
                               onClick={() => setSelectedExerciseDetail(ex)}
                               className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#59f20d] hover:bg-zinc-700 transition"
                            >
                               <Play className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Finish Workout Button */}
            {isWorkoutActive && (
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={async () => {
                    setShowCelebration(true);
                    setIsWorkoutActive(false);
                    setSessionCompletedExercises(new Set());
                    toast.success(isAr ? "تم تسجيل التمرين بنجاح!" : "Workout logged successfully!");
                  }}
                  disabled={sessionCompletedExercises.size === 0}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition shadow-xl ${
                    sessionCompletedExercises.size > 0 
                      ? "bg-white text-black hover:bg-zinc-100 shadow-white/5" 
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700"
                  }`}
                >
                  {isAr 
                    ? `إنهاء التمرين (${sessionCompletedExercises.size}/${dayExercises.length})` 
                    : `Finish Workout (${sessionCompletedExercises.size}/${dayExercises.length})`}
                </button>
                <button
                  onClick={() => setIsWorkoutActive(false)}
                  className="w-full py-3 rounded-xl text-zinc-500 font-bold hover:text-rose-500 transition"
                >
                  {isAr ? "إلغاء التمرين" : "Cancel Workout"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExerciseDetail && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedExerciseDetail(null)}
            />
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">
                            {isAr ? selectedExerciseDetail.nameAr : selectedExerciseDetail.name}
                        </h3>
                        <button 
                            onClick={() => setSelectedExerciseDetail(null)}
                            className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="aspect-video w-full rounded-2xl bg-black border border-zinc-800 overflow-hidden mb-6">
                        {selectedExerciseDetail.imageUrl ? (
                            <img src={selectedExerciseDetail.imageUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Dumbbell className="w-12 h-12 text-zinc-800" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-zinc-800/50 rounded-2xl p-3 text-center border border-zinc-700/50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{isAr ? "الجلسات" : "Sets"}</p>
                            <p className="text-xl font-black text-white">{selectedExerciseDetail.sets || 4}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-2xl p-3 text-center border border-zinc-700/50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{isAr ? "تكرار" : "Reps"}</p>
                            <p className="text-xl font-black text-white">{selectedExerciseDetail.reps || 12}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-2xl p-3 text-center border border-zinc-700/50">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{isAr ? "راحة" : "Rest"}</p>
                            <p className="text-xl font-black text-[#59f20d]">{selectedExerciseDetail.rest || 60}s</p>
                        </div>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        {isAr ? selectedExerciseDetail.descriptionAr || "لا يوجد وصف متاح" : selectedExerciseDetail.description || "No description available"}
                    </p>

                    <button
                        onClick={() => setSelectedExerciseDetail(null)}
                        className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition"
                    >
                        {isAr ? "فهمت" : "Got it"}
                    </button>
                </div>
            </div>
        </div>
      )}
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
