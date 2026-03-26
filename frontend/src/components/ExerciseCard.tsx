import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../lib/i18n";
import { X, ChevronDown, ChevronUp, Play, ExternalLink, Share2 } from "lucide-react";
import { useAwardXP } from "./XPBar";
import { ShareCard } from "./ShareCard";

interface Exercise {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  muscleGroup: string;
  muscleGroupAr: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string[];
  instructions: string[];
  instructionsAr: string[];
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  reps?: string;
  sets?: number;
  caloriesBurned?: number;
  targetGender: "male" | "female" | "both";
  category: "strength" | "cardio" | "flexibility" | "balance";
}

interface ExerciseCardProps {
  exercise: Exercise;
  /** When provided by WorkoutGenerator, clicking Log Workout calls this instead of inline form */
  onComplete?: () => void;
  /** Whether this exercise is already marked done in WorkoutGenerator */
  isCompleted?: boolean;
}

function toYouTubeId(url?: string) {
  if (!url) return null;
  const clean = String(url).trim();
  const watch = clean.match(/[?&]v=([^&]+)/);
  if (watch?.[1]) return watch[1];
  const short = clean.match(/youtu\.be\/([^?&]+)/);
  if (short?.[1]) return short[1];
  const shorts = clean.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shorts?.[1]) return shorts[1];
  const embed = clean.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embed?.[1]) return embed[1];
  return null;
}

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function ExerciseCard({ exercise, onComplete, isCompleted }: ExerciseCardProps) {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  const title = isAr ? (exercise.nameAr || exercise.name) : exercise.name;
  
  // ✅ Temporary overrides while DB is updating
  const gifDumbbell = "https://image.mux.com/wtXNqDUH5CRaPNFgqZBnzkYMMyHT1Yx3i2JoSWaJi7E/animated.gif?height=320&start=1&width=320";
  const gifMachine = "https://image.mux.com/tF025fWUYIlvmLXUWLSOboTvl02dVUoShB00hVsaaDpD7w/animated.gif";

  const isDumbbellFly = exercise.nameAr?.includes("تفتيح") && exercise.nameAr?.includes("بالدمبل");
  const isMachineFly = exercise.nameAr?.includes("تفتيح") && (exercise.nameAr?.includes("آلة") || exercise.nameAr?.includes("بيكتورال"));
  const isFly = isDumbbellFly || isMachineFly;
  
  const displayMuscleGroup = isAr ? (isFly ? "الصدر" : exercise.muscleGroupAr) : (isFly ? "Chest" : exercise.muscleGroup);
  const displayImageUrl = isDumbbellFly ? gifDumbbell : (isMachineFly ? gifMachine : exercise.imageUrl);

  const flyStepsAr = isMachineFly ? [
    "اجلس على الآلة مع إبقاء ظهرك مستوياً تماماً على المسند. أمسك بالمقابض.",
    "اعصر عضلات الصدر لتقريب المقابض من بعضها حتى تلتقي في المنتصف.",
    "توقف لمدة ثانية عند أقصى انقباض للعضلة.",
    "عُد ببطء إلى وضع البداية مع الحفاظ على التحكم في الحركة."
  ] : [
    "استلقِ على بنش مستوٍ مع الإمساك بدمبل في كل يد، مع تقابل الراحتين.",
    "ارفع الدمبلز فوق صدرك مع الحفاظ على انحناء بسيط جداً في المرفقين.",
    "أنزل ذراعيك إلى الجانبين ببطء في قوس واسع حتى تشعر بتمدد في عضلات الصدر.",
    "أعد ذراعيك لوضع البداية عن طريق عصر عضلات الصدر بقوة."
  ];

  const flyStepsEn = isMachineFly ? [
    "Sit on the machine with your back flat against the pad. Grip the handles.",
    "Squeeze your chest muscles to bring the handles together until they meet in the center.",
    "Pause for a second at the peak contraction.",
    "Slowly return to the starting position, maintaining control."
  ] : [
    "Lie on a flat bench with a dumbbell in each hand, palms facing each other.",
    "Lift the dumbbells above your chest with a slight bend in your elbows.",
    "Slowly lower your arms to the sides in a wide arc until you feel a stretch in your chest.",
    "Return to the starting position by squeezing your chest muscles firmly."
  ];

  const desc = isAr ? (exercise.descriptionAr || exercise.description) : exercise.description;
  const muscle = displayMuscleGroup;
  const steps = isFly 
    ? (isAr ? flyStepsAr : flyStepsEn)
    : (isAr ? (exercise.instructionsAr?.length ? exercise.instructionsAr : exercise.instructions) : exercise.instructions);

  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [prConfetti, setPrConfetti] = useState(false);

  const [logData, setLogData] = useState({
    duration: exercise.duration || 30,
    sets: exercise.sets || 3,
    reps: [12, 12, 12],
    weight: [0, 0, 0],
    isWarmup: [false, false, false],
    rpe: [8, 8, 8],
    notes: "",
  });

  const logWorkoutClassic = useMutation(api.exercises.logWorkoutSession);
  const logWorkoutProgressive = useMutation(api.workout.saveWorkoutSets);
  const awardXP = useAwardXP();
  const [levelUpData, setLevelUpData] = useState<{oldLevel:number;newLevel:number;tierName:string;tierIcon:string}|null>(null);
  const [prShareData, setPrShareData] = useState<{ exercise: string; weight: number; increase: number } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const muxPlayerUrl = isDumbbellFly 
    ? "https://player.mux.com/wtXNqDUH5CRaPNFgqZBnzkYMMyHT1Yx3i2JoSWaJi7E" 
    : isMachineFly 
    ? "https://player.mux.com/tF025fWUYIlvmLXUWLSOboTvl02dVUoShB00hVsaaDpD7w" 
    : null;

  const videoId = useMemo(() => toYouTubeId(exercise.videoUrl), [exercise.videoUrl]);
  const embedUrl = useMemo(() => (videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null), [videoId]);
  const watchUrl = useMemo(() => {
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    if (muxPlayerUrl) return muxPlayerUrl;
    return exercise.videoUrl || null;
  }, [videoId, muxPlayerUrl, exercise.videoUrl]);

  const difficultyConfig = {
    beginner: { label: isAr ? "مبتدئ" : "Beginner", color: "#59f20d", bg: "rgba(89,242,13,0.12)" },
    intermediate: { label: isAr ? "متوسط" : "Intermediate", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    advanced: { label: isAr ? "متقدم" : "Advanced", color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  };

  const diff = difficultyConfig[exercise.difficulty] || difficultyConfig.beginner;

  const categoryEmoji: Record<string, string> = {
    strength: "💪", cardio: "🫀", flexibility: "🤸", balance: "⚖️",
  };

  const handleLogWorkout = async () => {
    try {
      const estimatedCalories = exercise.caloriesBurned || Math.round(logData.duration * 5);
      
      // 1. Log classic (for backwards compatibility)
      await logWorkoutClassic({
        exerciseId: exercise._id as any,
        duration: logData.duration,
        sets: logData.sets,
        reps: logData.reps,
        weight: logData.weight.some((w) => w > 0) ? logData.weight : undefined,
        caloriesBurned: estimatedCalories,
        notes: logData.notes || undefined,
      });

      // 2. Log Progressive Overload
      const progressiveSets = Array.from({ length: logData.sets }).map((_, i) => ({
        setNumber: i + 1,
        weight: logData.weight[i] || 0,
        reps: logData.reps[i] || 0,
        isWarmup: logData.isWarmup[i] || false,
        rpe: logData.rpe[i] || 8,
      }));

      const today = new Date().toISOString().split("T")[0];
      const result = await logWorkoutProgressive({
        exerciseId: exercise._id as any,
        date: today,
        sets: progressiveSets,
        notes: logData.notes || undefined,
      });

        if (result.isNewPR) {
          setPrConfetti(true);
          setPrShareData({
              exercise: title,
              weight: Math.max(...logData.weight),
              increase: result.increase || 0
          });
          toast.success(isAr ? "🎉 رقم قياسي جديد (PR)!" : "🎉 New Personal Record (PR)!", {
            duration: 4000,
          });
          setTimeout(() => setPrConfetti(false), 3000);
          // Award PR XP
          await awardXP("pr", undefined, (lvl) => setLevelUpData(lvl));
        } else {
        toast.success(isAr ? "✅ تم حفظ التمرين!" : "✅ Workout logged!");
        // Award workout XP
        const hour = new Date().getHours();
        const meta = { earlyMorning: hour < 6, lateNight: hour >= 22 };
        await awardXP("workout", meta, (lvl) => setLevelUpData(lvl));
        if (hour < 6) await awardXP("early_bird", undefined, (lvl) => setLevelUpData(lvl));
        if (hour >= 22) await awardXP("night_owl", undefined, (lvl) => setLevelUpData(lvl));
      }
      
      setIsLogging(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isAr ? "حدث خطأ" : "Something went wrong"));
    }
  };

  return (
    <>
      {levelUpData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLevelUpData(null)}>
          <div className="relative mx-4 w-full max-w-sm rounded-3xl border border-[#59f20d]/40 bg-gradient-to-b from-[#1a2d0f] to-[#0c0c0c] p-8 text-center shadow-[0_0_80px_rgba(89,242,13,0.3)]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#59f20d] mb-4">⬆️ {isAr ? "ترقية!" : "LEVEL UP!"}</p>
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl" style={{ background: "radial-gradient(circle, #1a3d0f 0%, #0c0c0c 100%)", border: "3px solid #59f20d", boxShadow: "0 0 40px rgba(89,242,13,0.6)" }}>{levelUpData.tierIcon}</div>
            <p className="text-lg font-black text-white">{isAr ? `مستوى ${levelUpData.oldLevel}` : `Level ${levelUpData.oldLevel}`}<span className="mx-3 text-[#59f20d]">→</span>{isAr ? `مستوى ${levelUpData.newLevel}` : `Level ${levelUpData.newLevel}`}</p>
            <p className="mt-1 text-2xl font-black text-[#59f20d]">{levelUpData.tierName}</p>
            
            <div className="mt-6 flex flex-col gap-2">
                <button 
                    onClick={() => {
                        setIsShareOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#39ff14] py-3 text-sm font-black text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                >
                    <Share2 className="w-4 h-4" />
                    {isAr ? "شارك الإنجاز 📊" : "Share Achievement 📊"}
                </button>
                <button onClick={() => setLevelUpData(null)} className="w-full rounded-xl bg-white/10 py-3 text-sm font-black text-white">{isAr ? "🎯 رائع!" : "🎯 Awesome!"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Card Modal for Achievement */}
      {prShareData && (
          <ShareCard 
            isOpen={isShareOpen}
            onClose={() => {
                setIsShareOpen(false);
                setPrShareData(null);
            }}
            type="achievement"
            data={{
                userName: "DarkFit User", // We don't easily have profile name here without another query
                titleAr: "رقم قياسي جديد! 🔥",
                stats: [
                    { 
                        labelAr: "التمرين", 
                        labelEn: "Exercise", 
                        value: prShareData.exercise 
                    },
                    { 
                        labelAr: "الوزن الجديد", 
                        labelEn: "New Weight", 
                        value: prShareData.weight, 
                        unit: isAr ? " كجم" : " kg",
                        change: prShareData.increase > 0 ? prShareData.increase : undefined
                    },
                    {
                        labelAr: "المستوى",
                        labelEn: "Level",
                        value: levelUpData?.newLevel || "رياضي",
                    }
                ]
            }}
          />
      )}
      {prConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
             <div key={i} className="absolute w-3 h-3 text-2xl animate-confetti" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}>
               {["🔥", "💪", "🏆", "🎉", "⭐"][Math.floor(Math.random() * 5)]}
             </div>
          ))}
        </div>
      )}
      {/* ── CARD ── */}
      <div className={`group relative rounded-3xl border overflow-hidden flex flex-col transition-all duration-400 hover:shadow-[0_8px_40px_rgba(89,242,13,0.1)] ${isCompleted ? "border-[#59f20d]/60 bg-gradient-to-b from-[#59f20d]/10 to-[#0d1109] opacity-80" : "border-[#2a3528] bg-gradient-to-b from-[#181f17] to-[#0d1109] hover:border-[#59f20d]/50"}`}>
        {/* Hover glow — pointer-events-none, z-0 stays below content */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#59f20d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* ── Media Section (full-width, proper aspect ratio) ── */}
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{ 
            aspectRatio: "16/9", 
            background: "#0a0e09" 
          }}
          onClick={() => setShowModal(true)}
        >
          {/* Image — always full-width, never cropped */}
          {displayImageUrl && (
            <img
              src={displayImageUrl}
              alt={title || ""}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: "center 40%" }}
            />
          )}

          {/* Modal update: Use displayImageUrl inside the modal too */}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button overlay — ONLY show if it's a playable video (watchUrl) */}
          {watchUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "#59f20d",
                  boxShadow: "0 0 24px rgba(89,242,13,0.6)",
                }}
              >
                <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
              </div>
            </div>
          )}

          {/* Click to expand hint */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-white/60 font-medium">
            {isAr ? "اضغط للتفاصيل" : "Tap for details"}
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
            <span className="text-sm">{categoryEmoji[exercise.category] || "🏋️"}</span>
            <span className="text-[10px] font-bold text-white/80 capitalize">{exercise.category}</span>
          </div>
        </div>

        {/* ── Card Body — z-10 ensures it stays above the absolute glow overlay ── */}
        <div className="relative z-10 p-4 flex-1 flex flex-col gap-3">
          {/* Title + badges */}
          <div>
            <h3
              className="text-base font-black text-white mb-2 leading-snug transition-colors duration-300 cursor-pointer hover:text-[#59f20d]"
              onClick={() => setShowModal(true)}
            >
              {title || (isAr ? "بدون اسم" : "Untitled")}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30">
                🎯 {muscle || (isAr ? "غير محدد" : "N/A")}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                style={{ color: diff.color, background: diff.bg, borderColor: diff.color + "55" }}
              >
                {diff.label}
              </span>
              {exercise.caloriesBurned && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  🔥 {exercise.caloriesBurned} kcal
                </span>
              )}
            </div>
          </div>

          {/* Description (short) */}
          {desc && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{desc}</p>
          )}

          {/* Quick stats row */}
          {(exercise.duration || exercise.sets || exercise.reps) && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {exercise.duration && (
                <span className="flex items-center gap-1">⏱ <strong className="text-white">{exercise.duration}</strong> {isAr ? "د" : "min"}</span>
              )}
              {exercise.sets && (
                <span className="flex items-center gap-1">📊 <strong className="text-white">{exercise.sets}</strong> {isAr ? "مج" : "sets"}</span>
              )}
              {exercise.reps && (
                <span className="flex items-center gap-1">🔁 <strong className="text-white">{exercise.reps}</strong> {isAr ? "تكرار" : "reps"}</span>
              )}
            </div>
          )}

          {/* ── Instructions (always visible, collapsible) ── */}
          {steps && steps.length > 0 && (
            <div className="rounded-2xl border border-[#2a3528] bg-black/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left outline-none focus:outline-none"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-[#59f20d]">
                  <span>📋</span>
                  {isAr ? "طريقة الأداء" : "How to Perform"}
                  <span className="px-1.5 py-0.5 rounded-full bg-[#59f20d]/15 text-[10px]">
                    {steps.length} {isAr ? "خطوات" : "steps"}
                  </span>
                </span>
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-[#59f20d]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded && (
                <div className="px-3.5 pb-3.5 space-y-1.5 border-t border-[#2a3528]">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed pt-2">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ background: "#59f20d", color: "#000" }}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="mt-auto flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-[#59f20d]/30 bg-[#59f20d]/8 text-[#59f20d] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#59f20d]/15 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {isAr ? "التفاصيل" : "Details"}
            </button>
            {/* If generator mode: tick as done. Otherwise: open inline log form */}
            {onComplete ? (
              <button
                type="button"
                onClick={onComplete}
                className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 shadow-lg ${
                  isCompleted
                    ? "bg-white/8 text-[#59f20d] border border-[#59f20d]/50"
                    : "bg-[#59f20d] text-black hover:brightness-110 hover:scale-[1.02] shadow-[#59f20d]/20"
                }`}
              >
                {isCompleted
                  ? (isAr ? "✓ تم" : "✓ Done")
                  : (isAr ? "✓ أتممته" : "✓ Mark Done")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogging(!isLogging)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#59f20d] text-black text-xs font-black flex items-center justify-center gap-1.5 hover:brightness-110 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-[#59f20d]/20"
              >
                ✓ {isAr ? "سجّل التمرين" : "Log Workout"}
              </button>
            )}
          </div>

          {/* Logging form (inline) */}
          {isLogging && (
            <div className="pt-3 border-t border-[#2a3528] space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 mb-1 block">{isAr ? "المدة (دقيقة)" : "Duration (min)"}</label>
                  <input type="number" value={logData.duration}
                    onChange={(e) => setLogData((p) => ({ ...p, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-[#2a3528] bg-black/40 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#59f20d]" min={1} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 mb-1 block">{isAr ? "المجموعات" : "Sets"}</label>
                  <input type="number" value={logData.sets}
                    onChange={(e) => {
                      const s = parseInt(e.target.value) || 1;
                      setLogData((p) => ({ ...p, sets: s, reps: Array(s).fill(12), weight: Array(s).fill(0) }));
                    }}
                    className="w-full rounded-xl border border-[#2a3528] bg-black/40 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#59f20d]" min={1} />
                </div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: logData.sets }, (_, i) => (
                  <div key={i} className="flex flex-col gap-1.5 p-2 rounded-xl bg-black/40 border border-[#2a3528]">
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] text-[#59f20d] font-bold w-6">{i + 1}</span>
                      <input type="number" placeholder={isAr ? "تكرار" : "Reps"} value={logData.reps[i] || 0}
                        onChange={(e) => { const r = [...logData.reps]; r[i] = parseInt(e.target.value) || 0; setLogData((p) => ({ ...p, reps: r })); }}
                        className="flex-1 rounded-xl border border-[#2a3528] bg-zinc-900 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#59f20d]" />
                      <input type="number" placeholder={isAr ? "وزن كج" : "kg"} value={logData.weight[i] || 0}
                        onChange={(e) => { const w = [...logData.weight]; w[i] = parseFloat(e.target.value) || 0; setLogData((p) => ({ ...p, weight: w })); }}
                        className="flex-1 rounded-xl border border-[#2a3528] bg-zinc-900 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-[#59f20d]" step={0.5} />
                    </div>
                    {/* Advanced metrics row: Warmup & RPE */}
                    <div className="flex gap-2 items-center pl-8 text-[10px]">
                      <label className="flex items-center gap-1 cursor-pointer text-gray-400 hover:text-white">
                        <input type="checkbox" checked={logData.isWarmup[i] || false}
                          onChange={(e) => { const wu = [...logData.isWarmup]; wu[i] = e.target.checked; setLogData((p) => ({ ...p, isWarmup: wu })); }}
                          className="accent-[#59f20d]" />
                        {isAr ? "تسخين" : "Warmup"}
                      </label>
                      <div className="flex items-center gap-1 ml-auto text-gray-400">
                        <span>RPE:</span>
                        <select value={logData.rpe[i] || 8}
                          onChange={(e) => { const rpe = [...logData.rpe]; rpe[i] = parseInt(e.target.value) || 8; setLogData((p) => ({ ...p, rpe })); }}
                          className="bg-zinc-900 border border-[#2a3528] rounded-lg px-1 py-0.5 outline-none focus:border-[#59f20d]"
                        >
                          {[5,6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleLogWorkout}
                  className="flex-1 py-2 rounded-xl bg-[#59f20d] text-black font-bold text-xs hover:brightness-110 transition-all">
                  {isAr ? "💾 حفظ" : "💾 Save"}
                </button>
                <button type="button" onClick={() => setIsLogging(false)}
                  className="px-4 py-2 rounded-xl border border-[#59f20d]/30 text-[#59f20d] font-bold text-xs hover:bg-[#59f20d]/10 transition-all">
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL — rendered via Portal directly on document.body ── */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

          {/* Sheet */}
          <div
            className="relative w-full sm:max-w-lg mx-auto sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col"
            style={{ background: "linear-gradient(160deg, #1a2318, #0d1109)", border: "1px solid rgba(89,242,13,0.2)", zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="text-xl font-black text-white leading-tight mb-1">{title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30">
                    🎯 {muscle}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                    style={{ color: diff.color, background: diff.bg, borderColor: diff.color + "55" }}>
                    {diff.label}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors border border-white/10 flex-shrink-0">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {/* Video / Image */}
              {(embedUrl && !iframeFailed) ? (
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <iframe src={embedUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen
                    onError={() => setIframeFailed(true)} />
                </div>
              ) : (muxPlayerUrl && !iframeFailed) ? (
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                   <iframe src={muxPlayerUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen
                    onError={() => setIframeFailed(true)} />
                </div>
              ) : displayImageUrl ? (
                <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
                  <img src={displayImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {watchUrl && (
                    <a href={watchUrl} target="_blank" rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#59f20d] flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                        style={{ boxShadow: "0 0 24px rgba(89,242,13,0.6)" }}>
                        <Play className="w-7 h-7 text-black ml-0.5" fill="black" />
                      </div>
                    </a>
                  )}
                </div>
              ) : watchUrl ? (
                <a href={watchUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 hover:bg-[#59f20d]/20 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                  </div>
                  <span className="text-sm font-bold text-[#59f20d]">{isAr ? "مشاهدة الفيديو على يوتيوب" : "Watch on YouTube"}</span>
                  <ExternalLink className="w-4 h-4 text-[#59f20d] ml-auto" />
                </a>
              ) : null}

              {/* Description */}
              {desc && (
                <div>
                  <h4 className="text-xs font-bold text-[#59f20d] uppercase tracking-widest mb-2">{isAr ? "الوصف" : "Description"}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {exercise.duration && (
                  <div className="rounded-2xl bg-white/4 border border-white/8 p-3 text-center">
                    <div className="text-xl font-black text-white">{exercise.duration}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{isAr ? "دقيقة" : "min"}</div>
                  </div>
                )}
                {exercise.sets && (
                  <div className="rounded-2xl bg-white/4 border border-white/8 p-3 text-center">
                    <div className="text-xl font-black text-white">{exercise.sets}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{isAr ? "مجموعات" : "sets"}</div>
                  </div>
                )}
                {exercise.caloriesBurned && (
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-3 text-center">
                    <div className="text-xl font-black text-orange-400">{exercise.caloriesBurned}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">kcal</div>
                  </div>
                )}
              </div>

              {/* Equipment */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#59f20d] uppercase tracking-widest mb-2">{isAr ? "المعدات المطلوبة" : "Equipment"}</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.map((eq, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10">
                        🏋️ {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* How to Perform */}
              {steps && steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#59f20d] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📋</span>
                    {isAr ? "طريقة الأداء والتقنية" : "How to Perform & Technique"}
                  </h4>
                  <div className="space-y-2.5">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-2xl bg-white/3 border border-white/6 hover:border-[#59f20d]/25 transition-colors">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                          style={{ background: "#59f20d", color: "#000" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technique tips */}
              <div className="rounded-2xl border border-[#59f20d]/20 bg-[#59f20d]/5 p-4">
                <h4 className="text-xs font-black text-[#59f20d] mb-2">💡 {isAr ? "نصائح التقنية" : "Technique Tips"}</h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-[#59f20d]">•</span> {isAr ? "ابدأ بوزن خفيف لإتقان الحركة قبل زيادة الحمل" : "Start with light weight to perfect form before adding load"}</li>
                  <li className="flex items-start gap-2"><span className="text-[#59f20d]">•</span> {isAr ? "تنفس بانتظام: زفير عند الجهد وشهيق عند الإرجاع" : "Breathe steadily: exhale on effort, inhale on return"}</li>
                  <li className="flex items-start gap-2"><span className="text-[#59f20d]">•</span> {isAr ? "ركّز على الإحساس بالعضلة المستهدفة طوال الحركة" : "Focus on feeling the target muscle throughout the movement"}</li>
                  <li className="flex items-start gap-2"><span className="text-[#59f20d]">•</span> {isAr ? "حافظ على ظهر مستقيم وتجنب أي إجهاد غير ضروري" : "Keep your back straight and avoid unnecessary strain"}</li>
                </ul>
              </div>

              {/* YouTube link */}
              {watchUrl && (
                <a href={watchUrl} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-600/25 transition-colors">
                  <Play className="w-4 h-4" fill="currentColor" />
                  {isAr ? "شاهد الفيديو على يوتيوب" : "Watch on YouTube"}
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}

              <button type="button"
                onClick={() => { setShowModal(false); setIsLogging(true); }}
                className="w-full py-3.5 rounded-2xl bg-[#59f20d] text-black text-sm font-black hover:brightness-110 transition-all shadow-lg"
                style={{ boxShadow: "0 4px 24px rgba(89,242,13,0.3)" }}>
                ✓ {isAr ? "سجّل هذا التمرين" : "Log This Workout"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

