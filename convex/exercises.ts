import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
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

    const results = await q.collect();

    // Virtual injection of missing fly exercises
    const injectables = [
      {
        _id: "virtual_dumbbell_fly",
        name: "Dumbbell Flyes",
        nameAr: "تفتيح صدر بالدمبل (فلايز)",
        description: "Exercise targeting the chest muscles (Pectoralis Major).",
        descriptionAr: "حركة عزل تستهدف عضلات الصدر.",
        muscleGroup: "Chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate",
        equipment: ["dumbbell", "flat bench"],
        instructions: [
          "Lie on a flat bench with a dumbbell in each hand, palms facing each other.",
          "Lift the dumbbells above your chest with a slight bend in your elbows.",
          "Lower your arms to the sides in a wide arc until you feel a stretch in your chest.",
          "Return to the starting position by squeezing your chest muscles."
        ],
        instructionsAr: [
            "استلقِ على بنش مستوٍ مع الإمساك بدمبل في كل يد، مع تقابل الراحتين.",
            "ارفع الدمبلز فوق صدرك مع الحفاظ على انحناء بسيط جداً في المرفقين.",
            "أنزل ذراعيك إلى الجانبين ببطء في قوس واسع حتى تشعر بتمدد في عضلات الصدر.",
            "أعد ذراعيك لوضع البداية عن طريق عصر عضلات الصدر بقوة."
        ],
        imageUrl: "https://image.mux.com/wtXNqDUH5CRaPNFgqZBnzkYMMyHT1Yx3i2JoSWaJi7E/animated.gif?height=320&start=1&width=320",
        isActive: true,
        category: "strength",
        targetGender: "both"
      },
      {
        _id: "virtual_pec_deck_fly",
        name: "Pec Deck Fly",
        nameAr: "تفتيح صدر بالآلة (بيكتورال فلاي)",
        description: "Machine-based isolation exercise for the chest muscles.",
        descriptionAr: "تمرين عزل باستخدام الآلة لعضلات الصدر.",
        muscleGroup: "Chest",
        muscleGroupAr: "الصدر",
        difficulty: "beginner",
        equipment: ["machine"],
        instructions: [
          "Sit on the machine with your back flat against the pad. Grip the handles.",
          "Squeeze your chest muscles to bring the handles together until they meet in the center.",
          "Pause for a second at the peak contraction.",
          "Slowly return to the starting position, maintaining control."
        ],
        instructionsAr: [
          "اجلس على الآلة مع إبقاء ظهرك مستوياً تماماً على المسند. أمسك بالمقابض.",
          "اعصر عضلات الصدر لتقريب المقابض من بعضها حتى تلتقي في المنتصف.",
          "توقف لمدة ثانية عند أقصى انقباض للعضلة.",
          "عُد ببطء إلى وضع البداية مع الحفاظ على التحكم في الحركة."
        ],
        imageUrl: "https://image.mux.com/tF025fWUYIlvmLXUWLSOboTvl02dVUoShB00hVsaaDpD7w/animated.gif",
        isActive: true,
        category: "strength",
        targetGender: "both"
      }
    ];

    for (const item of injectables) {
        if (!results.some(r => r.nameAr === item.nameAr)) {
            // Only inject if it matches filters
            let matches = true;
            if (args.muscleGroup && item.muscleGroup !== args.muscleGroup) matches = false;
            if (args.difficulty && item.difficulty !== args.difficulty) matches = false;
            if (args.category && item.category !== args.category) matches = false;
            
            if (matches) {
                // @ts-ignore
                results.push({ ...item, _creationTime: Date.now() });
            }
        }
    }

    return results;
  },
});

export const listExerciseOptions = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("exercises")
      .filter((x) => x.eq(x.field("isActive"), true))
      .collect();

    // Virtual injection
    const injectables = [
        { _id: "virtual_dumbbell_fly" as any, name: "Dumbbell Flyes", nameAr: "تفتيح صدر بالدمبل (فلايز)" },
        { _id: "virtual_pec_deck_fly" as any, name: "Pec Deck Fly", nameAr: "تفتيح صدر بالآلة (بيكتورال فلاي)" }
    ];

    for (const item of injectables) {
        if (!rows.some(r => r.nameAr === item.nameAr)) {
            rows.push(item as any);
        }
    }

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

/* =========================
   UPDATE EXERCISE GIFs FROM ExerciseDB
========================= */

// Internal mutation to get all exercises
export const getAllExercisesInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exercises").collect();
  },
});

// Internal mutation to update a single exercise's imageUrl
export const updateExerciseImageUrl = internalMutation({
  args: {
    exerciseId: v.id("exercises"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.exerciseId, { imageUrl: args.imageUrl });
  },
});

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


export const applyGifs = internalMutation({
  args: {
    items: v.any(), // array from RapidAPI
  },
  handler: async (ctx, args): Promise<number> => {
    let inserted = 0;
    
    // Ensure items is an array
    let items: any[] = [];
    if (Array.isArray(args.items)) {
      items = args.items;
    } else if (args.items && Array.isArray(args.items.data)) {
      items = args.items.data;
    }

    const existing = await ctx.db.query("exercises").collect();
    // Normalize existing names to match against
    const existingNames = new Map(existing.map((e: any) => [String(e.name).toLowerCase().trim(), e]));

    for (const item of items) {
      const name = String(item.name || "").trim();
      if (!name) continue;
      
      // Build GIF URL from the exercise id (ExerciseDB CDN pattern)
      const exerciseId: string = item.id || "";
      const gifUrl: string = item.gifUrl || 
        (exerciseId ? `https://v2.exercisedb.io/image/${exerciseId}` : "");
      if (!gifUrl) continue;
      
      const normalizedName = name.toLowerCase();
      
      if (existingNames.has(normalizedName)) {
         const match = existingNames.get(normalizedName);
         if (match && match.imageUrl !== gifUrl) {
            await ctx.db.patch(match._id, { imageUrl: gifUrl });
            inserted++;
         }
         continue;
      }
      
      // If it doesn't exist, Insert new exercise with GIF
      const primary = String(item.target || "").toLowerCase();
      const muscleGroup = mapMuscleGroup(primary);
      const muscleGroupAr = getMuscleGroupAr(muscleGroup);
      
      const difficultyRaw = String(item.difficulty || "intermediate").toLowerCase();
      const difficulty: "beginner" | "intermediate" | "advanced" = 
        (difficultyRaw === "beginner" || difficultyRaw === "advanced") ? difficultyRaw : "intermediate";
      
      const equipmentRaw = item.equipment ? [String(item.equipment)] : [];
      
      await ctx.db.insert("exercises", {
        name,
        nameAr: "",
        description: item.description || `Exercise targeting ${primary}.`,
        descriptionAr: "تمرين يستهدف هذه العضلات.",
        muscleGroup: muscleGroup as any,
        muscleGroupAr,
        difficulty,
        equipment: equipmentRaw,
        instructions: item.instructions || [],
        instructionsAr: ["اتبع التعليمات والصورة المتحركة."],
        imageUrl: gifUrl,
        videoUrl: undefined,
        duration: undefined,
        reps: "8-12",
        sets: 3,
        caloriesBurned: 100,
        targetGender: "both" as any,
        category: "strength",
        isActive: true,
      });

      existingNames.set(normalizedName, { name, imageUrl: gifUrl } as any);
      inserted++;
    }
    
    return inserted;
  }
});

// Action: Fetch GIFs from the free open ExerciseDB V2 API - no key required!
export const fetchExerciseDbGifs = action({
  args: {},
  handler: async (ctx) => {
    // Try the open ExerciseDB V2 API first (no key required, full dataset with gifUrl)
    let exercises: any[] = [];

    const urls = [
      'https://v2.exercisedb.dev/exercises?limit=1300',
      'https://exercisedb-api.vercel.app/api/v1/exercises?limit=1300',
    ];

    for (const url of urls) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const items = Array.isArray(data) ? data : (data.data || data.exercises || []);
        if (items.length > 0) {
          exercises = items;
          break;
        }
      } catch {
        continue;
      }
    }

    if (exercises.length === 0) {
      throw new Error("All API sources failed. Please try again later.");
    }

    const insertedOrUpdated = (await ctx.runMutation(internal.exercises.applyGifs, { items: exercises })) as number;

    return { success: true, insertedOrUpdated, totalFetched: exercises.length };
  }
});

// Keep old action for backward compatibility (now uses open API)
export const fetchRapidApiGifs = action({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const resp = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=1500', {
      headers: {
        'x-rapidapi-key': args.apiKey,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
      }
    });
    
    if (!resp.ok) {
      throw new Error(`API failed: ${resp.status} ${resp.statusText}`);
    }
    
    const data = await resp.json();
    const isArray = Array.isArray(data);
    const items = isArray ? data : (data.data || []);
    
    const insertedOrUpdated = (await ctx.runMutation(internal.exercises.applyGifs, { items })) as number;
    
    return { success: true, insertedOrUpdated, totalFetched: items.length };
  }
});
export const tempAddDumbbellFly = mutation({
  args: {},
  handler: async (ctx) => {
    // Search by both English and Arabic names
    const existing = await ctx.db
      .query("exercises")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), "Dumbbell Flyes"),
          q.eq(q.field("nameAr"), "تفتيح صدر بالدمبل (فلايز)")
        )
      )
      .first();

    const flyData = {
      name: "Dumbbell Flyes",
      nameAr: "تفتيح صدر بالدمبل (فلايز)",
      description: "Exercise targeting the chest muscles (Pectoralis Major).",
      descriptionAr: "حركة عزل تستهدف عضلات الصدر.",
      muscleGroup: "Chest" as "Chest",
      muscleGroupAr: "الصدر",
      difficulty: "intermediate" as "intermediate",
      equipment: ["dumbbell", "flat bench"],
      instructions: [
        "Lie on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.",
        "Then using your thighs to help you get the dumbbells up, lift the dumbbells one at a time so you can hold them in front of you at shoulder width with the palms of the hands facing each other. Raise the dumbbells up like you're pressing them, but stop and hold the light bend in your elbows.",
        "With a slight bend on your elbows in order to prevent stress at the biceps tendon, lower your arms out at both sides in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement.",
        "Return your arms back to the starting position as you squeeze your chest muscles and exhale.",
        "Hold for a second at the contracted position and repeat."
      ],
      instructionsAr: [
        "استلقِ على بنش مستوٍ مع الإمساك بدمبل في كل يد، وضعهما فوق فخذيك بحيث تكون الراحتان متقابلتين.",
        "استخدم فخذيك لمساعدتك على رفع الدمبلز، واحداً تلو الآخر، حتى تمسكهما أمامك بعرض الكتفين مع تقابل الراحتين.",
        "مع الحفاظ على انحناء بسيط في المرفقين، أنزل ذراعيك إلى الجانبين في قوس واسع حتى تشعر بتمدد في عضلات الصدر. خذ شهيقاً أثناء هذه الحركة.",
        "أعد ذراعيك إلى وضع البداية مع عصر عضلات الصدر وإخراج زفير.",
        "ثبت الوضع لمدة ثانية وكرر الحركة."
      ],
      imageUrl: "https://image.mux.com/wtXNqDUH5CRaPNFgqZBnzkYMMyHT1Yx3i2JoSWaJi7E/animated.gif?height=320&start=1&width=320",
      isActive: true,
      category: "strength" as "strength",
      targetGender: "both" as "both"
    };

    if (existing) {
      return await ctx.db.patch(existing._id, flyData);
    }

    return await ctx.db.insert("exercises", flyData);
  },
});

export const tempAddPecDeckFly = mutation({
  args: {},
  handler: async (ctx) => {
    const flyData = {
      name: "Pec Deck Fly",
      nameAr: "تفتيح صدر بالآلة (بيكتورال فلاي)",
      description: "Machine-based isolation exercise for the chest muscles.",
      descriptionAr: "تمرين عزل باستخدام الآلة لعضلات الصدر.",
      muscleGroup: "Chest" as "Chest",
      muscleGroupAr: "الصدر",
      difficulty: "beginner" as "beginner",
      equipment: ["machine"],
      instructions: [
        "Sit on the machine with your back flat against the pad. Grip the handles.",
        "Squeeze your chest muscles to bring the handles together until they meet in the center.",
        "Pause for a second at the peak contraction.",
        "Slowly return to the starting position, maintaining control."
      ],
      instructionsAr: [
        "اجلس على الآلة مع إبقاء ظهرك مستوياً تماماً على المسند. أمسك بالمقابض.",
        "اعصر عضلات الصدر لتقريب المقابض من بعضها حتى تلتقي في المنتصف.",
        "توقف لمدة ثانية عند أقصى انقباض للعضلة.",
        "عُد ببطء إلى وضع البداية مع الحفاظ على التحكم في الحركة."
      ],
      imageUrl: "https://image.mux.com/tF025fWUYIlvmLXUWLSOboTvl02dVUoShB00hVsaaDpD7w/animated.gif",
      isActive: true,
      category: "strength" as "strength",
      targetGender: "both" as "both"
    };

    const existing = await ctx.db
      .query("exercises")
      .filter((q) => q.eq(q.field("nameAr"), "تفتيح صدر بالآلة (بيكتورال فلاي)"))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, flyData);
    }
    return await ctx.db.insert("exercises", flyData);
  },
});

/* =========================
   WORKOUT OF THE DAY (WOD)
========================= */
export const getWorkoutOfTheDay = query({
  args: {},
  handler: async (ctx) => {
    const allExercises = await ctx.db
      .query("exercises")
      .filter((x) => x.eq(x.field("isActive"), true))
      .collect();

    if (allExercises.length === 0) return [];

    // Use today's date as a deterministic seed
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Simple hash function for deterministic shuffle
    function seededRandom(seed: number) {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    }

    const rng = seededRandom(dateSeed);

    // Group exercises by muscle group for balance
    const byMuscle: Record<string, typeof allExercises> = {};
    for (const ex of allExercises) {
      const mg = ex.muscleGroup;
      if (!byMuscle[mg]) byMuscle[mg] = [];
      byMuscle[mg].push(ex);
    }

    const muscleGroups = Object.keys(byMuscle);
    const selected: typeof allExercises = [];
    const usedMuscles = new Set<string>();

    // Pick 4 exercises from different muscle groups
    for (let i = 0; i < 4 && muscleGroups.length > 0; i++) {
      const available = muscleGroups.filter((mg) => !usedMuscles.has(mg));
      if (available.length === 0) break;
      const mgIdx = Math.floor(rng() * available.length);
      const mg = available[mgIdx];
      usedMuscles.add(mg);
      const exercises = byMuscle[mg];
      const exIdx = Math.floor(rng() * exercises.length);
      selected.push(exercises[exIdx]);
    }

    return selected.map((ex) => ({
      _id: ex._id,
      name: ex.name,
      nameAr: ex.nameAr,
      muscleGroup: ex.muscleGroup,
      muscleGroupAr: ex.muscleGroupAr,
      difficulty: ex.difficulty,
      imageUrl: ex.imageUrl,
      sets: ex.sets,
      reps: ex.reps,
      caloriesBurned: ex.caloriesBurned,
      category: ex.category,
    }));
  },
});
