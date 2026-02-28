import React, { useState } from "react";
import NutritionSectionDark from "./NutritionSectionDark";
import NutritionSectionLight from "./NutritionSectionLight";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { WaterReminder } from "./WaterReminder";

interface NutritionSectionProps {
  targetGroup?: "general" | "diabetes" | "seniors" | "children";
}

export default function NutritionSection({ targetGroup }: NutritionSectionProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-20 right-4 z-50 w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        title={isDarkMode ? (isAr ? "التصميم الفاتح" : "Light Mode") : isAr ? "التصميم الداكن" : "Dark Mode"}
      >
        {isDarkMode ? <Sun className="w-6 h-6 text-black" /> : <Moon className="w-6 h-6 text-black" />}
      </button>

      {/* Render Selected Component */}
      {isDarkMode ? (
        <NutritionSectionDark targetGroup={targetGroup} />
      ) : (
        <NutritionSectionLight targetGroup={targetGroup} />
      )}

      {/* Water Reminder Banner */}
      <WaterReminder />
    </div>
  );
}
