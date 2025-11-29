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
  "/launch",
  "/shaders/flower-of-life/embed",
];

/**
 * Check if a path is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Middleware for authentication and analytics
 * Protects entire site behind login except for auth pages
 * Tracks all page views and user interactions
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

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
      `🌐 [Middleware] ${hostname}${pathname} | User: ${user?.email || "None"} | Status: ${approvalStatus || "N/A"}`
    );
  }

  // Allow access to public routes
  if (isPublicRoute(pathname)) {
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
