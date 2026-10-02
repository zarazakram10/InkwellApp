import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { requireOwnedDocument, requireUserId } from "./lib/auth";
import { TRASH_RETENTION_MS } from "./lib/trash";
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
    return documents.filter((document) => document.trashedAt === undefined);
  },
});

export const listTrashed = query({
  args: {},
  returns: v.array(documentValidator),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", userId))
      .collect();
    return documents
      .filter((document) => document.trashedAt !== undefined)
      .sort((a, b) => (b.trashedAt ?? 0) - (a.trashedAt ?? 0));
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  returns: v.union(documentValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const document = await ctx.db.get(args.documentId);
    if (
      document === null ||
      document.userId !== userId ||
      document.trashedAt !== undefined
    ) {
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

export const trash = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId);
    await ctx.db.patch(document._id, { trashedAt: Date.now() });
    return null;
  },
});

export const restore = mutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await requireOwnedDocument(ctx, args.documentId, {
      allowTrashed: true,
    });
    if (document.trashedAt === undefined) {
      return null;
    }
    await ctx.db.patch(document._id, { trashedAt: undefined });
    return null;
  },
});

async function permanentlyDeleteDocument(
  ctx: MutationCtx,
  documentId: Id<"documents">,
) {
  const knowledgeItems = await ctx.db
    .query("knowledgeItems")
    .withIndex("by_documentId", (q) => q.eq("documentId", documentId))
    .collect();
  for (const item of knowledgeItems) {
    await ctx.db.delete(item._id);
  }
  const messages = await ctx.db
    .query("chatMessages")
    .withIndex("by_documentId", (q) => q.eq("documentId", documentId))
    .collect();
  for (const message of messages) {
    await ctx.db.delete(message._id);
  }
  await ctx.db.delete(documentId);
}

export const purgeExpiredTrash = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cutoff = Date.now() - TRASH_RETENTION_MS;
    const expired = await ctx.db
      .query("documents")
      .withIndex("by_trashedAt", (q) =>
        q.gt("trashedAt", 0).lt("trashedAt", cutoff),
      )
      .take(25);
    for (const document of expired) {
      await permanentlyDeleteDocument(ctx, document._id);
    }
    return null;
  },
});
