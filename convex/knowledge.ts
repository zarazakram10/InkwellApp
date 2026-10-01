import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedDocument } from "./lib/auth";
import { knowledgeItemValidator } from "./lib/validators";

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  returns: v.array(knowledgeItemValidator),
  handler: async (ctx, args) => {
    await requireOwnedDocument(ctx, args.documentId);
    return await ctx.db
      .query("knowledgeItems")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const add = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    body: v.string(),
  },
  returns: v.id("knowledgeItems"),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId);
    const title = args.title.trim();
    const body = args.body.trim();
    if (title.length === 0 || body.length === 0) {
      throw new Error("Knowledge title and body are required");
    }
    return await ctx.db.insert("knowledgeItems", {
      documentId: document._id,
      userId: document.userId,
      title,
      body,
    });
  },
});

export const update = mutation({
  args: {
    knowledgeId: v.id("knowledgeItems"),
    title: v.string(),
    body: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.knowledgeId);
    if (item === null) {
      throw new Error("Knowledge not found");
    }
    await requireOwnedDocument(ctx, item.documentId);
    const title = args.title.trim();
    const body = args.body.trim();
    if (title.length === 0 || body.length === 0) {
      throw new Error("Knowledge title and body are required");
    }
    await ctx.db.patch(args.knowledgeId, { title, body });
    return null;
  },
});

export const remove = mutation({
  args: { knowledgeId: v.id("knowledgeItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.knowledgeId);
    if (item === null) {
      throw new Error("Knowledge not found");
    }
    await requireOwnedDocument(ctx, item.documentId);
    await ctx.db.delete(args.knowledgeId);
    return null;
  },
});
