import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Get or Create Conversation
export const getOrCreateConversation = mutation({
  args: { partnerUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // We need to know who is the coach and who is the client
    // For simplicity, we assume the one calling with a partner is initiating
    // But better: check roles.
    
    // Check if exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_coach_client", (q) => 
        q.eq("coachId", userId).eq("clientId", args.partnerUserId)
      )
      .first() || await ctx.db
      .query("conversations")
      .withIndex("by_coach_client", (q) => 
        q.eq("coachId", args.partnerUserId).eq("clientId", userId)
      )
      .first();

    if (existing) return existing._id;

    // Create new
    // We assume the partner is the coach if the current user isn't? 
    // Let's just use role-based logic or simple order.
    return await ctx.db.insert("conversations", {
      coachId: args.partnerUserId, // Placeholder logic
      clientId: userId,
      lastMessageTime: Date.now(),
      unreadCountClient: 0,
      unreadCountCoach: 0,
    });
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("workout"), v.literal("nutrition"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new ConvexError("Conversation not found");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      text: args.text,
      type: args.type || "text",
      createdAt: Date.now(),
    });

    // Update conversation
    const isCoach = conv.coachId === userId;
    await ctx.db.patch(args.conversationId, {
      lastMessageText: args.text,
      lastMessageTime: Date.now(),
      unreadCountClient: isCoach ? conv.unreadCountClient + 1 : conv.unreadCountClient,
      unreadCountCoach: !isCoach ? conv.unreadCountCoach + 1 : conv.unreadCountCoach,
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const asCoach = await ctx.db
      .query("conversations")
      .withIndex("by_coach", (q) => q.eq("coachId", userId))
      .collect();

    const asClient = await ctx.db
      .query("conversations")
      .withIndex("by_client", (q) => q.eq("clientId", userId))
      .collect();

    const all = [...asCoach, ...asClient].sort((a,b) => b.lastMessageTime - a.lastMessageTime);

    return await Promise.all(all.map(async (c) => {
      const partnerId = c.coachId === userId ? c.clientId : c.coachId;
      const partnerProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", partnerId))
        .first();
      
      return {
        ...c,
        partnerId,
        partnerName: partnerProfile?.name || "User",
        partnerImage: partnerProfile?.profileImage,
      };
    }));
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;

    if (conv.coachId === userId) {
      await ctx.db.patch(args.conversationId, { unreadCountCoach: 0 });
    } else {
      await ctx.db.patch(args.conversationId, { unreadCountClient: 0 });
    }
  },
});
