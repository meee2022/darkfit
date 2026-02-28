import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, X, Settings, ChevronUp, ChevronDown } from "lucide-react";

function beep(freq = 880, duration = 200, volume = 0.4) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration / 1000);
    } catch { }
}

export function WorkoutTimer() {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Config
    const [totalSets, setTotalSets] = useState(3);
    const [exerciseSecs, setExerciseSecs] = useState(45);
    const [restSecs, setRestSecs] = useState(60);

    // Runtime state
    const [mode, setMode] = useState<"exercise" | "rest">("exercise");
    const [currentSet, setCurrentSet] = useState(1);
    const [seconds, setSeconds] = useState(45);
    const [isRunning, setIsRunning] = useState(false);
    const [done, setDone] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync seconds when config changes (only when stopped)
    useEffect(() => {
        if (!isRunning) {
            setSeconds(mode === "exercise" ? exerciseSecs : restSecs);
        }
    }, [exerciseSecs, restSecs]);

    const handleTimerEnd = useCallback(() => {
        if (mode === "exercise") {
            beep(1000, 300);
            if (currentSet >= totalSets) {
                // All sets done
                beep(660, 600);
                setIsRunning(false);
                setDone(true);
                return;
            }
            // Switch to rest
            setMode("rest");
            setSeconds(restSecs);
            // Keep running
        } else {
            // Rest done → next set exercise
            beep(880, 300);
            setMode("exercise");
            setCurrentSet(prev => prev + 1);
            setSeconds(exerciseSecs);
            // Keep running
        }
    }, [mode, currentSet, totalSets, restSecs, exerciseSecs]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        handleTimerEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, handleTimerEnd]);

    const resetAll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setMode("exercise");
        setCurrentSet(1);
        setSeconds(exerciseSecs);
        setDone(false);
    };

    const toggleTimer = () => {
        if (done) { resetAll(); return; }
        setIsRunning(r => !r);
    };

    const switchMode = (m: "exercise" | "rest") => {
        setIsRunning(false);
        setMode(m);
        setSeconds(m === "exercise" ? exerciseSecs : restSecs);
        setDone(false);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const maxSecs = mode === "exercise" ? exerciseSecs : restSecs;
    const progress = maxSecs > 0 ? ((maxSecs - seconds) / maxSecs) * 100 : 0;
    const ringColor = done ? "#f59e0b" : mode === "exercise" ? "#59f20d" : "#38bdf8";

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#59f20d] text-black rounded-full shadow-[0_4px_20px_rgba(89,242,13,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-50"
                aria-label="Open Timer"
            >
                <Timer size={28} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 bg-[#0a0d08]/97 border border-[#59f20d]/40 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-5 z-50 backdrop-blur-md flex flex-col items-center gap-4">
            {/* Header */}
            <div className="flex items-center justify-between w-full">
                <button onClick={() => setShowSettings(s => !s)} className="text-slate-400 hover:text-white transition">
                    <Settings size={18} />
                </button>
                <span className="text-xs text-slate-400 font-semibold">
                    {done ? "✅ انتهيت!" : `سيت ${currentSet} / ${totalSets}`}
                </span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
                    <X size={18} />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="w-full bg-slate-900 rounded-2xl p-4 space-y-3 border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 text-center mb-2">إعدادات المؤقت</h4>
                    {[
                        { label: "عدد السيتات", val: totalSets, set: setTotalSets, min: 1, max: 10 },
                        { label: "وقت التمرين (ث)", val: exerciseSecs, set: setExerciseSecs, min: 5, max: 300 },
                        { label: "وقت الراحة (ث)", val: restSecs, set: setRestSecs, min: 5, max: 300 },
                    ].map(({ label, val, set, min, max }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{label}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => set(v => Math.max(min, v - (label.includes("ث") ? 5 : 1)))}
                                    className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700">
                                    <ChevronDown size={12} />
                                </button>
                                <span className="text-sm font-bold text-white w-8 text-center">{val}</span>
                                <button onClick={() => set(v => Math.min(max, v + (label.includes("ث") ? 5 : 1)))}
                                    className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700">
                                    <ChevronUp size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { resetAll(); setShowSettings(false); }}
                        className="w-full text-xs py-1.5 rounded-xl bg-[#59f20d]/10 text-[#59f20d] font-semibold mt-2 hover:bg-[#59f20d]/20 transition">
                        تطبيق وإعادة ضبط
                    </button>
                </div>
            )}

            {/* Mode Switch */}
            <div className="flex bg-slate-800/60 rounded-xl p-1 w-full">
                <button onClick={() => switchMode("exercise")}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition font-semibold ${mode === "exercise" ? "bg-[#59f20d] text-black" : "text-slate-400 hover:text-white"}`}>
                    تمرين
                </button>
                <button onClick={() => switchMode("rest")}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition font-semibold ${mode === "rest" ? "bg-sky-400 text-black" : "text-slate-400 hover:text-white"}`}>
                    راحة
                </button>
            </div>

            {/* Ring Timer */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="68" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                    <circle cx="80" cy="80" r="68"
                        stroke={ringColor}
                        strokeWidth="10" fill="transparent"
                        strokeDasharray={427}
                        strokeDashoffset={427 - (427 * progress) / 100}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white tracking-wider font-mono">
                        {formatTime(seconds)}
                    </span>
                    <span className={`text-xs mt-1 font-semibold ${done ? "text-yellow-400" : mode === "exercise" ? "text-[#59f20d]" : "text-sky-400"}`}>
                        {done ? "أحسنت! 🏆" : mode === "exercise" ? "وقت التمرين" : "وقت الراحة"}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button onClick={resetAll}
                    className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition">
                    <RotateCcw size={18} />
                </button>
                <button onClick={toggleTimer}
                    className={`w-16 h-16 rounded-2xl text-black flex items-center justify-center hover:scale-105 transition font-bold shadow-lg ${done ? "bg-yellow-400 shadow-yellow-400/30" :
                            mode === "exercise" ? "bg-[#59f20d] shadow-[#59f20d]/30" : "bg-sky-400 shadow-sky-400/30"
                        }`}>
                    {done ? <RotateCcw size={28} /> : isRunning ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                </button>
            </div>

            {/* Set dots */}
            <div className="flex gap-1.5 flex-wrap justify-center">
                {Array.from({ length: totalSets }, (_, i) => (
                    <div key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i + 1 < currentSet ? "bg-[#59f20d]" :
                                i + 1 === currentSet ? (mode === "exercise" ? "bg-[#59f20d] animate-pulse" : "bg-sky-400 animate-pulse") :
                                    "bg-slate-700"
                            }`} />
                ))}
            </div>
        </div>
    );
}
