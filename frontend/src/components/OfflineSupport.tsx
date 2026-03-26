import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl transition-all duration-500 ${
        isOnline
          ? "bg-emerald-500/90 text-white"
          : "bg-zinc-900/95 border border-red-500/30 text-white"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-bold">تم استعادة الاتصال</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold">لا يوجد اتصال بالإنترنت</span>
        </>
      )}
    </div>
  );
}

// Offline-aware data wrapper
export function OfflineWrapper({ 
  children, 
  offlineMessage = "هذا المحتوى غير متاح بدون اتصال"
}: { 
  children: React.ReactNode;
  offlineMessage?: string;
}) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <WifiOff className="w-12 h-12 text-zinc-500 mb-4" />
        <p className="text-zinc-400 text-center">{offlineMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
