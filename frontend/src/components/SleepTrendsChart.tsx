import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Moon, MoonStar } from "lucide-react";

export function SleepTrendsChart() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const trends = useQuery(api.analytics.getSleepTrends, { days: 14 });

  const chartData = useMemo(() => {
    if (!trends) return [];
    return trends.map(t => ({
      date: t.date.substring(5), // MM-DD
      duration: t.duration,
      fullDate: t.date,
      quality: t.quality
    }));
  }, [trends]);

  if (trends === undefined) {
    return (
        <div className="w-full h-80 rounded-3xl bg-[#111] animate-pulse border border-white/5 flex items-center justify-center">
            <Moon className="w-10 h-10 text-white/20 animate-spin" />
        </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-blue-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-zinc-400 text-xs mb-1 font-bold">{label}</p>
          <p className="text-blue-400 font-black text-lg flex items-center gap-1">
            {payload[0].value} <span className="text-xs text-zinc-500">{isAr ? "ساعات" : "hours"}</span>
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-0.5">
            {isAr ? "جودة النوم:" : "Quality:"} {payload[0].payload.quality}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <MoonStar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
                <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wider">
                    {isAr ? "جودة النوم" : "Sleep Trends"}
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                    {isAr ? "آخر 14 يوماً" : "Last 14 days"}
                </p>
            </div>
        </div>

        {chartData.length > 0 ? (
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 2, strokeDasharray: '4 4' }} />
                        <Line
                            type="monotone"
                            dataKey="duration"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorSleep)"
                            dot={{ r: 4, fill: "#0c0c0c", stroke: "#3b82f6", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        ) : (
             <div className="h-64 w-full flex flex-col items-center justify-center relative z-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <MoonStar className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-zinc-500 font-medium text-sm text-center px-4">
                    {isAr ? "لا توجد سجلات نوم متاحة. ابدأ بتسجيل نومك لبناء الرسم البياني." : "No sleep records available. Start logging to build this chart."}
                </p>
            </div>
        )}
    </div>
  );
}
