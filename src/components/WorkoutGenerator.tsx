import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseCard } from "./ExerciseCard";
import BodyModel from "./BodyModel";
import {
    Dumbbell,
    Target,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Zap,
    TrendingDown,
    Activity,
    Flame,
} from "lucide-react";

type Goal = "bulk" | "cut" | "strength" | "flexibility";
type Difficulty = "all" | "beginner" | "intermediate" | "advanced";
type Gender = "male" | "female";

// عضلات صغيرة → 3 تمارين، كبيرة → 5 تمارين
const SMALL_MUSCLES = new Set([
    "Triceps", "Biceps", "Forearms", "Calf",
    "Obliques", "Quadriceps", "RearShoulderRearDeltoid",
    "LowerBackErectorSpinae",
]);
const getExerciseLimit = (id: string) => (SMALL_MUSCLES.has(id) ? 3 : 5);

const MUSCLE_TO_DB: Record<string, string> = {
    Traps: "Traps",
    shoulders: "shoulders",
    Chest: "Chest",
    Biceps: "Biceps",
    Forearms: "Forearms",
    Abs: "Abs",
    Obliques: "Obliques",
    Quads: "Quads",
    Quadriceps: "Quadriceps",
    Lats: "Lats",
    Triceps: "Triceps",
    Calf: "Calf",
    Hamstrings: "Hamstrings",
    Glutes: "Glutes",
    upper_back: "upperback",
    Lower_Back__Erector_Spinae_: "LowerBackErectorSpinae",
    Rear_Shoulder__Rear_Deltoid_: "RearShoulderRearDeltoid",
};

const GOAL_CATEGORY: Record<Goal, "strength" | "cardio" | "flexibility" | "balance" | undefined> = {
    bulk: "strength",
    cut: "cardio",
    strength: "strength",
    flexibility: "flexibility",
};

export function WorkoutGenerator() {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const [step, setStep] = useState<"goal" | "muscle" | "results">("goal");
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<Difficulty>("all");
    const [gender, setGender] = useState<Gender>("male");
    const [hoveredMuscle, setHoveredMuscle] = useState<{ id: string; name: string } | null>(null);

    const dbMuscle = useMemo(() => {
        if (!selectedMuscles.length) return undefined;
        return MUSCLE_TO_DB[selectedMuscles[0]] ?? selectedMuscles[0];
    }, [selectedMuscles]);

    const dbCategory = selectedGoal ? GOAL_CATEGORY[selectedGoal] : undefined;

    const exercises = useQuery(
        api.exercises.getAllExercises,
        step === "results" && dbMuscle
            ? {
                muscleGroup: dbMuscle,
                ...(dbCategory ? { category: dbCategory } : {}),
                ...(difficulty !== "all" ? { difficulty } : {}),
            }
            : "skip"
    );

    const limitedExercises = useMemo(() => {
        if (!exercises) return exercises;
        const limit = selectedMuscles[0] ? getExerciseLimit(selectedMuscles[0]) : 5;
        return exercises.slice(0, limit);
    }, [exercises, selectedMuscles]);

    /* ── Goals config ── */
    const goals: {
        id: Goal;
        icon: React.ReactNode;
        labelAr: string;
        labelEn: string;
        descAr: string;
        descEn: string;
        accent: string;
        dot: string;
    }[] = [
            {
                id: "bulk",
                icon: <Zap className="w-5 h-5" />,
                labelAr: "تضخيم 💪",
                labelEn: "Bulk Up 💪",
                descAr: "بناء كتلة عضلية وزيادة الحجم",
                descEn: "Build muscle mass and increase size",
                accent: "hover:border-amber-500/50",
                dot: "bg-amber-400",
            },
            {
                id: "cut",
                icon: <TrendingDown className="w-5 h-5" />,
                labelAr: "تنشيف 🔥",
                labelEn: "Cut / Fat Loss 🔥",
                descAr: "حرق الدهون والحصول على جسم رشيق",
                descEn: "Burn fat and get lean",
                accent: "hover:border-rose-500/50",
                dot: "bg-rose-400",
            },
            {
                id: "strength",
                icon: <Activity className="w-5 h-5" />,
                labelAr: "قوة 🏋️",
                labelEn: "Strength 🏋️",
                descAr: "تطوير القوة والأداء الرياضي",
                descEn: "Develop strength and athletic performance",
                accent: "hover:border-[#59f20d]/50",
                dot: "bg-[#59f20d]",
            },
            {
                id: "flexibility",
                icon: <Flame className="w-5 h-5" />,
                labelAr: "مرونة 🤸",
                labelEn: "Flexibility 🤸",
                descAr: "تحسين المرونة ومدى الحركة",
                descEn: "Improve flexibility and range of motion",
                accent: "hover:border-sky-500/50",
                dot: "bg-sky-400",
            },
        ];

    const goalObj = goals.find((g) => g.id === selectedGoal);

    const handleMuscleClick = (id: string) => {
        setSelectedMuscles((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [id]
        );
    };

    const BackChevron = isAr ? ChevronRight : ChevronLeft;

    const stepIndex = ["goal", "muscle", "results"].indexOf(step);

    return (
        <div
            dir={isAr ? "rtl" : "ltr"}
            className="min-h-screen bg-[#0c0c0c] text-white"
        >
            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-20 bg-[#0c0c0c]/95 backdrop-blur-lg border-b border-white/5 px-4 py-3.5">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    {/* Title */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-[#59f20d]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-none">
                                {isAr ? "مولد التمارين" : "Workout Generator"}
                            </p>
                            <p className="text-[11px] text-white/30 mt-0.5">
                                {isAr ? "اختر هدفك وعضلتك" : "Pick goal & muscle"}
                            </p>
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="flex items-center gap-1.5">
                        {["goal", "muscle", "results"].map((s, i) => (
                            <div
                                key={s}
                                className={`rounded-full transition-all duration-300 ${i === stepIndex
                                    ? "w-5 h-1.5 bg-[#59f20d]"
                                    : i < stepIndex
                                        ? "w-2 h-1.5 bg-white/30"
                                        : "w-2 h-1.5 bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-3xl mx-auto px-4 py-7">
                <AnimatePresence mode="wait">

                    {/* ━━ Step 1: Goal ━━ */}
                    {step === "goal" && (
                        <motion.div
                            key="goal"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-5"
                        >
                            <div className={`${isAr ? "text-right" : "text-left"}`}>
                                <h2 className="text-xl font-bold text-white">
                                    {isAr ? "ما هو هدفك؟" : "What's your goal?"}
                                </h2>
                                <p className="text-sm text-white/40 mt-1">
                                    {isAr
                                        ? "اختر هدفك للحصول على أنسب التمارين"
                                        : "Choose your goal to get the best exercises"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {goals.map((g) => (
                                    <motion.button
                                        key={g.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedGoal(g.id);
                                            setStep("muscle");
                                        }}
                                        className={`
                      flex items-center gap-4 p-4 rounded-2xl border text-left
                      bg-[#1c1c1c] border-white/[0.12] transition-all duration-200
                      ${g.accent}
                      ${selectedGoal === g.id ? "border-[#59f20d]/50 bg-[#59f20d]/8" : "hover:bg-white/5"}
                    `}
                                    >
                                        <div className={`w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/80`}>
                                            {g.icon}
                                        </div>
                                        <div className={isAr ? "text-right" : "text-left"}>
                                            <p className="font-bold text-white text-sm">
                                                {isAr ? g.labelAr : g.labelEn}
                                            </p>
                                            <p className="text-xs text-white/40 mt-0.5">
                                                {isAr ? g.descAr : g.descEn}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ━━ Step 2: Muscle ━━ */}
                    {step === "muscle" && (
                        <motion.div
                            key="muscle"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-5"
                        >
                            {/* top bar */}
                            <div
                                className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""
                                    }`}
                            >
                                <button
                                    onClick={() => setStep("goal")}
                                    className="flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors"
                                >
                                    <BackChevron className="w-4 h-4" />
                                    {isAr ? "رجوع" : "Back"}
                                </button>
                                {goalObj && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.08] text-white/75 border border-white/[0.12]">
                                        {isAr ? goalObj.labelAr : goalObj.labelEn}
                                    </span>
                                )}
                            </div>

                            <div className={isAr ? "text-right" : "text-left"}>
                                <h2 className="text-xl font-bold text-white">
                                    {isAr ? "اختر العضلة" : "Select a Muscle"}
                                </h2>
                                <p className="text-sm text-white/40 mt-1">
                                    {isAr
                                        ? "اضغط على أي جزء من الجسم"
                                        : "Tap any part of the body"}
                                </p>
                            </div>

                            {/* Gender pills */}
                            <div
                                className={`flex gap-2 ${isAr ? "justify-end" : "justify-start"}`}
                            >
                                {(["male", "female"] as Gender[]).map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${gender === g
                                            ? "bg-[#59f20d] text-black border-transparent"
                                            : "bg-white/[0.07] text-white/65 border-white/[0.12] hover:text-white hover:bg-white/[0.12]"
                                            }`}
                                    >
                                        {g === "male"
                                            ? isAr ? "👨 ذكر" : "👨 Male"
                                            : isAr ? "👩 أنثى" : "👩 Female"}
                                    </button>
                                ))}
                            </div>

                            {/* Hover hint */}
                            <div className="h-5 text-sm text-[#59f20d]/80 text-center transition-all">
                                {hoveredMuscle
                                    ? (isAr
                                        ? `اضغط: ${hoveredMuscle.name}`
                                        : `Tap: ${hoveredMuscle.name}`)
                                    : ""}
                            </div>

                            {/* Body model - quiet container */}
                            <div className="rounded-2xl bg-[#181818] border border-white/[0.1] p-4 flex justify-center">
                                <div className="w-full max-w-[280px]">
                                    <BodyModel
                                        gender={gender}
                                        onMuscleClick={handleMuscleClick}
                                        selectedMuscles={selectedMuscles}
                                        onHoverMuscleChange={setHoveredMuscle}
                                    />
                                </div>
                            </div>

                            {/* Selected muscle chip */}
                            {selectedMuscles.length > 0 && (
                                <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#59f20d]/10 text-[#59f20d] text-xs font-semibold border border-[#59f20d]/20">
                                        💪 {selectedMuscles[0]}
                                    </span>
                                </div>
                            )}

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <p className="text-xs text-white/30 uppercase tracking-widest text-center">
                                    {isAr ? "مستوى الصعوبة" : "Difficulty"}
                                </p>
                                <div className="flex gap-2 justify-center flex-wrap">
                                    {(["all", "beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => {
                                        const labels: Record<string, string> = {
                                            all: isAr ? "الكل" : "All",
                                            beginner: isAr ? "مبتدئ" : "Beginner",
                                            intermediate: isAr ? "متوسط" : "Intermediate",
                                            advanced: isAr ? "متقدم" : "Advanced",
                                        };
                                        return (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${difficulty === d
                                                    ? "bg-[#59f20d] text-black border-transparent"
                                                    : "bg-white/[0.07] text-white/60 border-white/[0.12] hover:text-white hover:bg-white/[0.12]"
                                                    }`}
                                            >
                                                {labels[d]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA button */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => selectedMuscles.length && setStep("results")}
                                disabled={!selectedMuscles.length}
                                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${selectedMuscles.length
                                    ? "bg-[#59f20d] text-black hover:brightness-95"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                                    }`}
                            >
                                <Target className="w-4 h-4" />
                                {isAr ? "عرض التمارين" : "Show Exercises"}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ━━ Step 3: Results ━━ */}
                    {step === "results" && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-5"
                        >
                            {/* Top bar */}
                            <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                                <button
                                    onClick={() => setStep("muscle")}
                                    className="flex items-center gap-1 text-white/40 hover:text-white text-sm transition-colors"
                                >
                                    <BackChevron className="w-4 h-4" />
                                    {isAr ? "رجوع" : "Back"}
                                </button>
                                <button
                                    onClick={() => {
                                        setStep("goal");
                                        setSelectedGoal(null);
                                        setSelectedMuscles([]);
                                        setDifficulty("all");
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {isAr ? "بدء من جديد" : "Start Over"}
                                </button>
                            </div>

                            {/* Summary row */}
                            <div className="flex flex-wrap gap-2">
                                {goalObj && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs font-semibold border border-white/8">
                                        🎯 {isAr ? goalObj.labelAr : goalObj.labelEn}
                                    </span>
                                )}
                                {selectedMuscles[0] && (
                                    <span className="px-3 py-1 rounded-full bg-[#59f20d]/10 text-[#59f20d] text-xs font-semibold border border-[#59f20d]/15">
                                        💪 {selectedMuscles[0]}
                                    </span>
                                )}
                                {difficulty !== "all" && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs font-semibold border border-white/8 capitalize">
                                        {difficulty}
                                    </span>
                                )}
                                {limitedExercises !== undefined && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs font-semibold border border-white/8">
                                        {limitedExercises.length} {isAr ? "تمرين" : "exercises"}
                                    </span>
                                )}
                            </div>

                            {/* Loading */}
                            {exercises === undefined && (
                                <div className="flex flex-col items-center gap-3 py-16">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#59f20d] animate-spin" />
                                    <p className="text-sm text-white/30">
                                        {isAr ? "جاري التحميل..." : "Loading..."}
                                    </p>
                                </div>
                            )}

                            {/* Empty */}
                            {limitedExercises !== undefined && limitedExercises.length === 0 && (
                                <div className="flex flex-col items-center gap-3 py-16 text-center">
                                    <p className="text-4xl">😅</p>
                                    <p className="text-sm text-white/40">
                                        {isAr
                                            ? "لا توجد تمارين لهذه المعايير"
                                            : "No exercises found for these filters"}
                                    </p>
                                    <button
                                        onClick={() => setStep("muscle")}
                                        className="px-5 py-2 rounded-xl bg-white/5 text-white/60 text-sm hover:text-white transition"
                                    >
                                        {isAr ? "تعديل الاختيار" : "Change Selection"}
                                    </button>
                                </div>
                            )}

                            {/* Cards */}
                            {limitedExercises && limitedExercises.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {limitedExercises.map((ex: any) => (
                                        <ExerciseCard key={ex._id} exercise={ex} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="h-20" />
        </div>
    );
}
