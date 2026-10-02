import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    updatedAt: v.number(),
    trashedAt: v.optional(v.number()),
  })
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"])
    .index("by_trashedAt", ["trashedAt"]),
  knowledgeItems: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  }).index("by_documentId", ["documentId"]),
  chatMessages: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_documentId", ["documentId"]),
});
