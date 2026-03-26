import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function PasswordReset() {
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await signIn("password", { flow: "reset", email });
      setStep("verify");
      setMsg("تم إرسال كود التحقق إلى بريدك.");
    } catch (err: any) {
      setMsg(err?.message ?? "حدث خطأ أثناء إرسال الكود.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await signIn("password", {
        flow: "reset-verification",
        email,
        code,
        newPassword,
      });
      setMsg("تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
    } catch (err: any) {
      setMsg(err?.message ?? "الكود غير صحيح أو انتهت صلاحيته.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-herb-50 to-herb-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-herb-100 bg-white shadow-soft p-6 sm:p-7 dark:border-slate-800 dark:bg-[#0a0d08]/90">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 text-center dark:text-slate-50">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 text-center dark:text-slate-400">
            أدخل بريدك الإلكتروني لاستلام كود، ثم أدخل الكود مع كلمة مرور جديدة.
          </p>

          {msg && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-700 dark:border-slate-700 dark:bg-[#0a0d08]/70 dark:text-slate-200">
              {msg}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
                  البريد الإلكتروني
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#59f20d]/50 dark:border-slate-700 dark:bg-[#0a0d08] dark:text-slate-100"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-[#00ff66] px-4 py-2 text-sm font-extrabold text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال كود"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyAndReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
                  الكود
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#59f20d]/50 dark:border-slate-700 dark:bg-[#0a0d08] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 dark:text-slate-300">
                  كلمة المرور الجديدة
                </label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#59f20d]/50 dark:border-slate-700 dark:bg-[#0a0d08] dark:text-slate-100"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-[#00ff66] px-4 py-2 text-sm font-extrabold text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "جارٍ الحفظ..." : "تأكيد وتغيير كلمة المرور"}
              </button>

              <button
                type="button"
                onClick={() => setStep("request")}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#0a0d08]/70 dark:text-slate-200 dark:hover:bg-[#0a0d08]"
              >
                رجوع
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
