/**
 * Admin Database API
 * Fetches database statistics and records for admin dashboard
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { contacts, questionnaireResponses, eventWaivers, contactActivities, contactSources } from "~/server/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const table = searchParams.get("table");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get specific table data
    if (table === "contacts") {
      const data = await db.query.contacts.findMany({
        orderBy: [desc(contacts.createdAt)],
        limit,
      });
      const total = await db.select({ count: sql<number>`count(*)` }).from(contacts);
      return NextResponse.json({ data, total: total[0]?.count || 0 });
    }

    if (table === "questionnaire") {
      const data = await db.query.questionnaireResponses.findMany({
        orderBy: [desc(questionnaireResponses.createdAt)],
        limit,
      });
      const total = await db.select({ count: sql<number>`count(*)` }).from(questionnaireResponses);
      return NextResponse.json({ data, total: total[0]?.count || 0 });
    }

    if (table === "waivers") {
      const data = await db.query.eventWaivers.findMany({
        orderBy: [desc(eventWaivers.signedAt)],
        limit,
      });
      const total = await db.select({ count: sql<number>`count(*)` }).from(eventWaivers);
      return NextResponse.json({ data, total: total[0]?.count || 0 });
    }

    // Return summary stats
    const [
      contactsCount,
      questionnaireCount,
      waiversCount,
      activityCount,
      sourcesCount,
      recentContacts,
      recentQuestionnaires,
      recentWaivers,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(contacts),
      db.select({ count: sql<number>`count(*)` }).from(questionnaireResponses),
      db.select({ count: sql<number>`count(*)` }).from(eventWaivers),
      db.select({ count: sql<number>`count(*)` }).from(contactActivities),
      db.select({ count: sql<number>`count(*)` }).from(contactSources),
      db.query.contacts.findMany({
        orderBy: [desc(contacts.createdAt)],
        limit: 5,
      }),
      db.query.questionnaireResponses.findMany({
        orderBy: [desc(questionnaireResponses.createdAt)],
        limit: 5,
      }),
      db.query.eventWaivers.findMany({
        orderBy: [desc(eventWaivers.signedAt)],
        limit: 5,
      }),
    ]);

    return NextResponse.json({
      stats: {
        contacts: contactsCount[0]?.count || 0,
        questionnaires: questionnaireCount[0]?.count || 0,
        waivers: waiversCount[0]?.count || 0,
        activities: activityCount[0]?.count || 0,
        sources: sourcesCount[0]?.count || 0,
      },
      recent: {
        contacts: recentContacts,
        questionnaires: recentQuestionnaires,
        waivers: recentWaivers,
      },
    });
  } catch (error) {
    console.error("Admin database API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database info" },
      { status: 500 }
    );
  }
}
