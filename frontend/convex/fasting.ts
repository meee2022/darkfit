import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSettings = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("fastingSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    mode: v.union(v.literal("ramadan"), v.literal("intermittent"), v.literal("off")),
    intermittentType: v.optional(v.string()),
    fastingStartTime: v.optional(v.string()),
    fastingEndTime: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      city: v.string(),
    })),
    iftarTime: v.optional(v.string()),
    suhoorTime: v.optional(v.string()),
    autoReduceIntensity: v.boolean(),
    suhoorReminder: v.boolean(),
    waterReminder: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("fastingSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const payload = {
      ...args,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("fastingSettings", {
        userId,
        ...payload,
      });
    }

    return true;
  },
});
