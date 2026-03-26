import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ==========================================
// 1. Core Profile AI Interactions
// ==========================================

export const activateSmartCoach = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { smartCoachActivated: true });
    }
    return true;
  },
});

export const getAiCoachStatus = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile?.smartCoachActivated ?? false;
  },
});

export const updateAiPreferences = mutation({
  args: {
    preferredTrainingTime: v.optional(v.union(v.literal("morning"), v.literal("afternoon"), v.literal("evening"))),
    injuries: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        preferredTrainingTime: args.preferredTrainingTime ?? profile.preferredTrainingTime,
        injuries: args.injuries ?? profile.injuries,
      });
    }
    return true;
  },
});

// ==========================================
// 2. Daily Check-ins (The Foundation of Fatigue Detection)
// ==========================================

export const submitDailyCheckin = mutation({
  args: {
    sleepHours: v.number(),
    sleepQuality: v.union(v.literal("poor"), v.literal("fair"), v.literal("good"), v.literal("excellent")),
    fatigueScore: v.number(),
    sorenessLevel: v.number(),
    stressLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const today = new Date().toISOString().split("T")[0];

    const existingId = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (existingId) {
      // Update checkin
      await ctx.db.patch(existingId._id, {
        ...args,
      });
    } else {
      // New checkin
      await ctx.db.insert("dailyCheckins", {
        userId,
        date: today,
        ...args,
        createdAt: Date.now(),
      });
    }

    // Attempt to run Smart Evaluation immediately after
    try {
      await evaluateSmartRules(ctx, userId);
    } catch (error) {
      console.error("Smart Rules Evaluation Error:", error);
    }

    return true;
  },
});

export const getDailyCheckinStatus = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const today = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    return !!existing;
  },
});

export const getRecentCheckins = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 7);
  },
});

// ==========================================
// 3. AI Insights & Dashboard
// ==========================================

export const getUnreadInsights = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiInsights")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .order("desc")
      .collect();
  },
});

export const getAllInsights = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiInsights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const markInsightRead = mutation({
  args: { insightId: v.id("aiInsights") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const insight = await ctx.db.get(args.insightId);
    if (insight && insight.userId === userId) {
      await ctx.db.patch(args.insightId, { isRead: true });
    }
  },
});

// ==========================================
// 4. THE SMART RULE ENGINE
// This function analyzes user data and generates insights.
// It acts as the "Brain" of the AI Coach.
// ==========================================

async function evaluateSmartRules(ctx: any, userId: any) {
  const today = new Date().toISOString().split("T")[0];

  // Prevent multiple identical insights on the same day
  const existingToday = await ctx.db
    .query("aiInsights")
    .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", today))
    .collect();

  const generatedTypes = new Set(existingToday.map((i: any) => i.type));

  // 1. Get Recent Checkins
  const checkins = await ctx.db
    .query("dailyCheckins")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .take(3);

  if (checkins.length > 0) {
    // A. FATIGUE DETECTION RULE
    const avgSleep = checkins.reduce((acc: number, c: any) => acc + c.sleepHours, 0) / checkins.length;
    const avgFatigue = checkins.reduce((acc: number, c: any) => acc + c.fatigueScore, 0) / checkins.length;

    if (avgSleep < 5.5 && avgFatigue >= 7 && !generatedTypes.has("warning")) {
      await ctx.db.insert("aiInsights", {
        userId,
        date: today,
        type: "warning",
        titleAr: "خطر الإرهاق العالي ⚠️",
        titleEn: "High Fatigue Risk ⚠️",
        messageAr: "نومك أقل من المعدل المطلوب (أقل من 6 ساعات) ومستويات الإرهاق مرتفعة جداً. يُنصح بشدة بتقليل شدة تدريبك اليوم لتجنب الإصابة وبناء استشفاء أفضل.",
        messageEn: "Your sleep is below 6 hours and fatigue is high. We highly recommend reducing training intensity today to avoid injury and optimize recovery.",
        isRead: false,
        actionLink: "/workoutGenerator",
        createdAt: Date.now(),
      });
    }

    // B. RECOVERY PRAISE
    if (avgSleep >= 7.5 && avgFatigue <= 4 && !generatedTypes.has("praise")) {
      await ctx.db.insert("aiInsights", {
        userId,
        date: today,
        type: "praise",
        titleAr: "استشفاء مثالي! 🔋",
        titleEn: "Perfect Recovery! 🔋",
        messageAr: "أنت في أفضل حالاتك للتدريب اليوم! نظام نومك واستشفائك ممتاز، هذا هو الوقت المثالي لكسر أرقامك القياسية.",
        messageEn: "You are primed for a great workout today! Your sleep and recovery metrics are excellent. It's time to set a new PR.",
        isRead: false,
        actionLink: "/exercises",
        createdAt: Date.now(),
      });
    }
  }

  // 2. Get Profile & Weight Trend (Predict Plateau or Progress)
  const profile = await ctx.db.query("profiles").withIndex("by_user", (q: any) => q.eq("userId", userId)).first();
  const weightHistory = await ctx.db.query("weightHistory").withIndex("by_user_date", (q: any) => q.eq("userId", userId)).collect();
  
  if (weightHistory.length >= 7 && profile?.goal === "تنشيف" && !generatedTypes.has("prediction")) {
     // A simple plateau logic example: if weight variance is extremely low over last 7 entries
     const recentWeights = weightHistory.slice(-7).map((w: any) => w.weight);
     const maxW = Math.max(...recentWeights);
     const minW = Math.min(...recentWeights);

     if (maxW - minW <= 0.2) {
       await ctx.db.insert("aiInsights", {
        userId,
        date: today,
        type: "prediction",
        titleAr: "احتمالية ثبات الوزن 📉",
        titleEn: "Plateau Prediction 📉",
        messageAr: "لقد لاحظ المدرب الذكي أن وزنك ثابت نسبياً منذ أسبوع. هذا جزء طبيعي من التنشيف، نقترح صدمة بسيطة بتقليل السعرات 100-200 سعرة أو زيادة 15 دقيقة كارديو.",
        messageEn: "Smart Coach noticed your weight has been very stable for a week. We suggest dropping 100-200 calories or adding 15 mins of cardio.",
        isRead: false,
        actionLink: "/progress",
        createdAt: Date.now(),
      });
     }
  }
}

// ==========================================
// 5. Dashboard Aggregations (Smart Coach Stats)
// ==========================================

export const getAiDashboardMetrics = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const checkins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(7);

    // Calculate Recovery Score (0-100)
    let recoveryScore = 0;
    let fatigueScore = 0;
    let sleepScore = 0;
    let readinessTextAr = "لا توجد بيانات";
    let readinessTextEn = "No Data";

    if (checkins.length > 0) {
      const latest = checkins[0];
      const sleepPoints = Math.min(100, (latest.sleepHours / 8) * 100);
      sleepScore = Math.round(sleepPoints);
      const fatiguePoints = 100 - (latest.fatigueScore * 10);
      const sorePoints = 100 - (latest.sorenessLevel * 10);
      
      recoveryScore = Math.round((sleepPoints * 0.5) + (fatiguePoints * 0.3) + (sorePoints * 0.2));
      fatigueScore = latest.fatigueScore;

      if (recoveryScore > 80) {
        readinessTextAr = "استعداد عالي للتدريب";
        readinessTextEn = "High Training Readiness";
      } else if (recoveryScore > 50) {
        readinessTextAr = "استعداد متوسط";
        readinessTextEn = "Moderate Readiness";
      } else {
        readinessTextAr = "بحاجة للراحة المكتسبة";
        readinessTextEn = "Needs Active Recovery";
      }
    }

    return {
      recoveryScore,
      fatigueScore,
      sleepScore,
      readinessTextAr,
      readinessTextEn,
      checkinCount: checkins.length,
    };
  },
});
