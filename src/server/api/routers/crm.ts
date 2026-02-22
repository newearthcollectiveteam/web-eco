import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { contacts, contactActivities } from "~/server/db/schema";
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";

export const crmRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.id, input.id),
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      const activities = await ctx.db.query.contactActivities.findMany({
        where: eq(contactActivities.contactId, contact.id),
        orderBy: [desc(contactActivities.createdAt)],
        limit: 100,
      });

      return { contact, activities };
    }),

  list: publicProcedure
    .input(
      z.object({
        source: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [];

      if (input.source) {
        conditions.push(eq(contacts.firstSource, input.source));
      }

      if (input.status) {
        conditions.push(eq(contacts.status, input.status));
      }

      if (input.search) {
        const searchCondition = or(
          like(contacts.email, `%${input.search}%`),
          like(contacts.name, `%${input.search}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      const allContacts = await ctx.db
        .select()
        .from(contacts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(contacts.lastContactDate))
        .limit(input.limit);

      const contactsBySource: Record<string, number> = {};
      const contactsByStatus: Record<string, number> = {};

      allContacts.forEach((contact) => {
        contactsBySource[contact.firstSource] =
          (contactsBySource[contact.firstSource] ?? 0) + 1;
        contactsByStatus[contact.status] =
          (contactsByStatus[contact.status] ?? 0) + 1;
      });

      return {
        contacts: allContacts,
        total: allContacts.length,
        stats: {
          bySource: Object.entries(contactsBySource).map(([source, count]) => ({
            source,
            count,
          })),
          byStatus: Object.entries(contactsByStatus).map(([status, count]) => ({
            status,
            count,
          })),
        },
      };
    }),
});
