/**
 * CRM Service
 * Manage contacts and activities in the master CRM database
 */

import { db } from "~/server/db";
import { contacts, contactActivities } from "~/server/db/schema";
import { eq, and, type SQL } from "drizzle-orm";

export interface CreateContactParams {
  email: string;
  name?: string;
  phone?: string;
  source: string; // Which form/page (e.g., "form-builder", "landing-1", "waitlist")
  status?: "lead" | "qualified" | "customer" | "inactive";
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateContactParams {
  name?: string;
  phone?: string;
  status?: "lead" | "qualified" | "customer" | "inactive";
  tags?: string[];
  metadata?: Record<string, unknown>;
  notes?: string;
}

export interface AddActivityParams {
  contactId: number;
  activityType:
    | "form_submission"
    | "email_sent"
    | "email_opened"
    | "email_clicked"
    | "note_added"
    | "status_changed";
  source?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create or update a contact in the master CRM
 * If contact exists (by email), updates it and returns existing contact
 * If contact is new, creates it
 */
export async function upsertContact(params: CreateContactParams): Promise<{
  contact: typeof contacts.$inferSelect;
  isNew: boolean;
}> {
  const { email, name, phone, source, status, tags, metadata } = params;

  // Check if contact already exists
  const existing = await db.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });

  if (existing) {
    // Update existing contact
    const updated = await db
      .update(contacts)
      .set({
        name: name || existing.name,
        phone: phone || existing.phone,
        status: status || existing.status,
        tags: tags || existing.tags,
        metadata: metadata
          ? { ...(existing.metadata as object), ...metadata }
          : existing.metadata,
        lastContactDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, existing.id))
      .returning();

    // Log activity
    await addContactActivity({
      contactId: existing.id,
      activityType: "form_submission",
      source,
      description: `Updated contact from ${source}`,
      metadata,
    });

    return {
      contact: updated[0]!,
      isNew: false,
    };
  } else {
    // Create new contact
    const newContact = await db
      .insert(contacts)
      .values({
        email,
        name: name || null,
        phone: phone || null,
        firstSource: source,
        status: status || "lead",
        tags: tags || [],
        metadata: metadata || null,
      })
      .returning();

    // Log activity
    await addContactActivity({
      contactId: newContact[0]!.id,
      activityType: "form_submission",
      source,
      description: `New contact from ${source}`,
      metadata,
    });

    return {
      contact: newContact[0]!,
      isNew: true,
    };
  }
}

/**
 * Get a contact by email
 */
export async function getContactByEmail(
  email: string
): Promise<typeof contacts.$inferSelect | undefined> {
  return db.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });
}

/**
 * Get a contact by ID
 */
export async function getContactById(
  id: number
): Promise<typeof contacts.$inferSelect | undefined> {
  return db.query.contacts.findFirst({
    where: eq(contacts.id, id),
  });
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: number,
  updates: UpdateContactParams
): Promise<typeof contacts.$inferSelect | undefined> {
  const updated = await db
    .update(contacts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId))
    .returning();

  return updated[0];
}

/**
 * Add an activity to a contact's timeline
 */
export async function addContactActivity(
  params: AddActivityParams
): Promise<void> {
  const { contactId, activityType, source, description, metadata } = params;

  await db.insert(contactActivities).values({
    contactId,
    activityType,
    source: source || null,
    description: description || null,
    metadata: metadata || null,
  });

  // Update lastContactDate
  await db
    .update(contacts)
    .set({ lastContactDate: new Date() })
    .where(eq(contacts.id, contactId));
}

/**
 * Get all activities for a contact
 */
export async function getContactActivities(
  contactId: number
): Promise<(typeof contactActivities.$inferSelect)[]> {
  return db.query.contactActivities.findMany({
    where: eq(contactActivities.contactId, contactId),
    orderBy: (activities, { desc }) => [desc(activities.createdAt)],
  });
}

/**
 * Get contact with their activity history
 */
export async function getContactWithActivities(contactId: number): Promise<{
  contact: typeof contacts.$inferSelect | undefined;
  activities: (typeof contactActivities.$inferSelect)[];
}> {
  const contact = await getContactById(contactId);
  const activities = contact ? await getContactActivities(contactId) : [];

  return { contact, activities };
}

/**
 * Search contacts by various criteria
 */
export async function searchContacts(params: {
  source?: string;
  status?: string;
  tag?: string;
  limit?: number;
}): Promise<(typeof contacts.$inferSelect)[]> {
  const { source, status, limit = 100 } = params;

  const conditions: SQL[] = [];

  if (source) {
    conditions.push(eq(contacts.firstSource, source));
  }

  if (status) {
    conditions.push(eq(contacts.status, status));
  }

  const results = await db
    .select()
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit);

  return results;
}
