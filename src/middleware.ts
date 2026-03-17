import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "~/lib/supabase/middleware";
import { analyticsMiddleware } from "~/lib/tracking/middleware";

/**
 * Public embeds that should be accessible without auth within /admin/*
 */
const PUBLIC_EMBED_ROUTES = ["/admin/shaders/flower-of-life/embed"];

/**
 * Check if a path is a public embed that should bypass auth
 */
function isPublicEmbed(pathname: string): boolean {
  return PUBLIC_EMBED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Middleware for authentication and analytics
 * Protects /admin/* behind login, all other routes are public
 */
export async function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") || "").toLowerCase();
  const pathname = request.nextUrl.pathname;

  const isTestHost = hostname.includes("test.joinnewearthcollective.com");
  const isLaunchHost = hostname.includes("launch.joinnewearthcollective.com");
  const isAppsHost = hostname.includes("apps.joinnewearthcollective.com");

  // Redirect launch subdomain to main domain (launch subdomain deprecated)
  if (isLaunchHost) {
    const targetUrl = new URL(request.nextUrl.toString());
    targetUrl.hostname = "joinnewearthcollective.com";
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // Rewrite apps subdomain to /apps/* routes (no redirect, keeps URL clean)
  if (isAppsHost) {
    // Skip rewrite if path already starts with /apps (prevents double-prefix from internal links)
    if (pathname.startsWith("/apps")) {
      return NextResponse.rewrite(request.nextUrl);
    }
    // /el-nido-chat → /apps/el-nido-chat, / → /apps
    const appsPath =
      pathname === "/" || pathname === "" ? "/apps" : `/apps${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = appsPath;
    return NextResponse.rewrite(url);
  }

  // Redirect test subdomain to main domain /admin path
  if (isTestHost) {
    const targetUrl = new URL(request.nextUrl.toString());
    targetUrl.hostname = "joinnewearthcollective.com";
    // Map root to /admin, otherwise prefix with /admin
    if (pathname === "/" || pathname === "") {
      targetUrl.pathname = "/admin";
    } else {
      targetUrl.pathname = `/admin${pathname}`;
    }
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
    "/boulder-launch-party",
  ];
  if (deprecatedLandingRoutes.some((route) => pathname.startsWith(route))) {
    const targetUrl = new URL(request.nextUrl.origin);
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // Run analytics tracking (non-blocking, tracks all visits)
  let analyticsResponse: NextResponse;
  try {
    analyticsResponse = await analyticsMiddleware(request);
  } catch (error) {
    console.error("Analytics middleware error:", error);
    analyticsResponse = NextResponse.next();
  }

  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🌐 [Middleware] ${hostname}${pathname} | User: ${user?.email || "None"}`
    );
  }

  // Protect /admin/* routes (except public embeds)
  if (pathname.startsWith("/admin")) {
    // Allow public embed routes without auth
    if (isPublicEmbed(pathname)) {
      analyticsResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          supabaseResponse.headers.append(key, value);
        }
      });
      return supabaseResponse;
    }

    // Require authentication
    if (!user) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("next", pathname);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔒 [Middleware] Auth required for ${pathname}, redirecting to login`
        );
      }

      const redirectResponse = NextResponse.redirect(loginUrl);
      analyticsResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          redirectResponse.headers.append(key, value);
        }
      });
      return redirectResponse;
    }
  }

  // Public routes: If logged in and trying to access login, redirect to admin
  if (pathname === "/login" && user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/admin", request.nextUrl.origin)
    );
    analyticsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        redirectResponse.headers.append(key, value);
      }
    });
    return redirectResponse;
  }

  // Merge analytics cookies with supabase response for all other routes
  analyticsResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
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
