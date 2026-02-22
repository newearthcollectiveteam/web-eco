# Example: Event Registration Intake Form

This is a complete example showing how to add an event registration form to the system.

## Schema Addition

Add to `src/server/db/schema.ts`:

```typescript
/**
 * Event Registration Intake - Collects registration data for community events
 */
export const eventRegistrationIntake = createTable(
  "event_registration_intake",
  {
    id: serial("id").primaryKey(),

    // Foreign key to master CRM
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),

    // Common fields (required for all intake forms)
    source: varchar("source", { length: 100 }).notNull(),
    processed: boolean("processed").default(false).notNull(),

    // Basic contact fields
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),

    // Event-specific fields
    eventSlug: varchar("event_slug", { length: 100 }).notNull(), // Which event they're registering for
    ticketType: varchar("ticket_type", { length: 50 }).notNull(), // general, vip, volunteer, etc.
    attendeeCount: integer("attendee_count").default(1).notNull(),
    dietaryRestrictions: text("dietary_restrictions"),
    specialNeeds: text("special_needs"),
    emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
    howDidYouHear: varchar("how_did_you_hear", { length: 100 }), // marketing attribution

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);
```

## API Endpoint

Create `src/app/api/event-registration/route.ts`:

```typescript
/**
 * Event Registration API
 * Handles event registration form submissions for community events
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import {
  eventRegistrationIntake,
  contacts,
  contactActivities,
  contactSources,
} from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      eventSlug,
      ticketType = "general",
      attendeeCount = 1,
      dietaryRestrictions,
      specialNeeds,
      emergencyContactName,
      emergencyContactPhone,
      howDidYouHear,
      source = "event-page",
    } = body;

    // Validate required fields
    if (!name || !email || !eventSlug) {
      return NextResponse.json(
        { error: "Name, email, and event are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    console.log(`🎟️  Event registration from ${email} for ${eventSlug}`);

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
          metadata: {
            ...(existingContact.metadata as object),
            lastEventRegistered: eventSlug,
            preferredTicketType: ticketType,
            dietaryRestrictions: dietaryRestrictions || undefined,
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
          tags: ["event-attendee", eventSlug],
          metadata: {
            lastEventRegistered: eventSlug,
            preferredTicketType: ticketType,
            dietaryRestrictions: dietaryRestrictions || undefined,
            howDidYouHear: howDidYouHear || undefined,
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
        source: `event-registration:${eventSlug}`,
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

    // Step 3: Store in event registration table
    const [registrationEntry] = await db
      .insert(eventRegistrationIntake)
      .values({
        contactId,
        name,
        email,
        phone,
        eventSlug,
        ticketType,
        attendeeCount,
        dietaryRestrictions,
        specialNeeds,
        emergencyContactName,
        emergencyContactPhone,
        howDidYouHear,
        source,
        processed: true,
      })
      .returning();

    console.log(`✅ Event registration created (ID: ${registrationEntry!.id})`);

    // Step 4: Log activity
    await db.insert(contactActivities).values({
      contactId,
      activityType: "event_registration",
      source,
      description: `Registered for event: ${eventSlug} (${ticketType} ticket)`,
      metadata: {
        eventSlug,
        ticketType,
        attendeeCount,
        registrationId: registrationEntry!.id,
      },
    });

    console.log(`📝 Activity logged for contact ${contactId}`);

    // Step 5: Send confirmation email (example)
    // await sendEventConfirmationEmail({
    //   email,
    //   name,
    //   eventSlug,
    //   ticketType,
    // }).catch((error) => {
    //   console.error("⚠️  Email send failed (non-critical):", error);
    // });

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event!",
      contactId,
      registrationId: registrationEntry!.id,
    });
  } catch (error) {
    console.error("Error processing event registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
```

## Benefits Demonstrated

### 1. Multi-Form Contact Tracking

A contact can now:

- Submit the waitlist form
- Register for multiple events
- Each interaction is tracked in `contactSources`

Example query to find contacts who did BOTH:

```typescript
const activeContacts = await db
  .select({
    email: contacts.email,
    name: contacts.name,
    sources: sql<string[]>`array_agg(${contactSources.source})`,
  })
  .from(contacts)
  .innerJoin(contactSources, eq(contacts.id, contactSources.contactId))
  .groupBy(contacts.id, contacts.email, contacts.name)
  .having(sql`count(distinct ${contactSources.source}) > 1`);
```

### 2. Event-Specific Queries

Find all registrations for a specific event:

```typescript
const eventAttendees = await db
  .select({
    contact: contacts,
    registration: eventRegistrationIntake,
  })
  .from(eventRegistrationIntake)
  .innerJoin(contacts, eq(eventRegistrationIntake.contactId, contacts.id))
  .where(eq(eventRegistrationIntake.eventSlug, "summer-gathering-2025"));
```

### 3. Dietary Restrictions Report

```typescript
const dietaryNeeds = await db
  .select({
    name: eventRegistrationIntake.name,
    email: eventRegistrationIntake.email,
    restrictions: eventRegistrationIntake.dietaryRestrictions,
    attendeeCount: eventRegistrationIntake.attendeeCount,
  })
  .from(eventRegistrationIntake)
  .where(
    and(
      eq(eventRegistrationIntake.eventSlug, "summer-gathering-2025"),
      sql`${eventRegistrationIntake.dietaryRestrictions} IS NOT NULL`
    )
  );
```

### 4. Marketing Attribution

Track how people heard about your events:

```typescript
const attributionReport = await db
  .select({
    source: eventRegistrationIntake.howDidYouHear,
    count: sql<number>`count(*)`,
  })
  .from(eventRegistrationIntake)
  .where(eq(eventRegistrationIntake.eventSlug, "summer-gathering-2025"))
  .groupBy(eventRegistrationIntake.howDidYouHear);
```

### 5. Contact Journey View

See a contact's complete interaction history:

```typescript
async function getContactJourney(email: string) {
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });

  if (!contact) return null;

  const [activities, sources, waitlistEntries, eventRegistrations] =
    await Promise.all([
      db.query.contactActivities.findMany({
        where: eq(contactActivities.contactId, contact.id),
        orderBy: (activity, { desc }) => [desc(activity.createdAt)],
      }),
      db.query.contactSources.findMany({
        where: eq(contactSources.contactId, contact.id),
      }),
      db.query.waitlistIntake.findMany({
        where: eq(waitlistIntake.contactId, contact.id),
      }),
      db.query.eventRegistrationIntake.findMany({
        where: eq(eventRegistrationIntake.contactId, contact.id),
      }),
    ]);

  return {
    contact,
    activities,
    sources,
    waitlistEntries,
    eventRegistrations,
  };
}
```

## What This Enables

✅ **Multi-touchpoint tracking** - See all interactions across all forms
✅ **Event analytics** - Report on registrations, dietary needs, ticket types
✅ **Marketing attribution** - Track which channels drive registrations
✅ **Segmentation** - Target contacts based on event attendance
✅ **Referential integrity** - No orphaned records, cascading deletes
✅ **Scalability** - Easy to add more event-related features

## Next Forms You Might Add

Following this same pattern, you could add:

- `volunteerSignupIntake` - Volunteer applications
- `donationIntake` - Donation/contribution forms
- `feedbackIntake` - Feedback and survey submissions
- `resourceRequestIntake` - Resource or support requests
- `communityApplicationIntake` - Full community membership applications

Each one gets its own table, follows the same pattern, and integrates seamlessly with the master CRM.
