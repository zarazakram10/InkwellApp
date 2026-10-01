import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireOwnedDocument, requireUserId } from "./lib/auth";
import {
  chatMessageValidator,
  documentValidator,
  knowledgeItemValidator,
} from "./lib/validators";

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  returns: v.array(chatMessageValidator),
  handler: async (ctx, args) => {
    await requireOwnedDocument(ctx, args.documentId);
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const startTurn = internalMutation({
  args: {
    documentId: v.id("documents"),
    message: v.string(),
  },
  returns: v.object({
    document: documentValidator,
    knowledge: v.array(knowledgeItemValidator),
    messages: v.array(chatMessageValidator),
  }),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId);
    const userId = await requireUserId(ctx);
    const message = args.message.trim();
    if (message.length === 0) {
      throw new Error("Message cannot be empty");
    }
    await ctx.db.insert("chatMessages", {
      documentId: document._id,
      userId,
      role: "user",
      content: message,
    });
    const knowledge = await ctx.db
      .query("knowledgeItems")
      .withIndex("by_documentId", (q) => q.eq("documentId", document._id))
      .collect();
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_documentId", (q) => q.eq("documentId", document._id))
      .collect();
    return { document, knowledge, messages };
  },
});

export const finishTurn = internalMutation({
  args: {
    documentId: v.id("documents"),
    reply: v.string(),
    content: v.optional(v.string()),
  },
  returns: v.object({
    content: v.string(),
  }),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId);
    const userId = await requireUserId(ctx);
    await ctx.db.insert("chatMessages", {
      documentId: document._id,
      userId,
      role: "assistant",
      content: args.reply,
    });
    if (args.content !== undefined) {
      await ctx.db.patch(document._id, {
        content: args.content,
        updatedAt: Date.now(),
      });
      return { content: args.content };
    }
    return { content: document.content };
  },
});
