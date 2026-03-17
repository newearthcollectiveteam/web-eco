import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { teamIdeas, ideaEdits, userProfiles } from "~/server/db/schema";
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

export const ideasRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        sort: z.enum(["newest", "updated", "alphabetical"]).default("newest"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [];

      if (input.category) {
        conditions.push(eq(teamIdeas.category, input.category));
      }
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(ilike(teamIdeas.title, term), ilike(teamIdeas.content, term))!
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const orderBy =
        input.sort === "updated"
          ? desc(teamIdeas.updatedAt)
          : input.sort === "alphabetical"
            ? asc(teamIdeas.title)
            : desc(teamIdeas.createdAt);

      const [rows, countResult, categories] = await Promise.all([
        ctx.db
          .select({
            id: teamIdeas.id,
            title: teamIdeas.title,
            content: teamIdeas.content,
            category: teamIdeas.category,
            createdBy: teamIdeas.createdBy,
            createdAt: teamIdeas.createdAt,
            updatedAt: teamIdeas.updatedAt,
            creatorName: userProfiles.fullName,
            creatorEmail: userProfiles.email,
          })
          .from(teamIdeas)
          .leftJoin(userProfiles, eq(teamIdeas.createdBy, userProfiles.id))
          .where(where)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(teamIdeas)
          .where(where),
        // Get distinct categories for filter dropdown
        ctx.db
          .selectDistinct({ category: teamIdeas.category })
          .from(teamIdeas)
          .where(sql`${teamIdeas.category} IS NOT NULL`)
          .orderBy(asc(teamIdeas.category)),
      ]);

      return {
        ideas: rows,
        total: countResult[0]?.count ?? 0,
        categories: categories
          .map((c) => c.category)
          .filter((c): c is string => c !== null),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        content: z.string().optional(),
        category: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [idea] = await ctx.db
        .insert(teamIdeas)
        .values({
          title: input.title,
          content: input.content ?? null,
          category: input.category || null,
          createdBy: ctx.user.id,
        })
        .returning();

      return idea;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        content: z.string().optional().nullable(),
        category: z.string().max(100).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Fetch current state for edit history
      const [current] = await ctx.db
        .select()
        .from(teamIdeas)
        .where(eq(teamIdeas.id, id));

      if (!current) throw new Error("Idea not found");

      // Record edit history
      await ctx.db.insert(ideaEdits).values({
        ideaId: id,
        editedBy: ctx.user.id,
        previousTitle: current.title,
        previousContent: current.content,
        previousCategory: current.category,
      });

      // Apply updates
      const data: Record<string, unknown> = {};
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.content !== undefined) data.content = updates.content;
      if (updates.category !== undefined)
        data.category = updates.category || null;

      const [idea] = await ctx.db
        .update(teamIdeas)
        .set(data)
        .where(eq(teamIdeas.id, id))
        .returning();

      return idea;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(teamIdeas).where(eq(teamIdeas.id, input.id));
      return { success: true };
    }),

  getHistory: protectedProcedure
    .input(z.object({ ideaId: z.number() }))
    .query(async ({ ctx, input }) => {
      const edits = await ctx.db
        .select({
          id: ideaEdits.id,
          previousTitle: ideaEdits.previousTitle,
          previousContent: ideaEdits.previousContent,
          previousCategory: ideaEdits.previousCategory,
          editedAt: ideaEdits.editedAt,
          editorName: userProfiles.fullName,
          editorEmail: userProfiles.email,
        })
        .from(ideaEdits)
        .leftJoin(userProfiles, eq(ideaEdits.editedBy, userProfiles.id))
        .where(eq(ideaEdits.ideaId, input.ideaId))
        .orderBy(desc(ideaEdits.editedAt));

      return edits;
    }),
});
