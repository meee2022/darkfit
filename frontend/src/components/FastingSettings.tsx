import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { Moon, Clock, XCircle, MapPin, Save, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export function FastingSettings() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const settings = useQuery(api.fasting.getSettings);
  const updateSettings = useMutation(api.fasting.updateSettings);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ramadan" | "intermittent" | "off">("off");
  
  // Intermittent state
  const [intermittentType, setIntermittentType] = useState("16_8");
  const [fastingStartTime, setFastingStartTime] = useState("20:00");
  const [fastingEndTime, setFastingEndTime] = useState("12:00");
  
  // Ramadan state
  const [city, setCity] = useState("Doha");
  const [country, setCountry] = useState("Qatar");
  const [suhoorTime, setSuhoorTime] = useState("");
  const [iftarTime, setIftarTime] = useState("");

  // General state
  const [autoReduce, setAutoReduce] = useState(true);

  useEffect(() => {
    if (settings) {
      setMode(settings.mode as any);
      if (settings.intermittentType) setIntermittentType(settings.intermittentType);
      if (settings.fastingStartTime) setFastingStartTime(settings.fastingStartTime);
      if (settings.fastingEndTime) setFastingEndTime(settings.fastingEndTime);
      if (settings.location?.city) setCity(settings.location.city);
      if (settings.suhoorTime) setSuhoorTime(settings.suhoorTime);
      if (settings.iftarTime) setIftarTime(settings.iftarTime);
      setAutoReduce(settings.autoReduceIntensity ?? true);
    }
  }, [settings]);

  const fetchRamadanTimes = async () => {
    if (!city || !country) return toast.error(isAr ? "أدخل المدينة والبلد" : "Enter city and country");
    setLoading(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`);
      const data = await res.json();
      if (data.code === 200) {
        const timings = data.data.timings;
        setSuhoorTime(timings.Fajr);
        setIftarTime(timings.Maghrib);
        toast.success(isAr ? "تم حساب المواقيت بنجاح" : "Timings calculated");
      }
    } catch {
      toast.error(isAr ? "فشل جلب المواقيت" : "Failed to fetch timings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings({
        mode,
        intermittentType,
        fastingStartTime,
        fastingEndTime,
        location: { city, lat: 0, lng: 0 },
        suhoorTime,
        iftarTime,
        autoReduceIntensity: autoReduce,
        suhoorReminder: true,
        waterReminder: true,
      });
      toast.success(isAr ? "تم حفظ إعدادات الصيام" : "Fasting settings saved");
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex flex-col items-center justify-center">
          <Moon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{isAr ? "إعدادات الصيام" : "Fasting Settings"}</h2>
          <p className="text-sm text-zinc-400">{isAr ? "اختر نظام الصيام المناسب لك لتعديل الجداول تلقائياً" : "Choose your fasting protocol to adjust schedules automatically"}</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setMode("ramadan")}
          className={cn(
            "p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-3",
            mode === "ramadan" ? "bg-amber-500/10 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-[#0a0f0a] border-zinc-800 text-zinc-500 hover:border-amber-500/50"
          )}
        >
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", mode === "ramadan" ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400")}>
            <span className="text-2xl">🕌</span>
          </div>
          <p className="font-bold text-lg">{isAr ? "رمضان" : "Ramadan"}</p>
        </button>

        <button
          onClick={() => setMode("intermittent")}
          className={cn(
            "p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-3",
            mode === "intermittent" ? "bg-blue-500/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-[#0a0f0a] border-zinc-800 text-zinc-500 hover:border-blue-500/50"
          )}
        >
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", mode === "intermittent" ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400")}>
            <Clock className="w-6 h-6" />
          </div>
          <p className="font-bold text-lg">{isAr ? "متقطع" : "Intermittent"}</p>
        </button>

        <button
          onClick={() => setMode("off")}
          className={cn(
            "p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-3",
            mode === "off" ? "bg-red-500/10 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-[#0a0f0a] border-zinc-800 text-zinc-500 hover:border-red-500/50"
          )}
        >
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", mode === "off" ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400")}>
            <XCircle className="w-6 h-6" />
          </div>
          <p className="font-bold text-lg">{isAr ? "إيقاف الصيام" : "Off"}</p>
        </button>
      </div>

      {/* Ramadan Settings */}
      {mode === "ramadan" && (
        <div className="bg-[#0a0f0a] border border-amber-900/50 rounded-3xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-amber-500 mb-2">{isAr ? "الموقع لأوقات الصلاة" : "Location for Prayer Times"}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                placeholder={isAr ? "المدينة (مثال: Riyadh)" : "City (e.g. Riyadh)"} 
                className="input flex-1 bg-zinc-900 border-zinc-700 text-white focus:border-amber-500" 
                value={city} onChange={e => setCity(e.target.value)} 
              />
              <input 
                placeholder={isAr ? "البلد (مثال: Saudi Arabia)" : "Country (e.g. Saudi Arabia)"} 
                className="input flex-1 bg-zinc-900 border-zinc-700 text-white focus:border-amber-500" 
                value={country} onChange={e => setCountry(e.target.value)} 
              />
              <button onClick={fetchRamadanTimes} disabled={loading} className="px-4 py-3 bg-amber-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition shrink-0">
                <MapPin className="w-5 h-5" />
                {isAr ? "تحديد" : "Locate"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
               <p className="text-sm text-zinc-400 mb-1">{isAr ? "وقت الإمساك (الفجر)" : "Suhoor Time (Fajr)"}</p>
               <input type="time" value={suhoorTime} onChange={e => setSuhoorTime(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white focus:outline-none" />
             </div>
             <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
               <p className="text-sm text-zinc-400 mb-1">{isAr ? "وقت الإفطار (المغرب)" : "Iftar Time (Maghrib)"}</p>
               <input type="time" value={iftarTime} onChange={e => setIftarTime(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white focus:outline-none" />
             </div>
          </div>
        </div>
      )}

      {/* Intermittent Fasting Settings */}
      {mode === "intermittent" && (
        <div className="bg-[#0a0f0a] border border-blue-900/50 rounded-3xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-blue-500 mb-3">{isAr ? "نظام الصيام المتقطع" : "Intermittent Fasting Protocol"}</h3>
            <select value={intermittentType} onChange={e => setIntermittentType(e.target.value)} className="input w-full bg-zinc-900 border-zinc-700 text-white focus:border-blue-500 h-12">
              <option value="16_8">16/8 (16hr Fast / 8hr Window)</option>
              <option value="18_6">18/6 (18hr Fast / 6hr Window)</option>
              <option value="20_4">20/4 (20hr Fast / 4hr Window)</option>
              <option value="omad">OMAD (One Meal A Day)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
               <p className="text-sm text-zinc-400 mb-1">{isAr ? "بدء الصيام" : "Start Fasting"}</p>
               <input type="time" value={fastingStartTime} onChange={e => setFastingStartTime(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white focus:outline-none" />
             </div>
             <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
               <p className="text-sm text-zinc-400 mb-1">{isAr ? "إنهاء الصيام" : "End Fasting"}</p>
               <input type="time" value={fastingEndTime} onChange={e => setFastingEndTime(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white focus:outline-none" />
             </div>
          </div>
        </div>
      )}

      {/* Universal Settings & Effects */}
      {mode !== "off" && (
        <div className="bg-[#111] border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">{isAr ? "تأثيرات النظام" : "System Effects"}</h3>
          
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-[#59f20d]" />
              <div>
                <h4 className="font-bold text-white mb-0.5">{isAr ? "التكيف التلقائي للمجهود" : "Auto-adjust Intensity"}</h4>
                <p className="text-xs text-zinc-500">{isAr ? "تقليل شدة التمارين المقترحة بـ 20٪ أثناء فترة الصيام." : "Reduce workout intensity suggestions by 20% during fasts."}</p>
              </div>
            </div>
            <button
              onClick={() => setAutoReduce(!autoReduce)}
              className={`w-14 h-7 rounded-full transition-colors relative shrink-0 ${autoReduce ? "bg-[#59f20d]" : "bg-zinc-800"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${autoReduce ? "left-8" : "left-1"}`} />
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full py-4 bg-[#59f20d] hover:bg-[#4dd30a] text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(89,242,13,0.3)] transition active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        {isAr ? "حفظ إعدادات الصيام" : "Save Fasting Settings"}
      </button>

      <div className="h-20" />
    </div>
  );
}
