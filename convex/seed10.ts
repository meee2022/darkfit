import { mutation } from "./_generated/server";
import { v } from "convex/values";

const TEN_EXERCISES = [
    {
        name: "Barbell Bench Press",
        nameAr: "ضغط الصدر بالبار (بنش برس)",
        description: "A classic compound exercise for building chest size and strength.",
        descriptionAr: "تمرين مركب كلاسيكي لبناء حجم وقوة الصدر.",
        muscleGroup: "Chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate",
        equipment: ["Barbell", "Bench"],
        instructions: [
            "Lie on a flat bench with your eyes under the bar.",
            "Grasp the bar with a medium width grip.",
            "Lower the bar to your mid-chest.",
            "Press the bar back up until your arms are locked."
        ],
        instructionsAr: [
            "استلقِ على مقعد مسطح وعيناك أسفل البار.",
            "أمسك البار بقبضة متوسطة العرض.",
            "أنزل البار ببطء حتى يلامس منتصف صدرك.",
            "ادفع البار للأعلى حتى تستقيم ذراعاك تماماً."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0025/00251101-Barbell-Bench-Press_Chest_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Barbell Squat",
        nameAr: "سكوات بالبار (القرفصاء)",
        description: "The king of all leg exercises targeting quads and glutes.",
        descriptionAr: "ملك تمارين الأرجل، يستهدف الفخذ الأمامي والأرداف.",
        muscleGroup: "Quads",
        muscleGroupAr: "الفخذ الأمامي",
        difficulty: "advanced",
        equipment: ["Barbell", "Squat Rack"],
        instructions: [
            "Rest the barbell on your upper back/traps.",
            "Bend your knees and lower your hips.",
            "Squat down until your thighs are parallel to the floor.",
            "Push through your heels to return to the starting position."
        ],
        instructionsAr: [
            "ضع البار على الجزء العلوي من ظهرك / الترابيس.",
            "اثنِ ركبتيك واخفض حوضك للأسفل.",
            "انزل بالسكوات حتى تصبح أفخاذك موازية للأرض.",
            "ادفع من خلال كعبيك للعودة إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0088/00881101-Barbell-Squat_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Pull-up",
        nameAr: "العقلة (Pull-up)",
        description: "A bodyweight exercise that builds the upper back and lats.",
        descriptionAr: "تمرين بوزن الجسم يبني الجزء العلوي من الظهر واللاتس.",
        muscleGroup: "Lats",
        muscleGroupAr: "الظهر العلوي",
        difficulty: "intermediate",
        equipment: ["Pull-up Bar"],
        instructions: [
            "Grasp the pull-up bar with an overhand grip.",
            "Pull your body up until your chin is over the bar.",
            "Lower yourself back down with control."
        ],
        instructionsAr: [
            "أمسك بار العقلة بقبضة واسعة من الأعلى.",
            "اسحب جسمك للأعلى حتى يتجاوز ذقنك البار.",
            "أنزل نفسك ببطء وتحكم إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0652/06521101-Pull-up_Back_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Dumbbell Lateral Raise",
        nameAr: "رفرفة جانبية بالدمبل",
        description: "An isolation exercise that primarily targets the lateral deltoids.",
        descriptionAr: "تمرين عزل يستهدف بشكل أساسي الأكتاف الجانبية.",
        muscleGroup: "shoulders",
        muscleGroupAr: "الأكتاف",
        difficulty: "beginner",
        equipment: ["Dumbbells"],
        instructions: [
            "Hold a dumbbell in each hand by your sides.",
            "Raise the weights out to the side until your arms are parallel to the floor.",
            "Lower the weights slowly back to the start."
        ],
        instructionsAr: [
            "أمسك دمبل في كل يد بجانب جسمك.",
            "ارفع الأوزان للجانب حتى تصبح ذراعاك موازية للأرض.",
            "أنزل الأوزان ببطء للعودة إلى نقطة البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0334/03341101-Dumbbell-Lateral-Raise_Shoulders_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Barbell Curl",
        nameAr: "بايسبس بالبار",
        description: "A staple exercise to build bicep mass and strength.",
        descriptionAr: "تمرين أساسي لبناء كتلة وقوة البايسبس.",
        muscleGroup: "Biceps",
        muscleGroupAr: "البايسبس",
        difficulty: "beginner",
        equipment: ["Barbell"],
        instructions: [
            "Stand holding a barbell with an underhand grip, shoulder-width apart.",
            "Keep your elbows close to your torso and curl the weights up.",
            "Slowly lower the barbell back to the starting position."
        ],
        instructionsAr: [
            "قف ممسكاً بالبار بقبضة سفلية بعرض الكتفين.",
            "أبقِ مرفقيك قريبين من جذعك وارفع الوزن للأعلى.",
            "أنزل البار ببطء للعودة لوضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0031/00311101-Barbell-Curl_Upper-Arms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Cable Triceps Pushdown",
        nameAr: "سحب ترايسبس بالكابل",
        description: "An isolation movement that targets all three heads of the triceps.",
        descriptionAr: "حركة عزل تستهدف جميع رؤوس الترايسبس.",
        muscleGroup: "Triceps",
        muscleGroupAr: "الترايسبس",
        difficulty: "beginner",
        equipment: ["Cable Machine", "Rope Attachment"],
        instructions: [
            "Attach a rope to a high pulley and grab with both hands.",
            "Keep your upper arms stationary and push the rope down.",
            "Squeeze your triceps at the bottom, then return to start."
        ],
        instructionsAr: [
            "اربط حبلًا في البكرة العلوية وأمسكه بكلتا يديك.",
            "أبقِ الجزء العلوي من ذراعيك ثابتاً وادفع الحبل للأسفل.",
            "اعصر الترايسبس في الأسفل، ثم عد لنقطة البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0241/02411101-Cable-Triceps-Pushdown_Upper-Arms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Crunch",
        nameAr: "كرانشز (طحن البطن)",
        description: "A core exercise targeting the abdominal muscles.",
        descriptionAr: "تمرين بطن أساسي يستهدف عضلات البطن.",
        muscleGroup: "Abs",
        muscleGroupAr: "البطن",
        difficulty: "beginner",
        equipment: ["Bodyweight"],
        instructions: [
            "Lie on your back with your knees bent and feet flat on the floor.",
            "Place your hands lightly behind your head.",
            "Contract your abs to lift your upper body.",
            "Slowly lower yourself back down."
        ],
        instructionsAr: [
            "استلقِ على ظهرك مع ثني ركبتيك وقدميك مسطحتين على الأرض.",
            "ضع يديك برفق خلف رأسك.",
            "قم بشد عضلات بطنك لرفع الجزء العلوي من جسمك.",
            "أنزل نفسك ببطء للأسفل."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0274/02741101-Crunch_Waist_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Leg Press",
        nameAr: "دفع الأرجل على الجهاز",
        description: "A machine-based compound exercise for the quads, hamstrings, and glutes.",
        descriptionAr: "تمرين مركب على الجهاز يستهدف الفخذ الأمامي والخلفي والأرداف.",
        muscleGroup: "Quads",
        muscleGroupAr: "الفخذ الأمامي",
        difficulty: "intermediate",
        equipment: ["Leg Press Machine"],
        instructions: [
            "Sit on the machine and place your feet shoulder-width apart on the sled.",
            "Lower the platform until your knees make a 90-degree angle.",
            "Push back up through your heels without locking your knees."
        ],
        instructionsAr: [
            "اجلس على الجهاز وضع قدميك بعرض الكتفين على المنصة.",
            "أنزل المنصة حتى تشكل ركبتاك زاوية 90 درجة.",
            "ادفع للأعلى من خلال كعبيك دون قفل ركبتيك."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0585/05851101-Leg-Press_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Seated Cable Row",
        nameAr: "سحب أرضي جالس بالكابل",
        description: "An excellent exercise for building mid-back thickness.",
        descriptionAr: "تمرين ممتاز لبناء سمك منتصف الظهر.",
        muscleGroup: "Lats",
        muscleGroupAr: "الظهر العلوي",
        difficulty: "intermediate",
        equipment: ["Cable Machine", "V-Bar"],
        instructions: [
            "Sit at a cable row machine and grab the V-bar handles.",
            "Keep your back straight and pull the handles to your stomach.",
            "Squeeze your shoulder blades together, then release slowly."
        ],
        instructionsAr: [
            "اجلس على جهاز السحب الأرضي وأمسك مقبض الـ V.",
            "حافظ على ظهرك مستقيماً واسحب المقبض إلى بطنك.",
            "اعصر لوحي كتفك معاً، ثم أرخِ ببطء."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0754/07541101-Seated-Cable-Row_Back_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Dumbbell Shrug",
        nameAr: "رفع الكتفين بالدمبل (تراپيس)",
        description: "An isolation exercise focused entirely on the upper trapezius muscles.",
        descriptionAr: "تمرين عزل يركز بالكامل على عضلات الترابيس العلوية.",
        muscleGroup: "Traps",
        muscleGroupAr: "الترابيس",
        difficulty: "beginner",
        equipment: ["Dumbbells"],
        instructions: [
            "Hold a dumbbell in each hand with arms straight down.",
            "Raise your shoulders as high as possible in a shrugging motion.",
            "Hold for a second at the top, then lower back down."
        ],
        instructionsAr: [
            "أمسك دمبل في كل يد مع استقامة ذراعيك للأسفل.",
            "ارفع كتفيك بأعلى قدر ممكن كأنك تهز كتفيك.",
            "توقف لثانية في الأعلى، ثم أنزلهما ببطء."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0394/03941101-Dumbbell-Shrug_Back_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    }
];

export const seed10Exercises = mutation({
    args: {},
    handler: async (ctx) => {
        let added = 0;

        for (const ex of TEN_EXERCISES) {
            // Check if it already exists by name
            const existing = await ctx.db
                .query("exercises")
                .filter((q) => q.eq(q.field("name"), ex.name))
                .first();

            if (!existing) {
                await ctx.db.insert("exercises", ex as any);
                added++;
            }
        }

        return `Successfully added ${added} exercises.`;
  }
});
