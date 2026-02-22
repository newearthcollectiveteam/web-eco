/**
 * Analytics Service
 * Handles event tracking, session management, and user identification
 */

import { db } from "~/server/db";
import {
  sessions,
  events,
  userIdentityMap,
  emailLinkClicks,
} from "~/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateSessionId, parseUserAgent, hashIpAddress } from "./utils";

export interface SessionData {
  sessionId: string;
  anonymousId: string;
  contactId?: number;
  initialDomain?: string;
  initialSource?: string;
  initialMedium?: string;
  initialCampaign?: string;
}

export interface EventData {
  eventType: string;
  eventName?: string;
  domain?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  properties?: Record<string, any>;
}

export interface TrackingContext {
  sessionId?: string;
  anonymousId: string;
  contactId?: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Create or update a session
 */
export async function upsertSession(params: {
  sessionId?: string;
  anonymousId: string;
  contactId?: number;
  domain?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<string> {
  const sessionId = params.sessionId || generateSessionId();

  // Parse user agent
  const deviceInfo = params.userAgent
    ? parseUserAgent(params.userAgent)
    : { device: "unknown", browser: "unknown", os: "unknown" };

  // Hash IP address
  const ipHash = params.ipAddress
    ? await hashIpAddress(params.ipAddress)
    : undefined;

  // Check if session exists
  const existingSession = params.sessionId
    ? await db.query.sessions.findFirst({
        where: eq(sessions.id, params.sessionId),
      })
    : null;

  if (existingSession) {
    // Update existing session
    await db
      .update(sessions)
      .set({
        lastActivityAt: new Date(),
        contactId: params.contactId || existingSession.contactId,
      })
      .where(eq(sessions.id, sessionId));
  } else {
    // Create new session
    await db.insert(sessions).values({
      id: sessionId,
      anonymousId: params.anonymousId,
      contactId: params.contactId,
      initialDomain: params.domain,
      initialSource: params.source,
      initialMedium: params.medium,
      initialCampaign: params.campaign,
      userAgent: params.userAgent,
      ipAddressHash: ipHash,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      startedAt: new Date(),
      lastActivityAt: new Date(),
    });
  }

  return sessionId;
}

/**
 * Track an event
 */
export async function trackEvent(
  context: TrackingContext,
  eventData: EventData
): Promise<void> {
  await db.insert(events).values({
    sessionId: context.sessionId,
    contactId: context.contactId,
    anonymousId: context.anonymousId,
    eventType: eventData.eventType,
    eventName: eventData.eventName,
    domain: eventData.domain,
    path: eventData.path,
    referrer: eventData.referrer,
    utmSource: eventData.utmSource,
    utmMedium: eventData.utmMedium,
    utmCampaign: eventData.utmCampaign,
    utmContent: eventData.utmContent,
    utmTerm: eventData.utmTerm,
    properties: eventData.properties || {},
  });
}

/**
 * Link anonymous ID to contact (identify user)
 */
export async function identifyUser(params: {
  anonymousId: string;
  contactId: number;
  source: string;
}): Promise<void> {
  // Check if mapping already exists
  const existing = await db.query.userIdentityMap.findFirst({
    where: eq(userIdentityMap.anonymousId, params.anonymousId),
  });

  if (!existing) {
    // Create identity mapping
    await db.insert(userIdentityMap).values({
      anonymousId: params.anonymousId,
      contactId: params.contactId,
      identificationSource: params.source,
      identifiedAt: new Date(),
    });
  }

  // Update all events with this anonymous ID to include contact ID
  await db
    .update(events)
    .set({ contactId: params.contactId })
    .where(
      and(
        eq(events.anonymousId, params.anonymousId),
        sql`${events.contactId} IS NULL`
      )
    );

  // Update all sessions with this anonymous ID to include contact ID
  await db
    .update(sessions)
    .set({ contactId: params.contactId })
    .where(
      and(
        eq(sessions.anonymousId, params.anonymousId),
        sql`${sessions.contactId} IS NULL`
      )
    );
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string) {
  return await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
}

/**
 * Get contact's sessions
 */
export async function getContactSessions(contactId: number) {
  return await db.query.sessions.findMany({
    where: eq(sessions.contactId, contactId),
    orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
  });
}

/**
 * Get contact's events
 */
export async function getContactEvents(contactId: number, limit = 100) {
  return await db.query.events.findMany({
    where: eq(events.contactId, contactId),
    orderBy: (events, { desc }) => [desc(events.createdAt)],
    limit,
  });
}

/**
 * Track email link click
 */
export async function trackEmailClick(params: {
  emailLinkId: number;
  contactId: number;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<void> {
  const ipHash = params.ipAddress
    ? await hashIpAddress(params.ipAddress)
    : undefined;

  await db.insert(emailLinkClicks).values({
    emailLinkId: params.emailLinkId,
    contactId: params.contactId,
    sessionId: params.sessionId,
    clickedAt: new Date(),
    userAgent: params.userAgent,
    ipAddressHash: ipHash,
  });
}

/**
 * Mark email click as converted
 */
export async function markEmailClickConverted(params: {
  emailLinkId: number;
  contactId: number;
  formType: string;
}): Promise<void> {
  // Find the most recent click for this email link and contact
  const recentClick = await db.query.emailLinkClicks.findFirst({
    where: and(
      eq(emailLinkClicks.emailLinkId, params.emailLinkId),
      eq(emailLinkClicks.contactId, params.contactId)
    ),
    orderBy: (emailLinkClicks, { desc }) => [desc(emailLinkClicks.clickedAt)],
  });

  if (recentClick) {
    await db
      .update(emailLinkClicks)
      .set({
        convertedToFormSubmission: true,
        formSubmittedAt: new Date(),
        formType: params.formType,
      })
      .where(eq(emailLinkClicks.id, recentClick.id));
  }
}

/**
 * Get analytics summary for a contact
 */
export async function getContactAnalytics(contactId: number) {
  const [sessionsData, eventsData, clicksData] = await Promise.all([
    // Get sessions
    db.query.sessions.findMany({
      where: eq(sessions.contactId, contactId),
      orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
    }),

    // Get events
    db.query.events.findMany({
      where: eq(events.contactId, contactId),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      limit: 100,
    }),

    // Get email clicks
    db.query.emailLinkClicks.findMany({
      where: eq(emailLinkClicks.contactId, contactId),
      orderBy: (emailLinkClicks, { desc }) => [desc(emailLinkClicks.clickedAt)],
    }),
  ]);

  // Calculate metrics
  const totalEvents = eventsData.length;
  const pageViews = eventsData.filter(
    (e) => e.eventType === "page_view"
  ).length;
  const formSubmissions = eventsData.filter(
    (e) => e.eventType === "form_submit"
  ).length;
  const domainsVisited = [
    ...new Set(eventsData.map((e) => e.domain).filter(Boolean)),
  ];
  const emailClicks = clicksData.length;
  const emailConversions = clicksData.filter(
    (c) => c.convertedToFormSubmission
  ).length;

  return {
    sessions: sessionsData,
    events: eventsData,
    emailClicks: clicksData,
    metrics: {
      totalSessions: sessionsData.length,
      totalEvents,
      pageViews,
      formSubmissions,
      domainsVisited,
      emailClicks,
      emailConversions,
    },
  };
}

/**
 * Get attribution data for a contact
 */
export async function getContactAttribution(contactId: number) {
  const firstSession = await db.query.sessions.findFirst({
    where: eq(sessions.contactId, contactId),
    orderBy: (sessions, { asc }) => [asc(sessions.startedAt)],
  });

  const allSessions = await db.query.sessions.findMany({
    where: eq(sessions.contactId, contactId),
    orderBy: (sessions, { asc }) => [asc(sessions.startedAt)],
  });

  return {
    firstTouch: {
      domain: firstSession?.initialDomain,
      source: firstSession?.initialSource,
      medium: firstSession?.initialMedium,
      campaign: firstSession?.initialCampaign,
      timestamp: firstSession?.startedAt,
    },
    allTouchpoints: allSessions.map((s) => ({
      domain: s.initialDomain,
      source: s.initialSource,
      medium: s.initialMedium,
      campaign: s.initialCampaign,
      timestamp: s.startedAt,
    })),
  };
}
