"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "./lib/i18n";
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from "lucide-react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function ResetCardStandalone() {
  const { signIn } = useAuthActions();
  const { t, language, dir } = useLanguage();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ✅ لو جالك ?email=... (اختياري) يعبّي الإيميل تلقائيًا
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const e = u.searchParams.get("email");
      if (e) setEmail(e);
    } catch {}
  }, []);

  const title = useMemo(
    () => (language === "ar" ? "إعادة تعيين كلمة المرور" : "Reset your password"),
    [language]
  );
  const sub = useMemo(
    () =>
      step === "request"
        ? language === "ar"
          ? "اكتب بريدك لإرسال كود التحقق."
          : "Enter your email to receive a verification code."
        : language === "ar"
        ? "اكتب الكود ثم اختر كلمة مرور جديدة."
        : "Enter the code and choose a new password.",
    [language, step]
  );

  function prettyResetError(err: any) {
    const msg = String(err?.message || "");
    if (/invalid/i.test(msg) && /code/i.test(msg)) return t("err_reset_code_invalid");
    if (/expired/i.test(msg)) return t("err_reset_code_expired");
    if (/too many/i.test(msg) || /rate/i.test(msg)) return t("err_rate_limit");
    return msg || t("err_generic");
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error(t("enter_valid_email"));
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("flow", "reset");
      fd.set("email", email);

      await signIn("password", fd);

      toast.success(t("reset_code_sent"));
      setStep("verify");
    } catch (err: any) {
      toast.error(prettyResetError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyReset(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error(t("enter_code"));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error(t("password_min_6"));
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("flow", "reset-verification");
      fd.set("email", email);
      fd.set("code", code.trim());
      fd.set("newPassword", newPassword);

      await signIn("password", fd);

      toast.success(t("password_updated"));
      window.location.href = "/";
    } catch (err: any) {
      toast.error(prettyResetError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={dir} className="space-y-4">
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4ed10a] text-white flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">{sub}</p>
          </div>
        </div>

        <div className="mt-3 text-[12px] text-slate-500">
          {language === "ar"
            ? "🔒 لأمان حسابك: لا تشارك كود التحقق مع أي شخص."
            : "🔒 For your security: never share your verification code."}
        </div>
      </div>

      {step === "request" ? (
        <form noValidate onSubmit={requestCode} className="space-y-3">
          <div className="relative">
            <Mail className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 left-3" />
            <input
              className="auth-input-field pl-10"
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              dir="ltr"
              required
            />
          </div>

          <button className="auth-button flex items-center justify-center gap-2" type="submit" disabled={submitting}>
            {submitting ? (
              t("sending")
            ) : (
              <>
                {t("send_reset_code")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            className="text-sm text-secondary hover:underline w-full flex items-center justify-center gap-2"
            onClick={() => (window.location.href = "/")}
            disabled={submitting}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back_to_sign_in")}
          </button>
        </form>
      ) : (
        <form noValidate onSubmit={verifyReset} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 left-3" />
            <input
              className="auth-input-field pl-10"
              type="text"
              placeholder={t("code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              dir="ltr"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 left-3" />
            <input
              className="auth-input-field pl-10"
              type="password"
              placeholder={t("new_password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              dir="ltr"
              required
            />
          </div>

          <button className="auth-button flex items-center justify-center gap-2" type="submit" disabled={submitting}>
            {submitting ? (
              t("saving")
            ) : (
              <>
                {t("reset_password")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            className="text-sm text-secondary hover:underline w-full"
            onClick={() => setStep("request")}
            disabled={submitting}
          >
            {language === "ar" ? "رجوع" : "Back"}
          </button>
        </form>
      )}
    </div>
  );
}
