import React, { useState, useEffect } from "react";
import { Activity, Heart, Moon, Sun, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

import { useLanguage, tr } from "../../lib/i18n";

const SLEEP_KEY = "darkfit_sleep_logs";
const HR_KEY = "darkfit_hr_logs";

interface SleepLog {
    date: string;
    hours: number;
    quality: "excellent" | "good" | "fair" | "poor";
}

interface HRLog {
    date: string;
    time: string;
    bpm: number;
    context: "rest" | "exercise" | "wakeup";
}

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function getLogs<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function saveLogs<T>(key: string, logs: T[]) {
    localStorage.setItem(key, JSON.stringify(logs));
}

const QUALITY_LABELS: Record<string, { ar: string; en: string; color: string }> = {
    excellent: { ar: "ممتاز", en: "Excellent", color: "text-green-400" },
    good: { ar: "جيد", en: "Good", color: "text-blue-400" },
    fair: { ar: "مقبول", en: "Fair", color: "text-yellow-400" },
    poor: { ar: "سيء", en: "Poor", color: "text-red-400" },
};

const HR_CONTEXT_LABELS: Record<string, { ar: string; en: string }> = {
    rest: { ar: "راحة", en: "Resting" },
    exercise: { ar: "تمرين", en: "Exercise" },
    wakeup: { ar: "عند الاستيقاظ", en: "Wake Up" }
};


export function SleepTracker() {
    const { language } = useLanguage();
    const isAr = language === "ar";
    
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => getLogs<SleepLog>(SLEEP_KEY));
    const [hours, setHours] = useState(7);
    const [quality, setQuality] = useState<SleepLog["quality"]>("good");
    const [showAdd, setShowAdd] = useState(false);

    const avgSleep = sleepLogs.length
        ? Math.round((sleepLogs.slice(-7).reduce((a, l) => a + l.hours, 0) / Math.min(sleepLogs.length, 7)) * 10) / 10
        : 0;

    const lastLog = sleepLogs[sleepLogs.length - 1];
    const todayLogged = lastLog?.date === todayISO();

    const addLog = () => {
        const newLog: SleepLog = { date: todayISO(), hours, quality };
        const updated = [...sleepLogs.filter(l => l.date !== todayISO()), newLog];
        setSleepLogs(updated);
        saveLogs(SLEEP_KEY, updated);
        setShowAdd(false);
        toast.success(isAr ? `✓ تم تسجيل ${hours} ساعات نوم` : `✓ Logged ${hours} hours of sleep`);
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Moon className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{isAr ? "متابعة النوم" : "Sleep Monitor"}</h3>
                        <p className="text-xs text-zinc-500">{isAr ? "المتوسط آخر 7 أيام" : "7-day average"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400" dir="ltr">{avgSleep}<span className="text-sm text-zinc-500 font-normal">{isAr ? " ساعة" : " hrs"}</span></div>
                    {avgSleep < 7 ? (
                        <span className="text-xs text-yellow-400">{isAr ? "⚠️ أقل من الموصى به" : "⚠️ Less than recommended"}</span>
                    ) : (
                        <span className="text-xs text-green-400">{isAr ? "✓ ممتاز" : "✓ Excellent"}</span>
                    )}
                </div>
            </div>

            {/* 7-day bar chart */}
            {sleepLogs.length > 0 && (
                <div className="flex items-end gap-1.5 h-16">
                    {sleepLogs.slice(-7).map((l, i) => {
                        const pct = Math.min(100, (l.hours / 10) * 100);
                        const col = l.hours >= 7 ? "bg-indigo-400" : l.hours >= 5 ? "bg-yellow-400" : "bg-red-400";
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                                <div className={`w-full rounded-t ${col}`} style={{ height: `${pct}%` }} />
                                <span className="text-[9px] text-zinc-500">{l.date.slice(5)}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add today's log */}
            {!showAdd ? (
                <button
                    onClick={() => setShowAdd(true)}
                    className="w-full py-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20 transition flex items-center justify-center gap-2 border border-indigo-500/20"
                >
                    <Plus size={16} />
                    {todayLogged ? (isAr ? `تعديل نوم اليوم (${lastLog.hours}h)` : `Edit Today's Sleep (${lastLog.hours}h)`) : (isAr ? "سجّل نومك اليوم" : "Log Sleep Today")}
                </button>
            ) : (
                <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between" dir={isAr ? "rtl" : "ltr"}>
                            <span className="text-xs text-zinc-400">{isAr ? "عدد ساعات النوم:" : "Sleep Hours:"} <span className="text-white font-bold">{hours}h</span></span>
                        </div>
                        <input type="range" min={1} max={12} step={0.5} value={hours}
                            onChange={e => setHours(Number(e.target.value))}
                            className="w-full accent-indigo-400" />
                    </div>
                    <div className="flex gap-2 flex-wrap" dir={isAr ? "rtl" : "ltr"}>
                        {(["excellent", "good", "fair", "poor"] as const).map(q => (
                            <button key={q} onClick={() => setQuality(q)}
                                className={`flex-1 py-1.5 text-xs rounded-xl font-semibold transition border ${quality === q ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {isAr ? QUALITY_LABELS[q].ar : QUALITY_LABELS[q].en}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2" dir={isAr ? "rtl" : "ltr"}>
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition">{isAr ? "إلغاء" : "Cancel"}</button>
                        <button onClick={addLog} className="flex-1 py-2 rounded-xl text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition">{isAr ? "حفظ" : "Save"}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HeartRateTracker() {
    const { language } = useLanguage();
    const isAr = language === "ar";
    
    const [hrLogs, setHrLogs] = useState<HRLog[]>(() => getLogs<HRLog>(HR_KEY));
    const [bpm, setBpm] = useState(70);
    const [context, setContext] = useState<HRLog["context"]>("rest");
    const [showAdd, setShowAdd] = useState(false);
    const [measuring, setMeasuring] = useState(false);

    const restingLogs = hrLogs.filter(l => l.context === "rest");
    const avgResting = restingLogs.length
        ? Math.round(restingLogs.slice(-7).reduce((a, l) => a + l.bpm, 0) / Math.min(restingLogs.length, 7))
        : 0;

    const lastLog = hrLogs[hrLogs.length - 1];

    const getHRZone = (b: number) => {
        if (b < 60) return { label: isAr ? "منخفض جداً" : "Very Low", color: "text-blue-400" };
        if (b < 100) return { label: isAr ? "طبيعي" : "Normal", color: "text-green-400" };
        if (b < 120) return { label: isAr ? "مرتفع قليلاً" : "Slightly High", color: "text-yellow-400" };
        return { label: isAr ? "مرتفع" : "High", color: "text-red-400" };
    };

    const addLog = () => {
        const now = new Date();
        const newLog: HRLog = {
            date: todayISO(),
            time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`,
            bpm,
            context,
        };
        const updated = [...hrLogs, newLog];
        setHrLogs(updated);
        saveLogs(HR_KEY, updated);
        setShowAdd(false);
        toast.success(isAr ? `✓ تم تسجيل ${bpm} نبضة/دقيقة` : `✓ Logged ${bpm} bpm`);
    };

    // Simulated "measurement" — animates for 5s then shows result
    const simulateMeasure = () => {
        setMeasuring(true);
        let count = 0;
        const iv = setInterval(() => {
            setBpm(60 + Math.floor(Math.random() * 40));
            count++;
            if (count >= 5) {
                clearInterval(iv);
                setMeasuring(false);
                setShowAdd(true);
            }
        }, 800);
    };

    const zone = getHRZone(lastLog?.bpm || avgResting);

    return (
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Heart className="text-red-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{isAr ? "معدل ضربات القلب" : "Heart Rate"}</h3>
                        <p className="text-xs text-zinc-500">{isAr ? "متوسط الراحة (7 أيام)" : "Resting Avg (7 days)"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-red-400">
                        {measuring ? (
                            <span className="animate-pulse">{bpm}</span>
                        ) : (avgResting || lastLog?.bpm || 0)}
                        <span className="text-sm text-zinc-500 font-normal"> bpm</span>
                    </div>
                    <span className={`text-xs font-semibold ${zone.color}`}>{zone.label}</span>
                </div>
            </div>

            {/* Recent logs */}
            {hrLogs.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {hrLogs.slice(-5).reverse().map((l, i) => {
                        const z = getHRZone(l.bpm);
                        return (
                            <div key={i} className="flex items-center justify-between text-xs bg-zinc-800 rounded-xl px-3 py-2" dir={isAr ? "rtl" : "ltr"}>
                                <span className="text-zinc-400" dir="ltr">{l.date} {l.time} — {isAr ? HR_CONTEXT_LABELS[l.context].ar : HR_CONTEXT_LABELS[l.context].en}</span>
                                <span className={`font-bold ${z.color}`} dir="ltr">{l.bpm} bpm</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2" dir={isAr ? "rtl" : "ltr"}>
                <button
                    onClick={simulateMeasure}
                    disabled={measuring}
                    className="flex-1 py-2.5 rounded-2xl bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Heart size={14} className={measuring ? "animate-pulse" : ""} />
                    {measuring ? (isAr ? "جاري القياس..." : "Measuring...") : (isAr ? "قِس الآن" : "Measure Now")}
                </button>
                <button
                    onClick={() => setShowAdd(s => !s)}
                    className="flex-1 py-2.5 rounded-2xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                >
                    <Plus size={14} />
                    {isAr ? "أدخل يدوياً" : "Enter Manually"}
                </button>
            </div>

            {showAdd && (
                <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400" dir={isAr ? "rtl" : "ltr"}>
                            <span>{isAr ? "معدل النبض" : "Heart Rate"}</span>
                            <span className="text-white font-bold" dir="ltr">{bpm} bpm</span>
                        </div>
                        <input type="range" min={40} max={200} step={1} value={bpm}
                            onChange={e => setBpm(Number(e.target.value))}
                            className="w-full accent-red-400" />
                    </div>
                    <div className="flex gap-2" dir={isAr ? "rtl" : "ltr"}>
                        {(["rest", "exercise", "wakeup"] as const).map(c => (
                            <button key={c} onClick={() => setContext(c)}
                                className={`flex-1 py-1.5 text-[10px] rounded-xl font-semibold border transition ${context === c ? "border-red-400 bg-red-500/20 text-red-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {isAr ? HR_CONTEXT_LABELS[c].ar : HR_CONTEXT_LABELS[c].en}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2" dir={isAr ? "rtl" : "ltr"}>
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-xs text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition">{isAr ? "إلغاء" : "Cancel"}</button>
                        <button onClick={addLog} className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">{isAr ? "حفظ" : "Save"}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
