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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    type QuestionnairePayload = {
      // Section 1: The Basics
      name?: string;
      preferredName?: string;
      email?: string;
      phone?: string;
      preferredContactMethods?: string[];
      currentLocation?: string;
      isNomadic?: boolean;
      nomadicBaseLocation?: string;
      birthDate?: string;
      birthTime?: string;
      birthLocation?: string;

      // Section 2: Gifts & Identity
      primaryRole?: string;
      identityRoles?: string[];
      identityRolesOther?: string;
      skills?: string[];
      website?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      tiktok?: string;
      youtube?: string;
      facebook?: string;
      otherSocial?: string;

      // Section 3: Alignment Check
      newEarthMeaning?: string;
      primaryIntention?: string;
      sovereigntyMeaning?: string;

      // Section 4: Give & Receive
      uniqueGift?: string;
      receiveFromCommunity?: string;
      openToShareResources?: string;
      physicalResources?: string[];
      resourceLocation?: string;
      resourceOther?: string;
      sharingWillingness?: string;

      // Section 5: Community & Connection
      howFoundUs?: string;
      howFoundUsDetail?: string;
      howFoundUsOther?: string;
      existingConnections?: string;
      otherCommunities?: string;
      seekingConnections?: string;

      // Section 6: Ecosystem Development
      engagementStyles?: string[];
      techAIRelationship?: string;
      improveSocialNetworks?: string;
      ecosystemContribution?: string;
      devSkills?: string;
      excitementLevel?: number;

      // Section 7: Preferences
      profileVisibility?: string;
      communicationPrefs?: string[];

      // Meta
      source?: string;
      contactId?: string;
    };

    const {
      // Section 1
      name,
      preferredName,
      email,
      phone,
      preferredContactMethods = [],
      currentLocation,
      isNomadic,
      nomadicBaseLocation,
      birthDate,
      birthTime,
      birthLocation,

      // Section 2
      primaryRole,
      identityRoles = [],
      identityRolesOther,
      skills = [],
      website,
      instagram,
      twitter,
      linkedin,
      tiktok,
      youtube,
      facebook,
      otherSocial,

      // Section 3
      newEarthMeaning,
      primaryIntention,
      sovereigntyMeaning,

      // Section 4
      uniqueGift,
      receiveFromCommunity,
      openToShareResources,
      physicalResources = [],
      resourceLocation,
      resourceOther,
      sharingWillingness,

      // Section 5
      howFoundUs,
      howFoundUsDetail,
      howFoundUsOther,
      existingConnections,
      otherCommunities,
      seekingConnections,

      // Section 6
      engagementStyles = [],
      techAIRelationship,
      improveSocialNetworks,
      ecosystemContribution,
      devSkills,
      excitementLevel,

      // Section 7
      profileVisibility,
      communicationPrefs = [],

      // Meta
      source = "questionnaire",
      contactId: contactIdParam,
    } = body as QuestionnairePayload;

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
    let contactId: number;

    // Validate contactIdParam is a valid positive integer
    const parsedContactId = contactIdParam ? parseInt(contactIdParam, 10) : NaN;
    const validContactIdParam = !isNaN(parsedContactId) && parsedContactId > 0;

    if (validContactIdParam) {
      // Contact ID provided from waitlist flow - verify it exists and update
      const existingById = await db.query.contacts.findFirst({
        where: eq(contacts.id, parsedContactId),
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
              preferredName,
              currentLocation,
              isNomadic,
              profileVisibility,
              communicationPrefs,
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
                preferredName,
                currentLocation,
                isNomadic,
                profileVisibility,
                communicationPrefs,
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
                preferredName,
                currentLocation,
                isNomadic,
                profileVisibility,
                communicationPrefs,
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
              preferredName,
              currentLocation,
              isNomadic,
              profileVisibility,
              communicationPrefs,
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
              preferredName,
              currentLocation,
              isNomadic,
              profileVisibility,
              communicationPrefs,
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

    // Store questionnaire response with proper columns
    const [entry] = await db
      .insert(questionnaireResponses)
      .values({
        contactId,

        // Section 1: The Basics - Contact Information
        name,
        preferredName: preferredName || null,
        email,
        phone: phone || null,
        preferredContactMethods: preferredContactMethods,

        // Section 1: The Basics - Location
        currentLocation: currentLocation || null,
        isNomadic: isNomadic ?? false,
        nomadicBaseLocation: nomadicBaseLocation || null,

        // Section 1: The Basics - Birth Information
        birthDate: birthDate || null,
        birthTime: birthTime || null,
        birthLocation: birthLocation || null,

        // Section 2: Gifts & Identity - Role
        primaryRole: primaryRole || null,
        identityRoles: identityRoles,
        identityRolesOther: identityRolesOther || null,

        // Section 2: Gifts & Identity - Skills
        skills: skills,

        // Section 2: Gifts & Identity - Online Presence
        website: website || null,
        instagram: instagram || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        tiktok: tiktok || null,
        youtube: youtube || null,
        facebook: facebook || null,
        otherSocial: otherSocial || null,

        // Section 3: Alignment Check
        newEarthMeaning: newEarthMeaning || null,
        primaryIntention: primaryIntention || null,
        sovereigntyMeaning: sovereigntyMeaning || null,

        // Section 4: Give & Receive
        uniqueGift: uniqueGift || null,
        receiveFromCommunity: receiveFromCommunity || null,
        openToShareResources: openToShareResources || null,
        physicalResources: physicalResources,
        resourceLocation: resourceLocation || null,
        resourceOther: resourceOther || null,

        // Section 5: Community & Connection - Discovery
        howFoundUs: howFoundUs || null,
        howFoundUsDetail: howFoundUsDetail || null,
        howFoundUsOther: howFoundUsOther || null,

        // Section 5: Community & Connection - Network
        existingConnections: existingConnections || null,
        otherCommunities: otherCommunities || null,
        seekingConnections: seekingConnections || null,

        // Section 6: Ecosystem Development
        engagementStyles: engagementStyles,
        techAIRelationship: techAIRelationship || null,
        improveSocialNetworks: improveSocialNetworks || null,
        ecosystemContribution: ecosystemContribution || null,
        devSkills: devSkills || null,
        excitementLevel: excitementLevel ?? 5,

        // Section 7: Preferences
        profileVisibility: profileVisibility || null,
        communicationPrefs: communicationPrefs,

        // Metadata
        source,
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
        excitementLevel,
        engagementStyles,
        ecosystemContribution,
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
            excitementLevel,
            ecosystemContribution,
          },
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Questionnaire submission failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to submit questionnaire", details: errorMessage },
      { status: 500 }
    );
  }
}
