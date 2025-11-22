-- =====================================================
-- New Earth Collective - Database Setup
-- =====================================================
-- Run this in Supabase SQL Editor to set up:
-- 1. User profiles table
-- 2. Automatic profile creation trigger
-- 3. Row Level Security policies
-- =====================================================

-- Create user_profile table
CREATE TABLE IF NOT EXISTS "web-eco_user_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "full_name" varchar(255),
  "avatar_url" text,
  "bio" text,
  "role" varchar(50) DEFAULT 'member' NOT NULL,
  "approval_status" varchar(50) DEFAULT 'pending' NOT NULL,
  "approved_at" timestamp with time zone,
  "approved_by" text,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON "web-eco_user_profile";
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON "web-eco_user_profile"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTOMATIC PROFILE CREATION ON SIGNUP
-- =====================================================

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."web-eco_user_profile" (
    id,
    email,
    full_name,
    avatar_url,
    role,
    approval_status,
    onboarding_completed,
    created_at
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'member',
    'pending',  -- Start as pending approval
    false,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ADMIN NOTIFICATION ON SIGNUP
-- =====================================================
-- NOTE: Email notifications require setting up Supabase Edge Functions or a webhook
-- For now, admins can check /admin/users page for pending approvals
-- To enable email notifications, you can:
-- 1. Use Supabase Edge Functions with pg_net extension
-- 2. Use a webhook service like Zapier or Make
-- 3. Poll the database from your app and send emails via Mailjet

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on user_profile table
ALTER TABLE "web-eco_user_profile" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON "web-eco_user_profile";
DROP POLICY IF EXISTS "Users can update own profile" ON "web-eco_user_profile";
DROP POLICY IF EXISTS "Service role has full access" ON "web-eco_user_profile";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "web-eco_user_profile";
DROP POLICY IF EXISTS "Admins can update all profiles" ON "web-eco_user_profile";

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON "web-eco_user_profile"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Policy: Users can update their own profile (but not approval_status)
CREATE POLICY "Users can update own profile"
  ON "web-eco_user_profile"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON "web-eco_user_profile"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "web-eco_user_profile"
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Admins can update all profiles (including approval)
CREATE POLICY "Admins can update all profiles"
  ON "web-eco_user_profile"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "web-eco_user_profile"
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Service role can do anything (for triggers)
CREATE POLICY "Service role has full access"
  ON "web-eco_user_profile"
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- OPTIONAL: Create posts table if needed
-- =====================================================

CREATE TABLE IF NOT EXISTS "web-eco_post" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(256) NOT NULL,
  "content" text,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_post_updated_at ON "web-eco_post";
CREATE TRIGGER update_post_updated_at
  BEFORE UPDATE ON "web-eco_post"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SETUP: CREATE FIRST ADMIN USER
-- =====================================================
-- After running this script, you need to:
-- 1. Sign up for an account using newearthcollectiveteam@gmail.com
-- 2. Then run this query to make yourself admin:

-- UPDATE "web-eco_user_profile"
-- SET role = 'admin', approval_status = 'approved', approved_at = CURRENT_TIMESTAMP
-- WHERE email = 'newearthcollectiveteam@gmail.com';

-- This will give you admin access to approve other users

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'web-eco_%';

-- Check if trigger exists
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'web-eco_user_profile';

-- View all user profiles with approval status
-- SELECT id, email, full_name, role, approval_status, approved_at, created_at
-- FROM "web-eco_user_profile"
-- ORDER BY created_at DESC;

-- View pending approvals
-- SELECT id, email, full_name, created_at
-- FROM "web-eco_user_profile"
-- WHERE approval_status = 'pending'
-- ORDER BY created_at DESC;
