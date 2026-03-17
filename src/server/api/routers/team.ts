import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { userProfiles } from "~/server/db/schema";
import { eq, ilike, or, count, sql, and, type SQL } from "drizzle-orm";
import { createAdminClient } from "~/lib/supabase/admin";

const VALID_ROLES = [
  "founder",
  "admin",
  "community_lead",
  "developer",
  "designer",
  "content_creator",
] as const;

export const teamRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, role, limit, offset } = input;

      const conditions: SQL[] = [];
      if (search) {
        const searchCond = or(
          ilike(userProfiles.fullName, `%${search}%`),
          ilike(userProfiles.email, `%${search}%`)
        );
        if (searchCond) conditions.push(searchCond);
      }
      if (role) {
        conditions.push(sql`${userProfiles.teamRoles} ? ${role}`);
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [members, [totalRow]] = await Promise.all([
        ctx.db
          .select()
          .from(userProfiles)
          .where(where)
          .limit(limit)
          .offset(offset)
          .orderBy(userProfiles.createdAt),
        ctx.db.select({ total: count() }).from(userProfiles).where(where),
      ]);

      const total = totalRow?.total ?? 0;

      return {
        members,
        total,
        hasMore: offset + limit < total,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        teamRoles: z.array(z.enum(VALID_ROLES)).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adminClient = createAdminClient();

      // Create auth user via Supabase Admin API (email pre-confirmed)
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: input.email,
          email_confirm: true,
          user_metadata: { full_name: input.name },
        });

      if (authError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create auth user: ${authError.message}`,
        });
      }

      // The handle_new_user trigger creates the profile.
      // Now update it with the team-specific fields.
      const [updated] = await ctx.db
        .update(userProfiles)
        .set({
          fullName: input.name,
          phone: input.phone ?? null,
          teamRoles: input.teamRoles ?? [],
        })
        .where(eq(userProfiles.id, authData.user.id))
        .returning();

      return updated;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        teamRoles: z.array(z.enum(VALID_ROLES)).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input;

      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.fullName = fields.name;
      if (fields.email !== undefined) updateData.email = fields.email;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.teamRoles !== undefined)
        updateData.teamRoles = fields.teamRoles;

      const [updated] = await ctx.db
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = createAdminClient();

      // Delete from Supabase Auth (also cascades via trigger cleanup)
      const { error: authError } = await adminClient.auth.admin.deleteUser(
        input.id
      );

      if (authError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete auth user: ${authError.message}`,
        });
      }

      // Delete profile row
      await ctx.db.delete(userProfiles).where(eq(userProfiles.id, input.id));

      return { success: true };
    }),
});
