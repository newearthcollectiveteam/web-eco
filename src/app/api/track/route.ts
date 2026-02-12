/**
 * Client-side Event Tracking API
 * Lightweight POST endpoint for tracking events from the browser via sendBeacon
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { trackEvent } from "~/lib/tracking/analytics-service";
import {
  COOKIE_NAMES,
  parseCookies,
  generateAnonymousId,
  getClientIp,
} from "~/lib/tracking/utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      eventType?: string;
      eventName?: string;
      properties?: Record<string, unknown>;
      path?: string;
    };

    if (!body.eventType) {
      return new NextResponse(null, { status: 400 });
    }

    const cookies = parseCookies(request.headers.get("cookie"));
    const anonymousId =
      cookies[COOKIE_NAMES.ANONYMOUS_ID] || generateAnonymousId();
    const sessionId = cookies[COOKIE_NAMES.SESSION_ID];
    const contactIdStr = cookies[COOKIE_NAMES.CONTACT_ID];
    const contactId = contactIdStr ? parseInt(contactIdStr, 10) : undefined;

    const domain = request.headers.get("host") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress = getClientIp(request.headers);

    await trackEvent(
      {
        sessionId,
        anonymousId,
        contactId,
        userAgent,
        ipAddress,
      },
      {
        eventType: body.eventType,
        eventName: body.eventName,
        domain,
        path: body.path,
        properties: body.properties,
      }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Track API error:", error);
    return new NextResponse(null, { status: 204 });
  }
}
