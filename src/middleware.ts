import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDomainFromHeaders, isAdminPath } from "~/lib/domains";
import { updateSession } from "~/lib/supabase/middleware";

/**
 * Multi-domain routing middleware
 * Handles domain-specific routing, admin/playground protection, and authentication
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request);

  // Get current domain
  const currentDomain = getDomainFromHeaders(request.headers);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🌐 [Middleware] ${hostname}${pathname} → Domain: ${currentDomain} | User: ${user?.email || "None"}`
    );
  }

  // Handle admin routes
  if (isAdminPath(pathname)) {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      // If already logged in, redirect to admin
      if (user) {
        const adminUrl = hostname.includes("localhost")
          ? `${request.nextUrl.protocol}//${hostname}/admin`
          : `https://joinnewearthcollective.com/admin`;
        return NextResponse.redirect(new URL(adminUrl));
      }
      // Allow access to login page
      return supabaseResponse;
    }

    // Check authentication for all other admin routes
    if (!user) {
      const loginUrl = hostname.includes("localhost")
        ? `${request.nextUrl.protocol}//${hostname}/admin/login`
        : `https://joinnewearthcollective.com/admin/login`;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔒 [Middleware] Auth required, redirecting to: ${loginUrl}`
        );
      }
      return NextResponse.redirect(new URL(loginUrl));
    }
  }

  // Handle playground routes - accessible on test domain or localhost
  if (pathname.startsWith("/playground")) {
    const isValidPlaygroundDomain =
      hostname.includes("test.joinnewearthcollective.com") ||
      hostname.includes("localhost");

    if (!isValidPlaygroundDomain) {
      const playgroundUrl = `https://test.joinnewearthcollective.com${pathname}`;

      if (process.env.NODE_ENV === "development") {
        console.log(`🎮 [Middleware] Playground redirect: ${playgroundUrl}`);
      }
      return NextResponse.redirect(new URL(playgroundUrl));
    }
  }

  // Handle shaders routes - accessible on test domain or localhost
  if (pathname.startsWith("/shaders")) {
    const isValidShadersDomain =
      hostname.includes("test.joinnewearthcollective.com") ||
      hostname.includes("localhost");

    if (!isValidShadersDomain) {
      const shadersUrl = `https://test.joinnewearthcollective.com${pathname}`;

      if (process.env.NODE_ENV === "development") {
        console.log(`🎨 [Middleware] Shaders redirect: ${shadersUrl}`);
      }
      return NextResponse.redirect(new URL(shadersUrl));
    }
  }

  // Add domain information to headers for server components
  supabaseResponse.headers.set("x-domain", currentDomain);
  supabaseResponse.headers.set("x-hostname", hostname);

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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
