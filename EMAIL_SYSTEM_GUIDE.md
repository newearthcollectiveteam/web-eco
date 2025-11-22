# Email Sequence System - Complete Guide

## Overview

A production-ready, modular email sequence system with:

- ✅ Database-backed scheduling (PostgreSQL)
- ✅ Cron job processing (Vercel Cron)
- ✅ Rate limiting protection
- ✅ Multiple email provider support (Mailjet, SendGrid, Resend)
- ✅ Retry logic with exponential backoff
- ✅ Comprehensive logging and monitoring

## Architecture

```
Form Submission → Schedule in DB → Cron checks every minute → Send due emails
                                         ↓
                                  Rate limit check
                                         ↓
                                  Email provider
                                         ↓
                                  Log & increment
```

## Quick Start

### 1. Database Setup

Update your database password in `.env`:

```bash
DATABASE_URL="postgresql://postgres.wroehiostvueldeucaze:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

Push the database schema:

```bash
npm run db:push
```

### 2. Email Provider Configuration

Current provider: **Mailjet** (free tier: 200/day, 6000/month)

Already configured in `.env`:

```bash
MAILJET_API_KEY="c96e788abe5cdd1eec619781309eb237"
MAILJET_SECRET_KEY="66049f81a199c237276794372642b7d9"
MAILJET_FROM_EMAIL="noreply@joinnewearthcollective.com"
MAILJET_FROM_NAME="New Earth Collective"
```

### 3. Cron Job Setup

**Local Development:**
Manually trigger the cron job:

```bash
curl http://localhost:3000/api/cron/send-emails
```

**Production (Vercel):**
Already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "* * * * *"
    }
  ]
}
```

Runs every minute automatically after deployment.

### 4. Test the System

Visit: `http://localhost:3000/form-builder`

Fill out the form to trigger the test email sequence.

## Adding New Email Sequences

### Step 1: Define the Sequence

Edit `src/lib/email/sequences.ts`:

```typescript
export const EMAIL_SEQUENCES: Record<string, EmailSequenceConfig> = {
  // ... existing sequences ...

  "my-new-sequence": {
    name: "my-new-sequence",
    description: "Description of your sequence",
    isActive: true,
    emails: [
      {
        emailNumber: 1,
        delayMinutes: 0, // Immediate
        subject: "Welcome!",
        templateName: "welcome-email", // Must match file in /emails
      },
      {
        emailNumber: 2,
        delayMinutes: 60, // 1 hour later
        subject: "Getting Started",
        templateName: "welcome-email",
      },
      {
        emailNumber: 3,
        delayMinutes: 24 * 60, // 1 day later
        subject: "Resources for You",
        templateName: "welcome-email",
      },
    ],
  },
};
```

### Step 2: Create Email Template (Optional)

If using a new template, create `/emails/welcome-email.tsx`:

```typescript
import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  recipientName?: string;
}

export default function WelcomeEmail({ recipientName = 'Friend' }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hello {recipientName}!</Text>
          <Text>Welcome to our community.</Text>
          <Button href="https://joinnewearthcollective.com">
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

### Step 3: Use in Your Form

```typescript
const result = await fetch("/api/form-submission", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    name: "John Doe",
    sequenceName: "my-new-sequence", // Your sequence name
  }),
});
```

## Switching Email Providers

### To SendGrid:

1. Install package:

```bash
npm install @sendgrid/mail
```

2. Add to `.env`:

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Name
```

### To Resend:

1. Install package:

```bash
npm install resend
```

2. Add to `.env`:

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your Name
```

## Monitoring

### Get Email System Status

```bash
curl http://localhost:3000/api/email-status
```

Response includes:

- Rate limit usage (hourly, daily, monthly)
- Scheduled emails by status
- Recent sends
- Today's statistics

### Manual Cron Trigger

```bash
curl http://localhost:3000/api/cron/send-emails
```

## Rate Limiting

### Current Limits (Mailjet Free Tier)

- Daily: 200 emails
- Monthly: 6,000 emails
- Minimum delay between sends: 100ms

### Safeguards

- ✅ Automatic rate limit checking before each send
- ✅ Warning at 90% capacity
- ✅ Emails queued if limit reached
- ✅ Automatic retry when limit resets

### When Approaching Limits

The system will:

1. Log warning messages
2. Continue scheduling (won't send immediately)
3. Process when limit resets
4. Recommended: Upgrade your plan or switch provider

## Database Tables

### `email_sequences`

Configuration for reusable sequences

### `scheduled_emails`

Individual emails queued for delivery

### `email_send_log`

Complete history of all send attempts

### `rate_limit_tracker`

Tracks sends per period for rate limiting

## Troubleshooting

### Emails Not Sending

1. Check cron is running: `curl http://localhost:3000/api/cron/send-emails`
2. Check database: Verify scheduled_emails table has pending emails
3. Check rate limits: `curl http://localhost:3000/api/email-status`
4. Check logs: Look for error messages in console

### Database Connection Issues

Update password in `.env` line 8:

```bash
DATABASE_URL="postgresql://postgres.wroehiostvueldeucaze:[CORRECT-PASSWORD]@..."
```

### Rate Limit Exceeded

Options:

1. Wait for limit to reset (daily/monthly)
2. Upgrade Mailjet plan
3. Switch to different provider (SendGrid, Resend)

## File Structure

```
src/
├── lib/email/
│   ├── types.ts                    # Type definitions
│   ├── provider-factory.ts         # Provider instantiation
│   ├── providers/
│   │   ├── mailjet.ts              # Mailjet implementation
│   │   ├── sendgrid.ts             # SendGrid implementation
│   │   └── resend.ts               # Resend implementation
│   ├── rate-limiter.ts             # Rate limiting logic
│   ├── sequences.ts                # Sequence configurations
│   └── email-service.ts            # Main email service
├── app/api/
│   ├── form-submission/route.ts    # Form submission handler
│   ├── cron/send-emails/route.ts   # Cron job endpoint
│   └── email-status/route.ts       # Monitoring endpoint
└── server/db/schema.ts             # Database schema

emails/
└── test-email.tsx                  # Email templates
```

## Best Practices

1. **Test First**: Always test new sequences with test addresses
2. **Monitor Limits**: Check `/api/email-status` regularly
3. **Use Delays**: Don't send too many emails immediately
4. **Template Reuse**: Reuse templates across sequences when possible
5. **Descriptive Names**: Use clear sequence names (e.g., 'welcome-series', 'launch-countdown')
6. **Set Active Flag**: Use `isActive: false` for sequences in development

## Security

- Cron endpoint can be protected with `CRON_SECRET` env variable
- All database queries use Drizzle ORM (SQL injection protection)
- Email providers require API keys (never commit to git)

## Support

Questions? Check:

1. This guide
2. Code comments in `src/lib/email/`
3. Console logs during operation

---

Built with Claude Code by Anthropic
