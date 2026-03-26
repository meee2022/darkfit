import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Trophy, Crown, Medal, Award } from "lucide-react";

export function PRBoard() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const prs = useQuery(api.workout.getPersonalRecords);

  if (prs === undefined) {
    return (
      <div className="rounded-[2rem] bg-[#111] border border-white/5 p-6 animate-pulse">
        <div className="h-6 bg-white/5 rounded-xl w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">
            {isAr ? "الأرقام القياسية" : "Personal Records"}
          </h3>
        </div>
        <div className="py-8 flex flex-col items-center gap-3">
          <Trophy className="w-10 h-10 text-zinc-700" />
          <p className="text-sm text-zinc-500 font-medium">
            {isAr
              ? "لم تسجل أي رقم قياسي بعد! سجل تمارينك بالأوزان لتظهر هنا."
              : "No PRs yet! Log workouts with weights to see them here."}
          </p>
        </div>
      </div>
    );
  }

  const rankIcons = [
    <Crown className="w-4 h-4 text-amber-400" />,
    <Medal className="w-4 h-4 text-zinc-300" />,
    <Medal className="w-4 h-4 text-amber-700" />,
  ];

  const rankBorders = [
    "border-amber-500/30 bg-amber-500/5",
    "border-zinc-400/20 bg-zinc-400/5",
    "border-amber-700/20 bg-amber-700/5",
  ];

  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-5 relative overflow-hidden shadow-2xl">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            {isAr ? "الأرقام القياسية" : "Personal Records"}
          </h3>
          <p className="text-xs text-zinc-500">
            {isAr ? "أفضل أداء لك في كل تمرين" : "Your best performance per exercise"}
          </p>
        </div>
      </div>

      {/* PR List */}
      <div className="space-y-2 relative z-10">
        {prs.map((pr, idx) => (
          <div
            key={pr.exerciseId}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              idx < 3 ? rankBorders[idx] : "border-white/5 bg-white/[0.02]"
            }`}
          >
            {/* Rank */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-black/40 border border-white/10">
              {idx < 3 ? (
                rankIcons[idx]
              ) : (
                <span className="text-xs font-bold text-zinc-500">#{idx + 1}</span>
              )}
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {isAr ? pr.exerciseNameAr : pr.exerciseName}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {pr.date} • {pr.weight}{isAr ? " كجم" : " kg"} × {pr.reps} {isAr ? "تكرار" : "reps"}
              </p>
            </div>

            {/* 1RM Value */}
            <div className="text-right flex-shrink-0">
              <span className={`text-lg font-black ${idx === 0 ? "text-amber-400" : "text-white"}`}>
                {pr.oneRepMax}
              </span>
              <span className="text-[10px] text-zinc-500 block font-bold">1RM kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
