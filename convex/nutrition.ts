// convex/nutrition.ts
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   Shared Validators
========================= */

const TargetGroup = v.union(
  v.literal("general"),
  v.literal("diabetes"),
  v.literal("seniors"),
  v.literal("children")
);

const MealType = v.union(
  v.literal("breakfast"),
  v.literal("lunch"),
  v.literal("dinner"),
  v.literal("snack")
);

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

async function requireUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");
  return userId;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function mealTypes(): Array<"breakfast" | "lunch" | "dinner" | "snack"> {
  return ["breakfast", "lunch", "dinner", "snack"];
}

function emptyLog(userId: any, date: string) {
  return {
    userId,
    date,
    meals: mealTypes().map((mt) => ({
      mealType: mt,
      foods: [],
      totalCalories: 0,
    })),
    totalDailyCalories: 0,
    waterIntake: undefined as number | undefined,
    appliedPlanId: undefined as any,
    updatedAt: Date.now(),
  };
}

async function getOrCreateDayLog(ctx: any, userId: any, date: string) {
  const existing = await ctx.db
    .query("nutritionLogs")
    .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
    .first();

  if (existing) return existing;

  const id = await ctx.db.insert("nutritionLogs", emptyLog(userId, date));
  return await ctx.db.get(id);
}

function parseGrams(qtyStr: string) {
  const s = String(qtyStr || "").trim();
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return 100;
  return n;
}

/* =========================
   FOODS
========================= */

export const getAllFoods = query({
  args: {
    // UI بيرسل عربي -> نفترض categoryAr
    category: v.optional(v.string()),
    mealType: v.optional(MealType),

    isDiabeticFriendly: v.optional(v.boolean()),
    isSeniorFriendly: v.optional(v.boolean()),
    isChildFriendly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let foods: any[] = [];

    if (args.category && args.mealType) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_categoryAr_mealType", (q: any) =>
          q.eq("categoryAr", args.category!).eq("mealType", args.mealType!)
        )
        .collect();
    } else if (args.category) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_categoryAr", (q: any) => q.eq("categoryAr", args.category!))
        .collect();
    } else if (args.mealType) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_mealType", (q: any) => q.eq("mealType", args.mealType!))
        .collect();
    } else {
      foods = await ctx.db.query("foods").collect();
    }

    if (args.isDiabeticFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isDiabeticFriendly === args.isDiabeticFriendly);
    }
    if (args.isSeniorFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isSeniorFriendly === args.isSeniorFriendly);
    }
    if (args.isChildFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isChildFriendly === args.isChildFriendly);
    }

    const score = (f: any) => {
      const protein = Number(f.proteinPer100g || 0);
      const carbs = Number(f.carbsPer100g || 0);
      const fat = Number(f.fatPer100g || 0);
      const sugar = Number(f.sugar || 0);
      const fiber = Number(f.fiber || 0);
      const sodium = Number(f.sodium || 0);

      if (args.isDiabeticFriendly) {
        return fiber * 3 + protein * 1.5 - sugar * 4 - carbs * 0.7 - fat * 0.1;
      }
      if (args.isSeniorFriendly) {
        return protein * 3 + fiber * 1.2 - carbs * 0.6 - sodium * 0.01;
      }
      if (args.isChildFriendly) {
        return protein * 2 + fiber * 1 - sugar * 3 - carbs * 0.2;
      }
      return protein * 2 + fiber * 2 - sugar * 2 - carbs * 0.2 - fat * 0.05;
    };

    foods.sort((a, b) => score(b) - score(a));
    return foods;
  },
});

export const addFood = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    category: v.string(),
    categoryAr: v.string(),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    caloriesPer100g: v.number(),
    proteinPer100g: v.number(),
    carbsPer100g: v.number(),
    fatPer100g: v.number(),
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
    isDiabeticFriendly: v.optional(v.boolean()),
    isSeniorFriendly: v.optional(v.boolean()),
    isChildFriendly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("foods", args);
  },
});

// Bulk import from external API (admin only)
export const addBulkFoods = mutation({
  args: {
    foods: v.array(v.object({
      name: v.string(),
      nameAr: v.string(),
      category: v.string(),
      categoryAr: v.string(),
      mealType: v.optional(v.union(
        v.literal("breakfast"),
        v.literal("lunch"),
        v.literal("dinner"),
        v.literal("snack")
      )),
      caloriesPer100g: v.number(),
      proteinPer100g: v.number(),
      carbsPer100g: v.number(),
      fatPer100g: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Fetch existing names to skip duplicates
    const existing = await ctx.db.query("foods").collect();
    const existingNames = new Set(existing.map((f) => f.name.toLowerCase()));

    let inserted = 0;
    let skipped = 0;
    for (const food of args.foods) {
      if (existingNames.has(food.name.toLowerCase())) {
        skipped++;
        continue;
      }
      await ctx.db.insert("foods", {
        name: food.name,
        nameAr: food.nameAr,
        category: food.category,
        categoryAr: food.categoryAr,
        mealType: food.mealType ?? "lunch",
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
      });
      existingNames.add(food.name.toLowerCase());
      inserted++;
    }
    return { inserted, skipped };
  },
});

export const updateFood = mutation({
  args: {
    foodId: v.id("foods"),
    patch: v.object({
      name: v.optional(v.string()),
      nameAr: v.optional(v.string()),

      category: v.optional(v.string()),
      categoryAr: v.optional(v.string()),

      mealType: v.optional(v.union(
        v.literal("breakfast"),
        v.literal("lunch"),
        v.literal("dinner"),
        v.literal("snack")
      )),

      caloriesPer100g: v.optional(v.number()),
      proteinPer100g: v.optional(v.number()),
      carbsPer100g: v.optional(v.number()),
      fatPer100g: v.optional(v.number()),

      fiber: v.optional(v.number()),
      sugar: v.optional(v.number()),
      sodium: v.optional(v.number()),

      isDiabeticFriendly: v.optional(v.boolean()),
      isSeniorFriendly: v.optional(v.boolean()),
      isChildFriendly: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.foodId, args.patch);
    return true;
  },
});

export const deleteFood = mutation({
  args: { foodId: v.id("foods") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.foodId);
    return true;
  },
});

/* =========================
   CALCULATIONS
========================= */

export const calculateCalories = query({
  args: {
    foods: v.array(
      v.object({
        foodId: v.id("foods"),
        quantity: v.number(), // grams
      })
    ),
  },
  handler: async (ctx, args) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const item of args.foods) {
      const food = await ctx.db.get(item.foodId);
      if (!food) continue;

      const m = item.quantity / 100;
      totalCalories += food.caloriesPer100g * m;
      totalProtein += food.proteinPer100g * m;
      totalCarbs += food.carbsPer100g * m;
      totalFat += food.fatPer100g * m;
    }

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
    };
  },
});

/* =========================
   NUTRITION PLANS (PUBLIC)
========================= */

export const getNutritionPlans = query({
  args: { targetGroup: v.optional(TargetGroup) },
  handler: async (ctx, args) => {
    if (args.targetGroup) {
      return await ctx.db
        .query("nutritionPlans")
        .withIndex("by_target_group", (q: any) => q.eq("targetGroup", args.targetGroup!))
        .filter((x: any) => x.eq(x.field("isActive"), true))
        .collect();
    }

    return await ctx.db
      .query("nutritionPlans")
      .filter((x: any) => x.eq(x.field("isActive"), true))
      .collect();
  },
});

/* =========================
   NUTRITION PLANS (ADMIN)
========================= */

const MealFood = v.object({
  name: v.string(),
  nameAr: v.string(),
  quantity: v.string(),
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
});

const PlanMeal = v.object({
  name: v.string(),
  nameAr: v.string(),
  time: v.string(),
  foods: v.array(MealFood),
  totalCalories: v.number(),
});

export const adminGetAllPlans = query({
  args: {
    targetGroup: v.optional(TargetGroup),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("nutritionPlans").collect();

    if (!args.includeInactive) {
      items = items.filter((x: any) => x.isActive === true);
    }
    if (args.targetGroup) {
      items = items.filter((x: any) => x.targetGroup === args.targetGroup);
    }

    return items;
  },
});

export const addNutritionPlan = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    targetGroup: TargetGroup,
    meals: v.array(PlanMeal),
    totalDailyCalories: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("nutritionPlans", { ...args, isActive: true });
  },
});

export const updateNutritionPlan = mutation({
  args: {
    planId: v.id("nutritionPlans"),
    patch: v.object({
      name: v.optional(v.string()),
      nameAr: v.optional(v.string()),
      description: v.optional(v.string()),
      descriptionAr: v.optional(v.string()),
      targetGroup: v.optional(TargetGroup),
      meals: v.optional(v.array(PlanMeal)),
      totalDailyCalories: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.planId, args.patch);
    return true;
  },
});

export const deleteNutritionPlan = mutation({
  args: { planId: v.id("nutritionPlans") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.planId);
    return true;
  },
});

/* =========================
   USER NUTRITION LOGS (QUERY)
========================= */

export const getUserNutritionLog = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const date = args.date || todayISO();

    return await ctx.db
      .query("nutritionLogs")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
      .first();
  },
});

/* =========================
   LOG MUTATIONS (meals-based)
========================= */

export const setWaterIntake = mutation({
  args: {
    waterIntake: v.number(), // ml
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();
    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const ml = Math.max(0, Math.round(args.waterIntake || 0));
    await ctx.db.patch(log._id, { waterIntake: ml, updatedAt: Date.now() });
    return { ok: true, waterIntake: ml };
  },
});

function computeFoodCalories(food: any, grams: number) {
  const g = Math.max(0, Number(grams || 0));
  const per100 = Number(food?.caloriesPer100g || 0);
  return Math.round((per100 * g) / 100);
}

function sumMealCalories(foods: any[]) {
  return Math.round(
    foods.reduce((acc, x) => acc + Number(x.calories || 0), 0)
  );
}

function sumDayCalories(meals: any[]) {
  return Math.round(
    meals.reduce((acc, m) => acc + Number(m.totalCalories || 0), 0)
  );
}

/** ✅ Add/merge food into a specific meal (CTA الأساسي) */
export const addFoodToLogMeal = mutation({
  args: {
    mealType: MealType,
    foodId: v.id("foods"),
    quantity: v.number(), // grams
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();
    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const food = await ctx.db.get(args.foodId);
    if (!food) throw new ConvexError("العنصر غير موجود");

    const grams = Math.max(1, Number(args.quantity || 0));
    const calories = computeFoodCalories(food, grams);

    const meals = Array.isArray(log.meals) ? [...log.meals] : [];
    const mi = meals.findIndex((m: any) => m.mealType === args.mealType);
    if (mi < 0) throw new ConvexError("نوع الوجبة غير صحيح");

    const meal = { ...meals[mi] };
    const foods = Array.isArray(meal.foods) ? [...meal.foods] : [];

    const fi = foods.findIndex((x: any) => String(x.foodId) === String(args.foodId));
    if (fi >= 0) {
      const prevQty = Number(foods[fi].quantity || 0);
      const newQty = prevQty + grams;
      foods[fi] = {
        ...foods[fi],
        quantity: newQty,
        calories: computeFoodCalories(food, newQty),
      };
    } else {
      foods.push({ foodId: args.foodId, quantity: grams, calories });
    }

    meal.foods = foods;
    meal.totalCalories = sumMealCalories(foods);
    meals[mi] = meal;

    const totalDailyCalories = sumDayCalories(meals);

    await ctx.db.patch(log._id, {
      meals,
      totalDailyCalories,
      updatedAt: Date.now(),
    });

    return { ok: true, totalDailyCalories, mealCalories: meal.totalCalories };
  },
});

/** ✅ Add food from barcode scanner (find/create then log) */
export const addScannedFoodToLog = mutation({
  args: {
    mealType: MealType,
    barcode: v.string(),
    foodData: v.object({
      nameEn: v.string(),
      nameAr: v.string(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();

    // 1. Find or create food
    let food = await ctx.db
      .query("foods")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .first();

    if (!food) {
      const foodId = await ctx.db.insert("foods", {
        name: args.foodData.nameEn,
        nameAr: args.foodData.nameAr,
        barcode: args.barcode,
        caloriesPer100g: args.foodData.calories,
        proteinPer100g: args.foodData.protein,
        carbsPer100g: args.foodData.carbs,
        fatPer100g: args.foodData.fat,
        category: "Scanned",
        categoryAr: "مسح ضوئي",
      });
      food = await ctx.db.get(foodId);
    }

    if (!food) throw new ConvexError("فشل إنشاء أو استرجاع الطعام");

    // 2. Add to log
    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const grams = 100; // Default to 100g for scanned items
    const calories = computeFoodCalories(food, grams);

    const meals = Array.isArray(log.meals) ? [...log.meals] : [];
    const mi = meals.findIndex((m: any) => m.mealType === args.mealType);
    if (mi < 0) throw new ConvexError("نوع الوجبة غير صحيح");

    const meal = { ...meals[mi] };
    const foodsInMeal = Array.isArray(meal.foods) ? [...meal.foods] : [];

    foodsInMeal.push({ foodId: food._id, quantity: grams, calories });

    meal.foods = foodsInMeal;
    meal.totalCalories = sumMealCalories(foodsInMeal);
    meals[mi] = meal;

    const totalDailyCalories = sumDayCalories(meals);
    await ctx.db.patch(log._id, { meals, totalDailyCalories, updatedAt: Date.now() });

    return { ok: true, foodId: food._id };
  },
});

/** ✅ Update quantity (0 => remove) */
export const updateLogMealFoodQuantity = mutation({
  args: {
    mealType: MealType,
    foodId: v.id("foods"),
    quantity: v.number(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();
    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const food = await ctx.db.get(args.foodId);
    if (!food) throw new ConvexError("العنصر غير موجود");

    const meals = Array.isArray(log.meals) ? [...log.meals] : [];
    const mi = meals.findIndex((m: any) => m.mealType === args.mealType);
    if (mi < 0) throw new ConvexError("نوع الوجبة غير صحيح");

    const meal = { ...meals[mi] };
    let foods = Array.isArray(meal.foods) ? [...meal.foods] : [];

    const fi = foods.findIndex((x: any) => String(x.foodId) === String(args.foodId));
    if (fi < 0) throw new ConvexError("العنصر غير موجود في الوجبة");

    const grams = Math.max(0, Number(args.quantity || 0));
    if (grams === 0) {
      foods.splice(fi, 1);
    } else {
      foods[fi] = {
        ...foods[fi],
        quantity: grams,
        calories: computeFoodCalories(food, grams),
      };
    }

    meal.foods = foods;
    meal.totalCalories = sumMealCalories(foods);
    meals[mi] = meal;

    const totalDailyCalories = sumDayCalories(meals);

    await ctx.db.patch(log._id, {
      meals,
      totalDailyCalories,
      updatedAt: Date.now(),
    });

    return { ok: true, totalDailyCalories, mealCalories: meal.totalCalories };
  },
});

/** ✅ Clear day log */
export const clearTodayLog = mutation({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();
    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const cleared = emptyLog(userId, date);
    await ctx.db.patch(log._id, {
      meals: cleared.meals,
      totalDailyCalories: 0,
      waterIntake: undefined,
      appliedPlanId: undefined,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/** ✅ Apply plan to log (replace/merge) */
export const applyPlanToTodayLog = mutation({
  args: {
    planId: v.id("nutritionPlans"),
    date: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("replace"), v.literal("merge"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.isActive !== true) {
      throw new ConvexError("الخطة غير موجودة أو غير مفعلة");
    }

    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const foodsAll = await ctx.db.query("foods").collect();

    // base meals
    const baseMeals =
      args.mode === "replace"
        ? emptyLog(userId, date).meals
        : (Array.isArray(log.meals) ? [...log.meals] : emptyLog(userId, date).meals);

    const meals = baseMeals.map((m: any) => ({ ...m, foods: [...(m.foods || [])] }));

    // map plan meal name -> mealType (simple)
    const mapToMealType = (nameAr: string, nameEn: string): any => {
      const s = `${nameAr} ${nameEn}`.toLowerCase();
      if (s.includes("فطور") || s.includes("breakfast")) return "breakfast";
      if (s.includes("غداء") || s.includes("lunch")) return "lunch";
      if (s.includes("عشاء") || s.includes("dinner")) return "dinner";
      if (s.includes("سناك") || s.includes("snack")) return "snack";
      // fallback: breakfast
      return "breakfast";
    };

    let appliedCount = 0;

    for (const pm of plan.meals || []) {
      const mt = mapToMealType(String(pm.nameAr || ""), String(pm.name || ""));
      const mi = meals.findIndex((m: any) => m.mealType === mt);
      if (mi < 0) continue;

      for (const pf of pm.foods || []) {
        const nameAr = String(pf.nameAr || "").trim();
        const nameEn = String(pf.name || "").trim();

        const match = foodsAll.find((x: any) => {
          const xa = String(x.nameAr || "").trim();
          const xe = String(x.name || "").trim();
          return (nameAr && xa === nameAr) || (nameEn && xe === nameEn);
        });

        if (!match) continue;

        const grams = parseGrams(String(pf.quantity || "100g"));
        const calories = computeFoodCalories(match, grams);

        const meal = { ...meals[mi] };
        const list = [...(meal.foods || [])];
        const fi = list.findIndex((x: any) => String(x.foodId) === String(match._id));

        if (fi >= 0) {
          const newQty = Number(list[fi].quantity || 0) + grams;
          list[fi] = { ...list[fi], quantity: newQty, calories: computeFoodCalories(match, newQty) };
        } else {
          list.push({ foodId: match._id, quantity: grams, calories });
        }

        meal.foods = list;
        meal.totalCalories = sumMealCalories(list);
        meals[mi] = meal;

        appliedCount += 1;
      }
    }

    const totalDailyCalories = sumDayCalories(meals);

    await ctx.db.patch(log._id, {
      meals,
      totalDailyCalories,
      appliedPlanId: plan._id,
      updatedAt: Date.now(),
    });

    return { ok: true, appliedCount, totalDailyCalories };
  },
});

/* =========================
   DAILY CALORIE NEEDS
========================= */

export const calculateDailyCalorieNeeds = query({
  args: v.object({
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("very_active")
    ),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female")),
    height: v.number(),
    weight: v.number(),
  }),
  handler: async (_ctx, args) => {
    const { activityLevel, age, gender, height, weight } = args;

    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityFactor =
      activityLevel === "sedentary"
        ? 1.2
        : activityLevel === "light"
          ? 1.375
          : activityLevel === "moderate"
            ? 1.55
            : activityLevel === "active"
              ? 1.725
              : 1.9;

    const maintenance = bmr * activityFactor;

    return {
      ok: true,
      bmr: Math.round(bmr),
      maintenanceCalories: Math.round(maintenance),
      activityFactor,
    };
  },
});

/* =========================
   ADMIN SEED (ONE TIME)
========================= */

export const adminSeedNutritionData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingFoods = await ctx.db.query("foods").collect();
    const existingPlans = await ctx.db.query("nutritionPlans").collect();

    if (!args.force && (existingFoods.length > 0 || existingPlans.length > 0)) {
      return {
        ok: true,
        skipped: true,
        foods: existingFoods.length,
        plans: existingPlans.length,
      };
    }

    if (args.force) {
      for (const f of existingFoods) await ctx.db.delete(f._id);
      for (const p of existingPlans) await ctx.db.delete(p._id);
    }

    const foodsToAdd: any[] = [
      // Breakfast
      {
        name: "Oats",
        nameAr: "شوفان",
        category: "Grains",
        categoryAr: "حبوب",
        mealType: "breakfast",
        caloriesPer100g: 389,
        proteinPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        fiber: 10.6,
        sugar: 0.9,
        sodium: 2,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Greek Yogurt (plain)",
        nameAr: "زبادي يوناني (سادة)",
        category: "Dairy",
        categoryAr: "منتجات الألبان",
        mealType: "breakfast",
        caloriesPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiber: 0,
        sugar: 3.6,
        sodium: 36,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      // Lunch/Dinner
      {
        name: "Grilled Chicken Breast",
        nameAr: "صدر دجاج مشوي",
        category: "Proteins",
        categoryAr: "بروتينات",
        mealType: "lunch",
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Salmon",
        nameAr: "سلمون",
        category: "Proteins",
        categoryAr: "بروتينات",
        mealType: "dinner",
        caloriesPer100g: 208,
        proteinPer100g: 20,
        carbsPer100g: 0,
        fatPer100g: 13,
        fiber: 0,
        sugar: 0,
        sodium: 59,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: false,
      },
      // Fruits/Snacks
      {
        name: "Apple",
        nameAr: "تفاح",
        category: "Fruits",
        categoryAr: "فواكه",
        mealType: "snack",
        caloriesPer100g: 52,
        proteinPer100g: 0.3,
        carbsPer100g: 14,
        fatPer100g: 0.2,
        fiber: 2.4,
        sugar: 10.4,
        sodium: 1,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Almonds",
        nameAr: "لوز",
        category: "Nuts",
        categoryAr: "مكسرات",
        mealType: "snack",
        caloriesPer100g: 579,
        proteinPer100g: 21.2,
        carbsPer100g: 21.6,
        fatPer100g: 49.9,
        fiber: 12.5,
        sugar: 4.4,
        sodium: 1,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: false,
      },
      // Vegetables
      {
        name: "Broccoli",
        nameAr: "بروكلي",
        category: "Vegetables",
        categoryAr: "خضروات",
        mealType: "lunch",
        caloriesPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 6.6,
        fatPer100g: 0.4,
        fiber: 2.6,
        sugar: 1.7,
        sodium: 33,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
    ];

    for (const f of foodsToAdd) await ctx.db.insert("foods", f);

    // Plans
    const planGeneralId = await ctx.db.insert("nutritionPlans", {
      name: "Lean Starter",
      nameAr: "خطة تنشيف بسيطة",
      description: "Simple high-protein day for cutting.",
      descriptionAr: "يوم بسيط عالي البروتين للتنشيف.",
      targetGroup: "general",
      meals: [
        {
          name: "Breakfast",
          nameAr: "فطور",
          time: "08:00",
          foods: [
            { name: "Greek Yogurt (plain)", nameAr: "زبادي يوناني (سادة)", quantity: "200g", calories: 118, protein: 20, carbs: 7.2, fat: 0.8 },
            { name: "Oats", nameAr: "شوفان", quantity: "60g", calories: 233, protein: 10.1, carbs: 39.8, fat: 4.1 },
          ],
          totalCalories: 351,
        },
        {
          name: "Lunch",
          nameAr: "غداء",
          time: "14:00",
          foods: [
            { name: "Grilled Chicken Breast", nameAr: "صدر دجاج مشوي", quantity: "200g", calories: 330, protein: 62, carbs: 0, fat: 7.2 },
            { name: "Broccoli", nameAr: "بروكلي", quantity: "150g", calories: 51, protein: 4.2, carbs: 9.9, fat: 0.6 },
          ],
          totalCalories: 381,
        },
        {
          name: "Dinner",
          nameAr: "عشاء",
          time: "20:00",
          foods: [
            { name: "Salmon", nameAr: "سلمون", quantity: "160g", calories: 333, protein: 32, carbs: 0, fat: 20.8 },
          ],
          totalCalories: 333,
        },
        {
          name: "Snack",
          nameAr: "سناك",
          time: "17:30",
          foods: [
            { name: "Apple", nameAr: "تفاح", quantity: "180g", calories: 94, protein: 0.5, carbs: 25.2, fat: 0.4 },
            { name: "Almonds", nameAr: "لوز", quantity: "20g", calories: 116, protein: 4.2, carbs: 4.3, fat: 10 },
          ],
          totalCalories: 210,
        },
      ],
      totalDailyCalories: 1275,
      isActive: true,
    });

    const planDiabetesId = await ctx.db.insert("nutritionPlans", {
      name: "Stable Sugar Day",
      nameAr: "خطة استقرار السكر",
      description: "Higher fiber, lower sugar, balanced carbs.",
      descriptionAr: "ألياف أعلى + سكر أقل + كارب موزع.",
      targetGroup: "diabetes",
      meals: [
        {
          name: "Breakfast",
          nameAr: "فطور",
          time: "08:00",
          foods: [
            { name: "Oats", nameAr: "شوفان", quantity: "50g", calories: 195, protein: 8.5, carbs: 33.1, fat: 3.5 },
            { name: "Greek Yogurt (plain)", nameAr: "زبادي يوناني (سادة)", quantity: "200g", calories: 118, protein: 20, carbs: 7.2, fat: 0.8 },
          ],
          totalCalories: 313,
        },
        {
          name: "Lunch",
          nameAr: "غداء",
          time: "14:00",
          foods: [
            { name: "Grilled Chicken Breast", nameAr: "صدر دجاج مشوي", quantity: "180g", calories: 297, protein: 55.8, carbs: 0, fat: 6.5 },
            { name: "Broccoli", nameAr: "بروكلي", quantity: "200g", calories: 68, protein: 5.6, carbs: 13.2, fat: 0.8 },
          ],
          totalCalories: 365,
        },
        {
          name: "Snack",
          nameAr: "سناك",
          time: "17:30",
          foods: [{ name: "Almonds", nameAr: "لوز", quantity: "25g", calories: 145, protein: 5.3, carbs: 5.4, fat: 12.5 }],
          totalCalories: 145,
        },
        {
          name: "Dinner",
          nameAr: "عشاء",
          time: "20:00",
          foods: [{ name: "Salmon", nameAr: "سلمون", quantity: "150g", calories: 312, protein: 30, carbs: 0, fat: 19.5 }],
          totalCalories: 312,
        },
      ],
      totalDailyCalories: 1135,
      isActive: true,
    });

    return {
      ok: true,
      seeded: true,
      foods: foodsToAdd.length,
      plans: [planGeneralId, planDiabetesId],
    };
  },
});

/* =========================
   USER NUTRITION PLANS
========================= */

/**
 * Create nutrition plan for a user (coach/admin only)
 */
export const createUserNutritionPlan = mutation({
  args: {
    clientProfileId: v.id("profiles"),
    days: v.array(
      v.object({
        dayNumber: v.number(),
        meals: v.array(
          v.object({
            name: v.string(),
            nameAr: v.string(),
            foods: v.array(
              v.object({
                foodId: v.id("foods"),
                quantity: v.number(),
                unit: v.string(),
              })
            ),
          })
        ),
      })
    ),
    targetCalories: v.optional(v.number()),
    targetProtein: v.optional(v.number()),
    targetCarbs: v.optional(v.number()),
    targetFat: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const me = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    const isCoachOrAdmin =
      me &&
      ((me as any).isAdmin === true ||
        (me as any).role === "admin" ||
        (me as any).role === "coach");

    if (!isCoachOrAdmin) throw new ConvexError("ليس لديك صلاحية إنشاء خطة غذائية");


    // Check if client exists
    const client = await ctx.db.get(args.clientProfileId);
    if (!client) {
      throw new ConvexError("المتدرب غير موجود");
    }

    // Delete existing plan for this client
    const existingPlan = await ctx.db
      .query("userNutritionPlans")
      .withIndex("by_client", (q) => q.eq("clientProfileId", args.clientProfileId))
      .first();

    if (existingPlan) {
      await ctx.db.delete(existingPlan._id);
    }

    // Create new plan
    const planId = await ctx.db.insert("userNutritionPlans", {
      clientProfileId: args.clientProfileId,
      days: args.days as any,
      targetCalories: args.targetCalories || 2450,
      targetProtein: args.targetProtein || 180,
      targetCarbs: args.targetCarbs || 300,
      targetFat: args.targetFat || 70,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    });

    return planId;
  },
});

/**
 * Get my nutrition plan (for client)
 */
export const getMyNutritionPlan = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      return null;
    }

    const plan = await ctx.db
      .query("userNutritionPlans")
      .withIndex("by_client", (q) => q.eq("clientProfileId", profile._id))
      .first();

    if (!plan) {
      return null;
    }

    // Enrich foods data
    const enrichedDays = await Promise.all(
      plan.days.map(async (day: any) => {
        const enrichedMeals = await Promise.all(
          day.meals.map(async (meal: any) => {
            const enrichedFoods = await Promise.all(
              meal.foods.map(async (food: any) => {
                const foodData = await ctx.db.get(food.foodId);
                if (!foodData || foodData === null) return null;

                // Type guard to ensure we're working with a food item
                if (!('caloriesPer100g' in foodData)) return null;

                const multiplier = food.quantity / 100;
                return {
                  foodId: food.foodId,
                  foodName: (foodData as any).name,
                  foodNameAr: (foodData as any).nameAr,
                  quantity: food.quantity,
                  unit: food.unit || "g",
                  calories: Math.round(((foodData as any).caloriesPer100g || 0) * multiplier),
                  protein: Math.round(((foodData as any).proteinPer100g || 0) * multiplier),
                  carbs: Math.round(((foodData as any).carbsPer100g || 0) * multiplier),
                  fat: Math.round(((foodData as any).fatPer100g || 0) * multiplier),
                  imageUrl: (foodData as any).imageUrl,
                };
              })
            );

            return {
              name: meal.name,
              nameAr: meal.nameAr,
              foods: enrichedFoods.filter(Boolean),
            };
          })
        );

        return {
          dayNumber: day.dayNumber,
          meals: enrichedMeals,
        };
      })
    );

    return {
      ...plan,
      days: enrichedDays,
    };
  },
});

/**
 * Add food to my nutrition plan (client can add extra food to any meal)
 */
export const addFoodToMyPlan = mutation({
  args: {
    dayNumber: v.number(),
    mealIndex: v.number(),
    foodId: v.id("foods"),
    quantity: v.number(), // grams
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError("الملف الشخصي غير موجود");

    const plan = await ctx.db
      .query("userNutritionPlans")
      .withIndex("by_client", (q) => q.eq("clientProfileId", profile._id))
      .first();

    if (!plan) throw new ConvexError("لا توجد خطة غذائية مخصصة لك");

    const food = await ctx.db.get(args.foodId);
    if (!food) throw new ConvexError("الطعام غير موجود");

    const grams = Math.max(1, args.quantity);

    // Deep-clone the days array
    const days = JSON.parse(JSON.stringify(plan.days || [])) as any[];

    const dayIdx = days.findIndex((d: any) => d.dayNumber === args.dayNumber);
    if (dayIdx < 0) throw new ConvexError("اليوم غير موجود في الخطة");

    const meals = days[dayIdx].meals || [];
    if (args.mealIndex < 0 || args.mealIndex >= meals.length) {
      throw new ConvexError("الوجبة غير موجودة");
    }

    const existingIdx = meals[args.mealIndex].foods.findIndex(
      (f: any) => String(f.foodId) === String(args.foodId)
    );

    if (existingIdx >= 0) {
      // Increase quantity if same food already exists
      meals[args.mealIndex].foods[existingIdx].quantity += grams;
    } else {
      meals[args.mealIndex].foods.push({
        foodId: args.foodId,
        quantity: grams,
        unit: "g",
      });
    }

    days[dayIdx].meals = meals;

    await ctx.db.patch(plan._id, { days, updatedAt: Date.now() });
    return { ok: true };
  },
});

/**
 * Seed shared Arabic foods library
 */
export const seedArabicFoods = mutation({
  args: {},
  handler: async (ctx) => {
    // Only admins or coaches can seed
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile || (!profile.isAdmin && profile.role !== "coach")) {
      throw new ConvexError("ليس لديك صلاحية لإجراء هذه العملية");
    }

    const foods = [
      {
        name: "Foul Medames",
        nameAr: "فول مدمس",
        category: "Legumes",
        categoryAr: "بقوليات",
        caloriesPer100g: 110,
        proteinPer100g: 8,
        carbsPer100g: 15,
        fatPer100g: 1,
        mealType: "breakfast" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Boiled Chickpeas",
        nameAr: "حمص مسلوق",
        category: "Legumes",
        categoryAr: "بقوليات",
        caloriesPer100g: 164,
        proteinPer100g: 9,
        carbsPer100g: 27,
        fatPer100g: 2.6,
        mealType: "snack" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Lentil Soup",
        nameAr: "شوربة عدس",
        category: "Soups",
        categoryAr: "شوربات",
        caloriesPer100g: 65,
        proteinPer100g: 4.5,
        carbsPer100g: 9,
        fatPer100g: 1.5,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Tabbouleh",
        nameAr: "تبولة",
        category: "Salads",
        categoryAr: "سلطات",
        caloriesPer100g: 120,
        proteinPer100g: 2,
        carbsPer100g: 10,
        fatPer100g: 8,
        mealType: "snack" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: false,
      },
      {
        name: "Fattoush",
        nameAr: "فتوش",
        category: "Salads",
        categoryAr: "سلطات",
        caloriesPer100g: 90,
        proteinPer100g: 1.5,
        carbsPer100g: 12,
        fatPer100g: 4,
        mealType: "snack" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Grilled Shish Tawook",
        nameAr: "شيش طاووك مشوي",
        category: "Proteins",
        categoryAr: "بروتينات",
        caloriesPer100g: 150,
        proteinPer100g: 25,
        carbsPer100g: 1,
        fatPer100g: 5,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Baba Ganoush",
        nameAr: "بابا غنوج",
        category: "Appetizers",
        categoryAr: "مقبلات",
        caloriesPer100g: 100,
        proteinPer100g: 1.5,
        carbsPer100g: 8,
        fatPer100g: 7,
        mealType: "snack" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Labneh",
        nameAr: "لبنة",
        category: "Dairy",
        categoryAr: "ألبان",
        caloriesPer100g: 150,
        proteinPer100g: 7,
        carbsPer100g: 4,
        fatPer100g: 12,
        mealType: "breakfast" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Arabic Bread (Whole Wheat)",
        nameAr: "خبز أسمر",
        category: "Carbs",
        categoryAr: "نشويات",
        caloriesPer100g: 250,
        proteinPer100g: 9,
        carbsPer100g: 50,
        fatPer100g: 1.5,
        mealType: "breakfast" as const,
        isDiabeticFriendly: false,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Dates",
        nameAr: "تمر",
        category: "Fruits",
        categoryAr: "فواكه",
        caloriesPer100g: 280,
        proteinPer100g: 2.5,
        carbsPer100g: 75,
        fatPer100g: 0.4,
        mealType: "snack" as const,
        isDiabeticFriendly: false,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Mujadara",
        nameAr: "مجدرة برغل",
        category: "Main Dish",
        categoryAr: "أطباق رئيسية",
        caloriesPer100g: 170,
        proteinPer100g: 6,
        carbsPer100g: 30,
        fatPer100g: 3,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Grilled Kofta (Lean)",
        nameAr: "كفتة مشوية (قليلة الدسم)",
        category: "Proteins",
        categoryAr: "بروتينات",
        caloriesPer100g: 210,
        proteinPer100g: 20,
        carbsPer100g: 2,
        fatPer100g: 14,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Okra Stew (Bamia)",
        nameAr: "بامية (بدون لحم دسم)",
        category: "Vegetables",
        categoryAr: "خضروات",
        caloriesPer100g: 70,
        proteinPer100g: 2,
        carbsPer100g: 12,
        fatPer100g: 2,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Grilled Sea Bream",
        nameAr: "سمك دنيس مشوي",
        category: "Proteins",
        categoryAr: "بروتينات",
        caloriesPer100g: 120,
        proteinPer100g: 20,
        carbsPer100g: 0,
        fatPer100g: 4,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Grilled Halloumi",
        nameAr: "حلوم مشوي",
        category: "Dairy",
        categoryAr: "ألبان",
        caloriesPer100g: 320,
        proteinPer100g: 21,
        carbsPer100g: 2,
        fatPer100g: 25,
        mealType: "breakfast" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Stuffed Grape Leaves (Oil)",
        nameAr: "ورق عنب بالزيت",
        category: "Appetizers",
        categoryAr: "مقبلات",
        caloriesPer100g: 160,
        proteinPer100g: 2,
        carbsPer100g: 25,
        fatPer100g: 6,
        mealType: "lunch" as const,
        isDiabeticFriendly: false,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Molokhia",
        nameAr: "ملوخية",
        category: "Vegetables",
        categoryAr: "خضروات",
        caloriesPer100g: 50,
        proteinPer100g: 4,
        carbsPer100g: 5,
        fatPer100g: 2,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Harees",
        nameAr: "هريس",
        category: "Main Dish",
        categoryAr: "أطباق رئيسية",
        caloriesPer100g: 140,
        proteinPer100g: 8,
        carbsPer100g: 20,
        fatPer100g: 4,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Kabsa Chicken (Grilled)",
        nameAr: "كبسة دجاج (مشوي)",
        category: "Main Dish",
        categoryAr: "أطباق رئيسية",
        caloriesPer100g: 180,
        proteinPer100g: 10,
        carbsPer100g: 25,
        fatPer100g: 5,
        mealType: "lunch" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Falafel (Baked)",
        nameAr: "فلافل (مخبوزة)",
        category: "Legumes",
        categoryAr: "بقوليات",
        caloriesPer100g: 200,
        proteinPer100g: 10,
        carbsPer100g: 25,
        fatPer100g: 8,
        mealType: "breakfast" as const,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
    ];

    let addedCount = 0;
    for (const food of foods) {
      // Check if already exists to avoid duplicates
      const existing = await ctx.db
        .query("foods")
        .filter((q: any) => q.eq(q.field("name"), food.name))
        .first();

      if (!existing) {
        await ctx.db.insert("foods", {
          ...food,
          barcode: food.name, // Temporary identifier
        });
        addedCount++;
      }
    }

    return { ok: true, addedCount };
  },
});

/** ✅ Add AI Analyzed meal to log */
export const addAnalyzedMealToLog = mutation({
  args: {
    mealType: MealType,
    date: v.optional(v.string()),
    mealNameEn: v.string(),
    mealNameAr: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const date = args.date || todayISO();

    const foodId = await ctx.db.insert("foods", {
      name: args.mealNameEn,
      nameAr: args.mealNameAr,
      caloriesPer100g: args.calories,
      proteinPer100g: args.protein,
      carbsPer100g: args.carbs,
      fatPer100g: args.fat,
      category: "AI Analysis",
      categoryAr: "تحليل ذكي",
    });

    const log = await getOrCreateDayLog(ctx, userId, date);
    if (!log) throw new ConvexError("تعذر إنشاء سجل اليوم");

    const meals = Array.isArray(log.meals) ? [...log.meals] : [];
    const mi = meals.findIndex((m: any) => m.mealType === args.mealType);
    if (mi < 0) throw new ConvexError("نوع الوجبة غير صحيح");

    const meal = { ...meals[mi] };
    const foods = Array.isArray(meal.foods) ? [...meal.foods] : [];

    foods.push({ foodId, quantity: 100, calories: args.calories });

    meal.foods = foods;
    meal.totalCalories = sumMealCalories(foods);
    meals[mi] = meal;

    const totalDailyCalories = sumDayCalories(meals);

    await ctx.db.patch(log._id, {
      meals,
      totalDailyCalories,
      updatedAt: Date.now(),
    });

    return { ok: true, foodId };
  },
});
