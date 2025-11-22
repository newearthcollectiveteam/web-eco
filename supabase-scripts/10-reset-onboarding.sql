-- =====================================================
-- Reset Onboarding Status
-- =====================================================
-- Use this if a user needs to redo onboarding
-- Replace 'user-email@example.com' with the user's email
-- =====================================================

-- Reset onboarding status
UPDATE "web-eco_user_profile"
SET onboarding_completed = false
WHERE email = 'user-email@example.com';

-- Verify the change
SELECT id, email, full_name, onboarding_completed
FROM "web-eco_user_profile"
WHERE email = 'user-email@example.com';
