-- =====================================================
-- Initial Database Setup
-- =====================================================
-- Run this FIRST to create all tables, triggers, and policies
-- This should only be run ONCE when setting up the project
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

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON "web-eco_user_profile"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile (but not role or approval_status)
CREATE POLICY "Users can update own profile"
  ON "web-eco_user_profile"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Service role has full access (for triggers and backend operations)
CREATE POLICY "Service role has full access"
  ON "web-eco_user_profile"
  USING (auth.jwt()->>'role' = 'service_role');

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON "web-eco_user_profile"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "web-eco_user_profile"
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON "web-eco_user_profile"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "web-eco_user_profile"
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );
