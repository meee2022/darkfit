import React, { useState } from "react";
import { Droplet, ArrowLeft, Utensils, Sun, Moon, CheckCircle, Circle, Plus, X } from "lucide-react";
import { useLanguage } from "../../lib/i18n";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function DiabetesSection() {
  const { dir, language } = useLanguage();
  const isAr = language === "ar";

  const [showGlucoseModal, setShowGlucoseModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  // Fetch data
  const glucoseStats = useQuery(api.health.getGlucoseStats, { days: 7 });
  const todayGlucose = useQuery(api.health.getTodayHealthRecords, { recordType: "glucose" });
  const medications = useQuery(api.health.getActiveMedications);
  const medicationLogs = useQuery(api.health.getTodayMedicationLogs);
  const healthTasks = useQuery(api.health.getHealthTasks, { category: "diabetes" });
  const taskLogs = useQuery(api.health.getTodayHealthTaskLogs);

  // Mutations
  const addGlucoseRecord = useMutation(api.health.addHealthRecord);
  const logMedication = useMutation(api.health.logMedication);
  const logTask = useMutation(api.health.logHealthTask);

  const getCurrentGlucose = () => {
    if (!glucoseStats) return 110;
    return glucoseStats.average || 110;
  };

  const glucose = getCurrentGlucose();

  // Check if medication is taken today
  const isMedicationTaken = (medId: string) => {
    if (!medicationLogs) return false;
    return medicationLogs.some(log => log.medicationId === medId && log.taken);
  };

  // Check if task is completed today
  const isTaskCompleted = (taskId: string) => {
    if (!taskLogs) return false;
    return taskLogs.some(log => log.taskId === taskId && log.completed);
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logTask({ taskId, date: today, completed: !currentStatus });
      toast.success(isAr ? "تم تحديث المهمة" : "Task updated");
    } catch (error) {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  const handleLogMedication = async (medId: string) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].substring(0, 5);
      
      await logMedication({ 
        medicationId: medId, 
        date: today, 
        time, 
        taken: true 
      });
      
      toast.success(isAr ? "تم تسجيل الدواء" : "Medication logged");
    } catch (error) {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  // Get meal context icon
  const getMealIcon = (context?: string) => {
    switch (context) {
      case "fasting": return Sun;
      case "beforeMeal": return Utensils;
      case "afterMeal": return Utensils;
      case "bedtime": return Moon;
      default: return Droplet;
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-b from-[#0a1508] via-[#0d1a0a] to-black text-white px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.dispatchEvent(new Event('health-back'))}
          className="w-12 h-12 rounded-full bg-[#1a2e15] border border-[#59f20d]/20 flex items-center justify-center hover:bg-[#2a3e25] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#59f20d]" />
        </button>

        <div className="text-center">
          <h1 className="text-xl font-black text-white">
            {isAr ? "إدارة السكري DarkFit" : "DarkFit Diabetes Management"}
          </h1>
        </div>

        <button 
          onClick={() => setShowGlucoseModal(true)}
          className="w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center shadow-lg shadow-[#59f20d]/30 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Glucose Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2e15]/90 to-[#0f1a0c]/80 border-2 border-[#59f20d]/20 p-6">
        <div className="absolute top-4 left-4">
          <button className="px-3 py-1.5 rounded-full bg-[#59f20d]/10 border border-[#59f20d]/30 text-xs font-bold text-[#59f20d]">
            {isAr ? "مباشر" : "Live"}
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 mb-3">{isAr ? "نظرة عامة على سكر الدم" : "Blood Sugar Overview"}</p>

          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="#1a2e15" strokeWidth="12" fill="none" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#59f20d"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - Math.min(glucose / 200, 1))}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-black text-[#59f20d]">{glucose}</div>
              <div className="text-sm text-gray-400">{isAr ? "ملج/ديسيلتر" : "mg/dL"}</div>
            </div>
          </div>

          {/* Stats Grid */}
          {glucoseStats && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">{isAr ? "المعدل اليومي" : "Daily Average"}</div>
                <div className="text-2xl font-black text-white">{glucoseStats.average}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{isAr ? "أعلى قراءة" : "Highest"}</div>
                <div className="text-2xl font-black text-white">{glucoseStats.highest}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{isAr ? "أدنى قراءة" : "Lowest"}</div>
                <div className="text-2xl font-black text-white">{glucoseStats.lowest}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Readings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">{isAr ? "سجل الجلوكوز اليومي" : "Daily Glucose Log"}</h2>
          <button 
            onClick={() => setShowGlucoseModal(true)}
            className="text-xs font-bold text-[#59f20d] flex items-center gap-1 hover:underline"
          >
            {isAr ? "إضافة قراءة" : "Add Reading"}
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {todayGlucose && todayGlucose.length > 0 ? (
            todayGlucose.map((reading, index) => {
              const Icon = getMealIcon(reading.mealContext);
              const contextLabel = reading.mealContext 
                ? (isAr 
                  ? { fasting: "صائم", beforeMeal: "قبل الوجبة", afterMeal: "بعد الوجبة", bedtime: "قبل النوم" }[reading.mealContext]
                  : { fasting: "Fasting", beforeMeal: "Before Meal", afterMeal: "After Meal", bedtime: "Bedtime" }[reading.mealContext])
                : (isAr ? "عام" : "General");
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#1a2e15]/60 border border-[#59f20d]/10 hover:border-[#59f20d]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#59f20d]/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#59f20d]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{contextLabel}</div>
                      <div className="text-xs text-gray-500">{reading.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#59f20d]">{reading.glucoseValue}</div>
                    <div className="text-xs text-gray-500">MG/DL</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{isAr ? "لا توجد قراءات اليوم" : "No readings today"}</p>
              <button 
                onClick={() => setShowGlucoseModal(true)}
                className="mt-3 text-xs text-[#59f20d] hover:underline"
              >
                {isAr ? "أضف قراءة جديدة" : "Add new reading"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insulin & Medicine Tracking */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">{isAr ? "تتبع الإنسولين والأدوية" : "Insulin & Medicine Tracking"}</h2>
          <button 
            onClick={() => setShowMedicationModal(true)}
            className="text-xs font-bold text-[#59f20d] hover:underline"
          >
            {isAr ? "إدارة الأدوية" : "Manage Meds"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {medications && medications.length > 0 ? (
            medications.map((med) => {
              const taken = isMedicationTaken(med._id);
              return (
                <div
                  key={med._id}
                  className={`relative overflow-hidden rounded-3xl p-6 ${
                    taken
                      ? "bg-gradient-to-br from-[#59f20d]/20 to-[#59f20d]/5 border-2 border-[#59f20d]/40"
                      : "bg-[#1a2e15]/60 border-2 border-[#59f20d]/10"
                  }`}
                >
                  <div className="text-4xl mb-3">{med.icon || "💊"}</div>
                  <div className="text-sm font-bold text-white mb-1">{isAr ? med.nameAr : med.name}</div>
                  <div className="text-xs text-gray-400 mb-3">{med.dosage}</div>
                  {taken ? (
                    <button className="w-full px-3 py-2 rounded-full bg-[#59f20d] text-black text-xs font-bold">
                      {isAr ? "تم أخذه ✓" : "Taken ✓"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLogMedication(med._id)}
                      className="w-full px-3 py-2 rounded-full bg-[#1a2e15] border border-[#59f20d]/30 text-[#59f20d] text-xs font-bold hover:bg-[#2a3e25] transition-colors"
                    >
                      {isAr ? "سجّل" : "Log"}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <p className="text-sm">{isAr ? "لا توجد أدوية محفوظة" : "No medications saved"}</p>
              <button 
                onClick={() => setShowMedicationModal(true)}
                className="mt-3 text-xs text-[#59f20d] hover:underline"
              >
                {isAr ? "أضف دواءً جديداً" : "Add medication"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Health Tasks */}
      <div className="rounded-3xl bg-[#1a2e15]/60 border-2 border-[#59f20d]/10 p-6">
        <h2 className="text-xl font-black mb-4">{isAr ? "المهام الصحية اليومية" : "Daily Health Tasks"}</h2>

        <div className="space-y-3">
          {healthTasks && healthTasks.length > 0 ? (
            healthTasks.map((task) => {
              const completed = isTaskCompleted(task._id);
              return (
                <button
                  key={task._id}
                  onClick={() => handleToggleTask(task._id, completed)}
                  className="w-full flex items-center gap-3 text-left hover:bg-[#1a2e15]/40 p-2 rounded-xl transition-colors"
                >
                  {completed ? (
                    <CheckCircle className="w-6 h-6 text-[#59f20d] flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${completed ? "text-white" : "text-gray-500"}`}>
                    {isAr ? task.taskAr : task.task}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {isAr ? "لا توجد مهام محفوظة" : "No tasks saved"}
            </p>
          )}
        </div>
      </div>

      {/* Glucose Modal */}
      {showGlucoseModal && (
        <GlucoseModal 
          isAr={isAr}
          onClose={() => setShowGlucoseModal(false)}
          onSubmit={addGlucoseRecord}
        />
      )}

      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
}

// Glucose Input Modal
function GlucoseModal({ 
  isAr, 
  onClose, 
  onSubmit 
}: { 
  isAr: boolean; 
  onClose: () => void; 
  onSubmit: any;
}) {
  const [value, setValue] = useState("");
  const [mealContext, setMealContext] = useState<"fasting" | "beforeMeal" | "afterMeal" | "bedtime">("fasting");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(Number(value))) {
      toast.error(isAr ? "أدخل قيمة صحيحة" : "Enter valid value");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].substring(0, 5);

      await onSubmit({
        date,
        time,
        recordType: "glucose",
        glucoseValue: Number(value),
        mealContext,
        notes: notes || undefined,
      });

      toast.success(isAr ? "تم حفظ القراءة" : "Reading saved");
      onClose();
    } catch (error) {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1a0a] border-2 border-[#59f20d]/30 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {isAr ? "إضافة قراءة جلوكوز" : "Add Glucose Reading"}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1a2e15] flex items-center justify-center hover:bg-[#2a3e25] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Value Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              {isAr ? "القيمة (mg/dL)" : "Value (mg/dL)"}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#1a2e15] border border-[#59f20d]/20 text-white text-center text-2xl font-bold focus:outline-none focus:border-[#59f20d]/60"
              placeholder="110"
              required
            />
          </div>

          {/* Meal Context */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              {isAr ? "التوقيت" : "Meal Context"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "fasting", labelAr: "صائم", labelEn: "Fasting" },
                { value: "beforeMeal", labelAr: "قبل الوجبة", labelEn: "Before Meal" },
                { value: "afterMeal", labelAr: "بعد الوجبة", labelEn: "After Meal" },
                { value: "bedtime", labelAr: "قبل النوم", labelEn: "Bedtime" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMealContext(option.value as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    mealContext === option.value
                      ? "bg-[#59f20d] text-black"
                      : "bg-[#1a2e15] border border-[#59f20d]/20 text-white hover:border-[#59f20d]/60"
                  }`}
                >
                  {isAr ? option.labelAr : option.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#1a2e15] border border-[#59f20d]/20 text-white focus:outline-none focus:border-[#59f20d]/60 resize-none"
              rows={2}
              placeholder={isAr ? "أي ملاحظات..." : "Any notes..."}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl bg-[#59f20d] text-black font-bold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
          </button>
        </form>
      </div>
    </div>
  );
}
