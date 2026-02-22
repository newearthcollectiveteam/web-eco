import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  contacts,
  questionnaireResponses,
  eventWaivers,
  contactActivities,
  contactSources,
} from "~/server/db/schema";
import { desc, sql } from "drizzle-orm";

export const adminRouter = createTRPCRouter({
  dashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      contactsCount,
      questionnaireCount,
      waiversCount,
      activityCount,
      sourcesCount,
      recentContacts,
      recentQuestionnaires,
      recentWaivers,
    ] = await Promise.all([
      ctx.db.select({ count: sql<number>`count(*)` }).from(contacts),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(questionnaireResponses),
      ctx.db.select({ count: sql<number>`count(*)` }).from(eventWaivers),
      ctx.db.select({ count: sql<number>`count(*)` }).from(contactActivities),
      ctx.db.select({ count: sql<number>`count(*)` }).from(contactSources),
      ctx.db.query.contacts.findMany({
        orderBy: [desc(contacts.createdAt)],
        limit: 5,
      }),
      ctx.db.query.questionnaireResponses.findMany({
        orderBy: [desc(questionnaireResponses.createdAt)],
        limit: 5,
      }),
      ctx.db.query.eventWaivers.findMany({
        orderBy: [desc(eventWaivers.signedAt)],
        limit: 5,
      }),
    ]);

    return {
      stats: {
        contacts: contactsCount[0]?.count ?? 0,
        questionnaires: questionnaireCount[0]?.count ?? 0,
        waivers: waiversCount[0]?.count ?? 0,
        activities: activityCount[0]?.count ?? 0,
        sources: sourcesCount[0]?.count ?? 0,
      },
      recent: {
        contacts: recentContacts,
        questionnaires: recentQuestionnaires,
        waivers: recentWaivers,
      },
    };
  }),

  tableData: protectedProcedure
    .input(
      z.object({
        table: z.enum(["contacts", "questionnaire", "waivers"]),
        limit: z.number().min(1).max(500).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.table === "contacts") {
        const data = await ctx.db.query.contacts.findMany({
          orderBy: [desc(contacts.createdAt)],
          limit: input.limit,
        });
        const total = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(contacts);
        return { data, total: total[0]?.count ?? 0 };
      }

      if (input.table === "questionnaire") {
        const data = await ctx.db.query.questionnaireResponses.findMany({
          orderBy: [desc(questionnaireResponses.createdAt)],
          limit: input.limit,
        });
        const total = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(questionnaireResponses);
        return { data, total: total[0]?.count ?? 0 };
      }

      // waivers
      const data = await ctx.db.query.eventWaivers.findMany({
        orderBy: [desc(eventWaivers.signedAt)],
        limit: input.limit,
      });
      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(eventWaivers);
      return { data, total: total[0]?.count ?? 0 };
    }),
});
