-- =====================================================
-- Approve Pending User
-- =====================================================
-- Approve a user who is waiting for admin approval
-- Replace 'user-email@example.com' with the user's email
-- Replace 'admin-user-id' with your admin user ID
-- =====================================================

-- Approve a pending user
UPDATE "web-eco_user_profile"
SET
  approval_status = 'approved',
  approved_at = CURRENT_TIMESTAMP,
  approved_by = 'admin-user-id'
WHERE email = 'user-email@example.com';

-- Verify the change
SELECT id, email, full_name, approval_status, approved_at
FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com';
