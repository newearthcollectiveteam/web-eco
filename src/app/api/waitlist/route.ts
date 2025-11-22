/**
 * Waitlist API
 * Handles waitlist form submissions for the New Earth Collective community
 * Stores data in waitlist_intake table and creates/updates contact in master CRM
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { waitlistIntake, contacts, contactActivities } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, source = "community-landing" } = body;

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

    console.log(`📋 Waitlist submission from ${email} (${name})`);

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
            waitlistMessage: message,
            waitlistSource: source,
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
          source,
          status: "lead",
          tags: ["waitlist"],
          metadata: {
            waitlistMessage: message,
            waitlistSource: source,
          },
        })
        .returning();

      contactId = newContact!.id;
      console.log(`✨ Created new contact (ID: ${contactId})`);
    }

    // Step 2: Store in waitlist intake table
    const [waitlistEntry] = await db
      .insert(waitlistIntake)
      .values({
        name,
        email,
        phone,
        message,
        source,
        contactId,
        processed: true, // Mark as processed since we already created the contact
      })
      .returning();

    console.log(`✅ Waitlist entry created (ID: ${waitlistEntry!.id})`);

    // Step 3: Log activity
    await db.insert(contactActivities).values({
      contactId,
      activityType: "waitlist_signup",
      source,
      description: `Joined waitlist via ${source}`,
      metadata: {
        message,
        waitlistEntryId: waitlistEntry!.id,
      },
    });

    console.log(`📝 Activity logged for contact ${contactId}`);

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
      contactId,
      waitlistId: waitlistEntry!.id,
    });
  } catch (error) {
    console.error("Error processing waitlist submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process waitlist submission. Please try again.",
      },
      { status: 500 }
    );
  }
}
