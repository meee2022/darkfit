import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Moon, Battery, Activity, Check } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function DailyCheckinModal({ onClose }: { onClose: () => void }) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const submitCheckin = useMutation(api.aiCoach.submitDailyCheckin);
  
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [fatigueScore, setFatigueScore] = useState(5);
  const [sorenessLevel, setSorenessLevel] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitCheckin({
        sleepHours,
        sleepQuality,
        fatigueScore,
        sorenessLevel,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir={dir}>
      <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-zinc-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white">
            {isAr ? "الفحص اليومي السريع" : "Daily Quick Check-in"}
          </h2>
        </div>

        <div className="space-y-8">
          {/* Sleep Hours Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                {isAr ? "عدد ساعات النوم:" : "Sleep Hours:"}
              </label>
              <span className="text-neon-400 font-bold text-lg">{sleepHours} {isAr ? "ساعات" : "hrs"}</span>
            </div>
            <input 
              type="range" min="3" max="12" step="0.5" 
              value={sleepHours} 
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-400"
            />
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-sm font-bold text-zinc-300 mb-3 block">
              {isAr ? "جودة النوم:" : "Sleep Quality:"}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: "poor", ar: "سيء", en: "Poor" },
                { id: "fair", ar: "مقبول", en: "Fair" },
                { id: "good", ar: "جيد", en: "Good" },
                { id: "excellent", ar: "ممتاز", en: "Excellent" }
              ] as const).map(q => (
                <button
                  key={q.id}
                  onClick={() => setSleepQuality(q.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    sleepQuality === q.id 
                      ? "bg-blue-500/20 border-blue-400 text-blue-400" 
                      : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {isAr ? q.ar : q.en}
                </button>
              ))}
            </div>
          </div>

          {/* Fatigue Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Battery className={`w-4 h-4 ${fatigueScore > 7 ? 'text-rose-400' : 'text-orange-400'}`} />
                {isAr ? "مستوى الإرهاق العام:" : "General Fatigue:"}
              </label>
              <span className={`font-bold ${fatigueScore > 7 ? 'text-rose-400' : 'text-white'}`}>{fatigueScore}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1" 
              value={fatigueScore} 
              onChange={(e) => setFatigueScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-neon-400 via-orange-400 to-rose-500 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #59f20d 0%, #fbbf24 50%, #e11d48 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-bold">
              <span>{isAr ? "طاقة عالية (1)" : "High Energy (1)"}</span>
              <span>{isAr ? "(10) مرهق جداً" : "Exhausted (10)"}</span>
            </div>
          </div>

          {/* Soreness Level */}
          <div>
             <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                {isAr ? "مستوى ألم العضلات:" : "Muscle Soreness:"}
              </label>
              <span className={`font-bold ${sorenessLevel > 7 ? 'text-purple-400' : 'text-white'}`}>{sorenessLevel}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1" 
              value={sorenessLevel} 
              onChange={(e) => setSorenessLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-zinc-700 to-purple-500 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-bold">
              <span>{isAr ? "لا يوجد ألم (1)" : "No Pain (1)"}</span>
              <span>{isAr ? "(10) ألم شديد" : "Severe Pain (10)"}</span>
            </div>
          </div>

        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-8 py-4 bg-white text-black hover:bg-zinc-200 font-black rounded-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            <>
              <Check className="w-5 h-5" />
              {isAr ? "حفظ التقرير وتحليله" : "Save & Analyze"}
            </>
          )}
        </button>

      </div>
    </div>
  );
}
