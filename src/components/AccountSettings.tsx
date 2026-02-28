import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Moon, Sun, User } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export function AccountSettings() {
  const { t, dir } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isRTL = dir === "rtl";

  const userProfile = useQuery(api.profiles.getCurrentProfile);

  const tr = (key: string, fb: string) => {
    try {
      const v = typeof t === "function" ? (t as any)(key) : "";
      if (!v || v === key) return fb;
      return v;
    } catch {
      return fb;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-emerald-100 bg-white/80 dark:bg-[#1a2318]/60 dark:border-[#59f20d]/15 backdrop-blur p-5 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.16)]">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="h-12 w-12 rounded-2xl bg-[#59f20d] text-white grid place-items-center shadow-sm">
            <User className="h-5 w-5" />
          </div>
          <div className={cn("min-w-0", isRTL ? "text-right" : "text-left")}>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {tr("account", "إعدادات الحساب")}
            </div>
            <div className="text-sm text-slate-600 dark:text-zinc-300 font-medium">
              {userProfile?.name ? userProfile.name : tr("profile", "ملفك الشخصي")}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Card */}
      <div className="rounded-3xl border border-emerald-100 bg-white/80 dark:bg-[#1a2318]/60 dark:border-[#59f20d]/15 backdrop-blur p-5 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.16)]">
        <div className={cn("flex items-center justify-between gap-3", isRTL && "flex-row-reverse")}>
          <div className={cn(isRTL ? "text-right" : "text-left")}>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {tr("theme", "المظهر")}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-zinc-300 font-medium">
              {tr("theme_desc", "اختَر الوضع المناسب: فاتح أو داكن.")}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "px-4 py-2 rounded-2xl border text-sm font-semibold transition flex items-center gap-2",
                theme === "light"
                  ? "bg-[#59f20d] text-white border-transparent shadow-sm"
                  : "bg-white/60 dark:bg-[#1a2318]/40 text-slate-700 dark:text-zinc-200 border-emerald-100 dark:border-[#59f20d]/15 hover:bg-emerald-50 dark:hover:bg-[#1a2318]/60"
              )}
            >
              <Sun className="h-4 w-4" />
              {tr("light", "فاتح")}
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "px-4 py-2 rounded-2xl border text-sm font-semibold transition flex items-center gap-2",
                theme === "dark"
                  ? "bg-[#59f20d] text-white border-transparent shadow-sm"
                  : "bg-white/60 dark:bg-[#1a2318]/40 text-slate-700 dark:text-zinc-200 border-emerald-100 dark:border-[#59f20d]/15 hover:bg-emerald-50 dark:hover:bg-[#1a2318]/60"
              )}
            >
              <Moon className="h-4 w-4" />
              {tr("dark", "داكن")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
