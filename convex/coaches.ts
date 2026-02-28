// convex/coaches.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   Helpers
========================= */

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");

  const me = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  const isAdmin = me?.role === "admin" || me?.isAdmin === true;
  if (!isAdmin) throw new ConvexError("Forbidden");

  return { userId, me };
}

async function resolveCoachImage(ctx: any, coach: any) {
  let imageResolved: string | null = null;

  if (coach?.imageStorageId) {
    imageResolved = await ctx.storage.getUrl(coach.imageStorageId);
  } else if (coach?.imageUrl) {
    imageResolved = String(coach.imageUrl);
  }

  return { ...coach, imageResolved };
}

/* =========================
   PUBLIC
========================= */

export const listPublic = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const qtxt = (args.q || "").trim().toLowerCase();

    const rows = await ctx.db.query("coaches").collect();
    const visible = rows.filter((c: any) => c.isActive === true);

    const filtered = !qtxt
      ? visible
      : visible.filter((c: any) => {
          const hay = `${c.nameAr || ""} ${c.name || ""} ${c.specialtyAr || ""} ${c.specialty || ""}`.toLowerCase();
          return hay.includes(qtxt);
        });

    const out = await Promise.all(
      filtered
        .sort((a: any, b: any) => (b._creationTime || 0) - (a._creationTime || 0))
        .map((c: any) => resolveCoachImage(ctx, c))
    );

    return out.map((c: any) => ({
      _id: c._id,
      name: c.name,
      nameAr: c.nameAr,
      specialty: c.specialty,
      specialtyAr: c.specialtyAr,
      experience: c.experience,
      bio: c.bio,
      bioAr: c.bioAr,
      whatsapp: c.whatsapp,
      rating: c.rating,
      isActive: c.isActive,
      imageUrl: c.imageUrl,
      imageStorageId: c.imageStorageId,
      imageResolved: c.imageResolved,
    }));
  },
});

/* =========================
   ADMIN
========================= */

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("coaches").collect();
    const out = await Promise.all(rows.map((c: any) => resolveCoachImage(ctx, c)));

    return out
      .sort((a: any, b: any) => (b._creationTime || 0) - (a._creationTime || 0))
      .map((c: any) => ({
        _id: c._id,
        name: c.name,
        nameAr: c.nameAr,
        specialty: c.specialty,
        specialtyAr: c.specialtyAr,
        experience: c.experience,
        bio: c.bio,
        bioAr: c.bioAr,
        whatsapp: c.whatsapp,
        rating: c.rating,
        isActive: c.isActive,
        imageUrl: c.imageUrl,
        imageStorageId: c.imageStorageId,
        imageResolved: c.imageResolved,
      }));
  },
});

/* =========================
   CREATE
========================= */

export const create = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    specialty: v.string(),
    specialtyAr: v.string(),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    bioAr: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    rating: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const id = await ctx.db.insert("coaches", {
      name: args.name,
      nameAr: args.nameAr,
      specialty: args.specialty,
      specialtyAr: args.specialtyAr,
      experience: args.experience || "—",
      bio: args.bio || "",
      bioAr: args.bioAr || "",
      whatsapp: args.whatsapp,
      rating: args.rating ?? 5,
      isActive: args.isActive ?? true,

      // توافق مع أي schema قديم
      image: args.imageUrl,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,

      createdAt: Date.now(),
    });

    return id;
  },
});

/* =========================
   UPDATE
========================= */

export const update = mutation({
  args: {
    id: v.id("coaches"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    specialty: v.optional(v.string()),
    specialtyAr: v.optional(v.string()),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    bioAr: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    rating: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const patch: any = {};
    for (const key of Object.keys(args)) {
      if (key === "id") continue;
      const value = (args as any)[key];
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(args.id, patch);
    return true;
  },
});

/* =========================
   REMOVE
========================= */

export const remove = mutation({
  args: { id: v.id("coaches") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return true;
  },
});

/* =========================
   SEED SAMPLE COACHES
========================= */

export const seedSampleCoaches = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("coaches").collect();
    if (existing.length > 0) {
      return { ok: true, already: true, count: existing.length };
    }

    const samples = [
      {
        name: "Sarah",
        nameAr: "كابتن سارة",
        specialty: "Fat loss",
        specialtyAr: "خسارة دهون ولياقة",
        experience: "6 سنوات خبرة",
        bio: "",
        bioAr: "",
        rating: 5,
        isActive: true,
      },
      {
        name: "Ahmed",
        nameAr: "كابتن أحمد",
        specialty: "Muscle building",
        specialtyAr: "تضخيم وبناء عضلات",
        experience: "8 سنوات خبرة",
        bio: "",
        bioAr: "",
        rating: 5,
        isActive: true,
      },
      {
        name: "Yousef",
        nameAr: "كابتن يوسف",
        specialty: "Crossfit & Strength",
        specialtyAr: "قوة و CrossFit",
        experience: "7 سنوات خبرة",
        bio: "",
        bioAr: "",
        rating: 4,
        isActive: true,
      },
    ];

    for (const s of samples) {
      await ctx.db.insert("coaches", {
        ...s,
        whatsapp: undefined,
        image: undefined,
        imageUrl: undefined,
        imageStorageId: undefined,
        createdAt: Date.now(),
      });
    }

    return { ok: true, inserted: samples.length };
  },
});
