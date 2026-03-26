import { useState } from "react";
import { useLanguage } from "../lib/i18n";
import { Leaderboard } from "./Leaderboard";
import { Challenges } from "./Challenges";
import { Trophy, Target, Users } from "lucide-react";

export function SocialHub() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [tab, setTab] = useState<"challenges" | "leaderboard">("challenges");

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">
            {isAr ? "المجتمع والتحديات" : "Social & Challenges"}
          </h2>
          <p className="text-xs text-zinc-500">
            {isAr ? "تنافس، تحدَّ، وتصدَّر القائمة" : "Compete, challenge, and lead the board"}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white/[0.03] rounded-2xl p-1 border border-white/5">
        <button
          onClick={() => setTab("challenges")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === "challenges"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Target className="w-4 h-4" />
          {isAr ? "التحديات" : "Challenges"}
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === "leaderboard"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          {isAr ? "المتصدرون" : "Leaderboard"}
        </button>
      </div>

      {/* Content */}
      {tab === "challenges" ? <Challenges /> : <Leaderboard />}
    </div>
  );
}
