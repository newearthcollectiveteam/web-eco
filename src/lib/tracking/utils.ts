/**
 * Tracking Utilities
 * Helper functions for tracking, IDs, cookies, and hashing
 * Edge Runtime compatible - uses Web Crypto API instead of Node.js crypto
 */

/**
 * Generate random bytes using Web Crypto API (Edge Runtime compatible)
 */
function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a unique anonymous ID
 * Format: anon_550e8400-e29b-41d4-a716-446655440000
 */
export function generateAnonymousId(): string {
  const uuid = bytesToHex(getRandomBytes(16));
  const formatted = [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32),
  ].join("-");
  return `anon_${formatted}`;
}

/**
 * Generate a unique session ID
 * Format: sess_550e8400-e29b-41d4-a716-446655440000
 */
export function generateSessionId(): string {
  const uuid = bytesToHex(getRandomBytes(16));
  const formatted = [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32),
  ].join("-");
  return `sess_${formatted}`;
}

/**
 * Generate email tracking token
 * Format: et_[contactId]_[timestamp]_[randomHash]
 * Example: et_123_1732847600_a1b2c3d4
 */
export function generateEmailToken(contactId: number): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomHash = bytesToHex(getRandomBytes(4));
  return `et_${contactId}_${timestamp}_${randomHash}`;
}

/**
 * Parse email tracking token
 * Returns: { contactId, timestamp, hash } or null if invalid
 */
export function parseEmailToken(token: string): {
  contactId: number;
  timestamp: number;
  hash: string;
} | null {
  const parts = token.split("_");
  if (parts.length !== 4 || parts[0] !== "et") {
    return null;
  }

  const contactId = parseInt(parts[1]!, 10);
  const timestamp = parseInt(parts[2]!, 10);
  const hash = parts[3]!;

  if (isNaN(contactId) || isNaN(timestamp)) {
    return null;
  }

  return { contactId, timestamp, hash };
}

/**
 * Hash IP address for privacy
 * Uses SHA-256 with optional salt (Edge Runtime compatible)
 */
export async function hashIpAddress(
  ip: string,
  salt?: string
): Promise<string> {
  const saltValue = salt || process.env.IP_HASH_SALT || "default-salt";
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + saltValue);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return bytesToHex(hashArray);
}

/**
 * Extract UTM parameters from URL
 */
export function extractUtmParams(url: string | URL): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
} {
  const urlObj = typeof url === "string" ? new URL(url) : url;

  return {
    utmSource: urlObj.searchParams.get("utm_source") || undefined,
    utmMedium: urlObj.searchParams.get("utm_medium") || undefined,
    utmCampaign: urlObj.searchParams.get("utm_campaign") || undefined,
    utmContent: urlObj.searchParams.get("utm_content") || undefined,
    utmTerm: urlObj.searchParams.get("utm_term") || undefined,
  };
}

/**
 * Parse User-Agent string to extract device, browser, OS
 */
export function parseUserAgent(userAgent: string): {
  device: string;
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();

  // Detect device
  let device = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    device = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    device = "mobile";
  }

  // Detect browser
  let browser = "unknown";
  if (ua.includes("edge") || ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("msie") || ua.includes("trident/")) {
    browser = "IE";
  }

  // Detect OS
  let os = "unknown";
  if (ua.includes("win")) {
    os = "Windows";
  } else if (ua.includes("mac")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (
    ua.includes("ios") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    os = "iOS";
  }

  return { device, browser, os };
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Vercel-specific header
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp;
  }

  return "unknown";
}

/**
 * Cookie management utilities
 */
export const COOKIE_NAMES = {
  ANONYMOUS_ID: "nec_aid",
  SESSION_ID: "nec_sid",
  CONTACT_ID: "nec_cid",
} as const;

export const COOKIE_OPTIONS = {
  // Anonymous ID - 1 year
  anonymousId: {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Accessible to JavaScript
    sameSite: "lax" as const,
  },
  // Session ID - 30 minutes
  sessionId: {
    maxAge: 30 * 60,
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    sameSite: "lax" as const,
  },
  // Contact ID - 1 year, HTTP-only for security
  contactId: {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true, // Protected from JavaScript
    sameSite: "lax" as const,
  },
} as const;

/**
 * Set cookie with proper formatting
 */
export function setCookieHeader(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }
): string {
  const parts = [`${name}=${value}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

/**
 * Parse cookies from request header
 */
export function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
      return cookies;
    },
    {} as Record<string, string>
  );
}

/**
 * Generate slug from text (for URL-safe strings)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .trim();
}

/**
 * Check if session should be considered expired
 */
export function isSessionExpired(
  lastActivityAt: Date,
  expirationMinutes = 30
): boolean {
  const now = new Date();
  const diffMs = now.getTime() - lastActivityAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > expirationMinutes;
}

/**
 * Validate email token is not expired (90 days)
 */
export function isEmailTokenExpired(
  timestamp: number,
  expirationDays = 90
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = now - timestamp;
  const diffDays = diffSeconds / (60 * 60 * 24);
  return diffDays > expirationDays;
}
