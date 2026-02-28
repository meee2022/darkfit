import { Authenticated } from "convex/react";
import { Languages, ShieldCheck, User, ClipboardList } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { SignOutButton } from "../SignOutButton";
import type { SectionId } from "../sections";
import logoGym from "../assets/splash.jpg";

type Props = {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  isAdmin: boolean;
};

export function Header({ activeSection, setActiveSection, isAdmin }: Props) {
  const { t, language, setLanguage } = useLanguage();

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  return (
    <header
      className="
        sticky top-0 z-50 backdrop-blur-xl
        bg-white/90 text-zinc-900 border-b border-herb-100 shadow-soft
        dark:bg-[#020617]/90 dark:text-zinc-50 dark:border-[#59f20d]/25
      "
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-3xl border border-[#59f20d]/70 bg-black/80 shadow-[0_0_40px_rgba(35,242,100,0.65)] overflow-hidden flex items-center justify-center">
            <img
              src={logoGym}
              alt="Gym Pro logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-neon-400">
              DARKFIT
            </h1>
            <p className="t-mini -mt-0.5 text-zinc-500 dark:text-zinc-300">
              {tr("app_tagline", "لياقة • تغذية • صحة")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <Authenticated>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="
                px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center gap-2
                border bg-white/80 text-zinc-800 border-herb-100 shadow-soft
                hover:bg-herb-50
                dark:border-[#59f20d]/25 dark:bg-[#1a2318]/70 dark:text-zinc-100
                dark:hover:bg-[#59f20d]/10 dark:hover:border-[#59f20d]/60
              "
              title={language === "ar" ? "Switch to English" : "التبديل للعربية"}
              type="button"
            >
              <Languages className="w-4 h-4 text-[#59f20d]" />
              {language === "ar" ? "EN" : "AR"}
            </button>

            {/* Desktop quick access to Profile */}
            <button
              onClick={() => setActiveSection("profile")}
              className="
                hidden md:inline-flex px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center gap-2
                border bg-white/80 text-zinc-800 border-slate-200 shadow-soft
                hover:bg-herb-50
                dark:border-slate-700 dark:bg-[#1a2318]/70 dark:text-zinc-100
                dark:hover:border-[#59f20d]/50 dark:hover:bg-[#1a2318]
              "
              type="button"
              title={tr("profile", "الملف الشخصي")}
            >
              <User className="w-4 h-4 text-[#59f20d]" />
              {tr("profile", "الملف الشخصي")}
            </button>

            {/* زر خطط المتدربين - للأدمن فقط */}
            {isAdmin && (
              <button
                onClick={() => setActiveSection("coachPlans")}
                className={`hidden md:inline-flex px-3 py-2 rounded-2xl text-xs sm:text-sm font-black transition items-center gap-2
                  ${activeSection === "coachPlans"
                    ? "bg-[#59f20d] text-zinc-950 shadow-[0_0_25px_rgba(89,242,13,0.5)] border border-[#59f20d]"
                    : "border border-[#59f20d]/30 text-[#59f20d] bg-black/40 hover:bg-[#59f20d]/10 hover:border-[#59f20d]/60"
                  }`}
                type="button"
              >
                <ClipboardList className="w-4 h-4" />
                {tr("coach_plans", "خطط المتدربين")}
              </button>
            )}

            {/* زر لوحة الإدارة */}
            {isAdmin && (
              <button
                onClick={() => setActiveSection("admin")}
                className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${activeSection === "admin"
                    ? "bg-[#59f20d] text-zinc-950 shadow-[0_0_25px_rgba(89,242,13,0.5)] border border-[#59f20d]"
                    : "border border-[#59f20d]/30 text-[#59f20d] bg-black/40 hover:bg-[#59f20d]/10 hover:border-[#59f20d]/60"
                  }`}
                type="button"
              >
                <ShieldCheck className="w-4 h-4" />
                {tr("admin_panel", "لوحة الإدارة")}
              </button>
            )}

            {/* Sign out */}
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
            <div className="sm:hidden relative z-50">
              <SignOutButton variant="icon" />
            </div>
          </div>
        </Authenticated>
      </div>
    </header>
  );
}