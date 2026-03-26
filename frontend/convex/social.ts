import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ───────────────────────────────────
// LEADERBOARD
// ───────────────────────────────────

/** Global leaderboard sorted by XP */
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const allProgress = await ctx.db.query("userProgress").collect();

    // Sort by totalXP descending
    const sorted = allProgress
      .filter((p) => p.totalXP > 0)
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit);

    // Enrich with profile data
    const enriched = await Promise.all(
      sorted.map(async (p, idx) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", p.userId))
          .first();

        return {
          rank: idx + 1,
          userId: p.userId,
          name: profile?.name || "مستخدم",
          profileImage: profile?.profileImage || null,
          xp: p.totalXP,
          level: p.level || 1,
          totalWorkouts: p.totalWorkouts || 0,
          streak: p.currentStreak || 0,
        };
      })
    );

    return enriched;
  },
});

/** Get current user's rank on the leaderboard */
export const getMyRank = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const allProgress = await ctx.db.query("userProgress").collect();
    const sorted = allProgress
      .filter((p) => p.totalXP > 0)
      .sort((a, b) => b.totalXP - a.totalXP);

    const myIdx = sorted.findIndex((p) => p.userId === userId);
    if (myIdx === -1) return null;

    const me = sorted[myIdx];
    return {
      rank: myIdx + 1,
      total: sorted.length,
      xp: me.totalXP,
      level: me.level || 1,
    };
  },
});

// ───────────────────────────────────
// CHALLENGES (computed from user progress)
// ───────────────────────────────────

/** Get all challenges for the current user */
export const getActiveChallenges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const totalWorkouts = progress?.totalWorkouts ?? 0;
    const currentStreak = progress?.currentStreak ?? 0;
    const xp = progress?.totalXP ?? 0;

    // Compute weekly workouts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekStart = sevenDaysAgo.toISOString().split("T")[0];

    const recentSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const weeklyWorkouts = recentSessions.filter((s) => s.date >= weekStart).length;

    const challenges = [
      {
        id: "weekly_5",
        titleAr: "أسبوع النخبة",
        titleEn: "Elite Week",
        descAr: "أنه 5 تمارين هذا الأسبوع",
        descEn: "Complete 5 workouts this week",
        emoji: "🏋️",
        color: "#59f20d",
        target: 5,
        current: Math.min(weeklyWorkouts, 5),
        reward: 500,
      },
      {
        id: "streak_7",
        titleAr: "السلسلة الأسطورية",
        titleEn: "Legendary Streak",
        descAr: "حافظ على سلسلة 7 أيام متتالية",
        descEn: "Maintain a 7-day streak",
        emoji: "🔥",
        color: "#f97316",
        target: 7,
        current: Math.min(currentStreak, 7),
        reward: 1000,
      },
      {
        id: "workouts_50",
        titleAr: "المحارب",
        titleEn: "The Warrior",
        descAr: "أنه 50 جلسة تمرين إجمالية",
        descEn: "Complete 50 total workout sessions",
        emoji: "⚔️",
        color: "#a78bfa",
        target: 50,
        current: Math.min(totalWorkouts, 50),
        reward: 2000,
      },
      {
        id: "xp_5000",
        titleAr: "جامع الخبرة",
        titleEn: "XP Collector",
        descAr: "اجمع 5000 نقطة XP",
        descEn: "Collect 5,000 XP points",
        emoji: "⭐",
        color: "#fbbf24",
        target: 5000,
        current: Math.min(xp, 5000),
        reward: 3000,
      },
      {
        id: "workouts_100",
        titleAr: "المئة مقاتل",
        titleEn: "Century Fighter",
        descAr: "أنه 100 جلسة تمرين إجمالية",
        descEn: "Complete 100 total workout sessions",
        emoji: "💯",
        color: "#fb7185",
        target: 100,
        current: Math.min(totalWorkouts, 100),
        reward: 5000,
      },
    ];

    return challenges.map((c) => ({
      ...c,
      completed: c.current >= c.target,
      progress: Math.round((c.current / c.target) * 100),
    }));
  },
});
