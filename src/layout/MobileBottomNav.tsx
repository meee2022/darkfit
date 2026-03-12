import React, { useState } from "react";
import {
  Home,
  Calculator,
  HeartPulse,
  Users,
  MoreHorizontal,
  Salad,
  Pill,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { SectionId } from "../sections";

type Props = {
  activeSection: SectionId;
  onChange: (id: SectionId) => void;
};

type NavItem = {
  id: SectionId | "more";
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const BRAND = {
  primary: "#59f20d",
  bgDark: "#0c0c0c",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ========= أيقونات مخصصة ========= */

function WorkoutIcon(props: { className?: string; strokeWidth?: number }) {
  const strokeWidth = props.strokeWidth ?? 2.4;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M12 3.5a2 2 0 1 1-0.01 0" />
      <path d="M9 8.5c1-.7 2-.9 3-.9s2 .2 3 .9" />
      <path d="M7.5 21.5l1.2-6.5 2.3-2.5M16.5 21.5l-1.2-6.5-2.3-2.5" />
      <path d="M5.5 13.5c1 .3 2-.1 2.7-.7l1.1-1" />
      <path d="M18.5 13.5c-1 .3-2-.1-2.7-.7l-1.1-1" />
    </svg>
  );
}

function PlansIcon(props: { className?: string; strokeWidth?: number }) {
  const strokeWidth = props.strokeWidth ?? 2.4;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 11h4M9 15h3" />
    </svg>
  );
}

function AccountIcon(props: { className?: string; strokeWidth?: number }) {
  const strokeWidth = props.strokeWidth ?? 2.4;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19c1.2-2.2 3.1-3.5 6-3.5s4.8 1.3 6 3.5" />
    </svg>
  );
}

// ✅ أيقونة FitBot جديدة
function FitBotIcon(props: { className?: string; strokeWidth?: number }) {
  const strokeWidth = props.strokeWidth ?? 2.4;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      {/* رأس الروبوت */}
      <rect x="7" y="4" width="10" height="12" rx="2" />
      {/* عيون */}
      <circle cx="10" cy="9" r="1" />
      <circle cx="14" cy="9" r="1" />
      {/* فم مبتسم */}
      <path d="M9.5 13c.5.5 1.5.8 2.5.8s2-.3 2.5-.8" />
      {/* هوائيات */}
      <path d="M9 4V2M15 4V2" />
      {/* جسم */}
      <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

/* ========= غلاف 3D بسيط للأيقونة ========= */

function ThreeDIconWrapper({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        filter: active
          ? "drop-shadow(0 4px 14px rgba(35,242,100,0.9))"
          : "drop-shadow(0 3px 8px rgba(0,0,0,0.85))",
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background: active
            ? "radial-gradient(circle, rgba(35,242,100,0.5), transparent 70%)"
            : "radial-gradient(circle, rgba(15,23,42,0.9), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ========= Hex بطبقتين (إطار + خلفية) ========= */

const HEX_CLIP =
  "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)";

function Hex({
  children,
  size = 70,
  active,
}: {
  children: React.ReactNode;
  size?: number;
  active: boolean;
}) {
  const borderThickness = 4;
  const outerSize = size;
  const innerSize = size - borderThickness * 2;

  const borderColor = active ? BRAND.primary : "rgba(35,242,100,0.4)";
  const innerBg = "#000000";
  const color = active ? BRAND.primary : "#e5e7eb";

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: outerSize, height: outerSize }}
    >
      <div
        className="flex items-center justify-center shadow-[0_0_18px_rgba(35,242,100,0.7)]"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: borderColor,
          clipPath: HEX_CLIP,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: innerSize,
            height: innerSize,
            background:
              "radial-gradient(circle at 30% 0%, rgba(35,242,100,0.18), #000000 60%)",
            clipPath: HEX_CLIP,
            color,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* hex العائم في النص (الرئيسية) */

function FloatingHex({ active }: { active: boolean }) {
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
      <Hex active={active} size={78}>
        <ThreeDIconWrapper active={active}>
          <Home className="w-6 h-6" strokeWidth={2.6} />
        </ThreeDIconWrapper>
      </Hex>
    </div>
  );
}

/* ========= Nav الرئيسي ========= */

export function MobileBottomNav({ activeSection, onChange }: Props) {
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  const tr = (key: string, fallback: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  // ✅ الأزرار الأساسية: التمارين، التغذية، فِتْبوت، المزيد
  const bottomItems: NavItem[] = [
    { id: "exercises", label: tr("exercises", "التمارين"), icon: WorkoutIcon },
    { id: "nutrition", label: tr("nutrition", "التغذية"), icon: Salad },
    { id: "fitbot", label: tr("fitbot", "فِتْبوت"), icon: FitBotIcon }, // ✅ جديد
    { id: "more", label: tr("more", "المزيد"), icon: MoreHorizontal },
  ];

  // ✅ «المزيد» يحتوي خطتي + الملف الشخصي + الباقي
  const moreItems: NavItem[] = [
    { id: "plans", label: tr("plans", "خططي"), icon: PlansIcon }, // ✅ انتقل هنا
    {
      id: "profile",
      label: tr("profile", "الملف الشخصي"),
      icon: AccountIcon,
    },
    { id: "supplements", label: tr("supplements", "المكملات"), icon: Pill },
    { id: "coaches", label: tr("coaches", "المدربون"), icon: Users },
    { id: "health", label: tr("health", "الصحة"), icon: HeartPulse },
    { id: "calculator", label: tr("calculator", "حاسبات"), icon: Calculator },
    {
      id: "coachPlans",
      label: tr("coach_plans", "خطط المتدربين"),
      icon: ClipboardList,
    },
  ];

  const handleBottomClick = (item: NavItem) => {
    if (item.id === "more") {
      setMoreOpen((o) => !o);
      return;
    }
    setMoreOpen(false);
    onChange(item.id as SectionId);
  };

  const handleMoreClick = (item: NavItem) => {
    setMoreOpen(false);
    onChange(item.id as SectionId);
  };

  const isAnyMoreActive = moreItems.some((i) => i.id === activeSection);
  const isHomeActive = activeSection === "dashboard";

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              relative border-t shadow-[0_-18px_48px_rgba(0,0,0,0.12)]
              bg-white text-zinc-900 border-herb-100
              dark:bg-[#0c0c0c] dark:text-slate-100 dark:border-white/10 dark:shadow-[0_-18px_48px_rgba(0,0,0,0.9)]
            "
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, #59f20d, transparent)",
              }}
            />

            <FloatingHex active={isHomeActive} />
            <button
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 w-16 h-16 outline-none focus:outline-none bg-transparent"
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onChange("dashboard");
              }}
            />

            <div className="px-4 pt-5 pb-3 flex items-stretch justify-center">
              {bottomItems.map((item, index) => {
                const Icon = item.icon;
                const active =
                  item.id === "more"
                    ? isAnyMoreActive
                    : activeSection === item.id;

                let extraMarginClass = "";
                if (index === 0) extraMarginClass = "mr-1 sm:mr-2";
                if (index === 1) extraMarginClass = "ml-1 sm:ml-2";
                if (index === 2) extraMarginClass = "mr-1 sm:mr-2";
                if (index === 3) extraMarginClass = "ml-1 sm:ml-2";

                return (
                  <button
                    key={item.id}
                    onClick={() => handleBottomClick(item)}
                    type="button"
                    className={cn(
                      "flex-1 flex items-center justify-center bg-transparent outline-none focus:outline-none",
                      extraMarginClass
                    )}
                  >
                    <Hex active={active} size={70}>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ThreeDIconWrapper active={active}>
                          <Icon className="w-5 h-5" strokeWidth={2.6} />
                        </ThreeDIconWrapper>
                        <span
                          className={cn(
                            "text-[9px] sm:text-[10px] font-semibold leading-none",
                            active
                              ? "text-neon-400"
                              : "text-slate-500 dark:text-slate-300"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Hex>
                  </button>
                );
              })}
            </div>

            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </nav>

      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setMoreOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="absolute bottom-[88px] left-0 right-0 mx-auto max-w-7xl px-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl bg-white border border-slate-200 shadow-soft dark:bg-[#0c0c0c]/95 dark:border-white/10 dark:shadow-[0_26px_80px_rgba(0,0,0,0.9)] p-3 space-y-1.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMoreClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition bg-transparent outline-none focus:outline-none",
                      active
                        ? "bg-emerald-100 border border-[#59f20d] text-emerald-800 dark:bg-[#4ed10a]/15 dark:border-[#59f20d]/60 dark:text-emerald-100"
                        : "border border-transparent text-slate-700 hover:bg-slate-100 hover:border-slate-200 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:border-white/10"
                    )}
                  >
                    <Hex active={active} size={60}>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ThreeDIconWrapper active={active}>
                          <Icon className="w-4 h-4" strokeWidth={2.6} />
                        </ThreeDIconWrapper>
                      </div>
                    </Hex>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
