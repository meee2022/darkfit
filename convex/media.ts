// convex/media.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    // يرجّع رابط صالح للعرض في <img />
    return await ctx.storage.getUrl(args.storageId);
  },
});
