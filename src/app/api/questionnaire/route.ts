import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "~/server/db";
import {
  contacts,
  contactActivities,
  contactSources,
  questionnaireResponses,
} from "~/server/db/schema";
import {
  COOKIE_NAMES,
  COOKIE_OPTIONS,
  parseCookies,
  setCookieHeader,
} from "~/lib/tracking/utils";
import { identifyUser, trackEvent } from "~/lib/tracking/analytics-service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    type QuestionnairePayload = {
      name?: string;
      email?: string;
      phone?: string;
      contactId?: string;
      discovery?: string[];
      discoveryDetails?: string;
      intention?: string[];
      intentionDetails?: string;
      newEarthMeaning?: string;
      nervousSystems?: string;
      sovereignty?: string;
      innerWork?: string[];
      innerWorkOther?: string;
      authenticityStory?: string;
      triggerResponse?: string;
      activeWound?: string;
      accountability?: string;
      gift?: string;
      commitment?: string;
      participation?: string;
      safety?: string;
      additionalInfo?: string;
      birthDate?: string;
      birthTime?: string;
      birthLocation?: string;
      source?: string;
    };

    const body = (await request.json()) as QuestionnairePayload;

    const {
      name,
      email,
      phone,
      contactId: contactIdParam,
      discovery = [],
      discoveryDetails,
      intention = [],
      intentionDetails,
      newEarthMeaning,
      nervousSystems,
      sovereignty,
      innerWork = [],
      innerWorkOther,
      authenticityStory,
      triggerResponse,
      activeWound,
      accountability,
      gift,
      commitment,
      participation,
      safety,
      additionalInfo,
      birthDate,
      birthTime,
      birthLocation,
      source = "questionnaire",
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Upsert contact in master CRM
    // Use provided contactId if available (from waitlist flow), otherwise lookup/create
    let contactId: number;

    if (contactIdParam) {
      // Contact ID provided from waitlist flow - verify it exists and update
      const existingById = await db.query.contacts.findFirst({
        where: eq(contacts.id, parseInt(contactIdParam)),
      });

      if (existingById) {
        await db
          .update(contacts)
          .set({
            name: name,
            phone: phone || existingById.phone,
            lastContactDate: new Date(),
            metadata: {
              ...((existingById.metadata as object) || {}),
              questionnaireCompleted: true,
              questionnaireCompletedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(contacts.id, existingById.id));
        contactId = existingById.id;
      } else {
        // Invalid contactId provided, fall back to email lookup
        const existing = await db.query.contacts.findFirst({
          where: eq(contacts.email, email),
        });

        if (existing) {
          await db
            .update(contacts)
            .set({
              name: name,
              phone: phone || existing.phone,
              lastContactDate: new Date(),
              metadata: {
                ...((existing.metadata as object) || {}),
                questionnaireCompleted: true,
                questionnaireCompletedAt: new Date().toISOString(),
              },
              updatedAt: new Date(),
            })
            .where(eq(contacts.id, existing.id));
          contactId = existing.id;
        } else {
          const [newContact] = await db
            .insert(contacts)
            .values({
              email,
              name,
              phone,
              firstSource: source,
              status: "lead",
              tags: ["questionnaire"],
              metadata: {
                questionnaireCompleted: true,
                questionnaireCompletedAt: new Date().toISOString(),
              },
            })
            .returning();
          contactId = newContact!.id;
        }
      }
    } else {
      // No contactId provided - standard email lookup/create
      const existing = await db.query.contacts.findFirst({
        where: eq(contacts.email, email),
      });

      if (existing) {
        await db
          .update(contacts)
          .set({
            name: name,
            phone: phone || existing.phone,
            lastContactDate: new Date(),
            metadata: {
              ...((existing.metadata as object) || {}),
              questionnaireCompleted: true,
              questionnaireCompletedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(contacts.id, existing.id));
        contactId = existing.id;
      } else {
        const [newContact] = await db
          .insert(contacts)
          .values({
            email,
            name,
            phone,
            firstSource: source,
            status: "lead",
            tags: ["questionnaire"],
            metadata: {
              questionnaireCompleted: true,
              questionnaireCompletedAt: new Date().toISOString(),
            },
          })
          .returning();
        contactId = newContact!.id;
      }
    }

    // Track source
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

    // Link anonymous visitor to contact (identify user)
    const cookies = parseCookies(request.headers.get("cookie"));
    const anonymousId = cookies[COOKIE_NAMES.ANONYMOUS_ID];
    const sessionId = cookies[COOKIE_NAMES.SESSION_ID];
    const contactIdCookie = cookies[COOKIE_NAMES.CONTACT_ID];

    const response = NextResponse.json({ success: true });

    if (!contactIdCookie) {
      response.headers.append(
        "Set-Cookie",
        setCookieHeader(
          COOKIE_NAMES.CONTACT_ID,
          String(contactId),
          COOKIE_OPTIONS.contactId
        )
      );
    }

    if (anonymousId) {
      await identifyUser({
        anonymousId,
        contactId,
        source: "questionnaire",
      });
    }

    // Store questionnaire response
    const [entry] = await db
      .insert(questionnaireResponses)
      .values({
        contactId,
        name,
        email,
        phone: phone || "",
        discovery,
        intention,
        innerWork,
        accountability: accountability || "",
        commitment: commitment || "",
        participation: participation || "",
        safety: safety || "",
        narratives: {
          newEarthMeaning,
          nervousSystems,
          sovereignty,
          authenticityStory,
          triggerResponse,
          activeWound,
          gift,
          additionalInfo,
          discoveryDetails,
          intentionDetails,
          innerWorkOther,
        },
        birthDate: birthDate || "",
        birthTime: birthTime || "",
        birthLocation: birthLocation || "",
      })
      .returning();

    // Log activity
    await db.insert(contactActivities).values({
      contactId,
      activityType: "questionnaire_submit",
      source,
      description: "Submitted alignment questionnaire",
      metadata: {
        questionnaireId: entry!.id,
      },
    });

    // Track event
    if (anonymousId) {
      await trackEvent(
        {
          sessionId,
          anonymousId,
          contactId,
        },
        {
          eventType: "form_submit",
          eventName: "Questionnaire Submit",
          domain: request.headers.get("host") || undefined,
          path: "/api/questionnaire",
          properties: {
            formType: "questionnaire",
          },
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Questionnaire submission failed", error);
    return NextResponse.json(
      { error: "Failed to submit questionnaire" },
      { status: 500 }
    );
  }
}
