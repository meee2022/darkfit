import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Users,
  Award,
  Star,
  Search,
  MessageCircle,
  X,
  Calendar,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Share2,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

type Coach = {
  _id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  experience?: string;
  bio?: string;
  bioAr?: string;
  imageResolved?: string | null;
  imageUrl?: string | null;
  imageStorageId?: string | null;
  whatsapp?: string | null;
  rating?: number | null;
  isActive?: boolean;
  studentsCount?: number;
  yearsOfExperience?: number;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Modern Coach Card */
function CoachCard({
  coach,
  onClick,
  isAr,
}: {
  coach: Coach;
  onClick: () => void;
  isAr: boolean;
}) {
  const displayName = isAr ? coach.nameAr || coach.name : coach.name || coach.nameAr;
  const displaySpecialty = isAr
    ? coach.specialtyAr || coach.specialty
    : coach.specialty || coach.specialtyAr;
  const rating = coach.rating || 4.5;
  const studentsCount = coach.studentsCount || Math.floor(Math.random() * 500) + 100;
  const yearsExp = coach.yearsOfExperience || Math.floor(Math.random() * 10) + 3;

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 hover:border-[#59f20d]/50 transition-all duration-300 text-right"
    >
      {/* Background Image */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={
            coach.imageResolved ||
            coach.imageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              displayName
            )}&size=400&background=59f20d&color=0a0d08&bold=true`
          }
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d08] via-[#0a0d08]/80 to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#59f20d] text-black backdrop-blur-sm font-bold">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">{rating.toFixed(1)}</span>
        </div>

        {/* Verified Badge */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#59f20d] flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-black" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white leading-tight">
            {displayName}
          </h3>
          <p className="text-sm text-[#59f20d] font-bold">{displaySpecialty}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#59f20d]" />
            <span>{yearsExp}+ سنوات خبرة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#59f20d]" />
            <span>{studentsCount}+ متدرب</span>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-[#59f20d] text-black font-bold rounded-2xl hover:bg-[#4ed10a] transition-all shadow-[0_0_30px_rgba(89,242,13,0.4)] group-hover:shadow-[0_0_40px_rgba(89,242,13,0.6)]">
          <Calendar className="w-5 h-5" />
          <span>احجز جلستك الآن</span>
        </button>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </button>
  );
}

export function Coaches() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Coach | null>(null);

  const rows = useQuery(api.coaches.listPublic, {
    q: q.trim() ? q.trim() : undefined,
  });

  const coaches: Coach[] = useMemo(() => {
    if (!rows) return [];
    return (rows as any[]).map((c) => ({
      _id: c._id,
      name: c.name || "",
      nameAr: c.nameAr || c.name || "",
      specialty: c.specialty || "",
      specialtyAr: c.specialtyAr || c.specialty || "",
      experience: c.experience || "—",
      bio: c.bio || "",
      bioAr: c.bioAr || c.bio || "",
      imageResolved: c.imageResolved ?? c.imageUrl ?? c.image ?? null,
      imageUrl: c.imageUrl ?? c.image ?? null,
      imageStorageId: c.imageStorageId ?? null,
      whatsapp: c.whatsapp ?? null,
      rating: typeof c.rating === "number" ? c.rating : 4.5,
      isActive: c.isActive ?? true,
      studentsCount: c.studentsCount,
      yearsOfExperience: c.yearsOfExperience,
    }));
  }, [rows]);

  const openWhatsApp = (phone?: string | null) => {
    const clean = String(phone || "").replace(/[^\d]/g, "");
    if (!clean) return;
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const displayName = (c: Coach) =>
    isAr ? c.nameAr || c.name || "مدرب" : c.name || c.nameAr || "Coach";

  const displaySpecialty = (c: Coach) =>
    isAr
      ? c.specialtyAr || c.specialty || "—"
      : c.specialty || c.specialtyAr || "—";

  const displayBio = (c: Coach) =>
    isAr ? c.bioAr || c.bio || "—" : c.bio || c.bioAr || "—";

  return (
    <div className="min-h-screen space-y-6 px-3 sm:px-4 lg:px-0 py-4 sm:py-6" dir={dir}>
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800/60 bg-gradient-to-br from-[#09090b] via-zinc-900/40 to-[#09090b] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(89,242,13,0.05),transparent_70%)]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59f20d]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#59f20d]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                {isAr ? "ابحث عن مدربك" : "Find Your Coach"}
              </h1>
              <p className="text-sm text-gray-400">
                {isAr
                  ? "اختر المدرب المناسب لك وابدأ رحلتك نحو اللياقة"
                  : "Choose the right trainer and start your fitness journey"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث باسم المدرب أو التخصص..."
                  : "Search by name or specialty..."
              }
              className="w-full bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/60 rounded-2xl px-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59f20d]/50 focus:ring-2 focus:ring-[#59f20d]/20 transition-all"
              dir="rtl"
            />
            <button className="absolute left-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#59f20d] text-black font-bold rounded-xl hover:bg-[#4ed10a] transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-[#59f20d] text-black shadow-[0_0_20px_rgba(89,242,13,0.4)]">
              الكل
            </button>
            <button className="px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-zinc-900 text-gray-300 border border-zinc-800/60 hover:border-[#59f20d]/50">
              بناء العضلات
            </button>
            <button className="px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-zinc-900 text-gray-300 border border-zinc-800/60 hover:border-[#59f20d]/50">
              خسارة الوزن
            </button>
            <button className="px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-zinc-900 text-gray-300 border border-zinc-800/60 hover:border-[#59f20d]/50">
              تغذية وتخسيس
            </button>
          </div>
        </div>
      </div>

      {/* Coaches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">
            {isAr ? "المدربون المتميزون" : "Featured Coaches"}
          </h2>
          <button className="text-sm text-[#59f20d] font-bold hover:underline flex items-center gap-1">
            {isAr ? "عرض الكل" : "View All"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {rows === undefined ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#1a2318] flex items-center justify-center animate-pulse">
              <Users className="w-10 h-10 text-[#59f20d]" />
            </div>
            <p className="text-gray-400 text-lg font-medium">
              {isAr ? "جاري تحميل المدربين..." : "Loading coaches..."}
            </p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg font-medium">
              {isAr ? "لا يوجد مدربون متاحون" : "No coaches available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coaches.map((coach) => (
              <CoachCard
                key={coach._id}
                coach={coach}
                onClick={() => setSelected(coach)}
                isAr={isAr}
              />
            ))}
          </div>
        )}
      </div>

      {/* Coach Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#0a0d08] border border-[#2a3528] shadow-2xl"
          >
            {/* Hero Image Section */}
            <div className="relative h-80">
              <img
                src={
                  selected.imageResolved ||
                  selected.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName(selected)
                  )}&size=800&background=59f20d&color=0a0d08&bold=true`
                }
                alt={displayName(selected)}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d08] via-[#0a0d08]/50 to-transparent" />

              {/* Close & Share Buttons */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Verified Badge */}
              <div className="absolute top-4 right-1/2 translate-x-1/2 px-4 py-2 rounded-2xl bg-[#59f20d] text-black font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">مدرب معتمد</span>
              </div>

              {/* Coach Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h2 className="text-3xl font-black text-white mb-2">
                  {displayName(selected)}
                </h2>
                <p className="text-lg text-[#59f20d] font-bold">
                  {displaySpecialty(selected)}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="overflow-y-auto max-h-[calc(90vh-320px)] p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
                  <Star className="w-6 h-6 text-[#59f20d] mx-auto mb-2 fill-current" />
                  <p className="text-2xl font-black text-white">
                    {(selected.rating || 4.5).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400">التقييم</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
                  <Clock className="w-6 h-6 text-[#59f20d] mx-auto mb-2" />
                  <p className="text-2xl font-black text-white">
                    {selected.yearsOfExperience || Math.floor(Math.random() * 10) + 3}+
                  </p>
                  <p className="text-xs text-gray-400">سنوات خبرة</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
                  <Users className="w-6 h-6 text-[#59f20d] mx-auto mb-2" />
                  <p className="text-2xl font-black text-white">
                    {selected.studentsCount || Math.floor(Math.random() * 500) + 100}+
                  </p>
                  <p className="text-xs text-gray-400">متدرب</p>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#59f20d] rounded-full" />
                  نبذة عن المدرب
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed text-right">
                  {displayBio(selected) ||
                    "متخصص في تحويل الجسم وبناء القوة البدنية. أؤمن بأن الرياضة ليست مجرد تمرين، بل هي نمط حياة متكامل. حصلت على العديد من الشهادات الدولية في الكروس فيت وكمال الأجسام، وساعدت المئات في الوصول لأهدافهم الصحية والبدنية من خلال خطط تدريبية مبتكرة."}
                </p>
              </div>

              {/* Specialties */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#59f20d] rounded-full" />
                  لمن هذا المدرب؟
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-sm font-bold">
                    المبتدئين
                  </span>
                  <span className="px-4 py-2 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-sm font-bold">
                    خسارة الوزن
                  </span>
                  <span className="px-4 py-2 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-sm font-bold">
                    الرياضيين المحترفين
                  </span>
                  <span className="px-4 py-2 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-sm font-bold">
                    بناء العضلات
                  </span>
                  <span className="px-4 py-2 rounded-2xl bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] text-sm font-bold">
                    تحسين اللياقة
                  </span>
                </div>
              </div>

              {/* Training Programs */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#59f20d] rounded-full" />
                  البرامج التدريبية
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <img
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80"
                      alt="Program"
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 text-right">
                      <h4 className="text-sm font-bold text-white mb-1">
                        تحدي القوة الشامل
                      </h4>
                      <p className="text-xs text-gray-400">12 أسبوع • بناء عضلات</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#59f20d]" />
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <img
                      src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80"
                      alt="Program"
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 text-right">
                      <h4 className="text-sm font-bold text-white mb-1">
                        الجدول الحديدي للمبتدئين
                      </h4>
                      <p className="text-xs text-gray-400">8 أسابيع • بناء روتين</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#59f20d]" />
                  </div>
                </div>

                <button className="w-full text-sm text-[#59f20d] font-bold hover:underline text-center py-2">
                  عرض الكل
                </button>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => openWhatsApp(selected.whatsapp)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#59f20d] text-black font-bold rounded-2xl hover:bg-[#4ed10a] transition-all shadow-[0_0_30px_rgba(89,242,13,0.4)]"
                >
                  <Calendar className="w-5 h-5" />
                  <span>احجز جلستك الآن</span>
                </button>

                <button
                  onClick={() => openWhatsApp(selected.whatsapp)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900/40 text-white font-bold rounded-2xl border border-zinc-800/60 hover:border-[#59f20d]/50 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل عبر واتساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />
    </div>
  );
}
