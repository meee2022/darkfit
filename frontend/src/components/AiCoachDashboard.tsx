import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Activity, Target, Zap, TrendingUp, AlertTriangle, Battery, BatteryCharging, CheckCircle, Flame, Scale, Dumbbell, Utensils, BarChart3 } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { DailyCheckinModal } from "./DailyCheckinModal";
import { SmartPlanGenerator } from "./SmartPlanGenerator";
import { WeeklyReportView } from "./WeeklyReportView";
import { useAction } from "convex/react";

export function AiCoachDashboard() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data Fetching
  const metrics = useQuery(api.aiCoach.getAiDashboardMetrics);
  const insights = useQuery(api.aiCoach.getUnreadInsights) || [];
  const allInsights = useQuery(api.aiCoach.getAllInsights) || [];
  const hasCheckedIn = useQuery(api.aiCoach.getDailyCheckinStatus);
  const markRead = useMutation(api.aiCoach.markInsightRead);
  const weeklyReport = useQuery(api.aiPlans.getWeeklyReport);
  const generateWeeklyReport = useAction(api.aiPlans.generateWeeklyReport);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Real user data
  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const weightHistory = useQuery(api.userProgress.getWeightHistory);
  const dashboardStats = useQuery(api.userProgress.getDashboardStats);
  const streaks = useQuery(api.userProgress.getStreaks);

  // Compute real data
  const realData = useMemo(() => {
    const latestWeight = weightHistory && weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight
      : userProfile?.currentWeight || userProfile?.weight || 0;
    const height = userProfile?.height || 0;
    const bmi = height > 0 ? (latestWeight / (height / 100) ** 2) : 0;
    const targetWeight = userProfile?.targetWeight || 0;
    const remainingKg = targetWeight > 0 ? Math.abs(latestWeight - targetWeight) : 0;
    const totalSessions = dashboardStats?.totalSessions || 0;
    const totalHours = dashboardStats?.totalHours || 0;
    const completion = dashboardStats?.completion || 0;
    const daysSinceLastWorkout = streaks?.daysSinceLastWorkout ?? 999;
    const currentStreak = streaks?.currentStreak || 0;
    const targetDays = userProfile?.trainingDaysPerWeek || 4;

    let bmiCategory = "";
    if (bmi > 0) {
      if (bmi < 18.5) bmiCategory = isAr ? "نحيف" : "Underweight";
      else if (bmi < 25) bmiCategory = isAr ? "طبيعي" : "Normal";
      else if (bmi < 30) bmiCategory = isAr ? "زائد الوزن" : "Overweight";
      else bmiCategory = isAr ? "سمنة" : "Obese";
    }

    return { latestWeight, height, bmi, bmiCategory, targetWeight, remainingKg, totalSessions, totalHours, completion, daysSinceLastWorkout, currentStreak, targetDays };
  }, [weightHistory, userProfile, dashboardStats, streaks, isAr]);

  // Enhanced readiness score incorporating more data
  const enhancedScore = useMemo(() => {
    if (!metrics) return 0;
    let score = metrics.recoveryScore; // base score from check-in data
    
    // Factor in days since last workout (20% weight)
    if (realData.daysSinceLastWorkout <= 2) {
      score = Math.round(score * 0.8 + 80 * 0.2); // rested enough
    } else if (realData.daysSinceLastWorkout <= 4) {
      score = Math.round(score * 0.8 + 60 * 0.2);
    } else {
      score = Math.round(score * 0.8 + 40 * 0.2); // too many rest days
    }
    
    // Factor in completion (15% weight)
    score = Math.round(score * 0.85 + realData.completion * 0.15);
    
    return Math.min(100, Math.max(0, score));
  }, [metrics?.recoveryScore, realData]);

  // Build personalized advice cards
  const adviceCards = useMemo(() => {
    const cards: { icon: string; title: string; lines: string[]; color: string }[] = [];
    if (!metrics) return cards;
    
    // Card 1 — Body Status
    if (realData.latestWeight > 0) {
      cards.push({
        icon: "📊",
        title: isAr ? "حالة الجسم" : "Body Status",
        lines: [
          `${isAr ? "الوزن:" : "Weight:"} ${realData.latestWeight} ${isAr ? "كجم" : "kg"}${realData.bmi > 0 ? ` | BMI: ${realData.bmi.toFixed(1)} (${realData.bmiCategory})` : ""}`,
          ...(realData.targetWeight > 0 ? [
            `${isAr ? "الهدف:" : "Target:"} ${realData.targetWeight} ${isAr ? "كجم" : "kg"} | ${isAr ? "المتبقي:" : "Remaining:"} ${realData.remainingKg.toFixed(1)} ${isAr ? "كجم" : "kg"}`,
            `${isAr ? "معدل الفقد المطلوب: 0.5-1 كجم/أسبوع" : "Target rate: 0.5-1 kg/week"}`
          ] : []),
        ],
        color: "border-[#39ff14]",
      });
    }

    // Card 2 — Last Workout Analysis
    cards.push({
      icon: "💪",
      title: isAr ? "آخر تمرين" : "Last Workout",
      lines: [
        realData.daysSinceLastWorkout < 999
          ? `${isAr ? "آخر تمرين منذ" : "Last workout"} ${realData.daysSinceLastWorkout} ${isAr ? "أيام" : "days ago"}`
          : (isAr ? "لم يتم تسجيل أي تمرين بعد" : "No workouts logged yet"),
        `${isAr ? "الإرهاق:" : "Fatigue:"} ${metrics.fatigueScore}/10`,
        realData.daysSinceLastWorkout <= 1
          ? (isAr ? "التوصية: يوم راحة أو كارديو خفيف" : "Recommendation: Rest day or light cardio")
          : realData.daysSinceLastWorkout <= 3
            ? (isAr ? "التوصية: تمارين المقاومة مناسبة اليوم" : "Recommendation: Resistance training today")
            : (isAr ? "التوصية: عد للتمرين اليوم!" : "Recommendation: Get back to training today!"),
      ],
      color: "border-blue-400",
    });

    // Card 3 — Weekly Summary
    cards.push({
      icon: "📈",
      title: isAr ? "ملخص الأسبوع" : "Weekly Summary",
      lines: [
        `${isAr ? "أيام التمرين:" : "Workout Days:"} ${realData.totalSessions}`,
        `${isAr ? "إجمالي الساعات:" : "Total Hours:"} ${realData.totalHours}`,
        `${isAr ? "الإنجاز:" : "Completion:"} ${realData.completion}%`,
        realData.currentStreak > 0 ? `🔥 ${isAr ? "سلسلة:" : "Streak:"} ${realData.currentStreak} ${isAr ? "أيام متتالية" : "consecutive days"}` : "",
      ].filter(Boolean),
      color: "border-amber-400",
    });

    // Card 4 — Readiness Recommendation
    cards.push({
      icon: "🎯",
      title: isAr ? "توصية اليوم" : "Today's Recommendation",
      lines: [
        enhancedScore > 80
          ? (isAr ? "جسمك في أفضل حالاته! اليوم مناسب لتمرين مكثف والتركيز على تكسير أرقامك." : "Prime readiness! Go for an intense session and push your limits.")
          : enhancedScore > 50
            ? (isAr ? "استشفاء متوسط. تمرن بشكل معتدل واستمع لجسدك. ركز على تمارين الكومباوند." : "Moderate readiness. Train smart with compound exercises.")
            : (isAr ? "جسمك مرهق. ننصح بيوم راحة أو تمارين إطالة ومشي خفيف." : "High fatigue. Rest day, stretching, or light walk recommended."),
      ],
      color: enhancedScore > 80 ? "border-green-400" : enhancedScore > 50 ? "border-amber-400" : "border-rose-400",
    });

    return cards;
  }, [realData, metrics, enhancedScore, isAr]);

  if (!metrics || hasCheckedIn === undefined) {
    return <div className="animate-pulse space-y-6">
      <div className="h-40 bg-white/5 rounded-3xl"></div>
      <div className="h-64 bg-white/5 rounded-3xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0">
          <Brain className="w-7 h-7 text-neon-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{isAr ? "المدرب الذكي" : "Smart Coach"}</h1>
          <p className="text-zinc-500 font-medium">{isAr ? "لوحة القياس والتحليلات المتقدمة" : "Advanced Telemetry Dashboard"}</p>
        </div>
      </div>

      {/* Main Recovery Ring & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#161616] to-[#0f0f0f] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-400/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Recovery Gauge */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={enhancedScore > 80 ? "#59f20d" : enhancedScore > 50 ? "#fbbf24" : "#fb7185"} 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${283 * (enhancedScore / 100)} 283`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white leading-none">{enhancedScore}</span>
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">SCORE</span>
            </div>
          </div>

          <div className="text-center sm:text-start z-10">
            <h2 className="text-2xl font-black text-white mb-2">
              {enhancedScore > 80 
                ? (isAr ? "استعداد ممتاز" : "Excellent Readiness")
                : enhancedScore > 50 
                  ? (isAr ? "استعداد متوسط" : "Moderate Readiness")
                  : (isAr ? "إرهاق عالي" : "High Fatigue")}
            </h2>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed max-w-sm">
              {enhancedScore > 80 
                ? (isAr ? "جسمك في أفضل حالاته اليوم، الاستشفاء ممتاز، استعد لتمرين قوي لكسر أرقامك." : "Prime readiness. Push hard today.")
                : enhancedScore > 50
                  ? (isAr ? "استشفاء متوسط، تمرن بشكل معتدل واستمع لجسدك." : "Moderate readiness. Train smart.")
                  : (isAr ? "جسمك مرهق جداً. ننصح بيوم راحة أو كارديو خفيف جداً." : "High fatigue detected. Active recovery recommended.")}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl">
                <Battery className={`w-4 h-4 ${metrics.fatigueScore < 4 ? "text-neon-400" : "text-rose-400"}`} />
                <span className="text-sm font-bold text-white">{isAr ? "الإرهاق:" : "Fatigue:"} {metrics.fatigueScore}/10</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl">
                <BatteryCharging className={`w-4 h-4 ${metrics.sleepScore > 70 ? "text-neon-400" : "text-amber-400"}`} />
                <span className="text-sm font-bold text-white">{isAr ? "النوم:" : "Sleep:"} {metrics.sleepScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Quick Actions (Generator + Check-in + Report) */}
        <div className="flex flex-col gap-4">
          <SmartPlanGenerator />
          
          <button
            onClick={async () => {
              setIsGeneratingReport(true);
              try {
                await generateWeeklyReport();
              } catch (e) {
                console.error(e);
                alert(isAr ? "فشل توليد التقرير. حاول مجدداً." : "Failed to generate report. Try again.");
              } finally {
                setIsGeneratingReport(false);
              }
            }}
            disabled={isGeneratingReport}
            className="group relative overflow-hidden bg-gradient-to-br from-[#111] to-[#0f0f0f] border border-blue-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:border-blue-500/50 disabled:opacity-50"
          >
            <div className={`w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 ${isGeneratingReport ? 'animate-spin' : ''}`}>
              <BarChart3 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">{isAr ? "تحديث تقرير الأسبوع" : "Refresh Weekly Report"}</h3>
            <p className="text-xs text-zinc-500 font-medium">{isAr ? "حلل أدائك في آخر 7 أيام" : "Analyze your last 7 days performance"}</p>
          </button>
          
          <div className="bg-gradient-to-br from-[#161616] to-[#0f0f0f] border border-white/5 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-center items-center text-center flex-1 min-h-[160px]">
            <div className="absolute inset-0 bg-neon-400/0 group-hover:bg-neon-400/5 transition-colors duration-500 pointer-events-none"></div>
          {hasCheckedIn ? (
            <>
              <div className="w-16 h-16 rounded-full bg-neon-400/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-neon-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">{isAr ? "تم الفحص اليوم" : "Checked in today"}</h3>
              <p className="text-sm text-zinc-500 font-medium">
                {isAr ? "عد غداً لتحديث بيانات التدريب الخاصة بك." : "Come back tomorrow to update your training data."}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">{isAr ? "الفحص اليومي" : "Daily Check-in"}</h3>
              <p className="text-sm text-zinc-500 font-medium mb-6">
                {isAr ? "سجل بيانات نومك وإرهاقك للحصول على توجيه دقيق اليوم." : "Log your sleep and fatigue to get precise guidance today."}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-purple-500 text-white font-black rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
              >
                {isAr ? "بدء الفحص" : "Start Check-in"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>

      {/* Weekly Report Section if exists */}
      {weeklyReport && (
        <WeeklyReportView report={weeklyReport} />
      )}

      {/* AI Advice Cards Generated dynamically */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adviceCards.map((card, idx) => (
          <div key={idx} className={`bg-[#0a0d08] border ${card.color} border-opacity-30 rounded-3xl p-6 relative overflow-hidden group hover:border-opacity-100 transition-colors duration-300`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="text-lg font-black text-white">{card.title}</h3>
            </div>
            <div className="space-y-2 relative z-10">
              {card.lines.map((line, lidx) => (
                <p key={lidx} className="text-sm text-zinc-400 font-medium leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Backend Insights List */}
      <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-400" />
          {isAr ? "رسائل المدرب المباشرة" : "Direct Coach Messages"}
        </h2>
        
        {allInsights.length > 0 ? (
          <div className="space-y-4">
            {allInsights.map((insight: any) => (
              <div 
                key={insight._id} 
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  insight.isRead ? "bg-white/5 border-white/5 opacity-70" : "bg-neon-400/5 border-neon-400/30"
                }`}
                onClick={() => {
                  if (!insight.isRead) markRead({ insightId: insight._id });
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className={`font-black ${insight.isRead ? "text-white" : "text-neon-400"} mb-1`}>
                      {isAr ? insight.titleAr : insight.titleEn}
                    </h4>
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      {isAr ? insight.messageAr : insight.messageEn}
                    </p>
                  </div>
                  {!insight.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-neon-400 shadow-[0_0_10px_rgba(89,242,13,0.8)] mt-1 shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-black/20 rounded-2xl border border-white/5 border-dashed">
            <CheckCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">{isAr ? "لا توجد رسائل جديدة من المدرب." : "No new coach messages."}</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DailyCheckinModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
