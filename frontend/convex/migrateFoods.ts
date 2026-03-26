import { mutation } from "./_generated/server";

export const backfillMealTypes = mutation({
  handler: async (ctx) => {
    const allFoods = await ctx.db.query("foods").collect();
    let updatedCount = 0;

    for (const food of allFoods) {
      let newMealType = food.mealType;
      const catAr = food.categoryAr || "";
      const catEn = food.category || "";
      const nameAr = food.nameAr || "";

      // 1. Breakfast
      if (
        catAr === "إفطار عربي" || 
        catEn === "Arabic Breakfast" ||
        ["بيض مسلوق", "بيض مقلي", "عجة بيض", "فول مدمس", "فول بالزيت", "شكشوكة", "جبنة حلوم مشوية", "جبنة بيضاء", "زعتر بزيت", "مناقيش زعتر", "مناقيش جبنة", "بلاليط", "بليلة", "بليلة (حمص مسلوق)"].includes(nameAr)
      ) {
        newMealType = "breakfast";
      }
      // 2. Lunch / Dinner
      else if (
        catAr === "أطباق رئيسية" || catEn === "Main Dishes" ||
        catAr === "أطباق خليجية تقليدية" || catEn === "Traditional Gulf Dishes" ||
        catAr === "مشاوي ولحوم" || catEn === "Grills & Meats" ||
        catAr === "شاورما وساندويتشات" || catEn === "Shawarma & Sandwiches" ||
        catAr === "أسماك ومأكولات بحرية" || catEn === "Seafood" ||
        ["شوربة عدس", "شوربة حب", "شوربة شوفان", "فتة لحم", "فتة شاورما"].includes(nameAr)
      ) {
        newMealType = "lunch_dinner";
      }
      // 3. Snacks
      else if (
        catAr === "حلويات عربية" || catEn === "Arabic Sweets" ||
        catAr === "مكسرات وسناكات" || catEn === "Nuts & Snacks" ||
        ["كنافة", "بسبوسة", "بقلاوة", "قطايف", "محلبية", "أم علي", "سمبوسة", "لقيمات", "خنفروش", "خبيصة", "بثيث", "عقيلي", "وربات", "قمر الدين", "جلاب", "سوبيا"].some(n => nameAr.includes(n))
      ) {
        newMealType = "snack";
      }
      // 4. Any
      else if (
        catAr === "مقبلات وسلطات" || catEn === "Appetizers & Salads" ||
        catAr === "خبز ونشويات أساسية" || catEn === "Bread & Staples" ||
        catAr === "بروتينات صحية" || catEn === "Healthy Proteins" ||
        catAr === "مشروبات" || catEn === "Beverages" ||
        ["تمر", "لبنة", "فلافل", "حمص"].some(n => nameAr.includes(n))
      ) {
        newMealType = "any";
      } else {
        // Fallback
        newMealType = "any";
      }

      if (food.mealType !== newMealType) {
        await ctx.db.patch(food._id, { mealType: newMealType as any });
        updatedCount++;
      }
    }
    
    return { updatedCount, totalCount: allFoods.length };
  },
});
