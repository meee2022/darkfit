import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

/**
 * Deletes all data associated with the current user.
 * This action is irreversible.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // 1. Get the user's profile to handle profile-linked tables
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const profileId = profile?._id;

    // --- HELPER: Delete all records for a given filter ---
    const deleteBatch = async (table: string, indexName: string, fieldName: string, value: any) => {
      const records = await ctx.db
        .query(table as any)
        .withIndex(indexName, (q: any) => q.eq(fieldName, value))
        .collect();
      
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    };

    // 2. Delete data linked by userId
    const tablesByUserId = [
      "workoutSessions",
      "nutritionLogs",
      "fitbotChats",
      "healthRecords",
      "medications",
      "medicationLogs",
      "healthTasks",
      "healthTaskLogs",
      "childGrowthRecords",
      "activityRecords",
      "progressPhotos",
      "weightHistory",
      "streaks",
      "achievements",
      "dailyCheckins",
      "aiInsights"
    ];

    for (const table of tablesByUserId) {
      // Assuming all these have a 'by_user' index on 'userId' as per schema
      await deleteBatch(table, "by_user", "userId", userId);
    }

    // 3. Delete data linked by profileId (clientProfileId)
    if (profileId) {
      const tablesByProfileId = [
        "coachClients",
        "assignedPlans",
        "userNutritionPlans"
      ];

      for (const table of tablesByProfileId) {
        // Assuming all these have a 'by_client' index on 'clientProfileId'
        await deleteBatch(table, "by_client", "clientProfileId", profileId);
      }

      // 3.1 Handle Coach-specific data: Workout Templates
      const templates = await ctx.db
        .query("workoutTemplates")
        .withIndex("by_coach", (q) => q.eq("coachProfileId", profileId))
        .collect();
      
      for (const template of templates) {
        // Delete template days
        const days = await ctx.db
          .query("workoutTemplateDays")
          .withIndex("by_template_week_day", (q) => q.eq("templateId", template._id))
          .collect();
        for (const day of days) {
          await ctx.db.delete(day._id);
        }
        // Delete template
        await ctx.db.delete(template._id);
      }

      // Special case: coachClients where user might be the coach (though rare for a user deleting account)
      await deleteBatch("coachClients", "by_coach", "coachProfileId", profileId);
      
      // Delete the profile itself
      await ctx.db.delete(profileId);
    }

    // 4. Finally, delete the user entry from the auth system
    await ctx.db.delete(userId);

    return { success: true };
  },
});
