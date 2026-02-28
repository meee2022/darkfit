// convex/supplements.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helpers
 */
function uniqStrings(xs: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of xs) {
    const s = String(x || "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function normalizeRefs(refs: Array<{ title: string; url: string; source?: string }>) {
  return (refs || [])
    .map((r) => ({
      title: String(r.title || "").trim(),
      url: String(r.url || "").trim(),
      source: r.source ? String(r.source).trim() : undefined,
    }))
    .filter((r) => r.title && r.url);
}

async function resolveImage(ctx: any, r: any) {
  const storageUrl = r.imageStorageId ? await ctx.storage.getUrl(r.imageStorageId) : undefined;
  return storageUrl || r.imageUrl || undefined;
}

/** ✅ list للواجهة (يعرض المفعّل فقط) */
export const listPublic = query({
  args: {
    q: v.optional(v.string()),
    category: v.optional(v.union(v.literal("performance"), v.literal("health"), v.literal("recovery"))),
    evidence: v.optional(v.union(v.literal("strong"), v.literal("moderate"), v.literal("limited"))),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("supplements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    rows.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

    const s = (args.q || "").trim().toLowerCase();

    const filtered = rows.filter((r: any) => {
      if (args.category && r.category !== args.category) return false;
      if (args.evidence && r.evidence !== args.evidence) return false;
      if (!s) return true;

      const hay = [
        r.name?.ar, r.name?.en,
        r.brief?.ar, r.brief?.en,
        r.function?.ar, r.function?.en,
        ...(r.tags || []),
      ].join(" ").toLowerCase();

      return hay.includes(s);
    });

    return Promise.all(
      filtered.map(async (r: any) => ({
        ...r,
        imageResolved: await resolveImage(ctx, r),
      }))
    );
  },
});

/** ✅ list للأدمن */
export const adminList = query({
  args: {
    q: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("supplements").collect();
    rows.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

    const includeInactive = !!args.includeInactive;
    const s = (args.q || "").trim().toLowerCase();

    const filtered = rows.filter((r: any) => {
      if (!includeInactive && !r.isActive) return false;
      if (!s) return true;

      const hay = [
        r.name?.ar, r.name?.en,
        r.brief?.ar, r.brief?.en,
        r.category, r.evidence,
        ...(r.tags || []),
      ].join(" ").toLowerCase();

      return hay.includes(s);
    });

    return Promise.all(
      filtered.map(async (r: any) => ({
        ...r,
        imageResolved: await resolveImage(ctx, r),
      }))
    );
  },
});

export const create = mutation({
  args: {
    category: v.union(v.literal("performance"), v.literal("health"), v.literal("recovery")),
    evidence: v.union(v.literal("strong"), v.literal("moderate"), v.literal("limited")),
    tags: v.array(v.string()),

    name: v.object({ ar: v.string(), en: v.string() }),
    brief: v.object({ ar: v.string(), en: v.string() }),
    function: v.object({ ar: v.string(), en: v.string() }),
    benefits: v.object({ ar: v.array(v.string()), en: v.array(v.string()) }),
    typicalUse: v.object({ ar: v.string(), en: v.string() }),
    cautions: v.object({ ar: v.array(v.string()), en: v.array(v.string()) }),

    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),

    refs: v.array(v.object({ title: v.string(), url: v.string(), source: v.optional(v.string()) })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("supplements", {
      ...args,
      tags: uniqStrings(args.tags || []),
      refs: normalizeRefs(args.refs as any),
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("supplements"),
    patch: v.object({
      category: v.optional(v.union(v.literal("performance"), v.literal("health"), v.literal("recovery"))),
      evidence: v.optional(v.union(v.literal("strong"), v.literal("moderate"), v.literal("limited"))),
      tags: v.optional(v.array(v.string())),

      name: v.optional(v.object({ ar: v.string(), en: v.string() })),
      brief: v.optional(v.object({ ar: v.string(), en: v.string() })),
      function: v.optional(v.object({ ar: v.string(), en: v.string() })),
      benefits: v.optional(v.object({ ar: v.array(v.string()), en: v.array(v.string()) })),
      typicalUse: v.optional(v.object({ ar: v.string(), en: v.string() })),
      cautions: v.optional(v.object({ ar: v.array(v.string()), en: v.array(v.string()) })),

      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id("_storage")),

      refs: v.optional(v.array(v.object({ title: v.string(), url: v.string(), source: v.optional(v.string()) }))),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const cleanPatch: any = { ...patch };
    if (cleanPatch.tags) cleanPatch.tags = uniqStrings(cleanPatch.tags);
    if (cleanPatch.refs) cleanPatch.refs = normalizeRefs(cleanPatch.refs);
    await ctx.db.patch(id, { ...cleanPatch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("supplements") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/* =========================
   ✅ Seed: بيانات كثيرة + صور + يكمل حتى لو فيه بيانات
   ضع صورك داخل: client/public/supplements/*.jpg
========================= */
export const seedSampleSupplements = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ✅ نجيب الموجود (لو اتزرع قبل كده) ونمنع التكرار بالـ name.en
    const existing = await ctx.db.query("supplements").collect();
    const existingByEn = new Set<string>(
      existing.map((r: any) => String(r?.name?.en || "").trim().toLowerCase()).filter(Boolean)
    );

    const samples = [
      // Performance
      {
        category: "performance",
        evidence: "strong",
        tags: ["strength", "power", "gym", "muscle"],
        name: { ar: "كرياتين مونوهيدرات", en: "Creatine Monohydrate" },
        brief: {
          ar: "أقوى مكمل مدروس لزيادة القوة والأداء في التمارين عالية الشدة.",
          en: "One of the most studied supplements for strength and high-intensity performance.",
        },
        function: { ar: "يرفع مخزون الفوسفو-كرياتين → دعم طاقة ATP.", en: "Increases phosphocreatine to support rapid ATP regeneration." },
        benefits: { ar: ["قوة أعلى", "أداء أفضل في الجهد العالي", "دعم الكتلة العضلية مع التدريب"], en: ["More strength", "Better high-intensity output", "Supports lean mass with training"] },
        typicalUse: { ar: "3–5 جم يوميًا. (تحميل اختياري).", en: "3–5 g/day (optional loading)." },
        cautions: { ar: ["اشرب ماء كفاية.", "مرضى الكلى: استشر طبيب."], en: ["Stay hydrated.", "Kidney disease: consult a clinician."] },
        imageUrl: "/supplements/creatine.jpg",
        imageStorageId: undefined,
        refs: [
          { title: "ISSN: Creatine position stand", url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z", source: "JISSN" },
        ],
        isActive: true,
      },
      {
        category: "performance",
        evidence: "strong",
        tags: ["muscle", "recovery", "diet"],
        name: { ar: "بروتين واي", en: "Whey Protein" },
        brief: { ar: "يساعدك توصل لهدف البروتين اليومي ويدعم التعافي.", en: "Helps hit daily protein targets and supports recovery." },
        function: { ar: "أحماض أمينية أساسية خصوصًا ليوسين لدعم البناء العضلي.", en: "Provides essential amino acids (leucine) to support muscle protein synthesis." },
        benefits: { ar: ["دعم بناء العضلات", "شبع وإدارة وزن", "حل عملي"], en: ["Supports hypertrophy", "Improves satiety", "Convenient option"] },
        typicalUse: { ar: "20–40 جم حسب احتياجك.", en: "20–40 g per serving depending on needs." },
        cautions: { ar: ["حساسية لاكتوز: اختار isolate.", "انتبه للسعرات."], en: ["Lactose sensitivity: consider isolate.", "Watch total calories."] },
        imageUrl: "/supplements/whey.jpg",
        imageStorageId: undefined,
        refs: [{ title: "ISSN: Protein & exercise", url: "https://link.springer.com/article/10.1186/s12970-017-0177-8", source: "ISSN" }],
        isActive: true,
      },
      {
        category: "performance",
        evidence: "moderate",
        tags: ["focus", "energy", "endurance"],
        name: { ar: "كافيين", en: "Caffeine" },
        brief: { ar: "يرفع التركيز ويقلل الإحساس بالإرهاق عند بعض الناس.", en: "Improves alertness and may reduce perceived fatigue." },
        function: { ar: "مضاد لمستقبلات الأدينوسين → يقظة.", en: "Adenosine antagonism → increased alertness." },
        benefits: { ar: ["تركيز أعلى", "تحمل أفضل للبعض"], en: ["More alertness", "May boost endurance"] },
        typicalUse: { ar: "حسب التحمل الشخصي وتجنب قرب النوم.", en: "Depends on tolerance; avoid near bedtime." },
        cautions: { ar: ["أرق/خفقان للبعض.", "ضغط/قلب: استشارة."], en: ["Insomnia/palpitations in sensitive users.", "BP/heart issues: consider advice."] },
        imageUrl: "/supplements/caffeine.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Exercise & performance supplements", url: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "performance",
        evidence: "moderate",
        tags: ["hiit", "lactate", "endurance"],
        name: { ar: "بيتا-ألانين", en: "Beta-Alanine" },
        brief: { ar: "قد يساعد في جهود 1–4 دقائق (تحمل عالي).", en: "May help ~1–4 min high-intensity efforts." },
        function: { ar: "يرفع الكارنوزين → مقاومة الحموضة.", en: "Increases muscle carnosine → buffers acidity." },
        benefits: { ar: ["أداء أفضل في HIIT للبعض"], en: ["May improve HIIT performance in some"] },
        typicalUse: { ar: "يؤخذ يوميًا لفترة؛ قد يسبب تنميل مؤقت.", en: "Taken daily over time; may cause harmless tingling." },
        cautions: { ar: ["قسّم الجرعة لتقليل التنميل."], en: ["Split doses to reduce tingling."] },
        imageUrl: "/supplements/beta-alanine.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Exercise & performance supplements", url: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },

      // Health
      {
        category: "health",
        evidence: "strong",
        tags: ["bone", "immune", "deficiency"],
        name: { ar: "فيتامين د", en: "Vitamin D" },
        brief: { ar: "مهم للعظام والعضلات—الأفضل يتحدد بتحليل.", en: "Key for bone and muscle health; ideally guided by labs." },
        function: { ar: "يدعم امتصاص الكالسيوم ووظائف عضلية ومناعية.", en: "Supports calcium absorption and immune/neuromuscular function." },
        benefits: { ar: ["مفيد عند وجود نقص"], en: ["Useful when deficient"] },
        typicalUse: { ar: "حسب التحليل—تجنب الإفراط.", en: "Dose depends on labs—avoid excess." },
        cautions: { ar: ["جرعات عالية فترة طويلة قد ترفع الكالسيوم."], en: ["Long-term high doses can cause hypercalcemia."] },
        imageUrl: "/supplements/vitamin-d.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Vitamin D", url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "health",
        evidence: "moderate",
        tags: ["muscle", "sleep", "cramps"],
        name: { ar: "مغنيسيوم", en: "Magnesium" },
        brief: { ar: "معدن أساسي للعضلات والأعصاب—مفيد لو في نقص.", en: "Essential mineral for muscle/nerve function—helpful if intake is low." },
        function: { ar: "يدخل في مئات التفاعلات الحيوية.", en: "Cofactor in many biochemical reactions." },
        benefits: { ar: ["دعم العضلات", "قد يساعد النوم للبعض"], en: ["Supports muscle function", "May help sleep for some"] },
        typicalUse: { ar: "اختيار النوع مهم (glycinate أفضل للبعض).", en: "Form matters (glycinate often easier)."} ,
        cautions: { ar: ["جرعات كبيرة قد تسبب إسهال."], en: ["High doses may cause diarrhea."] },
        imageUrl: "/supplements/magnesium.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Magnesium", url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "health",
        evidence: "moderate",
        tags: ["heart", "triglycerides", "inflammation"],
        name: { ar: "أوميجا-3 (EPA/DHA)", en: "Omega-3 (EPA/DHA)" },
        brief: { ar: "قد يفيد لبعض الأهداف—الأدلة تختلف حسب الهدف.", en: "May help certain outcomes; evidence varies by goal." },
        function: { ar: "دهون أساسية تدخل في أغشية الخلايا ومسارات الالتهاب.", en: "Essential fats involved in membranes and inflammation pathways." },
        benefits: { ar: ["قد يخفض الدهون الثلاثية بجرعات أعلى تحت إشراف"], en: ["Can reduce triglycerides at higher doses under supervision"] },
        typicalUse: { ar: "يفضل مع الأكل.", en: "Prefer with meals." },
        cautions: { ar: ["مميعات دم/عمليات: استشر طبيب."], en: ["Blood thinners/surgery: consult clinician."] },
        imageUrl: "/supplements/omega3.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Omega-3", url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "health",
        evidence: "strong",
        tags: ["energy", "vegan", "nerve"],
        name: { ar: "فيتامين B12", en: "Vitamin B12" },
        brief: { ar: "مهم للأعصاب والدم—مهم للنباتيين وكبار السن.", en: "Essential for nerve and blood health—important for vegans/older adults." },
        function: { ar: "يدعم تكوين خلايا الدم ووظائف الأعصاب.", en: "Supports red blood cell formation and neurologic function." },
        benefits: { ar: ["مهم عند نقص/خطر نقص"], en: ["Useful when deficiency risk exists"] },
        typicalUse: { ar: "يفضل بناءً على تحليل.", en: "Ideally guided by labs." },
        cautions: { ar: ["لو عندك أعراض نقص: اعمل تقييم طبي."], en: ["If symptoms suggest deficiency, get clinical evaluation."] },
        imageUrl: "/supplements/b12.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Vitamin B12", url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "health",
        evidence: "moderate",
        tags: ["immune", "skin", "hormones"],
        name: { ar: "زنك", en: "Zinc" },
        brief: { ar: "مهم للمناعة والجلد—الإفراط ممكن يسبب مشاكل.", en: "Important for immunity/skin; excess can cause issues." },
        function: { ar: "يدخل في الإنزيمات والمناعة.", en: "Involved in enzymes and immune function." },
        benefits: { ar: ["مفيد عند نقص"], en: ["Helpful when intake is low"] },
        typicalUse: { ar: "تجنب الجرعات العالية لفترات طويلة.", en: "Avoid high chronic intakes." },
        cautions: { ar: ["قد يقلل النحاس مع الاستخدام الطويل."], en: ["Can reduce copper absorption long-term."] },
        imageUrl: "/supplements/zinc.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Zinc", url: "https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },

      // Recovery
      {
        category: "recovery",
        evidence: "strong",
        tags: ["sleep", "recovery", "basics"],
        name: { ar: "أولوية التعافي (ملاحظة)", en: "Recovery Priority (Note)" },
        brief: { ar: "أقوى “مكمل” هو النوم + التغذية + خطة تدريب.", en: "The best “supplement” is sleep + nutrition + smart training." },
        function: { ar: "ظبط النوم والبروتين والسعرات أولًا.", en: "Optimize sleep, protein, and calories first." },
        benefits: { ar: ["نتائج أسرع", "أمان أعلى"], en: ["Better results", "Higher safety"] },
        typicalUse: { ar: "7–9 ساعات نوم + ماء + بروتين كفاية.", en: "7–9h sleep + hydration + adequate protein." },
        cautions: { ar: ["أرق مزمن/انقطاع نفس: استشارة مختص."], en: ["Chronic insomnia/sleep apnea: seek help."] },
        imageUrl: "/supplements/recovery.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH ODS: Exercise & performance supplements", url: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/", source: "NIH ODS" }],
        isActive: true,
      },
      {
        category: "recovery",
        evidence: "limited",
        tags: ["joints", "skin", "tendon"],
        name: { ar: "كولاجين", en: "Collagen" },
        brief: { ar: "قد يفيد المفاصل/الأوتار لبعض الناس — النتائج تختلف.", en: "May help joints/tendons for some—results vary." },
        function: { ar: "يدعم مكونات النسيج الضام مع فيتامين C.", en: "Supports connective tissue components (often paired with vitamin C)." },
        benefits: { ar: ["تحسن بسيط لبعض الحالات"], en: ["Small improvements for some outcomes"] },
        typicalUse: { ar: "عادةً يؤخذ يوميًا لفترة.", en: "Typically taken daily over time." },
        cautions: { ar: ["اختار مصدر موثوق."], en: ["Choose reputable products."] },
        imageUrl: "/supplements/collagen.jpg",
        imageStorageId: undefined,
        refs: [{ title: "NIH/PMC collagen review", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8521576/", source: "NIH/PMC" }],
        isActive: true,
      },
    ] as const;

    let inserted = 0;
    let skipped = 0;

    for (const s of samples) {
      const key = String(s.name.en).trim().toLowerCase();
      if (existingByEn.has(key)) {
        skipped++;
        continue;
      }
      await ctx.db.insert("supplements", {
        ...s,
        tags: uniqStrings([...s.tags]),
        refs: normalizeRefs(s.refs as any),
        createdAt: now,
        updatedAt: now,
      } as any);
      inserted++;
      existingByEn.add(key);
    }

    return { inserted, skipped, totalNow: existing.length + inserted };
  },
});
