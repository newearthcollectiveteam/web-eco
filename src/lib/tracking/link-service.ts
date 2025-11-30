/**
 * Link Tracking Service
 * Generate trackable links for emails with UTM parameters and tracking tokens
 */

import { db } from '~/server/db';
import { emailLinks } from '~/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateEmailToken, slugify } from './utils';

export interface TrackedLinkParams {
  contactId: number;
  destinationPath: string; // e.g., "/event-registration"
  destinationDomain?: string; // e.g., "launch.joinnewearthcollective.com"
  emailType: string; // e.g., "waitlist-welcome"
  emailSubject?: string;
  linkText?: string; // CTA text, e.g., "Register for Event"
  utmSource?: string; // Default: "klaviyo"
  utmMedium?: string; // Default: "email"
  utmCampaign?: string; // Uses emailType if not provided
  utmContent?: string; // Uses slugified linkText if not provided
}

/**
 * Generate a trackable link for an email
 * Returns the full URL with tracking token and UTM parameters
 */
export async function generateTrackedLink(
  params: TrackedLinkParams
): Promise<string> {
  // Generate unique tracking token
  const token = generateEmailToken(params.contactId);

  // Determine base URL
  const baseUrl =
    params.destinationDomain ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://joinnewearthcollective.com';

  // Build full destination URL
  const url = new URL(params.destinationPath, baseUrl);

  // Add tracking token
  url.searchParams.set('et', token);

  // Add UTM parameters
  url.searchParams.set('utm_source', params.utmSource || 'klaviyo');
  url.searchParams.set('utm_medium', params.utmMedium || 'email');
  url.searchParams.set('utm_campaign', params.utmCampaign || params.emailType);

  if (params.linkText) {
    url.searchParams.set(
      'utm_content',
      params.utmContent || slugify(params.linkText)
    );
  }

  // Store email link in database
  await db.insert(emailLinks).values({
    token,
    contactId: params.contactId,
    emailType: params.emailType,
    emailSubject: params.emailSubject,
    destinationUrl: url.toString(),
    linkText: params.linkText,
    sentAt: new Date(),
  });

  return url.toString();
}

/**
 * Get email link by token
 */
export async function getEmailLinkByToken(token: string) {
  return await db.query.emailLinks.findFirst({
    where: eq(emailLinks.token, token),
  });
}

/**
 * Increment click count for an email link
 */
export async function incrementEmailLinkClick(emailLinkId: number): Promise<void> {
  const now = new Date();

  await db
    .update(emailLinks)
    .set({
      clickCount: sql`${emailLinks.clickCount} + 1`,
      lastClickedAt: now,
      firstClickedAt: sql`COALESCE(${emailLinks.firstClickedAt}, ${now})`,
    })
    .where(eq(emailLinks.id, emailLinkId));
}

/**
 * Generate multiple tracked links for an email (batch)
 */
export async function generateMultipleTrackedLinks(
  links: TrackedLinkParams[]
): Promise<string[]> {
  const results = await Promise.all(links.map((link) => generateTrackedLink(link)));
  return results;
}

/**
 * Get email link analytics
 */
export async function getEmailLinkAnalytics(emailLinkId: number) {
  const link = await db.query.emailLinks.findFirst({
    where: eq(emailLinks.id, emailLinkId),
    with: {
      emailLinkClicks: {
        orderBy: (clicks: any, { desc }: any) => [desc(clicks.clickedAt)],
      },
    },
  }) as any;

  if (!link) {
    return null;
  }

  const clicks = link.emailLinkClicks || [];
  const uniqueClickers = new Set(clicks.map((c: any) => c.contactId)).size;
  const conversions = clicks.filter((c: any) => c.convertedToFormSubmission).length;

  return {
    ...link,
    analytics: {
      totalClicks: link.clickCount,
      uniqueClickers,
      conversions,
      conversionRate:
        link.clickCount > 0 ? (conversions / link.clickCount) * 100 : 0,
      firstClickedAt: link.firstClickedAt,
      lastClickedAt: link.lastClickedAt,
    },
  };
}

/**
 * Get all email links for a contact
 */
export async function getContactEmailLinks(contactId: number) {
  return await db.query.emailLinks.findMany({
    where: eq(emailLinks.contactId, contactId),
    orderBy: (emailLinks, { desc }) => [desc(emailLinks.sentAt)],
  });
}

/**
 * Get email link performance by type
 */
export async function getEmailLinkPerformanceByType(emailType?: string) {
  const whereClause = emailType ? eq(emailLinks.emailType, emailType) : undefined;

  const links = await db.query.emailLinks.findMany({
    where: whereClause,
    with: {
      emailLinkClicks: true,
    },
  }) as any[];

  // Group by email type and calculate metrics
  const grouped = links.reduce((acc, link) => {
    const type = link.emailType;
    if (!acc[type]) {
      acc[type] = {
        emailType: type,
        totalSent: 0,
        totalClicks: 0,
        uniqueClickers: new Set(),
        conversions: 0,
      };
    }

    acc[type].totalSent += 1;
    acc[type].totalClicks += link.clickCount;

    link.emailLinkClicks?.forEach((click: any) => {
      acc[type].uniqueClickers.add(click.contactId);
      if (click.convertedToFormSubmission) {
        acc[type].conversions += 1;
      }
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate rates
  return Object.values(grouped).map((group: any) => ({
    emailType: group.emailType,
    totalSent: group.totalSent,
    totalClicks: group.totalClicks,
    uniqueClickers: group.uniqueClickers.size,
    conversions: group.conversions,
    clickRate: group.totalSent > 0 ? (group.totalClicks / group.totalSent) * 100 : 0,
    conversionRate:
      group.totalClicks > 0 ? (group.conversions / group.totalClicks) * 100 : 0,
  }));
}

/**
 * Example: Generate a waitlist welcome email link
 */
export async function generateWaitlistWelcomeLink(params: {
  contactId: number;
  name: string;
}): Promise<string> {
  return await generateTrackedLink({
    contactId: params.contactId,
    destinationPath: '/global',
    emailType: 'waitlist-welcome',
    emailSubject: `Welcome to New Earth Collective, ${params.name}!`,
    linkText: 'Explore Our Community',
    utmCampaign: 'waitlist-welcome',
  });
}

/**
 * Example: Generate an event invitation link
 */
export async function generateEventInviteLink(params: {
  contactId: number;
  eventSlug: string;
  eventName: string;
}): Promise<string> {
  return await generateTrackedLink({
    contactId: params.contactId,
    destinationPath: `/event/${params.eventSlug}`,
    destinationDomain: 'launch.joinnewearthcollective.com',
    emailType: 'event-invitation',
    emailSubject: `You're Invited: ${params.eventName}`,
    linkText: 'Register Now',
    utmCampaign: `event-${params.eventSlug}`,
  });
}
