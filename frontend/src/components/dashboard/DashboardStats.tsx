import React from "react";
import { TrendingUp, Flame, Timer, Dumbbell, HeartPulse } from "lucide-react";
import { ModernStatCard } from "./ModernStatCard";

interface DashboardStatsProps {
  completion: number;
  totalCalories: number;
  totalSessions: number;
  totalHours: number;
  bmiData: { bmi: string; category: string } | null;
  tr: (key: string, fallback: string) => string;
}

export function DashboardStats({
  completion,
  totalCalories,
  totalSessions,
  totalHours,
  bmiData,
  tr,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-2 w-full">
      <ModernStatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label={tr("completion", "إنجاز الأسبوع")}
        value={`${completion}%`}
        iconColor="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
        variant="progress"
        progress={completion}
      />
      <ModernStatCard
        icon={<Flame className="w-5 h-5" />}
        label={tr("burned_calories", "سعرة محروقة")}
        value={totalCalories > 0 ? totalCalories.toLocaleString() : 0}
        unit="kcal"
        iconColor="bg-orange-500/20 text-orange-400 border border-orange-500/30"
        variant="radial"
        progress={totalCalories > 0 ? Math.min(90, (totalCalories / 3000) * 100) : 0}
      />
      <ModernStatCard
        icon={<Timer className="w-5 h-5" />}
        label={tr("workout_days", "أيام تمرين")}
        value={totalSessions}
        iconColor="bg-sky-500/20 text-sky-400 border border-sky-500/30"
        variant="radial"
        progress={totalSessions > 0 ? Math.min(90, (totalSessions / 30) * 100) : 0}
      />
      <ModernStatCard
        icon={<Dumbbell className="w-5 h-5" />}
        label={tr("total_hours", "إجمالي الساعات")}
        value={totalHours}
        unit="h"
        iconColor="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
        variant="radial"
        progress={totalHours > 0 ? Math.min(90, (totalHours / 100) * 100) : 0}
      />
      {bmiData && (
        <ModernStatCard
          icon={<HeartPulse className="w-5 h-5" />}
          label={tr("bmi_title", "مؤشر كتلة الجسم")}
          value={bmiData.bmi}
          iconColor="bg-rose-500/20 text-rose-400 border border-rose-500/30"
          variant="radial"
          progress={Math.min(90, Math.max(10, ((parseFloat(bmiData.bmi) - 15) / 25) * 100))}
        />
      )}
    </div>
  );
}
