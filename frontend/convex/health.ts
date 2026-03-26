import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ Health Records ============

export const addHealthRecord = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    recordType: v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("spo2"),
      v.literal("weight"),
      v.literal("height")
    ),
    glucoseValue: v.optional(v.number()),
    mealContext: v.optional(v.union(
      v.literal("fasting"),
      v.literal("beforeMeal"),
      v.literal("afterMeal"),
      v.literal("bedtime")
    )),
    systolic: v.optional(v.number()),
    diastolic: v.optional(v.number()),
    heartRate: v.optional(v.number()),
    spo2: v.optional(v.number()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("healthRecords", {
      userId,
      date: args.date,
      time: args.time,
      recordType: args.recordType,
      glucoseValue: args.glucoseValue,
      mealContext: args.mealContext,
      systolic: args.systolic,
      diastolic: args.diastolic,
      heartRate: args.heartRate,
      spo2: args.spo2,
      weight: args.weight,
      height: args.height,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const getHealthRecords = query({
  args: {
    recordType: v.optional(v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("spo2"),
      v.literal("weight"),
      v.literal("height")
    )),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let records;
    if (args.recordType) {
      records = await ctx.db
        .query("healthRecords")
        .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", args.recordType!))
        .order("desc")
        .collect();
    } else {
      records = await ctx.db
        .query("healthRecords")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      records = records.filter(r => {
        if (args.startDate && r.date < args.startDate) return false;
        if (args.endDate && r.date > args.endDate) return false;
        return true;
      });
    }

    // Apply limit
    if (args.limit) {
      records = records.slice(0, args.limit);
    }

    return records;
  },
});

export const getLatestGlucose = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const records = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "glucose"))
      .order("desc")
      .take(1);

    return records[0] || null;
  },
});

export const getLatestBloodPressure = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const records = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "bloodPressure"))
      .order("desc")
      .take(1);

    return records[0] || null;
  },
});

export const getTodayHealthRecords = query({
  args: {
    recordType: v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("spo2"),
      v.literal("weight"),
      v.literal("height")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];

    const records = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type_date", (q) => 
        q.eq("userId", userId).eq("recordType", args.recordType).eq("date", today)
      )
      .order("desc")
      .collect();

    return records;
  },
});

// ============ Medications ============

export const addMedication = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    type: v.union(
      v.literal("insulin"),
      v.literal("pill"),
      v.literal("injection"),
      v.literal("other")
    ),
    dosage: v.string(),
    frequency: v.string(),
    frequencyAr: v.string(),
    reminderTimes: v.array(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("medications", {
      userId,
      name: args.name,
      nameAr: args.nameAr,
      type: args.type,
      dosage: args.dosage,
      frequency: args.frequency,
      frequencyAr: args.frequencyAr,
      reminderTimes: args.reminderTimes,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      icon: args.icon,
      createdAt: Date.now(),
    });
  },
});

export const getActiveMedications = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("medications")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();
  },
});

export const logMedication = mutation({
  args: {
    medicationId: v.id("medications"),
    date: v.string(),
    time: v.string(),
    taken: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("medicationLogs", {
      userId,
      medicationId: args.medicationId,
      date: args.date,
      time: args.time,
      taken: args.taken,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const getTodayMedicationLogs = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("medicationLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
  },
});

// ============ Health Tasks ============

export const addHealthTask = mutation({
  args: {
    task: v.string(),
    taskAr: v.string(),
    category: v.union(
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children"),
      v.literal("general")
    ),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("healthTasks", {
      userId,
      task: args.task,
      taskAr: args.taskAr,
      category: args.category,
      frequency: args.frequency,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const getHealthTasks = query({
  args: {
    category: v.optional(v.union(
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children"),
      v.literal("general")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.category) {
      return await ctx.db
        .query("healthTasks")
        .withIndex("by_user_category", (q) => q.eq("userId", userId).eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    return await ctx.db
      .query("healthTasks")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();
  },
});

export const logHealthTask = mutation({
  args: {
    taskId: v.id("healthTasks"),
    date: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check if log already exists for today
    const existing = await ctx.db
      .query("healthTaskLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .first();

    if (existing) {
      // Update existing log
      await ctx.db.patch(existing._id, {
        completed: args.completed,
      });
      return existing._id;
    }

    // Create new log
    return await ctx.db.insert("healthTaskLogs", {
      userId,
      taskId: args.taskId,
      date: args.date,
      completed: args.completed,
      createdAt: Date.now(),
    });
  },
});

export const getTodayHealthTaskLogs = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("healthTaskLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
  },
});

// ============ Child Growth Records ============

export const addChildGrowthRecord = mutation({
  args: {
    childId: v.optional(v.id("profiles")),
    date: v.string(),
    weight: v.number(),
    height: v.number(),
    headCircumference: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("childGrowthRecords", {
      userId,
      childId: args.childId,
      date: args.date,
      weight: args.weight,
      height: args.height,
      headCircumference: args.headCircumference,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const getChildGrowthRecords = query({
  args: {
    childId: v.optional(v.id("profiles")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let records;
    if (args.childId) {
      records = await ctx.db
        .query("childGrowthRecords")
        .withIndex("by_child", (q) => q.eq("childId", args.childId))
        .order("desc")
        .collect();
    } else {
      records = await ctx.db
        .query("childGrowthRecords")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    if (args.limit) {
      records = records.slice(0, args.limit);
    }

    return records;
  },
});

// ============ Activity Records ============

export const addActivityRecord = mutation({
  args: {
    date: v.string(),
    activityType: v.union(
      v.literal("walking"),
      v.literal("running"),
      v.literal("playing"),
      v.literal("exercise"),
      v.literal("other")
    ),
    duration: v.number(),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("activityRecords", {
      userId,
      date: args.date,
      activityType: args.activityType,
      duration: args.duration,
      caloriesBurned: args.caloriesBurned,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const getTodayActivityRecords = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("activityRecords")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
  },
});

export const getActivityRecords = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let records = await ctx.db
      .query("activityRecords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Filter by date range
    if (args.startDate || args.endDate) {
      records = records.filter(r => {
        if (args.startDate && r.date < args.startDate) return false;
        if (args.endDate && r.date > args.endDate) return false;
        return true;
      });
    }

    if (args.limit) {
      records = records.slice(0, args.limit);
    }

    return records;
  },
});

// ============ Statistics ============

export const getGlucoseStats = query({
  args: {
    days: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const days = args.days || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const records = await ctx.db
      .query("healthRecords")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("recordType", "glucose"))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    if (records.length === 0) return null;

    const values = records.map(r => r.glucoseValue || 0).filter(v => v > 0);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    return {
      average: Math.round(average),
      highest,
      lowest,
      count: values.length,
      records: records.slice(0, 10), // Last 10 readings
    };
  },
});
