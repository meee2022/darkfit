import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Activity, Zap, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function AiCoachOnboarding({ onComplete }: { onComplete: () => void }) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [step, setStep] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const activateCoach = useMutation(api.aiCoach.activateSmartCoach);

  const slides = [
    {
      icon: <Brain className="w-20 h-20 text-neon-400 mb-6" />,
      title: isAr ? "يعرفك أكثر من نفسك" : "Knows you better than yourself",
      desc: isAr 
        ? "المدرب الذكي من DarkFit يراقب أوزانك، نومك، ومستوى الإرهاق ليربط كل هذه التفاصيل ويقدم لك نصائح مخصصة بدقة."
        : "The DarkFit Smart Coach monitors your weights, sleep, and fatigue levels to connect the dots and provide tailored advice."
    },
    {
      icon: <Activity className="w-20 h-20 text-blue-400 mb-6" />,
      title: isAr ? "يستشعر الإرهاق قبل أن تشعر به" : "Senses fatigue before you do",
      desc: isAr 
        ? "من خلال تسجيل حالة نومك يومياً، سيقوم النظام بتحذيرك قبل الوقوع في فخ الإجهاد العضلي (Overtraining)."
        : "By logging your daily sleep, our system warns you before falling into the overtraining trap."
    },
    {
      icon: <Zap className="w-20 h-20 text-purple-400 mb-6" />,
      title: isAr ? "يتوقع مستقبلك الرياضي" : "Predicts your athletic future",
      desc: isAr 
        ? "بينما تتمرن، سيحلل المدرب ثبات أرقامك ليتوقع أوقات كسر الأرقام القياسية أو يحذرك من احتمالية ثبات الوزن."
        : "As you train, the coach analyzes your metrics to predict PRs and plateau risks ahead of time."
    }
  ];

  const handleNext = async () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setIsActivating(true);
      try {
        await activateCoach();
        onComplete();
      } catch (err) {
        console.error(err);
      } finally {
        setIsActivating(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center p-6" dir={dir}>
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-neon-400/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col h-full py-12">
        {/* Skip button space or Logo */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-neon-400" : "w-3 bg-white/20"}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500" key={step}>
          <div className="relative">
            <div className="absolute inset-0 bg-current opacity-20 blur-3xl rounded-full"></div>
            {slides[step].icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight leading-tight">
            {slides[step].title}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {slides[step].desc}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-12 flex items-center justify-between gap-4">
          {step > 0 && (
            <button 
              onClick={handlePrev}
              className="p-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition"
            >
              {isAr ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
            </button>
          )}
          
          <button 
            onClick={handleNext}
            disabled={isActivating}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl font-black text-lg transition-all ${
              step === slides.length - 1
                ? "bg-neon-400 text-black hover:bg-[#4ddf0b] shadow-[0_0_20px_rgba(89,242,13,0.4)]"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {isActivating ? (
              <span className="opacity-50">{isAr ? "جاري التفعيل..." : "Activating..."}</span>
            ) : step === slides.length - 1 ? (
              <>
                <CheckCircle className="w-6 h-6" />
                {isAr ? "تفعيل المدرب الذكي" : "Activate Smart Coach"}
              </>
            ) : (
              <>
                {isAr ? "التالي" : "Next"}
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
