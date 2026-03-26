import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";

// Types
interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }
  return await Notification.requestPermission();
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey?: string): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription && vapidPublicKey) {
      // Subscribe with VAPID key
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    if (subscription) {
      const json = subscription.toJSON();
      return {
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error("Push unsubscription failed:", error);
    return false;
  }
}

// Send local notification (for testing or immediate notifications)
export function sendLocalNotification(payload: NotificationPayload): void {
  if (!isPushSupported() || Notification.permission !== "granted") return;

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-72.png",
    tag: payload.tag,
    data: payload.data,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Hook for push notification state
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      setPermission(getNotificationPermission());
      
      if (isPushSupported()) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch {
          setIsSubscribed(false);
        }
      }
      
      setIsLoading(false);
    }
    
    checkStatus();
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = useCallback(async (vapidKey?: string) => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPush(vapidKey);
      setIsSubscribed(!!subscription);
      return subscription;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) setIsSubscribed(false);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported: isPushSupported(),
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification: sendLocalNotification,
  };
}

// Push Notification Toggle Component
export function PushNotificationToggle({ className = "" }: { className?: string }) {
  const { permission, isSubscribed, isLoading, isSupported, requestPermission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 ${className}`}>
        <BellOff className="w-5 h-5 text-zinc-500" />
        <div>
          <p className="text-sm font-bold text-zinc-400">الإشعارات غير مدعومة</p>
          <p className="text-xs text-zinc-500">المتصفح لا يدعم الإشعارات</p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (permission === "default") {
      const result = await requestPermission();
      if (result === "granted") {
        await subscribe();
      }
    } else if (permission === "granted") {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 p-4 rounded-xl bg-zinc-800/50 ${className}`}>
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <div className="w-10 h-10 rounded-full bg-[#59f20d]/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#59f20d]" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <BellOff className="w-5 h-5 text-zinc-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-white">إشعارات الدفع</p>
          <p className="text-xs text-zinc-400">
            {permission === "denied" 
              ? "تم رفض الإذن - فعّلها من إعدادات المتصفح"
              : isSubscribed 
                ? "ستتلقى إشعارات التمارين والتذكيرات" 
                : "فعّل الإشعارات للتذكيرات"}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === "denied"}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          isSubscribed
            ? "bg-zinc-700 text-white hover:bg-zinc-600"
            : "bg-[#59f20d] text-black hover:brightness-110"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        ) : isSubscribed ? (
          "إيقاف"
        ) : (
          "تفعيل"
        )}
      </button>
    </div>
  );
}

// Notification Permission Banner (for first-time users)
export function NotificationPermissionBanner({ onDismiss }: { onDismiss: () => void }) {
  const { permission, isSupported, requestPermission, subscribe } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(true);

  if (!isSupported || permission !== "default" || !isVisible) {
    return null;
  }

  const handleAllow = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      await subscribe();
    }
    setIsVisible(false);
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#59f20d]/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-[#59f20d]" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">تفعيل الإشعارات</h4>
          <p className="text-xs text-zinc-400 mb-3">
            احصل على تذكيرات التمارين وتحديثات خطط التغذية
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAllow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#59f20d] text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تفعيل</span>
            </button>
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>لاحقاً</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
