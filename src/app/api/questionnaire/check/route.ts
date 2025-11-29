/**
 * Questionnaire Check API
 * Checks if a contact has already completed the questionnaire
 * Used to prevent duplicate submissions
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { contacts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Node.js runtime required for database access
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const email = searchParams.get("email");

    if (!contactId && !email) {
      return NextResponse.json(
        { error: "Either contactId or email is required" },
        { status: 400 }
      );
    }

    // Lookup contact
    let contact;
    if (contactId) {
      contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, parseInt(contactId)),
      });
    } else if (email) {
      contact = await db.query.contacts.findFirst({
        where: eq(contacts.email, email),
      });
    }

    if (!contact) {
      return NextResponse.json({
        completed: false,
        message: "Contact not found",
      });
    }

    // Check if questionnaire is completed (stored in metadata)
    const metadata = contact.metadata as { questionnaireCompleted?: boolean; questionnaireCompletedAt?: string } | null;
    const completed = metadata?.questionnaireCompleted === true;

    return NextResponse.json({
      completed,
      completedAt: metadata?.questionnaireCompletedAt || null,
      contactId: contact.id,
      name: contact.name,
      email: contact.email,
    });
  } catch (error) {
    console.error("Error checking questionnaire status:", error);
    return NextResponse.json(
      { error: "Failed to check questionnaire status" },
      { status: 500 }
    );
  }
}
