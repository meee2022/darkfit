import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const translateAllExercises = action({
  args: {},
  handler: async (ctx): Promise<{ 
    translated: number; 
    failed: number; 
    skipped: number; 
    remaining: number; 
    message: string 
  }> => {
    console.log("🚀 translateAllExercises started");

    // ✅ جلب كل التمارين بدون limit
    const exercises: any[] = await ctx.runQuery(api.exercises.adminListExercises, {
      includeInactive: true,
      limit: 1000, // زيادة الحد
    });

    console.log(`📊 إجمالي التمارين: ${exercises.length}`);

    let translated = 0;
    let failed = 0;
    let skipped = 0;

    for (const ex of exercises) {
      // ✅ شرط محسّن: نترجم لو:
      // 1. مفيش اسم عربي
      // 2. أو الاسم العربي = الاسم الإنجليزي
      // 3. أو التعليمات فاضية/افتراضية
      
      const nameAr = (ex.nameAr || "").trim();
      const nameEn = (ex.name || "").trim();
      
      const hasRealArabicName = nameAr.length > 0 && nameAr !== nameEn;
      
      const hasRealArabicInstructions = 
        Array.isArray(ex.instructionsAr) &&
        ex.instructionsAr.length > 0 &&
        !ex.instructionsAr[0]?.includes("تمرين يستهدف هذه العضلات.") &&
        !ex.instructionsAr[0]?.includes("اتبع التعليمات") &&
        ex.instructionsAr[0]?.length > 10; // تعليمة حقيقية مش فاضية

      // ✅ لو مترجم بالكامل، نتخطاه
      if (hasRealArabicName && hasRealArabicInstructions) {
        skipped++;
        console.log(`⏭️ تخطي (مترجم): ${nameEn}`);
        continue;
      }

      // ✅ تحقق من الاسم الإنجليزي (مرن أكثر)
      if (!nameEn) {
        skipped++;
        console.log(`⏭️ تخطي (بدون اسم): ${ex._id}`);
        continue;
      }

      // ✅ حد أقصى للترجمة في كل تشغيل (اختياري - لتجنب timeout)
      if (translated >= 50) {
        console.log(`⚠️ وصلنا الحد الأقصى (50). شغّل مرة تانية لإكمال الباقي.`);
        break;
      }

      try {
        console.log(`🔄 جاري ترجمة: ${nameEn}`);

        const prompt = `ترجم هذا التمرين الرياضي للعربية. أعد JSON فقط بدون أي نص إضافي:

اسم التمرين: ${nameEn}
التعليمات بالإنجليزية: ${ex.instructions?.join(" | ") || "لا توجد تعليمات"}

أعد الترجمة بهذا الشكل بالضبط:
{
  "nameAr": "الاسم بالعربي",
  "descriptionAr": "وصف قصير عن التمرين وفوائده",
  "instructionsAr": ["الخطوة الأولى", "الخطوة الثانية", "الخطوة الثالثة"]
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error(`❌ Gemini API error: ${response.status}`, text);
          failed++;

          if (response.status === 429) {
            console.log("⚠️ Rate limit! انتظر دقيقة وشغّل مرة تانية.");
            break;
          }
          continue;
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`❌ No JSON for ${nameEn}:`, content);
          failed++;
          continue;
        }

        const translation = JSON.parse(jsonMatch[0]);

        if (translation.nameAr) {
          await ctx.runMutation(api.exercises.internalUpdateTranslation, {
            exerciseId: ex._id,
            nameAr: translation.nameAr,
            descriptionAr: translation.descriptionAr || "تمرين رياضي",
            instructionsAr: Array.isArray(translation.instructionsAr) && translation.instructionsAr.length > 0
              ? translation.instructionsAr
              : ["قم بأداء التمرين بشكل صحيح"],
          });
          translated++;
          console.log(`✅ تم: ${nameEn} → ${translation.nameAr}`);
        }

        // ✅ تأخير لتجنب rate limit
        await new Promise((r) => setTimeout(r, 800));
        
      } catch (e: any) {
        console.error(`❌ فشل ${nameEn}:`, e?.message);
        failed++;
      }
    }

    const remaining: number = exercises.length - translated - skipped - failed;
    
    console.log("📊 النتيجة النهائية:", {
      translated,
      failed,
      skipped,
      remaining,
    });

    return { 
      translated, 
      failed, 
      skipped,
      remaining,
      message: remaining > 0 ? "شغّل مرة تانية لإكمال الباقي" : "تم ترجمة الكل!"
    };
  },
});

// ✅ Action لإعادة تعيين الأسماء والتعليمات غير المترجمة
export const resetUntranslatedNames = action({
  args: {},
  handler: async (ctx): Promise<{ reset: number }> => {
    const count = await ctx.runMutation(
      api.exercises.internalResetUntranslatedNames,
      {}
    );
    return { reset: count };
  },
});
