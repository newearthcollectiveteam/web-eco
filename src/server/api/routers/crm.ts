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
  questionnaireResponses,
  waitlistIntake,
  eventWaivers,
  voiceNotes,
  userProfiles,
} from "~/server/db/schema";
import { and, desc, eq, like, or, sql, inArray, isNotNull, type SQL } from "drizzle-orm";
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
        addedBy: z.string().optional(),
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

      if (input.addedBy) {
        conditions.push(eq(contacts.addedBy, input.addedBy));
      }

      if (input.search) {
        const s = `%${input.search}%`;
        const searchCond = or(like(contacts.email, s), like(contacts.name, s));
        if (searchCond) conditions.push(searchCond);
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(contacts)
          .where(where)
          .orderBy(desc(contacts.lastContactDate))
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

      // Batch load submission sources + addedBy names
      const addedByIds = [...new Set(rows.map((r) => r.addedBy).filter(Boolean))] as string[];
      const addedByMap: Record<string, string> = {};

      if (ids.length > 0) {
        const sources = await ctx.db
          .select({
            contactId: contactSources.contactId,
            source: contactSources.source,
          })
          .from(contactSources)
          .where(inArray(contactSources.contactId, ids));

        for (const s of sources) {
          if (!sourcesMap[s.contactId]) sourcesMap[s.contactId] = [];
          sourcesMap[s.contactId]!.push(s.source);
        }
      }

      if (addedByIds.length > 0) {
        const profiles = await ctx.db
          .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
          .from(userProfiles)
          .where(inArray(userProfiles.id, addedByIds));
        for (const p of profiles) {
          addedByMap[p.id] = p.fullName ?? p.email;
        }
      }

      const contactsWithSources = rows.map((c) => ({
        ...c,
        submissionSources: sourcesMap[c.id] ?? [c.firstSource],
        addedByName: c.addedBy ? (addedByMap[c.addedBy] ?? null) : null,
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

      const [qResponses, wIntakes, waivers, sources, activities, notes, addedByProfile] =
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
          // Added by profile
          contact.addedBy
            ? ctx.db.query.userProfiles.findFirst({
                where: eq(userProfiles.id, contact.addedBy),
              })
            : Promise.resolve(null),
        ]);

      return {
        contact,
        questionnaireResponses: qResponses,
        waitlistIntakes: wIntakes,
        eventWaivers: waivers,
        sources,
        activities,
        voiceNotes: notes,
        addedByProfile: addedByProfile ? { id: addedByProfile.id, fullName: addedByProfile.fullName, email: addedByProfile.email } : null,
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
    .input(z.object({ source: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const sourceFilter = input?.source;

      type LeadItem = {
        id: number;
        source: string;
        name: string;
        email: string;
        date: Date;
        preview: string;
        processed: boolean;
      };

      const results: LeadItem[] = [];

      // Waitlist submissions
      if (!sourceFilter || sourceFilter === "waitlist") {
        const waitlists = await ctx.db.query.waitlistIntake.findMany({
          orderBy: [desc(waitlistIntake.createdAt)],
        });
        for (const w of waitlists) {
          results.push({
            id: w.id,
            source: "waitlist",
            name: w.name,
            email: w.email,
            date: w.createdAt,
            preview: w.message?.slice(0, 100) ?? "",
            processed: w.processed,
          });
        }
      }

      // Questionnaire submissions
      if (!sourceFilter || sourceFilter === "questionnaire") {
        const questionnaires =
          await ctx.db.query.questionnaireResponses.findMany({
            orderBy: [desc(questionnaireResponses.createdAt)],
          });
        for (const q of questionnaires) {
          results.push({
            id: q.id,
            source: "questionnaire",
            name: q.name,
            email: q.email,
            date: q.createdAt,
            preview: q.primaryRole?.slice(0, 100) ?? "",
            processed: true, // questionnaires are always "processed"
          });
        }
      }

      // Event waivers
      if (!sourceFilter || sourceFilter === "event_waiver") {
        const waivers = await ctx.db.query.eventWaivers.findMany({
          orderBy: [desc(eventWaivers.signedAt)],
        });
        for (const w of waivers) {
          results.push({
            id: w.id,
            source: "event_waiver",
            name: w.signerName,
            email: w.signerEmail,
            date: w.signedAt,
            preview: `${w.eventName} — ${w.eventDate}`,
            processed: true,
          });
        }
      }

      // Sort all by date DESC
      results.sort((a, b) => b.date.getTime() - a.date.getTime());

      return results;
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

      // Create source record
      await ctx.db.insert(contactSources).values({
        contactId: newContact.id,
        source: input.source,
      });

      // Create activity
      await ctx.db.insert(contactActivities).values({
        contactId: newContact.id,
        activityType: "contact_created",
        source: input.source,
        description: `Contact created manually`,
      });

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

  getTeamMembersWhoAddedContacts: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        addedBy: contacts.addedBy,
      })
      .from(contacts)
      .where(isNotNull(contacts.addedBy))
      .groupBy(contacts.addedBy);

    const ids = rows.map((r) => r.addedBy).filter(Boolean) as string[];
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
                  firstSource: "phone_import",
                  status: "lead",
                  tags: input.tags ?? [],
                  addedBy: ctx.user.id,
                })
                .returning();
              if (newContact) {
                await ctx.db.insert(contactSources).values({
                  contactId: newContact.id,
                  source: "phone_import",
                });
                await ctx.db.insert(contactActivities).values({
                  contactId: newContact.id,
                  activityType: "contact_created",
                  source: "phone_import",
                  description: "Imported from phone contacts",
                });
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
              firstSource: "phone_import",
              status: "lead",
              tags: input.tags ?? [],
              addedBy: ctx.user.id,
            })
            .returning();

          if (newContact) {
            await ctx.db.insert(contactSources).values({
              contactId: newContact.id,
              source: "phone_import",
            });
            await ctx.db.insert(contactActivities).values({
              contactId: newContact.id,
              activityType: "contact_created",
              source: "phone_import",
              description: "Imported from phone contacts",
            });
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
});
