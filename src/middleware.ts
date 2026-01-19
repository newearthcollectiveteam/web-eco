import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "~/lib/supabase/middleware";
import { analyticsMiddleware } from "~/lib/tracking/middleware";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/auth/auth-code-error",
  "/auth/pending-approval",
  "/onboarding",
  "/questionnaire",
  "/emergence-followup",
  "/emergence-thank-you",
  "/unsubscribe",
  "/boulder-launch-party",
  "/about",
  "/utils/flower-of-life",
];

/**
 * Public embeds that should be accessible without auth and outside test domain
 */
const PUBLIC_EMBED_ROUTES = ["/shaders/flower-of-life/embed"];

/**
 * Routes that only work on test domain
 */
const TEST_ONLY_ROUTES = [
  "/form-builder",
  "/brand",
  "/templates",
  "/shaders",
  "/playground",
];

/**
 * Check if a path is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is a public embed that should bypass auth and test-only gating
 */
function isPublicEmbed(pathname: string): boolean {
  return PUBLIC_EMBED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is test-only
 */
function isTestOnlyRoute(pathname: string): boolean {
  return TEST_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Middleware for authentication and analytics
 * Protects entire site behind login except for auth pages
 * Tracks all page views and user interactions
 */
export async function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") || "").toLowerCase();
  const pathname = request.nextUrl.pathname;
  const domainParam =
    request.nextUrl.searchParams.get("domain")?.toLowerCase() || "";

  const isTestHost = hostname.includes("test.joinnewearthcollective.com");
  const isLaunchHost = hostname.includes("launch.joinnewearthcollective.com");
  const isMainHost =
    hostname.includes("joinnewearthcollective.com") &&
    !isTestHost &&
    !isLaunchHost;

  // Redirect launch subdomain to main domain (launch subdomain deprecated)
  if (isLaunchHost) {
    const targetUrl = new URL(request.nextUrl.toString());
    targetUrl.hostname = "joinnewearthcollective.com";
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // Redirect deprecated landing pages to /
  const deprecatedLandingRoutes = [
    "/launch",
    "/launch-landing-1",
    "/dope-ass-landing",
    "/join-community-1",
    "/about-community",
    "/local-community",
    "/global",
    "/gallery",
  ];
  if (deprecatedLandingRoutes.some((route) => pathname.startsWith(route))) {
    const targetUrl = new URL(request.nextUrl.origin);
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // Domain override support for local dev via ?domain=
  const isTestDomain =
    isTestHost ||
    domainParam.includes("test.joinnewearthcollective.com") ||
    domainParam === "test";
  const isMainDomain = isMainHost && !isTestDomain;

  // Run analytics tracking (non-blocking, tracks all visits)
  let analyticsResponse: NextResponse;
  try {
    analyticsResponse = await analyticsMiddleware(request);
  } catch (error) {
    console.error('Analytics middleware error:', error);
    analyticsResponse = NextResponse.next();
  }

  // Update Supabase session and get approval status
  const { supabaseResponse, user, approvalStatus } =
    await updateSession(request);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🌐 [Middleware] ${hostname}${pathname} | Domain: ${isTestDomain ? "test" : isMainDomain ? "main" : "other"} | User: ${user?.email || "None"} | Status: ${approvalStatus || "N/A"}`
    );
  }

  // Block test-only routes on non-test domains
  // Allow public embed routes even on non-test domains
  if (isTestOnlyRoute(pathname) && !isTestDomain && !isPublicEmbed(pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Public access for non-test domains (main domain)
  if (!isTestDomain) {
    analyticsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        supabaseResponse.headers.append(key, value);
      }
    });
    return supabaseResponse;
  }

  // Allow access to public routes
  if (isPublicRoute(pathname) || isPublicEmbed(pathname)) {
    // If already logged in and trying to access login/signup, redirect to home
    if ((pathname === "/login" || pathname === "/auth/signup") && user) {
      const homeUrl = `${request.nextUrl.protocol}//${hostname}/`;
      const redirectResponse = NextResponse.redirect(new URL(homeUrl));
      // Preserve analytics cookies
      analyticsResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          redirectResponse.headers.append(key, value);
        }
      });
      return redirectResponse;
    }

    // Merge analytics cookies with supabase response
    analyticsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        supabaseResponse.headers.append(key, value);
      }
    });
    return supabaseResponse;
  }

  // Require authentication for all other routes
  if (!user) {
    const loginUrl = `${request.nextUrl.protocol}//${hostname}/login`;

    if (process.env.NODE_ENV === "development") {
      console.log(`🔒 [Middleware] Auth required, redirecting to: ${loginUrl}`);
    }

    const redirectResponse = NextResponse.redirect(new URL(loginUrl));
    // Preserve analytics cookies even when redirecting to login
    analyticsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        redirectResponse.headers.append(key, value);
      }
    });
    return redirectResponse;
  }

  // Check approval status (block pending/rejected users except on specific pages)
  if (approvalStatus === "pending" || approvalStatus === "rejected") {
    // Allow access to pending approval page
    if (pathname === "/auth/pending-approval") {
      // Merge analytics cookies
      analyticsResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          supabaseResponse.headers.append(key, value);
        }
      });
      return supabaseResponse;
    }

    // Redirect non-approved users to pending approval page
    const pendingUrl = `${request.nextUrl.protocol}//${hostname}/auth/pending-approval`;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `⏳ [Middleware] User not approved (${approvalStatus}), redirecting to: ${pendingUrl}`
      );
    }

    const redirectResponse = NextResponse.redirect(new URL(pendingUrl));
    // Preserve analytics cookies
    analyticsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        redirectResponse.headers.append(key, value);
      }
    });
    return redirectResponse;
  }

  // Merge analytics cookies with final response
  analyticsResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      supabaseResponse.headers.append(key, value);
    }
  });

  return supabaseResponse;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (.png, .jpg, .svg, .ico, .webp, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff|woff2|ttf|eot|otf)).*)",
  ],
};
