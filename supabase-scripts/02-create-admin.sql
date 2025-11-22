-- =====================================================
-- Create Admin User
-- =====================================================
-- Run this AFTER you've signed up with your admin email
-- Replace 'your-email@example.com' with your actual email
-- =====================================================

-- Make user an admin and approve them
UPDATE "web-eco_user_profile"
SET
  role = 'admin',
  approval_status = 'approved',
  approved_at = CURRENT_TIMESTAMP,
  approved_by = id
WHERE email = 'your-email@example.com';

-- Verify the change was made
SELECT id, email, role, approval_status, full_name
FROM "web-eco_user_profile"
WHERE email = 'your-email@example.com';
