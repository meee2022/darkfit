import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

const OWNER_EMAIL = "eng.mohamed87@live.com";

function normEmail(x: any) {
  return String(x || "").trim().toLowerCase();
}

/**
 * 👑 يضمن إن مالك التطبيق (Owner) دائمًا Admin
 */
async function ensureOwnerAdmin(ctx: any, userId: any) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normEmail((identity as any)?.email);

  if (email !== OWNER_EMAIL) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) return;

  const needsPatch =
    (profile as any).isAdmin !== true || (profile as any).role !== "admin";

  if (needsPatch) {
    await ctx.db.patch(profile._id, { isAdmin: true, role: "admin" });
  }
}

/* =========================
   PUBLIC: CURRENT PROFILE
========================= */

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/* =========================
   PUBLIC: GET USER TYPE
========================= */

export const getUserType = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const identity = await ctx.auth.getUserIdentity();
    const tokenId = (identity as any)?.tokenIdentifier ?? "";

    if (tokenId.startsWith("anonymous:")) {
      return "anonymous";
    }

    return "registered";
  },
});

/* =========================
   OPTIONAL: BOOTSTRAP OWNER
========================= */

export const bootstrapOwnerAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError("أنشئ Profile أولاً ثم أعد المحاولة");

    await ensureOwnerAdmin(ctx, userId);
    return true;
  },
});

/* =========================
   PUBLIC: CREATE/UPDATE PROFILE
========================= */

export const createOrUpdateProfile = mutation({
  args: {
    name: v.string(),
    age: v.optional(v.number()),
    gender: v.union(v.literal("male"), v.literal("female")),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    fitnessLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    goals: v.array(v.string()),
    medicalConditions: v.optional(v.array(v.string())),

    experienceWithWeights: v.optional(
      v.union(
        v.literal("none"),
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    trainingDaysPerWeek: v.optional(v.number()),
    trainingLocation: v.optional(
      v.union(v.literal("home"), v.literal("gym"), v.literal("both"))
    ),
    targetWeight: v.optional(v.number()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const identity = await ctx.auth.getUserIdentity();
    const tokenId = (identity as any)?.tokenIdentifier ?? "";

    if (tokenId.startsWith("anonymous:")) {
      throw new ConvexError(
        "الرجاء إنشاء حساب وتسجيل الدخول لحفظ ملفك الشخصي"
      );
    }

    const email = normEmail((identity as any)?.email);

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...args,
        email,
      });
      await ensureOwnerAdmin(ctx, userId);
      return existingProfile._id;
    }

    const id = await ctx.db.insert("profiles", {
      userId,
      ...args,
      email,
      isAdmin: false,
      role: "user",
    });

    await ensureOwnerAdmin(ctx, userId);
    return id;
  },
});

/* =========================
   PUBLIC: CHECK ADMIN
========================= */

export const checkAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    return !!(
      profile &&
      (((profile as any).isAdmin === true) || (profile as any).role === "admin")
    );
  },
});

/* =========================
   PUBLIC: CHECK COACH
========================= */

export const checkCoachStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    return !!(
      profile &&
      ((profile as any).role === "coach" ||
        (profile as any).role === "admin" ||
        (profile as any).isAdmin === true)
    );
  },
});

/* =========================
   COACH: GET MY CLIENTS
========================= */

export const getMyCoachClients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const me = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!me) return [];
    const isCoach =
      (me as any).role === "coach" ||
      (me as any).role === "admin" ||
      (me as any).isAdmin === true;
    if (!isCoach) return [];

    const links = await ctx.db
      .query("coachClients")
      .withIndex("by_coach", (q: any) => q.eq("coachProfileId", me._id))
      .collect();

    const clients = await Promise.all(
      links.map(async (link: any) => {
        const client = await ctx.db.get(link.clientProfileId);
        return client
          ? {
              _id: (client as any)._id,
              name: (client as any).name || "",
              email: (client as any).email || "",
              gender: (client as any).gender,
              age: (client as any).age,
              calories: (client as any).calories,
              protein: (client as any).protein,
              carbs: (client as any).carbs,
              fats: (client as any).fats,
            }
          : null;
      })
    );

    return clients.filter(Boolean);
  },
});

/* =========================
   PUBLIC: BMI
========================= */

export const calculateBMI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile?.weight || !profile?.height) return null;

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);

    let category = "";
    if (bmi < 18.5) category = "نقص في الوزن";
    else if (bmi < 25) category = "وزن طبيعي";
    else if (bmi < 30) category = "زيادة في الوزن";
    else category = "سمنة";

    return { bmi: Math.round(bmi * 10) / 10, category };
  },
});

/* =========================
   ADMIN HELPERS
========================= */

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");

  const me = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  const isAdmin = !!(
    me &&
    (((me as any).role === "admin") || (me as any).isAdmin === true)
  );
  if (!isAdmin) throw new ConvexError("Forbidden");

  await ensureOwnerAdmin(ctx, userId);

  return { userId, me };
}

/* =========================
   ADMIN: LIST PROFILES
========================= */

export const adminListProfiles = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profiles = await ctx.db.query("profiles").collect();
    const qtxt = (args.q || "").trim().toLowerCase();

    // جلب بيانات المستخدمين مع الإيميلات
    const enrichedProfiles = await Promise.all(
      profiles.map(async (p) => {
        // جلب user من جدول users للحصول على الإيميل
        const user = await ctx.db.get(p.userId);

        return {
          ...p,
          email: user?.email || (p as any).email || null,
        };
      })
    );

    let out = enrichedProfiles as any[];
    if (qtxt) {
      out = out.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const email = String(p.email || "").toLowerCase();
        return `${name} ${email}`.includes(qtxt);
      });
    }

    return out
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .map((p) => ({
        _id: p._id,
        userId: p.userId,
        name: p.name,
        role: p.role || (p.isAdmin ? "admin" : "user"),
        isAdmin: !!p.isAdmin,
        createdAt: p._creationTime,
        email: p.email,
        age: p.age,
        gender: p.gender,
        fitnessLevel: p.fitnessLevel,
      }));
  },
});

/* =========================
   ADMIN: SET USER ROLE
========================= */

export const adminSetUserRole = mutation({
  args: {
    profileId: v.id("profiles"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const { me } = await requireAdmin(ctx);

    if (me?._id === args.profileId && args.role !== "admin") {
      throw new ConvexError("لا يمكن إزالة صلاحية الأدمن عن نفسك");
    }

    await ctx.db.patch(args.profileId, {
      role: args.role,
      isAdmin: args.role === "admin",
    });

    return true;
  },
});

/* =========================
   COACH / CLIENT FEATURES
========================= */

export const coachAddClient = mutation({
  args: {
    clientProfileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const { me } = await requireAdmin(ctx);

    await ctx.db.insert("coachClients", {
      coachProfileId: me._id,
      clientProfileId: args.clientProfileId,
      createdAt: Date.now(),
    });

    return true;
  },
});
/* =========================
   UPDATE PROFILE
========================= */

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    fitnessLevel: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
    goal: v.optional(v.string()),
    currentWeight: v.optional(v.number()),
    targetWeight: v.optional(v.number()),
    membershipType: v.optional(v.string()),
    memberSince: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    energy: v.optional(v.number()),
    calories: v.optional(v.number()),
    heartRate: v.optional(v.number()),
    connectedDevices: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.age !== undefined) updateData.age = args.age;
    if (args.weight !== undefined) updateData.weight = args.weight;
    if (args.height !== undefined) updateData.height = args.height;
    if (args.gender !== undefined) updateData.gender = args.gender;
    if (args.fitnessLevel !== undefined) updateData.fitnessLevel = args.fitnessLevel;
    if (args.goal !== undefined) updateData.goal = args.goal;
    if (args.currentWeight !== undefined) updateData.currentWeight = args.currentWeight;
    if (args.targetWeight !== undefined) updateData.targetWeight = args.targetWeight;
    if (args.membershipType !== undefined) updateData.membershipType = args.membershipType;
    if (args.memberSince !== undefined) updateData.memberSince = args.memberSince;
    if (args.profileImage !== undefined) updateData.profileImage = args.profileImage;
    if (args.energy !== undefined) updateData.energy = args.energy;
    if (args.calories !== undefined) updateData.calories = args.calories;
    if (args.heartRate !== undefined) updateData.heartRate = args.heartRate;
    if (args.connectedDevices !== undefined) updateData.connectedDevices = args.connectedDevices;

    await ctx.db.patch(profile._id, updateData);

    return true;
  },
});

/* =========================
   ADMIN: DELETE USER
========================= */

export const adminDeleteUser = mutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    // 👑 تأكد من أن Owner هو Admin
    await ensureOwnerAdmin(ctx, userId);

    // تحقق من صلاحيات الأدمن
    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!adminProfile || (adminProfile as any).role !== "admin") {
      throw new ConvexError("صلاحيات غير كافية - يجب أن تكون Admin");
    }

    // تحقق من أن المستخدم المراد حذفه موجود
    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) throw new ConvexError("المستخدم غير موجود");

    // حذف الملف الشخصي فقط (تبسيط مؤقت)
    await ctx.db.delete(args.profileId);

    console.log("✅ تم حذف الملف الشخصي");

    return {
      success: true,
      message: "تم حذف المستخدم بنجاح"
    };
  },
});

/* =========================
   DEV ONLY: MAKE ME ADMIN (للتطوير فقط)
========================= */

export const devMakeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError("الملف الشخصي غير موجود");

    await ctx.db.patch(profile._id, {
      isAdmin: true,
      role: "admin"
    });

    return {
      success: true,
      message: "أصبحت Admin الآن! 🎉"
    };
  },
});

/* =========================
   UTILITY: FORCE OWNER ADMIN (للاستخدام في حالات الطوارئ)
========================= */

export const forceOwnerAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    const identity = await ctx.auth.getUserIdentity();
    const email = normEmail((identity as any)?.email);

    if (email !== OWNER_EMAIL) {
      throw new ConvexError("هذه الدالة متاحة فقط للمالك");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError("الملف الشخصي غير موجود");

    await ctx.db.patch(profile._id, {
      isAdmin: true,
      role: "admin"
    });

    return {
      success: true,
      message: "تم ترقيتك إلى Admin بنجاح"
    };
  },
});

/* =========================
   ADMIN: LIST ALL PROFILES
========================= */

export const listAllProfiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile?.isAdmin) {
      throw new ConvexError("يجب أن تكون Admin للوصول لهذه البيانات");
    }

    const allProfiles = await ctx.db.query("profiles").collect();

    return allProfiles.map((p) => ({
      _id: p._id,
      name: p.name || "",
      email: (p as any).email || "لا يوجد إيميل",
      age: p.age,
      gender: p.gender,
      weight: p.weight,
      height: p.height,
      goal: p.goal,
      calories: p.calories,
      protein: p.protein,
      carbs: p.carbs,
      fats: p.fats,
      isAdmin: p.isAdmin || false,
      role: p.role || "user",
    }));
  },
});

export const setOnboardingCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { onboardingCompleted: true });
    return true;
  },
});
