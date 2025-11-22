# Send Approval Email - Edge Function

This Supabase Edge Function sends an approval email via Mailjet when an admin approves a user.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to Your Project

```bash
supabase link --project-ref wroehiostvueldeucaze
```

### 3. Set Environment Variables

```bash
supabase secrets set MAILJET_API_KEY=c96e788abe5cdd1eec619781309eb237
supabase secrets set MAILJET_SECRET_KEY=66049f81a199c237276794372642b7d9
supabase secrets set MAILJET_FROM_EMAIL=noreply@joinnewearthcollective.com
supabase secrets set MAILJET_FROM_NAME="New Earth Collective"
supabase secrets set BASE_URL=https://joinnewearthcollective.com
```

### 4. Deploy the Function

```bash
supabase functions deploy send-approval-email
```

### 5. Set Up the Database Trigger

Run the SQL script: `/supabase-scripts/11-setup-approval-email-trigger.sql`

## How It Works

1. Admin approves user in the admin dashboard
2. Database trigger detects `approval_status` changed to `'approved'`
3. Trigger calls this Edge Function via HTTP
4. Function sends branded approval email via Mailjet
5. User receives email with next steps

## Email Content

The approval email includes:

- 🎉 Congratulations message
- Next steps (verification, onboarding)
- Branded HTML design matching your site
- Links to the platform

## Testing

Test manually by calling the function:

```bash
curl -X POST https://wroehiostvueldeucaze.supabase.co/functions/v1/send-approval-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "email": "test@example.com",
    "full_name": "Test User"
  }'
```

## Troubleshooting

**Function not deploying?**

- Make sure Supabase CLI is installed
- Check you're linked to the correct project
- Verify all secrets are set

**Emails not sending?**

- Check Mailjet credentials are correct
- Verify domain is validated in Mailjet
- Check function logs: `supabase functions logs send-approval-email`

**Trigger not firing?**

- Verify trigger was created in database
- Check database logs in Supabase dashboard
- Test trigger with manual SQL update
