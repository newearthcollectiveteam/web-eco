/**
 * Waitlist API
 * Handles waitlist form submissions for the New Earth Collective community
 * Stores data in waitlist_intake table and creates/updates contact in master CRM
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import {
  waitlistIntake,
  contacts,
  contactActivities,
  contactSources,
  emailLinkClicks,
} from "~/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { triggerKlaviyoWaitlistFlow } from "~/lib/klaviyo/klaviyo-service";
import { identifyUser, trackEvent, markEmailClickConverted } from "~/lib/tracking/analytics-service";
import { COOKIE_NAMES, parseCookies, setCookieHeader, COOKIE_OPTIONS, generateAnonymousId } from "~/lib/tracking/utils";
import { generateUnsubscribeToken, getClientIP } from "~/lib/consent/consent-utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
      willingToFillQuestionnaire?: boolean;
      emailConsent?: boolean;
      smsConsent?: boolean;
      source?: string;
    };
    const {
      name,
      email,
      phone,
      message,
      willingToFillQuestionnaire = false,
      emailConsent = false,
      smsConsent = false,
      source = "community-landing",
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

    // Consent is implicit via form submission disclaimer
    // Both email and SMS consent are set to true by default

    console.log(`📋 Waitlist submission from ${email} (${name})`);

    // Get client IP for consent tracking
    const clientIP = getClientIP(request.headers);

    // Step 1: Create or update contact in master CRM
    let contactId: number;
    const existingContact = await db.query.contacts.findFirst({
      where: eq(contacts.email, email),
    });

    if (existingContact) {
      // Update existing contact
      const updateData: {
        name: string | undefined;
        phone: string | null | undefined;
        lastContactDate: Date;
        emailConsent?: boolean;
        smsConsent?: boolean;
        consentGrantedAt?: Date;
        consentIpAddress?: string | null;
        unsubscribeToken?: string;
        metadata: {
          waitlistMessage?: string;
          waitlistSource: string;
          willingToFillQuestionnaire: boolean;
        };
        updatedAt: Date;
      } = {
        name: name,
        phone: phone || existingContact.phone,
        lastContactDate: new Date(),
        metadata: {
          ...(existingContact.metadata as object),
          waitlistMessage: message,
          waitlistSource: source,
          willingToFillQuestionnaire,
        },
        updatedAt: new Date(),
      };

      // Update consent if provided and not previously unsubscribed
      if (emailConsent && !existingContact.unsubscribedEmail) {
        updateData.emailConsent = true;
      }
      if (smsConsent && !existingContact.unsubscribedSms) {
        updateData.smsConsent = true;
      }

      // Set consent tracking fields if consent was just granted
      if ((emailConsent || smsConsent) && !existingContact.consentGrantedAt) {
        updateData.consentGrantedAt = new Date();
        updateData.consentIpAddress = clientIP;
      }

      // Generate unsubscribe token if not exists
      if (!existingContact.unsubscribeToken) {
        updateData.unsubscribeToken = generateUnsubscribeToken();
      }

      await db
        .update(contacts)
        .set(updateData)
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
          tags: ["waitlist"],
          emailConsent,
          smsConsent,
          consentGrantedAt: new Date(),
          consentIpAddress: clientIP,
          unsubscribeToken: generateUnsubscribeToken(),
          metadata: {
            waitlistMessage: message,
            waitlistSource: source,
            willingToFillQuestionnaire,
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

    console.log(`📊 Source tracked: ${source}`);

    // Step 2.5: Link anonymous visitor to contact (identify user)
    const cookies = parseCookies(request.headers.get('cookie'));
    const anonymousId = cookies[COOKIE_NAMES.ANONYMOUS_ID] || generateAnonymousId();
    const sessionId = cookies[COOKIE_NAMES.SESSION_ID];

    await identifyUser({
      anonymousId,
      contactId,
      source: 'waitlist',
    });
    console.log(`🔗 Linked anonymous ID ${anonymousId} to contact ${contactId}`);

    // Step 3: Store in waitlist intake table
    const [waitlistEntry] = await db
      .insert(waitlistIntake)
      .values({
        contactId,
        name,
        email,
        phone,
        message,
        willingToFillQuestionnaire,
        source,
        processed: true, // Mark as processed since we already created the contact
      })
      .returning();

    console.log(`✅ Waitlist entry created (ID: ${waitlistEntry!.id})`);

    // Step 4: Log activity
    await db.insert(contactActivities).values({
      contactId,
      activityType: "waitlist_signup",
      source,
      description: `Joined waitlist via ${source}`,
      metadata: {
        message,
        willingToFillQuestionnaire,
        waitlistEntryId: waitlistEntry!.id,
      },
    });

    console.log(`📝 Activity logged for contact ${contactId}`);

    // Step 4.5: Track form submission event
    await trackEvent(
      {
        sessionId,
        anonymousId,
        contactId,
      },
      {
        eventType: 'form_submit',
        eventName: 'Waitlist Signup',
        domain: request.headers.get('host') || undefined,
        path: '/api/waitlist',
        properties: {
          formType: 'waitlist',
          willingToFillQuestionnaire,
          source,
        },
      }
    );
    console.log(`📊 Form submission event tracked`);

    // Step 4.6: Mark any recent email click as converted
    const recentClick = await db.query.emailLinkClicks.findFirst({
      where: eq(emailLinkClicks.contactId, contactId),
      orderBy: [desc(emailLinkClicks.clickedAt)],
    });
    if (recentClick) {
      await markEmailClickConverted({
        emailLinkId: recentClick.emailLinkId,
        contactId,
        formType: 'waitlist',
      });
    }

    // Step 5: Klaviyo Integration (non-blocking)
    // Trigger Klaviyo flow - don't await to avoid blocking the response
    triggerKlaviyoWaitlistFlow({
      email,
      name,
      phone: phone || "",
      message: message || "",
      willingToFillQuestionnaire,
      source,
    }).catch((error) => {
      // Log error but don't fail the request
      console.error("⚠️  Klaviyo trigger failed (non-critical):", error);
    });

    const response = NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
      contactId,
      waitlistId: waitlistEntry!.id,
    });

    // Set contact ID cookie for future tracking
    response.headers.append(
      'Set-Cookie',
      setCookieHeader(
        COOKIE_NAMES.CONTACT_ID,
        contactId.toString(),
        COOKIE_OPTIONS.contactId
      )
    );

    return response;
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
