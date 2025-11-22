/**
 * Email Provider Factory
 * Creates and returns the configured email provider
 */

import type { EmailProvider, SupportedProvider } from "./types";
import { MailjetProvider } from "./providers/mailjet";
import { SendGridProvider } from "./providers/sendgrid";
import { ResendProvider } from "./providers/resend";
import { env } from "~/env";

/**
 * Get the configured email provider
 * Provider is selected via EMAIL_PROVIDER env variable (defaults to 'mailjet')
 */
export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ||
    "mailjet") as SupportedProvider;

  switch (provider) {
    case "mailjet":
      return new MailjetProvider({
        apiKey: env.MAILJET_API_KEY,
        apiSecret: env.MAILJET_SECRET_KEY,
        fromEmail: env.MAILJET_FROM_EMAIL,
        fromName: env.MAILJET_FROM_NAME,
      });

    case "sendgrid":
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error(
          "SENDGRID_API_KEY is required when using SendGrid provider"
        );
      }
      return new SendGridProvider({
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || env.MAILJET_FROM_EMAIL,
        fromName: process.env.SENDGRID_FROM_NAME || env.MAILJET_FROM_NAME,
      });

    case "resend":
      if (!process.env.RESEND_API_KEY) {
        throw new Error(
          "RESEND_API_KEY is required when using Resend provider"
        );
      }
      return new ResendProvider({
        apiKey: process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL || env.MAILJET_FROM_EMAIL,
        fromName: process.env.RESEND_FROM_NAME || env.MAILJET_FROM_NAME,
      });

    case "postmark":
      throw new Error(
        "Postmark provider not yet implemented. Use mailjet, sendgrid, or resend."
      );

    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}

/**
 * Get rate limits for the current provider
 */
export function getCurrentProviderRateLimits() {
  const provider = (process.env.EMAIL_PROVIDER ||
    "mailjet") as SupportedProvider;
  const { PROVIDER_RATE_LIMITS } = require("./types");
  return PROVIDER_RATE_LIMITS[provider];
}
