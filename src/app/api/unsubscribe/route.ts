/**
 * Unsubscribe API
 * Handles unsubscribe requests from email/SMS links
 * Supports both email and SMS unsubscribes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { contacts, contactActivities } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Node.js runtime required for database access
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const type = searchParams.get("type") || "all"; // 'email' | 'sms' | 'all'

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    // Find contact by unsubscribe token
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.unsubscribeToken, token),
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Invalid unsubscribe token" },
        { status: 404 }
      );
    }

    // Update unsubscribe status based on type
    const updateData: {
      unsubscribedEmail?: boolean;
      unsubscribedSms?: boolean;
      unsubscribedAt: Date;
      updatedAt: Date;
    } = {
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    };

    if (type === "email" || type === "all") {
      updateData.unsubscribedEmail = true;
    }
    if (type === "sms" || type === "all") {
      updateData.unsubscribedSms = true;
    }

    await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, contact.id));

    // Log the unsubscribe activity
    await db.insert(contactActivities).values({
      contactId: contact.id,
      activityType: "unsubscribe",
      source: "unsubscribe-link",
      description: `Unsubscribed from ${type} communications`,
      metadata: {
        unsubscribeType: type,
        previousEmailConsent: contact.emailConsent,
        previousSmsConsent: contact.smsConsent,
      },
    });

    console.log(`✅ Contact ${contact.email} unsubscribed from ${type}`);

    // Return success page HTML
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - New Earth Collective</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(250, 207, 57, 0.2);
      border-radius: 12px;
      padding: 40px;
      backdrop-filter: blur(10px);
    }
    h1 {
      color: #facf39;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #d1d1d1;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .checkmark {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f3a51c, #f6c43f);
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>You've Been Unsubscribed</h1>
    <p>You have successfully unsubscribed from ${type === "all" ? "all" : type} communications from New Earth Collective.</p>
    <p style="font-size: 14px; color: #999;">We're sorry to see you go. If you change your mind, you can always re-subscribe by joining our waitlist again.</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error processing unsubscribe:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscribe request" },
      { status: 500 }
    );
  }
}
