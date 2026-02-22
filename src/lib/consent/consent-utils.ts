/**
 * Consent Management Utilities
 * Handles consent tracking, unsubscribe tokens, and compliance
 */

import crypto from "crypto";

/**
 * Generates a secure unsubscribe token
 * @returns 64-character random hex string
 */
export function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Gets the user's IP address from request headers
 * Handles various proxy configurations
 */
export function getClientIP(headers: Headers): string | null {
  // Check common proxy headers
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

/**
 * Validates consent data
 */
export function validateConsent(data: {
  emailConsent: boolean;
  smsConsent: boolean;
}): boolean {
  // At least one consent type must be granted
  return data.emailConsent || data.smsConsent;
}

/**
 * Creates consent metadata for database storage
 */
export function createConsentMetadata(params: {
  emailConsent: boolean;
  smsConsent: boolean;
  ipAddress: string | null;
  source: string;
}) {
  return {
    emailConsent: params.emailConsent,
    smsConsent: params.smsConsent,
    consentGrantedAt: new Date(),
    consentIpAddress: params.ipAddress,
    consentSource: params.source,
    unsubscribeToken: generateUnsubscribeToken(),
  };
}

/**
 * Generates unsubscribe URL for emails/SMS
 */
export function generateUnsubscribeUrl(
  baseUrl: string,
  token: string,
  type: "email" | "sms" | "all" = "all"
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  return `${cleanBaseUrl}/unsubscribe?token=${token}&type=${type}`;
}
