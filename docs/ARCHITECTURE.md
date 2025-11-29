# CRM and Intake Forms Architecture

## Design Principles for Scalable Multi-Form CRM

### Core Pattern

Every intake form follows this pattern:

1. **Dedicated Intake Table** - Each form type gets its own table with form-specific fields
2. **Linked to Master CRM** - Foreign key to `contacts.id` with proper constraints
3. **Activity Logging** - Each submission creates an activity record
4. **Source Attribution** - Track which form/page generated the submission
5. **Processing Status** - Track whether the form has been processed into CRM

### Master CRM Tables

#### `contacts` - Master contact database
- Stores deduplicated contacts from ALL sources
- Uses `firstSource` to track initial acquisition channel
- Uses JSONB `metadata` only for truly dynamic/unpredictable fields
- Commonly needed fields get their own columns (not buried in metadata)

#### `contactActivities` - Interaction history
- Every form submission creates an activity record
- Tracks the complete timeline of contact interactions
- Uses `source` to identify which form/page
- Stores form-specific data in `metadata` that doesn't need to be queried frequently

#### `contactSources` - Multi-source tracking (NEW)
- Tracks ALL sources a contact has interacted with
- Solves the problem of contacts coming from multiple forms
- Enables reporting: "How many contacts came from BOTH waitlist AND event registration?"

### Intake Form Tables

Each intake form gets its own table following this template:

```typescript
export const [formName]Intake = createTable("[form_name]_intake", {
  // Identity
  id: serial("id").primaryKey(),

  // Foreign key to master CRM (with constraint)
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Common fields (present in ALL intake tables)
  source: varchar("source", { length: 100 }).notNull(),
  processed: boolean("processed").default(false).notNull(),

  // Form-specific fields (unique to this form)
  // ... add your custom fields here

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
```

### Data Flow for Form Submissions

1. **Receive form data** via API endpoint
2. **Create or update contact** in master CRM
   - If email exists: update with new data, update `lastContactDate`
   - If new: create with `firstSource` set to current form
3. **Create intake record** in form-specific table
   - Store all form data in dedicated columns
   - Link to contact via `contactId`
   - Mark as `processed: true`
4. **Log activity** in `contactActivities`
   - Record the interaction type
   - Store form-specific metadata
5. **Track source** in `contactSources` (if not already tracked)
6. **Trigger integrations** (Klaviyo, email, etc.) - non-blocking

### Benefits of This Approach

✅ **Referential Integrity** - Foreign keys prevent orphaned records
✅ **Query Performance** - Specific columns are indexed and fast to query
✅ **Multi-Source Tracking** - Full history of which forms each contact submitted
✅ **Scalability** - Easy pattern to replicate for new forms
✅ **Data Isolation** - Each form's specific data is cleanly separated
✅ **Reporting** - Can join across tables to answer complex questions
✅ **Audit Trail** - Complete history via activities table

### Example: Adding a New "Event Registration" Form

1. Create the table:
```typescript
export const eventRegistrationIntake = createTable("event_registration_intake", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Common fields
  source: varchar("source", { length: 100 }).notNull(),
  processed: boolean("processed").default(false).notNull(),

  // Event-specific fields
  eventId: integer("event_id").notNull(),
  ticketType: varchar("ticket_type", { length: 50 }),
  dietaryRestrictions: text("dietary_restrictions"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  attendeeCount: integer("attendee_count").default(1),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
```

2. Create the API endpoint following the same pattern as `/api/waitlist`
3. Migration automatically handles the new table
4. Queries work immediately with proper joins

### Schema Relationship Diagram

```
contacts (Master CRM)
    ↑ (contactId FK)
    ├── waitlistIntake
    ├── eventRegistrationIntake
    ├── volunteerSignupIntake
    ├── contactActivities
    └── contactSources

Each intake table → Creates activity → Updates contact
```

### Querying Examples

```typescript
// Find all contacts who submitted waitlist AND event registration
const multiFormContacts = await db
  .select()
  .from(contacts)
  .innerJoin(waitlistIntake, eq(contacts.id, waitlistIntake.contactId))
  .innerJoin(eventRegistrationIntake, eq(contacts.id, eventRegistrationIntake.contactId));

// Find all activities for a contact
const timeline = await db
  .select()
  .from(contactActivities)
  .where(eq(contactActivities.contactId, contactId))
  .orderBy(contactActivities.createdAt);

// Find all contacts from specific source
const waitlistContacts = await db
  .select()
  .from(contacts)
  .innerJoin(waitlistIntake, eq(contacts.id, waitlistIntake.contactId))
  .where(eq(waitlistIntake.source, "community-landing"));
```

### Migration Strategy

To improve the existing structure without breaking changes:

1. Add foreign key constraints to existing tables
2. Add `contactSources` table for multi-source tracking
3. Backfill `contactSources` from existing data
4. Update API endpoints to use new pattern
5. Add indexes for common query patterns

This can be done incrementally without downtime.
