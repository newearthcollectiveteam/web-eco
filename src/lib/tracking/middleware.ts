/**
 * Analytics Tracking Middleware
 * Automatically tracks page views, manages sessions, and handles email link clicks
 *
 * Edge Runtime Support:
 * - Crypto operations: ✅ Edge-compatible (uses Web Crypto API)
 * - Database operations: Requires Node.js runtime
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Check if we're running in Edge Runtime
 * Edge Runtime doesn't support native Node.js modules like postgres driver
 */
const isEdgeRuntime = typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis ||
                       process.env.NEXT_RUNTIME === 'edge';
import {
  COOKIE_NAMES,
  COOKIE_OPTIONS,
  parseCookies,
  setCookieHeader,
  generateAnonymousId,
  extractUtmParams,
  getClientIp,
  parseEmailToken,
} from './utils';
import { trackEvent } from './analytics-service';

/**
 * Analytics middleware - tracks all page visits
 * This should be called from your main middleware.ts file
 */
export async function analyticsMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const response = NextResponse.next();

  try {
    // Skip tracking for API routes, static files, and Next.js internals
    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf)$/.test(pathname)
    ) {
      return response;
    }

    // Parse cookies
    const cookies = parseCookies(request.headers.get('cookie'));

    // Get or create anonymous ID
    let anonymousId = cookies[COOKIE_NAMES.ANONYMOUS_ID];
    if (!anonymousId) {
      anonymousId = generateAnonymousId();
      response.headers.append(
        'Set-Cookie',
        setCookieHeader(
          COOKIE_NAMES.ANONYMOUS_ID,
          anonymousId,
          COOKIE_OPTIONS.anonymousId
        )
      );
    }

    // Get session ID from cookie
    let sessionId = cookies[COOKIE_NAMES.SESSION_ID];

    // Get contact ID from cookie (if user is known)
    const contactIdStr = cookies[COOKIE_NAMES.CONTACT_ID];
    const contactId = contactIdStr ? parseInt(contactIdStr, 10) : undefined;

    // Extract domain and URL info
    const domain = request.headers.get('host') || undefined;
    const path = pathname;
    const referrer = request.headers.get('referer') || undefined;

    // Extract UTM parameters
    const utmParams = extractUtmParams(request.nextUrl);

    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = getClientIp(request.headers);

    // Check for email tracking token
    const emailToken = request.nextUrl.searchParams.get('et');
    let emailLinkId: number | undefined;
    let emailContactId: number | undefined;

    // Database operations - only in Node.js runtime
    if (!isEdgeRuntime) {
      // Lazy-load server-only modules to keep edge bundle clean
      const [{
        upsertSession,
        trackEvent,
        trackEmailClick,
      }, { getEmailLinkByToken, incrementEmailLinkClick }] = await Promise.all([
        import('./analytics-service'),
        import('./link-service'),
      ]);

      if (emailToken) {
        const parsedToken = parseEmailToken(emailToken);
        if (parsedToken) {
          // Look up email link
          const emailLink = await getEmailLinkByToken(emailToken);

          if (emailLink) {
            emailLinkId = emailLink.id;
            emailContactId = emailLink.contactId;

            // Increment click count
            await incrementEmailLinkClick(emailLink.id);

            // Track email click
            await trackEmailClick({
              emailLinkId: emailLink.id,
              contactId: emailLink.contactId,
              sessionId,
              userAgent,
              ipAddress,
            });

            // If contact wasn't already known from cookie, use the one from email link
            if (!contactId) {
              response.headers.append(
                'Set-Cookie',
                setCookieHeader(
                  COOKIE_NAMES.CONTACT_ID,
                  emailLink.contactId.toString(),
                  COOKIE_OPTIONS.contactId
                )
              );
            }
          }
        }
      }

      // Create or update session (use email token contactId if cookie didn't have one)
      sessionId = await upsertSession({
        sessionId,
        anonymousId,
        contactId: contactId || emailContactId,
        domain,
        source: utmParams.utmSource,
        medium: utmParams.utmMedium,
        campaign: utmParams.utmCampaign,
        userAgent,
        ipAddress,
      });

      // Update session cookie
      if (sessionId !== cookies[COOKIE_NAMES.SESSION_ID]) {
        response.headers.append(
          'Set-Cookie',
          setCookieHeader(
            COOKIE_NAMES.SESSION_ID,
            sessionId,
            COOKIE_OPTIONS.sessionId
          )
        );
      }

      // Track page view event
      await trackEvent(
        {
          sessionId,
          anonymousId,
          contactId,
          userAgent,
          ipAddress,
        },
        {
          eventType: 'page_view',
          eventName: `View: ${path}`,
          domain,
          path,
          referrer,
          ...utmParams,
          properties: {
            emailLinkId,
          },
        }
      );
    } else {
      // Edge Runtime - just set cookies, skip DB operations
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Running in Edge Runtime - skipping database operations');
      }
    }

    // Add tracking context to response headers (for debugging)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Analytics-Anonymous-ID', anonymousId);
      if (sessionId) {
        response.headers.set('X-Analytics-Session-ID', sessionId);
      }
      if (contactId) {
        response.headers.set('X-Analytics-Contact-ID', contactId.toString());
      }
    }
  } catch (error) {
    // Log error but don't block the request
    console.error('Analytics middleware error:', error);
  }

  return response;
}

/**
 * Helper to track custom events from API routes
 */
export async function trackCustomEvent(params: {
  request: NextRequest;
  eventType: string;
  eventName?: string;
  properties?: Record<string, any>;
}) {
  const cookies = parseCookies(params.request.headers.get('cookie'));

  const anonymousId =
    cookies[COOKIE_NAMES.ANONYMOUS_ID] || generateAnonymousId();
  const sessionId = cookies[COOKIE_NAMES.SESSION_ID];
  const contactIdStr = cookies[COOKIE_NAMES.CONTACT_ID];
  const contactId = contactIdStr ? parseInt(contactIdStr, 10) : undefined;

  const domain = params.request.headers.get('host') || undefined;
  const path = params.request.nextUrl.pathname;
  const userAgent = params.request.headers.get('user-agent') || undefined;
  const ipAddress = getClientIp(params.request.headers);

  await trackEvent(
    {
      sessionId,
      anonymousId,
      contactId,
      userAgent,
      ipAddress,
    },
    {
      eventType: params.eventType,
      eventName: params.eventName,
      domain,
      path,
      properties: params.properties,
    }
  );
}
