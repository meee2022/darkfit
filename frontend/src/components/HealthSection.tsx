import React, { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n";
import { HealthDashboard } from "./health/HealthDashboard";
import { DiabetesSection } from "./health/DiabetesSection";
import { SeniorsSection } from "./health/SeniorsSection";
import { ChildrenSection } from "./health/ChildrenSection";

type HealthView = "dashboard" | "diabetes" | "seniors" | "children";

export function HealthSection() {
  const { language, dir } = useLanguage();
  const [currentView, setCurrentView] = useState<HealthView>("dashboard");

  useEffect(() => {
    // Listen for category changes
    const handleCategoryChange = (e: any) => {
      setCurrentView(e.detail);
    };

    // Listen for back button
    const handleBack = () => {
      setCurrentView("dashboard");
    };

    window.addEventListener('health-category-change', handleCategoryChange);
    window.addEventListener('health-back', handleBack);

    return () => {
      window.removeEventListener('health-category-change', handleCategoryChange);
      window.removeEventListener('health-back', handleBack);
    };
  }, []);

  return (
    <div dir={dir} lang={language}>
      {currentView === "dashboard" && <HealthDashboard />}
      {currentView === "diabetes" && <DiabetesSection />}
      {currentView === "seniors" && <SeniorsSection />}
      {currentView === "children" && <ChildrenSection />}
    </div>
  );
}
