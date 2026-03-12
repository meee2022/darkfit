import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// --- Progress Photos ---

export const getProgressPhotos = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const photos = await ctx.db
            .query("progressPhotos")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Sort by date descending
        return photos.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    },
});

export const addProgressPhoto = mutation({
    args: {
        storageId: v.string(),
        photoUrl: v.string(),
        date: v.string(),
        weight: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        await ctx.db.insert("progressPhotos", {
            userId,
            ...args,
        });
        return true;
    },
});

export const deleteProgressPhoto = mutation({
    args: { photoId: v.id("progressPhotos") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        const photo = await ctx.db.get(args.photoId);
        if (!photo || photo.userId !== userId) throw new ConvexError("Not found");

        await ctx.db.delete(args.photoId);
        return true;
    },
});

// --- Weight History ---

export const getWeightHistory = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const history = await ctx.db
            .query("weightHistory")
            .withIndex("by_user_date", (q) => q.eq("userId", userId))
            .collect();

        // Sort by date ascending for charts
        return history.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    },
});

export const addWeightLog = mutation({
    args: {
        weight: v.number(),
        date: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new ConvexError("Unauthorized");

        // Check if entry already exists for this date
        const existing = await ctx.db
            .query("weightHistory")
            .withIndex("by_user_date", (q) =>
                q.eq("userId", userId).eq("date", args.date)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                weight: args.weight,
                notes: args.notes,
            });
        } else {
            await ctx.db.insert("weightHistory", {
                userId,
                ...args,
            });
        }

        // Also update currentWeight in profiles
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { currentWeight: args.weight });
        }

        return true;
    },
});

export const getTargetWeight = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        return profile?.targetWeight || null;
    },
});

// --- Streaks ---

export const getStreaks = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const streak = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        return streak;
    },
});

// Used when user logs a workout
export const logActivityForStreak = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const todayDateObj = new Date();
        const today = todayDateObj.toISOString().split("T")[0]; // YYYY-MM-DD

        // get yesterday
        const yesterdayDateObj = new Date(todayDateObj);
        yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
        const yesterday = yesterdayDateObj.toISOString().split("T")[0];

        const streak = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!streak) {
            // First activity ever
            await ctx.db.insert("streaks", {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastWorkoutDate: today,
                totalWorkouts: 1,
            });
            return { currentStreak: 1 };
        }

        // If already logged today, do nothing but return streak
        if (streak.lastWorkoutDate === today) {
            return streak;
        }

        let newCurrentStreak = streak.currentStreak;

        // If last workout was yesterday, increment streak
        if (streak.lastWorkoutDate === yesterday) {
            newCurrentStreak += 1;
        } else {
            // Last workout was before yesterday, reset streak to 1
            newCurrentStreak = 1;
        }

        const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
        const newTotalWorkouts = streak.totalWorkouts + 1;

        await ctx.db.patch(streak._id, {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastWorkoutDate: today,
            totalWorkouts: newTotalWorkouts,
        });

        return { currentStreak: newCurrentStreak };
    },
});

// --- Achievements ---

export const getAchievements = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return achievements;
    },
});

export const unlockAchievement = mutation({
    args: { achievementId: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        // Check if already unlocked
        const existing = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("achievementId"), args.achievementId))
            .first();

        if (existing) return false;

        await ctx.db.insert("achievements", {
            userId,
            achievementId: args.achievementId,
            unlockedAt: Date.now(),
        });

        return true;
    },
});

// --- Dashboard Stats ---

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return {
                totalSessions: 0,
                totalCalories: 0,
                totalHours: 0,
                completion: 0,
            };
        }

        // Get total sessions from streaks
        const streak = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
            
        const totalSessions = streak?.totalWorkouts || 0;

        // Get all workout sessions to calculate calories and duration
        const sessions = await ctx.db
            .query("workoutSessions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let totalCalories = 0;
        let totalMinutes = 0;

        for (const session of sessions) {
            totalCalories += session.caloriesBurned || 0;
            totalMinutes += session.duration || 0;
        }

        const totalHours = Math.round(totalMinutes / 60);
        
        // Mock completion percentage based on a monthly goal of 20 sessions
        const completion = Math.min(100, Math.round((totalSessions / 20) * 100));

        return {
            totalSessions,
            totalCalories,
            totalHours,
            completion,
        };
    },
});
