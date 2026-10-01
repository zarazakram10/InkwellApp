import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedDocument, requireUserId } from "./lib/auth";
import { documentValidator } from "./lib/validators";

export const list = query({
  args: {},
  returns: v.array(documentValidator),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return documents;
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  returns: v.union(documentValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const document = await ctx.db.get(args.documentId);
    if (document === null || document.userId !== userId) {
      return null;
    }
    return document;
  },
});

export const create = mutation({
  args: {},
  returns: v.id("documents"),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db.insert("documents", {
      userId,
      title: "Untitled",
      content: "",
      updatedAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedDocument(ctx, args.documentId);
    const title = args.title.trim() || "Untitled";
    await ctx.db.patch(args.documentId, {
      title,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const saveContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedDocument(ctx, args.documentId);
    await ctx.db.patch(args.documentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId);
    const knowledgeItems = await ctx.db
      .query("knowledgeItems")
      .withIndex("by_documentId", (q) => q.eq("documentId", document._id))
      .collect();
    for (const item of knowledgeItems) {
      await ctx.db.delete(item._id);
    }
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_documentId", (q) => q.eq("documentId", document._id))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    await ctx.db.delete(document._id);
    return null;
  },
});
