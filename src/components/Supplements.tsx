// src/components/Supplements.tsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Search,
  Filter,
  X,
  ExternalLink,
  Pill,
  ShieldAlert,
  Sparkles,
  Star,
  ShoppingCart,
  Heart,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

type EvidenceLevel = "strong" | "moderate" | "limited";
type SupplementCategory = "performance" | "health" | "recovery";

type RefLink = { title: string; url: string; source?: string };

type Supplement = {
  _id?: any;
  id?: string;
  category: SupplementCategory;
  tags: string[];
  name: { ar: string; en: string };
  brief: { ar: string; en: string };
  function: { ar: string; en: string };
  benefits: { ar: string[]; en: string[] };
  typicalUse: { ar: string; en: string };
  cautions: { ar: string[]; en: string[] };
  evidence: EvidenceLevel;
  refs: RefLink[];
  imageUrl?: string;
  imageStorageId?: any;
  imageResolved?: string;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function evidenceBadge(level: EvidenceLevel, isAr: boolean) {
  const map: Record<EvidenceLevel, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    strong: {
      label: isAr ? "دليل قوي" : "Strong Evidence",
      bg: "bg-[#59f20d]/20",
      text: "text-[#59f20d]",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    moderate: {
      label: isAr ? "دليل متوسط" : "Moderate Evidence",
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    limited: {
      label: isAr ? "دليل محدود" : "Limited Evidence",
      bg: "bg-slate-500/20",
      text: "text-slate-400",
      icon: <Info className="w-4 h-4" />,
    },
  };
  return map[level];
}

function catLabel(cat: SupplementCategory, isAr: boolean) {
  if (cat === "performance") return isAr ? "بناء العضلات" : "Muscle Building";
  if (cat === "health") return isAr ? "الصحة والفيتامينات" : "Health & Vitamins";
  return isAr ? "التعافي" : "Recovery";
}

function catIcon(cat: SupplementCategory) {
  if (cat === "performance") return <TrendingUp className="w-4 h-4" />;
  if (cat === "health") return <Heart className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function localImageFallback(title: string) {
  const s = slugify(title);
  return `/supplements/${s}.jpg`;
}

/** Modern Product Card Component */
function ProductCard({
  supplement,
  onClick,
  language,
  tr,
}: {
  supplement: Supplement;
  onClick: () => void;
  language: string;
  tr: (k: string, fb: string) => string;
}) {
  const isAr = language === "ar";
  const name = isAr ? supplement.name.ar : supplement.name.en;
  const brief = isAr ? supplement.brief.ar : supplement.brief.en;
  const badge = evidenceBadge(supplement.evidence, isAr);

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 hover:border-[#59f20d]/50 transition-all duration-300 hover:scale-[1.02]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-[#0a0d08]">
        <img
          src={
            supplement.imageResolved ||
            supplement.imageUrl ||
            localImageFallback(supplement.name.en)
          }
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            const currentSrc = e.currentTarget.src;
            if (currentSrc.endsWith('.jpg')) {
                e.currentTarget.src = currentSrc.replace('.jpg', '.png');
            } else {
                e.currentTarget.src = "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80";
            }
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

        {/* Evidence Badge */}
        <div className="absolute top-3 left-3">
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl border", badge.bg, badge.text, "border-white/10")}>
            {badge.icon}
            <span className="text-xs font-bold">{badge.label}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className={`absolute top-3 ${isAr ? "right-3" : "right-3"}`}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl bg-[#59f20d]/20 border border-[#59f20d]/30 text-[#59f20d]">
            {catIcon(supplement.category)}
            <span className="text-xs font-bold">{catLabel(supplement.category, isAr)}</span>
          </div>
        </div>

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-[#59f20d]/20 hover:border-[#59f20d] transition-all"
        >
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white leading-tight line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
            {brief}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(supplement.tags || []).slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-xl bg-zinc-800/80 text-gray-300 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl bg-[#59f20d] text-black font-bold hover:bg-[#4ed10a] transition-all">
            <span className="text-sm">{isAr ? "عرض التفاصيل" : "View Details"}</span>
            <ChevronRight className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </button>
  );
}

/** Section Component for Detail Modal */
function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <div className="text-[#59f20d]">{icon}</div>}
        <h3 className="text-base font-black text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function Supplements() {
  const { t, language, dir } = useLanguage();

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const isRTL = dir === "rtl";
  const [activeCat, setActiveCat] = useState<SupplementCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Supplement | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceLevel | "all">("all");

  const rows = useQuery(api.supplements.listPublic, {
    q: query.trim() ? query.trim() : undefined,
    category: activeCat === "all" ? undefined : (activeCat as any),
    evidence: evidenceFilter === "all" ? undefined : (evidenceFilter as any),
  }) as Supplement[] | undefined;

  const seed = useMutation(api.supplements.seedSampleSupplements);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((s) => s.isActive !== false);
  }, [rows]);

  return (
    <div className="min-h-screen space-y-6 px-3 sm:px-4 lg:px-0 py-4 sm:py-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800/60 bg-gradient-to-br from-[#09090b] via-zinc-900/40 to-[#09090b] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(89,242,13,0.05),transparent_70%)]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#59f20d]/20 flex items-center justify-center">
              <Pill className="w-6 h-6 text-[#59f20d]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                {isRTL ? "متجر المكملات" : "Supplements Store"}
              </h1>
              <p className="text-sm text-gray-400">
                {isRTL ? "دليلك الشامل للمكملات الغذائية المدعومة علميًا" : "Your comprehensive guide to scientifically supported dietary supplements"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRTL ? "ابحث عن المكمل الغذائي المثالي..." : "Search for the perfect supplement..."}
              className="w-full bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/60 rounded-2xl px-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59f20d]/50 focus:ring-2 focus:ring-[#59f20d]/20 transition-all"
              dir={isRTL ? "rtl" : "ltr"}
            />
            <button className="absolute left-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#59f20d] text-black font-bold rounded-xl hover:bg-[#4ed10a] transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide" dir={isRTL ? "rtl" : "ltr"}>
            <button
              onClick={() => setActiveCat("all")}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all",
                activeCat === "all"
                  ? "bg-[#59f20d] text-black shadow-[0_0_20px_rgba(89,242,13,0.4)]"
                  : "bg-zinc-900 text-gray-300 border border-zinc-800/60 hover:border-[#59f20d]/50"
              )}
            >
              {isRTL ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setActiveCat("performance")}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2",
                activeCat === "performance"
                  ? "bg-[#59f20d] text-black shadow-[0_0_20px_rgba(89,242,13,0.4)]"
                  : "bg-[#1a2318] text-gray-300 border border-[#2a3528] hover:border-[#59f20d]/50"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              {catLabel("performance", isRTL)}
            </button>
            <button
              onClick={() => setActiveCat("health")}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2",
                activeCat === "health"
                  ? "bg-[#59f20d] text-black shadow-[0_0_20px_rgba(89,242,13,0.4)]"
                  : "bg-[#1a2318] text-gray-300 border border-[#2a3528] hover:border-[#59f20d]/50"
              )}
            >
              <Heart className="w-4 h-4" />
              {catLabel("health", isRTL)}
            </button>
            <button
              onClick={() => setActiveCat("recovery")}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2",
                activeCat === "recovery"
                  ? "bg-[#59f20d] text-black shadow-[0_0_20px_rgba(89,242,13,0.4)]"
                  : "bg-zinc-900 text-gray-300 border border-zinc-800/60 hover:border-[#59f20d]/50"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {catLabel("recovery", isRTL)}
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
            <Pill className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg font-medium">
            {isRTL ? "لا توجد مكملات متاحة" : "No supplements available"}
          </p>
          {rows === undefined && (
            <button
              onClick={() => seed({})}
              className="px-6 py-3 bg-[#59f20d] text-black font-bold rounded-2xl hover:bg-[#4ed10a] transition-all"
            >
              {isRTL ? "إضافة بيانات تجريبية" : "Seed Sample Data"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sup) => (
            <ProductCard
              key={sup._id?.toString() || sup.id}
              supplement={sup}
              onClick={() => setSelected(sup)}
              language={language}
              tr={tr}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#09090b] border border-zinc-800/60 shadow-2xl animate-slide-up"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-800/60 p-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">
                {language === "ar" ? selected.name.ar : selected.name.en}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full bg-[#1a2318] hover:bg-[#2a3528] flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-hide">
              {/* Mobile Brief Header - Only visible on small screens to give info fast */}
              <div className="md:hidden p-5 bg-[#59f20d]/5 border-b border-[#59f20d]/10">
                <p className="text-base text-[#59f20d] font-bold leading-relaxed text-right">
                  {language === "ar" ? selected.brief.ar : selected.brief.en}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Left Column - Image & Quick Badges */}
                <div className="md:col-span-2 bg-zinc-900/20 p-4 sm:p-6 space-y-4 border-b md:border-b-0 md:border-l border-zinc-800/40">
                  <div className="relative group rounded-3xl overflow-hidden border border-zinc-800/60 shadow-xl">
                    <img
                      src={
                        selected.imageResolved ||
                        selected.imageUrl ||
                        localImageFallback(selected.name.en)
                      }
                      alt={language === "ar" ? selected.name.ar : selected.name.en}
                      className="w-full h-32 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                         const currentSrc = e.currentTarget.src;
                         if (currentSrc.endsWith('.jpg')) {
                            e.currentTarget.src = currentSrc.replace('.jpg', '.png');
                         } else {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80";
                         }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Compact Badge Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const badge = evidenceBadge(selected.evidence, isRTL);
                      return (
                        <div className={cn("flex flex-col gap-0.5 p-2 rounded-xl border border-white/5", badge.bg)}>
                          <div className={cn("flex items-center gap-1.5", badge.text)}>
                            {badge.icon}
                            <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{isRTL ? "الدليل" : "Evidence"}</span>
                          </div>
                          <p className={cn("text-[11px] font-black", badge.text)}>{badge.label}</p>
                        </div>
                      );
                    })()}

                    <div className="flex flex-col gap-0.5 p-2 rounded-xl bg-[#59f20d]/5 border border-[#59f20d]/10">
                      <div className="flex items-center gap-1.5 text-[#59f20d]">
                        {catIcon(selected.category)}
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{isRTL ? "التصنيف" : "Category"}</span>
                      </div>
                      <p className="text-[11px] font-black text-[#59f20d]">
                        {catLabel(selected.category, isRTL)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="md:col-span-3 p-5 sm:p-8 space-y-6 text-right bg-gradient-to-b from-transparent to-black/20" dir={language === "ar" ? "rtl" : "ltr"}>
                  {/* Desktop Brief introduction */}
                  <div className="hidden md:block space-y-2 border-b border-zinc-800/40 pb-6">
                    <p className="text-lg text-[#59f20d] font-bold leading-relaxed">
                      {language === "ar" ? selected.brief.ar : selected.brief.en}
                    </p>
                  </div>

                  <Section
                    title={isRTL ? "آلية العمل" : "Mechanism of Action"}
                    icon={<Info className="w-5 h-5" />}
                  >
                    <p className="text-sm text-gray-300 leading-relaxed bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                      {language === "ar" ? selected.function.ar : selected.function.en}
                    </p>
                  </Section>

                  <Section
                    title={isRTL ? "الفوائد المدعومة علميًا" : "Scientifically Supported Benefits"}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {(language === "ar" ? selected.benefits.ar : selected.benefits.en).map(
                        (b, i) => (
                          <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-zinc-900/20 border border-white/5">
                            <CheckCircle2 className="w-5 h-5 text-[#59f20d] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{b}</span>
                          </div>
                        )
                      )}
                    </div>
                  </Section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Section
                      title={isRTL ? "طريقة الاستخدام" : "Typical Usage"}
                      icon={<Sparkles className="w-5 h-5" />}
                    >
                      <div className="h-full p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                        <p className="text-sm text-gray-300">
                          {language === "ar" ? selected.typicalUse.ar : selected.typicalUse.en}
                        </p>
                      </div>
                    </Section>

                    <Section
                      title={isRTL ? "تحذيرات" : "Cautions"}
                      icon={<ShieldAlert className="w-5 h-5" />}
                    >
                      <div className="h-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <ul className="space-y-2">
                          {(language === "ar" ? selected.cautions.ar : selected.cautions.en).map(
                            (c, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-rose-200">{c}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </Section>
                  </div>

                  {/* References */}
                  {selected.refs && selected.refs.length > 0 && (
                    <Section
                      title={isRTL ? "المراجع العلمية" : "Scientific References"}
                      icon={<ExternalLink className="w-5 h-5" />}
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {selected.refs.map((ref, i) => (
                          <a
                            key={i}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-[#59f20d]/50 transition-all group"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#59f20d]" />
                            <div className="flex-1 text-right">
                              <p className="text-sm font-bold text-white group-hover:text-[#59f20d] transition-colors">{ref.title}</p>
                              {ref.source && (
                                <p className="text-[10px] uppercase font-black text-gray-500">{ref.source}</p>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
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
