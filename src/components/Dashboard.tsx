import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dumbbell,
  Salad,
  HeartPulse,
  Calculator,
  TrendingUp,
  Flame,
  Timer,
  Users,
  Pill,
  Bot,
  ArrowRight,
  Zap,
  Target,
  Home,
  ClipboardList,
  User,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

type SectionId =
  | "dashboard"
  | "exercises"
  | "nutrition"
  | "supplements"
  | "calculator"
  | "health"
  | "admin"
  | "coaches"
  | "fitbot"
  | "profile"
  | "account"
  | "plans"
  | "coachPlans"
  | "workoutGenerator";

/** helpers */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeTr(t: any, key: string, fallback: string) {
  try {
    const v = typeof t === "function" ? t(key as any) : "";
    if (!v || v === key) return fallback;
    return v;
  } catch {
    return fallback;
  }
}

/** ===== Modern Stat Card with Gradient & Progress ===== */

function ModernStatCard({
  icon,
  label,
  value,
  iconColor,
  variant = "default",
  progress = 0,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor: string;
  variant?: "default" | "radial" | "progress";
  progress?: number;
  unit?: string;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  // Radial progress constants
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-[#59f20d]/40 transition-all duration-500 p-4 sm:p-5 flex flex-col justify-between items-start text-start min-h-[130px] shadow-2xl backdrop-blur-md hover:shadow-[#59f20d]/10 hover:-translate-y-1">
      {/* Subtle background glow that follows hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#59f20d]/5 rounded-full blur-3xl group-hover:bg-[#59f20d]/15 transition-all duration-700" />
      
      {/* Upper row: Icon (and Radial Progress) */}
      <div className="w-full flex justify-between items-center z-10">
        {variant !== "radial" ? (
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 shadow-xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500",
              iconColor
            )}
          >
            {icon}
          </div>
        ) : (
          <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {/* Radial Progress Ring */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-white/5 fill-none"
                strokeWidth="3.5"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-[#59f20d] fill-none"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                style={{ 
                  strokeDashoffset: offset,
                  transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" 
                }}
                strokeLinecap="round"
              />
            </svg>
            {/* Icon inside the ring */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full p-2.5",
              iconColor.split(" ")[0] // Take the background part for the inner icon contrast if needed, or just keep it simple
            )}>
              <div className="scale-[0.85] opacity-80 group-hover:opacity-100 transition-opacity">
                {icon}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Value & Label */}
      <div className="w-full flex flex-col items-start mt-4 z-10">
        <div className="flex items-baseline gap-1.5 overflow-hidden w-full">
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none group-hover:text-neon-400 transition-colors duration-300">
            {value}
          </p>
          {unit && (
            <span className="text-xs font-black text-[#59f20d] bg-[#59f20d]/10 px-1.5 py-0.5 rounded-md italic uppercase tracking-tighter">
              {unit}
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] text-white/40 font-black mt-2.5 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {label}
        </p>
      </div>
      
      {/* Progress variation: Bottom Bar */}
      {variant === "progress" && (
        <div className="w-full mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden z-10">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-[#59f20d] to-emerald-400 transition-all duration-1500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Premium Glass reflection */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#59f20d] to-transparent opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-700 origin-center" />
    </div>
  );
}

/** ===== Modern Section Card with Image ===== */

function ModernSectionCard({
  title,
  description,
  image,
  exploreLabel,
  onClick,
}: {
  title: string;
  description: string;
  image: string;
  exploreLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1c1c1c] border border-transparent hover:border-[#59f20d] transition-all duration-300 hover:scale-[1.02] text-right"
    >
      {/* Background Image Area */}
      <div className="relative h-64 w-full overflow-hidden bg-[#111]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-[50%_30%] group-hover:scale-110 transition-transform duration-700"
        />
        {/* Dark gradient from bottom to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
        
        {/* Title placed inside the image overlay, bottom right */}
        <h3 className="absolute bottom-4 right-4 text-2xl font-black text-[#59f20d] drop-shadow-lg">
          {title}
        </h3>
      </div>

      {/* Thin line separating image and content */}
      <div className="h-[1px] w-full bg-white/10" />

      {/* Content Area */}
      <div className="relative p-4 space-y-3 bg-[#1c1c1c]">
        <p className="text-sm text-white/50 leading-relaxed max-w-full font-medium">
          {description}
        </p>

        {/* Arrow and Text */}
        <div className="flex items-center justify-end gap-2 text-[#59f20d] text-sm font-bold pt-1">
          <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
          <span>{exploreLabel}</span>
        </div>
      </div>
    </button>
  );
}

/** ===== Info Card ===== */

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-[#1c1c1c] border border-white/[0.08] hover:border-[#59f20d] transition-all duration-300 p-6 text-right">
      <h3 className="mb-4 text-sm font-bold text-white/70">{title}</h3>
      {children}
    </div>
  );
}

/** ===== Main Component ===== */

export function Dashboard({
  onNavigate,
}: {
  onNavigate?: (section: SectionId) => void;
}) {
  const { t, language } = useLanguage();
  const tr = (key: string, fb: string) => safeTr(t, key, fb);
  const isAr = language === "ar";

  const [showAllSectionsModal, setShowAllSectionsModal] = React.useState(false);

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const streaks = useQuery(api.userProgress.getStreaks);
  const dashboardStats = useQuery(api.userProgress.getDashboardStats);

  // Sections Meta Data
  const ALL_SECTIONS = useMemo(() => [
    { 
      id: "exercises", 
      title: tr("exercises", "التمارين"), 
      desc: isAr ? "مكتبة شاملة من التمارين المتنوعة لجميع المستويات" : "Comprehensive library of exercises for all levels",
      img: "/img/darkfit_exercises_1773164750598.png"
    },
    { 
      id: "workoutGenerator", 
      title: tr("workout_generator", "مولد التمارين"), 
      desc: isAr ? "أنشئ جدول تمارين مخصص حسب هدفك وعضلاتك" : "Generate custom workout plan based on your goal",
      img: "/img/darkfit_generator_1773165550431.png"
    },
    { 
      id: "nutrition", 
      title: tr("nutrition", "التغذية"), 
      desc: isAr ? "خطط غذائية متكاملة ووصفات صحية لدعم أهدافك" : "Complete nutrition plans and healthy recipes",
      img: "/img/darkfit_nutrition_1773165016257.png"
    },
    { 
      id: "supplements", 
      title: tr("supplements", "المكملات"), 
      desc: isAr ? "دليل شامل للمكملات الغذائية وفوائدها" : "Comprehensive guide to nutritional supplements",
      img: "/img/darkfit_supplements_1773165357326.png"
    },
    { 
      id: "coaches", 
      title: tr("coaches", "المدربون"), 
      desc: isAr ? "تواصل مع أفضل المدربين المتخصصين لمتابعة تطورك" : "Connect with professional coaches for guidance",
      img: "/img/darkfit_exercises_1773164750598.png" 
    },
    { 
      id: "health", 
      title: tr("health", "الصحة"), 
      desc: isAr ? "نصائح صحية متخصصة لجميع الفئات العمرية" : "Specialized health tips for all age groups",
      img: "/img/darkfit_health_1773165433203.png"
    },
    { 
      id: "calculator", 
      title: tr("calculator", "الحاسبات"), 
      desc: isAr ? "أدوات دقيقة لحساب السعرات والبروتين والوزن المثالي" : "Precise tools for calculating macros and BMI",
      img: "/img/darkfit_calculator_1773165509531.png"
    },
    { 
      id: "plans", 
      title: tr("plans", "خططي"), 
      desc: isAr ? "إدارة جداول تمارينك وخططك التدريبية المخصصة" : "Manage your custom workout schedules and plans",
      img: "/img/darkfit_generator_1773165550431.png"
    },
    { 
      id: "fitbot", 
      title: tr("fitbot", "المساعد الذكي"), 
      desc: isAr ? "اطرح أسئلتك على مدربك الذكي واحصل على نصائح فورية" : "Ask your AI fitness coach for instant advice",
      img: "/img/darkfit_health_1773165433203.png"
    },
    { 
      id: "profile", 
      title: tr("profile", "الملف الشخصي"), 
      desc: isAr ? "تعديل بياناتك ومتابعة إحصائياتك الشخصية وتقدمك" : "Update your profile and track your stats",
      img: "/img/darkfit_nutrition_1773165016257.png"
    }
  ], [isAr, language]);

  const totalSessions = dashboardStats?.totalSessions || 0;
  const totalCalories = dashboardStats?.totalCalories || 0;
  const totalHours = dashboardStats?.totalHours || 0;
  const completion = dashboardStats?.completion || 0;

  const bmiData = useMemo(() => {
    const w = userProfile?.currentWeight;
    const h = userProfile?.height;
    if (!w || !h || h === 0) return null;
    const bmi = (w / (h / 100) ** 2).toFixed(1);
    const numBmi = parseFloat(bmi);
    const category =
      numBmi < 18.5
        ? tr("bmi_underweight", "نحيف")
        : numBmi < 25
          ? tr("bmi_normal", "طبيعي")
          : numBmi < 30
            ? tr("bmi_overweight", "زائد")
            : tr("bmi_obese", "سمنة");
    return { bmi, category };
  }, [userProfile]);

  const fitnessLevelLabel = useMemo(() => {
    const lvl = userProfile?.fitnessLevel;
    if (lvl === "beginner") return tr("fitness_beginner", "مبتدئ");
    if (lvl === "intermediate") return tr("fitness_intermediate", "متوسط");
    if (lvl === "advanced") return tr("fitness_advanced", "متقدم");
    return tr("fitness_unknown", "غير محدد");
  }, [userProfile?.fitnessLevel, language]);

  const name = userProfile?.name || tr("you", "أنت");
  const subtitle = tr(
    "dashboard_subtitle",
    "تابع تقدمك واختصر الطريق بخطة واضحة."
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6 min-h-screen bg-[#0c0c0c] px-3 sm:px-4 lg:px-0 py-4 sm:py-6">
      {/* ENHANCED HERO SECTION */}
      {/* ENHANCED HERO SECTION - RTL MOCKUP MATCH */}
      <div className="relative overflow-hidden">
        
        <div className="relative z-10 px-2 sm:px-6">
          <div className="flex flex-col gap-6 w-full">
            
            {/* Header Row: Welcome Text & Active Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              
              <div className="flex flex-col items-start w-full text-start">
                
                {/* Active Badge (Top Right) */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse shadow-[0_0_8px_#59f20d]" />
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    {tr("dashboard_active", "نشط الآن")}
                  </span>
                </div>

                {/* Main Welcome */}
                <h1 className="text-3xl sm:text-4xl font-black leading-tight drop-shadow-md flex items-center justify-start gap-4 flex-wrap">
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => onNavigate?.("profile")}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#59f20d] overflow-hidden bg-zinc-900 shadow-[0_0_15px_rgba(89,242,13,0.3)] group-hover:shadow-[0_0_25px_rgba(89,242,13,0.5)] transition-all duration-300">
                      {userProfile?.profileImage ? (
                        <img
                          src={userProfile.profileImage}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-white/80">{tr("dashboard_welcome", "مرحباً")}، </span>
                      <span className="text-[#59f20d]">{name}</span>
                      <span className="inline-block animate-wave origin-bottom-right">👋</span>
                    </div>
                  </div>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-white/40 max-w-2xl leading-relaxed mt-2">
                  {isAr ? "تطبيقك الشامل للياقة البدنية — تمارين، تغذية، صحة" : subtitle}
                </p>

                {/* Fitness Level Badge */}
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#59f20d]/30 bg-[#59f20d]/10 px-3 py-1.5 w-fit mt-3">
                  <Zap className="w-4 h-4 text-[#59f20d]" />
                  <span className="text-xs font-medium text-white/60">
                    {tr("fitness_level", "مستوى اللياقة")}:
                  </span>
                  <span className="text-xs font-bold text-white">
                    {fitnessLevelLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid - High Fidelity Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-2 w-full">
              <ModernStatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label={tr("completion", "نسبة الإنجاز")}
                value={`${completion}%`}
                iconColor="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                variant="progress"
                progress={completion}
              />
              <ModernStatCard
                icon={<Flame className="w-4 h-4" />}
                label={tr("burned_calories", "سعرة محروقة")}
                value={totalCalories}
                unit="kcal"
                iconColor="bg-orange-500/20 text-orange-400 border border-orange-500/30"
                variant="radial"
                progress={totalCalories > 0 ? 75 : 0} 
              />
              <ModernStatCard
                icon={<Timer className="w-4 h-4" />}
                label={tr("workout_days", "أيام تمرين")}
                value={totalSessions}
                iconColor="bg-sky-500/20 text-sky-400 border border-sky-500/30"
              />
              <ModernStatCard
                icon={<Dumbbell className="w-4 h-4" />}
                label={tr("total_hours", "إجمالي الساعات")}
                value={totalHours}
                unit="h"
                iconColor="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              />
              {bmiData && (
                <ModernStatCard
                  icon={<HeartPulse className="w-4 h-4" />}
                  label={tr("bmi_title", "مؤشر كتلة الجسم")}
                  value={bmiData.bmi}
                  iconColor="bg-rose-500/20 text-rose-400 border border-rose-500/30"
                />
              )}
            </div>

            {/* CTA Button Align Right */}
            <div className="flex w-full justify-start pt-2 mb-2">
              <button
                onClick={() => onNavigate?.("exercises")}
                className="group flex items-center justify-center gap-3 px-8 py-3.5 bg-[#59f20d] text-black font-black rounded-xl hover:brightness-110 shadow-[0_4px_24px_-10px_#59f20d] hover:shadow-[0_4px_32px_-5px_#59f20d] transition-all"
              >
                <span>{tr("start_workout", "ابدأ التمرين الآن")}</span>
                <Target className="w-5 h-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300 rtl:rotate-180 group-hover:rtl:rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT BMI & PROGRESS CARD - PREMIUM RE-DESIGN */}
      <div className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 relative shadow-2xl" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Top bar: BMI title + value */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">{tr("bmi_title", "مؤشر كتلة الجسم")}</span>
            <span className="text-xs font-bold text-[#59f20d]">{bmiData?.category || ""}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{bmiData?.bmi || "—"}</span>
          </div>
        </div>

        {/* BMI Progress Bar - Enhanced Graphic */}
        <div className="relative h-2 w-full flex bg-zinc-900/50 p-[1px]">
          <div className="h-full bg-sky-500/50 rounded-l-full" style={{ width: "25%" }} />
          <div className="h-full bg-[#59f20d]/80" style={{ width: "50%" }} />
          <div className="h-full bg-rose-500/50 rounded-r-full" style={{ width: "25%" }} />
          {bmiData && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white shadow-[0_0_12px_rgba(89,242,13,0.8)] z-10 rounded-full border-2 border-zinc-950 transition-all duration-1000 ease-out"
              style={{
                left: isAr 
                  ? `${100 - Math.min(Math.max((parseFloat(bmiData.bmi) - 15) / 25 * 100, 2), 98)}%`
                  : `${Math.min(Math.max((parseFloat(bmiData.bmi) - 15) / 25 * 100, 2), 98)}%`,
                transform: "translate(-50%, -50%)"
              }}
            />
          )}
        </div>

        {/* Info Grid: Height, Weight, Goal */}
        <div className="grid grid-cols-3 divide-x divide-white/5 rtl:divide-x-reverse bg-white/1">
          {/* Height */}
          <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isAr ? "الطول" : "Height"}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-sky-400 italic">{userProfile?.height || "—"}</span>
              <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "سم" : "cm"}</span>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isAr ? "الوزن" : "Weight"}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-[#59f20d] italic">{userProfile?.currentWeight || "—"}</span>
              <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "كجم" : "kg"}</span>
            </div>
          </div>

          {/* Target */}
          <div className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/2 transition-colors">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isAr ? "الهدف" : "Goal"}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-amber-400 italic">{userProfile?.targetWeight || "—"}</span>
              <span className="text-[10px] font-bold text-white/30 lowercase">{isAr ? "كجم" : "kg"}</span>
            </div>
          </div>
        </div>

        {/* Bottom subtle accent */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#59f20d]/10 to-transparent" />
      </div>


      {/* MAIN SECTIONS - Image-Based Cards */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {tr("main_sections", "استكشف الأقسام")}
          </h2>
        </div>

        <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {ALL_SECTIONS.slice(0, showAllSectionsModal ? ALL_SECTIONS.length : 6).map((section, idx) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <ModernSectionCard
                title={section.title}
                description={section.desc}
                image={section.img}
                exploreLabel={tr("explore_now", "استكشف الآن")}
                onClick={() => onNavigate?.(section.id as SectionId)}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Toggle All Sections Button */}
        {ALL_SECTIONS.length > 6 && (
          <div className="flex justify-center mt-10 pb-8">
            <button
              onClick={() => setShowAllSectionsModal((prev) => !prev)}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 hover:border-[#59f20d] hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
            >
              <span>{showAllSectionsModal ? tr("hide_sections", "إخفاء الأقسام") : tr("view_all_sections", "عرض جميع الأقسام")}</span>
              <ArrowRight className={cn("w-5 h-5 transition-transform", showAllSectionsModal ? "-rotate-90 group-hover:-translate-y-1" : "rotate-90 group-hover:translate-y-1")} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
