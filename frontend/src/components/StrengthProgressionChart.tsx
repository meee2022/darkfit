import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { TrendingUp, Dumbbell } from "lucide-react";

export function StrengthProgressionChart() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const history = useQuery(api.workout.getUserWorkoutHistory);
  const exerciseDefs = useQuery(api.exercises.listExerciseOptions);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | "all">("all");

  // Calculate unique exercises the user has logs for
  const userExercises = useMemo(() => {
    if (!history || !exerciseDefs) return [];
    const exerciseIds = Array.from(new Set(history.map(s => s.exerciseId)));
    
    return exerciseDefs.filter(ex => exerciseIds.includes(ex._id));
  }, [history, exerciseDefs]);

  // Set default exercise if not set
  useMemo(() => {
    if (selectedExerciseId === "all" && userExercises.length > 0) {
      setSelectedExerciseId(userExercises[0]._id);
    }
  }, [userExercises, selectedExerciseId]);

  const chartData = useMemo(() => {
    if (!history) return [];
    
    // Filter history to the selected exercise
    const filtered = history.filter(s => s.exerciseId === selectedExerciseId);
    
    // Group by date, taking the max 1RM per day
    const byDate: Record<string, number> = {};
    filtered.forEach(session => {
        const date = session.date;
        const max1RM = session.estimatedOneRepMax || 0;
        if (!byDate[date] || max1RM > byDate[date]) {
            byDate[date] = max1RM;
        }
    });

    // Convert to sorted array for Recharts
    const data = Object.keys(byDate).sort().map(date => ({
        date: date.substring(5), // Keep only MM-DD
        max1RM: Math.round(byDate[date]),
        fullDate: date
    }));

    return data;
  }, [history, selectedExerciseId]);

  if (history === undefined || exerciseDefs === undefined) {
    return (
        <div className="w-full h-80 rounded-3xl bg-[#111] animate-pulse border border-zinc-800 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-zinc-700 animate-spin" />
        </div>
    );
  }

  if (userExercises.length === 0) {
    return null; // Don't show chart if no progressive overload logs
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#59f20d]/30 p-3 rounded-xl shadow-xl">
          <p className="text-zinc-400 text-xs mb-1 font-bold">{label}</p>
          <p className="text-[#59f20d] font-black text-lg">
            {payload[0].value} <span className="text-xs text-zinc-500">kg</span>
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-0.5">
            {isAr ? "الحد الأقصى (1RM)" : "Estimated 1RM"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#59f20d]/10 flex items-center justify-center border border-[#59f20d]/20">
                    <TrendingUp className="w-5 h-5 text-[#59f20d]" />
                </div>
                <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wider">
                        {isAr ? "تطور القوة" : "Strength Progress"}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        {isAr ? "الحد الأقصى لتكرار واحد (1RM)" : "Estimated 1 Rep Max (1RM)"}
                    </p>
                </div>
            </div>

            <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-[#59f20d] transition-colors appearance-none min-w-[150px] cursor-pointer"
                dir={isAr ? "rtl" : "ltr"}
            >
                {userExercises.map(ex => (
                    <option key={ex._id} value={ex._id}>
                        {isAr ? ex.nameAr || ex.name : ex.name}
                    </option>
                ))}
            </select>
        </div>

        {chartData.length > 1 ? (
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#59f20d" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#59f20d" stopOpacity={0}/>
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
                            dataKey="max1RM"
                            stroke="#59f20d"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#0c0c0c", stroke: "#59f20d", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#59f20d", stroke: "#fff", strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center relative z-10 border border-dashed border-zinc-800 rounded-2xl bg-black/20">
                <Dumbbell className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-zinc-500 font-medium text-sm text-center px-4">
                    {isAr ? "سجل مزيداً من التمارين لرؤية مخطط التطور" : "Log more workouts to see your progression chart"}
                </p>
            </div>
        )}
    </div>
  );
}
