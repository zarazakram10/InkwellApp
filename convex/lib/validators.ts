import { v } from "convex/values";

export const documentValidator = v.object({
  _id: v.id("documents"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  content: v.string(),
  updatedAt: v.number(),
});

export const knowledgeItemValidator = v.object({
  _id: v.id("knowledgeItems"),
  _creationTime: v.number(),
  documentId: v.id("documents"),
  userId: v.id("users"),
  title: v.string(),
  body: v.string(),
});

export const chatMessageValidator = v.object({
  _id: v.id("chatMessages"),
  _creationTime: v.number(),
  documentId: v.id("documents"),
  userId: v.id("users"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
});

export const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  image: v.optional(v.string()),
});
