import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { contacts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const questionnaireRouter = createTRPCRouter({
  checkCompletion: publicProcedure
    .input(
      z
        .object({
          contactId: z.number().optional(),
          email: z.string().email().optional(),
        })
        .refine((data) => data.contactId || data.email, {
          message: "Either contactId or email is required",
        })
    )
    .query(async ({ ctx, input }) => {
      let contact;
      if (input.contactId) {
        contact = await ctx.db.query.contacts.findFirst({
          where: eq(contacts.id, input.contactId),
        });
      } else if (input.email) {
        contact = await ctx.db.query.contacts.findFirst({
          where: eq(contacts.email, input.email),
        });
      }

      if (!contact) {
        return {
          completed: false,
          message: "Contact not found" as const,
        };
      }

      const metadata = contact.metadata as {
        questionnaireCompleted?: boolean;
        questionnaireCompletedAt?: string;
      } | null;
      const completed = metadata?.questionnaireCompleted === true;

      return {
        completed,
        completedAt: metadata?.questionnaireCompletedAt ?? null,
        contactId: contact.id,
        name: contact.name,
        email: contact.email,
      };
    }),
});
