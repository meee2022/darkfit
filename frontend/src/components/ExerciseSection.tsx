import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BodyModel } from "./BodyModel";
import { ExerciseCard } from "./ExerciseCard";
import { useLanguage } from "../lib/i18n";
import { Dumbbell, X, Search } from "lucide-react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Side = "front" | "back";

// ✅ تعريف MuscleId بنفس القيم الموجودة في BodyModel
type MuscleId =
  | "Traps"
  | "shoulders"
  | "Chest"
  | "Biceps"
  | "Forearms"
  | "Abs"
  | "Obliques"
  | "Quads"
  | "Quadriceps"
  | "Lats"
  | "Triceps"
  | "Calf"
  | "Hamstrings"
  | "Glutes"
  | "upperback"
  | "LowerBackErectorSpinae"
  | "RearShoulderRearDeltoid";

export function ExerciseSection() {
  const { t, language, dir } = useLanguage();

  const [selectedGender, setSelectedGender] =
    useState<"male" | "female">("male");

  // ✅ State للعضلات المختارة (array)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleId[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [bodySide, setBodySide] = useState<Side>("front");
  const [hoveredMuscle, setHoveredMuscle] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ جلب كل التمارين بدون فلتر muscleGroup
  const allExercises = useQuery(api.exercises.getAllExercises, {
    difficulty: selectedDifficulty
      ? (selectedDifficulty as "beginner" | "intermediate" | "advanced")
      : undefined,
    gender: selectedGender,
    category: selectedCategory
      ? (selectedCategory as "strength" | "cardio" | "flexibility" | "balance")
      : undefined,
  });

  // ✅ mapping بين IDs العضلات وأسماءها المختلفة في قاعدة البيانات
  const muscleMapping: Record<MuscleId, string[]> = {
    shoulders: ["shoulders", "Shoulders", "الأكتاف"],
    Chest: ["chest", "Chest", "الصدر"],
    Biceps: ["biceps", "Biceps", "arms", "البايسبس", "الذراعان"],
    Triceps: ["triceps", "Triceps", "arms", "الترايسبس", "الذراعان"],
    Forearms: ["forearms", "Forearms", "الساعد"],
    Abs: ["abs", "Abs", "core", "البطن"],
    Obliques: ["obliques", "Obliques", "core", "الجوانب"],
    Quads: ["quads", "Quads", "legs", "الفخذ الأمامي", "الأرجل"],
    Quadriceps: ["quadriceps", "Quadriceps", "legs", "الفخذ", "الأرجل"],
    Hamstrings: ["hamstrings", "Hamstrings", "legs", "الفخذ الخلفي", "الأرجل"],
    Glutes: ["glutes", "Glutes", "legs", "الأرداف", "الأرجل"],
    Calf: ["calf", "Calf", "calves", "legs", "السمانة", "الأرجل"],
    Lats: ["lats", "Lats", "back", "الظهر العريض", "الظهر"],
    Traps: ["traps", "Traps", "الترابيس"],
    upperback: ["upperback", "Upper Back", "back", "أعلى الظهر", "الظهر"],
    LowerBackErectorSpinae: ["lowerback", "Lower Back", "Erector Spinae", "back", "أسفل الظهر", "الظهر"],
    RearShoulderRearDeltoid: ["rear delts", "Rear Deltoid", "shoulders", "الكتف الخلفي", "الأكتاف"],
  };

  // ✅ فلترة التمارين محلياً حسب العضلات المختارة باستخدام mapping ذكي
  const exercises = useMemo(() => {
    if (!allExercises) return undefined;

    let filtered = allExercises;

    // فلتر العضلات المختارة
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter((ex) => {
        return selectedMuscleGroups.some((muscleId) => {
          const possibleNames = muscleMapping[muscleId] || [];
          return possibleNames.some((name) =>
            ex.muscleGroup.toLowerCase().includes(name.toLowerCase())
          );
        });
      });
    }

    // فلتر البحث النصي
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((ex) =>
        (ex.name || "").toLowerCase().includes(q) ||
        (ex.nameAr || "").toLowerCase().includes(q) ||
        (ex.muscleGroup || "").toLowerCase().includes(q) ||
        (ex.muscleGroupAr || "").toLowerCase().includes(q) ||
        (ex.description || "").toLowerCase().includes(q) ||
        (ex.descriptionAr || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allExercises, selectedMuscleGroups, searchQuery]);

  // ✅ قائمة العضلات المتاحة للاختيار (مع الترجمة)
  const allMuscleGroups = useMemo(() => {
    return [
      { id: "shoulders" as MuscleId, name: language === "ar" ? "الأكتاف" : "Shoulders" },
      { id: "Chest" as MuscleId, name: language === "ar" ? "الصدر" : "Chest" },
      { id: "Biceps" as MuscleId, name: language === "ar" ? "البايسبس" : "Biceps" },
      { id: "Triceps" as MuscleId, name: language === "ar" ? "الترايسبس" : "Triceps" },
      { id: "Forearms" as MuscleId, name: language === "ar" ? "الساعد" : "Forearms" },
      { id: "Abs" as MuscleId, name: language === "ar" ? "البطن" : "Abs" },
      { id: "Obliques" as MuscleId, name: language === "ar" ? "الجوانب" : "Obliques" },
      { id: "Quads" as MuscleId, name: language === "ar" ? "الفخذ الأمامي" : "Quads" },
      { id: "Hamstrings" as MuscleId, name: language === "ar" ? "الفخذ الخلفي" : "Hamstrings" },
      { id: "Glutes" as MuscleId, name: language === "ar" ? "الأرداف" : "Glutes" },
      { id: "Calf" as MuscleId, name: language === "ar" ? "السمانة" : "Calves" },
      { id: "Lats" as MuscleId, name: language === "ar" ? "الظهر العريض" : "Lats" },
      { id: "Traps" as MuscleId, name: language === "ar" ? "الترابيس" : "Traps" },
      { id: "upperback" as MuscleId, name: language === "ar" ? "أعلى الظهر" : "Upper Back" },
      { id: "LowerBackErectorSpinae" as MuscleId, name: language === "ar" ? "أسفل الظهر" : "Lower Back" },
      { id: "RearShoulderRearDeltoid" as MuscleId, name: language === "ar" ? "الكتف الخلفي" : "Rear Delts" },
    ];
  }, [language]);

  // ✅ عرض العضلات المختارة
  const selectedMuscleLabels = useMemo(() => {
    if (selectedMuscleGroups.length === 0) return "";

    return selectedMuscleGroups
      .map((id) => allMuscleGroups.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(" + ");
  }, [selectedMuscleGroups, allMuscleGroups]);

  // ✅ تعديل دالة الضغط على العضلة (toggle)
  const handleMuscleClickFromBody = (id: string) => {
    const muscleId = id as MuscleId;
    setSelectedMuscleGroups((prev) => {
      // لو العضلة موجودة، احذفها
      if (prev.includes(muscleId)) {
        return prev.filter((m) => m !== muscleId);
      }
      // لو مش موجودة، ضيفها
      return [...prev, muscleId];
    });
  };

  // ✅ دالة حذف عضلة من القائمة
  const removeMuscle = (id: MuscleId) => {
    setSelectedMuscleGroups((prev) => prev.filter((m) => m !== id));
  };

  // ✅ دالة resetFilters
  const resetFilters = () => {
    setSelectedMuscleGroups([]);
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSearchQuery("");
  };

  return (
    <div dir={dir} className="min-h-screen space-y-6 px-4 py-6">
      {/* Header محسّن */}
      <div className="text-center space-y-3 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/30 mb-3">
          <Dumbbell className="w-5 h-5 text-[#59f20d] animate-pulse" />
          <span className="text-sm font-bold text-[#59f20d]">{language === "ar" ? "مكتبة التمارين" : "Exercise Library"}</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
          {t("exercise_section_title")}
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          {t("exercise_section_desc")}
        </p>
      </div>

      {/* Body model محسّن */}
      <div className="animate-scaleIn">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2318]/80 to-[#0f1410]/60 backdrop-blur-xl border-2 border-[#2a3528] p-6 shadow-2xl hover:border-[#59f20d]/50 transition-all duration-500">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#59f20d] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#59f20d] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse" />
                <h3 className="text-xl font-black text-white">
                  {t("selected_muscle")}
                </h3>
              </div>
              <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#59f20d]/30">
                <span className="text-xs font-bold text-[#59f20d]">
                  {bodySide === "front" ? t("front_view") : t("back_view")}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-md border-2 border-[#59f20d]/20 p-4 sm:p-6 hover:border-[#59f20d]/40 transition-all duration-300 shadow-2xl">
              <BodyModel
                side={bodySide}
                gender={selectedGender}
                selectedMuscles={selectedMuscleGroups}
                onMuscleClick={handleMuscleClickFromBody}
                onSideChange={(side) => setBodySide(side)}
                onHoverMuscleChange={(payload) => setHoveredMuscle(payload)}
              />
            </div>

            {/* عرض العضلات المختارة محسّن */}
            <div className="mt-5 min-h-[32px]">
              {hoveredMuscle ? (
                <div className="flex items-center gap-2 text-[#59f20d] animate-fadeIn">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#59f20d] animate-pulse" />
                  <span className="text-sm font-bold">{hoveredMuscle.name}</span>
                </div>
              ) : selectedMuscleGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMuscleGroups.map((id, index) => {
                    const muscle = allMuscleGroups.find((m) => m.id === id);
                    return (
                      <span
                        key={id}
                        className="stagger-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#59f20d]/20 to-[#59f20d]/10 border-2 border-[#59f20d]/40 text-[#59f20d] text-sm font-bold hover:scale-105 transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {muscle?.name}
                        <button
                          type="button"
                          onClick={() => removeMuscle(id)}
                          className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  {t("no_muscle_selected")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls محسّن */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2318]/70 to-[#0f1410]/50 backdrop-blur-xl border-2 border-[#2a3528] p-6 shadow-xl animate-slideIn">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#59f20d] to-transparent opacity-50" />

        {/* 🔍 Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن تمرين بالاسم أو العضلة..." : "Search by name or muscle..."}
            className="w-full rounded-2xl border-2 border-[#2a3528] bg-black/50 backdrop-blur-sm text-sm font-medium text-zinc-100 ps-12 pe-12 py-3.5 placeholder:text-gray-500 focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/20 transition-all duration-300 hover:border-[#59f20d]/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 -translate-y-1/2 end-4 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Dropdowns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-3xl border-2 border-[#2a3528] bg-black/40 backdrop-blur-sm text-sm font-bold text-zinc-100 px-5 py-3 focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/20 transition-all duration-300 hover:border-[#59f20d]/50"
            >
              <option value="">{t("all_types")}</option>
              <option value="strength">{t("strength")}</option>
              <option value="cardio">{t("cardio")}</option>
              <option value="flexibility">{t("flexibility")}</option>
              <option value="balance">{t("balance")}</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-3xl border-2 border-[#2a3528] bg-black/40 backdrop-blur-sm text-sm font-bold text-zinc-100 px-5 py-3 focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/20 transition-all duration-300 hover:border-[#59f20d]/50"
            >
              <option value="">{t("all_levels")}</option>
              <option value="beginner">{t("beginner")}</option>
              <option value="intermediate">{t("intermediate")}</option>
              <option value="advanced">{t("advanced")}</option>
            </select>

            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const muscleId = e.target.value as MuscleId;
                  setSelectedMuscleGroups((prev) =>
                    prev.includes(muscleId)
                      ? prev.filter((m) => m !== muscleId)
                      : [...prev, muscleId]
                  );
                }
              }}
              className="rounded-3xl border-2 border-[#2a3528] bg-black/40 backdrop-blur-sm text-sm font-bold text-zinc-100 px-5 py-3 focus:outline-none focus:border-[#59f20d] focus:ring-2 focus:ring-[#59f20d]/20 transition-all duration-300 hover:border-[#59f20d]/50"
            >
              <option value="">
                {selectedMuscleGroups.length === 0
                  ? t("selected_muscle")
                  : `${selectedMuscleGroups.length} ${language === "ar" ? "عضلات مختارة" : "muscles selected"}`}
              </option>
              {allMuscleGroups.map((m) => (
                <option key={m.id} value={m.id}>
                  {selectedMuscleGroups.includes(m.id) ? "✓ " : ""}
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles محسّنة */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
            {/* Gender */}
            <div className="flex rounded-full p-1.5 border-2 border-[#59f20d]/30 bg-black/40 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setSelectedGender("female")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  selectedGender === "female"
                    ? "bg-[#59f20d] text-black shadow-lg scale-105"
                    : "text-zinc-300 hover:text-white"
                )}
              >
                {t("women")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("male")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  selectedGender === "male"
                    ? "bg-[#59f20d] text-black shadow-lg scale-105"
                    : "text-zinc-300 hover:text-white"
                )}
              >
                {t("men")}
              </button>
            </div>

            {/* Side */}
            <div className="flex rounded-full p-1.5 border-2 border-[#59f20d]/30 bg-black/40 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBodySide("back")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  bodySide === "back"
                    ? "bg-[#59f20d] text-black shadow-lg scale-105"
                    : "text-zinc-300 hover:text-white"
                )}
              >
                {t("back_view")}
              </button>
              <button
                type="button"
                onClick={() => setBodySide("front")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  bodySide === "front"
                    ? "bg-[#59f20d] text-black shadow-lg scale-105"
                    : "text-zinc-300 hover:text-white"
                )}
              >
                {t("front_view")}
              </button>
            </div>
          </div>
        </div>

        {/* زر إعادة ضبط + عداد */}
        <div className="mt-5 pt-5 border-t border-[#2a3528] flex flex-wrap gap-3 justify-between items-center">
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-3 rounded-full border-2 border-[#59f20d]/30 bg-black/30 text-sm font-bold text-[#59f20d] hover:bg-[#59f20d]/10 hover:border-[#59f20d]/60 transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <span className="text-lg">⟳</span>
            {t("reset_filters")}
          </button>

          <div className="px-4 py-2 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/30">
            <span className="text-sm font-bold text-[#59f20d]">
              {exercises
                ? language === "ar"
                  ? `${exercises.length} تمرين`
                  : `${exercises.length} exercises`
                : t("loading")}
            </span>
          </div>
        </div>
      </div>

      {/* قائمة التمارين محسّنة */}
      <div className="animate-slideInRight">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2318]/70 to-[#0f1410]/50 backdrop-blur-xl border-2 border-[#2a3528] p-6 shadow-2xl">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#59f20d] to-transparent" />

          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse" />
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {t("exercises")}
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                {selectedMuscleLabels
                  ? `${t("selected_muscle")}: ${selectedMuscleLabels}`
                  : t("exercise_section_desc")}
              </p>
            </div>
            <div className="hidden sm:flex">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/5 border-2 border-[#59f20d]/40 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group">
                <Dumbbell className="w-7 h-7 text-[#59f20d] group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-[#59f20d]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {!exercises ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center gap-3 text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-ping" />
                  <span className="text-sm font-medium">{t("loading")}</span>
                </div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#59f20d]/10 border-2 border-[#59f20d]/30 flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-[#59f20d]/50" />
                </div>
                <p className="text-gray-400 text-sm font-medium">{t("no_exercises_found")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise._id}
                    className="stagger-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ExerciseCard exercise={exercise} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
