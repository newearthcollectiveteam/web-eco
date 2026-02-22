# Template for Adding New Intake Forms

This guide shows you how to add a new intake form to the system following the established pattern.

## Step 1: Add Table to Schema

In `src/server/db/schema.ts`, add your new intake table:

```typescript
/**
 * [Form Name] Intake - [Description of what this form collects]
 */
export const [formName]Intake = createTable("[form_name]_intake", {
  id: serial("id").primaryKey(),

  // Foreign key to master CRM (REQUIRED)
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Common fields (REQUIRED for all intake forms)
  source: varchar("source", { length: 100 }).notNull(),
  processed: boolean("processed").default(false).notNull(),

  // Form-specific fields (customize these)
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  // ... add your custom fields here

  // Timestamps (REQUIRED)
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
```

## Step 2: Create API Endpoint

Create a file at `src/app/api/[form-name]/route.ts`:

```typescript
/**
 * [Form Name] API
 * Handles form submissions for [purpose]
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import {
  [formName]Intake,
  contacts,
  contactActivities,
  contactSources,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { triggerKlaviyoFlow } from "~/lib/klaviyo/klaviyo-service"; // Optional

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      // ... your custom fields
      source = "default-source",
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    console.log(`📋 [Form Name] submission from ${email} (${name})`);

    // Step 1: Create or update contact in master CRM
    let contactId: number;
    const existingContact = await db.query.contacts.findFirst({
      where: eq(contacts.email, email),
    });

    if (existingContact) {
      // Update existing contact
      await db
        .update(contacts)
        .set({
          name: name,
          phone: phone || existingContact.phone,
          lastContactDate: new Date(),
          // Add any form-specific data to metadata if needed
          metadata: {
            ...(existingContact.metadata as object),
            // ... your custom metadata
          },
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, existingContact.id));

      contactId = existingContact.id;
      console.log(`🔄 Updated existing contact (ID: ${contactId})`);
    } else {
      // Create new contact
      const [newContact] = await db
        .insert(contacts)
        .values({
          email,
          name,
          phone,
          firstSource: source,
          status: "lead",
          tags: ["[your-tag]"], // Customize tag
          metadata: {
            // ... your custom metadata
          },
        })
        .returning();

      contactId = newContact!.id;
      console.log(`✨ Created new contact (ID: ${contactId})`);
    }

    // Step 2: Track this source for the contact
    await db
      .insert(contactSources)
      .values({
        contactId,
        source,
        firstInteraction: new Date(),
        lastInteraction: new Date(),
        interactionCount: 1,
      })
      .onConflictDoUpdate({
        target: [contactSources.contactId, contactSources.source],
        set: {
          lastInteraction: new Date(),
          interactionCount: sql`${contactSources.interactionCount} + 1`,
          updatedAt: new Date(),
        },
      });

    // Step 3: Store in form-specific intake table
    const [intakeEntry] = await db
      .insert([formName]Intake)
      .values({
        contactId,
        name,
        email,
        phone,
        // ... your custom fields
        source,
        processed: true,
      })
      .returning();

    console.log(`✅ [Form Name] entry created (ID: ${intakeEntry!.id})`);

    // Step 4: Log activity
    await db.insert(contactActivities).values({
      contactId,
      activityType: "[form_name]_submission",
      source,
      description: `Submitted [form name] via ${source}`,
      metadata: {
        // ... your custom activity metadata
        intakeEntryId: intakeEntry!.id,
      },
    });

    console.log(`📝 Activity logged for contact ${contactId}`);

    // Step 5: Optional - Klaviyo Integration (non-blocking)
    // triggerKlaviyoFlow({
    //   email,
    //   name,
    //   // ... your custom fields
    // }).catch((error) => {
    //   console.error("⚠️  Klaviyo trigger failed (non-critical):", error);
    // });

    return NextResponse.json({
      success: true,
      message: "Successfully submitted [form name]!",
      contactId,
      intakeId: intakeEntry!.id,
    });
  } catch (error) {
    console.error("Error processing [form name] submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process submission. Please try again.",
      },
      { status: 500 }
    );
  }
}
```

## Step 3: Generate and Run Migration

```bash
# Generate migration from schema changes
npm run db:generate

# Review the generated migration in drizzle/migrations/

# Apply the migration
npm run db:migrate

# Or push directly to dev database
npm run db:push
```

## Step 4: Create tRPC Router (Optional)

If you need to query intake form data, create a tRPC router:

```typescript
// src/server/api/routers/[formName].ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { [formName]Intake } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const [formName]Router = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.[formName]Intake.findMany({
      orderBy: (intake, { desc }) => [desc(intake.createdAt)],
    });
  }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.[formName]Intake.findMany({
        where: eq([formName]Intake.email, input.email),
      });
    }),
});
```

Then add it to `src/server/api/root.ts`:

```typescript
import { [formName]Router } from "~/server/api/routers/[formName]";

export const appRouter = createTRPCRouter({
  post: postRouter,
  gallery: galleryRouter,
  [formName]: [formName]Router, // Add this line
});
```

## Step 5: Test Your Implementation

1. **Test API endpoint**:

```bash
curl -X POST http://localhost:3000/api/[form-name] \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "source": "test-page"
  }'
```

2. **Verify in database**:

```bash
npm run db:studio
```

Check these tables:

- `web-eco_contact` - Contact created/updated
- `web-eco_contact_source` - Source tracked
- `web-eco_contact_activity` - Activity logged
- `web-eco_[form_name]_intake` - Form data stored

## Common Query Patterns

### Find all contacts who submitted a specific form

```typescript
const formContacts = await db
  .select()
  .from(contacts)
  .innerJoin([formName]Intake, eq(contacts.id, [formName]Intake.contactId));
```

### Find contacts who submitted multiple forms

```typescript
const multiFormContacts = await db
  .select({
    contact: contacts,
    sourceCount: sql<number>`count(distinct ${contactSources.source})`,
  })
  .from(contacts)
  .innerJoin(contactSources, eq(contacts.id, contactSources.contactId))
  .groupBy(contacts.id)
  .having(sql`count(distinct ${contactSources.source}) > 1`);
```

### Get complete timeline for a contact

```typescript
const timeline = await db
  .select()
  .from(contactActivities)
  .where(eq(contactActivities.contactId, contactId))
  .orderBy(desc(contactActivities.createdAt));
```

## Checklist

- [ ] Schema table added with proper foreign keys
- [ ] API endpoint created following pattern
- [ ] Migration generated and applied
- [ ] Tested with sample data
- [ ] Verified all 4 tables are updated:
  - [ ] contacts (created/updated)
  - [ ] contactSources (tracked)
  - [ ] contactActivities (logged)
  - [ ] [formName]Intake (stored)
- [ ] tRPC router created (if needed)
- [ ] Frontend form component created
- [ ] Error handling tested
- [ ] Klaviyo integration configured (if applicable)

## Benefits

✅ **Referential Integrity** - Foreign keys prevent orphaned data
✅ **Multi-Source Tracking** - Full history of which forms each contact submitted
✅ **Consistent Pattern** - Easy to maintain and extend
✅ **Query Flexibility** - Can join across tables for complex reports
✅ **Scalability** - Add unlimited forms without changing core structure
