import React, { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../lib/i18n";

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

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { language, t } = useLanguage();

  const title = language === "ar" ? (exercise.nameAr || exercise.name) : exercise.name;
  const desc =
    language === "ar" ? (exercise.descriptionAr || exercise.description) : exercise.description;
  const muscle =
    language === "ar" ? (exercise.muscleGroupAr || exercise.muscleGroup) : exercise.muscleGroup;
  const steps =
    language === "ar" ? (exercise.instructionsAr?.length ? exercise.instructionsAr : exercise.instructions) : exercise.instructions;

  const [showDetails, setShowDetails] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  const [logData, setLogData] = useState({
    duration: exercise.duration || 30,
    sets: exercise.sets || 3,
    reps: [12, 12, 12],
    weight: [0, 0, 0],
    notes: "",
  });

  const logWorkout = useMutation(api.exercises.logWorkoutSession);

  const videoId = useMemo(
    () => toYouTubeId(exercise.videoUrl),
    [exercise.videoUrl]
  );

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }, [videoId]);

  const watchUrl = useMemo(() => {
    if (!videoId) return exercise.videoUrl || null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }, [videoId, exercise.videoUrl]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 border-[#59f20d] dark:bg-[#59f20d]/20 dark:text-emerald-200 dark:border-[#59f20d]/70";
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/70";
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-400/70";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-500";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return t("beginner");
      case "intermediate":
        return t("intermediate");
      case "advanced":
        return t("advanced");
      default:
        return difficulty;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return "💪";
      case "cardio":
        return "❤️";
      case "flexibility":
        return "🤸";
      case "balance":
        return "⚖️";
      default:
        return "🏋️";
    }
  };

  const handleLogWorkout = async () => {
    try {
      const estimatedCalories =
        exercise.caloriesBurned || Math.round(logData.duration * 5);

      await logWorkout({
        exerciseId: exercise._id as any,
        duration: logData.duration,
        sets: logData.sets,
        reps: logData.reps,
        weight: logData.weight.some((w) => w > 0)
          ? logData.weight
          : undefined,
        caloriesBurned: estimatedCalories,
        notes: logData.notes || undefined,
      });

      toast.success(t("workout_logged_success"));
      setIsLogging(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("something_went_wrong");
      toast.error(message);
    }
  };

  return (
    <div className="group relative rounded-3xl border-2 border-[#2a3528] bg-gradient-to-br from-[#1a2318]/80 to-black/60 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col hover:border-[#59f20d]/50 hover:shadow-2xl hover:shadow-[#59f20d]/10 transition-all duration-500 hover:scale-[1.02]">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Video / Image */}
      {embedUrl && !iframeFailed ? (
        <div className="relative bg-black/60 backdrop-blur-sm">
          <div className="w-full aspect-video">
            <iframe
              src={embedUrl}
              title={title || ""}
              className="w-full h-full rounded-t-3xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setIframeFailed(true)}
            />
          </div>
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[#59f20d]/90 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : watchUrl ? (
        <div className="relative bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full aspect-video rounded-2xl border-2 border-[#59f20d]/30 bg-black/80 flex flex-col items-center justify-center gap-3 overflow-hidden">
            {/* Circular Image */}
            {exercise.imageUrl && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#59f20d]/50 shadow-xl">
                <img src={exercise.imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            {/* Play Button */}
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="w-16 h-16 rounded-full bg-[#59f20d] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
            >
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
          </div>
        </div>
      ) : exercise.imageUrl ? (
        <div className="relative h-48 bg-black/60 overflow-hidden">
          <img
            src={exercise.imageUrl}
            alt={title || ""}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-[#59f20d]/10 to-black/60 flex items-center justify-center text-gray-400">
          {t("no_video_or_image")}
        </div>
      )}

      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black text-white mb-2 line-clamp-2 group-hover:text-[#59f20d] transition-colors duration-300">
              {title || (language === "ar" ? "بدون اسم" : "Untitled")}
            </h3>

            {/* Muscle Group Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/30">
                🎯 {muscle || (language === "ar" ? "غير محدد" : "Not set")}
              </span>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getDifficultyColor(
                  exercise.difficulty
                )}`}
              >
                {getDifficultyText(exercise.difficulty)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Info - Horizontal Layout */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {exercise.duration && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("minutes")}:</span>
              <span className="font-bold text-white">{exercise.duration}</span>
            </div>
          )}
          {exercise.sets && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("sets")}:</span>
              <span className="font-bold text-white">{exercise.sets}</span>
            </div>
          )}
          {exercise.caloriesBurned && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("kcal")}:</span>
              <span className="font-bold text-[#59f20d]">{exercise.caloriesBurned}</span>
            </div>
          )}
        </div>

        {/* Buttons - تصميم الصورة */}
        <div className="mt-auto flex gap-3">
          <button
            onClick={() => setIsLogging(!isLogging)}
            className="flex-1 px-6 py-3.5 rounded-full bg-[#59f20d] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4ed10a] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#59f20d]/50"
            type="button"
          >
            <span className="text-lg">✓</span>
            {t("log_workout")}
          </button>
        </div>

        {/* Details - محسّن */}
        {showDetails && (
          <div className="mt-5 pt-5 border-t border-[#2a3528] space-y-3 animate-fadeIn">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#59f20d]" />
              {t("how_to_perform")}
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              {(steps || []).map((instruction, index) => (
                <li key={index} className="leading-relaxed">{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Logging Form - محسّن */}
        {isLogging && (
          <div className="mt-5 pt-5 border-t border-[#2a3528] space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#59f20d]" />
              {t("log_workout_title")}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  {t("duration_minutes")}
                </label>
                <input
                  type="number"
                  value={logData.duration}
                  onChange={(e) =>
                    setLogData((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-2xl border-2 border-[#2a3528] bg-black/40 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#59f20d] transition-colors"
                  min={1}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  {t("number_of_sets")}
                </label>
                <input
                  type="number"
                  value={logData.sets}
                  onChange={(e) => {
                    const sets = parseInt(e.target.value) || 1;
                    setLogData((prev) => ({
                      ...prev,
                      sets,
                      reps: Array(sets).fill(12),
                      weight: Array(sets).fill(0),
                    }));
                  }}
                  className="w-full rounded-2xl border-2 border-[#2a3528] bg-black/40 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#59f20d] transition-colors"
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 block">
                {t("reps_and_weight_each_set")}
              </label>

              {Array.from({ length: logData.sets }, (_, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-xs text-[#59f20d] font-bold w-16">
                    {t("set")} {index + 1}:
                  </span>

                  <input
                    type="number"
                    placeholder={t("reps")}
                    value={logData.reps[index] || 0}
                    onChange={(e) => {
                      const newReps = [...logData.reps];
                      newReps[index] = parseInt(e.target.value) || 0;
                      setLogData((prev) => ({ ...prev, reps: newReps }));
                    }}
                    className="flex-1 rounded-2xl border-2 border-[#2a3528] bg-black/40 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#59f20d] transition-colors"
                    min={0}
                  />

                  <input
                    type="number"
                    placeholder={t("weight_kg")}
                    value={logData.weight[index] || 0}
                    onChange={(e) => {
                      const newWeight = [...logData.weight];
                      newWeight[index] = parseFloat(e.target.value) || 0;
                      setLogData((prev) => ({ ...prev, weight: newWeight }));
                    }}
                    className="flex-1 rounded-2xl border-2 border-[#2a3528] bg-black/40 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#59f20d] transition-colors"
                    min={0}
                    step={0.5}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">
                {t("notes_optional")}
              </label>
              <textarea
                value={logData.notes}
                onChange={(e) =>
                  setLogData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full rounded-2xl border-2 border-[#2a3528] bg-black/40 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#59f20d] transition-colors"
                rows={2}
                placeholder={t("notes_placeholder")}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogWorkout}
                className="flex-1 px-6 py-3 rounded-full bg-[#59f20d] text-black font-bold text-sm hover:bg-[#4ed10a] hover:scale-105 transition-all duration-300"
                type="button"
              >
                {t("save_workout")}
              </button>
              <button
                onClick={() => setIsLogging(false)}
                className="px-6 py-3 rounded-full border-2 border-[#59f20d]/30 bg-black/40 text-[#59f20d] font-bold text-sm hover:bg-[#59f20d]/10 transition-all duration-300"
                type="button"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
