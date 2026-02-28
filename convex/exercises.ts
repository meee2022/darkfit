import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// تحميل التمارين المختارة من JSON
const pickedExercises = require("./picked-exercises.json");

/* =========================
   Helpers
========================= */
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile?.isAdmin) {
    throw new ConvexError("ليس لديك صلاحية لإجراء هذه العملية");
  }
  return { userId, profile };
}

// دالة لتحويل muscleGroup من JSON إلى قيمة صحيحة في Schema
function mapMuscleGroup(primary: string): string {
  const p = primary.toLowerCase();

  if (p.includes("chest") || p.includes("pector")) return "Chest";
  if (p.includes("trap")) return "Traps";
  if (p.includes("lat")) return "Lats";
  if (p.includes("shoulder") || p.includes("deltoid")) return "shoulders";
  if (p.includes("bicep")) return "Biceps";
  if (p.includes("tricep")) return "Triceps";
  if (p.includes("forearm")) return "Forearms";
  if (p.includes("abs") || p.includes("abdom") || p.includes("core") || p.includes("waist")) return "Abs";
  if (p.includes("oblique")) return "Obliques";
  if (p.includes("quad") || p.includes("thigh")) return "Quads";
  if (p.includes("hamstring")) return "Hamstrings";
  if (p.includes("glute")) return "Glutes";
  if (p.includes("calf")) return "Calf";
  if (p.includes("back")) return "Lats"; // back عام → Lats

  return "Chest"; // افتراضي
}

// دالة لتحويل muscleGroup إلى عربي
function getMuscleGroupAr(muscleGroup: string): string {
  const map: Record<string, string> = {
    "Chest": "الصدر",
    "Traps": "الترابيس",
    "shoulders": "الأكتاف",
    "Biceps": "البايسبس",
    "Triceps": "الترايسبس",
    "Forearms": "الساعد",
    "Abs": "البطن",
    "Obliques": "الجوانب",
    "Quads": "الفخذ الأمامي",
    "Quadriceps": "الفخذ الأمامي",
    "Lats": "الظهر العلوي",
    "Calf": "السمانة",
    "Hamstrings": "الفخذ الخلفي",
    "Glutes": "الأرداف",
    "upperback": "الظهر العلوي",
    "LowerBackErectorSpinae": "أسفل الظهر",
    "RearShoulderRearDeltoid": "الكتف الخلفي",
  };
  return map[muscleGroup] || "أخرى";
}

/* =========================
   QUERIES
========================= */

export const getAllExercises = query({
  args: {
    muscleGroup: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    category: v.optional(
      v.union(
        v.literal("strength"),
        v.literal("cardio"),
        v.literal("flexibility"),
        v.literal("balance")
      )
    ),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("exercises")
      .filter((x) => x.eq(x.field("isActive"), true));

    if (args.muscleGroup) {
      q = q.filter((x) => x.eq(x.field("muscleGroup"), args.muscleGroup));
    }

    if (args.difficulty) {
      q = q.filter((x) => x.eq(x.field("difficulty"), args.difficulty));
    }

    if (args.gender) {
      q = q.filter((x) =>
        x.or(
          x.eq(x.field("targetGender"), args.gender),
          x.eq(x.field("targetGender"), "both")
        )
      );
    }

    if (args.category) {
      q = q.filter((x) => x.eq(x.field("category"), args.category));
    }

    return await q.collect();
  },
});

export const listExerciseOptions = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("exercises")
      .filter((x) => x.eq(x.field("isActive"), true))
      .collect();

    return rows
      .map((e: any) => ({
        _id: e._id,
        name: e.name,
        nameAr: e.nameAr,
        muscleGroup: e.muscleGroup,
        difficulty: e.difficulty,
      }))
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  },
});

export const adminListExercises = query({
  args: {
    q: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 500;

    let q = ctx.db.query("exercises");

    if (!args.includeInactive) {
      q = q.filter((x) => x.eq(x.field("isActive"), true));
    }

    const items = await q.collect();

    let filtered = items;
    if (args.q) {
      const s = args.q.toLowerCase();
      filtered = items.filter((x: any) =>
        (x.nameAr || "").toLowerCase().includes(s) ||
        (x.name || "").toLowerCase().includes(s) ||
        (x.muscleGroupAr || "").toLowerCase().includes(s)
      );
    }

    return filtered.slice(0, limit);
  },
});

/* =========================
   MUTATIONS (ADMIN)
========================= */
export const addExercise = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    muscleGroup: v.union(
      v.literal("Traps"),
      v.literal("shoulders"),
      v.literal("Chest"),
      v.literal("Biceps"),
      v.literal("Forearms"),
      v.literal("Abs"),
      v.literal("Obliques"),
      v.literal("Quads"),
      v.literal("Quadriceps"),
      v.literal("Lats"),
      v.literal("Triceps"),
      v.literal("Calf"),
      v.literal("Hamstrings"),
      v.literal("Glutes"),
      v.literal("upperback"),
      v.literal("LowerBackErectorSpinae"),
      v.literal("RearShoulderRearDeltoid")
    ),
    muscleGroupAr: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    equipment: v.array(v.string()),
    instructions: v.array(v.string()),
    instructionsAr: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    reps: v.optional(v.string()),
    sets: v.optional(v.number()),
    caloriesBurned: v.optional(v.number()),
    targetGender: v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("both")
    ),
    category: v.union(
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("flexibility"),
      v.literal("balance")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("exercises", {
      ...args,
      isActive: true,
    });
  },
});

export const updateExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    muscleGroup: v.optional(
      v.union(
        v.literal("Traps"),
        v.literal("shoulders"),
        v.literal("Chest"),
        v.literal("Biceps"),
        v.literal("Forearms"),
        v.literal("Abs"),
        v.literal("Obliques"),
        v.literal("Quads"),
        v.literal("Quadriceps"),
        v.literal("Lats"),
        v.literal("Triceps"),
        v.literal("Calf"),
        v.literal("Hamstrings"),
        v.literal("Glutes"),
        v.literal("upperback"),
        v.literal("LowerBackErectorSpinae"),
        v.literal("RearShoulderRearDeltoid")
      )
    ),
    muscleGroupAr: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    equipment: v.optional(v.array(v.string())),
    instructions: v.optional(v.array(v.string())),
    instructionsAr: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    reps: v.optional(v.string()),
    sets: v.optional(v.number()),
    caloriesBurned: v.optional(v.number()),
    targetGender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("both"))
    ),
    category: v.optional(
      v.union(
        v.literal("strength"),
        v.literal("cardio"),
        v.literal("flexibility"),
        v.literal("balance")
      )
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { exerciseId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(exerciseId, cleanUpdates);
    return true;
  },
});

export const deleteExercise = mutation({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.exerciseId);
    return true;
  },
});

/* =========================
   USER WORKOUT TRACKING
========================= */

export const logWorkoutSession = mutation({
  args: {
    exerciseId: v.id("exercises"),
    duration: v.number(),
    sets: v.number(),
    reps: v.array(v.number()),
    weight: v.optional(v.array(v.number())),
    caloriesBurned: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const exercise = await ctx.db.get(args.exerciseId);
    if (!exercise || (exercise as any).isActive === false) {
      throw new ConvexError("التمرين غير متوفر");
    }

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db.insert("workoutSessions", {
      userId,
      date: today,
      ...args,
    });
  },
});

export const getUserWorkoutStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let q = ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (x) => x.eq("userId", userId));

    if (args.startDate) {
      q = q.filter((x) => x.gte(x.field("date"), args.startDate!));
    }
    if (args.endDate) {
      q = q.filter((x) => x.lte(x.field("date"), args.endDate!));
    }

    const sessions = await q.collect();

    const totalSessions = sessions.length;
    const totalCaloriesBurned = sessions.reduce(
      (sum, s: any) => sum + (s.caloriesBurned || 0),
      0
    );
    const totalDuration = sessions.reduce(
      (sum, s: any) => sum + (s.duration || 0),
      0
    );

    return {
      totalSessions,
      totalCaloriesBurned,
      totalDuration,
      averageCaloriesPerSession: totalSessions
        ? Math.round(totalCaloriesBurned / totalSessions)
        : 0,
      averageDurationPerSession: totalSessions
        ? Math.round(totalDuration / totalSessions)
        : 0,
    };
  },
});

export const getUserWorkoutHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (x) => x.eq("userId", userId))
      .collect();

    const enriched = await Promise.all(
      sessions.map(async (s: any) => {
        const ex = await ctx.db.get(s.exerciseId);
        return {
          ...s,
          exerciseNameAr: (ex as any)?.nameAr || (ex as any)?.name || "تمرين",
          exerciseNameEn: (ex as any)?.name || "Exercise",
          muscleGroupAr: (ex as any)?.muscleGroupAr || "عضلة",
          muscleGroup: (ex as any)?.muscleGroup || "Muscle",
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});


export const internalUpdateTranslation = mutation({
  args: {
    exerciseId: v.id("exercises"),
    nameAr: v.string(),
    descriptionAr: v.string(),
    instructionsAr: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { exerciseId, ...data } = args;
    await ctx.db.patch(exerciseId, data);
    return true;
  },
});

export const internalResetUntranslatedNames = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("exercises").collect();
    let reset = 0;

    for (const ex of all) {
      let needsUpdate = false;
      const updates: any = {};

      if (ex.nameAr === ex.name && ex.name) {
        updates.nameAr = "";
        needsUpdate = true;
      }

      const defaultInstructions = [
        "اتبع نفس خطوات النسخة الإنجليزية للتمرين.",
        "اتبع التعليمات",
      ];

      if (Array.isArray(ex.instructionsAr) && ex.instructionsAr.length > 0) {
        const firstInstruction = String(ex.instructionsAr[0] || "").trim();

        if (defaultInstructions.some(def => firstInstruction.includes(def))) {
          updates.instructionsAr = [];
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await ctx.db.patch(ex._id, updates);
        reset++;
      }
    }

    return reset;
  },
});

/* =========================
   SEED FROM external JSON
========================= */

export const seedExternalExercises = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const baseImageUrl =
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

    const existing = await ctx.db.query("exercises").collect();
    const existingNames = new Set(
      existing.map((e: any) => String(e.name).toLowerCase())
    );

    let inserted = 0;

    for (const ex of pickedExercises as any[]) {
      const name = String(ex.name || "").trim();
      if (!name) continue;

      if (existingNames.has(name.toLowerCase())) continue;

      const primary = (ex.primaryMuscles?.[0] || "").toLowerCase();

      // تحويل muscleGroup للقيم الصحيحة
      const muscleGroup = mapMuscleGroup(primary);
      const muscleGroupAr = getMuscleGroupAr(muscleGroup);

      const level = (ex.level || "").toLowerCase();
      let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
      if (level.includes("beginner") || level.includes("novice")) {
        difficulty = "beginner";
      } else if (level.includes("expert") || level.includes("advanced")) {
        difficulty = "advanced";
      }

      const imagePath = ex.images?.[0];
      const imageUrl = imagePath ? baseImageUrl + imagePath : undefined;

      const eqRaw = (ex as any).equipment;
      const equipment =
        Array.isArray(eqRaw) && eqRaw.length > 0
          ? eqRaw.map((s: any) => String(s))
          : eqRaw
            ? [String(eqRaw)]
            : [];

      const categoryRaw = (ex.category || "").toLowerCase();
      const category: "cardio" | "strength" = categoryRaw.includes("cardio")
        ? "cardio"
        : "strength";

      await ctx.db.insert("exercises", {
        name,
        nameAr: "",
        description: `Exercise targeting ${primary || "selected muscles"}.`,
        descriptionAr: "تمرين يستهدف هذه العضلات.",
        muscleGroup: muscleGroup as any,
        muscleGroupAr,
        difficulty,
        equipment,
        instructions: ex.instructions || [],
        instructionsAr: ["اتبع نفس خطوات النسخة الإنجليزية للتمرين."],
        imageUrl,
        videoUrl: undefined,
        duration: undefined,
        reps: "8-12",
        sets: 3,
        caloriesBurned: 100,
        targetGender: "both" as any,
        category,
        isActive: true,
      });

      existingNames.add(name.toLowerCase());
      inserted += 1;
    }

    return inserted;
  },
});
