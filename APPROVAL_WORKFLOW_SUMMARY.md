# Admin Approval Workflow - Implementation Summary

## Overview

Your New Earth Collective site now has a complete **admin approval workflow** where all new signups must be manually approved before gaining access.

---

## Complete User Flow

### 1. New User Signs Up

```
User visits site → Redirected to /admin/login
↓
Clicks "Sign up"
↓
Fills form with email & password
↓
Sees "Account Created! Awaiting Admin Approval" message
↓
Account created with approval_status = 'pending'
```

**What the user sees:**

- ✅ "Account Created!" confirmation
- ⏳ Yellow box explaining the approval process:
  1. Admin will review your request
  2. You'll receive an approval email when approved
  3. Click the verification link in that email
  4. Complete your profile and start using the platform

### 2. Admin Reviews & Approves

```
Admin logs into /admin
↓
Navigates to /admin/users
↓
Sees "Pending Approvals" section with new user
↓
Clicks "Approve" button
↓
User's approval_status → 'approved'
↓
Verification email sent via Mailjet
```

**Admin Dashboard Features:**

- 📊 Statistics: Pending, Approved, Rejected counts
- 📋 Pending approvals table with Approve/Reject buttons
- 👥 Complete user list with roles and statuses
- 🔍 Filter by approval status

### 3. User Receives Approval & Verifies

```
User checks email inbox
↓
Receives "Verify your New Earth Collective account" email
↓
Clicks verification link
↓
Redirected to /auth/callback
↓
Callback redirects to /onboarding
```

**Verification Email:**

- Sent via Mailjet SMTP
- From: newearthcollectiveteam@gmail.com
- Subject: Custom (set in Supabase)
- Link redirects to: /auth/callback

### 4. User Completes Onboarding

```
User lands on /onboarding
↓
Fills in:
  - Full Name (required)
  - Bio (optional)
↓
Submits form
↓
Profile updated: onboarding_completed = true
↓
Redirected to /admin dashboard
↓
✅ Full access granted!
```

---

## What Happens in Each Scenario

### Scenario A: User Not Yet Approved (Pending)

1. User tries to access any page
2. Middleware checks `approval_status = 'pending'`
3. Redirected to `/auth/pending-approval`
4. Sees waiting screen with:
   - Clock icon
   - "Awaiting Approval" message
   - Explanation of next steps
   - "Sign Out" and "Check Status" buttons

### Scenario B: User Rejected

1. User tries to access any page
2. Middleware checks `approval_status = 'rejected'`
3. Redirected to `/auth/pending-approval`
4. Sees rejection screen with:
   - Red X icon
   - "Application Rejected" message
   - Contact support email link
   - "Sign Out" button

### Scenario C: User Approved & Verified

1. User tries to access any page
2. Middleware checks `approval_status = 'approved'`
3. Access granted to all pages
4. Full site functionality available

---

## Database Schema

### User Profile Table: `web-eco_user_profile`

| Column                 | Type         | Default           | Description                    |
| ---------------------- | ------------ | ----------------- | ------------------------------ |
| `id`                   | text         | -                 | Supabase Auth user ID (UUID)   |
| `email`                | varchar(255) | -                 | User email address             |
| `full_name`            | varchar(255) | null              | User's full name               |
| `avatar_url`           | text         | null              | Profile picture URL            |
| `bio`                  | text         | null              | User biography                 |
| `role`                 | varchar(50)  | 'member'          | User role (admin/member/guest) |
| **`approval_status`**  | varchar(50)  | **'pending'**     | Approval state                 |
| **`approved_at`**      | timestamp    | null              | When approved                  |
| **`approved_by`**      | text         | null              | Admin who approved             |
| `onboarding_completed` | boolean      | false             | Onboarding status              |
| `created_at`           | timestamp    | CURRENT_TIMESTAMP | Account creation               |
| `updated_at`           | timestamp    | CURRENT_TIMESTAMP | Last update                    |

### Approval Status Values

- `pending` - Awaiting admin review (default)
- `approved` - Admin approved, can access site
- `rejected` - Admin rejected, cannot access site

---

## Row Level Security (RLS) Policies

### Users Can:

- ✅ View their own profile
- ✅ Update their own profile (name, bio, avatar)
- ❌ Cannot change their own `approval_status`
- ❌ Cannot change their own `role`

### Admins Can:

- ✅ View ALL user profiles
- ✅ Update ALL user profiles
- ✅ Change approval_status
- ✅ Change user roles
- ✅ See pending approvals

### Service Role Can:

- ✅ Full access (for triggers and backend operations)

---

## Middleware Protection

### Public Routes (No Auth Required)

- `/admin/login` - Login page
- `/auth/signup` - Signup page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset form
- `/auth/callback` - OAuth/email verification callback
- `/auth/auth-code-error` - Auth error page
- `/auth/pending-approval` - Approval waiting page
- `/onboarding` - Profile completion

### Protected Routes (Auth + Approval Required)

- Everything else!
- `/admin` - Admin dashboard
- `/admin/users` - User management (admin only)
- `/profile` - User profile
- All other site pages

### Middleware Checks (In Order)

1. ✅ Is route public? → Allow
2. ✅ Is user authenticated? → If no, redirect to login
3. ✅ Is user approved? → If no, redirect to pending-approval
4. ✅ Allow access

---

## Admin Dashboard: `/admin/users`

### Features

**Statistics Cards:**

- Pending Approval count (yellow)
- Approved Users count (green)
- Rejected count (red)

**Pending Approvals Table:**

- Email, Full Name, Signup Date
- Approve / Reject buttons
- Quick action interface

**All Users Table:**

- Complete user list
- Role badges (Admin/Member)
- Status badges (Pending/Approved/Rejected)
- Sortable by join date

**Access Control:**

- Only users with `role = 'admin'` can access
- RLS policies enforce admin permissions
- Non-admins see "Access Denied" message

---

## Email Configuration (Mailjet)

### SMTP Settings in Supabase

```
Host: in-v3.mailjet.com
Port: 587
Username: c96e788abe5cdd1eec619781309eb237
Password: 0b02cf3a4e9b15941f56ade98dd217bd
Sender: newearthcollectiveteam@gmail.com
Name: New Earth Collective
```

### Email Templates to Customize

1. **Confirm Signup** (Verification Email)
   - Sent when admin approves user
   - Contains verification link
   - Redirects to `/auth/callback`
   - Suggest subject: "Your New Earth Collective account has been approved!"

2. **Reset Password**
   - Password reset flow
   - Standard Supabase template

3. **Magic Link** (Optional)
   - Passwordless login option
   - Can be enabled later

---

## Files Created/Modified

### New Files

- ✅ `supabase-setup.sql` - Complete database setup script
- ✅ `AUTH_SETUP.md` - Detailed setup guide
- ✅ `APPROVAL_WORKFLOW_SUMMARY.md` - This file
- ✅ `src/app/admin/users/page.tsx` - User management dashboard
- ✅ `src/app/auth/pending-approval/page.tsx` - Waiting/rejection page
- ✅ `src/app/onboarding/page.tsx` - Profile completion
- ✅ `drizzle/0001_amused_sage.sql` - Approval fields migration

### Modified Files

- ✅ `src/middleware.ts` - Added approval status checking
- ✅ `src/lib/supabase/middleware.ts` - Returns approval status
- ✅ `src/server/db/schema.ts` - Added approval fields
- ✅ `src/app/auth/signup/page.tsx` - Shows approval waiting message
- ✅ `src/app/auth/callback/route.ts` - Redirects to onboarding

---

## Setup Checklist

### Step 1: Database Setup

- [ ] Run `supabase-setup.sql` in Supabase SQL Editor
- [ ] Verify tables created
- [ ] Verify triggers created
- [ ] Verify RLS policies active

### Step 2: Email Configuration

- [ ] Go to Supabase → Authentication → Email Templates
- [ ] Enable Custom SMTP
- [ ] Enter Mailjet credentials
- [ ] Test email sending
- [ ] Customize email templates

### Step 3: Create Admin Account

- [ ] Sign up with newearthcollectiveteam@gmail.com
- [ ] Run SQL to make yourself admin
- [ ] Verify email
- [ ] Complete onboarding
- [ ] Access `/admin/users`

### Step 4: Test Complete Flow

- [ ] Create test user account
- [ ] See pending approval message
- [ ] Approve from admin dashboard
- [ ] Verify user receives email
- [ ] User clicks verification link
- [ ] User completes onboarding
- [ ] User has full access

---

## Future Enhancements

### Admin Email Notifications

Currently, admins must check `/admin/users` manually. To add email notifications:

**Option 1: Supabase Edge Functions**

```typescript
// Create edge function that sends email when new user signs up
// Trigger: INSERT on web-eco_user_profile where approval_status='pending'
```

**Option 2: Webhook Service**

- Use Zapier or Make.com
- Trigger on new user in Supabase
- Send email to newearthcollectiveteam@gmail.com
- Include link to `/admin/users` page

**Option 3: Polling from Frontend**

- Admin dashboard checks for new pending users
- Shows notification badge
- Optional browser notifications

### Enhanced Approval Features

- Approval/rejection reasons (comments)
- Bulk approve/reject
- Auto-approve based on email domain
- Waiting list with priorities
- Custom approval workflows per role

### User Communication

- Send custom rejection email with reason
- Send welcome email after approval
- Approval status email updates
- Reminder emails for incomplete onboarding

---

## Troubleshooting

### Issue: User can't access site after approval

**Check:**

1. Is `approval_status = 'approved'` in database?
2. Has user verified their email?
3. Has user completed onboarding?
4. Clear browser cookies and try again

### Issue: Verification email not received

**Check:**

1. Mailjet SMTP configured correctly in Supabase?
2. Check spam/junk folder
3. Verify email address is correct
4. Test Supabase email sending in dashboard

### Issue: Admin can't see pending users

**Check:**

1. Is admin's `role = 'admin'` in database?
2. Are RLS policies created correctly?
3. Check browser console for errors
4. Verify admin is logged in

### Issue: New users not created as pending

**Check:**

1. Is database trigger `on_auth_user_created` active?
2. Run verification query in SQL Editor
3. Check Supabase logs for trigger errors
4. Verify table schema matches `supabase-setup.sql`

---

## Support

**Questions or Issues?**

- Email: newearthcollectiveteam@gmail.com
- Check Supabase Dashboard → Logs for errors
- Review `AUTH_SETUP.md` for detailed instructions

---

## Success! 🎉

Your site now has:

- ✅ Complete admin approval workflow
- ✅ Email verification via Mailjet
- ✅ User management dashboard
- ✅ Pending/Approved/Rejected states
- ✅ Onboarding flow
- ✅ Full site protection

**You're ready to launch!**
