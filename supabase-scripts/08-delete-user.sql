-- =====================================================
-- Delete User (DANGEROUS)
-- =====================================================
-- CAUTION: This permanently deletes a user
-- Use with care - this cannot be undone!
-- Replace 'user-email@example.com' with the user's email
-- =====================================================

-- First, view the user to confirm
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.approval_status
FROM "web-eco_user_profile" p
WHERE p.email = 'user-email@example.com';

-- Delete from profile table
DELETE FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com';

-- Delete from auth.users (Supabase auth table)
-- Note: This requires service_role permissions
DELETE FROM auth.users
WHERE email = 'user-email@example.com';

-- Verify deletion
SELECT COUNT(*) as remaining_users
FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com';

