-- =====================================================
-- Change User Role
-- =====================================================
-- Change a user's role (admin, member, guest)
-- Replace 'user-email@example.com' with the user's email
-- =====================================================

-- Make user an admin
UPDATE "web-eco_user_profile"
SET role = 'admin'
WHERE email = 'user-email@example.com';

-- Make user a regular member
UPDATE "web-eco_user_profile"
SET role = 'member'
WHERE email = 'user-email@example.com';

-- Make user a guest
UPDATE "web-eco_user_profile"
SET role = 'guest'
WHERE email = 'user-email@example.com';

-- Verify the change
SELECT id, email, full_name, role
FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com';
