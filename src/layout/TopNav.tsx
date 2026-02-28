import { useMemo } from "react";
import {
  Home,
  Dumbbell,
  Salad,
  Calculator,
  HeartPulse,
  Users,
  Pill,
  User,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { SectionId } from "../sections";

type Props = {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
};

export function TopNav({ activeSection, setActiveSection }: Props) {
  const { t, language } = useLanguage();

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const topNavItems = useMemo(
    () => [
      { id: "dashboard" as const, label: tr("dashboard", "الرئيسية"), icon: Home },
      { id: "exercises" as const, label: tr("exercises", "التمارين"), icon: Dumbbell },
      { id: "nutrition" as const, label: tr("nutrition", "التغذية"), icon: Salad },
      { id: "supplements" as const, label: tr("supplements", "المكملات"), icon: Pill },
      { id: "coaches" as const, label: tr("coaches", "المدربون"), icon: Users },
      { id: "plans" as const, label: tr("plans", "خططي"), icon: ClipboardList },
      { id: "profile" as const, label: tr("profile", "الملف الشخصي"), icon: User },
      { id: "calculator" as const, label: tr("calculator", "الحاسبة"), icon: Calculator },
      { id: "health" as const, label: tr("health", "الصحة"), icon: HeartPulse },
    ],
    [language]
  );

  return (
    <nav
      className="
        hidden md:block sticky top-16 z-40 backdrop-blur-xl
        bg-white/90 text-zinc-900 border-b border-herb-100 shadow-soft
        dark:bg-[#020617]/90 dark:text-zinc-50 dark:border-[#59f20d]/25
      "
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                type="button"
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition
                  ${active
                    ? "bg-neon-400 text-zinc-950 border border-neon-400 shadow-[0_0_25px_rgba(35,242,100,0.8)]"
                    : "bg-white text-zinc-700 border border-slate-200 shadow-soft hover:bg-herb-50 dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]"}
                `}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-zinc-950" : "text-[#59f20d]"
                  }`}
                />
                <span className="text-[13px] sm:text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
