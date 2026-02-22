import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { userProfiles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  checkEmailForClaim: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.email, input.email),
      });

      if (!profile) {
        return { exists: false, canClaim: false, name: null };
      }

      // Profile exists — user can claim (set password via magic link)
      return {
        exists: true,
        canClaim: true,
        name: profile.fullName ?? null,
      };
    }),
});
