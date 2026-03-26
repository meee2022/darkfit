import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";

// Gulf city coordinates for Open-Meteo (free, no API key)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Riyadh: { lat: 24.69, lon: 46.72 },
  Jeddah: { lat: 21.54, lon: 39.17 },
  Doha: { lat: 25.29, lon: 51.53 },
  Dubai: { lat: 25.20, lon: 55.27 },
  "Abu Dhabi": { lat: 24.47, lon: 54.37 },
  Kuwait: { lat: 29.37, lon: 47.98 },
  Muscat: { lat: 23.61, lon: 58.59 },
  Manama: { lat: 26.22, lon: 50.59 },
  Baghdad: { lat: 33.34, lon: 44.40 },
  Amman: { lat: 31.96, lon: 35.95 },
  Cairo: { lat: 30.06, lon: 31.25 },
};

function getCoords(city: string) {
  // Try exact match first, then partial
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  const key = Object.keys(CITY_COORDS).find((k) =>
    city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase())
  );
  return key ? CITY_COORDS[key] : CITY_COORDS.Riyadh; // default Riyadh
}

interface WeatherCache {
  date: string;
  city: string;
  temp: number;
}

export function HotClimateWidget() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const settings = useQuery(api.regionSettings.getSettings);

  const [temp, setTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = settings?.city || "Riyadh";
  const mode = settings?.hotClimateMode || "auto";
  const threshold = settings?.heatThreshold ?? 38;

  useEffect(() => {
    if (mode === "off") return;

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `darkfit_weather_${city}_${today}`;

    // Check cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data: WeatherCache = JSON.parse(cached);
        if (data.date === today && data.city === city) {
          setTemp(data.temp);
          return;
        }
      }
    } catch { /* ignore */ }

    const coords = getCoords(city);
    setLoading(true);
    setError(null);

    // Open-Meteo free API (no key needed)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m&temperature_unit=celsius`
    )
      .then((r) => r.json())
      .then((data) => {
        const t = data?.current?.temperature_2m;
        if (typeof t === "number") {
          setTemp(t);
          localStorage.setItem(cacheKey, JSON.stringify({ date: today, city, temp: t }));
        } else {
          setError(isAr ? "تعذر جلب الحرارة" : "Could not fetch temperature");
        }
      })
      .catch(() => setError(isAr ? "خطأ في الاتصال" : "Connection error"))
      .finally(() => setLoading(false));
  }, [mode, city]);

  // Determine if hot climate mode should be active
  const isActive =
    mode === "on" ||
    (mode === "auto" && temp !== null && temp >= threshold);

  // Don't render if mode is off or if auto+not hot
  if (mode === "off" || (!isActive && !loading && !error && mode === "auto")) return null;

  // Color intensity based on temperature
  const intensity = temp ? Math.min(1, Math.max(0, (temp - 30) / 20)) : 0.5;
  const bgColor = `rgba(${Math.round(180 + intensity * 75)}, ${Math.round(60 - intensity * 30)}, ${Math.round(60 - intensity * 30)}, 0.08)`;
  const borderColor = `rgba(${Math.round(200 + intensity * 55)}, ${Math.round(50 - intensity * 20)}, ${Math.round(50 - intensity * 20)}, 0.25)`;

  const waterGoal = settings?.waterReminderBoost ? 3.0 : 2.5;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-3xl border p-5"
      style={{ background: bgColor, borderColor }}
    >
      {/* Radial glow */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(255,80,0,0.08) 0%, transparent 70%)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🌡️</span>
          <div>
            <h3 className="text-sm font-black text-white">
              {isAr ? "تنبيه حرارة" : "Heat Alert"}
              {temp !== null && (
                <span className="ms-2 text-base font-black" style={{ color: "#ff6b35" }}>
                  {Math.round(temp)}°C
                </span>
              )}
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold">
              {city}
            </p>
          </div>
        </div>
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-orange-400" />
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : isActive ? (
        <div className="space-y-2.5">
          {/* Warning row */}
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
               style={{ background: "rgba(255,100,0,0.08)", border: "1px solid rgba(255,100,0,0.15)" }}>
            <span>⚠️</span>
            <p className="text-xs font-bold text-orange-200">
              {isAr ? "تمارين داخلية فقط اليوم" : "Indoor workouts only today"}
            </p>
          </div>

          {/* Water goal */}
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
               style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}>
            <span>💧</span>
            <p className="text-xs font-bold text-sky-300">
              {isAr
                ? `هدف الماء: ${waterGoal} لتر (زيادة)`
                : `Water goal: ${waterGoal}L (boosted)`}
            </p>
          </div>

          {/* Suggested times */}
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span>🕐</span>
            <p className="text-xs font-bold text-zinc-300">
              {isAr
                ? "أفضل وقت: قبل 7 ص أو بعد 8 م"
                : "Best time: Before 7 AM or After 8 PM"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Hook to check if hot climate mode is active (for use outside the widget)
export function useHotClimateActive(): boolean {
  const settings = useQuery(api.regionSettings.getSettings);
  const [temp, setTemp] = useState<number | null>(null);

  const city = settings?.city || "Riyadh";
  const mode = settings?.hotClimateMode ?? "auto";
  const threshold = settings?.heatThreshold ?? 38;

  useEffect(() => {
    if (mode === "off") return;
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `darkfit_weather_${city}_${today}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.date === today) { setTemp(data.temp); return; }
      }
    } catch { /* ignore */ }
    // If no cache, we'll return false — the main widget will fetch
  }, [mode, city]);

  if (mode === "on") return true;
  if (mode === "off") return false;
  return temp !== null && temp >= threshold;
}
