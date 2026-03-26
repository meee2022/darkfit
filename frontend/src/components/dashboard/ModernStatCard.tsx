import React from "react";
import { cn } from "./utils";

interface ModernStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor: string;
  variant?: "default" | "radial" | "progress";
  progress?: number;
  unit?: string;
}

export function ModernStatCard({
  icon,
  label,
  value,
  iconColor,
  variant = "default",
  progress = 0,
  unit,
}: ModernStatCardProps) {
  // Resolve per-card accent color from iconColor class
  const accentHex = iconColor.includes("emerald")
    ? "#10b981"
    : iconColor.includes("orange")
    ? "#f97316"
    : iconColor.includes("sky")
    ? "#38bdf8"
    : iconColor.includes("indigo")
    ? "#818cf8"
    : iconColor.includes("rose")
    ? "#fb7185"
    : "#59f20d";

  // SVG ring config - smaller on mobile
  const RING_SIZE = 64; // Reduced from 84
  const R = 26; // Reduced from 34
  const STROKE = 4; // Reduced from 5
  const circ = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, progress));
  const dashOffset = circ - (clamped / 100) * circ;

  const showRing = variant === "radial" || variant === "progress";

  return (
    <div
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.07] to-black/50 backdrop-blur-xl flex flex-col items-center justify-center gap-1 sm:gap-2 p-2.5 sm:p-4 min-h-[110px] sm:min-h-[150px] text-center cursor-default select-none transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
      style={{ boxShadow: `0 2px 40px -12px ${accentHex}55` }}
    >
      {/* Ambient glow blob */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
        style={{ background: accentHex }}
      />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Ring or icon square */}
      {showRing ? (
        <div
          className="relative flex items-center justify-center z-10"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke={accentHex}
              strokeWidth={STROKE}
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)",
                filter: `drop-shadow(0 0 5px ${accentHex})`,
              }}
            />
          </svg>
          {/* Icon inside ring */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{ color: accentHex }}
          >
            <div className="opacity-90 group-hover:opacity-100 scale-75 sm:scale-100">{icon}</div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-xl transition-transform duration-500 group-hover:scale-110 z-10",
            iconColor
          )}
        >
          <div className="scale-100 sm:scale-125">{icon}</div>
        </div>
      )}

      {/* Value + Unit */}
      <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 z-10 leading-none mt-0.5 sm:mt-1">
        <span className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span
            className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest"
            style={{ color: accentHex }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-[8px] sm:text-[10px] md:text-[11px] text-white/40 font-semibold uppercase tracking-wider sm:tracking-widest z-10 leading-tight px-0.5 sm:px-1 line-clamp-1">
        {label}
      </p>

      {/* Thin progress bar below label for "progress" variant */}
      {variant === "progress" && (
        <div className="w-full h-0.5 sm:h-1 bg-white/5 rounded-full overflow-hidden z-10">
          <div
            className="h-full rounded-full transition-all duration-[1400ms] ease-out"
            style={{
              width: `${clamped}%`,
              background: accentHex,
              boxShadow: `0 0 8px ${accentHex}`,
            }}
          />
        </div>
      )}

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-700 origin-center pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${accentHex}, transparent)` }}
      />
    </div>
  );
}
