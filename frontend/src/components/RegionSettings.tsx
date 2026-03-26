import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { MapPin, Bell, Sun, Droplets, Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const GULF_CITIES = [
  { nameAr: "الرياض", nameEn: "Riyadh", country: "SA" },
  { nameAr: "جدة", nameEn: "Jeddah", country: "SA" },
  { nameAr: "الدوحة", nameEn: "Doha", country: "QA" },
  { nameAr: "دبي", nameEn: "Dubai", country: "AE" },
  { nameAr: "أبوظبي", nameEn: "Abu Dhabi", country: "AE" },
  { nameAr: "الكويت", nameEn: "Kuwait", country: "KW" },
  { nameAr: "مسقط", nameEn: "Muscat", country: "OM" },
  { nameAr: "المنامة", nameEn: "Manama", country: "BH" },
];

export function RegionSettings() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const settings = useQuery(api.regionSettings.getSettings);
  const updateSettings = useMutation(api.regionSettings.updateSettings);

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("Riyadh");
  const [country, setCountry] = useState("SA");
  
  const [prayerEnabled, setPrayerEnabled] = useState(true);
  const [suggestTime, setSuggestTime] = useState(true);
  const [prayerAlert, setPrayerAlert] = useState(true);
  
  const [hotMode, setHotMode] = useState<"auto" | "on" | "off">("auto");
  const [threshold, setThreshold] = useState(38);
  const [waterBoost, setWaterBoost] = useState(true);

  useEffect(() => {
    if (settings) {
      setCity(settings.city);
      setCountry(settings.country);
      setPrayerEnabled(settings.prayerTimesEnabled);
      setSuggestTime(settings.suggestWorkoutTime);
      setPrayerAlert(settings.prayerAlertBefore);
      setHotMode(settings.hotClimateMode);
      setThreshold(settings.heatThreshold);
      setWaterBoost(settings.waterReminderBoost);
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings({
        city,
        country,
        prayerTimesEnabled: prayerEnabled,
        suggestWorkoutTime: suggestTime,
        prayerAlertBefore: prayerAlert,
        hotClimateMode: hotMode,
        heatThreshold: threshold,
        waterReminderBoost: waterBoost,
      });
      toast.success(isAr ? "تم حفظ إعدادات المنطقة" : "Region settings saved");
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex flex-col items-center justify-center">
          <MapPin className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{isAr ? "إعدادات المنطقة" : "Region Settings"}</h2>
          <p className="text-sm text-zinc-400">{isAr ? "تخصيص التطبيق حسب موقعك الجغرافي" : "Customize the app based on your location"}</p>
        </div>
      </div>

      {/* City Selection */}
      <section className="bg-[#0a0f0a] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-white">{isAr ? "الموقع" : "Location"}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-bold uppercase">{isAr ? "المدينة" : "City"}</label>
            <select 
              value={city} 
              onChange={e => {
                const found = GULF_CITIES.find(c => c.nameEn === e.target.value);
                if (found) {
                  setCity(found.nameEn);
                  setCountry(found.country);
                }
              }}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-500"
            >
              {GULF_CITIES.map(c => (
                <option key={c.nameEn} value={c.nameEn}>{isAr ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Prayer Times Settings */}
      <section className="bg-[#0a0f0a] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕌</span>
            <h3 className="text-lg font-bold text-white">{isAr ? "مواقيت الصلاة" : "Prayer Times"}</h3>
          </div>
          <Switch checked={prayerEnabled} onChange={setPrayerEnabled} />
        </div>

        {prayerEnabled && (
          <div className="space-y-3 ps-4 border-l-2 border-amber-500/20">
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-white">{isAr ? "اقتراح وقت التمرين" : "Suggest Workout Time"}</span>
              </div>
              <Switch checked={suggestTime} onChange={setSuggestTime} />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-white">{isAr ? "تنبيه قبل الصلاة" : "Alert Before Prayer"}</span>
              </div>
              <Switch checked={prayerAlert} onChange={setPrayerAlert} />
            </div>
          </div>
        )}
      </section>

      {/* Hot Climate Settings */}
      <section className="bg-[#0a0f0a] border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-white">{isAr ? "وضع الحرارة الشديدة" : "Hot Climate Mode"}</h3>
          </div>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl">
            {(["auto", "on", "off"] as const).map(m => (
              <button
                key={m}
                onClick={() => setHotMode(m)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                  hotMode === m ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {m === "auto" ? (isAr ? "تلقائي" : "Auto") : m === "on" ? (isAr ? "تشغيل" : "On") : (isAr ? "إيقاف" : "Off")}
              </button>
            ))}
          </div>
        </div>

        {hotMode !== "off" && (
          <div className="space-y-4 ps-4 border-l-2 border-orange-500/20">
            {hotMode === "auto" && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-bold uppercase">{isAr ? "حد التفعيل (°C)" : "Activation Threshold (°C)"}</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="30" max="50" step="1" 
                    value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-xl font-black text-orange-500 w-12 text-center">{threshold}°C</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-bold text-white">{isAr ? "زيادة تذكير الماء" : "Boost Water Reminder"}</span>
              </div>
              <Switch checked={waterBoost} onChange={setWaterBoost} />
            </div>
          </div>
        )}
      </section>

      <button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full py-4 bg-[#59f20d] hover:bg-[#4dd30a] text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(89,242,13,0.3)] transition active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        {isAr ? "حفظ إعدادات المنطقة" : "Save Region Settings"}
      </button>

      <div className="h-20" />
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-6 rounded-full transition-all relative shrink-0",
        checked ? "bg-[#59f20d]" : "bg-zinc-800"
      )}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
        checked ? "left-7" : "left-1"
      )} />
    </button>
  );
}
