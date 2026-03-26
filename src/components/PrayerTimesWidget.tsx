import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";

// ── Types ────────────────────────────────────────────────────────────────────
interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface CachedData {
  date: string;
  city: string;
  times: PrayerTimes;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(time: string, isAr: boolean): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h < 12 ? (isAr ? "ص" : "AM") : (isAr ? "م" : "PM");
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Find the longest free window between prayers (excluding 15 min buffers)
function getBestWorkoutWindow(times: PrayerTimes, isAr: boolean): string {
  const BUFFER = 15;
  const prayers = [
    { name: isAr ? "الفجر" : "Fajr", min: toMinutes(times.Fajr) },
    { name: isAr ? "الظهر" : "Dhuhr", min: toMinutes(times.Dhuhr) },
    { name: isAr ? "العصر" : "Asr", min: toMinutes(times.Asr) },
    { name: isAr ? "المغرب" : "Maghrib", min: toMinutes(times.Maghrib) },
    { name: isAr ? "العشاء" : "Isha", min: toMinutes(times.Isha) },
    { name: "", min: 1439 }, // end of day sentinel
  ];

  let bestStart = 0;
  let bestEnd = 0;
  let bestDuration = 0;
  let afterPrayer = "";

  // Check before Fajr (midnight to Fajr)
  const beforeFajrEnd = prayers[0].min - BUFFER;
  if (beforeFajrEnd > 60 && beforeFajrEnd > bestDuration) {
    bestDuration = beforeFajrEnd;
    bestStart = 0;
    bestEnd = beforeFajrEnd;
    afterPrayer = isAr ? "قبل الفجر" : "Before Fajr";
  }

  for (let i = 0; i < prayers.length - 1; i++) {
    const windowStart = prayers[i].min + BUFFER;
    const windowEnd = prayers[i + 1].min - BUFFER;
    const duration = windowEnd - windowStart;
    if (duration > bestDuration && duration > 45) {
      bestDuration = duration;
      bestStart = windowStart;
      bestEnd = windowEnd;
      afterPrayer = isAr ? `بعد ${prayers[i].name}` : `After ${prayers[i].name}`;
    }
  }

  if (!bestDuration) return isAr ? "لا توجد فترة مناسبة اليوم" : "No suitable window today";

  const startH = Math.floor(bestStart / 60);
  const startM = String(bestStart % 60).padStart(2, "0");
  const endH = Math.floor(bestEnd / 60);
  const endM = String(bestEnd % 60).padStart(2, "0");
  const startAmPm = startH < 12 ? (isAr ? "ص" : "AM") : (isAr ? "م" : "PM");
  const endAmPm = endH < 12 ? (isAr ? "ص" : "AM") : (isAr ? "م" : "PM");
  const s12 = startH % 12 || 12;
  const e12 = endH % 12 || 12;

  return `${afterPrayer}: ${s12}:${startM} ${startAmPm} - ${e12}:${endM} ${endAmPm}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export function PrayerTimesWidget() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const settings = useQuery(api.regionSettings.getSettings);

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = settings?.city || "Riyadh";
  const country = settings?.country || "SA";

  useEffect(() => {
    if (!settings?.prayerTimesEnabled) return;

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `darkfit_prayer_${city}_${today}`;

    // Check local cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        if (data.date === today && data.city === city) {
          setPrayerTimes(data.times);
          return;
        }
      }
    } catch { /* ignore */ }

    // Fetch from Aladhan API
    setLoading(true);
    setError(null);
    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200 && data.data?.timings) {
          const t = data.data.timings as PrayerTimes;
          const times: PrayerTimes = {
            Fajr: t.Fajr.substring(0, 5),
            Dhuhr: t.Dhuhr.substring(0, 5),
            Asr: t.Asr.substring(0, 5),
            Maghrib: t.Maghrib.substring(0, 5),
            Isha: t.Isha.substring(0, 5),
          };
          setPrayerTimes(times);
          localStorage.setItem(cacheKey, JSON.stringify({ date: today, city, times }));
        } else {
          setError(isAr ? "تعذر جلب المواقيت" : "Could not load prayer times");
        }
      })
      .catch(() => setError(isAr ? "خطأ في الاتصال" : "Connection error"))
      .finally(() => setLoading(false));
  }, [settings?.prayerTimesEnabled, city, country]);

  if (!settings?.prayerTimesEnabled || !prayerTimes && !loading) return null;

  const nowMin = currentMinutes();

  const PRAYERS = [
    { key: "Fajr",    nameAr: "الفجر",   nameEn: "Fajr",    time: prayerTimes?.Fajr },
    { key: "Dhuhr",   nameAr: "الظهر",   nameEn: "Dhuhr",   time: prayerTimes?.Dhuhr },
    { key: "Asr",     nameAr: "العصر",   nameEn: "Asr",     time: prayerTimes?.Asr },
    { key: "Maghrib", nameAr: "المغرب",  nameEn: "Maghrib", time: prayerTimes?.Maghrib },
    { key: "Isha",    nameAr: "العشاء",  nameEn: "Isha",    time: prayerTimes?.Isha },
  ];

  // Find which prayer is "next"
  const nextIdx = prayerTimes
    ? PRAYERS.findIndex((p) => toMinutes(p.time!) > nowMin)
    : -1;

  const bestWindow = prayerTimes && settings?.suggestWorkoutTime
    ? getBestWorkoutWindow(prayerTimes, isAr)
    : null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-3xl border p-5"
      style={{
        background: "linear-gradient(135deg, #0d1a0a 0%, #0c0c0c 100%)",
        borderColor: "rgba(255, 215, 0, 0.2)",
        boxShadow: "0 4px 30px rgba(255, 215, 0, 0.05)",
      }}
    >
      {/* Golden glow top-right */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <div>
            <h3 className="text-sm font-black text-white">
              {isAr ? "مواقيت اليوم" : "Today's Prayer Times"}
            </h3>
            <p className="text-[10px] font-bold" style={{ color: "rgba(255,215,0,0.7)" }}>
              {city}
            </p>
          </div>
        </div>
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "rgba(255,215,0,0.5)", borderTopColor: "transparent" }} />
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : prayerTimes ? (
        <>
          {/* Prayer list */}
          <div className="space-y-2 mb-4">
            {PRAYERS.map((prayer, idx) => {
              const isNext = idx === nextIdx;
              const isPast = prayerTimes && toMinutes(prayer.time!) < nowMin;
              return (
                <div
                  key={prayer.key}
                  className="flex items-center justify-between rounded-2xl px-3 py-2 transition-all"
                  style={{
                    background: isNext
                      ? "rgba(255,215,0,0.08)"
                      : "rgba(255,255,255,0.03)",
                    border: isNext ? "1px solid rgba(255,215,0,0.25)" : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {isAr ? prayer.nameAr : prayer.nameEn}
                    </span>
                    {isNext && (
                      <span className="text-[9px] font-black rounded-full px-2 py-0.5"
                            style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700" }}>
                        {isAr ? "← التالي" : "← Next"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold"
                          style={{ color: isPast ? "rgba(255,255,255,0.35)" : isNext ? "#FFD700" : "rgba(255,255,255,0.75)" }}>
                      {formatTime(prayer.time!, isAr)}
                    </span>
                    {isPast && <span className="text-[10px]">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Best workout window */}
          {bestWindow && (
            <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2"
                 style={{ background: "rgba(89,242,13,0.07)", border: "1px solid rgba(89,242,13,0.15)" }}>
              <span className="text-base">💪</span>
              <div>
                <p className="text-[10px] font-bold text-zinc-400">
                  {isAr ? "أفضل وقت للتمرين" : "Best Workout Window"}
                </p>
                <p className="text-xs font-black text-[#59f20d]">{bestWindow}</p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
