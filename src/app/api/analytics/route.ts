/**
 * Analytics API
 * Query tracking and analytics data
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '~/server/db';
import { contacts, sessions, events, emailLinks } from '~/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getContactAnalytics, getContactAttribution } from '~/lib/tracking/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const contactId = searchParams.get('contactId');
    const email = searchParams.get('email');
    const type = searchParams.get('type') || 'summary';

    // Get contact analytics by ID or email
    if (contactId || email) {
      const contact = contactId
        ? await db.query.contacts.findFirst({
            where: eq(contacts.id, parseInt(contactId)),
          })
        : await db.query.contacts.findFirst({
            where: eq(contacts.email, email!),
          });

      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      if (type === 'full') {
        // Get complete analytics
        const [analytics, attribution] = await Promise.all([
          getContactAnalytics(contact.id),
          getContactAttribution(contact.id),
        ]);

        return NextResponse.json({
          contact,
          analytics,
          attribution,
        });
      } else {
        // Get summary only
        const analytics = await getContactAnalytics(contact.id);

        return NextResponse.json({
          contact: {
            id: contact.id,
            email: contact.email,
            name: contact.name,
            firstSource: contact.firstSource,
            status: contact.status,
            tags: contact.tags,
          },
          metrics: analytics.metrics,
        });
      }
    }

    // Get overall analytics summary
    const [
      totalContacts,
      totalSessions,
      totalEvents,
      totalEmailLinks,
      recentContacts,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(contacts),
      db.select({ count: sql<number>`count(*)` }).from(sessions),
      db.select({ count: sql<number>`count(*)` }).from(events),
      db.select({ count: sql<number>`count(*)` }).from(emailLinks),
      db.query.contacts.findMany({
        orderBy: [desc(contacts.createdAt)],
        limit: 10,
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalContacts: totalContacts[0]?.count || 0,
        totalSessions: totalSessions[0]?.count || 0,
        totalEvents: totalEvents[0]?.count || 0,
        totalEmailLinks: totalEmailLinks[0]?.count || 0,
      },
      recentContacts,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
