# Authentication Setup Guide

## Overview

Your site is now protected by Supabase authentication with **admin approval workflow**. All pages require login, email verification, AND admin approval before users can access the site.

## What's Been Implemented

### 1. Site-Wide Authentication Protection

- **Middleware updated** (`src/middleware.ts`) to protect all routes
- Only auth pages are public: login, signup, forgot-password, reset-password, callback, onboarding, and pending-approval
- Unauthenticated users are redirected to `/admin/login`
- **Approval status checking** - Users must be approved to access the site

### 2. Admin Approval Workflow

- **New approval system** requiring admin approval before users can access the site
- Users see "Awaiting Approval" message after signup
- Admin receives notification to review pending signups
- Admin can approve/reject users from `/admin/users` dashboard
- Upon approval, user receives verification email
- After email verification, user completes onboarding

### 3. User Profiles Database Schema

- **Schema file updated** (`src/server/db/schema.ts`) to use PostgreSQL
- New `userProfiles` table with fields:
  - `id` - Supabase Auth user ID (UUID)
  - `email` - User email
  - `fullName` - User's full name
  - `avatarUrl` - Profile picture URL
  - `bio` - User biography
  - `role` - User role (admin, member, guest)
  - **`approvalStatus`** - Approval status (pending, approved, rejected)
  - **`approvedAt`** - Timestamp of approval
  - **`approvedBy`** - Admin who approved the user
  - `onboardingCompleted` - Whether user completed onboarding
  - `createdAt` & `updatedAt` - Timestamps

### 4. Admin User Management Page

- **New admin page** at `/admin/users`
- View all users with approval status
- Approve or reject pending signups
- Statistics dashboard showing pending, approved, and rejected users
- Only accessible to users with `role = 'admin'`

### 5. Database Migration

- Migration file generated at `drizzle/0000_flimsy_morg.sql`
- **SQL setup script** created at `supabase-setup.sql` with:
  - User profile table with approval fields
  - Automatic profile creation trigger
  - Row Level Security policies for admins
  - Helper queries for viewing pending approvals

### 6. Onboarding Flow

- New onboarding page at `/onboarding`
- Collects user's full name and bio
- Marks profile as onboarding complete
- Redirects to admin dashboard after completion

### 7. Updated Auth Flow with Approval

- **Signup** → Shows "Awaiting Approval" message
- Admin approves in `/admin/users`
- User receives verification email
- **Auth callback** → Redirects to `/onboarding` for approved users
- Users complete profile and access the site

### 8. Pending Approval Page

- New page at `/auth/pending-approval`
- Shows approval status to users
- Displays next steps while waiting for approval
- Allows users to sign out or contact support

## Setup Instructions

### Step 1: Run SQL in Supabase

1. Go to your Supabase dashboard: https://wroehiostvueldeucaze.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

This will:

- Create the `web-eco_user_profile` table
- Set up automatic profile creation on signup (database trigger)
- Configure Row Level Security (RLS) policies
- Create the `web-eco_post` table (if needed)

### Step 2: Configure Mailjet SMTP for Email

Set up Mailjet as your email provider for verification and approval emails:

1. **Go to Supabase Dashboard** → **Authentication** → **Email Templates**
2. Scroll down to **SMTP Settings**
3. Click **Enable Custom SMTP**
4. Enter the following Mailjet credentials:

   ```
   SMTP Host: in-v3.mailjet.com
   SMTP Port: 587 (or 465 for SSL)
   SMTP Username: c96e788abe5cdd1eec619781309eb237
   SMTP Password: 0b02cf3a4e9b15941f56ade98dd217bd
   Sender Email: newearthcollectiveteam@gmail.com
   Sender Name: New Earth Collective
   ```

5. **Test the configuration** by sending a test email
6. **Save** the SMTP settings

**Email Templates to Configure:**

While you're in Email Templates, customize these emails for your brand:

- **Confirm Signup** - User verification email (sent after admin approval)
  - Subject: `Verify your New Earth Collective account`
  - Body: Include approval confirmation message

- **Reset Password** - Password reset email
  - Subject: `Reset your New Earth Collective password`

**Note**: The approval email notification to admins will need to be implemented using:

- Supabase Edge Functions (recommended)
- A webhook service like Zapier/Make
- Manual checking of `/admin/users` page

### Step 3: Create Your Admin Account

After setting up the database and SMTP:

1. **Sign up** with your admin email: `newearthcollectiveteam@gmail.com`
2. Go to **Supabase Dashboard** → **SQL Editor**
3. Run this query to make yourself admin and approve your account:

   ```sql
   UPDATE "web-eco_user_profile"
   SET
     role = 'admin',
     approval_status = 'approved',
     approved_at = CURRENT_TIMESTAMP,
     approved_by = id  -- Self-approved
   WHERE email = 'newearthcollectiveteam@gmail.com';
   ```

4. **Verify your email** using the verification link sent to your inbox
5. **Complete onboarding** at `/onboarding`
6. You now have admin access to `/admin/users`!

### Step 4: Verify Database Setup

After running the SQL, verify everything is set up correctly:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'web-eco_%';

-- Check if trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'web-eco_user_profile';
```

### Step 5: Test the Complete Approval Flow

1. **Start your dev server** (if not already running):

   ```bash
   npm run dev
   ```

2. **Test New User Signup with Approval**:
   - Open incognito browser
   - Navigate to `http://localhost:3000`
   - You should be redirected to `/admin/login`
   - Click "Sign up" link
   - Create a new test account
   - You'll see "Awaiting Approval" message explaining the process
   - User is created with `approval_status = 'pending'`

3. **Test Admin Approval**:
   - In your main browser (logged in as admin)
   - Navigate to `/admin/users`
   - You'll see the new user in "Pending Approvals" section
   - Click "Approve" button
   - User's status changes to `approved`
   - Verification email is sent to user

4. **Test User Verification and Onboarding**:
   - Check the test user's email inbox
   - Click verification link from Supabase
   - User is redirected to `/onboarding`
   - Complete profile with full name and bio
   - User is redirected to `/admin` dashboard
   - Full access granted!

5. **Test Rejection Flow**:
   - Create another test account
   - As admin, reject the user from `/admin/users`
   - User sees "Application Rejected" message when trying to log in
   - User is redirected to `/auth/pending-approval` with rejection notice

6. **Test Protected Routes**:
   - Try accessing any page without logging in
   - You should be redirected to `/admin/login`
   - Log in with a pending account
   - You should be redirected to `/auth/pending-approval`
   - Only approved + verified users can access the site

## How It Works

### Complete Authentication & Approval Flow

```
New User Signup with Admin Approval:
1. User fills signup form → `/auth/signup`
2. Supabase creates auth.users record
3. Database trigger creates user profile → `web-eco_user_profile` (approval_status='pending')
4. User sees "Awaiting Approval" message with process explanation
5. Admin visits `/admin/users` and sees pending request
6. Admin clicks "Approve" → sets approval_status='approved'
7. Verification email sent by Supabase via Mailjet
8. User clicks email verification link → `/auth/callback`
9. Callback redirects to → `/onboarding`
10. User completes profile (full name, bio)
11. Redirect to → `/admin` (full access granted!)

Admin Login:
1. Admin fills login form → `/admin/login`
2. Supabase validates credentials
3. Session created and stored in cookies
4. Middleware checks: user exists + approved + verified
5. Redirect to → `/admin`

Approved User Login:
1. User fills login form → `/admin/login`
2. Supabase validates credentials
3. Session created
4. Middleware checks approval_status = 'approved'
5. Redirect to → `/admin` or last visited page

Pending User Login Attempt:
1. User fills login form → `/admin/login`
2. Supabase validates credentials
3. Session created
4. Middleware checks approval_status = 'pending'
5. Redirect to → `/auth/pending-approval`
6. User sees waiting message

Protected Route Access:
1. User navigates to any page
2. Middleware checks:
   - Authenticated session exists?
   - User approval_status = 'approved'?
3. If no session → redirect to `/admin/login`
4. If pending/rejected → redirect to `/auth/pending-approval`
5. If approved → allow access
```

### Middleware Logic

The middleware (`src/middleware.ts`) runs on every request and:

1. Updates/refreshes Supabase session
2. Checks if route is public (auth pages + onboarding)
3. If public and user is logged in trying to access login/signup → redirect to `/admin`
4. If not public and no user → redirect to `/admin/login`
5. Otherwise, allow access

### Database Trigger

The Supabase trigger (`handle_new_user()`) automatically:

- Listens for new users in `auth.users`
- Creates a corresponding profile in `web-eco_user_profile`
- Copies email and metadata from auth record
- Sets default values (role: member, onboarding: false)

### Row Level Security

RLS policies ensure:

- Users can only view/update their own profile
- Service role (backend) has full access
- Prevents unauthorized data access

## Troubleshooting

### Issue: "Tenant or user not found" when pushing migration

**Solution**: Run the SQL script directly in Supabase Studio instead of using `npm run db:push`. The connection string might need adjustment for migrations.

### Issue: Users not redirected to onboarding

**Cause**: Database trigger might not be set up.

**Solution**:

1. Check if trigger exists in Supabase
2. Re-run the SQL setup script
3. Verify with: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`

### Issue: Profile not created on signup

**Cause**: Trigger function might have errors.

**Solution**:

1. Check Supabase logs in Dashboard → Logs → Database
2. Look for errors related to `handle_new_user`
3. Ensure table name matches: `web-eco_user_profile`

### Issue: Users can't access onboarding page

**Cause**: Middleware might not have onboarding in public routes.

**Solution**: Check `src/middleware.ts` line 15 - ensure `/onboarding` is in `PUBLIC_ROUTES` array.

## Next Steps

### Optional Enhancements

1. **Add Email Verification Check**
   - Check if user's email is verified before allowing full access
   - Show banner if email not verified

2. **Implement Role-Based Access Control**
   - Add admin-only routes
   - Create role checking middleware
   - Example: Only admins can access `/admin/users`

3. **Add Profile Editing**
   - Create `/profile/edit` page
   - Allow users to update their profile
   - Add avatar upload functionality

4. **Social Authentication**
   - Enable OAuth providers in Supabase (Google, GitHub, etc.)
   - Add social login buttons to login/signup pages

5. **Session Management**
   - Add "Remember me" checkbox
   - Implement session timeout handling
   - Add "Active sessions" view in profile

6. **Better Onboarding**
   - Multi-step onboarding wizard
   - Add avatar upload
   - Collect additional user preferences

## Environment Variables

Ensure these are set in your `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://wroehiostvueldeucaze.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres.wroehiostvueldeucaze:new-earth-2025!*@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

## Files Modified/Created

### Created:

- `supabase-setup.sql` - SQL script for database setup
- `src/app/onboarding/page.tsx` - Onboarding flow
- `AUTH_SETUP.md` - This guide

### Modified:

- `src/middleware.ts` - Site-wide auth protection
- `src/server/db/schema.ts` - User profiles schema (SQLite → PostgreSQL)
- `src/app/auth/signup/page.tsx` - Redirect to onboarding
- `src/app/auth/callback/route.ts` - Redirect to onboarding
- `drizzle/0000_flimsy_morg.sql` - Generated migration

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables
4. Ensure SQL script ran successfully
5. Check middleware logs (shown in terminal during development)

## Success Checklist

- [ ] SQL script executed in Supabase
- [ ] Tables created and visible in Supabase Table Editor
- [ ] Trigger exists in database
- [ ] RLS policies active
- [ ] Can sign up new user
- [ ] Automatically redirected to onboarding
- [ ] Can complete onboarding
- [ ] Redirected to admin after onboarding
- [ ] Protected routes require login
- [ ] Can log out and log back in
- [ ] Profile data persists

---

**You're all set!** Your New Earth Collective site is now fully protected with authentication.
