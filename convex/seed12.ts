import { mutation } from "./_generated/server";
import { v } from "convex/values";

const TWELVE_EXERCISES = [
    {
        name: "Lat Pulldown",
        nameAr: "سحب ظهر واسع (لات بول داون)",
        description: "A machine exercise that targets the latissimus dorsi muscles.",
        descriptionAr: "تمرين على الجهاز يستهدف العضلة الظهرية العريضة (المجنص).",
        muscleGroup: "Lats",
        muscleGroupAr: "الظهر العلوي",
        difficulty: "beginner",
        equipment: ["Cable Machine", "Wide Bar"],
        instructions: [
            "Sit at a lat pulldown machine and grab the wide bar with an overhand grip.",
            "Keep your torso upright and lean back slightly.",
            "Pull the bar down to your upper chest, squeezing your shoulder blades together.",
            "Slowly return the bar to the starting position."
        ],
        instructionsAr: [
            "اجلس على جهاز السحب العريض وأمسك البار العريض بقبضة علوية واسعة.",
            "أبقِ جذعك مستقيماً ومِل للخلف قليلاً.",
            "اسحب البار للأسفل نحو أعلى صدرك، مع عصر لوحي كتفك معاً.",
            "أعد البار ببطء إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0150/01501101-Cable-Front-Pulldown_Lats_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Overhead Press",
        nameAr: "ضغط كتف بالبار (أوفر هيد برس)",
        description: "A compound exercise for building shoulder strength and size.",
        descriptionAr: "تمرين مركب لبناء قوة وحجم الأكتاف.",
        muscleGroup: "shoulders",
        muscleGroupAr: "الأكتاف",
        difficulty: "intermediate",
        equipment: ["Barbell"],
        instructions: [
            "Stand with your feet shoulder-width apart, holding a barbell at shoulder level.",
            "Press the bar overhead until your arms are fully extended.",
            "Keep your core tight and avoid leaning back excessively.",
            "Lower the bar back to shoulder level."
        ],
        instructionsAr: [
            "قف مع مباعدة قدميك بعرض كتفيك، حاملاً البار عند مستوى الكتف.",
            "ادفع البار لأعلى رأسك حتى تستقيم ذراعاك بالكامل.",
            "شد عضلات بطنك وتجنب الميل للخلف بشكل مفرط.",
            "أنزل البار ببطء إلى مستوى الكتف."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0064/00641101-Barbell-Military-Press_Shoulders_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Leg Extension",
        nameAr: "رفرفة أرجل أمامي (ليج إكستنشن)",
        description: "An isolation exercise for the quadriceps.",
        descriptionAr: "تمرين عزل للفخذ الأمامي.",
        muscleGroup: "Quads",
        muscleGroupAr: "الفخذ الأمامي",
        difficulty: "beginner",
        equipment: ["Leg Extension Machine"],
        instructions: [
            "Sit on the machine with your legs under the pad and your feet pointing forward.",
            "Extend your legs to the maximum, exhaling as you do so.",
            "Hold for a second at the top of the movement.",
            "Slowly lower the weight back to the original position."
        ],
        instructionsAr: [
            "اجلس على الجهاز وضع ساقيك أسفل الوسادة وقدميك تشيران للأمام.",
            "افرد ساقيك لأقصى حد مع إخراج الزفير.",
            "توقف لثانية في أعلى نقطة من الحركة.",
            "أنزل الوزن ببطء للعودة إلى الوضع الأصلي."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0581/05811101-Lever-Leg-Extension_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Dumbbell Flyes",
        nameAr: "تفتيح صدر بالدمبل (فلايز)",
        description: "An isolation movement that targets the chest muscles.",
        descriptionAr: "حركة عزل تستهدف عضلات الصدر.",
        muscleGroup: "Chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate",
        equipment: ["Dumbbells", "Bench"],
        instructions: [
            "Lie flat on a bench holding two dumbbells straight up over your chest.",
            "With a slight bend in your elbows, lower the arms out to both sides in a wide arc.",
            "Feel a stretch in your chest, then bring the dumbbells back up, squeezing your pectoral muscles."
        ],
        instructionsAr: [
            "استلقِ على ظهرك على المقعد ممسكاً بدمبلين باستقامة فوق صدرك.",
            "مع ثني مرفقيك قليلاً، أنزل ذراعيك للخارج على كلا الجانبين في قوس واسع.",
            "اشعر بتمدد في صدرك، ثم ارفع الدمبلين معاً مرة أخرى، مع عصر عضلات صدرك."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0308/03081101-Dumbbell-Fly_Chest_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Hammer Curl",
        nameAr: "بايسبس مطرقة (هامر كيرل)",
        description: "Works the biceps and brachialis, improving arm thickness.",
        descriptionAr: "يشغل البايسبس والعضلة العضدية، مما يحسن سمك الذراع.",
        muscleGroup: "Biceps",
        muscleGroupAr: "البايسبس",
        difficulty: "beginner",
        equipment: ["Dumbbells"],
        instructions: [
            "Stand holding a dumbbell in each hand with a neutral grip (palms facing your torso).",
            "Keep your elbows near your torso and curl the weights up without twisting your wrists.",
            "Lower the dumbbells back down slowly."
        ],
        instructionsAr: [
            "قف ممسكاً بدمبل في كل يد بقبضة محايدة (راحة اليدين تواجه جانبي جسمك).",
            "أبقِ مرفقيك بالقرب من جذعك وارفع الأوزان لأعلى دون تدوير معصميك.",
            "أنزل الدمبلز ببطء لوضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0313/03131101-Dumbbell-Hammer-Curl_Upper-Arms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Cable Crossover",
        nameAr: "تفتيح بالكابل (كابل كروس أوفر)",
        description: "A chest exercise that provides constant tension.",
        descriptionAr: "تمرين للصدر يوفر شداً مستمراً.",
        muscleGroup: "Chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate",
        equipment: ["Cable Machine"],
        instructions: [
            "Set the pulleys high and grab a handle in each hand.",
            "Step forward and lean slightly, keeping a slight bend in your elbows.",
            "Bring your hands together in front of your chest in a hugging motion.",
            "Slowly return your arms to the starting stretch."
        ],
        instructionsAr: [
            "اضبط البكرات عالياً وأمسك مقبضاً في كل يد.",
            "تقدم خطوة للأمام ومِل قليلاً، مع الحفاظ على انحناء طفيف في مرفقيك.",
            "اجمع يديك معاً أمام صدرك في حركة تشبه العناق.",
            "أعد ذراعيك ببطء إلى وضع التمدد الأولي."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0147/01471101-Cable-Crossover_Chest_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "T-Bar Row",
        nameAr: "سحب ظهر بجهاز التي بار (تي بار رو)",
        description: "A heavy compound back exercise.",
        descriptionAr: "تمرين ظهر مركب ثقيل.",
        muscleGroup: "Lats",
        muscleGroupAr: "الظهر العلوي",
        difficulty: "intermediate",
        equipment: ["T-Bar Machine", "Barbell"],
        instructions: [
            "Stand over the T-bar, keeping your back straight and knees slightly bent.",
            "Grasp the handles and pull the weight towards your chest.",
            "Squeeze your shoulder blades, then slowly lower the weight."
        ],
        instructionsAr: [
            "قف فوق جهاز التي بار، وحافظ على استقامة ظهرك مع ثني ركبتيك قليلاً.",
            "أمسك المقابض واسحب الوزن نحو صدرك.",
            "اعصر لوحي كتفك معاً، ثم أنزل الوزن ببطء."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0805/08051101-T-Bar-Bent-Over-Row_Back_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Front Squat",
        nameAr: "سكوات أمامي بالبار (فرونت سكوات)",
        description: "A variation of the squat emphasizing the quadriceps and core.",
        descriptionAr: "شكل من أشكال السكوات يركز على الفخذ الأمامي وعضلات البطن.",
        muscleGroup: "Quads",
        muscleGroupAr: "الفخذ الأمامي",
        difficulty: "advanced",
        equipment: ["Barbell", "Squat Rack"],
        instructions: [
            "Rest the barbell resting across the front of your shoulders.",
            "Keep your elbows high and chest up.",
            "Squat down until thighs are parallel to the floor.",
            "Push back up to the starting position."
        ],
        instructionsAr: [
            "ضع البار مستقراً عبر الجزء الأمامي من كتفيك.",
            "أبقِ مرفقيك مرتفعين وصدرك للأعلى.",
            "انزل بالسكوات حتى يصبح فخذيك موازيين للأرض.",
            "ادفع للأعلى للعودة إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0043/00431101-Barbell-Front-Squat_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Preacher Curl",
        nameAr: "بايسبس على جهاز الارتكاز (بريتشر كيرل)",
        description: "A strict bicep isolation exercise.",
        descriptionAr: "تمرين عزل صارم لعضلة البايسبس.",
        muscleGroup: "Biceps",
        muscleGroupAr: "البايسبس",
        difficulty: "beginner",
        equipment: ["EZ Bar", "Preacher Bench"],
        instructions: [
            "Sit on the preacher bench and rest your upper arms on the pad.",
            "Grasp the EZ bar with an underhand grip.",
            "Curl the bar towards your shoulders.",
            "Lower the bar until your arms are fully extended."
        ],
        instructionsAr: [
            "اجلس على مقعد الارتكاز وضع أعلى ذراعيك على الوسادة.",
            "أمسك البار المتعرج (EZ) بقبضة سفلية.",
            "ارفع البار باتجاه كتفيك.",
            "أنزل البار حتى تستقيم ذراعاك بالكامل."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0430/04301101-EZ-Barbell-Preacher-Curl_Upper-Arms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Lying Triceps Extension",
        nameAr: "ترايسبس نائم بالبار (سكال كراشرز)",
        description: "A targeted triceps exercise performed lying down.",
        descriptionAr: "تمرين ترايسبس مستهدف يتم أداؤه أثناء الاستلقاء.",
        muscleGroup: "Triceps",
        muscleGroupAr: "الترايسبس",
        difficulty: "intermediate",
        equipment: ["EZ Bar", "Bench"],
        instructions: [
            "Lie on a flat bench holding an EZ bar over your chest with straight arms.",
            "Keeping your elbows pointing towards the ceiling, bend your arms to lower the bar towards your forehead.",
            "Extend your arms back to the starting position."
        ],
        instructionsAr: [
            "استلقِ على مقعد مسطح ممسكاً ببار متعرج (EZ) فوق صدرك وذراعاك مستقيمتان.",
            "مع الحفاظ على توجيه مرفقيك نحو السقف، اثنِ ذراعيك لإنزال البار نحو جبهتك.",
            "افرد ذراعيك للعودة إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0435/04351101-EZ-Bar-Lying-Triceps-Extension_Upper-Arms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    }
];

export const seed12Exercises = mutation({
    args: {},
    handler: async (ctx) => {
        let added = 0;

        for (const ex of TWELVE_EXERCISES) {
            const existing = await ctx.db
                .query("exercises")
                .filter((q) => q.eq(q.field("name"), ex.name))
                .first();

            if (!existing) {
                await ctx.db.insert("exercises", ex as any);
                added++;
            }
        }

        return `Successfully added ${added} new exercises.`;
  }
});
