import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { teamTasks, taskStatuses, userProfiles } from "~/server/db/schema";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";

export const tasksRouter = createTRPCRouter({
  // ─── Task Statuses ──────────────────────────────────────────

  listStatuses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(taskStatuses)
      .orderBy(asc(taskStatuses.sortOrder));
  }),

  createStatus: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get max sort order
      const [maxOrder] = await ctx.db
        .select({ max: sql<number>`coalesce(max(${taskStatuses.sortOrder}), -1)` })
        .from(taskStatuses);

      const [status] = await ctx.db
        .insert(taskStatuses)
        .values({
          name: input.name,
          slug: input.slug,
          color: input.color ?? "text-gray-400 border-gray-500/30",
          icon: input.icon ?? "circle",
          sortOrder: (maxOrder?.max ?? -1) + 1,
        })
        .returning();

      return status;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const data: Record<string, unknown> = {};
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.color !== undefined) data.color = updates.color;
      if (updates.icon !== undefined) data.icon = updates.icon;

      const [status] = await ctx.db
        .update(taskStatuses)
        .set(data)
        .where(eq(taskStatuses.id, id))
        .returning();

      return status;
    }),

  reorderStatuses: protectedProcedure
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.map((item) =>
          ctx.db
            .update(taskStatuses)
            .set({ sortOrder: item.sortOrder })
            .where(eq(taskStatuses.id, item.id))
        )
      );
      return { success: true };
    }),

  deleteStatus: protectedProcedure
    .input(z.object({ id: z.number(), migrateToSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get slug of the status being deleted
      const [toDelete] = await ctx.db
        .select({ slug: taskStatuses.slug })
        .from(taskStatuses)
        .where(eq(taskStatuses.id, input.id));

      if (toDelete) {
        // Move all tasks from deleted status to target status
        await ctx.db
          .update(teamTasks)
          .set({ status: input.migrateToSlug })
          .where(eq(teamTasks.status, toDelete.slug));
      }

      await ctx.db.delete(taskStatuses).where(eq(taskStatuses.id, input.id));
      return { success: true };
    }),

  // ─── Tasks ─────────────────────────────────────────────────

  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        assignedTo: z.string().optional(),
        priority: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [];

      if (input.status) {
        conditions.push(eq(teamTasks.status, input.status));
      }
      if (input.assignedTo) {
        conditions.push(eq(teamTasks.assignedTo, input.assignedTo));
      }
      if (input.priority) {
        conditions.push(eq(teamTasks.priority, input.priority));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      // Get status ordering from taskStatuses table
      const [rows, countResult] = await Promise.all([
        ctx.db
          .select({
            id: teamTasks.id,
            title: teamTasks.title,
            description: teamTasks.description,
            status: teamTasks.status,
            priority: teamTasks.priority,
            assignedTo: teamTasks.assignedTo,
            createdBy: teamTasks.createdBy,
            startDate: teamTasks.startDate,
            dueDate: teamTasks.dueDate,
            completedAt: teamTasks.completedAt,
            createdAt: teamTasks.createdAt,
            assigneeName: userProfiles.fullName,
            assigneeEmail: userProfiles.email,
          })
          .from(teamTasks)
          .leftJoin(userProfiles, eq(teamTasks.assignedTo, userProfiles.id))
          .where(where)
          .orderBy(
            sql`CASE ${teamTasks.priority} WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`,
            desc(teamTasks.createdAt)
          )
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(teamTasks)
          .where(where),
      ]);

      return {
        tasks: rows,
        total: countResult[0]?.count ?? 0,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().default("todo"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        assignedTo: z.string().optional(),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [task] = await ctx.db
        .insert(teamTasks)
        .values({
          title: input.title,
          description: input.description ?? null,
          status: input.status,
          priority: input.priority,
          assignedTo: input.assignedTo ?? null,
          createdBy: ctx.user.id,
          startDate: input.startDate ? new Date(input.startDate) : null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        })
        .returning();

      return task;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        status: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.string().optional().nullable(),
        startDate: z.string().optional().nullable(),
        dueDate: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const data: Record<string, unknown> = {};

      if (updates.title !== undefined) data.title = updates.title;
      if (updates.description !== undefined) data.description = updates.description;
      if (updates.status !== undefined) {
        data.status = updates.status;
        // Check if this is the last status (likely "done"-equivalent)
        const allStatuses = await ctx.db
          .select()
          .from(taskStatuses)
          .orderBy(asc(taskStatuses.sortOrder));
        const lastStatus = allStatuses[allStatuses.length - 1];
        if (lastStatus && updates.status === lastStatus.slug) {
          data.completedAt = new Date();
        } else {
          data.completedAt = null;
        }
      }
      if (updates.priority !== undefined) data.priority = updates.priority;
      if (updates.assignedTo !== undefined) data.assignedTo = updates.assignedTo;
      if (updates.startDate !== undefined) {
        data.startDate = updates.startDate ? new Date(updates.startDate) : null;
      }
      if (updates.dueDate !== undefined) {
        data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }

      const [task] = await ctx.db
        .update(teamTasks)
        .set(data)
        .where(eq(teamTasks.id, id))
        .returning();

      return task;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(teamTasks).where(eq(teamTasks.id, input.id));
      return { success: true };
    }),

  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db
      .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
      .from(userProfiles);
    return members.map((m) => ({ id: m.id, name: m.fullName ?? m.email }));
  }),
});
