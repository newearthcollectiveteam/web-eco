/**
 * CRM Contacts API
 * View and manage contacts in the master CRM
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { contacts, contactActivities } from "~/server/db/schema";
import { desc, eq, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source");
    const status = searchParams.get("status");
    const search = searchParams.get("search"); // Search by email or name
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const contactId = searchParams.get("id");

    // Get single contact with activities
    if (contactId) {
      const contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, parseInt(contactId, 10)),
      });

      if (!contact) {
        return NextResponse.json(
          { error: "Contact not found" },
          { status: 404 }
        );
      }

      const activities = await db.query.contactActivities.findMany({
        where: eq(contactActivities.contactId, contact.id),
        orderBy: [desc(contactActivities.createdAt)],
        limit: 100,
      });

      return NextResponse.json({
        success: true,
        contact,
        activities,
      });
    }

    // Build query for multiple contacts
    let query = db.select().from(contacts);
    const conditions = [];

    if (source) {
      conditions.push(eq(contacts.firstSource, source));
    }

    if (status) {
      conditions.push(eq(contacts.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(contacts.email, `%${search}%`),
          like(contacts.name, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(or(...conditions)) as any;
    }

    const allContacts = await query
      .orderBy(desc(contacts.lastContactDate))
      .limit(limit);

    // Get stats
    const totalContacts = allContacts.length;

    const contactsBySource: Record<string, number> = {};
    const contactsByStatus: Record<string, number> = {};

    allContacts.forEach((contact) => {
      contactsBySource[contact.firstSource] =
        (contactsBySource[contact.firstSource] || 0) + 1;
      contactsByStatus[contact.status] =
        (contactsByStatus[contact.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      contacts: allContacts,
      total: totalContacts,
      stats: {
        bySource: Object.entries(contactsBySource).map(([source, count]) => ({
          source,
          count,
        })),
        byStatus: Object.entries(contactsByStatus).map(([status, count]) => ({
          status,
          count,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching CRM contacts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
