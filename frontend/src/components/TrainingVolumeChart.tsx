import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Activity, Dumbbell } from "lucide-react";

export function TrainingVolumeChart() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const volumeData = useQuery(api.analytics.getTrainingVolume, { weeks: 4 });

  const chartData = useMemo(() => {
    if (!volumeData) return [];
    return volumeData.map(v => ({
      name: v.muscle,
      volume: v.volume,
    }));
  }, [volumeData]);

  if (volumeData === undefined) {
    return (
        <div className="w-full h-80 rounded-3xl bg-[#111] animate-pulse border border-white/5 flex items-center justify-center">
            <Activity className="w-10 h-10 text-white/20 animate-spin" />
        </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-orange-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-zinc-400 text-xs mb-1 font-bold">{label}</p>
          <p className="text-orange-400 font-black text-lg flex items-center gap-1">
            {payload[0].value.toLocaleString()} <span className="text-xs text-zinc-500">kg/reps</span>
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-0.5">
            {isAr ? "إجمالي حجم التمرين" : "Total Volume"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Dumbbell className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wider">
                        {isAr ? "حجم التمرين لكل عضلة" : "Training Volume"}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        {isAr ? "آخر 4 أسابيع" : "Last 4 weeks"}
                    </p>
                </div>
            </div>
        </div>

        {chartData.length > 0 ? (
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis 
                            type="number"
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            dy={5}
                        />
                        <YAxis 
                            type="category"
                            dataKey="name"
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            width={80}
                            interval={0}
                        />
                        <Tooltip cursor={{fill: '#ffffff05'}} content={<CustomTooltip />} />
                        <Bar 
                          dataKey="volume" 
                          fill="#f97316" 
                          radius={[0, 4, 4, 0]} 
                          barSize={20}
                          animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        ) : (
             <div className="h-64 w-full flex flex-col items-center justify-center relative z-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <Dumbbell className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-zinc-500 font-medium text-sm text-center px-4">
                    {isAr ? "سجل تمارينك لرؤية حجم التركيز على كل عضلة." : "Log workouts to see your volume distribution."}
                </p>
            </div>
        )}
    </div>
  );
}
