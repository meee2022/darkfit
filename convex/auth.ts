// convex/auth.ts
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";
import { EmailServiceOTPPasswordReset } from "./EmailServiceOTPPasswordReset";

// convex/auth.ts
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({ reset: EmailServiceOTPPasswordReset }), // ✅ الآن صحيح
    Anonymous,
  ],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ?? null;
  },
});
