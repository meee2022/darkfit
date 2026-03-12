"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useLanguage } from "./lib/i18n";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SignOutButton({
  variant = "button",
  className,
  label,
}: {
  variant?: "button" | "icon";
  className?: string;
  label?: string;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  if (!isAuthenticated) return null;

  const onSignOut = async () => {
    try {
      await signOut();
      toast.success(isAr ? "تم تسجيل الخروج ✅" : "Signed out successfully ✅");
    } catch (e: any) {
      toast.error(e?.message || (isAr ? "تعذر تسجيل الخروج" : "Failed to sign out"));
    }
  };

  const buttonLabel = label || (isAr ? "تسجيل الخروج" : "Sign Out");

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onSignOut}
        aria-label={buttonLabel}
        title={buttonLabel}
        className={cn(
          "p-2 rounded-2xl transition-all flex items-center justify-center",
          "bg-white text-zinc-700 border border-slate-200 shadow-soft",
          "hover:bg-herb-50 hover:brightness-110 active:scale-95",
          "dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]",
          className
        )}
      >
        <LogOut className="w-5 h-5 text-[#59f20d]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      className={cn(
        "px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2",
        "bg-white text-zinc-700 border border-slate-200 shadow-soft",
        "hover:bg-herb-50 hover:brightness-110 active:scale-95",
        "dark:bg-[#1a2318]/70 dark:text-zinc-100 dark:border-slate-700 dark:hover:bg-[#1a2318]",
        className
      )}
    >
      <LogOut className="w-4 h-4 text-[#59f20d] sm:hidden" />
      <span>{buttonLabel}</span>
    </button>
  );
}
