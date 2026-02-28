import React, { useState } from "react";
import { CalorieCalculator } from "./CalorieCalculator";
import { CalorieCalculatorDark } from "./CalorieCalculatorDark";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function CalorieCalculatorWrapper() {
  const [useNewDesign, setUseNewDesign] = useState(true);
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setUseNewDesign(!useNewDesign)}
        className="fixed top-20 right-4 z-50 w-12 h-12 rounded-full bg-[#59f20d] flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        title={useNewDesign ? (isAr ? "التصميم القديم" : "Old Design") : isAr ? "التصميم الجديد" : "New Design"}
      >
        {useNewDesign ? <Moon className="w-6 h-6 text-black" /> : <Sun className="w-6 h-6 text-black" />}
      </button>

      {/* Render Selected Component */}
      {useNewDesign ? <CalorieCalculator /> : <CalorieCalculatorDark />}
    </div>
  );
}
