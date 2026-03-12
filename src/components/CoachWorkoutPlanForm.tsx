import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import type { SectionId } from "../sections";
import { ArrowLeft, Plus, X, Search, CheckCircle, Circle, Send } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onNavigate?: (id: SectionId) => void;
};

type DayWorkout = {
  dayNumber: number;
  dayLabel: string;
  selectedExercises: string[];
};

export function CoachWorkoutPlanForm({ onNavigate }: Props) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const clients = useQuery(api.profiles.adminListProfiles, { q: "" }) ?? [];
  const exercises = useQuery(api.exercises.listExerciseOptions, {}) ?? [];

  const assignWorkoutPlan = useMutation(api.plans.coachAssignWorkoutPlan);

  const [selectedClient, setSelectedClient] = useState<string>("");
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  
  // Days management
  const [days, setDays] = useState<DayWorkout[]>([
    { dayNumber: 1, dayLabel: isAr ? "اليوم 1" : "Day 1", selectedExercises: [] }
  ]);
  const [activeDay, setActiveDay] = useState<number>(1);

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtered clients
  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    if (!q) return clients;
    return clients.filter((c: any) => 
      (c.name || "").toLowerCase().includes(q)
    );
  }, [clientSearch, clients]);

  const selectedClientData = clients.find((c: any) => c._id === selectedClient);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    const q = (exerciseSearch || "").toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex: any) => {
      const ar = String(ex.nameAr || "").toLowerCase();
      const en = String(ex.name || "").toLowerCase();
      const mg = String(ex.muscleGroup || "").toLowerCase();
      return ar.includes(q) || en.includes(q) || mg.includes(q);
    });
  }, [exerciseSearch, exercises]);

  const currentDay = days.find(d => d.dayNumber === activeDay);

  const addDay = () => {
    const newDayNumber = days.length + 1;
    setDays([...days, {
      dayNumber: newDayNumber,
      dayLabel: isAr ? `اليوم ${newDayNumber}` : `Day ${newDayNumber}`,
      selectedExercises: []
    }]);
    toast.success(isAr ? "تمت إضافة يوم جديد" : "New day added");
  };

  const removeDay = (dayNumber: number) => {
    if (days.length === 1) {
      toast.error(isAr ? "يجب أن يكون هناك يوم واحد على الأقل" : "At least one day required");
      return;
    }
    setDays(days.filter(d => d.dayNumber !== dayNumber));
    if (activeDay === dayNumber) {
      setActiveDay(1);
    }
    toast.success(isAr ? "تم حذف اليوم" : "Day removed");
  };

  const toggleExercise = (exerciseId: string) => {
    setDays(days.map(d => {
      if (d.dayNumber === activeDay) {
        const exists = d.selectedExercises.includes(exerciseId);
        return {
          ...d,
          selectedExercises: exists 
            ? d.selectedExercises.filter(id => id !== exerciseId)
            : [...d.selectedExercises, exerciseId]
        };
      }
      return d;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toast.error(isAr ? "اختر المتدرب أولاً" : "Select a trainee first");
      return;
    }
    if (!title.trim()) {
      toast.error(isAr ? "أدخل عنوان الخطة" : "Enter plan title");
      return;
    }

    const totalExercises = days.reduce((sum, d) => sum + d.selectedExercises.length, 0);
    if (totalExercises === 0) {
      toast.error(isAr ? "أضف تماريناً واحداً على الأقل" : "Add at least one exercise");
      return;
    }

    setLoading(true);
    try {
      // Collect all exercise IDs (flat list for backward compatibility)
      const allExerciseIds = days.flatMap(d => d.selectedExercises);

      // Map days to the schedule format for the backend
      const schedule = days.map(d => ({
        weekNumber: 1, // Default to week 1 for now
        dayOfWeek: d.dayNumber,
        label: d.dayLabel,
        exerciseIds: d.selectedExercises.map(id => id as any)
      }));

      await assignWorkoutPlan({
        clientProfileId: selectedClient as any,
        exerciseIds: allExerciseIds.map((id) => id as any),
        title,
        notes,
        level,
        daysPerWeek: days.length,
        schedule,
      });

      toast.success(isAr ? "تم إرسال الخطة للمتدرب ✓" : "Plan sent successfully ✓");
      
      // Navigate back after small delay to show success
      setTimeout(() => {
        onNavigate?.("admin");
      }, 1000);
      
      // Reset
      setTitle("");
      setNotes("");
      setDays([{ dayNumber: 1, dayLabel: isAr ? "اليوم 1" : "Day 1", selectedExercises: [] }]);
      setActiveDay(1);
      setSelectedClient("");
    } catch (err: any) {
      toast.error(err.message || "Error sending plan");
    } finally {
      setLoading(false);
    }
  };

  const getTotalExercises = () => {
    return days.reduce((sum, d) => sum + d.selectedExercises.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0d08] via-black to-[#0a0d08] text-white pb-20">
      {/* Header */}
      <div className="bg-[#0a0d08]/80 backdrop-blur-xl border-b border-[#59f20d]/20 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate?.("admin")}
            className="w-10 h-10 rounded-full bg-[#1a2318] border border-[#59f20d]/30 flex items-center justify-center hover:bg-[#2a3528] transition"
          >
            <ArrowLeft className="w-5 h-5 text-[#59f20d]" />
          </button>
          
          <h1 className="text-xl font-black text-white">
            {isAr ? "إنشاء خطة تدريب" : "Create Workout Plan"}
          </h1>

          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Client Selection */}
        <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-3xl p-6">
          <label className="block text-sm font-bold text-[#59f20d] mb-3">
            {isAr ? "اختر المتدرب" : "Select Trainee"}
          </label>
          
          {!selectedClient ? (
            <button
              type="button"
              onClick={() => setShowClientSearch(true)}
              className="w-full px-4 py-3 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/30 text-white flex items-center justify-between hover:border-[#59f20d]/60 transition"
            >
              <span className="text-zinc-400">{isAr ? "ابحث عن اسم المتدرب..." : "Search for trainee..."}</span>
              <Search className="w-5 h-5 text-[#59f20d]" />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]">
              <div className="flex-1">
                <div className="text-base font-bold text-white">{selectedClientData?.name}</div>
                <div className="text-xs text-zinc-400">{selectedClientData?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient("")}
                className="w-8 h-8 rounded-full bg-[#1a2318] flex items-center justify-center hover:bg-red-500/20 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Plan Info */}
        <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "عنوان الخطة" : "Plan Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: تضخيم العضلات - المرحلة الأولى" : "e.g., Muscle Building - Phase 1"}
              className="w-full px-4 py-3 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[#59f20d]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition ${
                  level === lvl
                    ? "bg-[#59f20d] text-black"
                    : "bg-[#0a0d08] border border-[#59f20d]/30 text-white hover:border-[#59f20d]/60"
                }`}
              >
                {isAr 
                  ? { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }[lvl]
                  : lvl.charAt(0).toUpperCase() + lvl.slice(1)
                }
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "ملاحظات للمتدرب" : "Notes to Trainee"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "اكتب نصائحك هنا..." : "Write your tips here..."}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[#59f20d] resize-none"
            />
          </div>
        </div>

        {/* Days Tabs */}
        <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{isAr ? "أيام التدريب" : "Training Days"}</h3>
            <button
              type="button"
              onClick={addDay}
              className="px-4 py-2 rounded-full bg-[#59f20d] text-black text-sm font-bold flex items-center gap-2 hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" />
              {isAr ? "إضافة يوم جديد" : "Add Day"}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <div key={day.dayNumber} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-6 py-3 rounded-2xl font-bold transition ${
                    activeDay === day.dayNumber
                      ? "bg-[#59f20d] text-black"
                      : "bg-[#0a0d08] border border-[#59f20d]/30 text-white hover:border-[#59f20d]/60"
                  }`}
                >
                  <div className="text-sm">{day.dayLabel}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {day.selectedExercises.length} {isAr ? "تمرين" : "exercises"}
                  </div>
                </button>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(day.dayNumber)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:brightness-110 transition"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Selection for Current Day */}
        <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {isAr ? `تمارين ${currentDay?.dayLabel}` : `${currentDay?.dayLabel} Exercises`}
            </h3>
            <div className="text-sm text-zinc-400">
              {currentDay?.selectedExercises.length || 0} {isAr ? "محدد" : "selected"}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن تمرين (مثال: بنش برس، صدر)" : "Search exercise (e.g., Flat Bench, chest)"}
              className="w-full px-4 py-3 pl-12 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[#59f20d]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#59f20d]" />
          </div>

          {/* Exercise List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                {isAr ? "لا توجد تمارين" : "No exercises found"}
              </div>
            ) : (
              filteredExercises.map((ex: any) => {
                const isSelected = currentDay?.selectedExercises.includes(ex._id);
                return (
                  <button
                    key={ex._id}
                    type="button"
                    onClick={() => toggleExercise(ex._id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                      isSelected
                        ? "bg-[#59f20d]/10 border-[#59f20d]"
                        : "bg-[#0a0d08] border-[#59f20d]/20 hover:border-[#59f20d]/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isSelected ? "bg-[#59f20d]" : "bg-[#1a2318]"
                    }`}>
                      {isSelected ? (
                        <CheckCircle className="w-6 h-6 text-black" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#59f20d]" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-white">{isAr ? ex.nameAr : ex.name}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {ex.muscleGroup} • {ex.difficulty}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="relative z-30">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 rounded-2xl bg-[#59f20d] text-black font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-[#59f20d]/30"
          >
          {loading ? (
            <div className="h-6 w-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              {isAr ? `إرسال الخطة للمتدرب (${getTotalExercises()} تمرين)` : `Send Plan (${getTotalExercises()} exercises)`}
            </>
          )}
        </button>
      </div>
      </form>

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1a0a] border-2 border-[#59f20d]/30 rounded-3xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{isAr ? "اختر المتدرب" : "Select Trainee"}</h3>
              <button
                onClick={() => setShowClientSearch(false)}
                className="w-8 h-8 rounded-full bg-[#1a2318] flex items-center justify-center hover:bg-[#2a3528] transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم..." : "Search by name..."}
              className="w-full px-4 py-3 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/30 text-white placeholder-zinc-600 focus:outline-none focus:border-[#59f20d] mb-4"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  {isAr ? "لا يوجد متدربين" : "No trainees found"}
                </div>
              ) : (
                filteredClients.map((client: any) => (
                  <button
                    key={client._id}
                    onClick={() => {
                      setSelectedClient(client._id);
                      setShowClientSearch(false);
                      setClientSearch("");
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#0a0d08] border border-[#59f20d]/20 hover:border-[#59f20d]/60 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#59f20d]/20 flex items-center justify-center">
                      <span className="text-lg">{client.name?.[0] || "?"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-xs text-zinc-400">{client.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
