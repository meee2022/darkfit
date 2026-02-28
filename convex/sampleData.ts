import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";

/* ==========
   Helpers
=========== */

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

/* ==========
   Sample Exercises
   (muscleGroup مطابق للـ schema.ts)
=========== */

const sampleExercises = [
  {
    name: "Bench Press",
    nameAr: "ضغط البنش بالبار",
    description: "Compound barbell exercise targeting chest, shoulders, and triceps.",
    descriptionAr: "تمرين مركب بالبار يستهدف عضلات الصدر والأكتاف والترايسبس.",
    muscleGroup: "Chest" as const,
    muscleGroupAr: "الصدر",
    difficulty: "intermediate" as const,
    equipment: ["Barbell", "Bench"] as string[],
    instructions: [
      "Lie flat on the bench with your feet on the ground.",
      "Grip the bar slightly wider than shoulder-width.",
      "Lower the bar to mid-chest with control.",
      "Press the bar back up to the starting position."
    ] as string[],
    instructionsAr: [
      "استلقِ على البنش وثبّت قدميك على الأرض.",
      "أمسك البار بقبضة أوسع قليلاً من عرض الكتفين.",
      "اخفض البار ببطء حتى منتصف الصدر.",
      "ادفع البار للأعلى للعودة للوضعية الأولى."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    duration: 45,
    reps: "8-12",
    sets: 4,
    caloriesBurned: 150,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Push-ups",
    nameAr: "تمرين الضغط الأرضي",
    description: "Bodyweight push exercise for chest, shoulders, and triceps.",
    descriptionAr: "تمرين وزن الجسم يستهدف الصدر والأكتاف والترايسبس.",
    muscleGroup: "Chest" as const,
    muscleGroupAr: "الصدر",
    difficulty: "beginner" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Start in a plank position with hands under shoulders.",
      "Lower your body until your chest nearly touches the floor.",
      "Push back up to the starting position."
    ] as string[],
    instructionsAr: [
      "ابدأ في وضعية البلانك مع وضع اليدين أسفل الكتفين.",
      "اخفض جسمك حتى يقترب صدرك من الأرض.",
      "ادفع جسمك للأعلى للعودة للوضعية الأولى."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    duration: 15,
    reps: "10-15",
    sets: 3,
    caloriesBurned: 50,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Bodyweight Squat",
    nameAr: "سكوات وزن الجسم",
    description: "Fundamental lower body exercise targeting quads and glutes.",
    descriptionAr: "تمرين أساسي للجزء السفلي يستهدف الفخذين والأرداف.",
    muscleGroup: "Quads" as const,
    muscleGroupAr: "الأرجل",
    difficulty: "beginner" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Stand with feet shoulder-width apart.",
      "Sit back and down as if sitting on a chair.",
      "Keep your chest up and knees tracking over toes.",
      "Return to standing position."
    ] as string[],
    instructionsAr: [
      "قف مع فتح القدمين بعرض الكتفين.",
      "انزل بالحوض للخلف وللأسفل كأنك تجلس على كرسي.",
      "حافظ على صدرك مرفوعاً والركبتين باتجاه أصابع القدم.",
      "عد لوضعية الوقوف الأولى."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    duration: 20,
    reps: "12-20",
    sets: 3,
    caloriesBurned: 60,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Lunges",
    nameAr: "تمرين الطعن الأمامي",
    description: "Single-leg lower body exercise for quads and glutes.",
    descriptionAr: "تمرين للجزء السفلي يعتمد على قدم واحدة ويقوّي الفخذين والأرداف.",
    muscleGroup: "Quads" as const,
    muscleGroupAr: "الأرجل",
    difficulty: "intermediate" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Stand tall with feet hip-width apart.",
      "Step forward with one leg and lower your hips.",
      "Bend both knees to about 90 degrees.",
      "Push back to the starting position."
    ] as string[],
    instructionsAr: [
      "قف منتصباً وقدماك بعرض الوركين.",
      "اخطُ خطوة للأمام بساق واحدة وأنزل الحوض.",
      "اثنِ الركبتين تقريباً حتى 90 درجة.",
      "ادفع الساق للأمام للعودة للوضعية الأولى."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    duration: 20,
    reps: "10-12 لكل ساق",
    sets: 3,
    caloriesBurned: 70,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Plank",
    nameAr: "بلانك ثابت",
    description: "Core isometric exercise targeting abs and stabilizers.",
    descriptionAr: "تمرين ثابت لعضلات البطن والعضلات المثبّتة حول العمود الفقري.",
    muscleGroup: "Abs" as const,
    muscleGroupAr: "البطن",
    difficulty: "beginner" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Start in a push-up position.",
      "Lower down to your forearms.",
      "Keep your body in a straight line from head to heels.",
      "Hold the position without dropping hips."
    ] as string[],
    instructionsAr: [
      "ابدأ في وضعية تمرين الضغط.",
      "انزل على الساعدين.",
      "حافظ على جسمك مستقيماً من الرأس إلى الكعبين.",
      "اثبت على هذه الوضعية دون إسقاط الحوض."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    duration: 30,
    reps: "30-60 ثانية",
    sets: 3,
    caloriesBurned: 25,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Mountain Climbers",
    nameAr: "متسلق الجبال",
    description: "Dynamic core and cardio exercise for full body.",
    descriptionAr: "تمرين ديناميكي للبطن والكارديو يعمل على الجسم كاملاً.",
    muscleGroup: "Abs" as const,
    muscleGroupAr: "البطن",
    difficulty: "intermediate" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Start in a high plank position.",
      "Drive one knee toward your chest.",
      "Quickly switch legs in a running motion.",
      "Keep hips low and core tight."
    ] as string[],
    instructionsAr: [
      "ابدأ في وضعية بلانك عالية.",
      "اسحب ركبة واحدة باتجاه الصدر.",
      "بدّل الساقين بسرعة كما لو أنك تجري.",
      "حافظ على الحوض منخفضاً والبطن مشدوداً."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
    duration: 30,
    reps: "20-30",
    sets: 3,
    caloriesBurned: 100,
    targetGender: "both" as const,
    category: "cardio" as const,
    isActive: true,
  },
  {
    name: "Dumbbell Shoulder Press",
    nameAr: "ضغط كتف بالدمبل",
    description: "Overhead dumbbell press for shoulders and triceps.",
    descriptionAr: "تمرين ضغط فوق الرأس بالدمبل لتقوية الأكتاف والترايسبس.",
    muscleGroup: "shoulders" as const,
    muscleGroupAr: "الأكتاف",
    difficulty: "intermediate" as const,
    equipment: ["Dumbbells", "Bench (optional)"] as string[],
    instructions: [
      "Sit or stand with dumbbells at shoulder height.",
      "Press the dumbbells overhead until arms are extended.",
      "Lower back down with control."
    ] as string[],
    instructionsAr: [
      "اجلس أو قف والدمبل عند مستوى الكتفين.",
      "ادفع الدمبل للأعلى حتى استقامة الذراعين.",
      "أنزل الدمبل ببطء إلى وضع البداية."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=B-aVuyhvLHU",
    duration: 30,
    reps: "8-12",
    sets: 3,
    caloriesBurned: 60,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Lat Pulldown",
    nameAr: "سحب علوي للظهر",
    description: "Machine pulldown exercise targeting lats and upper back.",
    descriptionAr: "تمرين سحب على جهاز يستهدف عضلات الظهر العلوية واللاتس.",
    muscleGroup: "Lats" as const,
    muscleGroupAr: "الظهر العلوي",
    difficulty: "beginner" as const,
    equipment: ["Lat Pulldown Machine"] as string[],
    instructions: [
      "Sit with thighs secured under the pads.",
      "Grip the bar wider than shoulder-width.",
      "Pull the bar down toward your upper chest.",
      "Control the bar back to the top."
    ] as string[],
    instructionsAr: [
      "اجلس وثبّت الفخذين أسفل الوسادات.",
      "أمسك البار بقبضة أوسع من الكتفين.",
      "اسحب البار نحو أعلى الصدر.",
      "أعد البار للأعلى مع التحكم."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    duration: 30,
    reps: "10-12",
    sets: 3,
    caloriesBurned: 70,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Bicep Curls",
    nameAr: "كيرلز للبايسبس",
    description: "Dumbbell curl for biceps isolation.",
    descriptionAr: "تمرين معزول لتقوية عضلة البايسبس باستخدام الدمبل.",
    muscleGroup: "Biceps" as const,
    muscleGroupAr: "الذراع الأمامية",
    difficulty: "beginner" as const,
    equipment: ["Dumbbells"] as string[],
    instructions: [
      "Stand tall holding dumbbells at your sides.",
      "Curl the weights up while keeping elbows close.",
      "Lower back down slowly."
    ] as string[],
    instructionsAr: [
      "قف مستقيماً ممسكاً بالدمبل بجانب جسمك.",
      "اثنِ المرفقين وارفع الدمبل نحو الكتفين.",
      "أنزل الدمبل ببطء إلى وضع البداية."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    duration: 20,
    reps: "10-15",
    sets: 3,
    caloriesBurned: 40,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
  {
    name: "Glute Bridge",
    nameAr: "جسر الأرداف",
    description: "Hip bridge exercise targeting glutes and hamstrings.",
    descriptionAr: "تمرين يركّز على عضلات الأرداف والخلفية للفخذ.",
    muscleGroup: "Glutes" as const,
    muscleGroupAr: "الأرداف",
    difficulty: "beginner" as const,
    equipment: ["Bodyweight"] as string[],
    instructions: [
      "Lie on your back with knees bent and feet on the floor.",
      "Push through your heels to lift your hips.",
      "Squeeze glutes at the top, then lower slowly."
    ] as string[],
    instructionsAr: [
      "استلقِ على ظهرك مع ثني الركبتين ووضع القدمين على الأرض.",
      "ادفع الأرض بالكعبين وارفع الحوض للأعلى.",
      "اضغط الأرداف في أعلى الحركة ثم انزل ببطء."
    ] as string[],
    imageUrl: undefined,
    videoUrl: "https://www.youtube.com/watch?v=m2Zx-57cSok",
    duration: 20,
    reps: "12-15",
    sets: 3,
    caloriesBurned: 40,
    targetGender: "both" as const,
    category: "strength" as const,
    isActive: true,
  },
];

/* ==========
   Sample Foods
=========== */

const sampleFoods = [
  // Breakfast
  {
    name: "Oats",
    nameAr: "شوفان",
    category: "Grains",
    categoryAr: "حبوب",
    mealType: "breakfast" as const,
    caloriesPer100g: 389,
    proteinPer100g: 17,
    carbsPer100g: 66,
    fatPer100g: 7,
    fiber: 11,
    sugar: 1,
    sodium: 2,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Boiled Eggs",
    nameAr: "بيض مسلوق",
    category: "Proteins",
    categoryAr: "بروتينات",
    mealType: "breakfast" as const,
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Whole Wheat Bread",
    nameAr: "خبز أسمر",
    category: "Grains",
    categoryAr: "حبوب",
    mealType: "breakfast" as const,
    caloriesPer100g: 247,
    proteinPer100g: 13,
    carbsPer100g: 41,
    fatPer100g: 4.2,
    fiber: 7,
    sugar: 6,
    sodium: 450,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Peanut Butter",
    nameAr: "زبدة الفول السوداني",
    category: "Spreads",
    categoryAr: "دهون صحية",
    mealType: "breakfast" as const,
    caloriesPer100g: 588,
    proteinPer100g: 25,
    carbsPer100g: 20,
    fatPer100g: 50,
    fiber: 6,
    sugar: 9,
    sodium: 17,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: false,
  },
  {
    name: "Greek Yogurt (plain)",
    nameAr: "زبادي يوناني (سادة)",
    category: "Dairy",
    categoryAr: "منتجات الألبان",
    mealType: "breakfast" as const,
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
  {
    name: "Low-fat Milk",
    nameAr: "حليب قليل الدسم",
    category: "Dairy",
    categoryAr: "منتجات الألبان",
    mealType: "breakfast" as const,
    caloriesPer100g: 50,
    proteinPer100g: 3.4,
    carbsPer100g: 5,
    fatPer100g: 1.2,
    fiber: 0,
    sugar: 5,
    sodium: 44,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },

  // Lunch
  {
    name: "Grilled Chicken Breast",
    nameAr: "صدر دجاج مشوي",
    category: "Proteins",
    categoryAr: "بروتينات",
    mealType: "lunch" as const,
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
    name: "Brown Rice",
    nameAr: "أرز بني",
    category: "Grains",
    categoryAr: "حبوب",
    mealType: "lunch" as const,
    caloriesPer100g: 111,
    proteinPer100g: 2.6,
    carbsPer100g: 23,
    fatPer100g: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "White Rice",
    nameAr: "أرز أبيض",
    category: "Grains",
    categoryAr: "حبوب",
    mealType: "lunch" as const,
    caloriesPer100g: 130,
    proteinPer100g: 2.4,
    carbsPer100g: 28,
    fatPer100g: 0.3,
    fiber: 0.4,
    sugar: 0.1,
    sodium: 1,
    isDiabeticFriendly: false,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Broccoli",
    nameAr: "بروكلي",
    category: "Vegetables",
    categoryAr: "خضروات",
    mealType: "lunch" as const,
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
  {
    name: "Mixed Salad",
    nameAr: "سلطة خضار مشكلة",
    category: "Vegetables",
    categoryAr: "خضروات",
    mealType: "lunch" as const,
    caloriesPer100g: 40,
    proteinPer100g: 1.5,
    carbsPer100g: 7,
    fatPer100g: 1.2,
    fiber: 2.5,
    sugar: 3,
    sodium: 80,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },

  // Dinner
  {
    name: "Salmon",
    nameAr: "سلمون",
    category: "Proteins",
    categoryAr: "بروتينات",
    mealType: "dinner" as const,
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
  {
    name: "Sweet Potato",
    nameAr: "بطاطا حلوة",
    category: "Vegetables",
    categoryAr: "خضروات",
    mealType: "dinner" as const,
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20,
    fatPer100g: 0.1,
    fiber: 3,
    sugar: 4.2,
    sodium: 54,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Tuna (canned in water)",
    nameAr: "تونة معلبة في الماء",
    category: "Proteins",
    categoryAr: "بروتينات",
    mealType: "dinner" as const,
    caloriesPer100g: 116,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 0.8,
    fiber: 0,
    sugar: 0,
    sodium: 370,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Cucumber",
    nameAr: "خيار",
    category: "Vegetables",
    categoryAr: "خضروات",
    mealType: "dinner" as const,
    caloriesPer100g: 15,
    proteinPer100g: 0.7,
    carbsPer100g: 3.6,
    fatPer100g: 0.1,
    fiber: 0.5,
    sugar: 1.7,
    sodium: 2,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },

  // Snacks
  {
    name: "Apple",
    nameAr: "تفاح",
    category: "Fruits",
    categoryAr: "فواكه",
    mealType: "snack" as const,
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
    name: "Banana",
    nameAr: "موز",
    category: "Fruits",
    categoryAr: "فواكه",
    mealType: "snack" as const,
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatPer100g: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
    isDiabeticFriendly: false,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Almonds",
    nameAr: "لوز",
    category: "Nuts",
    categoryAr: "مكسرات",
    mealType: "snack" as const,
    caloriesPer100g: 579,
    proteinPer100g: 21,
    carbsPer100g: 22,
    fatPer100g: 50,
    fiber: 12,
    sugar: 4.4,
    sodium: 1,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: false,
  },
  {
    name: "Dates",
    nameAr: "تمر",
    category: "Fruits",
    categoryAr: "فواكه",
    mealType: "snack" as const,
    caloriesPer100g: 282,
    proteinPer100g: 2.5,
    carbsPer100g: 75,
    fatPer100g: 0.4,
    fiber: 8,
    sugar: 63,
    sodium: 2,
    isDiabeticFriendly: false,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Carrot Sticks",
    nameAr: "أعواد جزر",
    category: "Vegetables",
    categoryAr: "خضروات",
    mealType: "snack" as const,
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    sodium: 69,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Mixed Berries",
    nameAr: "توت مشكل",
    category: "Fruits",
    categoryAr: "فواكه",
    mealType: "snack" as const,
    caloriesPer100g: 49,
    proteinPer100g: 0.9,
    carbsPer100g: 12,
    fatPer100g: 0.3,
    fiber: 2,
    sugar: 7,
    sodium: 1,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
  {
    name: "Pumpkin Seeds",
    nameAr: "بذور اليقطين",
    category: "Nuts",
    categoryAr: "مكسرات",
    mealType: "snack" as const,
    caloriesPer100g: 541,
    proteinPer100g: 24,
    carbsPer100g: 20,
    fatPer100g: 46,
    fiber: 1.1,
    sugar: 2.7,
    sodium: 3,
    isDiabeticFriendly: true,
    isSeniorFriendly: true,
    isChildFriendly: true,
  },
];

/* ==========
   Sample Nutrition Plans
=========== */

const sampleNutritionPlans = [
  // 1) LEAN STARTER
  {
    name: "Lean Starter",
    nameAr: "خطة تنشيف بسيطة",
    description: "Simple high-protein day for cutting and fat loss.",
    descriptionAr: "يوم بسيط عالي البروتين للتنشيف وحرق الدهون.",
    targetGroup: "general" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "08:00",
        foods: [
          {
            name: "Greek Yogurt (plain)",
            nameAr: "زبادي يوناني (سادة)",
            quantity: "200g",
            calories: 118,
            protein: 20,
            carbs: 7.2,
            fat: 0.8,
          },
          {
            name: "Oats",
            nameAr: "شوفان",
            quantity: "60g",
            calories: 233,
            protein: 10.1,
            carbs: 39.8,
            fat: 4.1,
          },
        ],
        totalCalories: 351,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "14:00",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "200g",
            calories: 330,
            protein: 62,
            carbs: 0,
            fat: 7.2,
          },
          {
            name: "Broccoli",
            nameAr: "بروكلي",
            quantity: "150g",
            calories: 51,
            protein: 4.2,
            carbs: 9.9,
            fat: 0.6,
          },
        ],
        totalCalories: 381,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "17:30",
        foods: [
          {
            name: "Apple",
            nameAr: "تفاح",
            quantity: "180g",
            calories: 94,
            protein: 0.5,
            carbs: 25.2,
            fat: 0.4,
          },
          {
            name: "Almonds",
            nameAr: "لوز",
            quantity: "20g",
            calories: 116,
            protein: 4.2,
            carbs: 4.3,
            fat: 10,
          },
        ],
        totalCalories: 210,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "20:00",
        foods: [
          {
            name: "Salmon",
            nameAr: "سلمون",
            quantity: "160g",
            calories: 333,
            protein: 32,
            carbs: 0,
            fat: 20.8,
          },
        ],
        totalCalories: 333,
      },
    ],
    totalDailyCalories: 1275,
    isActive: true,
  },

  // 2) STABLE SUGAR - Diabetes
  {
    name: "Stable Sugar Day",
    nameAr: "خطة استقرار السكر",
    description: "Higher fiber, controlled carbs, and lower sugar spikes.",
    descriptionAr: "ألياف عالية، كربوهيدرات موزعة، وتقليل ارتفاع السكر.",
    targetGroup: "diabetes" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "08:00",
        foods: [
          {
            name: "Oats",
            nameAr: "شوفان",
            quantity: "50g",
            calories: 195,
            protein: 8.5,
            carbs: 33.1,
            fat: 3.5,
          },
          {
            name: "Greek Yogurt (plain)",
            nameAr: "زبادي يوناني (سادة)",
            quantity: "200g",
            calories: 118,
            protein: 20,
            carbs: 7.2,
            fat: 0.8,
          },
        ],
        totalCalories: 313,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "14:00",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "180g",
            calories: 297,
            protein: 55.8,
            carbs: 0,
            fat: 6.5,
          },
          {
            name: "Broccoli",
            nameAr: "بروكلي",
            quantity: "200g",
            calories: 68,
            protein: 5.6,
            carbs: 13.2,
            fat: 0.8,
          },
        ],
        totalCalories: 365,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "17:30",
        foods: [
          {
            name: "Almonds",
            nameAr: "لوز",
            quantity: "25g",
            calories: 145,
            protein: 5.3,
            carbs: 5.4,
            fat: 12.5,
          },
        ],
        totalCalories: 145,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "20:00",
        foods: [
          {
            name: "Salmon",
            nameAr: "سلمون",
            quantity: "150g",
            calories: 312,
            protein: 30,
            carbs: 0,
            fat: 19.5,
          },
        ],
        totalCalories: 312,
      },
    ],
    totalDailyCalories: 1135,
    isActive: true,
  },

  // 3) MUSCLE GAIN
  {
    name: "Muscle Gain Basic",
    nameAr: "خطة زيادة عضل أساسية",
    description: "Higher calories and protein to support lean muscle gain.",
    descriptionAr: "سعرات وبروتين أعلى لدعم زيادة الكتلة العضلية.",
    targetGroup: "general" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "08:30",
        foods: [
          {
            name: "Oats",
            nameAr: "شوفان",
            quantity: "80g",
            calories: 311,
            protein: 13.6,
            carbs: 52.8,
            fat: 5.6,
          },
          {
            name: "Boiled Eggs",
            nameAr: "بيض مسلوق",
            quantity: "2 eggs (~100g)",
            calories: 155,
            protein: 13,
            carbs: 1.1,
            fat: 11,
          },
        ],
        totalCalories: 466,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "14:30",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "220g",
            calories: 363,
            protein: 68.2,
            carbs: 0,
            fat: 7.9,
          },
          {
            name: "Brown Rice",
            nameAr: "أرز بني",
            quantity: "200g",
            calories: 222,
            protein: 5.2,
            carbs: 46,
            fat: 1.8,
          },
          {
            name: "Mixed Salad",
            nameAr: "سلطة خضار مشكلة",
            quantity: "150g",
            calories: 60,
            protein: 2.3,
            carbs: 10.5,
            fat: 1.8,
          },
        ],
        totalCalories: 645,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "17:30",
        foods: [
          {
            name: "Banana",
            nameAr: "موز",
            quantity: "120g",
            calories: 107,
            protein: 1.3,
            carbs: 27.6,
            fat: 0.4,
          },
          {
            name: "Peanut Butter",
            nameAr: "زبدة الفول السوداني",
            quantity: "25g",
            calories: 147,
            protein: 6.25,
            carbs: 5,
            fat: 12.5,
          },
        ],
        totalCalories: 254,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "21:00",
        foods: [
          {
            name: "Tuna (canned in water)",
            nameAr: "تونة معلبة في الماء",
            quantity: "150g",
            calories: 174,
            protein: 39,
            carbs: 0,
            fat: 1.2,
          },
          {
            name: "Sweet Potato",
            nameAr: "بطاطا حلوة",
            quantity: "200g",
            calories: 172,
            protein: 3.2,
            carbs: 40,
            fat: 0.2,
          },
          {
            name: "Cucumber",
            nameAr: "خيار",
            quantity: "100g",
            calories: 15,
            protein: 0.7,
            carbs: 3.6,
            fat: 0.1,
          },
        ],
        totalCalories: 361,
      },
    ],
    totalDailyCalories: 1726,
    isActive: true,
  },

  // 4) SENIOR PLAN
  {
    name: "Senior Wellness",
    nameAr: "خطة صحة كبار السن",
    description: "Balanced, easy-to-digest meals with moderate calories.",
    descriptionAr: "وجبات متوازنة سهلة الهضم بسعرات معتدلة لكبار السن.",
    targetGroup: "seniors" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "08:00",
        foods: [
          {
            name: "Oats",
            nameAr: "شوفان",
            quantity: "50g",
            calories: 195,
            protein: 8.5,
            carbs: 33.1,
            fat: 3.5,
          },
          {
            name: "Low-fat Milk",
            nameAr: "حليب قليل الدسم",
            quantity: "200ml",
            calories: 100,
            protein: 6.8,
            carbs: 10,
            fat: 2.4,
          },
        ],
        totalCalories: 295,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "13:30",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "150g",
            calories: 248,
            protein: 46.5,
            carbs: 0,
            fat: 5.4,
          },
          {
            name: "White Rice",
            nameAr: "أرز أبيض",
            quantity: "120g",
            calories: 156,
            protein: 2.9,
            carbs: 33.6,
            fat: 0.4,
          },
          {
            name: "Mixed Salad",
            nameAr: "سلطة خضار مشكلة",
            quantity: "100g",
            calories: 40,
            protein: 1.5,
            carbs: 7,
            fat: 1.2,
          },
        ],
        totalCalories: 444,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "17:00",
        foods: [
          {
            name: "Apple",
            nameAr: "تفاح",
            quantity: "150g",
            calories: 78,
            protein: 0.4,
            carbs: 21,
            fat: 0.3,
          },
          {
            name: "Almonds",
            nameAr: "لوز",
            quantity: "15g",
            calories: 87,
            protein: 3.1,
            carbs: 3.3,
            fat: 7.5,
          },
        ],
        totalCalories: 165,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "20:00",
        foods: [
          {
            name: "Tuna (canned in water)",
            nameAr: "تونة معلبة في الماء",
            quantity: "120g",
            calories: 139,
            protein: 31.2,
            carbs: 0,
            fat: 1,
          },
          {
            name: "Sweet Potato",
            nameAr: "بطاطا حلوة",
            quantity: "150g",
            calories: 129,
            protein: 2.4,
            carbs: 30,
            fat: 0.15,
          },
        ],
        totalCalories: 268,
      },
    ],
    totalDailyCalories: 1172,
    isActive: true,
  },

  // 5) KIDS PLAN
  {
    name: "Kids Healthy Growth",
    nameAr: "خطة نمو صحية للأطفال",
    description: "Balanced meals with moderate portions and kid-friendly options.",
    descriptionAr: "وجبات متوازنة بحصص مناسبة وخيارات محببة للأطفال.",
    targetGroup: "children" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "07:30",
        foods: [
          {
            name: "Whole Wheat Bread",
            nameAr: "خبز أسمر",
            quantity: "50g",
            calories: 124,
            protein: 6.5,
            carbs: 20.5,
            fat: 2.1,
          },
          {
            name: "Peanut Butter",
            nameAr: "زبدة الفول السوداني",
            quantity: "15g",
            calories: 88,
            protein: 3.8,
            carbs: 3,
            fat: 7.5,
          },
          {
            name: "Banana",
            nameAr: "موز",
            quantity: "80g",
            calories: 71,
            protein: 0.9,
            carbs: 18.4,
            fat: 0.2,
          },
        ],
        totalCalories: 283,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "13:00",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "120g",
            calories: 198,
            protein: 37.2,
            carbs: 0,
            fat: 4.3,
          },
          {
            name: "White Rice",
            nameAr: "أرز أبيض",
            quantity: "100g",
            calories: 130,
            protein: 2.4,
            carbs: 28,
            fat: 0.3,
          },
          {
            name: "Cucumber",
            nameAr: "خيار",
            quantity: "80g",
            calories: 12,
            protein: 0.6,
            carbs: 2.9,
            fat: 0.1,
          },
        ],
        totalCalories: 340,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "16:30",
        foods: [
          {
            name: "Apple",
            nameAr: "تفاح",
            quantity: "100g",
            calories: 52,
            protein: 0.3,
            carbs: 14,
            fat: 0.2,
          },
          {
            name: "Carrot Sticks",
            nameAr: "أعواد جزر",
            quantity: "60g",
            calories: 25,
            protein: 0.5,
            carbs: 6,
            fat: 0.1,
          },
        ],
        totalCalories: 77,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "19:30",
        foods: [
          {
            name: "Low-fat Milk",
            nameAr: "حليب قليل الدسم",
            quantity: "200ml",
            calories: 100,
            protein: 6.8,
            carbs: 10,
            fat: 2.4,
          },
          {
            name: "Sweet Potato",
            nameAr: "بطاطا حلوة",
            quantity: "120g",
            calories: 103,
            protein: 1.9,
            carbs: 24,
            fat: 0.12,
          },
        ],
        totalCalories: 203,
      },
    ],
    totalDailyCalories: 903,
    isActive: true,
  },

  // 6) ACTIVE FIT (General higher activity)
  {
    name: "Active Fit Plan",
    nameAr: "خطة النمط النشط",
    description: "Balanced higher-calorie plan for active individuals.",
    descriptionAr: "خطة متوازنة بسعرات أعلى تناسب نمط حياة نشط وتدريبات منتظمة.",
    targetGroup: "general" as const,
    meals: [
      {
        name: "Breakfast",
        nameAr: "فطور",
        time: "08:00",
        foods: [
          {
            name: "Oats",
            nameAr: "شوفان",
            quantity: "70g",
            calories: 272,
            protein: 11.9,
            carbs: 46.2,
            fat: 4.9,
          },
          {
            name: "Greek Yogurt (plain)",
            nameAr: "زبادي يوناني (سادة)",
            quantity: "150g",
            calories: 89,
            protein: 15,
            carbs: 5.4,
            fat: 0.6,
          },
        ],
        totalCalories: 361,
      },
      {
        name: "Lunch",
        nameAr: "غداء",
        time: "13:30",
        foods: [
          {
            name: "Grilled Chicken Breast",
            nameAr: "صدر دجاج مشوي",
            quantity: "200g",
            calories: 330,
            protein: 62,
            carbs: 0,
            fat: 7.2,
          },
          {
            name: "Brown Rice",
            nameAr: "أرز بني",
            quantity: "220g",
            calories: 244,
            protein: 5.7,
            carbs: 50.6,
            fat: 2,
          },
          {
            name: "Mixed Salad",
            nameAr: "سلطة خضار مشكلة",
            quantity: "150g",
            calories: 60,
            protein: 2.3,
            carbs: 10.5,
            fat: 1.8,
          },
        ],
        totalCalories: 634,
      },
      {
        name: "Snack",
        nameAr: "سناك",
        time: "17:00",
        foods: [
          {
            name: "Banana",
            nameAr: "موز",
            quantity: "100g",
            calories: 89,
            protein: 1.1,
            carbs: 23,
            fat: 0.3,
          },
          {
            name: "Almonds",
            nameAr: "لوز",
            quantity: "20g",
            calories: 116,
            protein: 4.2,
            carbs: 4.3,
            fat: 10,
          },
        ],
        totalCalories: 205,
      },
      {
        name: "Dinner",
        nameAr: "عشاء",
        time: "20:30",
        foods: [
          {
            name: "Salmon",
            nameAr: "سلمون",
            quantity: "180g",
            calories: 374,
            protein: 36,
            carbs: 0,
            fat: 23.4,
          },
          {
            name: "Sweet Potato",
            nameAr: "بطاطا حلوة",
            quantity: "150g",
            calories: 129,
            protein: 2.4,
            carbs: 30,
            fat: 0.15,
          },
        ],
        totalCalories: 503,
      },
    ],
    totalDailyCalories: 1703,
    isActive: true,
  },
];

/* ==========
   Internal Upsert Seeders
=========== */

async function seedExercisesInternal(ctx: any) {
  let inserted = 0;
  let updated = 0;

  for (const ex of sampleExercises) {
    const existing = await ctx.db
      .query("exercises")
      .filter((q: any) => q.eq(q.field("nameAr"), ex.nameAr))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, ex);
      updated++;
    } else {
      await ctx.db.insert("exercises", ex);
      inserted++;
    }
  }

  return { inserted, updated };
}

async function seedFoodsInternal(ctx: any) {
  let inserted = 0;
  let updated = 0;

  for (const food of sampleFoods) {
    const existing = await ctx.db
      .query("foods")
      .filter((q: any) => q.eq(q.field("nameAr"), food.nameAr))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, food);
      updated++;
    } else {
      await ctx.db.insert("foods", food);
      inserted++;
    }
  }

  return { inserted, updated };
}

async function seedNutritionPlansInternal(ctx: any) {
  let inserted = 0;
  let updated = 0;

  for (const plan of sampleNutritionPlans) {
    const existing = await ctx.db
      .query("nutritionPlans")
      .filter((q: any) => q.eq(q.field("nameAr"), plan.nameAr))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, plan);
      updated++;
    } else {
      await ctx.db.insert("nutritionPlans", plan);
      inserted++;
    }
  }

  return { inserted, updated };
}

/* ==========
   Public Mutations (Buttons)
=========== */

export const seedExercises = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const res = await seedExercisesInternal(ctx);
    return { message: "تم زرع بيانات التمارين", ...res };
  },
});

export const seedFoods = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const res = await seedFoodsInternal(ctx);
    return { message: "تم زرع بيانات الأطعمة", ...res };
  },
});

export const seedNutritionPlans = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const res = await seedNutritionPlansInternal(ctx);
    return { message: "تم زرع خطط التغذية", ...res };
  },
});

export const seedAllSampleData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.force) {
      const foods = await ctx.db.query("foods").collect();
      for (const f of foods) await ctx.db.delete(f._id);

      const exercises = await ctx.db.query("exercises").collect();
      for (const e of exercises) await ctx.db.delete(e._id);

      const plans = await ctx.db.query("nutritionPlans").collect();
      for (const p of plans) await ctx.db.delete(p._id);
    }

    const exRes = await seedExercisesInternal(ctx);
    const foodsRes = await seedFoodsInternal(ctx);
    const plansRes = await seedNutritionPlansInternal(ctx);

    return {
      message: "تم زرع جميع البيانات التجريبية",
      exercises: exRes,
      foods: foodsRes,
      plans: plansRes,
      forceCleared: !!args.force,
    };
  },
});
