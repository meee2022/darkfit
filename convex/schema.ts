// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    age: v.optional(v.number()),
    gender: v.union(v.literal("male"), v.literal("female")),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    fitnessLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    experienceWithWeights: v.optional(
      v.union(
        v.literal("none"),
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    trainingDaysPerWeek: v.optional(v.number()),
    trainingLocation: v.optional(
      v.union(v.literal("home"), v.literal("gym"), v.literal("both"))
    ),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("coach"), v.literal("user"))),
    goals: v.array(v.string()),
    medicalConditions: v.optional(v.array(v.string())),
    isAdmin: v.optional(v.boolean()),

    // حقول Profile الجديدة
    profileImage: v.optional(v.string()),
    joinDate: v.optional(v.number()),
    goal: v.optional(v.string()), // e.g., "تنشيف", "ضخامة"
    currentWeight: v.optional(v.number()),
    targetWeight: v.optional(v.number()),
    weeklyWeightData: v.optional(v.array(v.object({
      date: v.string(),
      weight: v.number()
    }))),
    heartRate: v.optional(v.number()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fats: v.optional(v.number()),
    energy: v.optional(v.number()),
    membershipType: v.optional(v.string()), // e.g., "عضو سوبر", "عضو عادي"
    memberSince: v.optional(v.string()), // e.g., "2023"
    connectedDevices: v.optional(v.array(v.string())),
    onboardingCompleted: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  exercises: defineTable({
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
    isActive: v.boolean(),
  })
    .index("by_muscle_group", ["muscleGroup"])
    .index("by_difficulty", ["difficulty"])
    .index("by_gender", ["targetGender"])
    .index("by_category", ["category"]),

  nutritionPlans: defineTable({
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    targetGroup: v.union(
      v.literal("general"),
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children")
    ),
    meals: v.array(
      v.object({
        name: v.string(),
        nameAr: v.string(),
        time: v.string(),
        foods: v.array(
          v.object({
            name: v.string(),
            nameAr: v.string(),
            quantity: v.string(),
            calories: v.number(),
            protein: v.number(),
            carbs: v.number(),
            fat: v.number(),
          })
        ),
        totalCalories: v.number(),
      })
    ),
    totalDailyCalories: v.number(),
    isActive: v.boolean(),
  }).index("by_target_group", ["targetGroup"]),

  foods: defineTable({
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
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
    isDiabeticFriendly: v.optional(v.boolean()),
    isSeniorFriendly: v.optional(v.boolean()),
    isChildFriendly: v.optional(v.boolean()),
    barcode: v.optional(v.string()),
    mealTime: v.optional(v.array(v.string())),
  })
    .index("by_barcode", ["barcode"])
    .index("by_category", ["category"])
    .index("by_categoryAr", ["categoryAr"])
    .index("by_mealType", ["mealType"])
    .index("by_category_mealType", ["category", "mealType"])
    .index("by_categoryAr_mealType", ["categoryAr", "mealType"])
    .index("by_diabetic_friendly", ["isDiabeticFriendly"])
    .index("by_senior_friendly", ["isSeniorFriendly"])
    .index("by_child_friendly", ["isChildFriendly"]),

  workoutSessions: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    date: v.string(),
    duration: v.number(),
    sets: v.number(),
    reps: v.array(v.number()),
    weight: v.optional(v.array(v.number())),
    caloriesBurned: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_exercise", ["exerciseId"]),

  nutritionLogs: defineTable({
    userId: v.id("users"),
    date: v.string(),
    meals: v.array(
      v.object({
        mealType: v.union(
          v.literal("breakfast"),
          v.literal("lunch"),
          v.literal("dinner"),
          v.literal("snack")
        ),
        foods: v.array(
          v.object({
            foodId: v.id("foods"),
            quantity: v.number(),
            calories: v.number(),
          })
        ),
        totalCalories: v.number(),
      })
    ),
    totalDailyCalories: v.number(),
    waterIntake: v.optional(v.number()),
    appliedPlanId: v.optional(v.id("nutritionPlans")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  articles: defineTable({
    title: v.string(),
    titleAr: v.string(),
    content: v.string(),
    contentAr: v.string(),
    category: v.union(
      v.literal("fitness"),
      v.literal("nutrition"),
      v.literal("health"),
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children")
    ),
    author: v.string(),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    publishDate: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  coaches: defineTable({
    name: v.string(),
    nameAr: v.string(),
    specialty: v.string(),
    specialtyAr: v.string(),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    bioAr: v.optional(v.string()),
    image: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    whatsapp: v.optional(v.string()),
    rating: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_createdAt", ["createdAt"]),

  supplements: defineTable({
    category: v.union(
      v.literal("performance"),
      v.literal("health"),
      v.literal("recovery")
    ),
    evidence: v.union(
      v.literal("strong"),
      v.literal("moderate"),
      v.literal("limited")
    ),
    tags: v.array(v.string()),
    name: v.object({ ar: v.string(), en: v.string() }),
    brief: v.object({ ar: v.string(), en: v.string() }),
    function: v.object({ ar: v.string(), en: v.string() }),
    benefits: v.object({
      ar: v.array(v.string()),
      en: v.array(v.string()),
    }),
    typicalUse: v.object({ ar: v.string(), en: v.string() }),
    cautions: v.object({
      ar: v.array(v.string()),
      en: v.array(v.string()),
    }),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    refs: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        source: v.optional(v.string()),
      })
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_category", ["category"])
    .index("by_evidence", ["evidence"]),

  coachClients: defineTable({
    coachProfileId: v.id("profiles"),
    clientProfileId: v.id("profiles"),
    createdAt: v.number(),
  })
    .index("by_coach", ["coachProfileId"])
    .index("by_client", ["clientProfileId"]),

  assignedPlans: defineTable({
    coachProfileId: v.id("profiles"),
    clientProfileId: v.id("profiles"),
    type: v.union(v.literal("workout"), v.literal("nutrition")),
    workoutExerciseIds: v.optional(v.array(v.id("exercises"))),
    nutritionPlanId: v.optional(v.id("nutritionPlans")),
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
    createdAt: v.number(),
  })
    .index("by_client", ["clientProfileId"])
    .index("by_coach", ["coachProfileId"]),

  workoutTemplates: defineTable({
    coachProfileId: v.id("profiles"),
    name: v.string(),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    daysPerWeek: v.optional(v.number()),
    weeksCount: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_coach", ["coachProfileId"])
    .index("by_level", ["level"]),

  workoutTemplateDays: defineTable({
    templateId: v.id("workoutTemplates"),
    weekNumber: v.number(),
    dayOfWeek: v.number(),
    label: v.optional(v.string()),
    exerciseIds: v.array(v.id("exercises")),
    notes: v.optional(v.string()),
  }).index("by_template_week_day", ["templateId", "weekNumber", "dayOfWeek"]),

  // ✅ جدول FitBot الجديد
  fitbotChats: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    isBlocked: v.optional(v.boolean()),
    rating: v.optional(v.union(v.literal("good"), v.literal("bad"))),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  // ✅ جداول البيانات الصحية الجديدة
  healthRecords: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    time: v.string(), // HH:MM
    recordType: v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("spo2"),
      v.literal("weight"),
      v.literal("height")
    ),

    // Glucose
    glucoseValue: v.optional(v.number()), // mg/dL
    mealContext: v.optional(v.union(
      v.literal("fasting"),
      v.literal("beforeMeal"),
      v.literal("afterMeal"),
      v.literal("bedtime")
    )),

    // Blood Pressure
    systolic: v.optional(v.number()),
    diastolic: v.optional(v.number()),

    // Heart Rate
    heartRate: v.optional(v.number()), // bpm

    // SPO2
    spo2: v.optional(v.number()), // %

    // Weight & Height
    weight: v.optional(v.number()), // kg
    height: v.optional(v.number()), // cm

    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_type", ["userId", "recordType"])
    .index("by_user_type_date", ["userId", "recordType", "date"]),

  medications: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nameAr: v.string(),
    type: v.union(
      v.literal("insulin"),
      v.literal("pill"),
      v.literal("injection"),
      v.literal("other")
    ),
    dosage: v.string(), // e.g., "500mg", "10 units"
    frequency: v.string(), // e.g., "3 times daily", "before meals"
    frequencyAr: v.string(),
    reminderTimes: v.array(v.string()), // ["08:00", "14:00", "20:00"]
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isActive: v.boolean(),
    icon: v.optional(v.string()), // emoji
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  medicationLogs: defineTable({
    userId: v.id("users"),
    medicationId: v.id("medications"),
    date: v.string(),
    time: v.string(),
    taken: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_medication", ["medicationId"]),

  healthTasks: defineTable({
    userId: v.id("users"),
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
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_active", ["userId", "isActive"]),

  healthTaskLogs: defineTable({
    userId: v.id("users"),
    taskId: v.id("healthTasks"),
    date: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_task", ["taskId"]),

  childGrowthRecords: defineTable({
    userId: v.id("users"),
    childId: v.optional(v.id("profiles")), // إذا كان الطفل له profile منفصل
    date: v.string(),
    weight: v.number(), // kg
    height: v.number(), // cm
    headCircumference: v.optional(v.number()), // cm للأطفال الصغار
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_child", ["childId"])
    .index("by_user_date", ["userId", "date"]),

  activityRecords: defineTable({
    userId: v.id("users"),
    date: v.string(),
    activityType: v.union(
      v.literal("walking"),
      v.literal("running"),
      v.literal("playing"),
      v.literal("exercise"),
      v.literal("other")
    ),
    duration: v.number(), // minutes
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  userNutritionPlans: defineTable({
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
    targetCalories: v.number(),
    targetProtein: v.number(),
    targetCarbs: v.number(),
    targetFat: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_client", ["clientProfileId"])
    .index("by_active", ["isActive"]),

  // --- New Tables ---
  progressPhotos: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    photoUrl: v.string(),
    date: v.string(),
    weight: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  weightHistory: defineTable({
    userId: v.id("users"),
    weight: v.number(),
    date: v.string(), // ISO date string
    notes: v.optional(v.string()),
  }).index("by_user_date", ["userId", "date"]),

  streaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastWorkoutDate: v.string(),
    totalWorkouts: v.number(),
  }).index("by_user", ["userId"]),

  achievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    unlockedAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
