import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Droplets, X } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { toast } from "sonner";

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

export function WaterReminder() {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const today = todayISO();
    const log = useQuery(api.nutrition.getUserNutritionLog, { date: today });
    const setWater = useMutation(api.nutrition.setWaterIntake);

    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check local storage 
        const dismissedToday = localStorage.getItem(`waterReminded_${today}`);
        if (dismissedToday === "true") return;

        const hideUntil = localStorage.getItem("waterReminderTime");
        if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;

        // Show reminder after a short delay
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
    }, [today]);

    const handleYes = async () => {
        const currentWater = log?.waterIntake || 0;
        try {
            await setWater({ waterIntake: currentWater + 250, date: today });
            localStorage.setItem(`waterReminded_${today}`, "true");
            setShow(false);
            toast.success(isAr ? "رائع! استمر في شرب الماء 💧" : "Great! Keep drinking water 💧");
        } catch (e: any) {
            toast.error(isAr ? "حدث خطأ" : "Error");
        }
    };

    const handleNo = () => {
        // Remind in 2 hours
        const twoHoursLater = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem("waterReminderTime", twoHoursLater.toString());
        setShow(false);
    };

    useEffect(() => {
        if (!show) {
            document.body.classList.remove('blur-active', 'modal-open');
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }, [show]);

    if (!show) return null;

    return (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" 
          onClick={() => setShow(false)}
        >
            <div 
              className="w-full max-w-sm bg-black/80 backdrop-blur-xl border-2 border-blue-500/50 p-5 rounded-[2rem] shadow-[0_10px_40px_rgba(59,130,246,0.3)] animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">{isAr ? "تذكير شرب الماء" : "Water Reminder"}</h4>
                            <p className="text-sm text-blue-200 mt-0.5">{isAr ? "هل شربت كمية كافية من الماء اليوم؟" : "Have you drank enough water today?"}</p>
                        </div>
                    </div>
                    <button onClick={() => setShow(false)} className="text-blue-400 hover:text-white p-1 bg-blue-500/10 rounded-full transition">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={handleYes}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95"
                    >
                        {isAr ? "نعم، أضف كوباً" : "Yes, add a glass"}
                    </button>
                    <button
                        onClick={handleNo}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-xl transition-colors border border-zinc-700 hover:border-zinc-600"
                    >
                        {isAr ? "لا، ذكرني لاحقاً" : "No, remind later"}
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                `
            }} />
        </div>
    );
}
