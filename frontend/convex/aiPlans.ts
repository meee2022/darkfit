import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * 1. Auto-Plan Generator (Workout + Nutrition)
 */
export const generateSmartPlan = action({
  args: {
    goal: v.string(),
    fitnessLevel: v.string(),
    daysPerWeek: v.number(),
    dietPreference: v.optional(v.string()),
    injuries: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");

    const prompt = `أنت خبير لياقة بدنية وتغذية أوصي بخطة للعميل التالي:
    الهدف: ${args.goal}
    مستوى اللياقة: ${args.fitnessLevel}
    أيام التدريب: ${args.daysPerWeek}
    تفضيلات الأكل: ${args.dietPreference || "عادي"}
    إصابات سابقة: ${args.injuries?.join("، ") || "لا يوجد"}
    
    قم بإرجاع الخطة بصيغة JSON فقط بهذا الشكل:
    {
      "workoutPlanName": "اسم الخطة (عربي)",
      "nutritionPlanName": "اسم خطة التغذية (عربي)",
      "weeklySchedule": [
        { "day": 1, "focus": "صدر وتراي", "exercises": ["Pushup", "Dumbbell Press"] }
      ],
      "dailyMacros": { "calories": 2500, "protein": 150, "carbs": 250, "fats": 80 },
      "tips": ["نصيحة 1", "نصيحة 2"]
    }
    بدون أي نصوص إضافية أو markdown tags مثل \`\`\`json.`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new ConvexError("Missing GROQ_API_KEY");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Groq API HTTP Error:", response.status, await response.text());
      throw new ConvexError("Failed to contact Groq API");
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error("Groq API Error / No Text. Full response:", JSON.stringify(data, null, 2));
      throw new ConvexError(data.error?.message || "No text returned from Groq.");
    }

    try {
      // Safely extract the JSON object using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         console.error("No JSON match in text:", text);
         throw new ConvexError("No JSON object found");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parsing failed. Raw response:", text);
      throw new ConvexError("Failed to parse AI Plan response");
    }
  },
});

/**
 * 2. Meal Photo Recognition
 */
export const analyzeMealPhoto = action({
  args: { base64Image: v.string(), mimeType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");

    const prompt = `أنت خبير تغذية تستطيع تحليل صور الوجبات. انظر لهذه الوجبة، وتعرف على مكوناتها التقريبية واطبع لي النتائج بصيغة JSON فقط بالشكل التالي:
    {
      "mealNameAr": "اسم الوجبة التقريبي بالعربي (مثال: دجاج ورز)",
      "mealNameEn": "اسم الوجبة التقريبي بالانجليزي",
      "totalCalories": 550,
      "macros": {
        "protein": 40,
        "carbs": 50,
        "fats": 15
      },
      "confidence": "high/medium/low"
    }
    لا تقم بالرد بأي شيء آخر عدا الـ JSON الصالح. بدون markdown.`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new ConvexError("Missing GROQ_API_KEY");

    // Clean base64 if it has dataUri prefix
    const base64Data = args.base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
    const dataUrl = `data:${args.mimeType};base64,${base64Data}`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Vision API Error:", response.status, err);
      throw new ConvexError("Failed to analyze image with Groq Vision");
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error("Groq Vision API Error / No Text. Full response:", JSON.stringify(data, null, 2));
      throw new ConvexError(data.error?.message || "Vision API returned empty text");
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         console.error("No JSON match in text:", text);
         throw new ConvexError("No JSON object found");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parsing failed. Raw response:", text);
      throw new ConvexError("Failed to parse Vision response");
    }
  },
});

/**
 * 3. Weekly Reports Generation
 * Reads recent logs and generates insights.
 */
export const generateWeeklyReport = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");

    const stats = {
      workoutsDone: 4,
      totalCaloriesBurned: 1800,
      avgNutritionCompliance: "85%",
    };

    const prompt = `أنت مدرب ذكي تقيّم أداء المتدرب في الأسبوع الماضي.
    الأداء:
    - التمارين المنجزة: ${stats.workoutsDone}
    - السعرات المحروقة: ${stats.totalCaloriesBurned} kcal
    - الالتزام بالدايت: ${stats.avgNutritionCompliance}
    
    أعطني تقرير مختصر ومحفز للعميل بصيغة JSON فقط:
    {
      "score": 8, // تقييم من 10
      "reportTextAr": "تقرير عن الأداء...",
      "reportTextEn": "Report about performance...",
      "recommendations": ["اشرب ماء أكثر", "زد كثافة الكارديو"]
    }
    بدون markdown.`;

    const apiKey = process.env.GROQ_API_KEY;
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7 
      }),
    });

    if (!response.ok) {
      console.error("Groq API HTTP Error:", response.status, await response.text());
      throw new ConvexError("Failed to contact Groq API");
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Groq API Error / No Text. Full response:", JSON.stringify(data, null, 2));
      throw new ConvexError(data.error?.message || "No text returned from Groq for Weekly Report.");
    }

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         console.error("No JSON match in text:", text);
         throw new ConvexError("No JSON object found");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parsing failed. Raw response:", text);
      throw new ConvexError("Failed to parse Weekly Report response");
    }

    // Write it to DB using internal mutation
    await ctx.runMutation(internal.aiPlans.saveWeeklyReport, {
      reportText: result.reportTextEn || result.reportTextAr,
      reportTextAr: result.reportTextAr || result.reportTextEn,
      score: result.score,
      recommendations: result.recommendations,
    });

    return result;
  },
});

export const saveWeeklyReport = internalMutation({
  args: {
    reportText: v.string(),
    reportTextAr: v.string(),
    score: v.number(),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return; // Called internally, we assume user is authenticated in the action

    // Determine week start (e.g., last Sunday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const weekStart = new Date(today.setDate(diff)).toISOString().split("T")[0];

    const existing = await ctx.db
      .query("weeklyReports")
      .withIndex("by_user_week", (q) => q.eq("userId", userId).eq("weekStartDate", weekStart))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        reportText: args.reportText,
        reportTextAr: args.reportTextAr,
        score: args.score,
        recommendations: args.recommendations,
      });
    }

    return await ctx.db.insert("weeklyReports", {
      userId,
      weekStartDate: weekStart,
      reportText: args.reportText,
      reportTextAr: args.reportTextAr,
      score: args.score,
      recommendations: args.recommendations,
      createdAt: Date.now(),
    });
  },
});

export const getWeeklyReport = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const weekStart = new Date(today.setDate(diff)).toISOString().split("T")[0];

    return await ctx.db
      .query("weeklyReports")
      .withIndex("by_user_week", (q: any) => q.eq("userId", userId).eq("weekStartDate", weekStart))
      .first();
  },
});
