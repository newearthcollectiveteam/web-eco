-- =====================================================
-- Troubleshooting Queries
-- =====================================================
-- Use these to diagnose issues with the setup
-- =====================================================

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'web-eco_%';

-- Check if trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'web-eco_user_profile';

-- Check if a specific user exists in both tables
SELECT
  'Profile Table' as source,
  id,
  email,
  full_name
FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com'

UNION ALL

SELECT
  'Auth Table' as source,
  id::text,
  email,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'user-email@example.com';

-- Check for orphaned users (in auth but not in profile)
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN "web-eco_user_profile" p ON u.id = p.id
WHERE p.id IS NULL;

-- Check email verification status
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.confirmed_at,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Verified'
    ELSE 'Not Verified'
  END as verification_status
FROM auth.users u
WHERE u.email = 'user-email@example.com';

-- Check approval status mismatch
SELECT
  p.email,
  p.approval_status,
  p.onboarding_completed,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Email Verified'
    ELSE 'Email Not Verified'
  END as email_status
FROM "web-eco_user_profile" p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'approved'
  AND u.email_confirmed_at IS NULL;
