import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ Sleep Trends ============
export const getSleepTrends = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const days = args.days || 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const records = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "sleep"))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Group and sort by date ascending
    return records
      .map(r => ({
        date: r.date,
        duration: r.sleepDuration || 0,
        quality: r.sleepQuality || "fair",
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// ============ Body Composition ============
export const getBodyComposition = query({
  args: { months: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const months = args.months || 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch all relevant records
    const fatRecords = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "bodyFat"))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    const muscleRecords = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "muscleMass"))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    const weightRecords = await ctx.db
      .query("weightHistory")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Group by Date
    const grouped: Record<string, { bodyFat?: number, muscleMass?: number, weight?: number }> = {};
    
    fatRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = {};
      grouped[r.date].bodyFat = r.bodyFat;
    });

    muscleRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = {};
      grouped[r.date].muscleMass = r.muscleMass;
    });

    weightRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = {};
      grouped[r.date].weight = r.weight;
    });

    // Convert to Array
    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// ============ Training Volume per Muscle ============
export const getTrainingVolume = query({
  args: { weeks: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const weeks = args.weeks || 4; // Fetch last X weeks
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch workout sessions
    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Aggregate Volume = Reps * Weight (or just Sets * Reps if weight missing)
    const volumeByMuscle: Record<string, number> = {};

    for (const session of sessions) {
      const exercise = await ctx.db.get(session.exerciseId);
      if (!exercise) continue;

      let sessionVolume = 0;
      for (let i = 0; i < session.sets; i++) {
        const reps = session.reps[i] || 0;
        const weight = session.weight?.[i] || 1; // Default to 1 to just count reps if bodyweight
        sessionVolume += (reps * weight);
      }

      const muscle = exercise.muscleGroupAr || exercise.muscleGroup;
      volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + sessionVolume;
    }

    return Object.entries(volumeByMuscle)
      .map(([muscle, volume]) => ({ muscle, volume }))
      .sort((a, b) => b.volume - a.volume);
  },
});

// ============ Comparative Analytics ============
export const getComparativeAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = new Date();
    
    // Define current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    
    // Define last month boundaries
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

    const allSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), lastMonthStart))
      .collect();

    const currentStats = { workouts: 0, calories: 0, duration: 0 };
    const previousStats = { workouts: 0, calories: 0, duration: 0 };

    for (const s of allSessions) {
      if (s.date >= currentMonthStart) {
        currentStats.workouts++;
        currentStats.calories += s.caloriesBurned || 0;
        currentStats.duration += s.duration || 0;
      } else if (s.date >= lastMonthStart && s.date <= lastMonthEnd) {
        previousStats.workouts++;
        previousStats.calories += s.caloriesBurned || 0;
        previousStats.duration += s.duration || 0;
      }
    }

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      current: currentStats,
      previous: previousStats,
      trends: {
        workouts: calcTrend(currentStats.workouts, previousStats.workouts),
        calories: calcTrend(currentStats.calories, previousStats.calories),
        duration: calcTrend(currentStats.duration, previousStats.duration),
      }
    };
  },
});
