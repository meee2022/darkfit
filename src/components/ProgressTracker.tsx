import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useLanguage } from "../lib/i18n";
import { ShareCard } from "./ShareCard";
import { 
  TrendingUp, TrendingDown, Target, Scale, Save, Activity, Lightbulb, Ruler, HeartPulse, Calendar, Filter, Share2 
} from "lucide-react";

export function ProgressTracker() {
  const { language, dir, t } = useLanguage();
  const isAr = language === "ar";

  const profile = useQuery(api.profiles.getCurrentProfile);
  const weightHistory = useQuery(api.userProgress.getWeightHistory) || [];
  const targetWeight = useQuery(api.userProgress.getTargetWeight);
  const addWeightLog = useMutation(api.userProgress.addWeightLog);

  const [weightInput, setWeightInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "all">("all");
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState({ chest: "", waist: "", hips: "", arms: "" });
  const [isShareOpen, setIsShareOpen] = useState(false);

  const currentWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight 
    : 0;

  // BMI calculation
  const bmiData = useMemo(() => {
    const h = profile?.height || 0;
    if (!currentWeight || !h || h === 0) return null;
    const bmi = currentWeight / (h / 100) ** 2;
    let category = "";
    let color = "text-neon-400";
    if (bmi < 18.5) { category = isAr ? "نحيف" : "Underweight"; color = "text-sky-400"; }
    else if (bmi < 25) { category = isAr ? "طبيعي" : "Normal"; color = "text-neon-400"; }
    else if (bmi < 30) { category = isAr ? "زائد الوزن" : "Overweight"; color = "text-amber-400"; }
    else { category = isAr ? "سمنة" : "Obese"; color = "text-rose-400"; }
    return { bmi: bmi.toFixed(1), category, color };
  }, [currentWeight, profile?.height, isAr]);

  // Filter weight history by time period
  const filteredHistory = useMemo(() => {
    if (timePeriod === "all") return weightHistory;
    const now = new Date();
    const cutoff = new Date();
    if (timePeriod === "week") cutoff.setDate(now.getDate() - 7);
    else if (timePeriod === "month") cutoff.setMonth(now.getMonth() - 1);
    return weightHistory.filter((entry: any) => new Date(entry.date) >= cutoff);
  }, [weightHistory, timePeriod]);

  // Goal progress calculation
  const goalProgress = useMemo(() => {
    if (!targetWeight || !currentWeight) return 0;
    const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : currentWeight;
    const totalDiff = Math.abs(startWeight - targetWeight);
    if (totalDiff === 0) return 100;
    const currentDiff = Math.abs(currentWeight - targetWeight);
    return Math.min(100, Math.max(0, Math.round(((totalDiff - currentDiff) / totalDiff) * 100)));
  }, [currentWeight, targetWeight, weightHistory]);

  const handleSaveWeight = async () => {
    if (!weightInput || isNaN(Number(weightInput))) return;
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await addWeightLog({
        weight: Number(weightInput),
        date: today,
      });
      setWeightInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recharts styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-neon-400/30 p-3 rounded-xl shadow-lg">
          <p className="text-zinc-400 text-xs mb-1">{label}</p>
          <p className="text-white font-black">{payload[0].value} {isAr ? "كجم" : "kg"}</p>
        </div>
      );
    }
    return null;
  };

  // Determine progress status
  let distanceToTarget = 0;
  if (targetWeight && currentWeight) {
    distanceToTarget = Math.abs(currentWeight - targetWeight);
  }

  // --- Smart Insights Logic ---
  const goal = profile?.goal || (isAr ? "تنشيف" : "cut");
  let insightText = "";
  let insightTitle = "";
  let iconColor = "text-neon-400";
  let bgGlow = "bg-neon-400/10";
  
  if (weightHistory.length >= 2) {
    const lastWeight = weightHistory[weightHistory.length - 1].weight;
    const prevWeight = weightHistory[weightHistory.length - 2].weight;
    const weightDiff = lastWeight - prevWeight;
    
    if (goal === "تضخيم" || goal.toLowerCase() === "bulk") {
      if (weightDiff > 0) {
        insightTitle = isAr ? "أداء ممتاز في التضخيم! 💪" : "Great Bulking Progress! 💪";
        insightText = isAr 
          ? "الزيادة في وزنك تعني أنك في الطريق الصحيح لبناء العضلات. استمر في زيادة أوزانك في الجيم وتناول كمية كافية من البروتين والكارب."
          : "Weight increase means you are on the right track for muscle building. Keep lifting heavy and eating your carbs/protein.";
        iconColor = "text-blue-400";
        bgGlow = "bg-blue-400/10";
      } else if (weightDiff < 0) {
        insightTitle = isAr ? "انتبه! وزنك ينقص 📉" : "Attention! Weight is dropping 📉";
        insightText = isAr 
          ? "هدفك هو التضخيم ولكنك فقدت بعض الوزن. تأكد من أنك تأكل فائضاً من السعرات الحرارية وتتجاوز احتياجك اليومي حتى تتمكن من بناء العضلات."
          : "Your goal is bulking but you lost weight. Ensure you are eating in a caloric surplus.";
        iconColor = "text-yellow-400";
        bgGlow = "bg-yellow-400/10";
      } else {
        insightTitle = isAr ? "وزنك ثابت ⚖️" : "Weight is stable ⚖️";
        insightText = isAr 
          ? "وزنك لم يتغير مؤخراً. في مرحلة التضخيم، إذا لم يزد وزنك لأسبوعين، فكر في زيادة سعراتك اليومية بمقدار 200-300 سعرة."
          : "Your weight hasn't changed. If this persists, try adding an extra 200-300 calories.";
      }
    } else {
      // Default: Cut (تنشيف) / Maintain
      if (weightDiff < 0) {
        insightTitle = isAr ? "تقدم رائع في حرق الدهون! 🔥" : "Great Fat Burning Progress! 🔥";
        insightText = isAr 
          ? "أنت تفقد الوزن بنجاح وهو مؤشر لالتزامك بعجز السعرات. استمر وكن حريصاً على تناول بروتين عالي للحفاظ على عضلاتك."
          : "You are losing weight successfully. Keep your protein high to preserve muscle mass!";
      } else if (weightDiff > 0) {
        insightTitle = isAr ? "ارتفاع طفيف بالوزن 📊" : "Slight weight increase 📊";
        insightText = isAr 
          ? "لاحظنا زيادة بسيطة في وزنك. قد يكون هذا مجرد احتباس سوائل أو نتيجة تناول وجبة مالحة. التزم بنظامك ولا تدع هذا الرقم يحبطك!"
          : "We noticed a slight weight increase. This could just be water retention. Stick to your plan!";
        iconColor = "text-rose-400";
        bgGlow = "bg-rose-400/10";
      } else {
        insightTitle = isAr ? "استقرار في الوزن ⚖️" : "Weight Stabilization ⚖️";
        insightText = isAr 
          ? "الوزن ثابت تقريباً بالمقارنة مع آخر تسجيل. إذا استمر هذا الثبات لأيام طويلة، جرب تعديل سعراتك أو زيادة نشاطك البدني قليلاً."
          : "Your weight is completely stable. If you plateau, try dropping calories slightly or adding cardio.";
      }
    }

    // Target closeness condition
    if (targetWeight && distanceToTarget <= 2 && distanceToTarget > 0) {
      insightTitle = isAr ? "أنت تعانق هدفك! 🏆" : "You are reaching your goal! 🏆";
      insightText = isAr 
        ? "خطوات قليلة جداً تفصلك عن الوزن المثالي الذي حددته. استمر ولا تستسلم الآن، أنت بطل!"
        : "Just a few steps away from your target weight. Keep pushing!";
      iconColor = "text-neon-400";
      bgGlow = "bg-neon-400/20";
    }
  } else {
    // Empty State or only 1 entry
    insightTitle = isAr ? "خطوتك الأولى قوية 🚀" : "A strong first step 🚀";
    insightText = isAr 
      ? "تم تسجيل وزن أولي بنجاح. أضف وزنك بانتظام (مثلاً كل أسبوع) وسيقوم نظامنا الذكي بتحليل مسارك وتقديم نصائح مخصصة لك!"
      : "Log your weight regularly (e.g. weekly) so our AI can analyze your path and provide customized tips!";
  }

  return (
    <div className="space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-400 to-green-600 flex items-center justify-center shadow-[0_0_20px_rgba(89,242,13,0.3)] shrink-0">
          <Activity className="w-7 h-7 text-zinc-950" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{isAr ? "تتبع التطور" : "Progress Tracking"}</h1>
          <p className="text-zinc-500 text-sm md:text-base font-medium mt-1">{isAr ? "راقب أوزانك واستمر في التقدم نحو هدفك" : "Monitor your weight and progress towards your goal"}</p>
        </div>
      </div>

      {/* Smart Insights Panel - Moved to Top for immediate visibility */}
      <div className={`p-5 md:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center relative overflow-hidden bg-gradient-to-r from-[#161616] to-[#1a1a1a] shadow-lg`}>
        <div className={`absolute top-0 right-0 w-64 h-64 ${bgGlow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-[#111] border border-white/5 shadow-inner relative z-10`}>
          <Lightbulb className={`w-7 h-7 ${iconColor}`} />
        </div>
        <div className="relative z-10">
          <h3 className="text-white font-black text-lg md:text-xl mb-1.5 tracking-wide">{insightTitle}</h3>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
            {insightText}
          </p>
        </div>
      </div>

      {/* Stats Cards - 4 cards including BMI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-neon-400/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-400/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-xs md:text-sm font-bold">{isAr ? "الوزن الحالي" : "Current Weight"}</span>
            <div className="p-2 rounded-xl bg-neon-400/10 text-neon-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{currentWeight > 0 ? currentWeight : "--"}</span>
            <span className="text-zinc-500 font-bold mb-1 text-sm">{isAr ? "كجم" : "kg"}</span>
          </div>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-400/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-xs md:text-sm font-bold">{isAr ? "المستهدف" : "Target"}</span>
            <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{targetWeight ?? "--"}</span>
            <span className="text-zinc-500 font-bold mb-1 text-sm">{isAr ? "كجم" : "kg"}</span>
          </div>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-400/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-400/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-xs md:text-sm font-bold">{isAr ? "المتبقي" : "Left"}</span>
            <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
              {currentWeight > (targetWeight ?? 0) ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{distanceToTarget > 0 ? distanceToTarget.toFixed(1) : "--"}</span>
            <span className="text-zinc-500 font-bold mb-1 text-sm">{isAr ? "كجم" : "kg"}</span>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-rose-400/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-400/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-xs md:text-sm font-bold">BMI</span>
            <div className="p-2 rounded-xl bg-rose-400/10 text-rose-400">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{bmiData?.bmi || "--"}</span>
            <span className={`font-bold mb-1 text-xs ${bmiData?.color || "text-zinc-500"}`}>{bmiData?.category || ""}</span>
          </div>
        </div>
      </div>

      {/* Goal Progress Bar */}
      {targetWeight && currentWeight > 0 && (
        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-400" />
              {isAr ? "التقدم نحو الهدف" : "Goal Progress"}
            </h3>
            <span className="text-lg font-black text-neon-400">{goalProgress}%</span>
          </div>
          <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${goalProgress}%`,
                background: goalProgress >= 80 ? '#59f20d' : goalProgress >= 50 ? '#fbbf24' : '#f97316',
                boxShadow: `0 0 10px ${goalProgress >= 80 ? '#59f20d' : goalProgress >= 50 ? '#fbbf24' : '#f97316'}60`
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500 font-bold">
            <span>{weightHistory.length > 0 ? weightHistory[0].weight : currentWeight} {isAr ? "كجم" : "kg"}</span>
            <span className="text-neon-400">{targetWeight} {isAr ? "كجم" : "kg"}</span>
          </div>
        </div>
      )}

      {/* Chart & Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-neon-400" />
              {isAr ? "مؤشر تغير الأوزان" : "Weight Progress Chart"}
            </h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-400/10 border border-neon-400/20 text-neon-400 text-xs font-bold hover:bg-neon-400/20 transition-all"
                >
                    <Share2 className="w-4 h-4" />
                    {isAr ? "مشاركة" : "Share"}
                </button>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400">
                {filteredHistory.length} {isAr ? "تسجيلات" : "logs"}
                </div>
            </div>
          </div>
          {/* Time Period Filter */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-zinc-500" />
            {(["week", "month", "all"] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timePeriod === period
                    ? "bg-neon-400/20 text-neon-400 border border-neon-400/30"
                    : "bg-white/5 text-zinc-500 border border-white/10 hover:text-white"
                }`}
              >
                {period === "week" ? (isAr ? "أسبوع" : "Week") : period === "month" ? (isAr ? "شهر" : "Month") : (isAr ? "الكل" : "All")}
              </button>
            ))}
          </div>
          
          <div className="h-[300px] w-full">
            {filteredHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#555" 
                    tick={{ fill: '#888', fontSize: 13, fontWeight: 600 }} 
                    tickFormatter={(val) => val.slice(5)} // Show MM-DD
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'auto']} 
                    stroke="#555" 
                    tick={{ fill: '#888', fontSize: 13, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Line 
                    type="natural" 
                    dataKey="weight" 
                    stroke="#59f20d" 
                    strokeWidth={5}
                    dot={{ fill: '#111', stroke: '#59f20d', strokeWidth: 3, r: 5 }}
                    activeDot={{ r: 8, fill: '#59f20d', stroke: '#111', strokeWidth: 2 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-white/5 rounded-2xl">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-center max-w-xs">{isAr ? "لا توجد أوزان مسجلة كافية لتكوين الرسم البياني" : "Not enough weights logged to chart."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Weight Form */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-neon-400/20 to-neon-400/5 rounded-[2rem] flex items-center justify-center mx-auto mb-5 border border-neon-400/20 rotate-3">
              <Scale className="w-10 h-10 text-neon-400 -rotate-3" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">{isAr ? "سجل وزنك اليوم" : "Log Today's Weight"}</h3>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">{isAr ? "الاستمرارية هي مفتاح النجاح. أدخل وزنك ليتم تحديث مؤشراتك مباشرة." : "Consistency is key. Log your weight to instantly update your metrics."}</p>
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={currentWeight > 0 ? String(currentWeight) : "00.0"}
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl px-5 py-5 text-center text-4xl font-black text-white focus:outline-none focus:border-neon-400 focus:ring-4 focus:ring-neon-400/10 transition-all placeholder:text-zinc-800"
                dir="ltr"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black tracking-widest pointer-events-none group-focus-within:text-neon-400/50 transition-colors">KG</span>
            </div>

            <button
              onClick={handleSaveWeight}
              disabled={isSubmitting || !weightInput}
              className="w-full bg-[#59f20d] hover:bg-[#4ade0b] text-zinc-950 font-black py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(89,242,13,0.4)] hover:-translate-y-1 shadow-md text-lg"
            >
              <Save className="w-6 h-6" />
              {isSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "اعتماد الوزن الجديد" : "Save New Weight")}
            </button>
          </div>
        </div>
      </div>

      {/* Body Measurements Section */}
      <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
        <button 
          onClick={() => setShowMeasurements(!showMeasurements)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2.5">
            <Ruler className="w-6 h-6 text-purple-400" />
            {isAr ? "قياسات الجسم" : "Body Measurements"}
          </h2>
          <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform ${showMeasurements ? "rotate-180" : ""}`}>
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        
        {showMeasurements && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-zinc-500 font-medium">
              {isAr ? "سجل قياسات جسمك لمتابعة التغييرات بدقة أكبر من الميزان وحده." : "Track body measurements for a more complete picture than just scale weight."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "chest", icon: "📏", label: isAr ? "الصدر" : "Chest" },
                { key: "waist", icon: "📐", label: isAr ? "الخصر" : "Waist" },
                { key: "hips", icon: "📏", label: isAr ? "الأرداف" : "Hips" },
                { key: "arms", icon: "💪", label: isAr ? "الذراعين" : "Arms" },
              ].map(m => (
                <div key={m.key} className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{m.icon}</span>
                    <label className="text-xs font-bold text-zinc-400">{m.label}</label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={(measurements as any)[m.key]}
                      onChange={(e) => setMeasurements(prev => ({ ...prev, [m.key]: e.target.value }))}
                      placeholder="--"
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-2xl font-black text-white focus:outline-none focus:border-neon-400 transition-colors text-center placeholder:text-zinc-800"
                      dir="ltr"
                    />
                    <span className="absolute right-0 bottom-2 text-xs text-zinc-600 font-bold">{isAr ? "سم" : "cm"}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                // Save measurements - for now just show a visual confirmation
                setShowMeasurements(false);
              }}
              className="w-full py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold rounded-xl hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isAr ? "حفظ القياسات" : "Save Measurements"}
            </button>
          </div>
        )}
      </div>
      
      {/* Share Card Modal */}
      {profile && (
          <ShareCard 
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            type="monthly"
            data={{
                userName: profile.name,
                titleAr: "تقدمي في الوزن ⚖️",
                stats: [
                    { 
                        labelAr: "الوزن الحالي", 
                        labelEn: "Current Weight", 
                        value: currentWeight, 
                        unit: isAr ? " كجم" : " kg",
                        change: weightHistory.length > 1 ? (weightHistory[0].weight - currentWeight).toFixed(1) : undefined
                    },
                    { 
                        labelAr: "الوزن المستهدف", 
                        labelEn: "Target", 
                        value: targetWeight || 0,
                        unit: isAr ? " كجم" : " kg"
                    },
                    { 
                        labelAr: "المتبقي", 
                        labelEn: "To Go", 
                        value: distanceToTarget.toFixed(1),
                        unit: isAr ? " كجم" : " kg"
                    },
                    {
                        labelAr: "نسبة الإنجاز",
                        labelEn: "Progress",
                        value: goalProgress,
                        unit: "%"
                    }
                ]
            }}
          />
      )}
    </div>
  );
}
