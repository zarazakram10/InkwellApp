import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: DbCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function requireOwnedDocument(
  ctx: DbCtx,
  documentId: Id<"documents">,
): Promise<Doc<"documents">> {
  const userId = await requireUserId(ctx);
  const document = await ctx.db.get(documentId);
  if (document === null || document.userId !== userId) {
    throw new Error("Document not found");
  }
  return document;
}
