-- =====================================================
-- Manually Verify User Email
-- =====================================================
-- Use this when verification emails aren't being sent
-- (e.g., Mailjet domain not verified yet)
-- Replace 'user-email@example.com' with the user's email
-- =====================================================

-- Manually confirm user's email
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'user-email@example.com';

-- Verify the change was made
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'user-email@example.com';
