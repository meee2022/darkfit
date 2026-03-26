import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Target, CheckCircle, Lock, Star, Zap } from "lucide-react";

export function Challenges() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const challenges = useQuery(api.social.getActiveChallenges);

  if (challenges === undefined) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const completed = challenges.filter((c) => c.completed).length;
  const total = challenges.length;

  return (
    <div className="rounded-[2rem] bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{isAr ? "التحديات" : "Challenges"}</h3>
            <p className="text-xs text-zinc-500">
              {isAr ? `${completed} من ${total} مكتمل` : `${completed} of ${total} completed`}
            </p>
          </div>
        </div>

        {/* Overall progress pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Star className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-black text-purple-400">
            {Math.round((completed / total) * 100)}%
          </span>
        </div>
      </div>

      {/* Challenges list */}
      <div className="px-4 pb-5 space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
              challenge.completed
                ? "border-[#59f20d]/30 bg-[#59f20d]/5"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            {/* Glow for completed */}
            {challenge.completed && (
              <div className="absolute inset-0 bg-[#59f20d]/5 pointer-events-none" />
            )}

            <div className="flex items-start gap-3 relative z-10">
              {/* Emoji icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                style={{ background: challenge.color + "15", borderColor: challenge.color + "30" }}
              >
                {challenge.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-black text-white">
                    {isAr ? challenge.titleAr : challenge.titleEn}
                  </h4>
                  {/* Status icon */}
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-[#59f20d] flex-shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 mb-2">
                  {isAr ? challenge.descAr : challenge.descEn}
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${challenge.progress}%`,
                        background: challenge.completed ? "#59f20d" : challenge.color,
                        boxShadow: challenge.completed ? "0 0 6px #59f20d80" : undefined,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 flex-shrink-0">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
              </div>
            </div>

            {/* Reward badge */}
            <div className="mt-3 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400">
                  +{challenge.reward} XP {isAr ? "مكافأة" : "reward"}
                </span>
              </div>
              {challenge.completed && (
                <span className="text-[10px] font-black text-[#59f20d]">
                  ✓ {isAr ? "مكتمل!" : "Completed!"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
