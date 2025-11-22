/**
 * Email Status API
 * Get current status of email system including rate limits and scheduled emails
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getRateLimitStatus } from "~/lib/email/rate-limiter";
import { db } from "~/server/db";
import { scheduledEmails, emailSendLog } from "~/server/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const provider = process.env.EMAIL_PROVIDER || "mailjet";

    // Get rate limit status
    const rateLimits = await getRateLimitStatus(provider);

    // Get scheduled emails count by status
    const scheduledStats = await db
      .select({
        status: scheduledEmails.status,
        count: sql<number>`count(*)::int`,
      })
      .from(scheduledEmails)
      .groupBy(scheduledEmails.status);

    // Get recent scheduled emails
    const recentScheduled = await db.query.scheduledEmails.findMany({
      limit: 10,
      orderBy: [desc(scheduledEmails.createdAt)],
    });

    // Get today's send logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = await db.query.emailSendLog.findMany({
      where: gte(emailSendLog.sentAt, today),
      limit: 20,
      orderBy: [desc(emailSendLog.sentAt)],
    });

    const todayStats = await db
      .select({
        status: emailSendLog.status,
        count: sql<number>`count(*)::int`,
      })
      .from(emailSendLog)
      .where(gte(emailSendLog.sentAt, today))
      .groupBy(emailSendLog.status);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      provider,
      rateLimits,
      scheduled: {
        byStatus: scheduledStats,
        recent: recentScheduled,
      },
      today: {
        stats: todayStats,
        recentSends: todayLogs,
      },
    });
  } catch (error) {
    console.error("Error getting email status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
