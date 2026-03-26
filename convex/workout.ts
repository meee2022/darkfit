import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { getAuthUserId } from "@convex-dev/auth/server";

// Formula to calculate Estimated 1 Rep Max (Epley Formula)
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + 0.0333 * reps);
}

// Get exercise history for a user to show charts and previous performance
export const getExerciseHistory = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const history = await ctx.db
      .query("workoutSets")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .order("desc")
      .take(50); // Get last 50 sessions

    return history;
  },
});

// Get all workout history for the user to populate the progression charts
export const getUserWorkoutHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("workoutSets")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Save new workout sets and check for PR
export const saveWorkoutSets = mutation({
  args: {
    exerciseId: v.string(),
    date: v.string(),
    sets: v.array(
      v.object({
        setNumber: v.number(),
        weight: v.number(),
        reps: v.number(),
        isWarmup: v.boolean(),
        rpe: v.optional(v.number()),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    // Fetch previous max 1RM for this exercise
    const previousSets = await ctx.db
      .query("workoutSets")
      .withIndex("by_user_exercise", (q) =>
        q.eq("userId", userId).eq("exerciseId", args.exerciseId)
      )
      .collect();

    const historicalMax1RM = previousSets.reduce(
      (max, session) => Math.max(max, session.estimatedOneRepMax),
      0
    );

    let sessionMax1RM = 0;
    let totalVolume = 0;
    let newPRSet = false;

    // Process sets to flag PRs
    const processedSets = args.sets.map((set) => {
      const vol = set.weight * set.reps;
      if (!set.isWarmup) {
        totalVolume += vol;
      }

      const current1RM = calculate1RM(set.weight, set.reps);
      let isPR = false;

      // PR logic: Not a warmup, and 1RM is greater than historical max
      if (!set.isWarmup && current1RM > historicalMax1RM && current1RM > sessionMax1RM) {
        isPR = true;
        newPRSet = true;
      }

      if (!set.isWarmup) {
        sessionMax1RM = Math.max(sessionMax1RM, current1RM);
      }

      return {
        ...set,
        isPR,
      };
    });

    // Check if updating an existing record for the same day
    const existingToday = await ctx.db
      .query("workoutSets")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
      .unique();

    if (existingToday) {
      // OVERRIDE historical logic for the same day (re-calculates max without doubling)
      await ctx.db.patch(existingToday._id, {
        sets: processedSets,
        estimatedOneRepMax: sessionMax1RM,
        totalVolume,
        notes: args.notes,
      });
      return { id: existingToday._id, isNewPR: newPRSet, estimatedOneRepMax: sessionMax1RM };
    }

    // Insert new
    const id = await ctx.db.insert("workoutSets", {
      userId,
      exerciseId: args.exerciseId,
      date: args.date,
      sets: processedSets,
      estimatedOneRepMax: sessionMax1RM,
      totalVolume,
      notes: args.notes,
    });

    return { 
      id: existingToday ? (existingToday as any)._id : id, 
      isNewPR: newPRSet, 
      estimatedOneRepMax: sessionMax1RM,
      increase: newPRSet ? (sessionMax1RM - historicalMax1RM) : 0
    };
  },
});

/* =========================
   PERSONAL RECORDS (PR Board)
========================= */
export const getPersonalRecords = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allSets = await ctx.db
      .query("workoutSets")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .collect();

    // Find the best PR per exercise
    const prMap: Record<string, { exerciseId: string; weight: number; reps: number; oneRepMax: number; date: string }> = {};

    for (const session of allSets) {
      for (const set of session.sets) {
        if (set.isPR && !set.isWarmup && set.weight > 0) {
          const existing = prMap[session.exerciseId];
          const current1RM = calculate1RM(set.weight, set.reps);
          if (!existing || current1RM > existing.oneRepMax) {
            prMap[session.exerciseId] = {
              exerciseId: session.exerciseId,
              weight: set.weight,
              reps: set.reps,
              oneRepMax: Math.round(current1RM),
              date: session.date,
            };
          }
        }
      }
    }

    // Join with exercise names
    const prs = Object.values(prMap);
    const enriched = await Promise.all(
      prs.map(async (pr) => {
        // Try to get exercise by ID (might be a virtual exercise or real one)
        try {
          const ex = await ctx.db.get(pr.exerciseId as any);
          return {
            ...pr,
            exerciseName: (ex as any)?.name || pr.exerciseId,
            exerciseNameAr: (ex as any)?.nameAr || pr.exerciseId,
          };
        } catch {
          return {
            ...pr,
            exerciseName: pr.exerciseId,
            exerciseNameAr: pr.exerciseId,
          };
        }
      })
    );

    // Sort by 1RM descending and take top 8
    return enriched
      .sort((a, b) => b.oneRepMax - a.oneRepMax)
      .slice(0, 8);
  },
});
