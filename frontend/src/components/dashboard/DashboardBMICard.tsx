import React from "react";

interface BMICardProps {
  bmiData: { bmi: string; category: string } | null;
  userProfile: any;
  isAr: boolean;
  tr: (key: string, fallback: string) => string;
}

export function DashboardBMICard({ bmiData, userProfile, isAr, tr }: BMICardProps) {
  if (!bmiData) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 relative shadow-2xl" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Top bar: BMI title + value */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">
            {tr("bmi_title", "مؤشر كتلة الجسم")}
          </span>
          <span className="text-xs font-bold text-[#59f20d]">{bmiData.category}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white tracking-tighter">{bmiData.bmi}</span>
        </div>
      </div>

      {/* BMI Progress Bar - Enhanced Graphic */}
      <div className="relative h-2 w-full flex bg-zinc-900/50 p-[1px]">
        <div className="h-full bg-sky-500/50 rounded-l-full" style={{ width: "25%" }} />
        <div className="h-full bg-[#59f20d]/80" style={{ width: "50%" }} />
        <div className="h-full bg-rose-500/50 rounded-r-full" style={{ width: "25%" }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white shadow-[0_0_12px_rgba(89,242,13,0.8)] z-10 rounded-full border-2 border-zinc-950 transition-all duration-1000 ease-out"
          style={{
            left: isAr 
              ? `${100 - Math.min(Math.max((parseFloat(bmiData.bmi) - 15) / 25 * 100, 2), 98)}%`
              : `${Math.min(Math.max((parseFloat(bmiData.bmi) - 15) / 25 * 100, 2), 98)}%`,
            transform: "translate(-50%, -50%)"
          }}
        />
      </div>

      {/* Info Grid: Height, Weight, Goal */}
      <div className="grid grid-cols-3 divide-x divide-white/5 rtl:divide-x-reverse bg-white/1">
        {/* Height */}
        <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {isAr ? "الطول" : "Height"}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black text-sky-400 italic">{userProfile?.height || "—"}</span>
            <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "سم" : "cm"}</span>
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {isAr ? "الوزن" : "Weight"}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black text-[#59f20d] italic">{userProfile?.currentWeight || "—"}</span>
            <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "كجم" : "kg"}</span>
          </div>
        </div>

        {/* Target */}
        <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {isAr ? "الهدف" : "Goal"}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black text-amber-400 italic">{userProfile?.targetWeight || "—"}</span>
            <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "كجم" : "kg"}</span>
          </div>
        </div>
      </div>

      {/* Bottom subtle accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#59f20d]/10 to-transparent" />
    </div>
  );
}
