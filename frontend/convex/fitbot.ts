import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   🛡️ Input Sanitization
========================= */
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

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
/* =========================
   تجهيز الشات (تفحص الحظر وتجلب البيانات)
========================= */
export const prepChat = internalMutation({
  args: { message: v.string() },
  handler: async (ctx, args): Promise<{
    status: "blocked" | "ok";
    response?: string;
    isBlocked?: boolean;
    remainingQuestions: number;
    userId?: string;
    userContext?: string;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    // 🛡️ Sanitize and validate input
    const message = sanitizeInput(args.message);
    if (!message) throw new ConvexError("الرسالة فارغة");
    if (message.length > 500) throw new ConvexError("الرسالة طويلة جداً (حد أقصى 500 حرف)");
    if (message.length < 2) throw new ConvexError("الرسالة قصيرة جداً");

    // التحقق من الحد اليومي
    const dailyCount = await getDailyQuestionCount(ctx, userId);
    const DAILY_LIMIT = 5; 
    
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
        status: "blocked",
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

    // جلب أحدث الفحوصات اليومية
    const recentCheckins = await ctx.db
      .query("dailyCheckins")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(1);

    // جلب النصائح الذكية النشطة
    const activeInsights = await ctx.db
      .query("aiInsights")
      .withIndex("by_user_read", (q: any) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    let userContext = "";
    if (profile) {
      userContext = `
[معلومات المستخدم الحيوية]
- المستوى: ${profile.fitnessLevel || 'مبتدئ'}
- الهدف الرئيسي: ${profile.goal || profile.goals?.join('، ') || 'غير محدد'}
- العمر: ${profile.age || 'غير محدد'}
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- الوزن الحالي: ${profile.currentWeight ? profile.currentWeight + ' كجم' : 'غير محدد'}
- الوزن المستهدف: ${profile.targetWeight ? profile.targetWeight + ' كجم' : 'غير محدد'}
      `.trim();

      if (recentCheckins.length > 0) {
        const c = recentCheckins[0];
        userContext += `\n[بيانات الفحص اليومي الأخير للمستخدم]
- ساعات النوم: ${c.sleepHours} ساعة
- جودة النوم: ${c.sleepQuality}
- مستوى الإرهاق (من 10): ${c.fatigueScore}
- مستوى ألم العضلات (من 10): ${c.sorenessLevel}`;
      }

      if (activeInsights.length > 0) {
        userContext += `\n[تنبيهات المدرب الذكي الحالية للمستخدم]\n` + activeInsights.map((i: any) => `- ${i.titleAr}: ${i.messageAr}`).join('\n');
      }

      userContext += "\n\n⚠️ تعليمات هامة للذكاء الاصطناعي: استخدم هذه المعلومات لتقديم إجابات مخصصة جداً ودقيقة لحالة المستخدم الحالية. إذا سألك عن سبب تعبه، راجع مستوى الفحص اليومي المذكور أعلاه وأعطه نصيحة مبنية عليه. تصرف وكأنك المدرب الشخصي الذي يراقب هذه الأرقام عن كثب.";
    }

    return {
      status: "ok",
      userId,
      userContext,
      remainingQuestions: DAILY_LIMIT - dailyCount - 1
    };
  }
});

/* =========================
   حفظ رد الذكاء الاصطناعي
========================= */
export const saveAIResponse = internalMutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fitbotChats", {
      userId: args.userId,
      message: args.message,
      response: args.response,
      isBlocked: false,
      timestamp: Date.now(),
    });
  }
});

/* =========================
   إرسال رسالة (Action)
========================= */
export const sendMessage = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    isBlocked: boolean;
    remainingQuestions: number;
  }> => {
    // 1. Prepare chat via mutation
    const prepResult = await ctx.runMutation(internal.fitbot.prepChat, {
      message: args.message
    });

    if (prepResult.status === "blocked") {
      return {
        response: prepResult.response ?? "",
        isBlocked: prepResult.isBlocked ?? true,
        remainingQuestions: prepResult.remainingQuestions
      };
    }

    // 2. call Groq API via fetch
    try {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) throw new Error("Groq API Key غير موجود");

      const response = await fetch(
        `https://api.groq.com/openai/v1/chat/completions`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: `${SYSTEM_PROMPT}\n\n${prepResult.userContext ? prepResult.userContext : ''}`
              },
              {
                role: "user",
                content: args.message
              }
            ],
            max_tokens: 400,
            temperature: 0.7,
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "خطأ في الاتصال بالـ AI");
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("لم أتمكن من إنشاء إجابة. حاول إعادة صياغة السؤال.");
      }

      const aiResponse = data.choices[0].message.content;

      // 3. Save to DB
      if (prepResult.userId) {
        await ctx.runMutation(internal.fitbot.saveAIResponse, {
          userId: prepResult.userId as any,
          message: args.message,
          response: aiResponse,
        });
      }

      return { 
        response: aiResponse, 
        isBlocked: false,
        remainingQuestions: prepResult.remainingQuestions
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
