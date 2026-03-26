import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Trophy, Crown, Medal, Zap, Flame, Dumbbell, User, TrendingUp } from "lucide-react";

export function Leaderboard() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const leaderboard = useQuery(api.social.getLeaderboard, { limit: 20 });
  const myRank = useQuery(api.social.getMyRank);
  const [tab, setTab] = useState<"xp" | "workouts" | "streak">("xp");

  const sorted = tab === "workouts"
    ? [...(leaderboard || [])].sort((a, b) => b.totalWorkouts - a.totalWorkouts)
    : tab === "streak"
    ? [...(leaderboard || [])].sort((a, b) => b.streak - a.streak)
    : leaderboard || [];

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-xs font-black text-zinc-500">#{rank}</span>;
  };

  const rankBg = (rank: number) => {
    if (rank === 1) return "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent";
    if (rank === 2) return "border-zinc-400/20 bg-gradient-to-r from-zinc-400/5 to-transparent";
    if (rank === 3) return "border-amber-700/20 bg-gradient-to-r from-amber-700/5 to-transparent";
    return "border-white/5 bg-white/[0.02]";
  };

  const tierColor = (level: number) => {
    if (level >= 20) return "#fbbf24";
    if (level >= 10) return "#a78bfa";
    if (level >= 5) return "#38bdf8";
    return "#59f20d";
  };

  if (leaderboard === undefined) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-white/5 overflow-hidden shadow-2xl">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{isAr ? "لوحة المتصدرين" : "Leaderboard"}</h3>
            <p className="text-xs text-zinc-500">{isAr ? `${leaderboard.length} لاعب` : `${leaderboard.length} players`}</p>
          </div>
        </div>

        {/* My rank badge */}
        {myRank && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/20">
            <Zap className="w-3.5 h-3.5 text-[#59f20d]" />
            <span className="text-xs font-black text-[#59f20d]">
              {isAr ? `مرتبة #${myRank.rank}` : `Rank #${myRank.rank}`}
            </span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="px-5 pb-3">
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
          {[
            { id: "xp", label: isAr ? "XP" : "XP", icon: <Zap className="w-3 h-3" /> },
            { id: "workouts", label: isAr ? "تمارين" : "Workouts", icon: <Dumbbell className="w-3 h-3" /> },
            { id: "streak", label: isAr ? "سلسلة" : "Streak", icon: <Flame className="w-3 h-3" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-[#59f20d] text-black shadow-sm"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="px-4 pb-5 space-y-2">
        {sorted.map((entry, idx) => {
          const displayRank = tab === "xp" ? entry.rank : idx + 1;
          const value = tab === "workouts" ? entry.totalWorkouts
            : tab === "streak" ? entry.streak
            : entry.xp.toLocaleString();
          const unit = tab === "workouts"
            ? (isAr ? " تمرين" : " sessions")
            : tab === "streak"
            ? (isAr ? " يوم" : " days")
            : " XP";

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${rankBg(displayRank)}`}
            >
              {/* Rank */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-black/40 border border-white/10">
                {rankIcon(displayRank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-zinc-800 border-2" style={{ borderColor: tierColor(entry.level) }}>
                {entry.profileImage ? (
                  <img src={entry.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{entry.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ color: tierColor(entry.level), background: tierColor(entry.level) + "20" }}>
                    Lv.{entry.level}
                  </span>
                  {tab === "xp" && (
                    <span className="text-[10px] text-zinc-500">{isAr ? `${entry.totalWorkouts} تمرين` : `${entry.totalWorkouts} workouts`}</span>
                  )}
                  {tab === "workouts" && (
                    <span className="text-[10px] text-zinc-500">{isAr ? `🔥 ${entry.streak} يوم` : `🔥 ${entry.streak} days`}</span>
                  )}
                </div>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0">
                <span className={`text-base font-black ${displayRank === 1 ? "text-amber-400" : "text-white"}`}>
                  {value}
                </span>
                <span className="text-[10px] text-zinc-600 block">{unit}</span>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-10 text-center">
            <TrendingUp className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">{isAr ? "لا توجد بيانات بعد" : "No data yet"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
