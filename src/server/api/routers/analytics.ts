import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { contacts, sessions, events, emailLinks } from "~/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import {
  getContactAnalytics,
  getContactAttribution,
} from "~/lib/tracking/analytics-service";

export const analyticsRouter = createTRPCRouter({
  contactMetrics: publicProcedure
    .input(
      z.object({
        contactId: z.number().optional(),
        email: z.string().email().optional(),
        type: z.enum(["summary", "full"]).default("summary"),
      })
    )
    .query(async ({ ctx, input }) => {
      const contact = input.contactId
        ? await ctx.db.query.contacts.findFirst({
            where: eq(contacts.id, input.contactId),
          })
        : input.email
          ? await ctx.db.query.contacts.findFirst({
              where: eq(contacts.email, input.email),
            })
          : null;

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      if (input.type === "full") {
        const [analytics, attribution] = await Promise.all([
          getContactAnalytics(contact.id),
          getContactAttribution(contact.id),
        ]);

        return { contact, analytics, attribution };
      }

      const analytics = await getContactAnalytics(contact.id);

      return {
        contact: {
          id: contact.id,
          email: contact.email,
          name: contact.name,
          firstSource: contact.firstSource,
          status: contact.status,
          tags: contact.tags,
        },
        metrics: analytics.metrics,
      };
    }),

  overview: publicProcedure.query(async ({ ctx }) => {
    const [
      totalContacts,
      totalSessions,
      totalEvents,
      totalEmailLinks,
      recentContacts,
    ] = await Promise.all([
      ctx.db.select({ count: sql<number>`count(*)` }).from(contacts),
      ctx.db.select({ count: sql<number>`count(*)` }).from(sessions),
      ctx.db.select({ count: sql<number>`count(*)` }).from(events),
      ctx.db.select({ count: sql<number>`count(*)` }).from(emailLinks),
      ctx.db.query.contacts.findMany({
        orderBy: [desc(contacts.createdAt)],
        limit: 10,
      }),
    ]);

    return {
      summary: {
        totalContacts: totalContacts[0]?.count ?? 0,
        totalSessions: totalSessions[0]?.count ?? 0,
        totalEvents: totalEvents[0]?.count ?? 0,
        totalEmailLinks: totalEmailLinks[0]?.count ?? 0,
      },
      recentContacts,
    };
  }),
});
