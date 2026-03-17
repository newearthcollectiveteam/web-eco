import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { contacts, contactActivities } from "~/server/db/schema";
import { Resend } from "resend";
import { reminderEmail } from "~/lib/email/templates";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getResend = () => new Resend(process.env.RESEND_API_KEY);

/**
 * Saves partial questionnaire progress and sends a reminder email.
 * Called client-side when a user navigates away after providing their email
 * but before submitting. Idempotent — won't spam if called multiple times
 * for the same email (checks metadata.abandonReminderSent).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { email, name, preferredName, screenIndex, referrer, refSource } =
      body as {
        email?: string;
        name?: string;
        preferredName?: string;
        screenIndex?: number;
        referrer?: string;
        refSource?: string;
      };

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Check if this contact already completed the questionnaire
    const existing = await db.query.contacts.findFirst({
      where: eq(contacts.email, email),
    });

    if (existing) {
      const meta = (existing.metadata as Record<string, unknown>) || {};
      // Already completed — don't send reminder
      if (meta.questionnaireCompleted) {
        return NextResponse.json({ status: "already_completed" });
      }
      // Already sent a reminder — don't spam
      if (meta.abandonReminderSent) {
        return NextResponse.json({ status: "reminder_already_sent" });
      }

      // Update existing contact with abandon metadata
      await db
        .update(contacts)
        .set({
          metadata: {
            ...meta,
            abandonReminderSent: true,
            abandonedAt: new Date().toISOString(),
            abandonedAtScreen: screenIndex,
            referrer: referrer || meta.referrer,
            refSource: refSource || meta.refSource,
          },
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, existing.id));

      // Log activity
      await db.insert(contactActivities).values({
        contactId: existing.id,
        activityType: "questionnaire_abandon",
        source: "questionnaire",
        description: `Abandoned questionnaire at screen ${screenIndex}`,
        metadata: { screenIndex, referrer, refSource },
      });
    } else {
      // Create new contact as lead with abandon metadata
      const [newContact] = await db
        .insert(contacts)
        .values({
          email,
          name: name || null,
          firstSource: "questionnaire",
          status: "lead",
          tags: ["questionnaire-abandoned"],
          metadata: {
            preferredName,
            abandonReminderSent: true,
            abandonedAt: new Date().toISOString(),
            abandonedAtScreen: screenIndex,
            referrer,
            refSource,
          },
        })
        .returning();

      await db.insert(contactActivities).values({
        contactId: newContact!.id,
        activityType: "questionnaire_abandon",
        source: "questionnaire",
        description: `Started questionnaire, abandoned at screen ${screenIndex}`,
        metadata: { screenIndex, referrer, refSource },
      });
    }

    // Build resume URL preserving referral params
    const resumeParams = new URLSearchParams();
    if (name) resumeParams.set("name", name);
    resumeParams.set("email", email);
    if (referrer) resumeParams.set("referrer", referrer);
    if (refSource) resumeParams.set("refSource", refSource);
    const resumeUrl = `https://joinnewearthcollective.com/questionnaire?${resumeParams.toString()}`;

    const displayName =
      preferredName || (name ? name.split(" ")[0] : null) || "there";

    // Send reminder email (non-blocking)
    getResend().emails
      .send({
        from: "New Earth Collective <noreply@joinnewearthcollective.com>",
        to: email,
        subject: "You're almost there!",
        html: reminderEmail(displayName, resumeUrl),
      })
      .catch((err) =>
        console.error("Resend abandon reminder email failed:", err)
      );

    return NextResponse.json({ status: "reminder_sent" });
  } catch (error) {
    console.error("Questionnaire abandon save failed:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
