import React, { useMemo } from "react";
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
  | "fitbot";

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

/** ===== Modern Stat Card with Gradient ===== */

function ModernStatCard({
  icon,
  label,
  value,
  gradient,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-[#1a2318]/60 backdrop-blur-xl border border-[#2a3528] p-5 hover:border-[#59f20d]/50 transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity",
          gradient
        )}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            iconColor
          )}
        >
          {icon}
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** ===== Modern Section Card with Image ===== */

function ModernSectionCard({
  title,
  description,
  image,
  gradient,
  onClick,
}: {
  title: string;
  description: string;
  image: string;
  gradient: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-[#1a2318] border border-[#2a3528] hover:border-[#59f20d]/50 transition-all duration-300 hover:scale-[1.02] text-right"
    >
      {/* Background Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div
          className={cn(
            "absolute inset-0 mix-blend-multiply opacity-60",
            gradient
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d08] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-5 space-y-2">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>

        {/* Arrow */}
        <div className="flex items-center gap-2 text-[#59f20d] text-sm font-bold pt-2">
          <span>استكشف الآن</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
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
    <div className="overflow-hidden rounded-3xl bg-[#1a2318]/60 backdrop-blur-xl border border-[#2a3528] p-6">
      <h3 className="mb-4 text-base font-bold text-white">{title}</h3>
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

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const streaks = useQuery(api.userProgress.getStreaks);

  // Mock data for demo - replace with real data when workout API is ready
  const totalSessions = 12;
  const totalCalories = 3450;
  const totalHours = 8;
  const completion = 75;

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
    <div className="space-y-6 min-h-screen px-3 sm:px-4 lg:px-0 py-4 sm:py-6">
      {/* ENHANCED HERO SECTION */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#2a3528]">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0d08] via-[#1a2318] to-[#0a0d08]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(89,242,13,0.15),transparent_70%)]" />

        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(89,242,13,0.3) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-10">
          {/* Welcome Section */}
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {tr("dashboard_active", "نشط الآن")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black leading-tight">
                <span className="text-white">مرحبًا، </span>
                <span className="text-[#59f20d]">{name}</span>
                <span className="inline-block ml-2">💪</span>
              </h1>

              {streaks && streaks.currentStreak > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-2xl bg-orange-500/20 border border-orange-500/30 w-fit shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <Flame size={20} className="text-orange-500 animate-pulse" />
                  <span className="text-orange-400 font-bold">
                    {streaks.currentStreak} {tr("day_streak", "أيام متتالية")}
                  </span>
                </div>
              )}

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              {/* Fitness Level Badge */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#59f20d]/30 bg-[#59f20d]/10 px-4 py-2.5 backdrop-blur-sm w-fit">
                <Zap className="w-4 h-4 text-[#59f20d]" />
                <span className="text-sm font-semibold text-white">
                  {tr("fitness_level", "مستوى اللياقة")}:
                </span>
                <span className="text-sm font-black text-[#59f20d]">
                  {fitnessLevelLabel}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <ModernStatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label={tr("completion", "نسبة الإنجاز")}
                value={`${completion}%`}
                gradient="bg-gradient-to-br from-[#59f20d] to-emerald-400"
                iconColor="bg-[#59f20d]/20 text-[#59f20d]"
              />
              <ModernStatCard
                icon={<Flame className="w-6 h-6" />}
                label={tr("burned_calories", "سعرات محروقة")}
                value={`${totalCalories}`}
                gradient="bg-gradient-to-br from-orange-500 to-red-500"
                iconColor="bg-orange-500/20 text-orange-400"
              />
              <ModernStatCard
                icon={<Timer className="w-6 h-6" />}
                label={tr("workout_days", "أيام تمرين")}
                value={`${totalSessions}`}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                iconColor="bg-blue-500/20 text-blue-400"
              />
              <ModernStatCard
                icon={<Dumbbell className="w-6 h-6" />}
                label={tr("total_hours", "إجمالي الساعات")}
                value={`${totalHours}h`}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                iconColor="bg-purple-500/20 text-purple-400"
              />
              {bmiData && (
                <ModernStatCard
                  icon={<HeartPulse className="w-6 h-6" />}
                  label={tr("bmi_title", "مؤشر الكتلة")}
                  value={bmiData.bmi}
                  gradient="bg-gradient-to-br from-rose-500 to-pink-500"
                  iconColor="bg-rose-500/20 text-rose-400"
                />
              )}
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => onNavigate?.("exercises")}
                className="group flex items-center gap-3 px-6 py-4 bg-[#59f20d] text-black font-bold rounded-2xl hover:bg-[#4ed10a] transition-all"
              >
                <span>ابدأ التمرين الآن</span>
                <Target className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SECTIONS - Image-Based Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {tr("main_sections", "استكشف الأقسام")}
          </h2>
          <div className="w-12 h-1 bg-[#59f20d] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <ModernSectionCard
            title={tr("exercises", "التمارين")}
            description="مكتبة شاملة من التمارين المتنوعة لجميع المستويات"
            image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
            gradient="bg-gradient-to-br from-[#59f20d] to-emerald-600"
            onClick={() => onNavigate?.("exercises")}
          />
          <ModernSectionCard
            title={tr("nutrition", "التغذية")}
            description="خطط غذائية متكاملة ووصفات صحية لدعم أهدافك"
            image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
            onClick={() => onNavigate?.("nutrition")}
          />
          <ModernSectionCard
            title={tr("supplements", "المكملات")}
            description="دليل شامل للمكملات الغذائية وفوائدها"
            image="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80"
            gradient="bg-gradient-to-br from-teal-500 to-cyan-500"
            onClick={() => onNavigate?.("supplements")}
          />
          <ModernSectionCard
            title={tr("health", "الصحة")}
            description="نصائح صحية متخصصة لجميع الفئات العمرية"
            image="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80"
            gradient="bg-gradient-to-br from-rose-500 to-pink-500"
            onClick={() => onNavigate?.("health")}
          />
          <ModernSectionCard
            title={tr("calculator", "الحاسبات")}
            description="أدوات دقيقة لحساب السعرات والبروتين والوزن المثالي"
            image="https://images.unsplash.com/photo-1611251190778-1c0572de7baf?w=800&q=80"
            gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
            onClick={() => onNavigate?.("calculator")}
          />
          <ModernSectionCard
            title={tr("coaches", "المدربون")}
            description="تواصل مع أفضل المدربين المعتمدين"
            image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            onClick={() => onNavigate?.("coaches")}
          />
        </div>
      </div>

      {/* BMI + Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
        <InfoCard title={tr("bmi_title", "مؤشر كتلة الجسم")}>
          {bmiData ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-[#59f20d]">
                  {bmiData.bmi}
                </span>
                <span className="text-lg font-semibold text-gray-400 pb-1">
                  {bmiData.category}
                </span>
              </div>
              <div className="h-2 bg-[#2a3528] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#59f20d] rounded-full transition-all"
                  style={{
                    width: `${Math.min((parseFloat(bmiData.bmi) / 40) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {tr("bmi_no_data", "أدخل وزنك وطولك لحساب مؤشر الكتلة")}
            </p>
          )}
        </InfoCard>

        <InfoCard title={tr("your_goal", "هدفك")}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59f20d]/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#59f20d]" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {userProfile?.goal === "lose"
                  ? tr("goal_lose", "خسارة وزن")
                  : userProfile?.goal === "gain"
                    ? tr("goal_gain", "زيادة عضل")
                    : tr("goal_maintain", "الحفاظ على الوزن")}
              </p>
              <p className="text-xs text-gray-400">
                {tr("goal_target", "الوزن المستهدف")}:{" "}
                {userProfile?.targetWeight || "غير محدد"} kg
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title={tr("quick_stats", "إحصائيات سريعة")}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">الوزن الحالي</span>
              <span className="text-lg font-bold text-white">
                {userProfile?.currentWeight || "—"} kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">الطول</span>
              <span className="text-lg font-bold text-white">
                {userProfile?.height || "—"} cm
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">العمر</span>
              <span className="text-lg font-bold text-white">
                {userProfile?.age || "—"} {tr("years", "سنة")}
              </span>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
