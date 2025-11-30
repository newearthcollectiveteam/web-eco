/**
 * Multi-domain configuration for the New Earth Collective ecosystem
 * Handles domain-specific routing, branding, and content
 */

export const DOMAINS = {
  NEW_EARTH_COLLECTIVE: "joinnewearthcollective.com",
  LAUNCH: "launch.joinnewearthcollective.com",
  TEST_DOMAIN: "test.joinnewearthcollective.com",
} as const;

export type DomainKey = keyof typeof DOMAINS;
export type DomainValue = (typeof DOMAINS)[DomainKey];

/**
 * Domain configuration with branding and metadata
 */
export const DOMAIN_CONFIG = {
  [DOMAINS.NEW_EARTH_COLLECTIVE]: {
    name: "New Earth Collective",
    description: "Building a Regenerative Future Together",
    theme: "brand",
    primaryColor: "#10b981", // emerald
    logo: "NEC",
    tagline: "Co-creating Sustainable Communities & Systems",
    nav: [
      { name: "About", href: "/about" },
    ],
  },
  [DOMAINS.LAUNCH]: {
    name: "New Earth Collective | Launch",
    description: "Launch experience for the New Earth Collective",
    theme: "launch",
    primaryColor: "#facf39", // golden
    logo: "NEC-LAUNCH",
    tagline: "Join the launch experience",
    nav: [
      { name: "Home", href: "/" },
      { name: "Global", href: "/global" },
      { name: "Questionnaire", href: "/questionnaire" },
    ],
  },
  [DOMAINS.TEST_DOMAIN]: {
    name: "New Earth Collective (Test)",
    description: "Testing Environment",
    theme: "tech",
    primaryColor: "#8b5cf6", // violet
    logo: "NEC-TEST",
    tagline: "Development & Testing Environment",
    nav: [
      { name: "Home", href: "/" },
      { name: "Brand", href: "/brand" },
      { name: "Templates", href: "/templates" },
      { name: "Shaders", href: "/shaders" },
      { name: "Playground", href: "/playground" },
    ],
  },
} as const;

/**
 * Get domain configuration from hostname
 */
export function getDomainConfig(hostname: string) {
  // Handle localhost development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Use URL parameters to simulate different domains in development
    const searchParams = new URLSearchParams(
      globalThis?.location?.search || ""
    );
    const domain = searchParams.get("domain");

    if (domain?.includes("launch")) {
      return DOMAIN_CONFIG[DOMAINS.LAUNCH];
    }

    // Check if domain parameter includes "test"
    if (domain?.includes("test")) {
      return DOMAIN_CONFIG[DOMAINS.TEST_DOMAIN];
    }

    return DOMAIN_CONFIG[DOMAINS.NEW_EARTH_COLLECTIVE]; // Default for localhost
  }

  // Production domain matching
  const domain = hostname.toLowerCase();

  if (domain.includes("test.joinnewearthcollective.com")) {
    return DOMAIN_CONFIG[DOMAINS.TEST_DOMAIN];
  } else if (domain.includes("launch.joinnewearthcollective.com")) {
    return DOMAIN_CONFIG[DOMAINS.LAUNCH];
  } else if (domain.includes("joinnewearthcollective.com")) {
    return DOMAIN_CONFIG[DOMAINS.NEW_EARTH_COLLECTIVE];
  }

  // Default fallback
  return DOMAIN_CONFIG[DOMAINS.NEW_EARTH_COLLECTIVE];
}

/**
 * Get current domain from request headers (server-side)
 */
export function getDomainFromHeaders(headers: Headers): DomainValue {
  const forwardedHost = headers.get("x-forwarded-host") || "";
  const hostHeader = headers.get("host") || "";
  const rawHost = (forwardedHost || hostHeader).toLowerCase();
  const host = rawHost.split(",")[0]?.trim().split(":")[0] || "";

  if (host.includes("test.joinnewearthcollective.com"))
    return DOMAINS.TEST_DOMAIN;
  if (host.includes("launch.joinnewearthcollective.com"))
    return DOMAINS.LAUNCH;
  if (host.includes("joinnewearthcollective.com"))
    return DOMAINS.NEW_EARTH_COLLECTIVE;

  return DOMAINS.NEW_EARTH_COLLECTIVE; // Default
}

/**
 * Check if current path is login area
 */
export function isLoginPath(pathname: string): boolean {
  return pathname.startsWith("/login");
}

/**
 * Development URL helpers for testing different domains
 */
export const DEV_URLS = {
  main: "http://localhost:3000",
  test: "http://localhost:3000?domain=test.joinnewearthcollective.com",
  launch: "http://localhost:3000?domain=launch.joinnewearthcollective.com",
  login: "http://localhost:3000/login",
} as const;
