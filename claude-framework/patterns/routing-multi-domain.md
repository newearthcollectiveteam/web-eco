# Multi-Domain Routing Pattern

> Serve different content/branding from a single Next.js codebase based on hostname or subdomain.

## Problem It Solves

You have one codebase but need to serve:

- Multiple brands (whitelabel)
- Multiple environments with different features (staging vs production)
- Subdomains with different functionality (app.example.com vs docs.example.com)
- Multi-tenant applications where each tenant has their own subdomain

Without this pattern, you'd need separate deployments or complex build-time configuration.

## When to Use

- **Multi-brand/whitelabel apps** - Same product, different branding per client
- **Environment-specific features** - Test domain has admin tools, production doesn't
- **Subdomain-based routing** - blog.site.com, app.site.com, api.site.com
- **Staged rollouts** - beta.site.com gets new features first
- **Multi-tenant SaaS** - tenant1.yourapp.com, tenant2.yourapp.com

## When NOT to Use

- **Single-domain apps** - Adds unnecessary complexity
- **Different codebases** - If domains need fundamentally different code, use separate repos
- **Simple staging/production** - Use environment variables instead
- **Internationalization only** - Use Next.js i18n routing instead

## Key Files

```
src/
├── lib/
│   └── domains.ts          # Domain configuration and helpers
├── middleware.ts           # Runtime domain detection and routing
└── components/
    └── domain-layout.tsx   # Domain-aware layout wrapper (optional)
```

## Implementation

### 1. Domain Configuration (`src/lib/domains.ts`)

```typescript
/**
 * Multi-domain configuration
 * Centralized place for all domain-specific settings
 */

export const DOMAINS = {
  MAIN: "example.com",
  APP: "app.example.com",
  ADMIN: "admin.example.com",
  STAGING: "staging.example.com",
} as const;

export type DomainKey = keyof typeof DOMAINS;
export type DomainValue = (typeof DOMAINS)[DomainKey];

/**
 * Domain configuration with branding and metadata
 */
export const DOMAIN_CONFIG = {
  [DOMAINS.MAIN]: {
    name: "Example",
    description: "Main marketing site",
    theme: "marketing",
    primaryColor: "#3b82f6",
    nav: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Pricing", href: "/pricing" },
    ],
    features: {
      showBlog: true,
      showPricing: true,
    },
  },
  [DOMAINS.APP]: {
    name: "Example App",
    description: "Application dashboard",
    theme: "app",
    primaryColor: "#10b981",
    nav: [
      { name: "Dashboard", href: "/" },
      { name: "Settings", href: "/settings" },
    ],
    features: {
      showBlog: false,
      showPricing: false,
    },
  },
  [DOMAINS.ADMIN]: {
    name: "Example Admin",
    description: "Admin panel",
    theme: "admin",
    primaryColor: "#8b5cf6",
    nav: [
      { name: "Users", href: "/users" },
      { name: "Analytics", href: "/analytics" },
    ],
    features: {
      showBlog: false,
      showPricing: false,
    },
  },
  [DOMAINS.STAGING]: {
    name: "Example (Staging)",
    description: "Staging environment",
    theme: "staging",
    primaryColor: "#f59e0b",
    nav: [
      { name: "Home", href: "/" },
      { name: "Debug", href: "/debug" },
    ],
    features: {
      showBlog: true,
      showPricing: true,
      showDebugTools: true, // Staging-only feature
    },
  },
} as const;

/**
 * Get domain configuration from hostname
 */
export function getDomainConfig(hostname: string) {
  // Handle localhost development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Use URL parameters to simulate different domains in development
    // e.g., localhost:3000?domain=admin
    const searchParams = new URLSearchParams(
      globalThis?.location?.search || ""
    );
    const domain = searchParams.get("domain");

    if (domain === "admin") return DOMAIN_CONFIG[DOMAINS.ADMIN];
    if (domain === "app") return DOMAIN_CONFIG[DOMAINS.APP];
    if (domain === "staging") return DOMAIN_CONFIG[DOMAINS.STAGING];

    return DOMAIN_CONFIG[DOMAINS.MAIN]; // Default for localhost
  }

  // Production domain matching (order matters - check subdomains first)
  const host = hostname.toLowerCase();

  if (host.includes("admin.example.com")) {
    return DOMAIN_CONFIG[DOMAINS.ADMIN];
  }
  if (host.includes("app.example.com")) {
    return DOMAIN_CONFIG[DOMAINS.APP];
  }
  if (host.includes("staging.example.com")) {
    return DOMAIN_CONFIG[DOMAINS.STAGING];
  }
  if (host.includes("example.com")) {
    return DOMAIN_CONFIG[DOMAINS.MAIN];
  }

  // Default fallback
  return DOMAIN_CONFIG[DOMAINS.MAIN];
}

/**
 * Get domain from request headers (server-side)
 */
export function getDomainFromHeaders(headers: Headers): DomainValue {
  const forwardedHost = headers.get("x-forwarded-host") || "";
  const hostHeader = headers.get("host") || "";
  const rawHost = (forwardedHost || hostHeader).toLowerCase();
  const host = rawHost.split(",")[0]?.trim().split(":")[0] || "";

  if (host.includes("admin.example.com")) return DOMAINS.ADMIN;
  if (host.includes("app.example.com")) return DOMAINS.APP;
  if (host.includes("staging.example.com")) return DOMAINS.STAGING;
  if (host.includes("example.com")) return DOMAINS.MAIN;

  return DOMAINS.MAIN; // Default
}

/**
 * Development URL helpers
 */
export const DEV_URLS = {
  main: "http://localhost:3000",
  app: "http://localhost:3000?domain=app",
  admin: "http://localhost:3000?domain=admin",
  staging: "http://localhost:3000?domain=staging",
} as const;
```

### 2. Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes restricted to specific domains
 */
const ADMIN_ONLY_ROUTES = ["/users", "/analytics", "/system"];
const APP_ONLY_ROUTES = ["/dashboard", "/settings", "/billing"];

/**
 * Check domain type from hostname
 */
function getDomainType(hostname: string, domainParam?: string): string {
  // Support ?domain= param for local development
  if (domainParam) return domainParam;

  const host = hostname.toLowerCase();
  if (host.includes("admin.")) return "admin";
  if (host.includes("app.")) return "app";
  if (host.includes("staging.")) return "staging";
  return "main";
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const domainParam = request.nextUrl.searchParams.get("domain") || undefined;

  const domainType = getDomainType(hostname, domainParam);

  // Block admin routes on non-admin domains
  if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (domainType !== "admin") {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Block app routes on non-app domains
  if (APP_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (domainType !== "app" && domainType !== "admin") {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Add domain info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set("x-domain-type", domainType);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif)).*)",
  ],
};
```

### 3. Domain-Aware Layout (Optional)

```typescript
// src/components/domain-layout.tsx
"use client";

import { useEffect, useState } from "react";
import { getDomainConfig, DOMAIN_CONFIG, DOMAINS } from "~/lib/domains";

type DomainConfig = (typeof DOMAIN_CONFIG)[keyof typeof DOMAIN_CONFIG];

export function DomainLayout({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DomainConfig>(
    DOMAIN_CONFIG[DOMAINS.MAIN]
  );

  useEffect(() => {
    const hostname = window.location.hostname;
    setConfig(getDomainConfig(hostname));
  }, []);

  return (
    <div data-theme={config.theme}>
      <header style={{ borderColor: config.primaryColor }}>
        <h1>{config.name}</h1>
        <nav>
          {config.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.name}
            </a>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### 4. Server Component Usage

```typescript
// src/app/page.tsx
import { headers } from "next/headers";
import { getDomainFromHeaders, DOMAIN_CONFIG, DOMAINS } from "~/lib/domains";

export default async function HomePage() {
  const headersList = await headers();
  const domain = getDomainFromHeaders(headersList);
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG[DOMAINS.MAIN];

  return (
    <div>
      <h1>Welcome to {config.name}</h1>
      <p>{config.description}</p>

      {config.features.showPricing && (
        <a href="/pricing">View Pricing</a>
      )}

      {config.features.showDebugTools && (
        <a href="/debug">Debug Tools</a>
      )}
    </div>
  );
}
```

## Local Development

Test different domains locally using URL parameters:

```
http://localhost:3000              → Main domain
http://localhost:3000?domain=app   → App subdomain
http://localhost:3000?domain=admin → Admin subdomain
```

Document these in your project's CLAUDE.md or README.

## DNS & Deployment

For production, configure your DNS:

```
example.com        → A record → your-server-ip
*.example.com      → A record → your-server-ip (wildcard for subdomains)
```

Or use platform-specific domain configuration (Vercel, Netlify, etc.).

## Variations

### Multi-Tenant (Dynamic Subdomains)

For tenant-based routing where subdomains are dynamic:

```typescript
export function getTenantFromHostname(hostname: string): string | null {
  const match = hostname.match(/^([^.]+)\.yourapp\.com$/);
  return match?.[1] || null;
}
```

Then fetch tenant config from database instead of static config.

### Feature Flags per Domain

Combine with feature flags for gradual rollouts:

```typescript
const DOMAIN_FEATURES = {
  [DOMAINS.STAGING]: ["new-checkout", "ai-search", "beta-ui"],
  [DOMAINS.MAIN]: ["new-checkout"], // Already rolled out
  [DOMAINS.APP]: [],
};

export function hasFeature(domain: DomainValue, feature: string): boolean {
  return DOMAIN_FEATURES[domain]?.includes(feature) ?? false;
}
```

## Advanced Techniques

### Non-Blocking Analytics Middleware

Run analytics tracking on every request without blocking page loads:

```typescript
let analyticsResponse: NextResponse;
try {
  analyticsResponse = await analyticsMiddleware(request);
} catch (error) {
  console.error("Analytics middleware error:", error);
  analyticsResponse = NextResponse.next(); // Never block on analytics failure
}
```

### Cookie Merging Across Middleware Layers

When multiple middleware layers set cookies (auth + analytics), merge them:

```typescript
// Merge analytics cookies into the auth/main response
analyticsResponse.headers.forEach((value, key) => {
  if (key.toLowerCase() === "set-cookie") {
    mainResponse.headers.append(key, value);
  }
});
return mainResponse;
```

### Deprecated Route Cleanup

Auto-redirect old routes to prevent 404s:

```typescript
const deprecatedRoutes = ["/old-landing", "/v1/signup", "/beta"];
if (deprecatedRoutes.some((r) => pathname.startsWith(r))) {
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 301,
  });
}
```

### Rewrite vs. Redirect

- **Rewrite** (URL stays the same): Use for subdomain → path mapping (`apps.site.com/chat` → `/apps/chat`)
- **Redirect** (URL changes): Use for deprecated domains or canonical URLs

```typescript
// Rewrite: URL stays as apps.site.com/chat
if (isAppsHost) {
  const url = request.nextUrl.clone();
  url.pathname = `/apps${pathname}`;
  return NextResponse.rewrite(url);
}

// Redirect: URL changes to main domain
if (isDeprecatedHost) {
  const targetUrl = new URL(request.nextUrl.toString());
  targetUrl.hostname = "example.com";
  return NextResponse.redirect(targetUrl, { status: 301 });
}
```

### Public Embed Exceptions

Allow specific routes within protected areas to be public:

```typescript
const PUBLIC_EMBED_ROUTES = ["/admin/widgets/embed"];

if (
  pathname.startsWith("/admin") &&
  !PUBLIC_EMBED_ROUTES.some((r) => pathname.startsWith(r))
) {
  if (!user) return NextResponse.redirect(loginUrl);
}
```

## Source

Extracted from: `web-eco` (New Earth Collective)

- Multi-subdomain site serving different experiences (main, launch, test, apps)
- Domain-specific navigation and theming
- Non-blocking analytics tracking on all routes
- Cookie merging between auth and analytics middleware
- Public embed exceptions within protected admin areas
- Deprecated route 301 cleanup
