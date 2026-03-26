import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { TrendingUp, TrendingDown, Minus, Activity, Flame, Clock } from "lucide-react";

export function ComparativeAnalytics() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const analytics = useQuery(api.analytics.getComparativeAnalytics);

  if (!analytics) {
    return (
        <div className="w-full h-40 rounded-3xl bg-[#111] animate-pulse border border-white/5 flex items-center justify-center">
            <Activity className="w-8 h-8 text-white/20 animate-spin" />
        </div>
    );
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md text-xs font-bold">
          <TrendingUp className="w-3 h-3" />
          <span>+{value}%</span>
        </div>
      );
    }
    if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md text-xs font-bold">
          <TrendingDown className="w-3 h-3" />
          <span>{value}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-zinc-400 bg-zinc-400/10 px-2 py-0.5 rounded-md text-xs font-bold">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </div>
    );
  };

  const StatBox = ({ title, current, previous, trend, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" style={{ backgroundColor: color }}></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-bold text-zinc-400 uppercase">{title}</span>
        </div>
        <TrendIndicator value={trend} />
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-black text-white leading-none">{current}</span>
        <span className="text-xs text-zinc-500 font-medium mb-0.5 flex items-center gap-1">
          {isAr ? "سابقاً:" : "Prev:"} {previous}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#111] rounded-[2rem] border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wider">
                        {isAr ? "مقارنة الأداء" : "Comparative Analytics"}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        {isAr ? "الشهر الحالي مقابل الشهر السابق" : "Current vs Previous Month"}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <StatBox 
            title={isAr ? "التمارين" : "Workouts"}
            current={analytics.current.workouts}
            previous={analytics.previous.workouts}
            trend={analytics.trends.workouts}
            icon={Activity}
            color="#06b6d4" // cyan-500
          />
          <StatBox 
            title={isAr ? "حرق السعرات" : "Calories Burned"}
            current={analytics.current.calories.toLocaleString()}
            previous={analytics.previous.calories.toLocaleString()}
            trend={analytics.trends.calories}
            icon={Flame}
            color="#f97316" // orange-500
          />
          <StatBox 
            title={isAr ? "مدة التمارين" : "Duration (min)"}
            current={analytics.current.duration}
            previous={analytics.previous.duration}
            trend={analytics.trends.duration}
            icon={Clock}
            color="#8b5cf6" // violet-500
          />
        </div>
    </div>
  );
}
