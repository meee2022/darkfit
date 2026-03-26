import React, { useState } from "react";
import {
  Home,
  Calculator,
  HeartPulse,
  Users,
  Pill,
  ClipboardList,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";
import type { SectionId } from "../sections";

type Props = {
  activeSection: SectionId;
  onChange: (id: SectionId) => void;
};

type NavConfig = {
  id: SectionId | "more";
  labelAr: string;
  labelEn: string;
  emoji: string;       // 3D emoji icon
  color: string;       // accent hex
};

/* ─── Animated Tab ─── */
function TabButton({
  config, active, onClick,
}: { config: NavConfig; active: boolean; onClick: () => void; }) {
  const { language } = useLanguage();
  const lbl = language === "ar" ? config.labelAr : config.labelEn;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center relative outline-none focus:outline-none"
      style={{ minHeight: 62, paddingBottom: 6 }}
    >
      {/* Active top indicator */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: active ? 28 : 0, height: 3,
        borderRadius: "0 0 6px 6px",
        background: config.color,
        boxShadow: active ? `0 0 10px ${config.color}, 0 0 22px ${config.color}88` : "none",
        transition: "width 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
        opacity: active ? 1 : 0,
      }} />

      {/* Icon + label floats up on active */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transform: active ? "translateY(-7px)" : "translateY(0px)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Emoji container with glow */}
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          background: active
            ? `radial-gradient(circle, ${config.color}30, ${config.color}0a 70%, transparent 100%)`
            : "transparent",
          transition: "all 0.35s ease",
        }}>
          {active && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 14,
              border: `1.5px solid ${config.color}44`,
              boxShadow: `0 0 14px ${config.color}44, inset 0 0 10px ${config.color}18`,
            }} />
          )}
          {/* 3D Emoji — rendered natively by OS as full 3D/colorful */}
          <span
            style={{
              fontSize: active ? 26 : 22,
              lineHeight: 1,
              filter: active
                ? `drop-shadow(0 0 8px ${config.color}cc) drop-shadow(0 2px 6px ${config.color}66)`
                : "grayscale(20%) opacity(0.7)",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              userSelect: "none",
            }}
            aria-hidden
          >
            {config.emoji}
          </span>
        </div>

        {/* Label */}
        <span style={{
          fontSize: 11, fontWeight: 700, lineHeight: 1,
          color: active ? config.color : "rgba(255,255,255,0.42)",
          textShadow: active ? `0 0 10px ${config.color}bb` : "none",
          transition: "all 0.3s ease",
          letterSpacing: "0.01em",
        }}>
          {lbl}
        </span>
      </div>
    </button>
  );
}

/* ─── More Drawer Item ─── */
function MoreItem({
  config, active, onClick,
}: { config: NavConfig; active: boolean; onClick: () => void; }) {
  const { language } = useLanguage();
  const lbl = language === "ar" ? config.labelAr : config.labelEn;
  return (
    <button
      type="button" onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 rounded-2xl outline-none focus:outline-none active:scale-95 transition-all duration-200"
      style={{
        background: active ? `${config.color}18` : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${active ? config.color + "55" : "rgba(255,255,255,0.07)"}`,
        boxShadow: active ? `0 0 20px ${config.color}44` : "none",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? `${config.color}20` : "rgba(255,255,255,0.05)",
        boxShadow: active ? `0 0 16px ${config.color}55` : "none",
      }}>
        <span style={{
          fontSize: 24, lineHeight: 1,
          filter: active ? `drop-shadow(0 0 6px ${config.color}cc)` : "grayscale(30%) opacity(0.65)",
          transition: "all 0.25s ease",
        }} aria-hidden>
          {config.emoji}
        </span>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.2, paddingInline: 4,
        color: active ? config.color : "rgba(255,255,255,0.55)",
        textShadow: active ? `0 0 8px ${config.color}99` : "none",
      }}>
        {lbl}
      </span>
    </button>
  );
}

/* ─── Main ─── */
export function MobileBottomNav({ activeSection, onChange }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [moreOpen, setMoreOpen] = useState(false);

  const bottomItems: NavConfig[] = [
    { id: "exercises",  labelAr: "تمارين",  labelEn: "Workout",   emoji: "🏋️",  color: "#59f20d" },
    { id: "nutrition",  labelAr: "تغذية",   labelEn: "Nutrition",  emoji: "🥗",  color: "#34d399" },
    { id: "fitbot",     labelAr: "فِتْبوت", labelEn: "FitBot",    emoji: "🤖",  color: "#60a5fa" },
    { id: "more",       labelAr: "المزيد",   labelEn: "More",      emoji: "✦",   color: "#a78bfa" },
  ];

  const moreItems: NavConfig[] = [
    { id: "plans",         labelAr: "خططي",            labelEn: "My Plans",      emoji: "📋", color: "#59f20d" },
    { id: "smartCoach",    labelAr: "المدرب الذكي",    labelEn: "Smart Coach",   emoji: "🧠", color: "#60a5fa" },
    { id: "supplements",   labelAr: "المكملات",         labelEn: "Supplements",   emoji: "💊", color: "#fbbf24" },
    { id: "coaches",       labelAr: "المدربون",         labelEn: "Coaches",       emoji: "👤", color: "#60a5fa" },
    { id: "health",        labelAr: "الصحة",           labelEn: "Health",        emoji: "❤️", color: "#fb7185" },
    { id: "progress",      labelAr: "تتبع التطور",     labelEn: "Progress",      emoji: "📈", color: "#59f20d" },
    { id: "calculator",    labelAr: "حاسبات",          labelEn: "Calculator",    emoji: "🧮", color: "#34d399" },
    { id: "social",        labelAr: "المجتمع",          labelEn: "Social",        emoji: "🏆", color: "#a78bfa" },
    { id: "messages",      labelAr: "المحادثات",       labelEn: "Messages",      emoji: "💬", color: "#59f20d" },
    { id: "workoutHistory",labelAr: "سجل التمارين",   labelEn: "History",       emoji: "📅", color: "#38bdf8" },
    { id: "about",         labelAr: "عن التطبيق",      labelEn: "About App",     emoji: "✨", color: "#59f20d" },
  ];

  const isHomeActive = activeSection === "dashboard";
  const isAnyMoreActive = moreItems.some((i) => i.id === activeSection);

  return (
    <>
      {/* More Drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
          <div
            className="absolute left-0 right-0 px-3"
            style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              borderRadius: 24, overflow: "hidden",
              background: "linear-gradient(160deg,#1c1c1c,#0e0e0e)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -4px 60px rgba(0,0,0,0.9)",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#59f20d", boxShadow: "0 0 8px #59f20d" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {isAr ? "القائمة الكاملة" : "Full Menu"}
                  </span>
                </div>
                <button type="button" onClick={() => setMoreOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>

              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: 12 }}>
                {moreItems.map((item) => (
                  <MoreItem key={item.id} config={item}
                    active={activeSection === item.id}
                    onClick={() => { setMoreOpen(false); onChange(item.id as SectionId); }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────── NAV BAR ─────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(89,242,13,0.55), transparent)" }} />

        <div style={{
          background: "linear-gradient(180deg, #161616 0%, #0d0d0d 100%)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -12px 50px rgba(0,0,0,0.9)",
          paddingBottom: "env(safe-area-inset-bottom)",
          position: "relative", overflow: "visible",
        }}>
          {/* Center glow */}
          <div style={{
            position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)",
            width: 140, height: 80,
            background: `radial-gradient(ellipse, rgba(89,242,13,${isHomeActive ? "0.12" : "0.05"}), transparent 70%)`,
            pointerEvents: "none", transition: "all 0.5s ease",
          }} />

          <div style={{ display: "flex", alignItems: "flex-end", overflow: "visible" }}>
            {/* Left 2 */}
            {bottomItems.slice(0, 2).map((item) => (
              <TabButton key={item.id} config={item}
                active={activeSection === item.id}
                onClick={() => { setMoreOpen(false); onChange(item.id as SectionId); }} />
            ))}

            {/* ── HOME (elevated) ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 76, position: "relative", paddingBottom: 6 }}>
              {/* Bridge */}
              <div style={{
                position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: 56, height: 28,
                background: "linear-gradient(180deg, #161616, #0d0d0d)",
                borderRadius: "0 0 12px 12px", zIndex: 0,
              }} />

              <button
                type="button"
                onClick={() => { setMoreOpen(false); onChange("dashboard"); }}
                style={{
                  position: "relative", zIndex: 2,
                  marginTop: -22, width: 58, height: 58, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  outline: "none",
                  background: isHomeActive
                    ? "linear-gradient(135deg, #70ff1e, #59f20d, #3ab808)"
                    : "linear-gradient(135deg, #252525, #181818)",
                  boxShadow: isHomeActive
                    ? "0 0 0 3px rgba(89,242,13,0.35), 0 0 28px rgba(89,242,13,0.65), 0 -4px 20px rgba(89,242,13,0.35)"
                    : "0 0 0 2px rgba(89,242,13,0.2), 0 -4px 20px rgba(0,0,0,0.8)",
                  transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isHomeActive ? "translateY(-4px) scale(1.08)" : "translateY(0) scale(1)",
                }}
              >
                {isHomeActive && (
                  <div className="animate-ping" style={{
                    position: "absolute", inset: -4, borderRadius: "50%",
                    background: "#59f20d", opacity: 0.18,
                  }} />
                )}
                <span style={{ fontSize: 28, lineHeight: 1, userSelect: "none",
                  filter: isHomeActive ? "brightness(0) invert(0)" : "drop-shadow(0 0 8px rgba(89,242,13,0.7))"
                }} aria-hidden>
                  {isHomeActive ? "🏠" : "🏡"}
                </span>
              </button>

              <span style={{
                fontSize: 11, fontWeight: 700, marginTop: 5, lineHeight: 1,
                color: isHomeActive ? "#59f20d" : "rgba(255,255,255,0.42)",
                textShadow: isHomeActive ? "0 0 10px #59f20dbb" : "none",
                transition: "all 0.3s ease",
              }}>
                {isAr ? "الرئيسية" : "Home"}
              </span>
            </div>

            {/* Right 2 */}
            {bottomItems.slice(2).map((item) => {
              const isMoreAct = item.id === "more" ? (isAnyMoreActive || moreOpen) : activeSection === item.id;
              return (
                <TabButton key={item.id} config={item} active={isMoreAct}
                  onClick={() => {
                    if (item.id === "more") { setMoreOpen((o) => !o); return; }
                    setMoreOpen(false);
                    onChange(item.id as SectionId);
                  }} />
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
