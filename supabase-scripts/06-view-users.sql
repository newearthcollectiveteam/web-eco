-- =====================================================
-- View Users - Various Queries
-- =====================================================
-- Helpful queries to view and inspect users
-- =====================================================

-- View all users with their profile info
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.approval_status,
  p.onboarding_completed,
  p.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM "web-eco_user_profile" p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- View only pending users
SELECT
  id,
  email,
  full_name,
  created_at
FROM "web-eco_user_profile"
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- View only approved users
SELECT
  id,
  email,
  full_name,
  role,
  approved_at
FROM "web-eco_user_profile"
WHERE approval_status = 'approved'
ORDER BY approved_at DESC;

-- View only admins
SELECT
  id,
  email,
  full_name,
  created_at
FROM "web-eco_user_profile"
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Count users by status
SELECT
  approval_status,
  COUNT(*) as count
FROM "web-eco_user_profile"
GROUP BY approval_status;

-- View user details by email
SELECT
  p.*,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM "web-eco_user_profile" p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'user-email@example.com';
