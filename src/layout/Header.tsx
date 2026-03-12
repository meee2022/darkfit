import { Authenticated, Unauthenticated, useConvexAuth, useQuery } from "convex/react";
import { Languages, ShieldCheck, User, ClipboardList } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { SignOutButton } from "../SignOutButton";
import type { SectionId } from "../sections";
import logoGym from "../assets/splash.jpg";
import { api } from "../../convex/_generated/api";

type Props = {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  isAdmin: boolean;
  onSignInClick?: () => void;
};

export function Header({ activeSection, setActiveSection, isAdmin, onSignInClick }: Props) {
  const { t, language, setLanguage } = useLanguage();
  const profile = useQuery(api.profiles.getCurrentProfile);

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
        sticky top-0 z-[100] backdrop-blur-xl
        bg-white/90 text-zinc-900 border-b border-herb-100 shadow-soft
        dark:bg-[#0c0c0c]/90 dark:text-zinc-50 dark:border-white/10
      "
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-3xl border border-white/10 bg-black/80 shadow-[0_4px_10px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
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





            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                onClick={() => setActiveSection("admin")}
                className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${activeSection === "admin"
                  ? "bg-[#59f20d] text-zinc-950 shadow-[0_0_25px_rgba(89,242,13,0.5)] border border-[#59f20d]"
                  : "bg-white text-zinc-700 border border-slate-200 shadow-soft hover:bg-herb-50 dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]"
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

        {/* زر تسجيل الدخول للزوار */}
        <Unauthenticated>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 border bg-white/80 text-zinc-800 border-herb-100 shadow-soft hover:bg-herb-50 dark:border-[#59f20d]/25 dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:hover:bg-[#59f20d]/10 dark:hover:border-[#59f20d]/60"
              type="button"
            >
              <Languages className="w-4 h-4 text-[#59f20d]" />
              {language === "ar" ? "EN" : "AR"}
            </button>
            <button
              onClick={onSignInClick}
              className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 bg-[#59f20d] text-zinc-950 hover:brightness-95 shadow-[0_0_20px_rgba(89,242,13,0.3)]"
              type="button"
            >
              <User className="w-4 h-4" />
              {language === "ar" ? "تسجيل الدخول" : "Sign In"}
            </button>
          </div>
        </Unauthenticated>
      </div>
    </header>
  );
}