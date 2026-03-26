import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Lock } from "lucide-react";

// Localized badge names
const BADGE_NAMES_AR: Record<string, string> = {
  first_workout: "أول تمرين",
  "10_workouts": "عشرة تمارين",
  "50_workouts": "خمسون تمرين",
  "100_workouts": "المئوي",
  first_pr: "أول رقم قياسي",
  early_bird: "بكّير",
  night_owl: "سهران",
  first_meal: "أول وجبة",
  protein_master: "بروتين ماستر",
  hydrated: "مرطّب",
  first_kg: "أول كيلو",
  five_kg: "خمسة كيلو",
  goal_reached: "الهدف",
  streak_7: "أسبوع متتالي",
  streak_30: "شهر متتالي",
  streak_100: "مئة يوم",
};

const BADGE_DESC_AR: Record<string, string> = {
  first_workout: "سجّل أول تمرين",
  "10_workouts": "أكمل 10 تمارين",
  "50_workouts": "أكمل 50 تمرين",
  "100_workouts": "أكمل 100 تمرين",
  first_pr: "سجّل أول رقم قياسي (PR)",
  early_bird: "مارس تمريناً قبل 6 صباحاً",
  night_owl: "مارس تمريناً بعد 10 مساءً",
  first_meal: "سجّل أول وجبة",
  protein_master: "حقق هدف البروتين 7 أيام متتالية",
  hydrated: "اشرب 2 لتر 7 أيام متتالية",
  first_kg: "خسر أول كيلو",
  five_kg: "خسر 5 كيلو",
  goal_reached: "وصل وزنك المثالي",
  streak_7: "streak أسبوع كامل",
  streak_30: "streak شهر كامل",
  streak_100: "streak 100 يوم",
};

const BADGE_DESC_EN: Record<string, string> = {
  first_workout: "Log your first workout",
  "10_workouts": "Complete 10 workouts",
  "50_workouts": "Complete 50 workouts",
  "100_workouts": "Complete 100 workouts",
  first_pr: "Set your first Personal Record",
  early_bird: "Work out before 6 AM",
  night_owl: "Work out after 10 PM",
  first_meal: "Log your first meal",
  protein_master: "Hit protein goal 7 days in a row",
  hydrated: "Drink 2L water 7 days in a row",
  first_kg: "Lose your first kg",
  five_kg: "Lose 5 kg",
  goal_reached: "Reach your ideal weight",
  streak_7: "7-day activity streak",
  streak_30: "30-day activity streak",
  streak_100: "100-day activity streak",
};

const CATEGORIES: Array<{ key: string; labelAr: string; labelEn: string }> = [
  { key: "all", labelAr: "الكل", labelEn: "All" },
  { key: "workout", labelAr: "تمرين", labelEn: "Workout" },
  { key: "nutrition", labelAr: "تغذية", labelEn: "Nutrition" },
  { key: "body", labelAr: "الجسم", labelEn: "Body" },
  { key: "streak", labelAr: "streak", labelEn: "Streak" },
];

export function BadgesPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const progress = useQuery(api.gamification.getProgress);
  const allDefs = useQuery(api.gamification.getAllBadgeDefinitions);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  if (!progress || !allDefs) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-zinc-900 animate-pulse" />
        ))}
      </div>
    );
  }

  const earnedIds = new Set((progress.badges ?? []).map((b: any) => b.id));

  const filtered = allDefs.filter(
    (b) => selectedCategory === "all" || b.category === selectedCategory
  );

  const earnedCount = filtered.filter((b) => earnedIds.has(b.id)).length;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">
          🏅 {isAr ? "شاراتي" : "My Badges"}
        </h3>
        <span className="text-xs font-bold text-[#59f20d] bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-full px-3 py-1">
          {earnedCount}/{filtered.length}
        </span>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-xs font-bold rounded-full px-3 py-1.5 border transition-all ${
              selectedCategory === cat.key
                ? "bg-[#59f20d] text-black border-[#59f20d]"
                : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {filtered.map((badge) => {
          const unlocked = earnedIds.has(badge.id);
          const isSelected = selectedBadge === badge.id;

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
              className={`relative aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-300 ${
                unlocked
                  ? "border-[#59f20d]/50 bg-[#59f20d]/5 shadow-[0_0_16px_rgba(89,242,13,0.15)] hover:shadow-[0_0_24px_rgba(89,242,13,0.3)] hover:scale-105"
                  : "border-zinc-800 bg-zinc-900/50 opacity-50 hover:opacity-70"
              } ${isSelected ? "scale-105 ring-2 ring-[#59f20d]" : ""}`}
            >
              <span className={`text-2xl ${unlocked ? "" : "grayscale opacity-50"}`}>
                {badge.icon}
              </span>
              {!unlocked && (
                <Lock className="absolute bottom-1.5 right-1.5 w-3 h-3 text-zinc-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Badge detail card */}
      {selectedBadge && (() => {
        const def = allDefs.find((b) => b.id === selectedBadge);
        if (!def) return null;
        const unlocked = earnedIds.has(def.id);
        const earnedBadge = (progress.badges ?? []).find((b: any) => b.id === def.id);

        return (
          <div className="rounded-2xl border border-[#59f20d]/20 bg-[#111] p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{def.icon}</span>
              <div>
                <p className="font-black text-white text-base">
                  {isAr ? (BADGE_NAMES_AR[def.id] || def.name) : def.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isAr ? (BADGE_DESC_AR[def.id] || "") : (BADGE_DESC_EN[def.id] || "")}
                </p>
              </div>
            </div>
            {unlocked && earnedBadge ? (
              <p className="text-xs text-[#59f20d] font-bold">
                ✅ {isAr ? `تم الحصول عليها: ${earnedBadge.earnedDate}` : `Earned: ${earnedBadge.earnedDate}`}
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                🔒 {isAr ? "لم تُحقق بعد" : "Not yet earned"}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
