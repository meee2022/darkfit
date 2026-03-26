import React from "react";

/** helpers */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function safeTr(t: any, key: string, fallback: string) {
  try {
    const v = typeof t === "function" ? t(key as any) : "";
    if (!v || v === key) return fallback;
    return v;
  } catch {
    return fallback;
  }
}

export type SectionId =
  | "dashboard"
  | "exercises"
  | "nutrition"
  | "supplements"
  | "calculator"
  | "health"
  | "admin"
  | "coaches"
  | "fitbot"
  | "profile"
  | "account"
  | "plans"
  | "coachPlans"
  | "workoutGenerator"
  | "smartCoach"
  | "social"
  | "workoutHistory"
  | "messages";
