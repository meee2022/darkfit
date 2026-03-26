import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Moon, Sun, User } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export function AccountSettings() {
  const { t, dir } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isRTL = dir === "rtl";

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const deleteAccount = useMutation(api.userDeletion.deleteAccount);
  const { signOut } = useAuthActions();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || (isRTL ? "فشل حذف الحساب" : "Failed to delete account"));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

      {/* Delete Account Section */}
      <div className="mt-8">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/5 backdrop-blur p-6 shadow-lg">
          <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {isRTL ? "منطقة خطر: حذف الحساب" : "Danger Zone: Delete Account"}
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
            {isRTL 
              ? "بمجرد حذف حسابك، سيتم مسح كافة بياناتك (التمارين، التغذية، القياسات) نهائياً ولا يمكن استرجاعها."
              : "Once you delete your account, all your data (workouts, nutrition, health records) will be permanently erased and cannot be recovered."}
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isRTL ? "حذف حسابي بالكامل" : "Delete My Entire Account"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0a0a] border-2 border-red-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-white">
                {isRTL ? "هل أنت متأكد فعلاً؟" : "Are you absolutely sure?"}
              </h3>
              
              <p className="text-zinc-400 text-sm leading-relaxed">
                {isRTL 
                  ? "هذا الإجراء سيقوم بحذف كافة بياناتك من DARKFIT للأبد. لن نتمكن من استعادة أي شيء بعد هذه الخطوة."
                  : "This action will permanently delete all your DARKFIT data. We won't be able to recover anything after this."}
              </p>

              <div className="w-full space-y-3 pt-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black rounded-2xl transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  {isRTL ? "نعم، احذف كل شيء" : "Yes, Delete Everything"}
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-800 transition"
                >
                  {isRTL ? "تراجع" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
