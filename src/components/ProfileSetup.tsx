import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Target as TargetIcon,
  User as UserIcon,
  ArrowUpRight,
  Rocket,
  Sparkles,
  CheckCircle2,
  Dumbbell,
  Scale,
  Calendar,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export function ProfileSetup() {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Goal, 2: Info, 3: Stats, 4: Habits, 5: Success
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female",
    weight: "",
    height: "",
    fitnessLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    goals: [] as string[],
    medicalConditions: [] as string[],
    trainingDaysPerWeek: 3 as 2 | 3 | 4 | 5 | 6,
    trainingLocation: "gym" as "gym" | "home" | "both",
    experienceWithWeights: "none" as "none" | "beginner" | "intermediate" | "advanced",
    targetWeight: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProfile = useMutation(api.profiles.createOrUpdateProfile);

  const calculateMaintenance = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseInt(formData.age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return 0;

    let bmr = 0;
    if (formData.gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const multipliers = { beginner: 1.2, intermediate: 1.55, advanced: 1.725 };
    return Math.round(bmr * multipliers[formData.fitnessLevel]);
  }, [formData]);

  const calculateMacros = useMemo(() => {
    const calories = calculateMaintenance;
    if (calories === 0) return { protein: 0, carbs: 0, fats: 0 };

    const goal = formData.goals[0] || "تحسين الصحة العامة";
    let pRatio = 0.25, cRatio = 0.45, fRatio = 0.30;

    if (goal === "فقدان الوزن") {
      pRatio = 0.40; cRatio = 0.30; fRatio = 0.30;
    } else if (goal === "بناء العضلات") {
      pRatio = 0.30; cRatio = 0.50; fRatio = 0.20;
    }

    return {
      protein: Math.round((calories * pRatio) / 4),
      carbs: Math.round((calories * cRatio) / 4),
      fats: Math.round((calories * fRatio) / 9)
    };
  }, [calculateMaintenance, formData.goals]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const macros = calculateMacros;
      await createProfile({
        name: formData.name.trim() || "User",
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
        fitnessLevel: formData.fitnessLevel,
        goals: formData.goals,
        trainingDaysPerWeek: formData.trainingDaysPerWeek,
        trainingLocation: formData.trainingLocation,
        experienceWithWeights: formData.experienceWithWeights,
        calories: calculateMaintenance,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      });
      setStep(5);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.goals.length === 0) {
      toast.error("الرجاء اختيار هدفك الرياضي");
      return;
    }
    if (step === 2 && (!formData.name || !formData.age)) {
      toast.error("الرجاء إكمال بياناتك الأساسية");
      return;
    }
    if (step === 3 && (!formData.weight || !formData.height)) {
      toast.error("الرجاء إدخال وزنك وطولك");
      return;
    }
    if (step === 4) {
      handleFinalSubmit();
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: [goal], // Primary goal focus
    }));
  };

  const stepTransition = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.95 },
    transition: { duration: 0.4, ease: "circOut" }
  };

  return (
    <div className="min-h-screen bg-[#0a0d08] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#59f20d]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative">
        <AnimatePresence mode="wait">
          {/* STEP 0: WELCOME */}
          {step === 0 && (
            <motion.div
              key="step0"
              {...stepTransition}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#59f20d] to-[#4ed10a] flex items-center justify-center shadow-[0_20px_50px_rgba(89,242,13,0.4)] mx-auto rotate-12">
                  <Rocket className="w-16 h-16 text-black -rotate-12" />
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-[#59f20d]" />
                </motion.div>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-black text-white tracking-tighter">
                  أهلاً بك في <span className="text-[#59f20d]">DarkFit</span>
                </h1>
                <p className="text-zinc-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                  جاهز لتبدأ رحلة التحول؟ سنقوم ببناء خطة مخصصة لك في أقل من دقيقة.
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="group relative px-12 py-5 rounded-[2rem] bg-[#59f20d] hover:bg-[#4ed10a] text-black font-black text-xl transition-all shadow-[0_20px_40px_rgba(89,242,13,0.3)] hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
              >
                <span>ابدأ الآن</span>
                <ArrowLeft className="w-6 h-6 group-hover:translate-x-[-4px] transition-transform" />
              </button>
            </motion.div>
          )}

          {/* ONBOARDING STEPS */}
          {step > 0 && step < 5 && (
            <motion.div
              key="onboarding-container"
              {...stepTransition}
              className="bg-[#111] border border-white/5 p-8 rounded-[3rem] shadow-2xl space-y-8"
            >
              {/* Progress Tracker */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-500",
                      step >= s ? "bg-[#59f20d]" : "bg-zinc-800"
                    )}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* STEP 1: GOAL */}
                {step === 1 && (
                  <motion.div key="step1" {...stepTransition} className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black text-white">ما هو هدفك الأساسي؟</h2>
                      <p className="text-zinc-500 text-sm font-medium">اختر المسار الذي تفضله</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: "فقدان الوزن", title: "خسارة الوزن وتنشيف الدهون", icon: Scale, color: "text-[#59f20d]" },
                        { id: "بناء العضلات", title: "بناء عضلات وضخامة", icon: Dumbbell, color: "text-blue-400" },
                        { id: "تحسين الصحة العامة", title: "المحافظة على الصحة واللياقة", icon: TargetIcon, color: "text-amber-400" }
                      ].map((g) => {
                        const active = formData.goals.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            onClick={() => toggleGoal(g.id)}
                            className={cn(
                              "p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all relative overflow-hidden group",
                              active
                                ? "bg-[#59f20d]/5 border-[#59f20d] shadow-[0_0_30px_rgba(89,242,13,0.1)]"
                                : "bg-black border-white/5 hover:border-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                              active ? "bg-[#59f20d] text-black" : "bg-zinc-900 text-zinc-500"
                            )}>
                              <g.icon className="w-8 h-8" />
                            </div>
                            <span className={cn("text-lg font-black", active ? "text-white" : "text-zinc-500")}>
                              {g.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: BASIC INFO */}
                {step === 2 && (
                  <motion.div key="step2" {...stepTransition} className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black text-white">لنتعرف عليك أكثر</h2>
                      <p className="text-zinc-500 text-sm font-medium">البيانات الأساسية لحساب احتياجك</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">الاسم بالكامل</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-5 bg-black border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-[#59f20d]/50 transition-all"
                          placeholder="مثال: أحمد محمد"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">العمر</label>
                          <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full p-5 bg-black border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-[#59f20d]/50 transition-all"
                            placeholder="25"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">الجنس</label>
                          <div className="flex gap-2 bg-black border border-white/5 rounded-2xl p-1">
                            <button
                              onClick={() => setFormData({ ...formData, gender: "male" })}
                              className={cn(
                                "flex-1 py-4 rounded-xl font-black text-sm transition-all",
                                formData.gender === "male" ? "bg-white text-black" : "text-zinc-500"
                              )}
                            >ذكر</button>
                            <button
                              onClick={() => setFormData({ ...formData, gender: "female" })}
                              className={cn(
                                "flex-1 py-4 rounded-xl font-black text-sm transition-all",
                                formData.gender === "female" ? "bg-[#ff4d94] text-white" : "text-zinc-500"
                              )}
                            >أنثى</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: MEASUREMENTS */}
                {step === 3 && (
                  <motion.div key="step3" {...stepTransition} className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black text-white">القياسات الحالية</h2>
                      <p className="text-zinc-500 text-sm font-medium">الوزن الحالي والطول الحالي</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Current Weight (kg)</span>
                          <span className="text-3xl font-black text-[#59f20d]">{formData.weight || 0}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          step="0.5"
                          value={formData.weight || 70}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="w-full accent-[#59f20d] h-2 bg-zinc-800 rounded-full"
                        />
                      </div>
                      <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Height (cm)</span>
                          <span className="text-3xl font-black text-blue-400">{formData.height || 0}</span>
                        </div>
                        <input
                          type="range"
                          min="120"
                          max="230"
                          value={formData.height || 170}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: HABITS & TARGET */}
                {step === 4 && (
                  <motion.div key="step4" {...stepTransition} className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black text-white">الوزن والتدريب</h2>
                      <p className="text-zinc-500 text-sm font-medium">حدد هدفك الأسبوعي للتمارين</p>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">الوزن المستهدف (كجم)</label>
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => setFormData(p => ({ ...p, targetWeight: String(parseFloat(p.targetWeight || "70") - 1) }))} className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white text-2xl font-black">-</button>
                          <input
                            type="number"
                            value={formData.targetWeight}
                            onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                            className="w-32 bg-transparent text-5xl font-black text-white text-center outline-none"
                            placeholder="70"
                          />
                          <button onClick={() => setFormData(p => ({ ...p, targetWeight: String(parseFloat(p.targetWeight || "70") + 1) }))} className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white text-2xl font-black">+</button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">كم يوم تتمرن في الأسبوع؟</label>
                        <div className="flex justify-between gap-2 px-4">
                          {[2, 3, 4, 5, 6].map(num => (
                            <button
                              key={num}
                              onClick={() => setFormData({ ...formData, trainingDaysPerWeek: num as any })}
                              className={cn(
                                "w-14 h-14 rounded-2xl font-black text-xl transition-all",
                                formData.trainingDaysPerWeek === num
                                  ? "bg-[#59f20d] text-black shadow-[0_10px_20px_rgba(89,242,13,0.3)] scale-110"
                                  : "bg-zinc-900 text-zinc-500 hover:text-white"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-4 pt-8">
                <button
                  onClick={prevStep}
                  className="w-16 h-16 rounded-3xl bg-black border border-white/5 text-zinc-500 hover:text-white flex items-center justify-center transition-all"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
                <button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="flex-1 h-16 rounded-[2rem] bg-[#59f20d] hover:bg-[#4ed10a] text-black font-black text-xl transition-all shadow-[0_15px_30px_rgba(89,242,13,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{step === 4 ? "تحضير خطتي" : "متابعة"}</span>
                      {step === 4 ? <Sparkles className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <motion.div
              key="step5"
              {...stepTransition}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-[#59f20d]/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-[#59f20d]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white">تم تجهيز خطتك يا {formData.name.split(" ")[0]}!</h2>
                <p className="text-zinc-500 text-lg font-medium">بناءً على بياناتك، قمنا بتخصيص هدفك اليومي:</p>
                
                <div className="relative group p-8 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-black border border-[#59f20d]/30 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/5 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="text-sm font-black text-[#59f20d] uppercase tracking-[0.2em]">Total Daily Calories</div>
                    <div className="text-6xl font-black text-white tabular-nums drop-shadow-2xl">{calculateMaintenance.toLocaleString()}</div>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">سعرة حرارية يومياً</div>
                  </div>
                </div>

                {/* Macros Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center gap-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-black text-white">{calculateMacros.protein}g</div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">بروتين</div>
                  </motion.div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center gap-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-black text-white">{calculateMacros.carbs}g</div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">كارب</div>
                  </motion.div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center gap-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-black text-white">{calculateMacros.fats}g</div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">دهون</div>
                  </motion.div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => window.location.reload()} // Trigger state check in App.tsx
                  className="px-12 py-5 rounded-[2rem] bg-white text-black font-black text-xl transition-all hover:bg-gray-200 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 mx-auto"
                >
                  <span>ادخل للتطبيق</span>
                  <Rocket className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
