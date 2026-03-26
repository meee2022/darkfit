import { useMemo, useState, useRef, useEffect } from "react";
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
  Zap,
  Bot,
  Menu,
  X,
  Info,
  TrendingUp,
  Brain,
  Trophy,
  History,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { SectionId } from "../sections";

type Props = {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  isAdmin?: boolean;
  isCoach?: boolean;
};

export function TopNav({ activeSection, setActiveSection, isAdmin = false, isCoach = false }: Props) {
  const { t, language } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pinnedItems = useMemo(
    () => [
      { id: "dashboard" as const, label: tr("dashboard", "الرئيسية"), icon: Home },
      { id: "exercises" as const, label: tr("exercises", "التمارين"), icon: Dumbbell },
      { id: "workoutGenerator" as const, label: tr("workout_generator", "مولد التمارين"), icon: Zap },
      { id: "nutrition" as const, label: tr("nutrition", "التغذية"), icon: Salad },
      { id: "supplements" as const, label: tr("supplements", "المكملات"), icon: Pill },
      { id: "coaches" as const, label: tr("coaches", "المدربون"), icon: Users },
      { id: "health" as const, label: tr("health", "الصحة"), icon: HeartPulse },
      { id: "calculator" as const, label: tr("calculator", "الحاسبة"), icon: Calculator },
      { id: "plans" as const, label: tr("plans", "خططي"), icon: ClipboardList },
      ...(isCoach ? [{ id: "coachDashboard" as const, label: tr("coach_dashboard", "لوحة المدرب"), icon: ClipboardList }] : []),
    ],
    [language, isCoach]
  );

  const moreItems = useMemo(
    () => [
      ...(isAdmin ? [{ id: "coachPlans" as const, label: tr("coach_plans", "خطط المتدربين"), icon: ClipboardList }] : []),
      { id: "smartCoach" as const, label: tr("smartCoach", "المدرب الذكي"), icon: Brain },
      { id: "progress" as const, label: tr("progress", "تتبع التطور"), icon: TrendingUp },
      { id: "social" as const, label: language === "ar" ? "المجتمع والتحديات" : "Social & Challenges", icon: Trophy },
      { id: "messages" as const, label: language === "ar" ? "الدردشة" : "Coach Chat", icon: MessageSquare },
      { id: "workoutHistory" as const, label: language === "ar" ? "سجل التمارين" : "Workout History", icon: History },
      { id: "fitbot" as const, label: tr("fitbot", "المساعد الذكي"), icon: Bot },
      { id: "about" as const, label: tr("about", "عن التطبيق"), icon: Info },
    ],
    [language, isAdmin]
  );

  const isMoreActive = moreItems.some((item) => item.id === activeSection);

  return (
    <nav
      className="
        hidden md:block sticky top-16 z-[90] backdrop-blur-xl
        bg-white/90 text-zinc-900 border-b border-herb-100 shadow-soft
        dark:bg-[#0c0c0c]/90 dark:text-zinc-50 dark:border-white/10
      "
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-stretch gap-2 py-3">
          {/* Pinned nav items — scrollable row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap flex-1 pe-4">
            {pinnedItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setMoreOpen(false); }}
                  type="button"
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap
                    ${active
                      ? "bg-neon-400 text-zinc-950 border border-neon-400 shadow-[0_0_25px_rgba(35,242,100,0.8)]"
                      : "bg-white text-zinc-700 border border-slate-200 shadow-soft hover:bg-herb-50 dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]"}
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-zinc-950" : "text-[#59f20d]"}`} />
                  <span className="text-[13px] sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* More / Hamburger — outside scrollable area so dropdown isn't clipped */}
          <div className="relative flex-shrink-0" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              type="button"
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap h-full
                ${isMoreActive
                  ? "bg-neon-400 text-zinc-950 border border-neon-400 shadow-[0_0_25px_rgba(35,242,100,0.8)]"
                  : "bg-white text-zinc-700 border border-slate-200 shadow-soft hover:bg-herb-50 dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]"}
              `}
            >
              {moreOpen
                ? <X className={`w-4 h-4 ${isMoreActive ? "text-zinc-950" : "text-[#59f20d]"}`} />
                : <Menu className={`w-4 h-4 ${isMoreActive ? "text-zinc-950" : "text-[#59f20d]"}`} />
              }
              <span className="text-[13px] sm:text-sm">
                {language === "ar" ? "المزيد" : "More"}
              </span>
            </button>

            {/* Dropdown — now outside overflow container so it renders above page */}
            {moreOpen && (
              <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto z-[100] bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl min-w-[200px] max-w-[calc(100vw-2rem)] overflow-hidden">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveSection(item.id); setMoreOpen(false); }}
                      type="button"
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition text-left
                        ${active
                          ? "bg-[#59f20d]/15 text-[#59f20d]"
                          : "hover:bg-slate-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-200"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-[#59f20d]" : "text-[#59f20d]/60"}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
