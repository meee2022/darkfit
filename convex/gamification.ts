import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
//  LEVEL SYSTEM
// ============================================================

function xpForLevel(level: number): number {
  return level * 100;
}

function getLevelInfo(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  tierName: string;
  tierIcon: string;
} {
  let level = 1;
  let accXP = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accXP + needed > totalXP) {
      return {
        level,
        currentLevelXP: totalXP - accXP,
        nextLevelXP: needed,
        ...getTier(level),
      };
    }
    accXP += needed;
    level++;
  }
}

function getTier(level: number): { tierName: string; tierIcon: string } {
  if (level >= 50) return { tierName: "أسطورة", tierIcon: "👑" };
  if (level >= 20) return { tierName: "وحش", tierIcon: "🦁" };
  if (level >= 10) return { tierName: "محترف", tierIcon: "🏆" };
  if (level >= 5) return { tierName: "رياضي", tierIcon: "💪" };
  return { tierName: "مبتدئ", tierIcon: "🌱" };
}

// ============================================================
//  ALL BADGE DEFINITIONS
// ============================================================

const ALL_BADGES = [
  // Workout badges
  { id: "first_workout", name: "أول تمرين", icon: "💪", category: "workout", condition: (p: any) => p.totalWorkouts >= 1 },
  { id: "10_workouts", name: "عشرة", icon: "🔟", category: "workout", condition: (p: any) => p.totalWorkouts >= 10 },
  { id: "50_workouts", name: "خمسين", icon: "⭐", category: "workout", condition: (p: any) => p.totalWorkouts >= 50 },
  { id: "100_workouts", name: "المئوي", icon: "💯", category: "workout", condition: (p: any) => p.totalWorkouts >= 100 },
  { id: "first_pr", name: "أول PR", icon: "🎯", category: "workout", condition: (p: any) => (p.totalPRs || 0) >= 1 },
  { id: "early_bird", name: "بكّير", icon: "🌅", category: "workout", condition: (_p: any, meta?: any) => meta?.earlyMorning },
  { id: "night_owl", name: "سهران", icon: "🌙", category: "workout", condition: (_p: any, meta?: any) => meta?.lateNight },
  // Nutrition badges
  { id: "first_meal", name: "أول وجبة", icon: "🥗", category: "nutrition", condition: (p: any) => p.totalMealsLogged >= 1 },
  { id: "protein_master", name: "بروتين ماستر", icon: "🥩", category: "nutrition", condition: (p: any) => (p.proteinStreakDays || 0) >= 7 },
  { id: "hydrated", name: "مرطّب", icon: "💧", category: "nutrition", condition: (p: any) => (p.waterStreakDays || 0) >= 7 },
  // Body badges
  { id: "first_kg", name: "أول كيلو", icon: "⚖️", category: "body", condition: (p: any) => (p.totalWeightLost || 0) >= 1 },
  { id: "five_kg", name: "خمسة", icon: "🎉", category: "body", condition: (p: any) => (p.totalWeightLost || 0) >= 5 },
  { id: "goal_reached", name: "الهدف", icon: "🏆", category: "body", condition: (p: any) => p.goalReached === true },
  // Streak badges
  { id: "streak_7", name: "أسبوع", icon: "🔥", category: "streak", condition: (p: any) => p.longestStreak >= 7 },
  { id: "streak_30", name: "شهر 🔥", icon: "🔥🔥", category: "streak", condition: (p: any) => p.longestStreak >= 30 },
  { id: "streak_100", name: "مئة يوم", icon: "🔥🔥🔥", category: "streak", condition: (p: any) => p.longestStreak >= 100 },
];

// ============================================================
//  DEFAULT RECORD
// ============================================================

function defaultProgress(userId: any) {
  const today = new Date().toISOString().split("T")[0];
  return {
    userId,
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: xpForLevel(1),
    totalWorkouts: 0,
    totalMealsLogged: 0,
    totalWaterLiters: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: today,
    streakFreezeAvailable: true,
    badges: [],
  };
}

// ============================================================
//  QUERIES
// ============================================================

export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!progress) return { ...defaultProgress(userId), _id: null };
    return { ...progress, ...getTier(progress.level) };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const top = await ctx.db
      .query("userProgress")
      .withIndex("by_xp")
      .order("desc")
      .take(20);

    return Promise.all(
      top.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          ...entry,
          name: (user as any)?.name || "مستخدم",
          ...getTier(entry.level),
        };
      })
    );
  },
});

// ============================================================
//  MUTATIONS
// ============================================================

/** Internal helper: evaluate badges for a progress record (no DB calls needed) */
function evaluateBadges(progress: any, meta?: any): string[] {
  const earned = new Set<string>(progress.badges?.map((b: any) => b.id) ?? []);
  const newlyEarned: string[] = [];

  for (const badge of ALL_BADGES) {
    if (!earned.has(badge.id) && badge.condition(progress, meta)) {
      newlyEarned.push(badge.id);
    }
  }
  return newlyEarned;
}

/**
 * Award XP to the signed-in user for a given action.
 * Returns { leveledUp, oldLevel, newLevel, newBadges }
 */
export const awardXP = mutation({
  args: {
    action: v.union(
      v.literal("workout"),
      v.literal("meal"),
      v.literal("water"),
      v.literal("weigh_in"),
      v.literal("pr"),
      v.literal("weekly_challenge"),
      v.literal("early_bird"),
      v.literal("night_owl")
    ),
    meta: v.optional(v.object({
      earlyMorning: v.optional(v.boolean()),
      lateNight: v.optional(v.boolean()),
      waterLiters: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const today = new Date().toISOString().split("T")[0];

    // --- Fetch or initialize --------------------------------------------------
    let progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!progress) {
      const id = await ctx.db.insert("userProgress", defaultProgress(userId));
      progress = await ctx.db.get(id);
    }
    if (!progress) throw new Error("Failed to initialize progress");

    // --- Streak logic ---------------------------------------------------------
    let { currentStreak, longestStreak, lastActivityDate, streakFreezeAvailable } = progress;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (lastActivityDate === today) {
      // already counted today — no change
    } else if (lastActivityDate === yesterday) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // gap detected
      const gapDays = Math.floor(
        (new Date(today).getTime() - new Date(lastActivityDate).getTime()) / 86400000
      );
      if (gapDays === 2 && streakFreezeAvailable) {
        // use freeze
        streakFreezeAvailable = false;
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1; // reset
      }
    }

    // Weekly freeze recharge (every Monday)
    if (new Date(today).getDay() === 1 && !streakFreezeAvailable) {
      streakFreezeAvailable = true;
    }

    // --- Streak multiplier ----------------------------------------------------
    let multiplier = 1;
    if (currentStreak >= 30) multiplier = 2;
    else if (currentStreak >= 7) multiplier = 1.5;

    // --- Base XP per action --------------------------------------------------
    const BASE_XP: Record<string, number> = {
      workout: 50,
      meal: 10,
      water: 15,
      weigh_in: 10,
      pr: 100,
      weekly_challenge: 200,
      early_bird: 25,
      night_owl: 25,
    };

    const baseXP = BASE_XP[args.action] ?? 0;
    const earnedXP = Math.round(baseXP * multiplier);

    // --- Stat counters -------------------------------------------------------
    const updates: Record<string, any> = {
      totalXP: progress.totalXP + earnedXP,
      currentStreak,
      longestStreak,
      lastActivityDate: today,
      streakFreezeAvailable,
    };

    if (args.action === "workout") updates.totalWorkouts = (progress.totalWorkouts || 0) + 1;
    if (args.action === "meal") updates.totalMealsLogged = (progress.totalMealsLogged || 0) + 1;
    if (args.action === "water") {
      updates.totalWaterLiters = (progress.totalWaterLiters || 0) + (args.meta?.waterLiters ?? 2);
    }

    // --- Level recalculation -------------------------------------------------
    const newTotalXP = updates.totalXP as number;
    const levelInfo = getLevelInfo(newTotalXP);
    const oldLevel = progress.level;
    const leveledUp = levelInfo.level > oldLevel;

    updates.level = levelInfo.level;
    updates.currentLevelXP = levelInfo.currentLevelXP;
    updates.nextLevelXP = levelInfo.nextLevelXP;

    // --- Badge evaluation  ---------------------------------------------------
    const progressForBadges = { ...progress, ...updates };
    const metaForBadges = {
      earlyMorning: args.meta?.earlyMorning ?? false,
      lateNight: args.meta?.lateNight ?? false,
    };

    const newBadgeIds = evaluateBadges(progressForBadges, metaForBadges);
    const today2 = today;

    if (newBadgeIds.length > 0) {
      const newBadgeObjects = ALL_BADGES
        .filter((b) => newBadgeIds.includes(b.id))
        .map((b) => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          earnedDate: today2,
          category: b.category,
        }));
      updates.badges = [...(progress.badges ?? []), ...newBadgeObjects];
    }

    // --- Persist -------------------------------------------------------------
    await ctx.db.patch(progress._id, updates);

    return {
      earnedXP,
      newTotalXP,
      leveledUp,
      oldLevel,
      newLevel: levelInfo.level,
      newBadges: newBadgeIds,
      currentStreak,
      ...getTier(levelInfo.level),
    };
  },
});

// Export all badge definitions so the frontend can render them
export const getAllBadgeDefinitions = query({
  args: {},
  handler: async () => {
    return ALL_BADGES.map(({ id, name, icon, category }) => ({
      id, name, icon, category,
    }));
  },
});
