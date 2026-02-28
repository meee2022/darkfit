import { useEffect } from "react";

interface NotificationSettings {
    workout: boolean;
    workoutTime: string; // "HH:MM"
    meals: boolean;
    water: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    workout: true,
    workoutTime: "08:00",
    meals: true,
    water: true,
};

const STORAGE_KEY = "darkfit_notification_settings";

export function getNotificationSettings(): NotificationSettings {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>) {
    const current = getNotificationSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...settings }));
}

function sendNotification(title: string, body: string, icon = "/icons/icon-192.png") {
    if (Notification.permission !== "granted") return;
    try {
        new Notification(title, { body, icon, badge: "/icons/icon-192.png" });
    } catch { }
}

function checkAndNotify(settings: NotificationSettings) {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hh}:${mm}`;

    // Workout reminder
    if (settings.workout && timeStr === settings.workoutTime) {
        sendNotification("💪 DarkFit — وقت التمرين!", "لا تنسَ تمرينك اليوم. ابدأ الآن وحقق هدفك! 🏋️");
    }

    // Water reminder every 2 hours between 8am–10pm
    if (settings.water) {
        const h = now.getHours();
        const m = now.getMinutes();
        if (m === 0 && h >= 8 && h <= 22 && h % 2 === 0) {
            sendNotification("💧 DarkFit — تذكير الماء", "اشرب كوب ماء الآن! الترطيب أساس الصحة 🌊");
        }
    }

    // Meal reminders: breakfast 7am, lunch 1pm, dinner 7pm
    if (settings.meals) {
        const mealTimes = ["07:00", "13:00", "19:00"];
        const mealNames = ["وقت الفطور 🍳", "وقت الغداء 🥗", "وقت العشاء 🍽️"];
        const idx = mealTimes.indexOf(timeStr);
        if (idx !== -1) {
            sendNotification(`🍴 DarkFit — ${mealNames[idx]}`, "لا تتخطَّ وجباتك! تناول طعاماً صحياً الآن.");
        }
    }
}

export function NotificationManager() {
    useEffect(() => {
        // Request permission once
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        // Check every minute
        const interval = setInterval(() => {
            if (Notification.permission !== "granted") return;
            const settings = getNotificationSettings();
            checkAndNotify(settings);
        }, 60_000);

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}
