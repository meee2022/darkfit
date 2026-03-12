import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   HELPERS
========================= */

/**
 * ✅ يجيب البروفايل الحالي - بدون رمي error لو مافيش profile
 */
async function getMyProfile(ctx: any, throwError = true) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    if (throwError) throw new ConvexError("يجب تسجيل الدخول أولاً");
    return null;
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile && throwError) {
    throw new ConvexError("يجب إنشاء بروفايل أولاً");
  }

  return profile;
}

/**
 * ✅ التأكد إن الشخص مدرب/أدمن
 */
async function requireCoach(ctx: any) {
  const profile = await getMyProfile(ctx);
  if (!profile) throw new ConvexError("يجب إنشاء بروفايل أولاً");

  const isCoach =
    (profile as any).role === "admin" || (profile as any).isAdmin === true;

  if (!isCoach) {
    throw new ConvexError("هذه العملية متاحة للمدرب فقط");
  }

  return profile;
}

/* =========================
   WORKOUT TEMPLATES
========================= */

/**
 * إنشاء Template متعدد الأسابيع والأيام
 */
export const createWorkoutTemplate = mutation({
  args: {
    name: v.string(),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    daysPerWeek: v.optional(v.number()),
    days: v.array(
      v.object({
        weekNumber: v.number(),
        dayOfWeek: v.number(),
        label: v.optional(v.string()),
        exerciseIds: v.array(v.id("exercises")),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);

    if (args.days.length === 0) {
      throw new ConvexError("يجب إضافة يوم واحد على الأقل في الخطة");
    }

    // حساب عدد الأسابيع تلقائياً
    const weeksCount = Math.max(...args.days.map((d) => d.weekNumber), 1);

    const templateId = await ctx.db.insert("workoutTemplates", {
      coachProfileId: coach._id,
      name: args.name,
      nameAr: args.nameAr,
      description: args.description,
      notes: args.notes,
      level: args.level,
      daysPerWeek:
        args.daysPerWeek ??
        args.days.filter((d) => d.weekNumber === 1).length,
      weeksCount,
      createdAt: Date.now(),
    });

    // حفظ أيام الـ Template
    for (const d of args.days) {
      if (d.exerciseIds.length === 0) continue;
      await ctx.db.insert("workoutTemplateDays", {
        templateId,
        weekNumber: d.weekNumber,
        dayOfWeek: d.dayOfWeek,
        label: d.label,
        exerciseIds: d.exerciseIds,
        notes: d.notes,
      });
    }

    return templateId;
  },
});

/**
 * إسناد Template لمجموعة متدربين
 */
export const assignTemplateToClients = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    clientProfileIds: v.array(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);

    if (args.clientProfileIds.length === 0) {
      throw new ConvexError("يجب اختيار متدرب واحد على الأقل");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new ConvexError("Template غير موجود");
    }

    // جلب أيام الـ Template
    const templateDays = await ctx.db
      .query("workoutTemplateDays")
      .withIndex("by_template_week_day", (q: any) =>
        q.eq("templateId", args.templateId)
      )
      .collect();

    if (templateDays.length === 0) {
      throw new ConvexError("Template بلا أيام ولا تمارين");
    }

    // بناء الـ schedule
    const schedule = templateDays.map((d: any) => ({
      weekNumber: d.weekNumber,
      dayOfWeek: d.dayOfWeek,
      label: d.label,
      exerciseIds: d.exerciseIds,
    }));

    // جمع كل IDs التمارين (فلات)
    const allExerciseIdStrings = Array.from(
      new Set(
        templateDays.flatMap((d: any) =>
          d.exerciseIds.map((id: any) => String(id))
        )
      )
    );

    const allExerciseIds = allExerciseIdStrings.map((idStr) =>
      ctx.db.normalizeId("exercises", idStr)
    ) as any[];

    // إسناد لكل متدرب
    for (const clientId of args.clientProfileIds) {
      await ctx.db.insert("assignedPlans", {
        coachProfileId: coach._id,
        clientProfileId: clientId,
        type: "workout",
        workoutExerciseIds: allExerciseIds,
        schedule,
        nutritionPlanId: undefined,
        title: template.nameAr || template.name || "خطة تمارين",
        notes: template.notes || "",
        level: template.level,
        daysPerWeek: template.daysPerWeek,
        createdAt: Date.now(),
      });
    }

    return true;
  },
});

/**
 * جلب كل الـ Templates للمدرب
 */
export const getMyWorkoutTemplates = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);

    const templates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_coach", (q: any) => q.eq("coachProfileId", coach._id))
      .collect();

    return templates.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * جلب تفاصيل Template معين (الأسابيع والأيام)
 */
export const getTemplateDetails = query({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    const days = await ctx.db
      .query("workoutTemplateDays")
      .withIndex("by_template_week_day", (q: any) =>
        q.eq("templateId", args.templateId)
      )
      .collect();

    // جلب تفاصيل التمارين
    const allExerciseIds = Array.from(
      new Set(days.flatMap((d: any) => d.exerciseIds.map((id: any) => String(id))))
    );

    const exercises = await Promise.all(
      allExerciseIds.map(async (idStr) => {
        const id = ctx.db.normalizeId("exercises", idStr);
       return id ? await ctx.db.get(id) : null;
      })
    );

    const exerciseMap = new Map(
      exercises.filter(Boolean).map((ex: any) => [String(ex._id), ex])
    );

    const daysWithExercises = days.map((d: any) => ({
      ...d,
      exercises: d.exerciseIds
        .map((id: any) => exerciseMap.get(String(id)))
        .filter(Boolean),
    }));

    return {
      ...template,
      days: daysWithExercises.sort(
        (a, b) => a.weekNumber - b.weekNumber || a.dayOfWeek - b.dayOfWeek
      ),
    };
  },
});

/* =========================
   DIRECT PLAN ASSIGNMENT
========================= */

/**
 * المدرب يرسل خطة تمرين مباشرة (بدون Template)
 */
export const coachAssignWorkoutPlan = mutation({
  args: {
    clientProfileId: v.id("profiles"),
    exerciseIds: v.array(v.id("exercises")),
    title: v.string(),
    notes: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    daysPerWeek: v.optional(v.number()),
    schedule: v.optional(
      v.array(
        v.object({
          weekNumber: v.number(),
          dayOfWeek: v.number(),
          label: v.optional(v.string()),
          exerciseIds: v.array(v.id("exercises")),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const coachProfile = await requireCoach(ctx);

    if (args.exerciseIds.length === 0) {
      throw new ConvexError("يجب اختيار تمرين واحد على الأقل");
    }

    // Normalize IDs to ensure they are valid for the database
    const clientProfileId = ctx.db.normalizeId("profiles", args.clientProfileId);
    if (!clientProfileId) throw new ConvexError("معرف المتدرب غير صالح");

    const exerciseIds = args.exerciseIds
      .map(id => ctx.db.normalizeId("exercises", id))
      .filter(Boolean) as any[];

    const schedule = args.schedule?.map(day => ({
      ...day,
      exerciseIds: day.exerciseIds
        .map(id => ctx.db.normalizeId("exercises", id))
        .filter(Boolean) as any[]
    }));

    const planId = await ctx.db.insert("assignedPlans", {
      coachProfileId: coachProfile._id,
      clientProfileId,
      type: "workout",
      workoutExerciseIds: exerciseIds,
      schedule,
      title: args.title,
      notes: args.notes ?? "",
      level: args.level,
      daysPerWeek: args.daysPerWeek,
      createdAt: Date.now(),
    });

    return planId;
  },
});

/**
 * المدرب يرسل خطة تغذية
 */
export const coachAssignNutritionPlan = mutation({
  args: {
    clientProfileId: v.id("profiles"),
    nutritionPlanId: v.id("nutritionPlans"),
    title: v.string(),
    notes: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    daysPerWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const coachProfile = await requireCoach(ctx);

    await ctx.db.insert("assignedPlans", {
      coachProfileId: coachProfile._id,
      clientProfileId: args.clientProfileId,
      type: "nutrition",
      workoutExerciseIds: undefined,
      schedule: undefined,
      nutritionPlanId: args.nutritionPlanId,
      title: args.title,
      notes: args.notes ?? "",
      level: args.level,
      daysPerWeek: args.daysPerWeek,
      createdAt: Date.now(),
    });

    return true;
  },
});

/* =========================
   CLIENT QUERIES
========================= */

/**
 * ✅ المتدرب يشوف كل الخطط (بدون error للزائر)
 */
export const getMyAssignedPlans = query({
  args: {},
  handler: async (ctx) => {
    // ✅ لو مافيش profile، نرجع array فاضي بدل error
    const profile = await getMyProfile(ctx, false);
    if (!profile) return [];

    const plans = await ctx.db
      .query("assignedPlans")
      .withIndex("by_client", (q: any) => q.eq("clientProfileId", profile._id))
      .collect();

    // جلب كل التمارين مرة واحدة (performance optimization)
    const allExercises = await ctx.db.query("exercises").collect();
    const exerciseMap = new Map(
      allExercises.map((ex: any) => [String(ex._id), ex])
    );

    // بناء النتيجة
    const result: any[] = [];

    for (const plan of plans) {
      let workoutExercises: any[] | null = null;
      let nutritionPlan: any = null;

      // جلب التمارين لو خطة تمرين
      if (plan.type === "workout" && plan.workoutExerciseIds) {
        workoutExercises = plan.workoutExerciseIds
          .map((id: any) => exerciseMap.get(String(id)))
          .filter(Boolean);
      }

      // جلب خطة التغذية
      if (plan.type === "nutrition" && plan.nutritionPlanId) {
        nutritionPlan = await ctx.db.get(plan.nutritionPlanId);
      }

      result.push({
        _id: plan._id,
        type: plan.type,
        title: plan.title,
        notes: plan.notes,
        level: plan.level,
        daysPerWeek: plan.daysPerWeek,
        schedule: plan.schedule,
        createdAt: plan.createdAt,
        workoutExercises,
        nutritionPlan,
      });
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * حذف خطة معينة (للمتدرب أو المدرب)
 */
export const deletePlan = mutation({
  args: {
    planId: v.id("assignedPlans"),
  },
  handler: async (ctx, args) => {
    const profile = await getMyProfile(ctx);
    if (!profile) throw new ConvexError("يجب تسجيل الدخول");

    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new ConvexError("الخطة غير موجودة");

    const isOwner = String(plan.clientProfileId) === String(profile._id);
    const isCoach = String(plan.coachProfileId) === String(profile._id);

    if (!isOwner && !isCoach) {
      throw new ConvexError("لا يمكنك حذف هذه الخطة");
    }

    await ctx.db.delete(args.planId);
    return true;
  },
});
