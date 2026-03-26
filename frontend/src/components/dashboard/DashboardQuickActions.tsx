import React from "react";
import { Zap } from "lucide-react";
import { SectionId } from "./utils";

interface DashboardQuickActionsProps {
  onNavigate?: (section: SectionId) => void;
  isAr: boolean;
}

export function DashboardQuickActions({ onNavigate, isAr }: DashboardQuickActionsProps) {
  const actions = [
    { id: "exercises", icon: "🏋️", label: isAr ? "سجّل تمرين" : "Log Workout", color: "#59f20d" },
    { id: "nutrition", icon: "🥗", label: isAr ? "سجّل وجبة" : "Log Meal", color: "#fbbf24" },
    { id: "health", icon: "💧", label: isAr ? "تتبع الصحة" : "Health Tracker", color: "#38bdf8" },
    { id: "smartCoach", icon: "🤖", label: isAr ? "المدرب الذكي" : "Smart Coach", color: "#a78bfa" },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-[#59f20d]" />
        {isAr ? "إجراءات سريعة" : "Quick Actions"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onNavigate?.(action.id as SectionId)}
            className="group relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
              style={{ background: `radial-gradient(circle at center, ${action.color}10, transparent 70%)` }} 
            />
            <span className="text-2xl relative z-10">{action.icon}</span>
            <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors relative z-10">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
