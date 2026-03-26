import { useEffect } from "react";

export interface NotificationSettings {
    workout: boolean;
    workoutTime: string; // "HH:MM"
    meals: boolean;
    water: boolean;
    // Custom meal times
    breakfastTime: string;
    lunchTime: string;
    snackTime: string;
    dinnerTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    workout: true,
    workoutTime: "08:00",
    meals: true,
    water: true,
    breakfastTime: "07:00",
    lunchTime: "13:00",
    snackTime: "16:00",
    dinnerTime: "19:00",
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

/** Generate in-app notification items based on current time and settings */
export function getTimeBasedNotifications(isAr: boolean) {
    const settings = getNotificationSettings();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const items: { id: string; type: "meal" | "water"; icon: string; title: string; message: string; time: string }[] = [];

    // Water reminders — every 2 hours (8am–10pm)
    if (settings.water && currentHour >= 8 && currentHour <= 22) {
        items.push({
            id: "water_reminder",
            type: "water",
            icon: "💧",
            title: isAr ? "💧 تذكير بشرب الماء" : "💧 Water Reminder",
            message: isAr
                ? "اشرب كوب ماء الآن! الترطيب أساس الصحة والأداء الرياضي. 🌊"
                : "Drink a glass of water now! Hydration is key to performance. 🌊",
            time: isAr ? "كل ساعتين" : "Every 2h",
        });
    }

    // Meal reminders based on custom times
    if (settings.meals) {
        const meals = [
            { key: "breakfast", time: settings.breakfastTime, labelAr: "🍳 وقت الفطور", labelEn: "🍳 Breakfast Time", msgAr: "ابدأ يومك بوجبة فطور غنية بالبروتين! لا تتخطاها.", msgEn: "Start your day with a protein-rich breakfast!" },
            { key: "lunch", time: settings.lunchTime, labelAr: "🥗 وقت الغداء", labelEn: "🥗 Lunch Time", msgAr: "حان وقت الغداء! تناول وجبة متوازنة تدعم تمارينك.", msgEn: "Time for lunch! Have a balanced meal to fuel your workouts." },
            { key: "snack", time: settings.snackTime, labelAr: "🥜 وقت السناك", labelEn: "🥜 Snack Time", msgAr: "لا تنسَ السناك! حفنة مكسرات أو بروتين بار تمنحك طاقة.", msgEn: "Don't skip your snack! Nuts or a protein bar will keep you going." },
            { key: "dinner", time: settings.dinnerTime, labelAr: "🍽️ وقت العشاء", labelEn: "🍽️ Dinner Time", msgAr: "وقت العشاء! اختر وجبة خفيفة غنية بالبروتين.", msgEn: "Dinner time! Go for a light, protein-rich meal." },
        ];

        for (const meal of meals) {
            const [mH, mM] = meal.time.split(":").map(Number);
            // Show notification if we're within 30 min window of the meal time
            const mealMinutes = mH * 60 + mM;
            const nowMinutes = currentHour * 60 + currentMin;
            const diff = nowMinutes - mealMinutes;

            if (diff >= -5 && diff <= 30) {
                items.push({
                    id: `meal_${meal.key}`,
                    type: "meal",
                    icon: meal.key === "breakfast" ? "🍳" : meal.key === "lunch" ? "🥗" : meal.key === "snack" ? "🥜" : "🍽️",
                    title: isAr ? meal.labelAr : meal.labelEn,
                    message: isAr ? meal.msgAr : meal.msgEn,
                    time: meal.time,
                });
            }
        }
    }

    return items;
}

function sendNotification(title: string, body: string, icon = "/icons/icon-192.png") {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
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

    // Meal reminders using custom times
    if (settings.meals) {
        const mealTimes = [settings.breakfastTime, settings.lunchTime, settings.snackTime, settings.dinnerTime];
        const mealNames = ["وقت الفطور 🍳", "وقت الغداء 🥗", "وقت السناك 🥜", "وقت العشاء 🍽️"];
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
            if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
            const settings = getNotificationSettings();
            checkAndNotify(settings);
        }, 60_000);

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}
