/**
 * Email Provider Types and Interfaces
 * Supports multiple email providers with a unified interface
 */

export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  from?: {
    email: string;
    name: string;
  };
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface EmailProviderConfig {
  apiKey: string;
  apiSecret?: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Base interface that all email providers must implement
 */
export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
  testConnection(): Promise<boolean>;
}

export type SupportedProvider = "mailjet" | "sendgrid" | "resend" | "postmark";

/**
 * Rate limit configuration for different providers
 */
export interface RateLimitConfig {
  hourlyLimit?: number;
  dailyLimit: number;
  monthlyLimit: number;
  minDelayMs: number; // Minimum delay between sends
}

export const PROVIDER_RATE_LIMITS: Record<SupportedProvider, RateLimitConfig> =
  {
    mailjet: {
      dailyLimit: 200, // Free tier
      monthlyLimit: 6000, // Free tier
      minDelayMs: 100, // ~10 per second
    },
    sendgrid: {
      dailyLimit: 100, // Free tier
      monthlyLimit: 3000, // Free tier (100/day * 30)
      minDelayMs: 100,
    },
    resend: {
      dailyLimit: 100, // Free tier
      monthlyLimit: 3000, // Free tier
      minDelayMs: 100,
    },
    postmark: {
      dailyLimit: 100, // Free tier
      monthlyLimit: 3000, // Free tier
      minDelayMs: 100,
    },
  };
