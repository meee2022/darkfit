import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ELEVEN_EXERCISES = [
    {
        name: "Romanian Deadlift",
        nameAr: "رفعة مميتة رومانية (رومانيان ديدليفت)",
        description: "An excellent exercise for building the hamstrings and glutes.",
        descriptionAr: "تمرين ممتاز لبناء الفخذ الخلفي والأرداف.",
        muscleGroup: "Hamstrings",
        muscleGroupAr: "الفخذ الخلفي",
        difficulty: "intermediate",
        equipment: ["Barbell"],
        instructions: [
            "Hold a barbell at hip level with a pronated grip.",
            "Keeping your back straight, hinge at your hips and lower the bar along your legs.",
            "Feel a stretch in your hamstrings, then return to the starting position."
        ],
        instructionsAr: [
            "أمسك البار عند مستوى الحوض بقبضة علوية.",
            "حافظ على استقامة ظهرك، واثنِ حوضك للخلف وأنزل البار بمحاذاة ساقيك.",
            "اشعر بتمدد في الفخذ الخلفي، ثم عد إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0084/00841101-Barbell-Romanian-Deadlift_Hips_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Lying Leg Curl",
        nameAr: "طوي الأرجل مستلقياً (ليج كيرل)",
        description: "A machine exercise that isolates the hamstring muscles.",
        descriptionAr: "تمرين على الجهاز يعزل عضلات الفخذ الخلفي.",
        muscleGroup: "Hamstrings",
        muscleGroupAr: "الفخذ الخلفي",
        difficulty: "beginner",
        equipment: ["Leg Curl Machine"],
        instructions: [
            "Lie face down on the leg curl machine.",
            "Place your legs under the padded lever.",
            "Curl your legs up as far as possible without lifting your upper legs.",
            "Lower the weight back to the starting position."
        ],
        instructionsAr: [
            "استلقِ على وجهك على جهاز طوي الأرجل.",
            "ضع ساقيك تحت الرافعة المبطنة.",
            "اطوِ ساقيك للأعلى قدر الإمكان دون رفع أعلى فخذيك.",
            "أنزل الوزن ببطء إلى وضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0599/05991101-Lever-Lying-Leg-Curl_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Seated Calf Raise",
        nameAr: "رفرفة سمانة جالس (كالف ريز)",
        description: "Targets the soleus muscle of the calf.",
        descriptionAr: "يستهدف العضلة النعلية (السمانة).",
        muscleGroup: "Calf",
        muscleGroupAr: "السمانة",
        difficulty: "beginner",
        equipment: ["Calf Raise Machine"],
        instructions: [
            "Sit on the machine and place your toes on the lower portion of the platform.",
            "Place the lower thighs under the lever pad.",
            "Raise your heels as high as possible.",
            "Lower your heels slowly until your calves are fully stretched."
        ],
        instructionsAr: [
            "اجلس على الجهاز وضع أطراف أصابع قدميك على الجزء السفلي من المنصة.",
            "ضع الجزء السفلي من فخذيك تحت وسادة الرافعة.",
            "ارفع كعبيك لأعلى مستوى ممكن.",
            "أنزل كعبيك ببطء حتى تتمدد عضلات السمانة بالكامل."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0609/06091101-Lever-Seated-Calf-Raise_Calves_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Standing Calf Raise",
        nameAr: "رفرفة سمانة واقف (كالف ريز)",
        description: "A foundational exercise for building calf size and strength.",
        descriptionAr: "تمرين أساسي لبناء حجم وقوة السمانة.",
        muscleGroup: "Calf",
        muscleGroupAr: "السمانة",
        difficulty: "beginner",
        equipment: ["Calf Raise Machine"],
        instructions: [
            "Stand at the machine with the shoulder pads resting on your shoulders.",
            "Place the balls of your feet on the calf block.",
            "Drop your heels down as far as they can go.",
            "Push up on the balls of your feet as high as you can."
        ],
        instructionsAr: [
            "قف على الجهاز بحيث تستقر وسادات الكتف على كتفيك.",
            "ضع مقدمة قدميك على المنصة الخاصة بالسمانة.",
            "أنزل كعبيك للأسفل لأقصى حد ممكن.",
            "ارفع جسمك لأعلى بالدفع بمقدمة قدميك لأقصى حد."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0615/06151101-Lever-Standing-Calf-Raise_Calves_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Russian Twist",
        nameAr: "التواء روسي (رشين تويست)",
        description: "An excellent core exercise that engages the obliques.",
        descriptionAr: "تمرين بطن ممتاز يشغل عضلات الخواصر (الاوبليك).",
        muscleGroup: "Obliques",
        muscleGroupAr: "الخواصر",
        difficulty: "intermediate",
        equipment: ["Bodyweight"],
        instructions: [
            "Sit on the floor, lean back slightly, and lift your feet off the ground.",
            "Clasp your hands together or hold a weight.",
            "Twist your torso to the right, then to the left."
        ],
        instructionsAr: [
            "اجلس على الأرض، وقم بالميل للخلف قليلاً، وارفع قدميك عن الأرض.",
            "اشبك يديك معاً أو أمسك بوزن.",
            "قم بتدوير جذعك إلى اليمين، ثم إلى اليسار."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0744/07441101-Russian-Twist_Waist_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Reverse Barbell Curl",
        nameAr: "بايسبس عكسي بالبار",
        description: "Targets the brachioradialis and helps build forearm thickness.",
        descriptionAr: "يستهدف العضلة العضدية الكعبرية ويساعد في زيادة سمك السواعد.",
        muscleGroup: "Forearms",
        muscleGroupAr: "السواعد",
        difficulty: "intermediate",
        equipment: ["Barbell"],
        instructions: [
            "Stand upright holding a barbell with a pronated (overhand) grip.",
            "Keep your elbows close to your torso.",
            "Curl the barbell upwards while exhaling.",
            "Slowly lower the barbell to the starting position."
        ],
        instructionsAr: [
            "قف مستقيماً ممسكاً البار بقبضة علوية (كف اليد للأسفل).",
            "أبقِ مرفقيك قريبين من جذعك.",
            "ارفع البار للأعلى وأنت تخرج الزفير.",
            "أنزل البار ببطء لوضع البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0083/00831101-Barbell-Reverse-Curl_Forearms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Barbell Wrist Curl",
        nameAr: "طوي المعصم بالبار (ريست كيرل)",
        description: "Isolates the forearm flexors for greater grip strength.",
        descriptionAr: "يعزل عضلات المعصم القابضة لزيادة قوة القبضة.",
        muscleGroup: "Forearms",
        muscleGroupAr: "السواعد",
        difficulty: "beginner",
        equipment: ["Barbell", "Bench"],
        instructions: [
            "Sit on a bench and rest your forearms on your thighs or the bench edge.",
            "Hold a barbell with an underhand grip.",
            "Curl your wrists upward as far as possible.",
            "Lower the barbell back slowly until your wrists are extended."
        ],
        instructionsAr: [
            "اجلس على المقعد وضع سواعدك على فخذيك أو على حافة المقعد.",
            "أمسك البار بقبضة سفلية (كف اليد للأعلى).",
            "اطوِ معصميك للأعلى قدر الإمكان.",
            "أنزل البار ببطء حتى تتمدد معصميك لأسفل."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0125/01251101-Barbell-Wrist-Curl_Forearms_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Cable Face Pull",
        nameAr: "سحب للوجه بالكابل (فيس بول)",
        description: "A great active movement for rear deltoids and upper back.",
        descriptionAr: "حركة ممتازة للأكتاف الخلفية وأعلى الظهر.",
        muscleGroup: "RearShoulderRearDeltoid",
        muscleGroupAr: "الأكتاف الخلفية",
        difficulty: "intermediate",
        equipment: ["Cable Machine", "Rope Attachment"],
        instructions: [
            "Attach a rope to a high pulley on a cable machine.",
            "Grasp the rope and step back to create tension.",
            "Pull the rope towards your face, flaring your elbows outwards.",
            "Squeeze your upper back, then slowly return to the start."
        ],
        instructionsAr: [
            "اربط حبلاً بالبكرة العلوية في جهاز الكابل.",
            "أمسك الحبل وتراجع للخلف لخلق شد.",
            "اسحب الحبل باتجاه وجهك، مع فرد مرفقيك للخارج.",
            "اعصر أعلى ظهرك، ثم عد ببطء إلى البداية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0171/01711101-Cable-Face-Pull_Shoulders_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Back Extension",
        nameAr: "تمديد الظهر (هايبر إكستنشن)",
        description: "Strengthens the erector spinae muscles of the lower back.",
        descriptionAr: "يقوي عضلات العمود الفقري في أسفل الظهر.",
        muscleGroup: "LowerBackErectorSpinae",
        muscleGroupAr: "أسفل الظهر",
        difficulty: "beginner",
        equipment: ["Hyperextension Bench"],
        instructions: [
            "Position yourself on a hyperextension bench with your hips on the pad.",
            "Cross your arms over your chest or place them behind your head.",
            "Bend forward at the waist as far as you can.",
            "Raise your torso back up until your body is in a straight line."
        ],
        instructionsAr: [
            "ضع نفسك على مقعد تمديد الظهر بحيث يكون حوضك على الوسادة.",
            "ضع ذراعيك متقاطعتين على صدرك أو خلف رأسك.",
            "انحنِ للأمام من الخصر قدر الإمكان.",
            "ارفع جذعك للأعلى حتى يصبح جسمك في خط مستقيم."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0523/05231101-Lever-Back-Extension_Waist_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    },
    {
        name: "Bulgarian Split Squat",
        nameAr: "سكوات بلغاري (بلغاريان سبليت)",
        description: "A unilateral leg exercise that targets the quads and glutes.",
        descriptionAr: "تمرين أرجل أحادي الجانب يستهدف الفخذ الأمامي والأرداف.",
        muscleGroup: "Glutes",
        muscleGroupAr: "الأرداف",
        difficulty: "advanced",
        equipment: ["Dumbbells", "Bench"],
        instructions: [
            "Stand a few feet in front of a bench.",
            "Place the top of one foot resting on the bench behind you.",
            "Lower your body until your front thigh is parallel to the ground.",
            "Push back up continuously through the front foot."
        ],
        instructionsAr: [
            "قف على بعد بضعة أقدام أمام المقعد.",
            "ضع أعلى إحدى قدميك على المقعد خلفك.",
            "أنزل جسمك حتى يصبح الفخذ الأمامي موازياً للأرض.",
            "ادفع للأعلى باستمرار من خلال القدم الأمامية."
        ],
        imageUrl: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/0309/03091101-Dumbbell-Bulgarian-Split-Squat_Thighs_small.gif",
        targetGender: "both",
        category: "strength",
        isActive: true
    }
];

export const seed11Exercises = mutation({
    args: {},
    handler: async (ctx) => {
        let added = 0;

        for (const ex of ELEVEN_EXERCISES) {
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
