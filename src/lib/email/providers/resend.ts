/**
 * Resend Email Provider Implementation
 * To use: npm install resend
 */

import type {
  EmailProvider,
  EmailMessage,
  EmailSendResult,
  EmailProviderConfig,
} from "../types";

export class ResendProvider implements EmailProvider {
  name = "resend";
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      // Lazy load Resend to avoid requiring it if not used
      const { Resend } = await import("resend");
      const resend = new Resend(this.config.apiKey);

      const result = await resend.emails.send({
        from: message.from
          ? `${message.from.name} <${message.from.email}>`
          : `${this.config.fromName} <${this.config.fromEmail}>`,
        to: message.toName ? `${message.toName} <${message.to}>` : message.to,
        subject: message.subject,
        html: message.html,
      });

      if (result.error) {
        const isRateLimited =
          result.error.message?.includes("rate limit") ||
          result.error.message?.includes("429");

        return {
          success: false,
          error: result.error.message,
          rateLimited: isRateLimited,
        };
      }

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isRateLimited =
        errorMessage.includes("rate limit") || errorMessage.includes("429");

      return {
        success: false,
        error: errorMessage,
        rateLimited: isRateLimited,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(this.config.apiKey);
      // Resend doesn't have a dedicated test endpoint
      // We'll just verify the API key is set
      return !!this.config.apiKey && this.config.apiKey.length > 0;
    } catch (error) {
      console.error("Resend connection test failed:", error);
      return false;
    }
  }
}
