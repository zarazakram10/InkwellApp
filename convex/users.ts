import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { userValidator } from "./lib/validators";

export const current = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (user === null) {
      return null;
    }
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (user === null) {
      throw new ConvexError("Account not found.");
    }

    const name = args.name.trim();
    const email = args.email.trim();
    if (name.length > 80) {
      throw new ConvexError("Name must be 80 characters or fewer.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Enter a valid email address.");
    }

    if (email !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (existingUser !== null && existingUser._id !== userId) {
        throw new ConvexError("That email is already in use.");
      }

      const existingAccount = await ctx.db
        .query("authAccounts")
        .withIndex("providerAndAccountId", (q) =>
          q.eq("provider", "password").eq("providerAccountId", email),
        )
        .unique();
      if (existingAccount !== null && existingAccount.userId !== userId) {
        throw new ConvexError("That email is already in use.");
      }

      const accounts = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", userId).eq("provider", "password"),
        )
        .collect();
      for (const account of accounts) {
        await ctx.db.patch(account._id, {
          providerAccountId: email,
          ...(account.emailVerified !== undefined
            ? { emailVerified: email }
            : {}),
        });
      }
    }

    await ctx.db.patch(userId, {
      name: name.length > 0 ? name : undefined,
      email,
    });
    return null;
  },
});
