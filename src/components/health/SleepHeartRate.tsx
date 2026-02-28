import React, { useState, useEffect } from "react";
import { Activity, Heart, Moon, Sun, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

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

const QUALITY_LABELS: Record<string, { ar: string; color: string }> = {
    excellent: { ar: "ممتاز", color: "text-green-400" },
    good: { ar: "جيد", color: "text-blue-400" },
    fair: { ar: "مقبول", color: "text-yellow-400" },
    poor: { ar: "سيء", color: "text-red-400" },
};

const HR_CONTEXT_LABELS: Record<string, string> = {
    rest: "راحة", exercise: "تمرين", wakeup: "عند الاستيقاظ"
};

export function SleepTracker() {
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
        toast.success(`✓ تم تسجيل ${hours} ساعات نوم`);
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Moon className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">متابعة النوم</h3>
                        <p className="text-xs text-zinc-500">المتوسط آخر 7 أيام</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400">{avgSleep}<span className="text-sm text-zinc-500 font-normal"> ساعة</span></div>
                    {avgSleep < 7 ? (
                        <span className="text-xs text-yellow-400">⚠️ أقل من الموصى به</span>
                    ) : (
                        <span className="text-xs text-green-400">✓ ممتاز</span>
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
                    {todayLogged ? `تعديل نوم اليوم (${lastLog.hours}h)` : "سجّل نومك اليوم"}
                </button>
            ) : (
                <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">عدد ساعات النوم: <span className="text-white font-bold">{hours}h</span></span>
                        </div>
                        <input type="range" min={1} max={12} step={0.5} value={hours}
                            onChange={e => setHours(Number(e.target.value))}
                            className="w-full accent-indigo-400" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["excellent", "good", "fair", "poor"] as const).map(q => (
                            <button key={q} onClick={() => setQuality(q)}
                                className={`flex-1 py-1.5 text-xs rounded-xl font-semibold transition border ${quality === q ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {QUALITY_LABELS[q].ar}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-sm text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition">إلغاء</button>
                        <button onClick={addLog} className="flex-1 py-2 rounded-xl text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition">حفظ</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HeartRateTracker() {
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
        if (b < 60) return { label: "منخفض جداً", color: "text-blue-400" };
        if (b < 100) return { label: "طبيعي", color: "text-green-400" };
        if (b < 120) return { label: "مرتفع قليلاً", color: "text-yellow-400" };
        return { label: "مرتفع", color: "text-red-400" };
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
        toast.success(`✓ تم تسجيل ${bpm} نبضة/دقيقة`);
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
                        <h3 className="font-bold text-white">معدل ضربات القلب</h3>
                        <p className="text-xs text-zinc-500">متوسط الراحة (7 أيام)</p>
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
                            <div key={i} className="flex items-center justify-between text-xs bg-zinc-800 rounded-xl px-3 py-2">
                                <span className="text-zinc-400">{l.date} {l.time} — {HR_CONTEXT_LABELS[l.context]}</span>
                                <span className={`font-bold ${z.color}`}>{l.bpm} bpm</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={simulateMeasure}
                    disabled={measuring}
                    className="flex-1 py-2.5 rounded-2xl bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Heart size={14} className={measuring ? "animate-pulse" : ""} />
                    {measuring ? "جاري القياس..." : "قِس الآن"}
                </button>
                <button
                    onClick={() => setShowAdd(s => !s)}
                    className="flex-1 py-2.5 rounded-2xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                >
                    <Plus size={14} />
                    أدخل يدوياً
                </button>
            </div>

            {showAdd && (
                <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>معدل النبض</span>
                            <span className="text-white font-bold">{bpm} bpm</span>
                        </div>
                        <input type="range" min={40} max={200} step={1} value={bpm}
                            onChange={e => setBpm(Number(e.target.value))}
                            className="w-full accent-red-400" />
                    </div>
                    <div className="flex gap-2">
                        {(["rest", "exercise", "wakeup"] as const).map(c => (
                            <button key={c} onClick={() => setContext(c)}
                                className={`flex-1 py-1.5 text-[10px] rounded-xl font-semibold border transition ${context === c ? "border-red-400 bg-red-500/20 text-red-300" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {HR_CONTEXT_LABELS[c]}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-xs text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition">إلغاء</button>
                        <button onClick={addLog} className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">حفظ</button>
                    </div>
                </div>
            )}
        </div>
    );
}
