"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

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

  if (!isAuthenticated) return null;

  const onSignOut = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج ✅");
    } catch (e: any) {
      toast.error(e?.message || "تعذر تسجيل الخروج");
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onSignOut}
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
        className={cn(
          "p-2 rounded-2xl text-[#59f20d] bg-black/40 border border-[#59f20d]/20 hover:bg-[#59f20d]/10 hover:border-[#59f20d]/60 transition-all",
          className
        )}
      >
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      className={cn(
        "px-4 py-2 rounded-2xl bg-[#59f20d] text-zinc-950 font-black",
        "hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)]",
        className
      )}
    >
      {label || "تسجيل الخروج"}
    </button>
  );
}
