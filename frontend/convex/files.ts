// convex/files.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ✅ 1) Generate an upload URL (client will POST the file to it)
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ✅ 2) Get a public URL for a stored file
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return url; // may be null if file removed
  },
});

// ✅ 3) Delete a stored file (optional, useful when replacing images)
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
    return true;
  },
});
