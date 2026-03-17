# Pattern: CRM Pipeline Management

## Problem

You need to track contacts from multiple inbound sources (forms, referrals, imports) through a sales pipeline, with the ability to promote contacts to full clients and demote them back — keeping all systems in sync.

## When to Use

- B2B apps that manage leads, prospects, and clients
- Apps with multiple inbound contact sources (forms, waitlists, referrals)
- Any system needing a status-based workflow with promotion/demotion
- When CRM records need to stay in sync with portal/client records

## When NOT to Use

- B2C apps with self-serve signup (no sales pipeline needed)
- Simple contact forms with no lifecycle management
- Apps where all users have equal status

## Pattern

### Pipeline Status Flow

```
  lead → prospect → client → inactive
    │        │                    │
    └────────┴────────────────────┘
              ↓
           churned
```

```typescript
// Schema
export const masterCrm = pgTable("master_crm", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  phone: text("phone"),
  source: text("source", {
    enum: ["contact_form", "waitlist", "referral", "manual"],
  }).notNull(),
  status: text("status", {
    enum: ["lead", "prospect", "client", "inactive", "churned"],
  })
    .notNull()
    .default("lead"),
  accountManagerId: uuid("account_manager_id").references(() => users.id),
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

### Multi-Source Contact Enrichment

Contacts may come from multiple forms/sources. Enrich each contact with their submission history using batch lookups.

```typescript
getContacts: adminProcedure
  .input(z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input }) => {
    // 1. Fetch contacts with filters
    const contactRows = await db.select().from(masterCrm)
      .where(buildConditions(input))
      .orderBy(desc(masterCrm.lastContactAt))
      .limit(input.limit).offset(input.offset);

    const contactIds = contactRows.map(c => c.id);
    if (contactIds.length === 0) return { contacts: [], total: 0 };

    // 2. Batch lookup across all submission sources (parallel)
    const [formAIds, formBIds, waitlistIds, linkedClients] = await Promise.all([
      db.select({ crmId: formA.crmId }).from(formA)
        .where(inArray(formA.crmId, contactIds)).groupBy(formA.crmId),
      db.select({ crmId: formB.crmId }).from(formB)
        .where(inArray(formB.crmId, contactIds)).groupBy(formB.crmId),
      db.select({ crmId: waitlist.crmId }).from(waitlist)
        .where(inArray(waitlist.crmId, contactIds)).groupBy(waitlist.crmId),
      db.select({ crmId: clients.crmId, id: clients.id, slug: clients.slug })
        .from(clients).where(inArray(clients.crmId, contactIds)),
    ]);

    // 3. Build lookup sets for O(1) enrichment
    const formASet = new Set(formAIds.map(r => r.crmId));
    const formBSet = new Set(formBIds.map(r => r.crmId));
    const waitlistSet = new Set(waitlistIds.map(r => r.crmId));
    const clientMap = new Map(linkedClients.map(c => [c.crmId, c]));

    // 4. Enrich each contact
    return {
      contacts: contactRows.map(contact => ({
        ...contact,
        sources: [
          formASet.has(contact.id) && "Contact Form",
          formBSet.has(contact.id) && "Partner Form",
          waitlistSet.has(contact.id) && "Waitlist",
        ].filter(Boolean),
        linkedClient: clientMap.get(contact.id) ?? null,
      })),
      total: totalResult[0]?.count ?? 0,
    };
  }),
```

### Atomic Promotion (CRM → Client)

When a contact becomes a client, create the client record and update CRM status in one operation.

```typescript
promoteToClient: adminProcedure
  .input(z.object({
    crmId: z.string().uuid(),
    slug: z.string().min(1),
    company: z.string().optional(),
    accountManagerId: z.string().uuid().nullable().optional(),
  }))
  .mutation(async ({ input }) => {
    // 1. Fetch CRM contact
    const contact = await db.select().from(masterCrm)
      .where(eq(masterCrm.id, input.crmId)).limit(1);
    if (!contact[0]) throw new Error("Contact not found");

    // 2. Guard against duplicates
    const existing = await db.select({ id: clients.id }).from(clients)
      .where(eq(clients.email, contact[0].email)).limit(1);
    if (existing[0]) throw new Error("Client with this email already exists");

    // 3. Create client record (linked back to CRM via crmId)
    const [newClient] = await db.insert(clients).values({
      crmId: input.crmId,
      name: contact[0].name,
      email: contact[0].email,
      slug: input.slug,
      company: input.company ?? contact[0].company,
      accountManagerId: input.accountManagerId ?? contact[0].accountManagerId,
    }).returning();

    // 4. Update CRM status
    await db.update(masterCrm)
      .set({ status: "client", updatedAt: new Date() })
      .where(eq(masterCrm.id, input.crmId));

    return newClient;
  }),
```

### Demotion with Cascade Cleanup

When a client is demoted, handle the linked records (archive or remove).

```typescript
demoteClient: adminProcedure
  .input(z.object({
    crmId: z.string().uuid(),
    newStatus: z.enum(["lead", "prospect", "inactive", "churned"]),
    portalAction: z.enum(["archive", "remove"]),
  }))
  .mutation(async ({ input }) => {
    // 1. Find linked client
    const linkedClient = await db.select({ id: clients.id }).from(clients)
      .where(eq(clients.crmId, input.crmId)).limit(1);

    // 2. Handle portal cleanup based on user choice
    if (linkedClient[0]) {
      if (input.portalAction === "archive") {
        await db.update(clients)
          .set({ status: "inactive", updatedAt: new Date() })
          .where(eq(clients.id, linkedClient[0].id));
      } else {
        await db.delete(clients)
          .where(eq(clients.id, linkedClient[0].id));
      }
    }

    // 3. Update CRM status
    const [updated] = await db.update(masterCrm)
      .set({ status: input.newStatus, updatedAt: new Date() })
      .where(eq(masterCrm.id, input.crmId))
      .returning();

    return updated;
  }),
```

### Bidirectional Sync

Sync existing client records back to CRM (useful after initial CRM setup or imports).

```typescript
syncClientsToCrm: adminProcedure.mutation(async () => {
  const allClients = await db.select().from(clients);
  let linked = 0, created = 0;

  for (const client of allClients) {
    if (client.crmId) continue; // Already linked

    // Try to find existing CRM record by email
    const existing = await db.select().from(masterCrm)
      .where(eq(masterCrm.email, client.email)).limit(1);

    if (existing[0]) {
      // Link existing CRM record
      await db.update(clients)
        .set({ crmId: existing[0].id }).where(eq(clients.id, client.id));
      linked++;
    } else {
      // Create new CRM record
      const [newCrm] = await db.insert(masterCrm).values({
        name: client.name,
        email: client.email,
        company: client.company,
        source: "portal",
        status: "client",
      }).returning();
      await db.update(clients)
        .set({ crmId: newCrm!.id }).where(eq(clients.id, client.id));
      created++;
    }
  }

  return { linked, created };
}),
```

## Key Decisions

1. **CRM is the master record** — Clients link back via `crmId`. CRM always has the full contact history.
2. **Promotion creates, demotion cleans up** — Promotion is additive (new client record). Demotion asks the user whether to archive or remove.
3. **Batch enrichment with Sets/Maps** — Parallel queries + O(1) lookups. Never N+1 query per contact.
4. **Bidirectional sync** — CRM → Client (promote) and Client → CRM (sync) keep both systems aligned.
5. **Account manager assignment** — Contacts can be assigned to team members at any pipeline stage.

## Advanced: Upsert Service with Activity Timeline

For community/B2C CRMs where contacts come from many forms, use a service layer with email-based dedup and automatic activity logging:

```typescript
export async function upsertContact(params: {
  email: string;
  name?: string;
  phone?: string;
  source: string;
  status?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): Promise<{ contact: Contact; isNew: boolean }> {
  const existing = await db.query.contacts.findFirst({
    where: eq(contacts.email, params.email),
  });

  if (existing) {
    // Merge — don't overwrite existing data with nulls
    const updated = await db
      .update(contacts)
      .set({
        name: params.name || existing.name,
        phone: params.phone || existing.phone,
        metadata: params.metadata
          ? { ...(existing.metadata as object), ...params.metadata }
          : existing.metadata,
        lastContactDate: new Date(),
      })
      .where(eq(contacts.id, existing.id))
      .returning();

    await addActivity({
      contactId: existing.id,
      type: "form_submission",
      source: params.source,
    });
    return { contact: updated[0]!, isNew: false };
  }

  const [newContact] = await db
    .insert(contacts)
    .values({
      email: params.email,
      name: params.name ?? null,
      firstSource: params.source,
      status: params.status ?? "lead",
      tags: params.tags ?? [],
    })
    .returning();

  await addActivity({
    contactId: newContact!.id,
    type: "form_submission",
    source: params.source,
  });
  return { contact: newContact!, isNew: true };
}
```

### Multi-Source Tracking Table

Track every form a contact interacted with (not just the first):

```typescript
export const contactSources = createTable(
  "contact_source",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 100 }).notNull(),
    firstInteraction: timestamp("first_interaction")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastInteraction: timestamp("last_interaction")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    interactionCount: integer("interaction_count").default(1).notNull(),
  },
  (t) => [unique("unique_contact_source").on(t.contactId, t.source)]
);
```

### GDPR-Compliant Consent Tracking

```typescript
emailConsent: boolean("email_consent").default(false).notNull(),
smsConsent: boolean("sms_consent").default(false).notNull(),
consentGrantedAt: timestamp("consent_granted_at", { withTimezone: true }),
consentIpAddress: varchar("consent_ip_address", { length: 45 }),
unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).unique(),
unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
```

### Activity Timeline

Every contact interaction creates a record:

```typescript
export const contactActivities = createTable("contact_activity", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // form_submission, note_added, email_sent, status_changed
  source: varchar("source", { length: 100 }),
  description: text("description"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
```

## Related Patterns

- `auth-role-hierarchy.md` — Role-based access for CRM (admins only)
- `api-external-linking.md` — Linking CRM records to external service IDs
- `state-dynamic-enums.md` — Dynamic status columns for pipeline customization
