import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { Value } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params): { email: string } & Record<string, Value> {
        const email = params.email as string;
        if (typeof params.name === "string" && params.name.trim().length > 0) {
          return { email, name: params.name.trim() };
        }
        return { email };
      },
    }),
  ],
});
