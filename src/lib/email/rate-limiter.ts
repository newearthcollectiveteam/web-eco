/**
 * Rate Limiting System
 * Tracks and enforces email sending limits to avoid hitting provider quotas
 */

import { db } from "~/server/db";
import { rateLimitTracker } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { getCurrentProviderRateLimits } from "./provider-factory";

export type Period = "hourly" | "daily" | "monthly";

/**
 * Check if we can send an email without exceeding rate limits
 */
export async function checkRateLimit(provider: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}> {
  const limits = getCurrentProviderRateLimits();

  // Check daily limit
  const dailyCheck = await checkPeriodLimit(
    provider,
    "daily",
    limits.dailyLimit
  );
  if (!dailyCheck.allowed) {
    return dailyCheck;
  }

  // Check monthly limit
  const monthlyCheck = await checkPeriodLimit(
    provider,
    "monthly",
    limits.monthlyLimit
  );
  if (!monthlyCheck.allowed) {
    return monthlyCheck;
  }

  // Check hourly limit if configured
  if (limits.hourlyLimit) {
    const hourlyCheck = await checkPeriodLimit(
      provider,
      "hourly",
      limits.hourlyLimit
    );
    if (!hourlyCheck.allowed) {
      return hourlyCheck;
    }
  }

  return { allowed: true };
}

/**
 * Check rate limit for a specific period
 */
async function checkPeriodLimit(
  provider: string,
  period: Period,
  limit: number
): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}> {
  const periodStart = getPeriodStart(period);

  // Get or create tracker for this period
  const tracker = await db.query.rateLimitTracker.findFirst({
    where: and(
      eq(rateLimitTracker.provider, provider),
      eq(rateLimitTracker.period, period),
      gte(rateLimitTracker.periodStart, periodStart)
    ),
  });

  const currentCount = tracker?.emailCount || 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `${period} rate limit exceeded (${currentCount}/${limit})`,
      currentCount,
      limit,
    };
  }

  return {
    allowed: true,
    currentCount,
    limit,
  };
}

/**
 * Increment the rate limit counter after sending an email
 */
export async function incrementRateLimit(provider: string): Promise<void> {
  const periods: Period[] = ["hourly", "daily", "monthly"];

  for (const period of periods) {
    const periodStart = getPeriodStart(period);
    const limits = getCurrentProviderRateLimits();
    const limit =
      period === "hourly"
        ? limits.hourlyLimit || 999999
        : period === "daily"
          ? limits.dailyLimit
          : limits.monthlyLimit;

    // Try to find existing tracker
    const existing = await db.query.rateLimitTracker.findFirst({
      where: and(
        eq(rateLimitTracker.provider, provider),
        eq(rateLimitTracker.period, period),
        gte(rateLimitTracker.periodStart, periodStart)
      ),
    });

    if (existing) {
      // Update existing tracker
      await db
        .update(rateLimitTracker)
        .set({
          emailCount: existing.emailCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(rateLimitTracker.id, existing.id));
    } else {
      // Create new tracker
      await db.insert(rateLimitTracker).values({
        provider,
        period,
        periodStart,
        emailCount: 1,
        limit,
      });
    }
  }
}

/**
 * Get the start timestamp for a period
 */
function getPeriodStart(period: Period): Date {
  const now = new Date();

  switch (period) {
    case "hourly":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        0,
        0,
        0
      );

    case "daily":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );

    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    default:
      throw new Error(`Invalid period: ${period}`);
  }
}

/**
 * Get current rate limit status for monitoring
 */
export async function getRateLimitStatus(provider: string): Promise<{
  hourly?: { count: number; limit: number; percentage: number };
  daily: { count: number; limit: number; percentage: number };
  monthly: { count: number; limit: number; percentage: number };
}> {
  const limits = getCurrentProviderRateLimits();
  const periods: Period[] = ["hourly", "daily", "monthly"];
  const status: Record<
    string,
    { count: number; limit: number; percentage: number }
  > = {};

  for (const period of periods) {
    if (period === "hourly" && !limits.hourlyLimit) continue;

    const periodStart = getPeriodStart(period);
    const tracker = await db.query.rateLimitTracker.findFirst({
      where: and(
        eq(rateLimitTracker.provider, provider),
        eq(rateLimitTracker.period, period),
        gte(rateLimitTracker.periodStart, periodStart)
      ),
    });

    const count = tracker?.emailCount || 0;
    const limit =
      period === "hourly"
        ? limits.hourlyLimit || 999999
        : period === "daily"
          ? limits.dailyLimit
          : limits.monthlyLimit;

    status[period] = {
      count,
      limit,
      percentage: Math.round((count / limit) * 100),
    };
  }

  return status as {
    hourly?: { count: number; limit: number; percentage: number };
    daily: { count: number; limit: number; percentage: number };
    monthly: { count: number; limit: number; percentage: number };
  };
}

/**
 * Check if we're approaching rate limits (> 90%)
 */
export async function isApproachingLimit(provider: string): Promise<boolean> {
  const status = await getRateLimitStatus(provider);

  return (
    status.daily.percentage > 90 ||
    status.monthly.percentage > 90 ||
    (status.hourly && status.hourly.percentage > 90) ||
    false
  );
}
