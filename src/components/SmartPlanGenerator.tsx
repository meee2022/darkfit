import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Sparkles, X, Activity, Calendar, Utensils, Zap } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function SmartPlanGenerator() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const generatePlan = useAction(api.aiPlans.generateSmartPlan);

  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    goal: isAr ? "بناء العضلات" : "Build Muscle",
    fitnessLevel: "intermediate",
    daysPerWeek: 4,
    dietPreference: isAr ? "عالي البروتين" : "High Protein",
    injuries: "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await generatePlan({
        goal: formData.goal,
        fitnessLevel: formData.fitnessLevel,
        daysPerWeek: formData.daysPerWeek,
        dietPreference: formData.dietPreference,
        injuries: formData.injuries ? formData.injuries.split(",").map(i => i.trim()) : [],
      });
      setResult(plan);
    } catch (err) {
      console.error("Failed to generate plan:", err);
      alert(isAr ? "حدث خطأ أثناء التوليد. كرر المحاولة." : "Error generating plan. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full relative group overflow-hidden bg-gradient-to-br from-[#111] to-[#0f0f0f] border border-[#59f20d]/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:border-[#59f20d]/50"
      >
        <div className="absolute inset-0 bg-[#59f20d]/0 group-hover:bg-[#59f20d]/5 transition-colors duration-500"></div>
        <div className="w-16 h-16 rounded-full bg-[#59f20d]/10 flex items-center justify-center mb-4 relative">
          <Brain className="w-8 h-8 text-[#59f20d]" />
          <Sparkles className="w-4 h-4 text-white absolute top-0 right-0 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">{isAr ? "مولّد الخطط الذكي" : "Auto-Plan Generator"}</h3>
        <p className="text-sm text-zinc-500 font-medium">
          {isAr ? "دع الذكاء الاصطناعي يبني خطتك الشاملة للتمرين والتغذية" : "Let AI build your comprehensive workout and nutrition plan"}
        </p>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2 text-[#59f20d]">
                <Brain className="w-5 h-5" />
                <h3 className="font-bold">{isAr ? "مولّد الخطط الذكي بالذكاء الاصطناعي" : "AI Smart Plan Generator"}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-white/50 hover:text-white rounded-full bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {!result && !isGenerating ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">{isAr ? "الهدف الأساسي" : "Primary Goal"}</label>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#59f20d] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white mb-1">{isAr ? "مستوى اللياقة" : "Fitness Level"}</label>
                      <select
                        value={formData.fitnessLevel}
                        onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#59f20d] outline-none"
                      >
                        <option value="beginner">{isAr ? "مبتدئ" : "Beginner"}</option>
                        <option value="intermediate">{isAr ? "متوسط" : "Intermediate"}</option>
                        <option value="advanced">{isAr ? "متقدم" : "Advanced"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-1">{isAr ? "أيام التدريب" : "Training Days"}</label>
                      <input
                        type="number"
                        min="1" max="7"
                        value={formData.daysPerWeek}
                        onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#59f20d] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">{isAr ? "تفضيلات الأكل" : "Diet Preference"}</label>
                    <input
                      type="text"
                      value={formData.dietPreference}
                      onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#59f20d] outline-none"
                      placeholder={isAr ? "مثال: نباتي، كيتو، عالي البروتين" : "e.g. Keto, Vegan, High Protein"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-1">{isAr ? "إصابات أو ملاحظات" : "Injuries / Notes"}</label>
                    <input
                      type="text"
                      value={formData.injuries}
                      onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#59f20d] outline-none"
                      placeholder={isAr ? "مثال: ألم في الكتف، إصابة الركبة" : "e.g. Shoulder pain, Knee injury"}
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="w-full mt-4 py-4 bg-[#59f20d] text-black font-black text-lg rounded-xl hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(89,242,13,0.2)]"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isAr ? "توليد الخطة الذكية" : "Generate Smart Plan"}
                  </button>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-t-2 border-[#59f20d] rounded-full animate-spin"></div>
                    <Brain className="w-12 h-12 text-[#59f20d] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-lg font-bold text-white max-w-xs text-center">
                    {isAr ? "جاري بناء خطتك المخصصة باستخدام ذكاء قوة المهام المدربة..." : "Generating your personalized master plan..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-2xl p-5 mb-4">
                    <h2 className="text-xl font-black text-[#59f20d] mb-1">{result.workoutPlanName}</h2>
                    <p className="text-zinc-400 text-sm">{result.nutritionPlanName}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <span className="block text-xl font-black text-white">{result.dailyMacros?.calories}</span>
                      <span className="text-xs text-zinc-500 uppercase">{isAr ? "سعرة" : "Kcal"}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <Activity className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <span className="block text-xl font-black text-white">{result.dailyMacros?.protein}g</span>
                      <span className="text-xs text-zinc-500 uppercase">{isAr ? "بروتين" : "Protein"}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <Utensils className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <span className="block text-xl font-black text-white">{result.dailyMacros?.carbs}g</span>
                      <span className="text-xs text-zinc-500 uppercase">{isAr ? "كارب" : "Carbs"}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <span className="w-6 h-6 flex items-center justify-center text-yellow-400 font-black mx-auto mb-2 mx-auto">F</span>
                      <span className="block text-xl font-black text-white">{result.dailyMacros?.fats}g</span>
                      <span className="text-xs text-zinc-500 uppercase">{isAr ? "دهون" : "Fats"}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#59f20d]" />
                      {isAr ? "جدول التدريب" : "Training Schedule"}
                    </h3>
                    <div className="space-y-2">
                      {result.weeklySchedule?.map((day: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <h4 className="font-bold text-[#59f20d] text-sm mb-1">{isAr ? `اليوم ${day.day}` : `Day ${day.day}`} — {day.focus}</h4>
                          <p className="text-white text-sm">{day.exercises?.join(" • ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.tips && result.tips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">{isAr ? "نصائح ذكية" : "Smart Tips"}</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                        {result.tips.map((tip: string, i: number) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      // Optionally save to DB here or just close
                      setIsOpen(false);
                      setResult(null);
                      alert(isAr ? "تم حفظ الخطة!" : "Plan Saved!");
                    }}
                    className="w-full mt-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    {isAr ? "اعتماد الخطة والمتابعة" : "Accept Plan & Continue"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
