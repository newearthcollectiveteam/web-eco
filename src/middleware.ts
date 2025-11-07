import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminPath } from "~/lib/domains";
import { updateSession } from "~/lib/supabase/middleware";

/**
 * Middleware for authentication
 * Handles admin authentication and Supabase session updates
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🌐 [Middleware] ${hostname}${pathname} | User: ${user?.email || "None"}`
    );
  }

  // Handle admin routes
  if (isAdminPath(pathname)) {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      // If already logged in, redirect to admin
      if (user) {
        const adminUrl = `${request.nextUrl.protocol}//${hostname}/admin`;
        return NextResponse.redirect(new URL(adminUrl));
      }
      // Allow access to login page
      return supabaseResponse;
    }

    // Check authentication for all other admin routes
    if (!user) {
      const loginUrl = `${request.nextUrl.protocol}//${hostname}/admin/login`;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔒 [Middleware] Auth required, redirecting to: ${loginUrl}`
        );
      }
      return NextResponse.redirect(new URL(loginUrl));
    }
  }

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
