/**
 * Cron Job: Send Scheduled Emails
 * This endpoint is called every minute by Vercel Cron to process due emails
 *
 * To enable:
 * 1. Add to vercel.json: { "crons": [{ "path": "/api/cron/send-emails", "schedule": "* * * * *" }] }
 * 2. Or manually trigger for testing
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { processDueEmails } from "~/lib/email/email-service";
import {
  getRateLimitStatus,
  isApproachingLimit,
} from "~/lib/email/rate-limiter";

export const maxDuration = 60; // Maximum execution time: 60 seconds
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕐 Cron job started: Processing due emails...");

    // Process due emails
    const stats = await processDueEmails();

    // Check if approaching rate limits
    const provider = process.env.EMAIL_PROVIDER || "mailjet";
    const approachingLimit = await isApproachingLimit(provider);
    const rateLimitStatus = await getRateLimitStatus(provider);

    if (approachingLimit) {
      console.warn(
        "⚠️ WARNING: Approaching email rate limits!",
        rateLimitStatus
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      rateLimitStatus,
      warning: approachingLimit ? "Approaching rate limits" : null,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
