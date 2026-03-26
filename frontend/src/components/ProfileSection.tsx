import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";
import { FastingSettings } from "./FastingSettings";
import { BadgesPage } from "./BadgesPage";
import { XPBar } from "./XPBar";
import { RegionSettings } from "./RegionSettings";
import { MapPin, Bell, Settings, User, Dumbbell, Activity, Zap, Edit2, Save, X, Camera, Award, Flame, Trash2, AlertTriangle, HeartPulse, Target, TrendingUp, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProgressPhotos } from "./ProgressPhotos";
import { getNotificationSettings, saveNotificationSettings } from "./NotificationManager";
import { useAuthActions } from "@convex-dev/auth/react";
import { ShareCard } from "./ShareCard";
import { ComparativeAnalytics } from "./ComparativeAnalytics";
import { ReportGenerator } from "./ReportGenerator";
import { SleepTrendsChart } from "./SleepTrendsChart";
import { BodyCompositionChart } from "./BodyCompositionChart";
import { TrainingVolumeChart } from "./TrainingVolumeChart";

export function ProfileSection({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const addWeightLog = useMutation(api.userProgress.addWeightLog);
  const weightHistory = useQuery(api.userProgress.getWeightHistory) || [];
  const streaks = useQuery(api.userProgress.getStreaks);
  const achievements = useQuery(api.userProgress.getAchievements) || [];
  const myPlans = useQuery(api.plans.getMyAssignedPlans, {}) || [];
  const workoutHistory = useQuery(api.exercises.getUserWorkoutHistory) || [];
  const gamificationProgress = useQuery(api.gamification.getProgress);

  const deleteAccount = useMutation(api.userDeletion.deleteAccount);
  const { signOut } = useAuthActions();

  const [activeTab, setActiveTab] = useState<"info" | "plans" | "activity" | "devices" | "photos" | "settings" | "fasting" | "region" | "analytics">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || (isAr ? "فشل حذف الحساب" : "Failed to delete account"));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#59f20d]/30 border-t-[#59f20d] animate-spin" />
          <p className="text-zinc-400 text-sm">
            {isAr ? "جاري تحميل الملف الشخصي..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  const userName = profile.name || (isAr ? "المستخدم" : "User");
  const membershipType = profile.membershipType || (isAr ? "عضو" : "Member");
  const memberSince = profile.memberSince || "2023";
  const goal = profile.goal || (isAr ? "تنشيف" : "Toning");
  const latestWeightLog = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  const currentWeight = latestWeightLog || profile.currentWeight || profile.weight || 0;
  const targetWeight = profile.targetWeight || 0;
  const progress = currentWeight && targetWeight
    ? Math.min(Math.round(((currentWeight - targetWeight) / (currentWeight - targetWeight + 10)) * 100), 100)
    : 0;

  const energy = profile.energy || 0;
  const calories = profile.calories || 0;
  const heartRate = profile.heartRate || 0;

  const maxWH = weightHistory.length ? Math.max(...weightHistory.map((d: any) => d.weight)) : 0;
  const minWH = weightHistory.length ? Math.min(...weightHistory.map((d: any) => d.weight)) : 0;
  const chartHeight = 120;
  const chartWidth = 100; // purely for percentage

  const createPath = () => {
    if (weightHistory.length === 0) return "";
    if (weightHistory.length === 1) return `M 0,${chartHeight / 2} L 100,${chartHeight / 2}`;

    return weightHistory.map((d, i) => {
      const x = (i / (weightHistory.length - 1)) * chartWidth;
      const y = maxWH === minWH ? chartHeight / 2 : chartHeight - ((d.weight - minWH) / (maxWH - minWH)) * chartHeight;
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    }).join(" ");
  };

  const handleEditClick = () => {
    setEditData({
      name: profile.name,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      gender: profile.gender,
      fitnessLevel: profile.fitnessLevel,
      goal: profile.goal,
      currentWeight: profile.currentWeight,
      targetWeight: profile.targetWeight,
      membershipType: profile.membershipType,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: editData.name,
        age: editData.age ? Number(editData.age) : undefined,
        weight: editData.weight ? Number(editData.weight) : undefined,
        height: editData.height ? Number(editData.height) : undefined,
        gender: editData.gender,
        fitnessLevel: editData.fitnessLevel,
        goal: editData.goal,
        currentWeight: editData.currentWeight ? Number(editData.currentWeight) : undefined,
        targetWeight: editData.targetWeight ? Number(editData.targetWeight) : undefined,
        membershipType: editData.membershipType,
      });

      if (editData.currentWeight) {
        await addWeightLog({
          weight: Number(editData.currentWeight),
          date: new Date().toISOString().split("T")[0],
          notes: isAr ? "تحديث من الملف الشخصي" : "Profile update",
        });
      }

      toast.success(isAr ? "تم حفظ التغييرات ✓" : "Changes saved ✓");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || (isAr ? "حدث خطأ" : "Error occurred"));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (activeTab === "info" && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1508] via-[#0d1a0a] to-black pb-20">
        {/* Header */}
        <div className="bg-[#1a2318]/50 backdrop-blur-xl border-b border-[#59f20d]/20 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="p-2 rounded-xl bg-[#1a2318]/80 border border-[#59f20d]/30 hover:border-[#59f20d]/60 transition"
            >
              <X className="w-5 h-5 text-[#59f20d]" />
            </button>

            <h1 className="text-xl font-bold text-white">
              {isAr ? "تعديل الملف الشخصي" : "Edit Profile"}
            </h1>

            <button
              onClick={handleSave}
              className="p-2 rounded-xl bg-[#59f20d] hover:brightness-110 transition"
            >
              <Save className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Name */}
          <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "الاسم" : "Name"}
            </label>
            <input
              type="text"
              value={editData.name || ""}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "العمر" : "Age"}
              </label>
              <input
                type="number"
                value={editData.age || ""}
                onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              />
            </div>

            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "الجنس" : "Gender"}
              </label>
              <select
                value={editData.gender || "male"}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              >
                <option value="male">{isAr ? "ذكر" : "Male"}</option>
                <option value="female">{isAr ? "أنثى" : "Female"}</option>
              </select>
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "الوزن (كجم)" : "Weight (kg)"}
              </label>
              <input
                type="number"
                value={editData.weight || ""}
                onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              />
            </div>

            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "الطول (سم)" : "Height (cm)"}
              </label>
              <input
                type="number"
                value={editData.height || ""}
                onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              />
            </div>
          </div>

          {/* Fitness Level */}
          <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "مستوى اللياقة" : "Fitness Level"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEditData({ ...editData, fitnessLevel: level })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition ${editData.fitnessLevel === level
                    ? "bg-[#59f20d] text-black"
                    : "bg-[#0a0d08] border border-[#59f20d]/30 text-white hover:border-[#59f20d]/60"
                    }`}
                >
                  {isAr
                    ? { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }[level]
                    : level.charAt(0).toUpperCase() + level.slice(1)
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "الهدف" : "Goal"}
            </label>
            <input
              type="text"
              value={editData.goal || ""}
              onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
              placeholder={isAr ? "مثال: تنشيف، ضخامة" : "e.g., Toning, Bulking"}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
            />
          </div>

          {/* Current & Target Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "الوزن الحالي (كجم)" : "Current Weight (kg)"}
              </label>
              <input
                type="number"
                value={editData.currentWeight || ""}
                onChange={(e) => setEditData({ ...editData, currentWeight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              />
            </div>

            <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
              <label className="block text-sm font-bold text-[#59f20d] mb-2">
                {isAr ? "الوزن المستهدف (كجم)" : "Target Weight (kg)"}
              </label>
              <input
                type="number"
                value={editData.targetWeight || ""}
                onChange={(e) => setEditData({ ...editData, targetWeight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
              />
            </div>
          </div>

          {/* Membership Type */}
          <div className="bg-[#1a2318]/60 border-2 border-[#59f20d]/20 rounded-2xl p-4">
            <label className="block text-sm font-bold text-[#59f20d] mb-2">
              {isAr ? "نوع العضوية" : "Membership Type"}
            </label>
            <input
              type="text"
              value={editData.membershipType || ""}
              onChange={(e) => setEditData({ ...editData, membershipType: e.target.value })}
              placeholder={isAr ? "مثال: عضو، عضو سوبر" : "e.g., Member, Super Member"}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0d08] border border-[#59f20d]/30 text-white focus:outline-none focus:border-[#59f20d]"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-4 rounded-2xl bg-[#59f20d] text-black font-bold text-lg hover:brightness-110 transition shadow-lg shadow-[#59f20d]/30"
          >
            {isAr ? "حفظ التغييرات" : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1508] via-[#0d1a0a] to-black pb-20">
      {/* Header */}
      <div className="bg-[#1a2318]/50 backdrop-blur-xl border-b border-[#59f20d]/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button className="p-2 rounded-xl bg-[#1a2318]/80 border border-[#59f20d]/30 hover:border-[#59f20d]/60 transition">
            <Bell className="w-5 h-5 text-[#59f20d]" />
          </button>

          <h1 className="text-xl font-bold text-white">
            {isAr ? "الملف الشخصي" : "Profile"}
          </h1>

          <button
            onClick={handleEditClick}
            className="p-2 rounded-xl bg-[#1a2318]/80 border border-[#59f20d]/30 hover:border-[#59f20d]/60 transition"
          >
            <Edit2 className="w-5 h-5 text-[#59f20d]" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with upload button */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-[#59f20d]/40 overflow-hidden bg-zinc-900">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <label
                htmlFor="profile-photo-upload"
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#59f20d] flex items-center justify-center cursor-pointer shadow-lg hover:brightness-110 transition border-2 border-black"
                title={isAr ? "تغيير الصورة" : "Change photo"}
              >
                <Camera className="w-4 h-4 text-black" />
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // Compress via canvas
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const img = new Image();
                    img.onload = async () => {
                      const canvas = document.createElement("canvas");
                      const maxSize = 400;
                      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                      canvas.width = img.width * scale;
                      canvas.height = img.height * scale;
                      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
                      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                      try {
                        await updateProfile({ profileImage: dataUrl });
                        toast.success(isAr ? "تم تحديث الصورة ✓" : "Photo updated ✓");
                      } catch {
                        toast.error(isAr ? "فشل رفع الصورة" : "Failed to upload photo");
                      }
                    };
                    img.src = ev.target?.result as string;
                  };
                  reader.readAsDataURL(file);
                  // Reset input so same file can be re-selected
                  e.target.value = "";
                }}
              />

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-zinc-800 text-white text-xs font-bold whitespace-nowrap">
                {membershipType}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
              <p className="text-sm text-zinc-400 mb-3">
                {isAr ? `عضو سوبر منذ ${memberSince}` : `Super member since ${memberSince}`}
              </p>
              {streaks && streaks.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  <Flame size={16} className="text-orange-500 animate-pulse" />
                  {streaks.currentStreak} {isAr ? "أيام متتالية" : "Day Streak"}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center -mt-4 pb-2">
            <button 
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[#39ff14] font-black text-sm hover:bg-[#39ff14]/10 hover:border-[#39ff14]/30 transition-all shadow-[0_0_20px_rgba(57,255,20,0.05)]"
            >
                <Share2 className="w-4 h-4" />
                {isAr ? "شارك تقدمك 📊" : "Share Progress 📊"}
            </button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* BMI */}
          {(() => {
            const h = profile.height || 0;
            const w = currentWeight;
            if (!w || !h) return null;
            const bmi = w / (h / 100) ** 2;
            const bmiStr = bmi.toFixed(1);
            const cat = bmi < 18.5 ? (isAr ? "نحيف" : "Underweight") : bmi < 25 ? (isAr ? "طبيعي" : "Normal") : bmi < 30 ? (isAr ? "زائد" : "Overweight") : (isAr ? "سمنة" : "Obese");
            const catColor = bmi < 18.5 ? "text-sky-400" : bmi < 25 ? "text-[#59f20d]" : bmi < 30 ? "text-amber-400" : "text-rose-400";
            return (
              <div className="bg-[#0a0d08] rounded-2xl border border-zinc-800 p-4 text-center hover:border-rose-500/30 transition-colors">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-2xl font-black text-white">{bmiStr}</p>
                <p className={`text-xs font-bold mt-1 ${catColor}`}>{cat}</p>
              </div>
            );
          })()}

          {/* Total Workouts */}
          <div className="bg-[#0a0d08] rounded-2xl border border-zinc-800 p-4 text-center hover:border-[#59f20d]/30 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#59f20d]/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#59f20d]" />
            </div>
            <p className="text-2xl font-black text-white">{workoutHistory.length}</p>
            <p className="text-xs text-zinc-400 font-bold mt-1">{isAr ? "تمرين" : "Workouts"}</p>
          </div>

          {/* Completion % */}
          <div className="bg-[#0a0d08] rounded-2xl border border-zinc-800 p-4 text-center hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{progress}%</p>
            <p className="text-xs text-zinc-400 font-bold mt-1">{isAr ? "الإنجاز" : "Progress"}</p>
          </div>

          {/* Streak */}
          <div className="bg-[#0a0d08] rounded-2xl border border-zinc-800 p-4 text-center hover:border-orange-500/30 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white">{streaks?.currentStreak || 0}</p>
            <p className="text-xs text-zinc-400 font-bold mt-1">{isAr ? "سلسلة أيام" : "Day Streak"}</p>
          </div>
        </div>

        {/* Goal Summary Card */}
        {(currentWeight > 0 && targetWeight > 0) && (
          <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-zinc-400" />
              </div>
              {isAr ? "ملخص الأهداف" : "Goal Summary"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">{isAr ? "الهدف" : "Goal"}</p>
                <p className="text-lg font-bold text-white">{goal}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">{isAr ? "التقدم نحو الهدف" : "Progress"}</p>
                <p className="text-lg font-bold text-white">{progress}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                <div
                  className="h-full bg-[#59f20d] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-zinc-400 mb-1">{isAr ? "الوزن الحالي" : "Current"}</p>
                <p className="text-base font-bold text-white">{currentWeight} {isAr ? "كجم" : "kg"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">{isAr ? "المستهدف" : "Target"}</p>
                <p className="text-base font-bold text-white">{targetWeight} {isAr ? "كجم" : "kg"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {(energy > 0 || calories > 0 || heartRate > 0) && (
          <div className="grid grid-cols-3 gap-4">
            {energy > 0 && (
              <div className="bg-[#0a0d08] backdrop-blur-xl rounded-2xl border border-zinc-800 p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{energy}</p>
                <p className="text-xs text-zinc-400 mt-1">{isAr ? "طاقة" : "Energy"}</p>
              </div>
            )}

            {calories > 0 && (
              <div className="bg-[#0a0d08] backdrop-blur-xl rounded-2xl border border-zinc-800 p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-white">{calories}</p>
                <p className="text-xs text-zinc-400 mt-1">{isAr ? "سعرات" : "Calories"}</p>
              </div>
            )}

            {heartRate > 0 && (
              <div className="bg-[#0a0d08] backdrop-blur-xl rounded-2xl border border-zinc-800 p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{heartRate}</p>
                <p className="text-xs text-zinc-400 mt-1">{isAr ? "نبض" : "Pulse"}</p>
              </div>
            )}
          </div>
        )}

        {/* Full Weight History Line Chart */}
        {weightHistory.length > 0 && (
          <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-6">
              {isAr ? "تطور الوزن عبر الزمن" : "Weight Progress Timeline"}
            </h3>

            <div className="relative h-40 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 120">
                {/* Grid Lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#333" strokeDasharray="2,2" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#333" strokeDasharray="2,2" strokeWidth="0.5" />
                <line x1="0" y1="120" x2="100" y2="120" stroke="#333" strokeDasharray="2,2" strokeWidth="0.5" />

                {/* Line Path */}
                <path
                  d={createPath()}
                  fill="none"
                  stroke="#59f20d"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Data Points */}
                {weightHistory.map((d, i) => {
                  const x = (i / Math.max(1, weightHistory.length - 1)) * 100;
                  const y = maxWH === minWH ? 60 : 120 - ((d.weight - minWH) / (maxWH - minWH)) * 120;
                  return (
                    <g key={d._id} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="2" fill="#000" stroke="#59f20d" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <circle cx={x} cy={y} r="6" fill="transparent" />
                      <text x={x} y={y - 8} fill="#fff" fontSize="5" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between mt-4">
              <span className="text-xs text-zinc-500">{weightHistory[0].date}</span>
              <span className="text-xs text-[#59f20d] font-bold">
                {weightHistory[weightHistory.length - 1].weight} {isAr ? "كجم" : "kg"}
              </span>
              <span className="text-xs text-zinc-500">{weightHistory[weightHistory.length - 1].date}</span>
            </div>
          </div>
        )}

        {/* Achievements Card */}
        <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr ? "الإنجازات" : "Achievements"}
            </h3>
          </div>

          {achievements.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-900/30 rounded-2xl border border-zinc-800">
              {isAr ? "لم تحقق أي إنجازات بعد. استمر في التدريب!" : "No achievements yet. Keep training!"}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {achievements.map((a) => (
                <div key={a._id} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 flex flex-col items-center text-center hover:border-purple-500/50 transition duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white line-clamp-2">{a.achievementId}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === GAMIFICATION: XP Bar === */}
        <XPBar />

        {/* === GAMIFICATION: Badges === */}
        <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6">
          <BadgesPage />
        </div>

        {/* Personal Info Display */}
        <div className="bg-[#0a0d08] backdrop-blur-xl rounded-3xl border-2 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">{isAr ? "المعلومات الشخصية" : "Personal Information"}</h3>
            <button
              onClick={() => onNavigate?.("account")}
              className="p-2 rounded-xl bg-[#59f20d] text-black hover:bg-[#4ed10a] transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {profile.age && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-2">{isAr ? "العمر" : "Age"}</p>
                <p className="text-xl font-bold text-white">{profile.age} {isAr ? "سنة" : "years"}</p>
              </div>
            )}
            {profile.gender && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-2">{isAr ? "الجنس" : "Gender"}</p>
                <p className="text-xl font-bold text-white">{profile.gender === "male" ? (isAr ? "ذكر" : "Male") : (isAr ? "أنثى" : "Female")}</p>
              </div>
            )}
            {profile.weight && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-2">{isAr ? "الوزن" : "Weight"}</p>
                <p className="text-xl font-bold text-white">{profile.weight} {isAr ? "كجم" : "kg"}</p>
              </div>
            )}
            {profile.height && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-2">{isAr ? "الطول" : "Height"}</p>
                <p className="text-xl font-bold text-white">{profile.height} {isAr ? "سم" : "cm"}</p>
              </div>
            )}
            {profile.fitnessLevel && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 col-span-2">
                <p className="text-xs text-zinc-400 mb-2">{isAr ? "المستوى" : "Fitness Level"}</p>
                <p className="text-xl font-bold text-white">
                  {isAr
                    ? { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" }[profile.fitnessLevel] || profile.fitnessLevel
                    : profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "info"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <User className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "المعلومات الشخصية" : "Personal Info"}</p>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "plans"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Dumbbell className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "خطط التدريب الخاصة بي" : "My Training Plans"}</p>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "activity"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Activity className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "سجل النشاط" : "Activity Log"}</p>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "settings"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Bell className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "الإشعارات" : "Notifications"}</p>
          </button>

          <button
            onClick={() => setActiveTab("fasting")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "fasting"
              ? "bg-amber-500/20 border-amber-500 text-white"
              : "bg-[#1a2318]/50 border-amber-500/30 text-zinc-400 hover:border-amber-500/60"
              }`}
          >
            <span className="text-2xl mx-auto mb-2 block text-center">🌙</span>
            <p className="text-sm font-bold">{isAr ? "الصيام" : "Fasting"}</p>
          </button>

          <button
            onClick={() => setActiveTab("region")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "region"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <MapPin className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "المنطقة" : "Region"}</p>
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "devices"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "الأجهزة المتصلة" : "Connected Devices"}</p>
          </button>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "analytics"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Activity className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "التحليلات والتقارير" : "Analytics & Reports"}</p>
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`p-4 rounded-2xl border-2 transition-all ${activeTab === "photos"
              ? "bg-[#59f20d]/20 border-[#59f20d] text-white"
              : "bg-[#1a2318]/50 border-[#59f20d]/30 text-zinc-400 hover:border-[#59f20d]/60"
              }`}
          >
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-bold">{isAr ? "صور التطور" : "Photos"}</p>
          </button>
        </div>

        {activeTab === "photos" && (
          <div className="mt-8 animate-fadeIn">
            <ProgressPhotos />
          </div>
        )}

        {activeTab === "fasting" && <FastingSettings />}
        {activeTab === "region" && <RegionSettings />}

        {/* Tab Content Placeholder */}
        {activeTab === "activity" && (
          <div className="mt-8 animate-fadeIn space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-6">
              {isAr ? "الربط الصحي وسجل النشاط" : "Health Sync & Activity Lab"}
            </h2>
            
            {/* Health Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apple Health Card */}
              <div className="bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 relative flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500"><path d="M12 2A2 2 0 0 1 14 0c0 1.1-.9 2-2 2 .05-.03 0 0 0 0zm4.28 11.23c-2.31 0-3.32-1.57-5.35-1.57-1.92 0-3.6 1.48-4.66 3.19C4.54 17.5 7.15 24 9.17 24c1.19 0 1.83-.87 3.32-.87 1.44 0 2.05.87 3.31.87 2.14 0 4.2-5.4 5.37-8.15-2.09-.89-3.05-2.9-2.61-4.62zm-.89-2.97c1.37-1.35 1.76-3.38 1.4-4.87-1.53.2-3.37 1.25-4.52 2.62-1.25 1.5-1.95 3.44-1.6 4.97 1.57.17 3.42-.92 4.72-2.72z" /></svg>
                    {isAr ? "مزامنة Apple Health" : "Apple Health"}
                  </h3>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">{isAr ? "غير متصل" : "Offline"}</span>
                </div>
                
                <div className="flex items-center gap-5 mt-auto">
                  <div className="relative w-[88px] h-[88px] shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" strokeDasharray="251 251" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white">0</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{isAr ? "خطوات اليوم" : "Today's Steps"}</p>
                    <p className="text-xs font-medium text-zinc-500 mb-4 leading-relaxed">{isAr ? "اربط التطبيق لسحب بيانات المشي والجري تلقائياً." : "Connect to auto-sync walking and running data."}</p>
                    <button className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95">
                      {isAr ? "ربط الآن" : "Connect Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Fit Card */}
              <div className="bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 relative flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#4285F4]"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /></svg>
                    {isAr ? "مزامنة Google Fit" : "Google Fit"}
                  </h3>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">{isAr ? "غير متصل" : "Offline"}</span>
                </div>
                
                <div className="flex items-center gap-5 mt-auto">
                  <div className="relative w-[88px] h-[88px] shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#4285F4" strokeWidth="6" strokeLinecap="round" strokeDasharray="251 251" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white">0</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{isAr ? "النشاط اليومي والسعرات" : "Activity & Calories"}</p>
                    <p className="text-xs font-medium text-zinc-500 mb-4 leading-relaxed">{isAr ? "اسحب المسافة المقطوعة من نظام أندرويد." : "Sync distance and calories from local Android."}</p>
                    <button className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                      {isAr ? "ربط الآن" : "Connect Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Info Card */}
            <div className="bg-[#111] border border-[#59f20d]/20 rounded-[2rem] p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#59f20d]/10 flex items-center justify-center mb-5">
                <Activity className="w-8 h-8 text-[#59f20d]" />
              </div>
              <h3 className="text-lg font-black text-white mb-3">
                {isAr ? "كيف تعمل تتبع الخطوات التلقائية؟" : "How does automated tracking work?"}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-zinc-400 max-w-xl mx-auto">
                {isAr 
                  ? "لا تحتاج إلى إضافة تطبيقات المشي الخاصة بشكل فردي (مثل Pacer). كل ما عليك هو إعطاء الصلاحية لمنصة الصحة المركزية في جهازك، وسيقوم DarkFit بسحب مجهودك من جميع التطبيقات والساعات الذكية التي تستخدمها لتضاف إلى تحليلات المدرب الذكي!" 
                  : "You don't need to link individual walking apps (like Pedometer). Simply grant permission to your device's core Health Center, and DarkFit will seamlessly aggregate your effort across all tracker apps and smartwatches you use!"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="mt-8 animate-fadeIn">
            {myPlans.length === 0 ? (
              <div className="bg-[#0a0f0a] rounded-3xl border border-green-900 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Dumbbell className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {isAr ? "لا توجد خطط تدريب حتى الآن" : "No Training Plans Yet"}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                  {isAr
                    ? "ابحث عن خطة تناسب أهدافك أو اطلب من مدربك إرسال خطة جديدة."
                    : "Find a plan that fits your goals or ask your coach to send one."}
                </p>
                <button
                  onClick={() => onNavigate?.("plans")}
                  className="px-6 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition"
                >
                  {isAr ? "استعرض الخطط المتاحة" : "Browse Available Plans"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myPlans.map((plan: any) => {
                  const progress = Math.min(Math.floor(Math.random() * 60) + 20, 100); // Mock progress for visualization
                  return (
                    <div key={plan._id} className="bg-[#0a0f0a] rounded-3xl border border-green-900 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:border-green-500/50 transition duration-300">

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold">
                            {isAr ? "المستوى" : "Level"}: {plan.level === 'beginner' && isAr ? 'مبتدئ' : plan.level === 'intermediate' && isAr ? 'متوسط' : plan.level === 'advanced' && isAr ? 'متقدم' : plan.level || 'غير محدد'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-bold">
                            {plan.daysPerWeek || "3"} {isAr ? "أيام بالأسبوع" : "Days / Week"}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 max-w-lg mb-4">
                          {plan.notes || (isAr ? "خطة تدريب مخصصة لبناء القوة وتحسين اللياقة." : "Custom training plan built to gain strength and improve fitness.")}
                        </p>

                        <div className="w-full max-w-sm">
                          <div className="flex justify-between text-xs text-zinc-500 font-bold mb-1.5">
                            <span>{isAr ? "التقدم الإجمالي" : "Overall Progress"}</span>
                            <span className="text-green-500">{progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-3 md:items-end w-full md:w-auto">
                        <button
                          onClick={() => onNavigate?.("plans")}
                          className="w-full md:w-auto px-6 py-3 bg-[#1a2e15] text-green-500 hover:bg-green-500 hover:text-black font-bold text-sm rounded-xl transition duration-300 border border-green-500/30 whitespace-nowrap"
                        >
                          {isAr ? "عرض التفاصيل" : "View Details"}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === "devices" && (
          <div className="mt-8 animate-fadeIn max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">
              {isAr ? "الأجهزة والتطبيقات المتصلة" : "Connected Apps & Devices"}
            </h2>

            {[
              {
                id: "apple_health", name: "Apple Health", nameAr: "أبل هيلث", desc: "مزامنة خطواتك وضربات قلبك تلقائياً",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white"><path d="M12 2A2 2 0 0 1 14 0c0 1.1-.9 2-2 2 .05-.03 0 0 0 0zm4.28 11.23c-2.31 0-3.32-1.57-5.35-1.57-1.92 0-3.6 1.48-4.66 3.19C4.54 17.5 7.15 24 9.17 24c1.19 0 1.83-.87 3.32-.87 1.44 0 2.05.87 3.31.87 2.14 0 4.2-5.4 5.37-8.15-2.09-.89-3.05-2.9-2.61-4.62zm-.89-2.97c1.37-1.35 1.76-3.38 1.4-4.87-1.53.2-3.37 1.25-4.52 2.62-1.25 1.5-1.95 3.44-1.6 4.97 1.57.17 3.42-.92 4.72-2.72z" /></svg>
              },
              {
                id: "google_fit", name: "Google Fit", nameAr: "جوجل فيت", desc: "تتبع نشاطك اليومي والسعرات الحرارية",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#4285F4]"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /></svg>
              },
              {
                id: "fitbit", name: "Fitbit", nameAr: "Fitbit", desc: "مزامنة تمارينك وبيانات النوم",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#00B0B9]"><path d="M20.25 10.96a2.21 2.21 0 1 1 0 4.41 2.21 2.21 0 0 1 0-4.41zm-4.42-3.14a2.76 2.76 0 1 1 0 5.51 2.76 2.76 0 0 1 0-5.51zm0 6.61a2.76 2.76 0 1 1 0 5.52 2.76 2.76 0 0 1 0-5.52zm-4.41-10.45A3.3 3.3 0 1 1 11.45 10a3.3 3.3 0 0 1-3.3-3.3zm0 7.15A3.3 3.3 0 1 1 11.45 15a3.3 3.3 0 0 1-3.3-3.3zm0 7.16a3.3 3.3 0 1 1 0 6.61 3.3 3.3 0 0 1 0-6.61zm-4.44-10.44a3.86 3.86 0 1 1 0 7.72 3.86 3.86 0 0 1 0-7.72z" /></svg>
              },
              {
                id: "garmin", name: "Garmin", nameAr: "Garmin", desc: "نقل بيانات الجري والسباحة والقلب",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white"><path d="M12 0l12 11.66-3.8 3.66L12 7.82l-8.2 7.5L0 11.66zM4.75 14L12 21l7.25-7-7.25-6.75z" /></svg>
              },
              {
                id: "samsung_health", name: "Samsung Health", nameAr: "Samsung Health", desc: "مزامنة يومية لنشاطك وتقدمك",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-black"><circle cx="12" cy="12" r="10" fill="#1428A0" /><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4.5-3v6M10 12h5" stroke="#fff" strokeWidth="2" fill="none" /></svg>
              }
            ].map(dev => {
              const acts = profile.connectedDevices || [];
              const isConnected = acts.includes(dev.id);

              return (
                <div key={dev.id} className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-5 flex items-center justify-between gap-4 transition hover:border-green-500/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center p-2 border border-zinc-800 shadow-md">
                      {dev.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base md:text-lg">{isAr ? dev.nameAr : dev.name}</h4>
                      <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{isAr ? dev.desc : dev.desc}</p>

                      {isConnected && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-xs text-green-500 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          {isAr ? "متصل - جاري المزامنة" : "Connected - Syncing"}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        let newArr = [...acts];
                        if (isConnected) newArr = newArr.filter(x => x !== dev.id);
                        else newArr.push(dev.id);
                        await updateProfile({ connectedDevices: newArr });
                        if (isConnected) toast.info(isAr ? "تم إلغاء الربط" : "Disconnected");
                        else toast.success(isAr ? "تم الربط بنجاح! سيتم مزامنة بياناتك قريباً" : "Connected successfully! Data will sync soon");
                      } catch (e) { toast.error("Error"); }
                    }}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isConnected ? 'bg-[#59f20d]' : 'bg-zinc-800'
                      }`}
                  >
                    <span className={`${isConnected ? (isAr ? '-translate-x-7' : 'translate-x-7') : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
              );
            })}

            <div className="text-center mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <p className="text-xs text-green-500">
                * {isAr ? "الربط الكامل مع الأجهزة سيكون متاحاً في التحديث القادم" : "Full device integration will be available in the next update"}
              </p>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="mt-8 animate-fadeIn max-w-3xl mx-auto">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-4 md:p-6 text-center shadow-lg">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
                <p className="text-xl md:text-3xl font-black text-white">{workoutHistory.length}</p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 mt-1">{isAr ? "تمارين مكتملة" : "Workouts"}</p>
              </div>
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-4 md:p-6 text-center shadow-lg">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
                <p className="text-xl md:text-3xl font-black text-white">
                  {workoutHistory.reduce((acc: number, curr: any) => acc + (curr.caloriesBurned || 0), 0)}
                </p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 mt-1">{isAr ? "سعرة محروقة" : "Kcal Burned"}</p>
              </div>
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-4 md:p-6 text-center shadow-lg">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
                </div>
                <p className="text-sm md:text-lg font-bold text-white leading-tight flex items-center justify-center h-7 md:h-9">
                  {
                    (() => {
                      if (!workoutHistory.length) return "-";
                      const counts: Record<string, number> = {};
                      workoutHistory.forEach((w: any) => {
                        const m = isAr ? w.muscleGroupAr : w.muscleGroup;
                        counts[m] = (counts[m] || 0) + 1;
                      });
                      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
                    })()
                  }
                </p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 mt-1">{isAr ? "أكثر عضلة" : "Top Muscle"}</p>
              </div>
            </div>

            {/* List */}
            {workoutHistory.length === 0 ? (
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-12 text-center text-zinc-400">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-green-900/50" />
                <p className="text-lg font-bold mb-2">{isAr ? "لم تسجل أي نشاط بعد 💪" : "No activity logged yet 💪"}</p>
                <p className="text-sm text-zinc-500">{isAr ? "ابدأ التمرين الآن وسجل تقدمك هنا!" : "Start working out and log your progress here!"}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {
                  Object.entries(
                    workoutHistory.reduce((acc: any, w: any) => {
                      const d = new Date(w.date || w._creationTime);
                      const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(w);
                      return acc;
                    }, {})
                  ).sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([dateStr, logs]: any) => {
                    const d = new Date(dateStr);
                    const today = new Date();
                    const yest = new Date(); yest.setDate(yest.getDate() - 1);
                    let label = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                    if (d.toDateString() === today.toDateString()) label = isAr ? "اليوم" : "Today";
                    if (d.toDateString() === yest.toDateString()) label = isAr ? "أمس" : "Yesterday";

                    return (
                      <div key={dateStr}>
                        <h3 className="text-sm font-bold text-zinc-500 mb-4 px-2">{label}</h3>
                        <div className="space-y-3">
                          {logs.map((log: any) => (
                            <div key={log._id} className="bg-[#0a0f0a] border border-green-900/50 hover:border-green-500/50 transition duration-300 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                  <Dumbbell className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-base md:text-lg">{isAr ? log.exerciseNameAr : log.exerciseNameEn}</h4>
                                  <div className="flex items-center gap-3 mt-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 whitespace-nowrap">
                                      {isAr ? log.muscleGroupAr : log.muscleGroup}
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                                      {log.sets} {isAr ? "مجموعات" : "Sets"} × {log.reps && log.reps.length > 0 ? log.reps[0] : 12} {isAr ? "تكرار" : "Reps"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-zinc-900/50 sm:bg-transparent rounded-2xl p-3 sm:p-0">
                                <span className="text-sm font-black text-green-500">
                                  {log.caloriesBurned} <span className="text-[10px] text-green-500/70">{isAr ? "سعرة" : "kcal"}</span>
                                </span>
                                <span className="text-xs font-semibold text-zinc-500 mt-1">
                                  {new Date(log._creationTime).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="mt-8 animate-fadeIn space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-white">{isAr ? "إعدادات الإشعارات" : "Notification Settings"}</h2>
            
            {/* Master Toggles */}
            <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">
                {isAr ? "التنبيهات" : "Alerts"}
              </h3>
              {[
                { key: "workout", icon: "💪", label: isAr ? "تذكير التمرين اليومي" : "Daily Workout Reminder", desc: isAr ? "تذكيرك بموعد تمرينك المحدد" : "Remind you of your scheduled workout" },
                { key: "meals", icon: "🍽️", label: isAr ? "تذكير الوجبات" : "Meal Reminders", desc: isAr ? "تذكيرك بمواعيد الوجبات (فطور، غداء، سناك، عشاء)" : "Remind you of meal times (breakfast, lunch, snack, dinner)" },
                { key: "water", icon: "💧", label: isAr ? "تذكير شرب الماء" : "Water Reminders", desc: isAr ? "تذكيرك بشرب الماء كل ساعتين (8 ص — 10 م)" : "Reminders to drink water every 2 hours (8 AM — 10 PM)" },
              ].map((s) => {
                const settings = getNotificationSettings();
                return (
                  <div key={s.key} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <h4 className="font-bold text-white mb-0.5">{s.label}</h4>
                        <p className="text-xs text-zinc-500">{s.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const current = getNotificationSettings();
                        saveNotificationSettings({ [s.key]: !(current as any)[s.key] });
                        setActiveTab("settings");
                        toast.success(isAr ? "تم تحديث الإعدادات" : "Settings updated");
                      }}
                      className={`w-14 h-7 rounded-full transition-colors relative shrink-0 ${(settings as any)[s.key] ? "bg-[#59f20d]" : "bg-zinc-800"}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${(settings as any)[s.key] ? "left-8" : "left-1"}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Workout Time */}
            {getNotificationSettings().workout && (
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
                  {isAr ? "⏰ وقت التمرين" : "⏰ Workout Time"}
                </h3>
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{isAr ? "وقت تذكير التمرين" : "Workout Reminder Time"}</span>
                  <input
                    type="time"
                    value={getNotificationSettings().workoutTime}
                    onChange={(e) => {
                      saveNotificationSettings({ workoutTime: e.target.value });
                      setActiveTab("settings");
                    }}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#59f20d] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Meal Times Configuration */}
            {getNotificationSettings().meals && (
              <div className="bg-[#0a0f0a] border border-green-900 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
                  {isAr ? "🍴 مواعيد الوجبات" : "🍴 Meal Schedule"}
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "breakfastTime", icon: "🍳", label: isAr ? "الفطور" : "Breakfast" },
                    { key: "lunchTime", icon: "🥗", label: isAr ? "الغداء" : "Lunch" },
                    { key: "snackTime", icon: "🥜", label: isAr ? "السناك" : "Snack" },
                    { key: "dinnerTime", icon: "🍽️", label: isAr ? "العشاء" : "Dinner" },
                  ].map((meal) => (
                    <div key={meal.key} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="text-lg">{meal.icon}</span>
                        {meal.label}
                      </span>
                      <input
                        type="time"
                        value={(getNotificationSettings() as any)[meal.key]}
                        onChange={(e) => {
                          saveNotificationSettings({ [meal.key]: e.target.value } as any);
                          setActiveTab("settings");
                        }}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#59f20d] focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-[#111] border border-[#59f20d]/20 rounded-2xl p-5 flex items-start gap-3">
              <Bell className="w-5 h-5 text-[#59f20d] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {isAr
                    ? "الإشعارات تظهر في زر الجرس 🔔 بالصفحة الرئيسية. سيتم تذكيرك بالوجبات والماء والتمرين حسب المواعيد المحددة أعلاه. يمكنك إغلاقها أو فتحها في أي وقت."
                    : "Notifications appear in the bell icon 🔔 on the Dashboard. You'll be reminded about meals, water, and workouts based on the schedule above. Toggle them on or off anytime."}
                </p>
              </div>
            </div>


          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="mt-8 animate-fadeIn space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-white px-2">
              {isAr ? "التحليلات المتقدمة" : "Advanced Analytics"}
            </h2>
            
            <ComparativeAnalytics />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BodyCompositionChart />
              <SleepTrendsChart />
            </div>
            
            <TrainingVolumeChart />
            
            <div className="pt-6">
              <ReportGenerator />
            </div>
          </div>
        )}

        {activeTab !== "info" && activeTab !== "photos" && activeTab !== "plans" && activeTab !== "devices" && activeTab !== "activity" && activeTab !== "settings" && activeTab !== "analytics" && (
          <div className="bg-gradient-to-br from-[#1a2318]/90 to-[#0d1a0a]/90 backdrop-blur-xl rounded-3xl border-2 border-[#59f20d]/30 p-8 text-center mt-8">
            <p className="text-zinc-400">
              {isAr ? "قريباً..." : "Coming soon..."}
            </p>
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
                titleAr: "إنجازاتي الشهرية",
                stats: [
                    { 
                        labelAr: "الوزن", 
                        labelEn: "Weight", 
                        value: currentWeight, 
                        unit: isAr ? " كجم" : " kg", 
                        change: weightHistory.length > 1 ? (weightHistory[0].weight - currentWeight).toFixed(1) : undefined 
                    },
                    { 
                        labelAr: "تمارين", 
                        labelEn: "Workouts", 
                        value: workoutHistory.length 
                    },
                    { 
                        labelAr: "أطول سلسلة", 
                        labelEn: "Longest Streak", 
                        value: gamificationProgress?.longestStreak || 0 
                    },
                    { 
                        labelAr: "المستوى", 
                        labelEn: "Level", 
                        value: gamificationProgress?.level || 1,
                        unit: ` - ${(gamificationProgress as any)?.tierName || (isAr ? "رياضي" : "Athlete")}`
                    },
                    { 
                        labelAr: "أرقام قياسية", 
                        labelEn: "Personal Records", 
                        value: (gamificationProgress?.badges || []).filter((b: any) => b.category === "workout").length 
                    }
                ]
            }}
        />
      )}
    </div>
  );
}
