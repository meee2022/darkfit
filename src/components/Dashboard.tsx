import React, { useMemo, useState, useRef, useEffect } from "react";
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
  Phone,
  Bell,
  AlertTriangle,
  Award,
  Info,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { getTimeBasedNotifications, getNotificationSettings } from "./NotificationManager";
import { FastingWidget } from "./FastingWidget";
import { StrengthProgressionChart } from "./StrengthProgressionChart";
import { XPBar } from "./XPBar";
import { PrayerTimesWidget } from "./PrayerTimesWidget";
import { HotClimateWidget } from "./HotClimateWidget";
import { WorkoutOfTheDay } from "./WorkoutOfTheDay";
import { PRBoard } from "./PRBoard";
import { WeeklyReportCard } from "./WeeklyReportCard";

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

/** ===== Premium Stat Card ===== */

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
  // Resolve per-card accent color from iconColor class
  const accentHex = iconColor.includes("emerald")
    ? "#10b981"
    : iconColor.includes("orange")
    ? "#f97316"
    : iconColor.includes("sky")
    ? "#38bdf8"
    : iconColor.includes("indigo")
    ? "#818cf8"
    : iconColor.includes("rose")
    ? "#fb7185"
    : "#59f20d";

  // SVG ring config
  const RING_SIZE = 84;
  const R = 34;
  const STROKE = 5;
  const circ = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, progress));
  const dashOffset = circ - (clamped / 100) * circ;

  const showRing = variant === "radial" || variant === "progress";

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.07] to-black/50 backdrop-blur-xl flex flex-col items-center justify-center gap-2 p-4 sm:p-5 min-h-[150px] text-center cursor-default select-none transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
      style={{ boxShadow: `0 2px 40px -12px ${accentHex}55` }}
    >
      {/* Ambient glow blob */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
        style={{ background: accentHex }}
      />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Ring or icon square */}
      {showRing ? (
        <div
          className="relative flex items-center justify-center z-10"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke={accentHex}
              strokeWidth={STROKE}
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)",
                filter: `drop-shadow(0 0 5px ${accentHex})`,
              }}
            />
          </svg>
          {/* Icon inside ring */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{ color: accentHex }}
          >
            <div className="opacity-90 group-hover:opacity-100">{icon}</div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-transform duration-500 group-hover:scale-110 z-10",
            iconColor
          )}
        >
          <div className="scale-125">{icon}</div>
        </div>
      )}

      {/* Value + Unit */}
      <div className="flex items-baseline justify-center gap-1 z-10 leading-none mt-1">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: accentHex }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-[10px] sm:text-[11px] text-white/40 font-semibold uppercase tracking-widest z-10 leading-tight px-1">
        {label}
      </p>

      {/* Thin progress bar below label for "progress" variant */}
      {variant === "progress" && (
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden z-10">
          <div
            className="h-full rounded-full transition-all duration-[1400ms] ease-out"
            style={{
              width: `${clamped}%`,
              background: accentHex,
              boxShadow: `0 0 8px ${accentHex}`,
            }}
          />
        </div>
      )}

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-700 origin-center pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${accentHex}, transparent)` }}
      />
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
        <div className="flex items-center justify-start gap-2 text-[#59f20d] text-sm font-bold pt-1 flex-row-reverse w-fit ml-auto">
          <span>{exploreLabel}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:rtl:-translate-x-1 transition-transform" />
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const streaks = useQuery(api.userProgress.getStreaks);
  const dashboardStats = useQuery(api.userProgress.getDashboardStats);
  const weightHistory = useQuery(api.userProgress.getWeightHistory);

  // Tick every minute to refresh time-based notifications
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // === Auto-generated notifications ===
  const notifications = useMemo(() => {
    const items: { id: string; type: "warning" | "praise" | "tip" | "info" | "meal" | "water"; icon: React.ReactNode; title: string; message: string; time: string; action?: string }[] = [];

    const settings = getNotificationSettings();
    const currentStreak = streaks?.currentStreak ?? 0;
    const daysSinceLastWorkout = streaks?.daysSinceLastWorkout ?? 0;
    const comp = dashboardStats?.completion ?? 0;
    const sessions = dashboardStats?.totalSessions ?? 0;

    // 1) Inactivity warning (only if workout notifications are enabled)
    if (settings.workout && daysSinceLastWorkout >= 3) {
      items.push({
        id: "inactivity",
        type: "warning",
        icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        title: isAr ? "⚠️ تنبيه عدم التمرين" : "⚠️ Inactivity Alert",
        message: isAr
          ? `لم تتمرن منذ ${daysSinceLastWorkout} أيام! جسمك يحتاج للحركة، عد للتمرين اليوم.`
          : `You haven't trained in ${daysSinceLastWorkout} days! Your body needs movement.`,
        time: isAr ? "الآن" : "Now",
        action: "exercises",
      });
    } else if (settings.workout && daysSinceLastWorkout >= 2) {
      items.push({
        id: "reminder",
        type: "info",
        icon: <Info className="w-5 h-5 text-blue-400" />,
        title: isAr ? "💪 تذكير بالتمرين" : "💪 Workout Reminder",
        message: isAr
          ? `مر يومان بدون تمرين. لا تفقد زخمك، تمرن اليوم!`
          : `2 days without training. Don't lose momentum!`,
        time: isAr ? "اليوم" : "Today",
        action: "exercises",
      });
    }

    // 2) Streak praise
    if (currentStreak >= 3) {
      items.push({
        id: "streak",
        type: "praise",
        icon: <Award className="w-5 h-5 text-[#59f20d]" />,
        title: isAr ? "🔥 سلسلة رائعة!" : "🔥 Great Streak!",
        message: isAr
          ? `أنت في سلسلة ${currentStreak} أيام متتالية! استمر ولا تتوقف.`
          : `You're on a ${currentStreak}-day streak! Keep it up!`,
        time: isAr ? "مستمر" : "Ongoing",
      });
    }

    // 3) Low weekly completion
    if (comp > 0 && comp < 50) {
      items.push({
        id: "low_completion",
        type: "warning",
        icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
        title: isAr ? "📊 إنجاز الأسبوع منخفض" : "📊 Low Weekly Completion",
        message: isAr
          ? `إنجازك الأسبوعي ${comp}% فقط. زِد من معدل تمارينك لتحقيق هدفك.`
          : `Your weekly completion is only ${comp}%. Increase your training rate.`,
        time: isAr ? "هذا الأسبوع" : "This week",
        action: "workoutGenerator",
      });
    }

    // 4) Welcome / Smart Coach tip
    if (sessions === 0) {
      items.push({
        id: "welcome",
        type: "tip",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        title: isAr ? "✨ مرحباً بك في DARK FIT!" : "✨ Welcome to DARK FIT!",
        message: isAr
          ? "ابدأ رحلتك الآن! أنشئ أول تمرين لك واستكشف المدرب الذكي."
          : "Start your journey! Create your first workout and explore the Smart Coach.",
        time: isAr ? "جديد" : "New",
        action: "workoutGenerator",
      });
    } else {
      items.push({
        id: "coach_tip",
        type: "tip",
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        title: isAr ? "🧠 نصيحة المدرب الذكي" : "🧠 Smart Coach Tip",
        message: isAr
          ? "سجّل فحصك اليومي في المدرب الذكي لتحصل على تحليل دقيق لاستشفائك."
          : "Log your daily check-in for accurate recovery analysis.",
        time: isAr ? "يومي" : "Daily",
        action: "smartCoach",
      });
    }

    // 5) Time-based meal & water notifications
    const timeNotifs = getTimeBasedNotifications(isAr);
    for (const tn of timeNotifs) {
      items.push({
        id: tn.id,
        type: tn.type,
        icon: <span className="text-lg">{tn.icon}</span>,
        title: tn.title,
        message: tn.message,
        time: tn.time,
        action: "nutrition",
      });
    }

    return items.filter(n => !dismissedIds.includes(n.id));
  }, [streaks, dashboardStats, isAr, dismissedIds, clockTick]);

  const unreadCount = notifications.length;

  // Sections Meta Data
  const ALL_SECTIONS = useMemo(() => [
    { 
      id: "smartCoach", 
      title: tr("smartCoach", "المدرب الذكي"), 
      desc: isAr ? "تحليل حيوي وتوجيهات تعتمد على الذكاء الاصطناعي لحالتك" : "AI-driven telemetry and personalized coaching insights",
      img: "/img/darkfit_smart_coach.png"
    },
    { 
      id: "exercises", 
      title: tr("exercises", "التمارين"), 
      desc: isAr ? "مكتبة شاملة من التمارين المتنوعة لجميع المستويات" : "Comprehensive library of exercises for all levels",
      img: "/img/darkfit_exercises_user.png"
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
      img: "/img/darkfit_nutrition_user.png"
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
      title: tr("calorie_calculator", "حاسبة السعرات"), 
      desc: isAr ? "احسب احتياجك اليومي بدقة علمية" : "Calculate your daily calorie needs accurately",
      img: "/img/darkfit_ai_user.png"
    },
    { 
      id: "plans", 
      title: tr("plans", "خططي"), 
      desc: isAr ? "إدارة جداول تمارينك وخططك التدريبية المخصصة" : "Manage your custom workout schedules and plans",
      img: "/img/my plan.png"
    },
    { 
      id: "fitbot", 
      title: tr("fitbot", "المساعد الذكي"), 
      desc: isAr ? "اطرح أسئلتك على مدربك الذكي واحصل على نصائح فورية" : "Ask your AI fitness coach for instant advice",
      img: "/ai_assistant_banner_darkfit.png"
    },
    { 
      id: "social", 
      title: isAr ? "المجتمع والتحديات" : "Social & Challenges", 
      desc: isAr ? "تنافس مع الآخرين وأنجز التحديات الأسبوعية وتصدر لوحة المتصدرين" : "Compete, complete challenges, and lead the leaderboard",
      img: "/img/darkfit_exercises_1773164750598.png"
    },
    { 
      id: "workoutHistory", 
      title: isAr ? "سجل التمارين" : "Workout History", 
      desc: isAr ? "استعرض كل تمارينك السابقة مع تفاصيل الأوزان والتكرارات والأرقام القياسية" : "Browse all past workouts with weights, reps, and PR history",
      img: "/img/darkfit_generator_1773165550431.png"
    },
    { 
      id: "messages", 
      title: isAr ? "الدردشة مع المدرب" : "Coach Chat", 
      desc: isAr ? "تواصل مباشرة مع مدربك للحصول على استشارات ومتابعة فورية" : "Direct line to your coach for instant guidance and support",
      img: "/img/active_clients.png" // Fallback image
    },
  ], [isAr, language]);

  const totalSessions = dashboardStats?.totalSessions || 0;
  const totalCalories = dashboardStats?.totalCalories || 0;
  const totalHours = dashboardStats?.totalHours || 0;
  const completion = dashboardStats?.completion || 0;

  const bmiData = useMemo(() => {
    const latestWeight = weightHistory && weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight
      : null;
    const w = latestWeight || userProfile?.currentWeight || userProfile?.weight;
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
  }, [userProfile, weightHistory]);

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
      <FastingWidget />

      {/* XP / GAMIFICATION BAR */}
      <XPBar />

      {/* ENHANCED HERO SECTION */}
      {/* ENHANCED HERO SECTION - RTL MOCKUP MATCH */}
      <div className="relative overflow-hidden">
        
        <div className="relative z-10 px-2 sm:px-6">
          <div className="flex flex-col gap-6 w-full">
            
            {/* Header Row: Welcome Text & Active Status + Notification Bell */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">

              {/* Notification Bell - Top Corner */}
              <div className="absolute top-0 left-0 z-30" ref={notifRef} dir="ltr">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-11 h-11 rounded-full bg-zinc-900/80 border border-white/10 hover:border-[#59f20d]/50 flex items-center justify-center transition-all hover:bg-zinc-800"
                >
                  <Bell className="w-5 h-5 text-white/70" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute top-14 left-0 w-[340px] sm:w-[380px] max-h-[70vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50">
                    {/* Dropdown Header */}
                    <div className="sticky top-0 z-10 bg-[#111] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#59f20d]" />
                        {isAr ? "الإشعارات" : "Notifications"}
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setDismissedIds(notifications.map(n => n.id))}
                          className="text-[10px] font-bold text-zinc-500 hover:text-[#59f20d] transition-colors"
                        >
                          {isAr ? "مسح الكل" : "Clear All"}
                        </button>
                      )}
                    </div>

                    {/* Notification Items */}
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle className="w-10 h-10 text-[#59f20d]/30 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500 font-medium">
                          {isAr ? "لا توجد إشعارات جديدة 🎉" : "No new notifications 🎉"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3 ${
                              notif.type === "warning" ? "border-l-2 border-l-rose-500" :
                              notif.type === "praise" ? "border-l-2 border-l-[#59f20d]" :
                              notif.type === "tip" ? "border-l-2 border-l-purple-500" :
                              notif.type === "meal" ? "border-l-2 border-l-orange-400" :
                              notif.type === "water" ? "border-l-2 border-l-cyan-400" :
                              "border-l-2 border-l-blue-500"
                            }`}
                            onClick={() => {
                              if (notif.action) onNavigate?.(notif.action as any);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="mt-0.5 shrink-0">{notif.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white leading-tight">{notif.title}</p>
                              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-zinc-600 font-bold mt-1.5 uppercase tracking-wider">{notif.time}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedIds(prev => [...prev, notif.id]);
                              }}
                              className="shrink-0 mt-0.5 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"
                            >
                              <X className="w-3 h-3 text-zinc-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
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

            {/* Stats Grid - Premium Ring Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-2 w-full">
              <ModernStatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label={tr("completion", "إنجاز الأسبوع")}
                value={`${completion}%`}
                iconColor="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                variant="progress"
                progress={completion}
              />
              <ModernStatCard
                icon={<Flame className="w-5 h-5" />}
                label={tr("burned_calories", "سعرة محروقة")}
                value={totalCalories > 0 ? totalCalories.toLocaleString() : 0}
                unit="kcal"
                iconColor="bg-orange-500/20 text-orange-400 border border-orange-500/30"
                variant="radial"
                progress={totalCalories > 0 ? Math.min(90, (totalCalories / 3000) * 100) : 0}
              />
              <ModernStatCard
                icon={<Timer className="w-5 h-5" />}
                label={tr("workout_days", "أيام تمرين")}
                value={totalSessions}
                iconColor="bg-sky-500/20 text-sky-400 border border-sky-500/30"
                variant="radial"
                progress={totalSessions > 0 ? Math.min(90, (totalSessions / 30) * 100) : 0}
              />
              <ModernStatCard
                icon={<Dumbbell className="w-5 h-5" />}
                label={tr("total_hours", "إجمالي الساعات")}
                value={totalHours}
                unit="h"
                iconColor="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                variant="radial"
                progress={totalHours > 0 ? Math.min(90, (totalHours / 100) * 100) : 0}
              />
              {bmiData && (
                <ModernStatCard
                  icon={<HeartPulse className="w-5 h-5" />}
                  label={tr("bmi_title", "مؤشر كتلة الجسم")}
                  value={bmiData.bmi}
                  iconColor="bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  variant="radial"
                  progress={Math.min(90, Math.max(10, ((parseFloat(bmiData.bmi) - 15) / 25) * 100))}
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

      {/* QUICK ACTIONS */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#59f20d]" />
          {isAr ? "إجراءات سريعة" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "exercises", icon: "🏋️", label: isAr ? "سجّل تمرين" : "Log Workout", color: "#59f20d" },
            { id: "nutrition", icon: "🥗", label: isAr ? "سجّل وجبة" : "Log Meal", color: "#fbbf24" },
            { id: "health", icon: "💧", label: isAr ? "تتبع الصحة" : "Health Tracker", color: "#38bdf8" },
            { id: "smartCoach", icon: "🤖", label: isAr ? "المدرب الذكي" : "Smart Coach", color: "#a78bfa" },
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate?.(action.id as SectionId)}
              className="group relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${action.color}10, transparent 70%)` }} />
              <span className="text-2xl relative z-10">{action.icon}</span>
              <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors relative z-10">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI WEEKLY REPORT */}
      <div className="mb-6">
        <WeeklyReportCard />
      </div>

      {/* WOD + PR BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WorkoutOfTheDay onNavigate={onNavigate} />
        <PRBoard />
      </div>

      {/* STRENGTH PROGRESSION CHART */}
      <div className="mb-6">
        <StrengthProgressionChart />
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
                exploreLabel={tr("enter_section", "دخول القسم")}
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

      {/* PREMIUM FOOTER */}
      <div className="mt-16 pb-12 flex flex-col items-center justify-center space-y-3 opacity-80" dir={isAr ? "rtl" : "ltr"}>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-bold text-white/70 tracking-widest text-center" dir="ltr">
            &copy; {new Date().getFullYear()} DARK FIT. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 tracking-[0.1em]">
            <span>{isAr ? "تطوير وإدارة:" : "Directed by"}</span>
            <span className="text-[#59f20d] font-black">{isAr ? "المهندس محمد" : "Eng. Mohamed"}</span>
          </div>
        </div>
        
        <a 
          href="https://wa.me/97430296555" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#59f20d]/50 hover:bg-[#59f20d]/10 transition-colors group"
        >
          <Phone className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#59f20d] transition-colors" />
          <span className="text-xs font-black text-white/80 group-hover:text-white transition-colors tracking-widest" dir="ltr">
            +974 30296555
          </span>
        </a>
      </div>

    </div>
  );
}
