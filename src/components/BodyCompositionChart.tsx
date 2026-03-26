import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { User, ActivitySquare } from "lucide-react";

export function BodyCompositionChart() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const records = useQuery(api.analytics.getBodyComposition, { months: 3 });

  const chartData = useMemo(() => {
    if (!records) return [];
    return records.map(r => ({
      date: r.date.substring(5), // MM-DD
      bodyFat: r.bodyFat,
      muscleMass: r.muscleMass,
      weight: r.weight,
    }));
  }, [records]);

  if (records === undefined) {
    return (
        <div className="w-full h-80 rounded-3xl bg-[#111] animate-pulse border border-white/5 flex items-center justify-center">
            <ActivitySquare className="w-10 h-10 text-white/20 animate-spin" />
        </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-fuchsia-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-zinc-400 text-xs mb-2 font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="font-black text-sm flex items-center justify-between gap-4" style={{ color: entry.color }}>
              <span>{isAr && entry.dataKey === 'bodyFat' ? 'نسبة الدهون' : isAr && entry.dataKey === 'muscleMass' ? 'حجم العضل' : isAr ? 'الوزن' : entry.name}:</span>
              <span>{entry.value} {entry.dataKey === 'bodyFat' ? '%' : 'kg'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <User className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
                <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wider">
                    {isAr ? "تكوين الجسم" : "Body Composition"}
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                    {isAr ? "تتبع نسبة الدهون وحجم العضلات" : "Fat % and Muscle Mass trends"}
                </p>
            </div>
        </div>

        {chartData.length > 0 ? (
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            yAxisId="left"
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            dx={-10}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#71717a' }}
                            dx={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar yAxisId="left" dataKey="weight" name="Weight" fill="#3f3f46" radius={[4, 4, 0, 0]} barSize={10} />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="bodyFat"
                            name="Body Fat %"
                            stroke="#fb7185" // rose-400
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#0c0c0c", stroke: "#fb7185", strokeWidth: 2 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="muscleMass"
                            name="Muscle Mass"
                            stroke="#d946ef" // fuchsia-500
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#0c0c0c", stroke: "#d946ef", strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        ) : (
             <div className="h-64 w-full flex flex-col items-center justify-center relative z-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <User className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-zinc-500 font-medium text-sm text-center px-4">
                    {isAr ? "قم بتسجيل قياساتك الحيوية لعرض المخطط." : "Log your health metrics to view composition."}
                </p>
            </div>
        )}
    </div>
  );
}
