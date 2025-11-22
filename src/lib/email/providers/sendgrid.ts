/**
 * SendGrid Email Provider Implementation
 * To use: npm install @sendgrid/mail
 */

import type {
  EmailProvider,
  EmailMessage,
  EmailSendResult,
  EmailProviderConfig,
} from "../types";

export class SendGridProvider implements EmailProvider {
  name = "sendgrid";
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      // Lazy load SendGrid to avoid requiring it if not used
      const sgMail = await import("@sendgrid/mail");
      sgMail.default.setApiKey(this.config.apiKey);

      await sgMail.default.send({
        to: {
          email: message.to,
          name: message.toName,
        },
        from: message.from || {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        subject: message.subject,
        html: message.html,
      });

      return {
        success: true,
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
      const sgMail = await import("@sendgrid/mail");
      sgMail.default.setApiKey(this.config.apiKey);
      // SendGrid doesn't have a test endpoint, assume valid if API key is set
      return !!this.config.apiKey;
    } catch (error) {
      console.error("SendGrid connection test failed:", error);
      return false;
    }
  }
}
