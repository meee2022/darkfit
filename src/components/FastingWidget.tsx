import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Moon, Clock, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export function FastingWidget() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const settings = useQuery(api.fasting.getSettings);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const log = useQuery(api.nutrition.getUserNutritionLog, {
    date: new Date().toISOString().split("T")[0],
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings || settings.mode === "off") return null;

  // Helper to parse "HH:MM" into a Date object for today
  const parseTime = (timeStr: string) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentTotalM = currentH * 60 + currentM;

  let targetTime: Date | null = null;
  let labelAr = "";
  let labelEn = "";
  let isFasting = false;
  let progressPercent = 0;

  if (settings.mode === "ramadan") {
    const suhoor = parseTime(settings.suhoorTime || "04:00");
    const iftar = parseTime(settings.iftarTime || "18:00");

    if (suhoor && iftar) {
      const suhoorM = suhoor.getHours() * 60 + suhoor.getMinutes();
      const iftarM = iftar.getHours() * 60 + iftar.getMinutes();

      if (currentTotalM >= suhoorM && currentTotalM < iftarM) {
        // Fasting period (between Suhoor and Iftar)
        isFasting = true;
        targetTime = iftar;
        labelAr = "للإفطار";
        labelEn = "Until Iftar";
        const totalDuration = iftarM - suhoorM;
        const elapsed = currentTotalM - suhoorM;
        progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      } else {
        // Eating period (after Iftar or before Suhoor)
        isFasting = false;
        targetTime = suhoor;
        if (currentTotalM >= iftarM) {
          targetTime.setDate(targetTime.getDate() + 1); // Suhoor is next day
        }
        labelAr = "للسحور";
        labelEn = "Until Suhoor";
        
        let totalDuration = (24 * 60 - iftarM) + suhoorM;
        let elapsed = currentTotalM >= iftarM ? (currentTotalM - iftarM) : ((24 * 60 - iftarM) + currentTotalM);
        progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      }
    }
  } else if (settings.mode === "intermittent") {
    const start = parseTime(settings.fastingStartTime || "20:00");
    const end = parseTime(settings.fastingEndTime || "12:00");

    if (start && end) {
      const startM = start.getHours() * 60 + start.getMinutes();
      const endM = end.getHours() * 60 + end.getMinutes();

      // Check if current time is within fasting window (handles overnight)
      if (startM > endM) {
        isFasting = currentTotalM >= startM || currentTotalM < endM;
      } else {
        isFasting = currentTotalM >= startM && currentTotalM < endM;
      }

      if (isFasting) {
        targetTime = end;
        if (currentTotalM >= startM && startM > endM) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
        labelAr = "باقي للإفطار";
        labelEn = "Until Break Fast";
        
        let totalTime = startM > endM ? (24 * 60 - startM + endM) : (endM - startM);
        let elapsed = currentTotalM >= startM ? (currentTotalM - startM) : (24 * 60 - startM + currentTotalM);
        progressPercent = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));

      } else {
        targetTime = start;
        if (currentTotalM >= endM && endM > startM) {
           targetTime.setDate(targetTime.getDate() + 1);
        }
        labelAr = "باقي للصيام";
        labelEn = "Until Fasting Starts";
        
        let totalTime = startM > endM ? (startM - endM) : (24 * 60 - endM + startM);
        let elapsed = currentTotalM >= endM ? (currentTotalM - endM) : (24 * 60 - endM + currentTotalM);
        progressPercent = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
      }
    }
  }

  // Format countdown string
  let countdownStr = "00:00:00";
  if (targetTime) {
    const diffMs = targetTime.getTime() - now.getTime();
    if (diffMs > 0) {
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);
      countdownStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
  }

  // Nutrition calculations for Ramadan specifically
  const dailyTarget = profile?.calories || 2000;
  let iftarTarget = 0, suhoorTarget = 0;
  let iftarEaten = 0, suhoorEaten = 0, snacksEaten = 0;

  if (settings.mode === "ramadan") {
    iftarTarget = Math.round(dailyTarget * 0.6);
    suhoorTarget = Math.round(dailyTarget * 0.4);

    if (log) {
      const meals = log.meals || [];
      meals.forEach((m: any) => {
        const mealCals = Math.round(m.totalCalories || 0);
        if (m.type === "breakfast") iftarEaten += mealCals;
        else if (m.type === "dinner" || m.type === "lunch") suhoorEaten += mealCals;
        else if (m.type === "snack") snacksEaten += mealCals;
      });
    }
  }

  const strokeDashoffset = 126 - (126 * progressPercent) / 100;

  return (
    <div className={cn(
      "w-full rounded-3xl border-2 p-5 mb-6 animate-fadeIn transition-all shadow-xl",
      settings.mode === "ramadan" 
        ? "bg-gradient-to-br from-[#1a150b] to-[#0a0d08] border-amber-500/30" 
        : "bg-gradient-to-br from-[#0c131a] to-[#0a0d08] border-blue-500/30"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          "text-lg font-black flex items-center gap-2",
          settings.mode === "ramadan" ? "text-amber-500" : "text-blue-500"
        )}>
          {settings.mode === "ramadan" ? (
            <><Moon className="w-5 h-5" /> {isAr ? "رمضان كريم" : "Ramadan Kareem"}</>
          ) : (
            <><Clock className="w-5 h-5" /> {isAr ? "الصيام المتقطع" : "Intermittent Fasting"}</>
          )}
        </h3>

        {settings.mode === "ramadan" && (
          <div className="text-right text-xs font-bold text-zinc-400">
            {isAr ? "الإفطار:" : "Iftar:"} <span className="text-amber-500">{settings.iftarTime || "--:--"}</span> • {" "}
            {isAr ? "السحور:" : "Suhoor:"} <span className="text-amber-500">{settings.suhoorTime || "--:--"}</span>
          </div>
        )}
      </div>

      {/* Main Countdown & Progress Area */}
      <div className="flex items-center gap-6">
        {/* Progress Circle Arc */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle 
              cx="25" cy="25" r="20" fill="transparent" 
              stroke={isFasting ? (settings.mode === "ramadan" ? "#f59e0b" : "#3b82f6") : "#59f20d"} 
              strokeWidth="4" strokeLinecap="round" 
              strokeDasharray="126" strokeDashoffset={strokeDashoffset} 
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className={cn(
              "text-[10px] font-bold uppercase",
               isFasting ? "text-zinc-400" : "text-[#59f20d]"
            )}>
              {isAr ? labelAr : labelEn}
            </span>
            <span className="text-sm font-black text-white tracking-widest">{countdownStr}</span>
          </div>
        </div>

        {/* Nutritional Data for Ramadan */}
        {settings.mode === "ramadan" && (
          <div className="flex-1 space-y-3 border-r border-zinc-800 pr-4 rtl:pr-0 rtl:border-r-0 rtl:border-l rtl:pl-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-amber-500" /> {isAr ? "سعرات اليوم" : "Daily Calories"}</span>
            </div>
            
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">{isAr ? "الإفطار" : "Iftar"}</span>
                <span className="font-bold text-white">{iftarEaten} / <span className="text-amber-500">{iftarTarget}</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (iftarEaten / iftarTarget) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">{isAr ? "السحور" : "Suhoor"}</span>
                <span className="font-bold text-white">{suhoorEaten} / <span className="text-amber-500">{suhoorTarget}</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-500/70 transition-all duration-500" style={{ width: `${Math.min(100, (suhoorEaten / suhoorTarget) * 100)}%` }} />
              </div>
            </div>
            {snacksEaten > 0 && (
               <p className="text-[10px] text-zinc-500 font-bold">{isAr ? "+ سناك:" : "+ Snacks:"} {snacksEaten} {isAr ? "سعرة" : "kcal"}</p>
            )}
          </div>
        )}

        {/* Info for Intermittent */}
        {settings.mode === "intermittent" && (
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-2">{isAr ? "ملخص الصيام المكثف" : "Fasting Summary"}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-400">
               <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                 <p>{isAr ? "بداية نافذة الأكل:" : "Eating Starts:"}</p>
                 <p className="text-white text-sm">{settings.fastingEndTime}</p>
               </div>
               <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                 <p>{isAr ? "بداية الصيام:" : "Fasting Starts:"}</p>
                 <p className="text-white text-sm">{settings.fastingStartTime}</p>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
