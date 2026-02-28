import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   فلترة الأسئلة الخطيرة
========================= */
function isDangerousQuestion(question: string): boolean {
  const dangerousKeywords = [
    // تشخيص
    'تشخيص', 'تشخص', 'diagnose', 'diagnosis',
    // أدوية
    'دواء', 'علاج', 'جرعة', 'medicine', 'drug', 'medication',
    // أعراض خطيرة
    'ألم شديد', 'نزيف', 'حمى عالية', 'دوخة شديدة', 'إغماء',
    'ضيق تنفس', 'صداع حاد', 'قيء', 'إسهال شديد',
    'كسر', 'جرح عميق', 'حرق', 'تسمم', 'حساسية شديدة',
    'ألم صدر', 'خفقان', 'تنميل', 'شلل',
    // Emergency
    'emergency', 'severe pain', 'bleeding', 'chest pain'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return dangerousKeywords.some(kw => lowerQuestion.includes(kw));
}

/* =========================
   System Prompt
========================= */
const SYSTEM_PROMPT = `
أنت "فِتْبوت" - مساعد اللياقة البدنية والتغذية الصحية الذكي.

🔴 قواعد صارمة (يجب الالتزام بها):
1. أنت مساعد تعليمي فقط، لست طبيباً
2. لا تقدم تشخيصات طبية أبداً
3. لا تصف أدوية أو جرعات
4. إذا سُئلت عن أعراض أو آلام، أجب فوراً: "⚠️ يجب استشارة طبيب مختص فوراً"
5. ابدأ كل إجابة بـ: "ℹ️ معلومة عامة:"
6. كن مختصراً (حد أقصى 150 كلمة)
7. استخدم Emojis لجعل الإجابة ودية
8. أجب بالعربية الفصحى البسيطة

✅ المواضيع المسموح بها:
- التمارين الرياضية (أنواعها، فوائدها، كيفية أدائها)
- التغذية الصحية العامة (الأطعمة، السعرات، البروتين)
- بناء العضلات والتضخيم
- خسارة الوزن بشكل آمن
- نصائح اللياقة للمبتدئين
- شرح مصطلحات رياضية
- جداول التمارين الأسبوعية
- أسلوب حياة صحي

❌ المواضيع الممنوعة:
- تشخيص الأمراض أو الإصابات
- وصف الأدوية أو المكملات الطبية
- علاج الآلام أو الأعراض
- تفسير التحاليل الطبية
- نصائح للحوامل أو الأطفال (أقل من 16 سنة)
- جراحات أو عمليات

🎯 أسلوبك:
- ودود ومشجع
- علمي لكن سهل الفهم
- اذكر مصادر عامة (مثل: "الدراسات تشير...")
- شجّع المستخدم على الاستمرار في رحلته الصحية
`;

/* =========================
   حساب عدد الأسئلة اليومية
========================= */
async function getDailyQuestionCount(ctx: any, userId: any): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const todayChats = await ctx.db
    .query("fitbotChats")
    .withIndex("by_user_timestamp", (q: any) => 
      q.eq("userId", userId).gte("timestamp", todayTimestamp)
    )
    .collect();

  return todayChats.length;
}

/* =========================
   إرسال رسالة
========================= */
export const sendMessage = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const message = args.message.trim();
    if (!message) throw new ConvexError("الرسالة فارغة");
    if (message.length > 500) throw new ConvexError("الرسالة طويلة جداً (حد أقصى 500 حرف)");

    // التحقق من الحد اليومي
    const dailyCount = await getDailyQuestionCount(ctx, userId);
    const DAILY_LIMIT = 5; // يمكن تغييره حسب الخطة
    
    if (dailyCount >= DAILY_LIMIT) {
      throw new ConvexError(
        `لقد وصلت للحد اليومي (${DAILY_LIMIT} أسئلة). جرّب غداً أو اشترك في الخطة المميزة! 💎`
      );
    }

    // فحص الأسئلة الخطيرة
    if (isDangerousQuestion(message)) {
      const blockedResponse = `
⚠️ **تنبيه مهم**

سؤالك يتعلق بحالة صحية تتطلب **استشارة طبيب مختص فوراً**.

📞 **في حالات الطوارئ:**
• قطر: 999 (الإسعاف)
• مستشفى حمد: 4439 4444
• اتصل بطبيبك الخاص

❌ لا يمكنني تقديم مشورة طبية أو تشخيص.

💡 يمكنني مساعدتك بأسئلة عن:
• التمارين الرياضية
• التغذية الصحية
• بناء العضلات
• خسارة الوزن
      `.trim();

      await ctx.db.insert("fitbotChats", {
        userId,
        message,
        response: blockedResponse,
        isBlocked: true,
        timestamp: Date.now(),
      });

      return { 
        response: blockedResponse, 
        isBlocked: true,
        remainingQuestions: DAILY_LIMIT - dailyCount - 1
      };
    }

    // جلب معلومات المستخدم للتخصيص
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    let userContext = "";
    if (profile) {
      userContext = `
معلومات المستخدم:
- المستوى: ${profile.fitnessLevel || 'مبتدئ'}
- الأهداف: ${profile.goals?.join('، ') || 'غير محدد'}
- العمر: ${profile.age || 'غير محدد'}
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
      `.trim();
    }

    // استدعاء Gemini API
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) throw new Error("Gemini API Key غير موجود");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${SYSTEM_PROMPT}\n\n${userContext ? userContext + '\n\n' : ''}السؤال: ${message}`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 400,
              temperature: 0.7,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "خطأ في الاتصال بالـ AI");
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("لم أتمكن من إنشاء إجابة. حاول إعادة صياغة السؤال.");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      // حفظ في قاعدة البيانات
      await ctx.db.insert("fitbotChats", {
        userId,
        message,
        response: aiResponse,
        isBlocked: false,
        timestamp: Date.now(),
      });

      return { 
        response: aiResponse, 
        isBlocked: false,
        remainingQuestions: DAILY_LIMIT - dailyCount - 1
      };
      
    } catch (error: any) {
      console.error("Fitbot Error:", error);
      throw new ConvexError(`خطأ: ${error.message || 'حدث خطأ غير متوقع'}`);
    }
  },
});

/* =========================
   جلب سجل المحادثات
========================= */
export const getChatHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 50;

    const messages = await ctx.db
      .query("fitbotChats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return messages.reverse();
  },
});

/* =========================
   عدد الأسئلة المتبقية اليوم
========================= */
export const getRemainingQuestions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { remaining: 0, total: 5 };

    const dailyCount = await getDailyQuestionCount(ctx, userId);
    const DAILY_LIMIT = 5;

    return {
      remaining: Math.max(0, DAILY_LIMIT - dailyCount),
      total: DAILY_LIMIT,
      used: dailyCount
    };
  },
});

/* =========================
   تقييم الإجابة
========================= */
export const rateAnswer = mutation({
  args: {
    chatId: v.id("fitbotChats"),
    rating: v.union(v.literal("good"), v.literal("bad")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new ConvexError("غير مصرح");
    }

    await ctx.db.patch(args.chatId, { rating: args.rating });
    return true;
  },
});

/* =========================
   مسح السجل
========================= */
export const clearChatHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    const messages = await ctx.db
      .query("fitbotChats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    return { deleted: messages.length };
  },
});
