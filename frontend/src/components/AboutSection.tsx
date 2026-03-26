import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { 
  Dumbbell, Zap, Salad, ClipboardList, Brain, Bot, 
  Pill, UserCheck, TrendingUp, Calculator, Heart, 
  User, Globe, ArrowLeft
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

// Simple Counter component for the Stats bar
function Counter({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function AboutSection({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar"; // Required fully RTL as per instruction

  const features = [
    {
      id: "exercises",
      icon: Dumbbell,
      title: "مكتبة تمارين شاملة",
      desc: "+97 تمرين مصنف حسب العضلة والمستوى مع فيديوهات توضيحية وصور GIF متحركة وخريطة عضلية تفاعلية — اضغط على أي عضلة لعرض تمارينها."
    },
    {
      id: "workoutGenerator",
      icon: Zap,
      title: "مولّد التمارين الذكي",
      desc: "دع الذكاء الاصطناعي يبني جدولك التدريبي. اختر هدفك ومستواك واحصل على برنامج مخصص فورًا يستهدف كل مجموعة عضلية بالتوازن."
    },
    {
      id: "nutrition",
      icon: Salad,
      title: "نظام تغذية متكامل",
      desc: "تتبع وجباتك الأربع يوميًا مع حساب تلقائي للسعرات والماكرو (30% بروتين، 50% كارب، 20% دهون). ماسح باركود، تتبع ماء، واقتراحات وجبات ذكية."
    },
    {
      id: "plans",
      icon: ClipboardList,
      title: "خطط تدريب وتغذية مخصصة",
      desc: "خطط تنشيف وتضخيم ولياقة عامة مع نسبة تقدم مرئية وإرشادات مدرب شخصية لكل خطة."
    },
    {
      id: "smartCoach",
      icon: Brain,
      title: "المدرب الذكي AI",
      desc: "يحلل نومك وإرهاقك وخطواتك ويعطيك مستوى استعداد يومي من 100 مع توجيهات مباشرة مبنية على بياناتك الحقيقية."
    },
    {
      id: "fitbot",
      icon: Bot,
      title: "المساعد الذكي FitBot",
      desc: "مدربك الشخصي وخبير تغذيتك متاح 24/7. اسأل أي سؤال باللغة العربية واحصل على إجابة مخصصة مبنية على أحدث الأبحاث."
    },
    {
      id: "supplements",
      icon: Pill,
      title: "دليل المكملات الغذائية",
      desc: "دليل شامل مدعوم علميًا — تقييم قوة الدليل لكل مكمل، آلية العمل، الجرعة المثلى، التحذيرات، والمراجع العلمية من مصادر موثوقة."
    },
    {
      id: "coaches",
      icon: UserCheck,
      title: "مدربون معتمدون",
      desc: "تواصل مع نخبة المدربين المحترفين واحجز جلسات شخصية مباشرة. ملفات تفصيلية مع التخصصات والتقييمات وسنوات الخبرة."
    },
    {
      id: "dashboard",
      icon: TrendingUp,
      title: "تتبع التطور",
      desc: "سجل وزنك يوميًا وراقب اتجاه التقدم بالرسوم البيانية. تنبيهات ذكية وصور تطور لمقارنة قبل وبعد."
    },
    {
      id: "calculator",
      icon: Calculator,
      title: "حاسبة السعرات والـ BMI",
      desc: "احسب مؤشر كتلة جسمك واحتياجك اليومي من السعرات بدقة — تحديث تلقائي من بيانات ملفك الشخصي."
    },
    {
      id: "health",
      icon: Heart,
      title: "القسم الصحي",
      desc: "تتبع معدل ضربات القلب وجودة النوم مع تصنيفات صحية حسب فئتك العمرية وربط مع Google Fit وApple Health."
    },
    {
      id: "profile",
      icon: User,
      title: "ملف شخصي متكامل",
      desc: "بياناتك الجسدية، أهدافك، إنجازاتك، سجل نشاطك، صور التطور، والأجهزة المتصلة — كلها في مكان واحد."
    },
    {
      id: "",
      icon: Globe,
      title: "ثنائي اللغة",
      desc: "واجهة عربية كاملة RTL مع إمكانية التبديل للإنجليزية بضغطة واحدة. خطوط احترافية مصممة للشاشات الرقمية."
    }
  ];

  const targetAudience = [
    { icon: "💪", title: "للمبتدئين", desc: "لا تعرف من أين تبدأ؟ DarkFit يأخذك خطوة بخطوة من اختيار التمارين إلى بناء نظام غذائي متوازن." },
    { icon: "🏆", title: "للمتقدمين", desc: "تبحث عن التحدي؟ تمارين متقدمة، تتبع دقيق للأداء، وتحليل ذكي يدفعك لتجاوز حدودك." },
    { icon: "⚖️", title: "لخسارة الوزن", desc: "نظام غذائي مرن مع حساب السعرات، تمارين متنوعة، وتتبع يومي للوزن مع تحفيز مستمر." },
    { icon: "🏗️", title: "لبناء العضلات", desc: "خطط تضخيم مدروسة، حساب بروتين دقيق، دليل مكملات علمي، وتتبع لتقدم القوة." },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0d08] text-white overflow-x-hidden font-cairo" dir="rtl">
      
      {/* SECTION 1: HERO */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="pt-20 pb-12 px-6 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        <span className="bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6">
          لماذا DarkFit؟
        </span>
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight drop-shadow-md">
          رفيقك الذكي في <br className="hidden md:block" /> رحلة التحوّل
        </h1>
        <p className="text-[#aaaaaa] text-lg md:text-xl leading-relaxed max-w-3xl">
          DarkFit ليس مجرد تطبيق لياقة — إنه نظام متكامل يجمع بين التدريب الاحترافي، التغذية المحسوبة بدقة، والذكاء الاصطناعي. صُمم خصيصًا للرياضي العربي الذي يريد نتائج حقيقية، لا وعودًا فارغة.
        </p>
      </motion.section>

      {/* SECTION 2: STATS BAR */}
      <section className="py-8 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "تمرين متنوع", val: 97, prefix: "+" },
            { label: "مجموعة عضلية", val: 17, prefix: "+" },
            { label: "مساعد ذكي", val: 24, suffix: "/7" },
            { label: "مجاني", val: 100, suffix: "%" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-[#1a1a1a] border border-[#222] rounded-3xl p-6 text-center flex flex-col items-center justify-center hover:border-[#39ff14]/30 transition-colors"
            >
              <h3 className="text-3xl md:text-4xl font-black text-[#39ff14] mb-2 flex items-center justify-center gap-1" dir="ltr">
                {stat.prefix}
                <Counter end={stat.val} duration={2000} />
                {stat.suffix}
              </h3>
              <p className="text-sm md:text-base font-bold text-white">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURE GRID */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="group bg-[#111] border border-[#222] rounded-3xl p-6 md:p-8 flex flex-col transition-all duration-300 hover:border-[#39ff14] hover:shadow-[0_0_20px_rgba(57,255,20,0.1)] hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center shrink-0 group-hover:bg-[#39ff14]/10 transition-colors">
                    <Icon className="w-7 h-7 text-[#39ff14]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-2 leading-tight">
                    {feat.title}
                  </h3>
                </div>
                
                <p className="text-[#aaaaaa] text-sm md:text-base font-medium leading-relaxed mb-6 flex-grow">
                  {feat.desc}
                </p>
                
                {feat.id && (
                  <button 
                    onClick={() => onNavigate?.(feat.id)}
                    className="flex items-center gap-2 text-[#39ff14] font-bold text-sm w-fit group-hover:gap-3 transition-all"
                  >
                    <span>اذهب للقسم</span>
                    <ArrowLeft className="w-4 h-4" /> {/* ArrowLeft because RTL meaning go right visually */}
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* SECTION 4: TARGET AUDIENCE */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-[#111]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">لمن صُمم DarkFit؟</h2>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {targetAudience.map((audience, idx) => (
              <motion.div 
                key={idx} variants={fadeInUp}
                className="bg-[#1a1a1a] rounded-3xl p-6 border-r-4 border-[#39ff14] border-y border-l border-[#222] flex flex-col hover:-translate-y-2 transition-transform duration-300"
              >
                <span className="text-5xl mb-4">{audience.icon}</span>
                <h3 className="text-xl font-black text-white mb-3">{audience.title}</h3>
                <p className="text-[#aaaaaa] text-sm leading-relaxed">{audience.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">جاهز تبدأ التحوّل؟</h2>
          <p className="text-[#aaaaaa] text-lg mb-10 max-w-2xl mx-auto">
            لا تنتظر الغد. كل يوم يمر بدون خطة هو يوم ضائع. ابدأ الآن مجانًا وشاهد الفرق بنفسك.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate?.("exercises")}
              className="w-full sm:w-auto px-8 py-4 bg-[#39ff14] text-[#0a0d08] font-black rounded-xl hover:brightness-110 transition-all text-lg shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]"
            >
              ابدأ التمرين الآن
            </button>
            <button 
              onClick={() => onNavigate?.("calculator")}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#39ff14]/50 text-white font-black rounded-xl hover:border-[#39ff14] transition-colors text-lg"
            >
              احسب سعراتك
            </button>
          </div>
        </motion.div>
      </section>

      {/* SECTION 6: FOOTER INFO */}
      <footer className="py-8 border-t border-[#222] text-center">
        <div className="space-y-1">
          <p className="text-[#aaaaaa] text-sm font-bold opacity-80">DarkFit v2.0</p>
          <p className="text-[#aaaaaa] text-sm font-bold opacity-80">Mohamed Ibrahim</p>
          <p className="text-[#aaaaaa] text-xs mt-2 opacity-60">صُنع بشغف لكل رياضي عربي يسعى للأفضل 💚</p>
        </div>
      </footer>
    </div>
  );
}
