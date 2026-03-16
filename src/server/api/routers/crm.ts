import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import {
  contacts,
  contactSources,
  contactActivities,
  contactAssociations,
  contactCommunityTags,
  communityTags,
  questionnaireResponses,
  waitlistIntake,
  eventWaivers,
  voiceNotes,
  userProfiles,
} from "~/server/db/schema";
import { and, desc, eq, like, or, sql, inArray, type SQL } from "drizzle-orm";
import { createAdminClient } from "~/lib/supabase/admin";

export const crmRouter = createTRPCRouter({
  // ─── Queries ───────────────────────────────────────────────

  getPipelineStats: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        status: contacts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(contacts)
      .groupBy(contacts.status);

    const stats: Record<string, number> = {
      lead: 0,
      qualified: 0,
      customer: 0,
      inactive: 0,
    };
    let total = 0;
    for (const row of rows) {
      stats[row.status] = row.count;
      total += row.count;
    }

    return { ...stats, total };
  }),

  getContacts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        source: z.string().optional(),
        communityTagId: z.number().optional(),
        addedBy: z.string().optional(),
        sortBy: z.enum(["name", "date", "source", "lastContact"]).default("lastContact"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL[] = [];

      if (input.status) {
        conditions.push(eq(contacts.status, input.status));
      }

      if (input.source) {
        conditions.push(eq(contacts.firstSource, input.source));
      }

      // Community tag filter (independent from source)
      if (input.communityTagId) {
        conditions.push(
          sql`${contacts.id} IN (SELECT contact_id FROM "web-eco_contact_community_tag" WHERE community_tag_id = ${input.communityTagId})`
        );
      }

      if (input.addedBy) {
        conditions.push(
          sql`${contacts.id} IN (SELECT contact_id FROM "web-eco_contact_association" WHERE user_id = ${input.addedBy})`
        );
      }

      if (input.search) {
        const s = `%${input.search}%`;
        const searchCond = or(like(contacts.email, s), like(contacts.name, s));
        if (searchCond) conditions.push(searchCond);
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      // Sorting
      const orderMap = {
        name: input.sortOrder === "asc" ? sql`${contacts.name} ASC NULLS LAST` : sql`${contacts.name} DESC NULLS LAST`,
        date: input.sortOrder === "asc" ? sql`${contacts.createdAt} ASC` : sql`${contacts.createdAt} DESC`,
        source: input.sortOrder === "asc" ? sql`${contacts.firstSource} ASC` : sql`${contacts.firstSource} DESC`,
        lastContact: input.sortOrder === "asc" ? sql`${contacts.lastContactDate} ASC` : sql`${contacts.lastContactDate} DESC`,
      };

      const [rows, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(contacts)
          .where(where)
          .orderBy(orderMap[input.sortBy])
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(contacts)
          .where(where),
      ]);

      const total = countResult[0]?.count ?? 0;

      const ids = rows.map((r) => r.id);
      const sourcesMap: Record<number, string[]> = {};
      const associationsMap: Record<number, { id: string; name: string }[]> = {};
      const communityMap: Record<number, { id: number; name: string; color: string | null; type: string }[]> = {};

      if (ids.length > 0) {
        const [sources, assocs, comTags] = await Promise.all([
          ctx.db
            .select({
              contactId: contactSources.contactId,
              source: contactSources.source,
            })
            .from(contactSources)
            .where(inArray(contactSources.contactId, ids)),
          ctx.db
            .select({
              contactId: contactAssociations.contactId,
              userId: contactAssociations.userId,
              fullName: userProfiles.fullName,
              email: userProfiles.email,
            })
            .from(contactAssociations)
            .innerJoin(userProfiles, eq(contactAssociations.userId, userProfiles.id))
            .where(inArray(contactAssociations.contactId, ids)),
          ctx.db
            .select({
              contactId: contactCommunityTags.contactId,
              tagId: communityTags.id,
              tagName: communityTags.name,
              tagColor: communityTags.color,
              tagType: communityTags.type,
            })
            .from(contactCommunityTags)
            .innerJoin(communityTags, eq(contactCommunityTags.communityTagId, communityTags.id))
            .where(inArray(contactCommunityTags.contactId, ids)),
        ]);

        for (const s of sources) {
          if (!sourcesMap[s.contactId]) sourcesMap[s.contactId] = [];
          sourcesMap[s.contactId]!.push(s.source);
        }

        for (const a of assocs) {
          if (!associationsMap[a.contactId]) associationsMap[a.contactId] = [];
          associationsMap[a.contactId]!.push({
            id: a.userId,
            name: a.fullName ?? a.email,
          });
        }

        for (const ct of comTags) {
          if (!communityMap[ct.contactId]) communityMap[ct.contactId] = [];
          communityMap[ct.contactId]!.push({
            id: ct.tagId,
            name: ct.tagName,
            color: ct.tagColor,
            type: ct.tagType,
          });
        }
      }

      const contactsWithSources = rows.map((c) => ({
        ...c,
        submissionSources: sourcesMap[c.id] ?? [c.firstSource],
        associations: associationsMap[c.id] ?? [],
        communityTags: communityMap[c.id] ?? [],
        addedByName: associationsMap[c.id]?.[0]?.name ?? null,
      }));

      return { contacts: contactsWithSources, total };
    }),

  getContact: protectedProcedure
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

      const [qResponses, wIntakes, waivers, sources, activities, notes, associations, referredByContact, referralCount, comTags] =
        await Promise.all([
          ctx.db.query.questionnaireResponses.findMany({
            where: eq(questionnaireResponses.contactId, input.id),
            orderBy: [desc(questionnaireResponses.createdAt)],
          }),
          ctx.db.query.waitlistIntake.findMany({
            where: eq(waitlistIntake.contactId, input.id),
            orderBy: [desc(waitlistIntake.createdAt)],
          }),
          ctx.db.query.eventWaivers.findMany({
            where: eq(eventWaivers.signerEmail, contact.email),
            orderBy: [desc(eventWaivers.signedAt)],
          }),
          ctx.db.query.contactSources.findMany({
            where: eq(contactSources.contactId, input.id),
          }),
          ctx.db.query.contactActivities.findMany({
            where: eq(contactActivities.contactId, input.id),
            orderBy: [desc(contactActivities.createdAt)],
            limit: 50,
          }),
          // Voice notes with recorder info + signed URLs
          (async () => {
            const vn = await ctx.db
              .select()
              .from(voiceNotes)
              .where(eq(voiceNotes.contactId, input.id))
              .orderBy(desc(voiceNotes.createdAt));
            if (vn.length === 0) return [];
            const recorderIds = [...new Set(vn.map((n) => n.recordedBy))];
            const profiles = await ctx.db
              .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
              .from(userProfiles)
              .where(inArray(userProfiles.id, recorderIds));
            const profileMap: Record<string, string> = {};
            for (const p of profiles) profileMap[p.id] = p.fullName ?? p.email;

            // Generate signed URLs for private bucket (1 hour expiry)
            const supabase = createAdminClient();
            const signedNotes = await Promise.all(
              vn.map(async (n) => {
                const { data } = await supabase.storage
                  .from("voice-notes")
                  .createSignedUrl(n.storagePath, 3600);
                return {
                  ...n,
                  signedUrl: data?.signedUrl ?? n.publicUrl,
                  recorderName: profileMap[n.recordedBy] ?? "Unknown",
                };
              })
            );
            return signedNotes;
          })(),
          // Associations (team members linked to this contact)
          ctx.db
            .select({
              userId: contactAssociations.userId,
              fullName: userProfiles.fullName,
              email: userProfiles.email,
            })
            .from(contactAssociations)
            .innerJoin(userProfiles, eq(contactAssociations.userId, userProfiles.id))
            .where(eq(contactAssociations.contactId, input.id)),
          // Referral: who referred this contact
          contact.referredByContactId
            ? ctx.db.query.contacts.findFirst({
                where: eq(contacts.id, contact.referredByContactId),
                columns: { id: true, name: true, email: true },
              })
            : Promise.resolve(null),
          // Referral: how many people this contact referred
          ctx.db
            .select({ count: sql<number>`count(*)::int` })
            .from(contacts)
            .where(eq(contacts.referredByContactId, input.id))
            .then((rows) => rows[0]?.count ?? 0),
          // Community tags
          ctx.db
            .select({
              id: communityTags.id,
              name: communityTags.name,
              slug: communityTags.slug,
              color: communityTags.color,
              type: communityTags.type,
            })
            .from(contactCommunityTags)
            .innerJoin(communityTags, eq(contactCommunityTags.communityTagId, communityTags.id))
            .where(eq(contactCommunityTags.contactId, input.id)),
        ]);

      // Extract social media from latest questionnaire response
      const latestQ = qResponses[0];
      const socialMedia = latestQ
        ? {
            instagram: latestQ.instagram,
            twitter: latestQ.twitter,
            linkedin: latestQ.linkedin,
            tiktok: latestQ.tiktok,
            youtube: latestQ.youtube,
            facebook: latestQ.facebook,
            otherSocial: latestQ.otherSocial,
            website: latestQ.website,
          }
        : null;

      return {
        contact,
        questionnaireResponses: qResponses,
        waitlistIntakes: wIntakes,
        eventWaivers: waivers,
        sources,
        activities,
        voiceNotes: notes,
        communityTags: comTags,
        socialMedia,
        associations: associations.map((a) => ({
          id: a.userId,
          name: a.fullName ?? a.email,
        })),
        addedByProfile: associations[0]
          ? { id: associations[0].userId, fullName: associations[0].fullName, email: associations[0].email }
          : null,
        referredBy: referredByContact
          ? { id: referredByContact.id, name: referredByContact.name ?? referredByContact.email }
          : null,
        referralCount,
      };
    }),

  getSourceBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        source: contacts.firstSource,
        count: sql<number>`count(*)::int`,
      })
      .from(contacts)
      .groupBy(contacts.firstSource)
      .orderBy(sql`count(*) desc`);

    return rows;
  }),

  getContactGrowth: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        month: sql<string>`to_char(${contacts.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(contacts)
      .where(
        sql`${contacts.createdAt} >= now() - interval '6 months'`
      )
      .groupBy(sql`to_char(${contacts.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${contacts.createdAt}, 'YYYY-MM')`);

    return rows;
  }),

  getTagOptions: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ tags: contacts.tags })
      .from(contacts)
      .where(sql`${contacts.tags} != '[]'::jsonb`);

    const tagSet = new Set<string>();
    for (const row of rows) {
      if (Array.isArray(row.tags)) {
        for (const tag of row.tags) {
          tagSet.add(tag);
        }
      }
    }
    return Array.from(tagSet).sort();
  }),

  getLeads: protectedProcedure
    .input(
      z.object({
        source: z.string().optional(),
        communityTagId: z.number().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["name", "date", "source"]).default("date"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const sourceFilter = input?.source;
      const communityFilter = input?.communityTagId;
      const search = input?.search;

      // If community filter is active, get contact IDs in that community
      let communityContactIds: number[] | null = null;
      if (communityFilter) {
        const rows = await ctx.db
          .select({ contactId: contactCommunityTags.contactId })
          .from(contactCommunityTags)
          .where(eq(contactCommunityTags.communityTagId, communityFilter));
        communityContactIds = rows.map((r) => r.contactId);
        if (communityContactIds.length === 0) {
          return { leads: [], total: 0 };
        }
      }

      type LeadItem = {
        id: number;
        contactId: number | null;
        source: string;
        name: string;
        email: string;
        date: Date;
        preview: string;
        processed: boolean;
        communityTags: { id: number; name: string; color: string | null }[];
      };

      const results: LeadItem[] = [];

      // Questionnaire submissions
      if (!sourceFilter || sourceFilter === "questionnaire") {
        const questionnaires =
          await ctx.db.query.questionnaireResponses.findMany({
            orderBy: [desc(questionnaireResponses.createdAt)],
          });
        for (const q of questionnaires) {
          if (communityContactIds && !communityContactIds.includes(q.contactId)) continue;
          if (search) {
            const s = search.toLowerCase();
            if (!q.name.toLowerCase().includes(s) && !q.email.toLowerCase().includes(s)) continue;
          }
          results.push({
            id: q.id,
            contactId: q.contactId,
            source: "questionnaire",
            name: q.name,
            email: q.email,
            date: q.createdAt,
            preview: q.primaryRole?.slice(0, 100) ?? "",
            processed: true,
            communityTags: [],
          });
        }
      }

      // Event waivers
      if (!sourceFilter || sourceFilter === "event_waiver") {
        const waivers = await ctx.db.query.eventWaivers.findMany({
          orderBy: [desc(eventWaivers.signedAt)],
        });
        for (const w of waivers) {
          // Find contact ID by email for community filtering
          if (communityContactIds) {
            const contact = await ctx.db.query.contacts.findFirst({
              where: eq(contacts.email, w.signerEmail),
              columns: { id: true },
            });
            if (!contact || !communityContactIds.includes(contact.id)) continue;
          }
          if (search) {
            const s = search.toLowerCase();
            if (!w.signerName.toLowerCase().includes(s) && !w.signerEmail.toLowerCase().includes(s)) continue;
          }
          results.push({
            id: w.id,
            contactId: null,
            source: "event_waiver",
            name: w.signerName,
            email: w.signerEmail,
            date: w.signedAt,
            preview: `${w.eventName} — ${w.eventDate}`,
            processed: true,
            communityTags: [],
          });
        }
      }

      // Resolve contactId for waivers and fetch community tags
      const allEmails = [...new Set(results.map((r) => r.email))];
      if (allEmails.length > 0) {
        const contactRows = await ctx.db
          .select({ id: contacts.id, email: contacts.email })
          .from(contacts)
          .where(inArray(contacts.email, allEmails));
        const emailToId: Record<string, number> = {};
        for (const c of contactRows) emailToId[c.email] = c.id;

        // Assign contactIds for waivers
        for (const r of results) {
          if (!r.contactId && emailToId[r.email]) {
            r.contactId = emailToId[r.email]!;
          }
        }

        // Fetch community tags for all contacts
        const contactIds = [...new Set(results.map((r) => r.contactId).filter((id): id is number => id !== null))];
        if (contactIds.length > 0) {
          const tags = await ctx.db
            .select({
              contactId: contactCommunityTags.contactId,
              tagId: communityTags.id,
              tagName: communityTags.name,
              tagColor: communityTags.color,
            })
            .from(contactCommunityTags)
            .innerJoin(communityTags, eq(contactCommunityTags.communityTagId, communityTags.id))
            .where(inArray(contactCommunityTags.contactId, contactIds));

          const tagMap: Record<number, { id: number; name: string; color: string | null }[]> = {};
          for (const t of tags) {
            if (!tagMap[t.contactId]) tagMap[t.contactId] = [];
            tagMap[t.contactId]!.push({ id: t.tagId, name: t.tagName, color: t.tagColor });
          }
          for (const r of results) {
            if (r.contactId && tagMap[r.contactId]) {
              r.communityTags = tagMap[r.contactId]!;
            }
          }
        }
      }

      // Sorting
      const sortBy = input?.sortBy ?? "date";
      const sortOrder = input?.sortOrder ?? "desc";
      results.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") cmp = a.name.localeCompare(b.name);
        else if (sortBy === "source") cmp = a.source.localeCompare(b.source);
        else cmp = a.date.getTime() - b.date.getTime();
        return sortOrder === "desc" ? -cmp : cmp;
      });

      const total = results.length;
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const paged = results.slice(offset, offset + limit);

      return { leads: paged, total };
    }),

  // ─── Mutations ─────────────────────────────────────────────

  createContact: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        status: z.string().default("lead"),
        source: z.string().default("manual"),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate email
      const existing = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.email, input.email),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A contact with this email already exists",
        });
      }

      const [newContact] = await ctx.db
        .insert(contacts)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          status: input.status,
          firstSource: input.source,
          tags: input.tags ?? [],
          notes: input.notes ?? null,
          addedBy: ctx.user.id,
        })
        .returning();

      if (!newContact) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create contact",
        });
      }

      // Create source record + association + activity
      await Promise.all([
        ctx.db.insert(contactSources).values({
          contactId: newContact.id,
          source: input.source,
        }),
        ctx.db.insert(contactAssociations).values({
          contactId: newContact.id,
          userId: ctx.user.id,
        }),
        ctx.db.insert(contactActivities).values({
          contactId: newContact.id,
          activityType: "contact_created",
          source: input.source,
          description: `Contact created manually`,
        }),
      ]);

      return newContact;
    }),

  updateContact: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        status: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Get current contact to detect status change
      const current = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.id, id),
      });

      if (!current) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      // Build update object - only include defined fields
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const [updated] = await ctx.db
        .update(contacts)
        .set(updateData)
        .where(eq(contacts.id, id))
        .returning();

      // Log status change
      if (updates.status && updates.status !== current.status) {
        await ctx.db.insert(contactActivities).values({
          contactId: id,
          activityType: "status_changed",
          description: `Status changed from ${current.status} to ${updates.status}`,
        });
      }

      return updated;
    }),

  deleteContact: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.id, input.id),
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      await ctx.db.delete(contacts).where(eq(contacts.id, input.id));

      return { success: true };
    }),

  addNote: protectedProcedure
    .input(
      z.object({
        contactId: z.number(),
        note: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(contactActivities).values({
        contactId: input.contactId,
        activityType: "note_added",
        description: input.note,
      });

      return { success: true };
    }),

  markWaitlistProcessed: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(waitlistIntake)
        .set({ processed: true })
        .where(eq(waitlistIntake.id, input.id));

      return { success: true };
    }),

  // ─── Team Tracking ──────────────────────────────────────────

  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    // Return all team members who have at least one association
    const rows = await ctx.db
      .select({
        userId: contactAssociations.userId,
      })
      .from(contactAssociations)
      .groupBy(contactAssociations.userId);

    const ids = rows.map((r) => r.userId);
    if (ids.length === 0) return [];

    const profiles = await ctx.db
      .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
      .from(userProfiles)
      .where(inArray(userProfiles.id, ids));

    return profiles.map((p) => ({
      id: p.id,
      name: p.fullName ?? p.email,
    }));
  }),

  // Keep old name as alias for backwards compat
  getTeamMembersWhoAddedContacts: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ userId: contactAssociations.userId })
      .from(contactAssociations)
      .groupBy(contactAssociations.userId);

    const ids = rows.map((r) => r.userId);
    if (ids.length === 0) return [];

    const profiles = await ctx.db
      .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
      .from(userProfiles)
      .where(inArray(userProfiles.id, ids));

    return profiles.map((p) => ({
      id: p.id,
      name: p.fullName ?? p.email,
    }));
  }),

  addAssociation: protectedProcedure
    .input(z.object({ contactId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(contactAssociations)
        .values({ contactId: input.contactId, userId: input.userId })
        .onConflictDoNothing();
      return { success: true };
    }),

  removeAssociation: protectedProcedure
    .input(z.object({ contactId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(contactAssociations)
        .where(
          and(
            eq(contactAssociations.contactId, input.contactId),
            eq(contactAssociations.userId, input.userId)
          )
        );
      return { success: true };
    }),

  // ─── Bulk Import ────────────────────────────────────────────

  bulkCreateContacts: protectedProcedure
    .input(
      z.object({
        contacts: z
          .array(
            z.object({
              name: z.string().min(1),
              email: z.string().email().optional(),
              phone: z.string().optional(),
            })
          )
          .min(1)
          .max(500),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const c of input.contacts) {
        try {
          // Dedupe by email if present
          if (c.email) {
            const existing = await ctx.db.query.contacts.findFirst({
              where: eq(contacts.email, c.email),
            });
            if (existing) {
              skipped++;
              continue;
            }
          }

          // Skip entries with no email (can't create without unique email)
          if (!c.email) {
            // If they have a phone, store with a placeholder email
            if (c.phone) {
              const placeholder = `phone-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@placeholder.local`;
              const [newContact] = await ctx.db
                .insert(contacts)
                .values({
                  name: c.name,
                  email: placeholder,
                  phone: c.phone,
                  firstSource: "manual",
                  status: "lead",
                  tags: input.tags ?? [],
                  addedBy: ctx.user.id,
                })
                .returning();
              if (newContact) {
                await Promise.all([
                  ctx.db.insert(contactSources).values({
                    contactId: newContact.id,
                    source: "manual",
                  }),
                  ctx.db.insert(contactAssociations).values({
                    contactId: newContact.id,
                    userId: ctx.user.id,
                  }),
                  ctx.db.insert(contactActivities).values({
                    contactId: newContact.id,
                    activityType: "contact_created",
                    source: "manual",
                    description: "Imported from phone contacts",
                  }),
                ]);
                created++;
              }
            } else {
              skipped++;
            }
            continue;
          }

          const [newContact] = await ctx.db
            .insert(contacts)
            .values({
              name: c.name,
              email: c.email,
              phone: c.phone ?? null,
              firstSource: "manual",
              status: "lead",
              tags: input.tags ?? [],
              addedBy: ctx.user.id,
            })
            .returning();

          if (newContact) {
            await Promise.all([
              ctx.db.insert(contactSources).values({
                contactId: newContact.id,
                source: "manual",
              }),
              ctx.db.insert(contactAssociations).values({
                contactId: newContact.id,
                userId: ctx.user.id,
              }),
              ctx.db.insert(contactActivities).values({
                contactId: newContact.id,
                activityType: "contact_created",
                source: "manual",
                description: "Imported from phone contacts",
              }),
            ]);
            created++;
          }
        } catch (err) {
          errors.push(`Failed to import ${c.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }

      return { created, skipped, errors };
    }),

  // ─── Voice Notes ────────────────────────────────────────────

  saveVoiceNote: protectedProcedure
    .input(
      z.object({
        contactId: z.number(),
        storagePath: z.string(),
        publicUrl: z.string(),
        durationSeconds: z.number().optional(),
        fileSizeBytes: z.number().optional(),
        mimeType: z.string().default("audio/webm"),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.id, input.contactId),
      });
      if (!contact) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
      }

      const [note] = await ctx.db
        .insert(voiceNotes)
        .values({
          contactId: input.contactId,
          recordedBy: ctx.user.id,
          storagePath: input.storagePath,
          publicUrl: input.publicUrl,
          durationSeconds: input.durationSeconds,
          fileSizeBytes: input.fileSizeBytes,
          mimeType: input.mimeType,
          label: input.label,
        })
        .returning();

      // Log activity
      await ctx.db.insert(contactActivities).values({
        contactId: input.contactId,
        activityType: "voice_note_added",
        description: input.label ?? "Voice note recorded",
      });

      return note;
    }),

  deleteVoiceNote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.query.voiceNotes.findFirst({
        where: eq(voiceNotes.id, input.id),
      });

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Voice note not found" });
      }

      // Delete from Supabase Storage
      const supabase = createAdminClient();
      await supabase.storage.from("voice-notes").remove([note.storagePath]);

      // Delete from DB
      await ctx.db.delete(voiceNotes).where(eq(voiceNotes.id, input.id));

      return { success: true };
    }),

  // ─── Community Tags ──────────────────────────────────────────

  getCommunityTags: protectedProcedure.query(async ({ ctx }) => {
    const allTags = await ctx.db
      .select()
      .from(communityTags)
      .orderBy(communityTags.displayOrder);

    // Count contacts per tag
    const counts = await ctx.db
      .select({
        communityTagId: contactCommunityTags.communityTagId,
        count: sql<number>`count(*)::int`,
      })
      .from(contactCommunityTags)
      .groupBy(contactCommunityTags.communityTagId);

    const countMap: Record<number, number> = {};
    for (const c of counts) countMap[c.communityTagId] = c.count;

    // Build tree structure
    type TagNode = (typeof allTags)[0] & {
      contactCount: number;
      children: TagNode[];
    };

    const nodeMap: Record<number, TagNode> = {};
    const roots: TagNode[] = [];

    for (const tag of allTags) {
      nodeMap[tag.id] = { ...tag, contactCount: countMap[tag.id] ?? 0, children: [] };
    }

    for (const tag of allTags) {
      const node = nodeMap[tag.id]!;
      if (tag.parentId && nodeMap[tag.parentId]) {
        nodeMap[tag.parentId]!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }),

  getCommunityTagsFlat: protectedProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db
      .select()
      .from(communityTags)
      .orderBy(communityTags.type, communityTags.displayOrder);
    return tags;
  }),

  createCommunityTag: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["community", "location"]).default("community"),
        description: z.string().optional(),
        color: z.string().optional(),
        parentId: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const [tag] = await ctx.db
        .insert(communityTags)
        .values({
          name: input.name,
          slug,
          type: input.type,
          description: input.description,
          color: input.color,
          parentId: input.parentId ?? null,
        })
        .returning();

      return tag;
    }),

  updateCommunityTag: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(["community", "location"]).optional(),
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        parentId: z.number().optional().nullable(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const data: Record<string, unknown> = {};

      if (updates.name !== undefined) {
        data.name = updates.name;
        data.slug = updates.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      if (updates.type !== undefined) data.type = updates.type;
      if (updates.description !== undefined) data.description = updates.description;
      if (updates.color !== undefined) data.color = updates.color;
      if (updates.parentId !== undefined) data.parentId = updates.parentId;
      if (updates.displayOrder !== undefined) data.displayOrder = updates.displayOrder;

      const [updated] = await ctx.db
        .update(communityTags)
        .set(data)
        .where(eq(communityTags.id, id))
        .returning();

      return updated;
    }),

  deleteCommunityTag: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(communityTags).where(eq(communityTags.id, input.id));
      return { success: true };
    }),

  assignContactCommunity: protectedProcedure
    .input(z.object({ contactId: z.number(), communityTagId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(contactCommunityTags)
        .values({
          contactId: input.contactId,
          communityTagId: input.communityTagId,
          taggedBy: "manual",
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  removeContactCommunity: protectedProcedure
    .input(z.object({ contactId: z.number(), communityTagId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(contactCommunityTags)
        .where(
          and(
            eq(contactCommunityTags.contactId, input.contactId),
            eq(contactCommunityTags.communityTagId, input.communityTagId)
          )
        );

      return { success: true };
    }),

  bulkAssignCommunity: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.number()).min(1),
        communityTagId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const values = input.contactIds.map((contactId) => ({
        contactId,
        communityTagId: input.communityTagId,
        taggedBy: "manual" as const,
      }));

      await ctx.db
        .insert(contactCommunityTags)
        .values(values)
        .onConflictDoNothing();

      return { success: true, count: input.contactIds.length };
    }),
});
