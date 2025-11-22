/**
 * Form Submission API
 * Handles form submissions and schedules email sequences
 * Integrates with Master CRM to track all contacts
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { scheduleEmailSequence } from "~/lib/email/email-service";
import { getSequenceConfig } from "~/lib/email/sequences";
import { upsertContact, addContactActivity } from "~/lib/crm/crm-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      phone,
      message,
      sequenceName = "test-sequence",
      source = "form-builder",
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    console.log(`📧 Form submission from ${email} (${name})`);
    console.log(`📝 Message: ${message || "None"}`);
    console.log(`📬 Sequence: ${sequenceName}`);
    console.log(`📍 Source: ${source}`);

    // Get sequence configuration for response
    const sequenceConfig = getSequenceConfig(sequenceName);
    if (!sequenceConfig) {
      return NextResponse.json(
        { error: `Email sequence '${sequenceName}' not found` },
        { status: 400 }
      );
    }

    // Step 1: Create or update contact in master CRM
    const { contact, isNew } = await upsertContact({
      email,
      name,
      phone,
      source,
      status: "lead",
      tags: [sequenceName], // Tag with the sequence name
      metadata: {
        message,
        submittedAt: new Date().toISOString(),
      },
    });

    console.log(
      `${isNew ? "✨ New" : "🔄 Existing"} contact: ${contact.email} (ID: ${contact.id})`
    );

    // Step 2: Schedule the email sequence
    const result = await scheduleEmailSequence({
      sequenceName,
      recipientEmail: email,
      recipientName: name,
      contactId: contact.id, // Link emails to CRM contact
      templateData: {
        message,
        phone,
        submittedAt: new Date().toISOString(),
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to schedule email sequence" },
        { status: 500 }
      );
    }

    console.log(
      `✅ Successfully scheduled ${result.scheduledCount} emails for ${email}`
    );

    // Step 3: Log activity - sequence scheduled
    await addContactActivity({
      contactId: contact.id,
      activityType: "email_sent",
      source: sequenceName,
      description: `Email sequence "${sequenceName}" scheduled (${result.scheduledCount} emails)`,
      metadata: {
        sequenceName,
        scheduledCount: result.scheduledCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email sequence initiated for ${email}. You will receive ${result.scheduledCount} emails: ${sequenceConfig.description}`,
      contactId: contact.id,
      isNewContact: isNew,
      scheduledCount: result.scheduledCount,
      sequence: sequenceConfig.emails.map((e) => ({
        emailNumber: e.emailNumber,
        delay: e.delayMinutes === 0 ? "Immediate" : `${e.delayMinutes} minutes`,
        subject: e.subject,
      })),
    });
  } catch (error) {
    console.error("Error in form submission:", error);
    return NextResponse.json(
      { error: "Failed to process form submission" },
      { status: 500 }
    );
  }
}
