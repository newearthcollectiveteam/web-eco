/**
 * Mailjet Email Provider Implementation
 */

import Mailjet from "node-mailjet";
import type {
  EmailProvider,
  EmailMessage,
  EmailSendResult,
  EmailProviderConfig,
} from "../types";

export class MailjetProvider implements EmailProvider {
  name = "mailjet";
  private client: Mailjet.Client;
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    this.client = Mailjet.apiConnect(config.apiKey, config.apiSecret || "");
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const request = this.client.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: this.config.fromEmail,
              Name: this.config.fromName || "New Earth Collective",
            },
            To: [
              {
                Email: message.to,
                Name: message.toName || message.to.split("@")[0] || "Friend",
              },
            ],
            Subject: message.subject,
            HTMLPart: message.html,
          },
        ],
      });

      const result = await request;
      const data = result.body as {
        Messages?: Array<{
          Status?: string;
          To?: Array<{ MessageID?: string }>;
        }>;
      };

      // Check if rate limited (HTTP 429 or specific error)
      if (result.response.statusCode === 429) {
        return {
          success: false,
          error: "Rate limit exceeded",
          rateLimited: true,
        };
      }

      const messageId = data?.Messages?.[0]?.To?.[0]?.MessageID;

      return {
        success: true,
        messageId: messageId?.toString(),
      };
    } catch (error) {
      // Log the full error for debugging
      console.error("Mailjet send error:", error);

      // Extract detailed error information
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Mailjet errors often have a response property
        const mailjetError = error as any;
        if (mailjetError.response?.body) {
          console.error("Mailjet API response:", mailjetError.response.body);
          errorMessage = JSON.stringify(mailjetError.response.body);
        } else if (mailjetError.statusCode) {
          errorMessage = `Mailjet error (${mailjetError.statusCode}): ${JSON.stringify(error)}`;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else {
        errorMessage = String(error);
      }

      const isRateLimited =
        errorMessage.includes("rate limit") ||
        errorMessage.includes("429") ||
        errorMessage.includes("quota");

      return {
        success: false,
        error: errorMessage,
        rateLimited: isRateLimited,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Mailjet doesn't have a dedicated test endpoint, so we'll try to access the sender list
      const request = this.client.get("sender").request();
      await request;
      return true;
    } catch (error) {
      console.error("Mailjet connection test failed:", error);
      return false;
    }
  }
}
