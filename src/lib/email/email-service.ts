/**
 * Email Service
 * Main interface for scheduling and sending emails
 */

import { db } from "~/server/db";
import { scheduledEmails, emailSendLog } from "~/server/db/schema";
import { getEmailProvider } from "./provider-factory";
import { checkRateLimit, incrementRateLimit } from "./rate-limiter";
import { getSequenceConfig } from "./sequences";
import { render } from "@react-email/components";
import { eq, and, lte } from "drizzle-orm";

interface ScheduleSequenceParams {
  sequenceName: string;
  recipientEmail: string;
  recipientName?: string;
  contactId?: number; // Link to master CRM contact
  templateData?: Record<string, unknown>;
}

/**
 * Schedule an entire email sequence for a recipient
 */
export async function scheduleEmailSequence(
  params: ScheduleSequenceParams
): Promise<{
  success: boolean;
  scheduledCount: number;
  error?: string;
}> {
  const {
    sequenceName,
    recipientEmail,
    recipientName,
    contactId,
    templateData,
  } = params;

  // Get sequence configuration
  const sequenceConfig = getSequenceConfig(sequenceName);
  if (!sequenceConfig) {
    return {
      success: false,
      scheduledCount: 0,
      error: `Sequence '${sequenceName}' not found`,
    };
  }

  if (!sequenceConfig.isActive) {
    return {
      success: false,
      scheduledCount: 0,
      error: `Sequence '${sequenceName}' is not active`,
    };
  }

  try {
    const now = new Date();
    const emailsToSchedule: (typeof scheduledEmails.$inferInsert)[] = [];

    // Create scheduled email records for each email in the sequence
    for (const email of sequenceConfig.emails) {
      const scheduledFor = new Date(
        now.getTime() + email.delayMinutes * 60 * 1000
      );

      emailsToSchedule.push({
        contactId: contactId || null,
        sequenceName,
        emailNumber: email.emailNumber,
        recipientEmail,
        recipientName: recipientName || null,
        subject: email.subject,
        templateName: email.templateName,
        templateData: templateData || null,
        scheduledFor,
        status: "pending",
        retryCount: 0,
      });
    }

    // Insert all scheduled emails
    await db.insert(scheduledEmails).values(emailsToSchedule);

    console.log(
      `✅ Scheduled ${emailsToSchedule.length} emails for ${recipientEmail} (${sequenceName})`
    );

    return {
      success: true,
      scheduledCount: emailsToSchedule.length,
    };
  } catch (error) {
    console.error("Error scheduling email sequence:", error);
    return {
      success: false,
      scheduledCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process due emails (called by cron job)
 * Returns the number of emails sent
 */
export async function processDueEmails(): Promise<{
  processed: number;
  sent: number;
  failed: number;
  rateLimited: number;
}> {
  const stats = {
    processed: 0,
    sent: 0,
    failed: 0,
    rateLimited: 0,
  };

  try {
    const provider = getEmailProvider();
    const now = new Date();

    // Get emails that are due to be sent
    const dueEmails = await db.query.scheduledEmails.findMany({
      where: and(
        eq(scheduledEmails.status, "pending"),
        lte(scheduledEmails.scheduledFor, now)
      ),
      limit: 50, // Process max 50 emails per run to avoid timeout
      orderBy: (emails, { asc }) => [asc(emails.scheduledFor)],
    });

    console.log(`📧 Processing ${dueEmails.length} due emails...`);

    for (const email of dueEmails) {
      stats.processed++;

      // Check rate limits before sending
      const rateLimitCheck = await checkRateLimit(provider.name);
      if (!rateLimitCheck.allowed) {
        console.log(`⚠️ Rate limit reached: ${rateLimitCheck.reason}`);
        stats.rateLimited++;
        // Don't mark as failed, will retry later
        continue;
      }

      try {
        // Render email template
        const emailHtml = await renderEmailTemplate(email.templateName, {
          recipientName: email.recipientName || "Friend",
          emailNumber: email.emailNumber,
          ...((email.templateData as object) || {}),
        });

        // Send email
        const result = await provider.send({
          to: email.recipientEmail,
          toName: email.recipientName || undefined,
          subject: email.subject,
          html: emailHtml,
        });

        if (result.success) {
          // Mark as sent
          await db
            .update(scheduledEmails)
            .set({
              status: "sent",
              sentAt: new Date(),
            })
            .where(eq(scheduledEmails.id, email.id));

          // Log successful send
          await db.insert(emailSendLog).values({
            contactId: email.contactId,
            scheduledEmailId: email.id,
            recipientEmail: email.recipientEmail,
            recipientName: email.recipientName,
            subject: email.subject,
            provider: provider.name,
            status: "success",
            providerResponse: result.messageId
              ? { messageId: result.messageId }
              : null,
          });

          // Increment rate limit counter
          await incrementRateLimit(provider.name);

          stats.sent++;
          console.log(`✅ Sent: ${email.subject} to ${email.recipientEmail}`);

          // Add delay between sends to avoid bursting
          await sleep(200); // 200ms delay
        } else {
          // Handle failure
          await handleEmailFailure(
            email.id,
            result.error || "Unknown error",
            result.rateLimited || false
          );
          if (result.rateLimited) {
            stats.rateLimited++;
          } else {
            stats.failed++;
          }
        }
      } catch (error) {
        console.error(`Error sending email ${email.id}:`, error);
        await handleEmailFailure(
          email.id,
          error instanceof Error ? error.message : "Unknown error",
          false
        );
        stats.failed++;
      }
    }

    console.log(`📊 Email processing complete:`, stats);
    return stats;
  } catch (error) {
    console.error("Error processing due emails:", error);
    return stats;
  }
}

/**
 * Handle email sending failure with retry logic
 */
async function handleEmailFailure(
  emailId: number,
  error: string,
  isRateLimited: boolean
): Promise<void> {
  const email = await db.query.scheduledEmails.findFirst({
    where: eq(scheduledEmails.id, emailId),
  });

  if (!email) return;

  const maxRetries = 3;
  const newRetryCount = email.retryCount + 1;

  if (newRetryCount >= maxRetries && !isRateLimited) {
    // Max retries reached, mark as failed
    await db
      .update(scheduledEmails)
      .set({
        status: "failed",
        error,
        retryCount: newRetryCount,
        lastRetryAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));

    // Log failure
    await db.insert(emailSendLog).values({
      contactId: email.contactId,
      scheduledEmailId: emailId,
      recipientEmail: email.recipientEmail,
      recipientName: email.recipientName,
      subject: email.subject,
      provider: getEmailProvider().name,
      status: "failed",
      error,
    });

    console.error(
      `❌ Email ${emailId} failed permanently after ${maxRetries} retries`
    );
  } else {
    // Schedule retry with exponential backoff
    const delays = [1, 5, 15]; // minutes
    const delayMinutes = isRateLimited ? 10 : delays[email.retryCount] || 15;
    const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000);

    await db
      .update(scheduledEmails)
      .set({
        scheduledFor: nextRetry,
        error,
        retryCount: newRetryCount,
        lastRetryAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));

    console.log(
      `🔄 Scheduled retry ${newRetryCount} for email ${emailId} in ${delayMinutes} minutes`
    );
  }
}

/**
 * Render an email template
 */
async function renderEmailTemplate(
  templateName: string,
  data: Record<string, unknown>
): Promise<string> {
  // Dynamically import the email template
  let EmailComponent;

  try {
    const module = await import(`../../../emails/${templateName}`);
    EmailComponent = module.default;
  } catch (error) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  return render(EmailComponent(data), { pretty: false }); // Minimize size to avoid Gmail clipping
}

/**
 * Sleep utility for delays between sends
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cancel a scheduled email or sequence
 */
export async function cancelScheduledEmails(params: {
  recipientEmail?: string;
  sequenceName?: string;
  emailId?: number;
}): Promise<{ cancelledCount: number }> {
  const conditions = [];

  if (params.emailId) {
    conditions.push(eq(scheduledEmails.id, params.emailId));
  }
  if (params.recipientEmail) {
    conditions.push(eq(scheduledEmails.recipientEmail, params.recipientEmail));
  }
  if (params.sequenceName) {
    conditions.push(eq(scheduledEmails.sequenceName, params.sequenceName));
  }

  if (conditions.length === 0) {
    return { cancelledCount: 0 };
  }

  const result = await db
    .update(scheduledEmails)
    .set({ status: "cancelled" })
    .where(and(eq(scheduledEmails.status, "pending"), ...conditions));

  // Note: Drizzle doesn't return affected rows count directly
  // You may need to query first to get the count
  return { cancelledCount: 0 }; // Placeholder
}
