import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Flame, Dumbbell, Zap, ArrowRight } from "lucide-react";

type SectionId =
  | "dashboard" | "exercises" | "nutrition" | "supplements"
  | "calculator" | "health" | "admin" | "coaches"
  | "fitbot" | "profile" | "account" | "plans"
  | "coachPlans" | "workoutGenerator";

export function WorkoutOfTheDay({ onNavigate }: { onNavigate?: (section: SectionId) => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const wod = useQuery(api.exercises.getWorkoutOfTheDay);

  if (!wod || wod.length === 0) return null;

  const totalCalories = wod.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);

  const diffColors: Record<string, string> = {
    beginner: "#59f20d",
    intermediate: "#fbbf24",
    advanced: "#fb7185",
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#1a2318] via-[#111] to-[#0f0f0f] shadow-2xl">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#59f20d]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#59f20d]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {isAr ? "تمرين اليوم" : "Workout of the Day"}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              {isAr ? `${wod.length} تمارين • ~${totalCalories} سعرة` : `${wod.length} exercises • ~${totalCalories} kcal`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">WOD</span>
        </div>
      </div>

      {/* Exercise List */}
      <div className="px-4 pb-4 space-y-2 relative z-10">
        {wod.map((ex, idx) => (
          <div
            key={ex._id || idx}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#59f20d]/20 transition-all group"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
              {ex.imageUrl ? (
                <img src={ex.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-zinc-700" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {isAr ? (ex.nameAr || ex.name) : ex.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] font-bold text-[#59f20d]/70 bg-[#59f20d]/10 px-2 py-0.5 rounded-full">
                  {isAr ? ex.muscleGroupAr : ex.muscleGroup}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: diffColors[ex.difficulty] || "#59f20d",
                    background: (diffColors[ex.difficulty] || "#59f20d") + "18",
                  }}
                >
                  {ex.difficulty === "beginner" ? (isAr ? "مبتدئ" : "Beginner")
                    : ex.difficulty === "intermediate" ? (isAr ? "متوسط" : "Intermediate")
                    : (isAr ? "متقدم" : "Advanced")}
                </span>
                {ex.sets && (
                  <span className="text-[10px] text-zinc-500">
                    {ex.sets}×{ex.reps || "8-12"}
                  </span>
                )}
              </div>
            </div>

            {/* Number Badge */}
            <div className="w-8 h-8 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-[#59f20d]">{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 pb-5 relative z-10">
        <button
          onClick={() => onNavigate?.("exercises")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#59f20d] text-black font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-[#59f20d]/20"
        >
          {isAr ? "ابدأ التمرين الآن" : "Start Workout"}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
