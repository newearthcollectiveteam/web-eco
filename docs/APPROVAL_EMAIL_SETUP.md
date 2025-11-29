# Approval Email Setup Guide

This guide shows you how to set up automatic approval emails that are sent when an admin approves a user.

## 📧 Email Flow

With this setup, users will receive **two emails**:

1. **Verification Email** - Sent immediately when they sign up (from Supabase)
2. **Approval Email** - Sent when admin approves them (custom, via Mailjet) ✨ NEW

## 🚀 Quick Setup (5 Steps)

### **Step 1: Install Supabase CLI** (1 minute)

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

---

### **Step 2: Link to Your Supabase Project** (1 minute)

```bash
cd /Volumes/MAC/____NewEarthCollective/web-eco
supabase link --project-ref wroehiostvueldeucaze
```

You'll be prompted to log in to Supabase - follow the instructions.

---

### **Step 3: Set Environment Secrets** (2 minutes)

Run these commands one by one:

```bash
supabase secrets set MAILJET_API_KEY=c96e788abe5cdd1eec619781309eb237
supabase secrets set MAILJET_SECRET_KEY=66049f81a199c237276794372642b7d9
supabase secrets set MAILJET_FROM_EMAIL=noreply@joinnewearthcollective.com
supabase secrets set MAILJET_FROM_NAME="New Earth Collective"
supabase secrets set BASE_URL=https://joinnewearthcollective.com
```

Verify secrets were set:

```bash
supabase secrets list
```

---

### **Step 4: Deploy the Edge Function** (1 minute)

```bash
supabase functions deploy send-approval-email
```

You should see: "Deployed Function send-approval-email"

---

### **Step 5: Create Database Trigger** (1 minute)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wroehiostvueldeucaze)
2. Click **SQL Editor** → **New Query**
3. Open `/supabase-scripts/11-setup-approval-email-trigger.sql`
4. Copy the **OPTION 1** section (lines 1-54)
5. Paste into SQL Editor and click **Run**

---

## ✅ Test It!

### **Create a test user and approve them:**

1. In incognito browser: Sign up at `http://localhost:3000/auth/signup`
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: test123456

2. As admin: Go to `/admin/users` and click **Approve**

3. Check `test@example.com` inbox for **two emails**:
   - ✉️ **Verification Email** (from Supabase)
   - ✉️ **Approval Email** (from Mailjet) 🎉

---

## 📋 What Each Email Contains

### **Verification Email** (Sent on Signup)

- Subject: "Confirm Your Email" (Supabase default)
- Contains verification link
- User can click this anytime (before or after approval)

### **Approval Email** (Sent on Admin Approval) ✨

- Subject: "Your New Earth Collective Account Has Been Approved! 🎉"
- Congratulations message
- Next steps explained
- Branded HTML design
- Links to platform

---

## 🔄 Complete User Flow

```
1. User signs up
   ↓
2. ✉️ Verification email sent (Supabase)
   ↓
3. User sees "Awaiting Approval" message
   ↓
4. Admin approves user
   ↓
5. ✉️ Approval email sent (Mailjet) 🎉
   ↓
6. User clicks verification link
   ↓
7. User completes onboarding
   ↓
8. User has full access!
```

---

## 🛠️ Troubleshooting

### **Edge Function not deploying?**

Check CLI is installed:

```bash
supabase --version
```

Check you're linked:

```bash
supabase projects list
```

Re-link if needed:

```bash
supabase link --project-ref wroehiostvueldeucaze
```

### **Approval email not sending?**

Check function logs:

```bash
supabase functions logs send-approval-email
```

Or in Supabase Dashboard:

- Go to **Edge Functions** → `send-approval-email` → **Logs**

### **Verify trigger is working:**

```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_user_approved';
```

### **Test function manually:**

```bash
curl -X POST https://wroehiostvueldeucaze.supabase.co/functions/v1/send-approval-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-id",
    "email": "test@example.com",
    "full_name": "Test User"
  }'
```

### **Common Issues:**

❌ **"pg_net extension not found"**
→ Run: `CREATE EXTENSION IF NOT EXISTS pg_net;` in SQL Editor

❌ **"Failed to send email"**
→ Check Mailjet domain is verified
→ Verify Mailjet credentials are correct

❌ **Trigger not firing**
→ Make sure trigger SQL was run successfully
→ Check approval status changed from 'pending' to 'approved'

---

## 🎨 Customize the Email

Edit `/supabase/functions/send-approval-email/index.ts` to customize:

- Email subject
- Email content
- HTML design
- Colors and branding

After editing, redeploy:

```bash
supabase functions deploy send-approval-email
```

---

## 🔐 Security Notes

- Edge Function secrets are stored securely in Supabase
- Function only callable from database trigger (via service role)
- Mailjet credentials never exposed to frontend
- Emails only sent when approval status legitimately changes

---

## 📊 Monitoring

View email sending activity:

1. **Supabase Dashboard** → **Edge Functions** → `send-approval-email` → **Logs**
2. **Mailjet Dashboard** → **Statistics** → See sent emails

---

## 🎉 Success!

Once set up, approval emails will be sent automatically every time you approve a user. No manual intervention needed!

Users will have a clear understanding of their status:

1. ✅ Signed up - "Check your email for verification"
2. ⏳ Waiting - "Awaiting admin approval"
3. 🎉 Approved - "Your account has been approved!" (email)
4. ✅ Verified - Complete onboarding
5. 🚀 Active - Full access!
