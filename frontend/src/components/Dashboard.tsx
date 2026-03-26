import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ArrowRight,
  Zap,
  Target,
  User,
  X,
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
import { WorkoutOfTheDay } from "./WorkoutOfTheDay";
import { PRBoard } from "./PRBoard";
import { WeeklyReportCard } from "./WeeklyReportCard";

// Import sub-components
import { 
  DashboardStats, 
  DashboardQuickActions, 
  DashboardBMICard, 
  DashboardFooter,
  ModernSectionCard,
  cn,
  safeTr
} from "./dashboard";
import type { SectionId } from "./dashboard";

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

            {/* Stats Grid - Using DashboardStats component */}
            <DashboardStats
              completion={completion}
              totalCalories={totalCalories}
              totalSessions={totalSessions}
              totalHours={totalHours}
              bmiData={bmiData}
              tr={tr}
            />

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

      {/* QUICK ACTIONS - Using DashboardQuickActions component */}
      <DashboardQuickActions onNavigate={onNavigate} isAr={isAr} />

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

      {/* COMPACT BMI & PROGRESS CARD - Using DashboardBMICard component */}
      <DashboardBMICard 
        bmiData={bmiData} 
        userProfile={userProfile} 
        isAr={isAr} 
        tr={tr} 
      />


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

      {/* PREMIUM FOOTER - Using DashboardFooter component */}
      <DashboardFooter isAr={isAr} />

    </div>
  );
}
