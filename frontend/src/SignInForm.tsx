"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "./lib/i18n";
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";
import logoFinal from "./assets/logo-final.png";

type Mode = "auth" | "reset_request" | "reset_verify";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { t } = useLanguage();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [mode, setMode] = useState<Mode>("auth");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function prettyAuthError(error: any, f: "signIn" | "signUp") {
    const msg = String(error?.message || "").toLowerCase();
    const fullError = JSON.stringify(error || {}).toLowerCase();

    console.log("🔴 خطأ في المصادقة:", {
      flow: f,
      error: error,
      message: msg,
      fullError: fullError
    });

    // أخطاء الحساب غير موجود (تحسين البحث)
    if (
      /invalidaccountid/i.test(fullError) ||
      /account.*not.*found/i.test(fullError) ||
      /no.*user.*found/i.test(fullError) ||
      /user.*does.*not.*exist/i.test(fullError) ||
      /email.*not.*found/i.test(fullError) ||
      msg.includes("accountid") ||
      msg.includes("no user") ||
      msg.includes("not found")
    ) {
      return f === "signIn"
        ? "هذا الحساب غير مسجل. الرجاء إنشاء حساب جديد"
        : "الحساب غير موجود";
    }

    // أخطاء كلمة المرور (تحسين البحث)
    if (
      /invalidsecret/i.test(fullError) ||
      /invalid.*password/i.test(fullError) ||
      /wrong.*password/i.test(fullError) ||
      /incorrect.*password/i.test(fullError) ||
      /password.*incorrect/i.test(fullError) ||
      msg.includes("secret") ||
      msg.includes("password")
    ) {
      return "كلمة المرور غير صحيحة. حاول مرة أخرى";
    }

    // أخطاء البريد الإلكتروني
    if ((/email/i.test(msg) && /invalid/i.test(msg)) || /malformed.*email/i.test(fullError)) {
      return "البريد الإلكتروني غير صالح";
    }

    // الحساب موجود بالفعل
    if (
      /already.*exists/i.test(fullError) ||
      /accountalreadyexists/i.test(fullError) ||
      /duplicate/i.test(fullError) ||
      /email.*taken/i.test(fullError) ||
      /email.*in.*use/i.test(fullError)
    ) {
      return "هذا الحساب مسجل بالفعل. الرجاء تسجيل الدخول";
    }

    // تجاوز الحد المسموح
    if (/too.*many/i.test(fullError) || /rate.*limit/i.test(fullError)) {
      return "محاولات كثيرة جداً. الرجاء الانتظار قليلاً";
    }

    // خطأ الاتصال
    if (/network/i.test(msg) || /fetch/i.test(msg) || /connection/i.test(msg)) {
      return "خطأ في الاتصال. تحقق من الإنترنت";
    }

    // خطأ Server Error
    if (/server.*error/i.test(fullError) || /500/i.test(msg) || /internal.*error/i.test(fullError)) {
      return "خطأ في الخادم. حاول مرة أخرى";
    }

    // إذا لم نجد نمط معروف، نعرض رسالة مخصصة حسب السياق
    if (f === "signIn") {
      // إذا كانت المحاولة تسجيل دخول، غالباً المشكلة في الحساب أو كلمة المرور
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    } else {
      // إذا كانت إنشاء حساب
      return msg ? `فشل إنشاء الحساب: ${msg}` : "فشل إنشاء الحساب. حاول مرة أخرى";
    }
  }

  function prettyResetError(error: any) {
    const msg = String(error?.message || "");

    if (/invalid/i.test(msg) && /code/i.test(msg)) return t("err_reset_code_invalid");
    if (/expired/i.test(msg)) return t("err_reset_code_expired");
    if (/too many/i.test(msg) || /rate/i.test(msg)) return t("err_rate_limit");
    if (/server error/i.test(msg)) {
      return "خطأ في الخادم: تأكد من إعداد مفتاح Resend وأنك ترسل لكود لبريدك المسجل لديهم فقط (قيود الحساب المجاني).";
    }

    return msg || t("err_generic");
  }

  async function afterAuthSuccess() {
    window.location.href = "/";
  }

  async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // مسح الرسائل السابقة
    setErrorMessage("");
    setSuccessMessage("");

    const form = e.currentTarget;
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const password =
      (form.elements.namedItem("password") as HTMLInputElement)?.value || "";

    console.log("🚀 بدء عملية المصادقة:", {
      flow,
      email,
      passwordLength: password.length
    });

    if (!isValidEmail(email)) {
      setErrorMessage("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSubmitting(true);

    try {
      console.log("📡 إرسال طلب المصادقة...");

      await signIn("password", {
        flow,
        email,
        password,
      });

      console.log("✅ نجحت عملية المصادقة");

      const successMsg = flow === "signIn" ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب بنجاح!";
      setSuccessMessage(successMsg);
      toast.success(`✅ ${successMsg}`);

      // الانتظار قليلاً لعرض رسالة النجاح
      setTimeout(async () => {
        await afterAuthSuccess();
      }, 1000);
    } catch (error: any) {
      console.error("❌ فشلت عملية المصادقة:", error);
      const errorMsg = prettyAuthError(error, flow);
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isValidEmail(resetEmail)) {
      toast.error(t("enter_valid_email"));
      return;
    }

    setSubmitting(true);

    try {
      await signIn("password", {
        flow: "reset",
        email: resetEmail,
      } as any);

      toast.success(t("reset_code_sent"));
      setMode("reset_verify");
    } catch (error: any) {
      toast.error(prettyResetError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!resetCode.trim()) {
      toast.error(t("enter_code"));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error(t("password_min_6"));
      return;
    }

    setSubmitting(true);

    try {
      await signIn("password", {
        flow: "reset-verification",
        email: resetEmail,
        code: resetCode.trim(),
        newPassword,
      } as any);

      toast.success(t("password_updated"));

      setMode("auth");
      setFlow("signIn");
      setResetCode("");
      setNewPassword("");
      setResetEmail("");
      setShowPassword(false);
    } catch (error: any) {
      toast.error(prettyResetError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "reset_request") {
    return (
      <div className="w-full">
        <div className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-black border border-zinc-800/60 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(89,242,13,0.2)]">
              <Lock className="w-10 h-10 text-[#59f20d]" />
            </div>
            <h2 className="text-2xl font-black text-white text-center">استعادة الحساب</h2>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-5">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 text-white text-right focus:outline-none focus:border-[#59f20d]/40 transition-all text-base"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59f20d] text-zinc-950 font-black py-4.5 rounded-2xl shadow-[0_8px_30px_rgba(89,242,13,0.2)] text-lg"
            >
              {submitting ? "إرسال..." : "إرسال الرمز"}
            </button>
            <button
              type="button"
              onClick={() => setMode("auth")}
              className="w-full text-zinc-500 text-sm font-bold hover:text-[#59f20d] transition-colors"
            >
              إلغاء
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "reset_verify") {
    return (
      <div className="w-full">
        <div className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-black border border-zinc-800/60 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(89,242,13,0.2)]">
              <Sparkles className="w-10 h-10 text-[#59f20d]" />
            </div>
            <h2 className="text-2xl font-black text-white text-center">تأكيد الرمز</h2>
          </div>

          <form onSubmit={handleResetVerify} className="space-y-5">
            <input
              type="text"
              placeholder="أدخل الرمز"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 text-white text-center focus:outline-none focus:border-[#59f20d]/40 transition-all text-base"
              dir="ltr"
            />
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 text-white text-center focus:outline-none focus:border-[#59f20d]/40 transition-all text-base"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#59f20d] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59f20d] text-zinc-950 font-black py-4.5 rounded-2xl shadow-[0_8px_30px_rgba(89,242,13,0.2)] text-lg"
            >
              {submitting ? "حفظ..." : "تحديث كلمة المرور"}
            </button>
            <button
              type="button"
              onClick={() => setMode("auth")}
              className="w-full text-zinc-500 text-sm font-bold hover:text-[#59f20d] transition-colors"
            >
              العودة
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (flow === "signIn") {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-6 relative group">
            <div className="absolute inset-0 bg-[#59f20d]/10 blur-2xl rounded-full scale-110" />
            <img
              src={logoFinal}
              alt="DarkFit Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(89,242,13,0.3)] relative z-10"
            />
          </div>
          <p className="text-[#59f20d] text-[0.75rem] font-bold tracking-[0.4em] uppercase opacity-70">
            PREMIUM TRAINING
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white text-center">
            تسجيل الدخول
          </h2>

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
              <p className="text-red-400 text-sm text-center font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-2xl">
              <p className="text-[#59f20d] text-sm text-center font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-sm font-bold mb-2.5 text-right uppercase tracking-wider">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  disabled={submitting}
                  className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/40 focus:ring-4 focus:ring-[#59f20d]/5 transition-all text-base"
                  dir="ltr"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#59f20d]/60" size={20} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset_request");
                    setResetEmail("");
                    setResetCode("");
                    setNewPassword("");
                    setShowPassword(false);
                  }}
                  disabled={submitting}
                  className="text-[#59f20d] text-sm font-bold hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
                <label className="block text-zinc-400 text-sm font-bold uppercase tracking-wider">
                  كلمة المرور
                </label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  disabled={submitting}
                  className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/40 focus:ring-4 focus:ring-[#59f20d]/5 transition-all text-base"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#59f20d] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#59f20d]/60" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59f20d] text-zinc-950 font-black py-4.5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(89,242,13,0.2)] mt-4 text-lg"
            >
              {submitting ? "جارٍ التحميل..." : "دخول"}
            </button>
          </form>

          <div className="flex items-center gap-4 py-3">
            <div className="flex-1 h-px bg-zinc-800/50" />
            <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">أو عبر</span>
            <div className="flex-1 h-px bg-zinc-800/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-black/30 border border-zinc-800/50 text-white p-4 rounded-2xl hover:bg-zinc-800/40 transition-all text-sm font-bold">
              Google
            </button>
            <button className="flex items-center justify-center gap-3 bg-black/30 border border-zinc-800/50 text-white p-4 rounded-2xl hover:bg-zinc-800/40 transition-all text-sm font-bold">
              Apple
            </button>
          </div>

          <div className="text-center pt-6">
            <span className="text-zinc-500 text-sm font-medium">ليس لديك حساب؟ </span>
            <button
              type="button"
              onClick={() => setFlow("signUp")}
              className="text-[#59f20d] font-bold hover:underline text-sm"
            >
              اشترك الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (flow === "signUp") {
    return (
      <div className="w-full">
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white text-center">إنشاء حساب</h2>

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-sm text-center font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-sm font-bold mb-2.5 text-right uppercase tracking-wider">
                الاسم بالكامل
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/40 focus:ring-4 focus:ring-[#59f20d]/5 transition-all text-base text-right"
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#59f20d]/60" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-bold mb-2.5 text-right uppercase tracking-wider">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/40 focus:ring-4 focus:ring-[#59f20d]/5 transition-all text-base"
                  dir="ltr"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#59f20d]/60" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-bold mb-2.5 text-right uppercase tracking-wider">
                كلمة المرور
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-zinc-800/60 rounded-2xl px-5 py-4.5 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#59f20d]/40 focus:ring-4 focus:ring-[#59f20d]/5 transition-all text-base"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#59f20d] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#59f20d]/60" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59f20d] text-zinc-950 font-black py-4.5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(89,242,13,0.2)] mt-2 text-lg"
            >
              {submitting ? "جارٍ التنفيذ..." : "إنشاء حساب"}
            </button>
          </form>

          <div className="text-center pt-6">
            <span className="text-zinc-500 text-sm font-medium">لديك حساب بالفعل؟ </span>
            <button
              type="button"
              onClick={() => setFlow("signIn")}
              className="text-[#59f20d] font-bold hover:underline text-sm"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }
}
