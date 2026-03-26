import React, { useEffect, useState } from "react";
import { Download, Bell, X } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export function PWAManager() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(false);

  useEffect(() => {
    // 1. Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner if they haven't dismissed it
      if (localStorage.getItem("pwa_install_dismissed") !== "true") {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 2. Check push notification permission
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default" && localStorage.getItem("pwa_push_dismissed") !== "true") {
        setShowPushBanner(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setShowInstallBanner(false);
  };

  const handleRequestPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // You could subscribe to push service here or send token to backend
        alert(isAr ? "تم تفعيل الإشعارات بنجاح!" : "Notifications enabled successfully!");
      }
      setShowPushBanner(false);
    } catch (error) {
      console.error("Error requesting push permission:", error);
    }
  };

  const handleDismissPush = () => {
    localStorage.setItem("pwa_push_dismissed", "true");
    setShowPushBanner(false);
  };

  return (
    <>
      {/* Install App Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 bg-[#1a2318] border border-[#59f20d]/30 rounded-2xl p-4 shadow-2xl z-[9999] animate-fadeIn">
          <button onClick={handleDismissInstall} className="absolute top-2 right-2 p-1 text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4 pr-6 rtl:pr-0 rtl:pl-6">
            <div className="w-12 h-12 rounded-xl bg-black border border-[#59f20d]/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <img src="/assets/logo-final.png" alt="App Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{isAr ? "قم بتثبيت تطبيق الدارك فيت" : "Install DarkFit App"}</h3>
              <p className="text-xs text-white/60 mt-1 mb-3">
                {isAr ? "احصل على تجربة أسرع وإمكانية الوصول بدون إنترنت المحسنة." : "Get a faster experience and enhanced offline access."}
              </p>
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#59f20d] text-black font-bold text-xs hover:brightness-110 transition-all font-mono shadow-[0_0_15px_rgba(89,242,13,0.3)]"
              >
                <Download className="w-3.5 h-3.5" />
                {isAr ? "تثبيت التطبيق" : "Install App"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Banner - Only shows if install banner is not showing */}
      {!showInstallBanner && showPushBanner && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 bg-[#0a0d08] border border-blue-500/30 rounded-2xl p-4 shadow-2xl z-[9999] animate-fadeIn">
          <button onClick={handleDismissPush} className="absolute top-2 right-2 p-1 text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4 pr-6 rtl:pr-0 rtl:pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{isAr ? "فعل الإشعارات الذكية" : "Enable Smart Notifications"}</h3>
              <p className="text-xs text-white/60 mt-1 mb-3">
                {isAr ? "تذكر أوقات صلاتك، شرب الماء، والتمرين اليومي." : "Get reminders for workouts, water intake, and updates."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRequestPush}
                  className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs hover:bg-blue-400 transition-all"
                >
                  {isAr ? "تفعيل" : "Enable"}
                </button>
                <button
                  onClick={handleDismissPush}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 transition-all"
                >
                  {isAr ? "لاحقاً" : "Later"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
