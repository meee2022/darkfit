import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Sparkles, Trophy, Activity, ArrowRight, CheckCircle2, X, Dumbbell, Zap } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const setCompleted = useMutation(api.profiles.setOnboardingCompleted);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: isAr ? "مرحباً بك في DarkFit Pro" : "Welcome to DarkFit Pro",
      desc: isAr ? "نحن هنا لنحول رحلتك الرياضية إلى تجربة ذكية متكاملة." : "We're here to transform your fitness journey into a smart, integrated experience.",
      icon: <Sparkles className="w-12 h-12 text-neon-400" />,
      color: "from-neon-400/20 to-transparent"
    },
    {
      title: isAr ? "المدرب الذكي AI" : "AI Smart Coach",
      desc: isAr ? "احصل على خطط تدريب وتغذية مفصلة، وحلل وجباتك بالصور بضغطة زر." : "Get detailed training and nutrition plans, and analyze your meals with a single click.",
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      color: "from-purple-400/20 to-transparent"
    },
    {
      title: isAr ? "سجل تمارينك بدقة" : "Track Every Rep",
      desc: isAr ? "تابع تقدمك، حطم أرقامك القياسية، وشاهد تطورك الأسبوعي بالرسوم البيانية." : "Track your progress, break personal records, and see your weekly evolution with charts.",
      icon: <Activity className="w-12 h-12 text-blue-400" />,
      color: "from-blue-400/20 to-transparent"
    },
    {
      title: isAr ? "المجتمع والتحديات" : "Social & Challenges",
      desc: isAr ? "نافس في لوحة المتصدرين، شارك في التحديات الجماعية، وتواصل مع مدربك." : "Compete in the leaderboard, join group challenges, and chat with your coach.",
      icon: <Trophy className="w-12 h-12 text-amber-400" />,
      color: "from-amber-400/20 to-transparent"
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await setCompleted();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${steps[step].color} opacity-30 transition-all duration-700`}></div>
      
      <div className="w-full max-w-lg bg-zinc-950/80 border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center p-8 md:p-12 animate-in fade-in zoom-in duration-500 backdrop-blur-md">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-neon-400 shadow-[0_0_10px_rgba(89,242,13,0.5)]' : 'bg-white/10'}`}
            ></div>
          ))}
        </div>

        <div className="mb-8 p-6 rounded-[2rem] bg-white/5 border border-white/5 animate-bounce-slow">
          {steps[step].icon}
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          {steps[step].title}
        </h2>
        
        <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-12 max-w-sm">
          {steps[step].desc}
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={handleNext}
            className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3"
          >
            {step === steps.length - 1 ? (
              <>
                <Zap className="w-6 h-6 fill-black" />
                {isAr ? "ابدأ الآن" : "Let's Go!"}
              </>
            ) : (
              <>
                {isAr ? "التالي" : "Continue"}
                <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          
          <button 
            onClick={async () => {
               await setCompleted();
               onComplete();
            }}
            className="text-zinc-500 font-black text-sm hover:text-white transition-colors uppercase tracking-widest"
          >
            {isAr ? "تخطي" : "Skip Introduction"}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-neon-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
