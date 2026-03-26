import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import toast from "react-hot-toast";

// ─── Level-Up Modal ─────────────────────────────────────────────────────────
interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  tierName: string;
  tierIcon: string;
}

function LevelUpModal({ data, onClose }: { data: LevelUpData; onClose: () => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-3xl border border-[#59f20d]/40 bg-gradient-to-b from-[#1a2d0f] to-[#0c0c0c] p-8 text-center shadow-[0_0_80px_rgba(89,242,13,0.3)] animate-levelup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-3xl bg-[#59f20d]/5 pointer-events-none" />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#59f20d] mb-4">
          {isAr ? "⬆️ ترقية!" : "⬆️ LEVEL UP!"}
        </p>

        {/* Big icon */}
        <div
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-[0_0_40px_rgba(89,242,13,0.6)]"
          style={{ background: "radial-gradient(circle, #1a3d0f 0%, #0c0c0c 100%)", border: "3px solid #59f20d" }}
        >
          {data.tierIcon}
        </div>

        <p className="text-lg font-black text-white">
          {isAr ? `مستوى ${data.oldLevel}` : `Level ${data.oldLevel}`}
          <span className="mx-3 text-[#59f20d]">→</span>
          {isAr ? `مستوى ${data.newLevel}` : `Level ${data.newLevel}`}
        </p>

        <p className="mt-1 text-2xl font-black text-[#59f20d]">{data.tierName}</p>

        <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
          {isAr
            ? "أنت في أفضل المستخدمين في DarkFit 🔥"
            : "You're among DarkFit's top performers 🔥"}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#59f20d] py-3 text-sm font-black text-black hover:brightness-110 transition-all"
        >
          {isAr ? "🎯 رائع!" : "🎯 Awesome!"}
        </button>
      </div>
    </div>
  );
}

// ─── Streak Fire Size ────────────────────────────────────────────────────────
function getFireSize(streak: number) {
  if (streak >= 100) return "text-3xl";
  if (streak >= 30) return "text-2xl";
  if (streak >= 7) return "text-xl";
  return "text-base";
}

// ─── Main XP Bar Widget ──────────────────────────────────────────────────────
export function XPBar() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const progress = useQuery(api.gamification.getProgress);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [prevXP, setPrevXP] = useState<number | null>(null);

  // Animate XP gain toast
  useEffect(() => {
    if (!progress) return;
    if (prevXP === null) { setPrevXP(progress.totalXP); return; }
    if (progress.totalXP > prevXP) {
      const gained = progress.totalXP - prevXP;
      toast(`+${gained} XP 🎯`, {
        duration: 2000,
        style: {
          background: "#1a2d0f",
          color: "#59f20d",
          fontWeight: 900,
          border: "1px solid #59f20d40",
          borderRadius: "12px",
          fontSize: "14px",
        },
      });
    }
    setPrevXP(progress.totalXP);
  }, [progress?.totalXP]);

  if (!progress) return null;

  const pct = Math.min(
    100,
    Math.round((progress.currentLevelXP / progress.nextLevelXP) * 100)
  );

  const streak = progress.currentStreak ?? 0;
  const multiplierText = streak >= 30 ? "×2" : streak >= 7 ? "×1.5" : null;

  return (
    <>
      {levelUpData && (
        <LevelUpModal data={levelUpData} onClose={() => setLevelUpData(null)} />
      )}

      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative overflow-hidden rounded-2xl border border-[#59f20d]/20 bg-gradient-to-br from-[#141f0c] to-[#0c0c0c] px-4 py-3 shadow-lg"
      >
        {/* Top row: tier + level */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{(progress as any).tierIcon ?? "🌱"}</span>
            <span className="text-sm font-black text-white">
              {(progress as any).tierName ?? "مبتدئ"}
            </span>
            <span className="text-xs font-bold text-[#59f20d] bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-full px-2 py-0.5">
              {isAr ? `مستوى ${progress.level}` : `Lvl ${progress.level}`}
            </span>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-1.5">
            <span className={`${getFireSize(streak)}`}>🔥</span>
            <span className="text-sm font-black text-white">{streak}</span>
            <span className="text-xs text-zinc-400">{isAr ? "يوم" : "d"}</span>
            {multiplierText && (
              <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                {multiplierText}
              </span>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #39ff14, #59f20d)",
              boxShadow: "0 0 10px rgba(89,242,13,0.6)",
            }}
          />
        </div>

        {/* XP label */}
        <div className="mt-1.5 flex justify-between text-[10px] font-bold text-zinc-500">
          <span>{progress.currentLevelXP.toLocaleString()} XP</span>
          <span>{progress.nextLevelXP.toLocaleString()} XP</span>
        </div>
      </div>
    </>
  );
}

// ─── Hook for awarding XP from other components ───────────────────────────────
export function useAwardXP() {
  const award = useMutation(api.gamification.awardXP);

  return useCallback(
    async (
      action: Parameters<typeof award>[0]["action"],
      meta?: Parameters<typeof award>[0]["meta"],
      onLevelUp?: (data: LevelUpData) => void
    ) => {
      try {
        const result = await award({ action, meta });
        if (result.leveledUp && onLevelUp) {
          onLevelUp({
            oldLevel: result.oldLevel,
            newLevel: result.newLevel,
            tierName: result.tierName,
            tierIcon: result.tierIcon,
          });
        }
        return result;
      } catch {
        // silent fail for XP — never interrupt main flow
      }
    },
    [award]
  );
}
