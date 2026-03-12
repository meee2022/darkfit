import { mutation } from "./_generated/server";

// Correct image URLs from the free-exercise-db repository (JPG format)
const IMAGE_FIXES: Record<string, string> = {
  // seed11 exercises
  "Romanian Deadlift": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
  "Lying Leg Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg",
  "Seated Calf Raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/0.jpg",
  "Standing Calf Raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Seated_Calf_Raise/1.jpg",
  "Russian Twist": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg",
  "Reverse Barbell Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
  "Barbell Wrist Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg",
  "Cable Face Pull": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
  "Back Extension": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/1.jpg",
  "Bulgarian Split Squat": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
  // seed12 exercises
  "Lat Pulldown": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
  "Overhead Press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg",
  "Leg Extension": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg",
  "Dumbbell Flyes": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/0.jpg",
  "Hammer Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg",
  "Cable Crossover": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/1.jpg",
  "T-Bar Row": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg",
  "Front Squat": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
  "Preacher Curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg",
  "Lying Triceps Extension": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
};

export const fixExerciseImages = mutation({
  args: {},
  handler: async (ctx) => {
    let fixed = 0;
    let notFound: string[] = [];

    for (const [name, imageUrl] of Object.entries(IMAGE_FIXES)) {
      const ex = await ctx.db
        .query("exercises")
        .filter((q) => q.eq(q.field("name"), name))
        .first();
      if (ex) {
        await ctx.db.patch(ex._id, { imageUrl });
        fixed++;
      } else {
        notFound.push(name);
      }
    }
    return `✅ تم إصلاح ${fixed} صورة. غير موجود: ${notFound.length > 0 ? notFound.join(", ") : "لا شيء"}`;
  },
});
