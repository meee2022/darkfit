import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_SETTINGS = {
  city: "Riyadh",
  country: "SA",
  prayerTimesEnabled: true,
  suggestWorkoutTime: true,
  prayerAlertBefore: true,
  hotClimateMode: "auto" as const,
  heatThreshold: 38,
  waterReminderBoost: true,
};

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const settings = await ctx.db
      .query("regionSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return settings ?? { ...DEFAULT_SETTINGS, userId };
  },
});

export const updateSettings = mutation({
  args: {
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    prayerTimesEnabled: v.optional(v.boolean()),
    suggestWorkoutTime: v.optional(v.boolean()),
    prayerAlertBefore: v.optional(v.boolean()),
    hotClimateMode: v.optional(v.union(v.literal("auto"), v.literal("on"), v.literal("off"))),
    heatThreshold: v.optional(v.number()),
    waterReminderBoost: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("regionSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const updates = { ...args, lastUpdated: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("regionSettings", {
        userId,
        ...DEFAULT_SETTINGS,
        ...updates,
      });
    }
    return true;
  },
});
