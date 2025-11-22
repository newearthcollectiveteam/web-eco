-- =====================================================
-- Setup Approval Email Trigger
-- =====================================================
-- This creates a trigger that sends an email when admin approves a user
-- Requires: pg_net extension and Supabase Edge Functions OR external webhook
-- =====================================================

-- OPTION 1: Using Supabase Edge Functions (Recommended)
-- =====================================================
-- You'll need to create an Edge Function to send the email via Mailjet
-- See: /supabase/functions/send-approval-email/index.ts
--
-- This trigger will call that function when approval_status changes to 'approved'

-- Enable pg_net extension (required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send approval email
CREATE OR REPLACE FUNCTION send_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only send email if status changed from 'pending' to 'approved'
  IF OLD.approval_status = 'pending' AND NEW.approval_status = 'approved' THEN

    -- Make HTTP request to Edge Function
    SELECT net.http_post(
      url := 'https://wroehiostvueldeucaze.supabase.co/functions/v1/send-approval-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'full_name', NEW.full_name
      )
    ) INTO request_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_user_approved ON "web-eco_user_profile";
CREATE TRIGGER on_user_approved
  AFTER UPDATE ON "web-eco_user_profile"
  FOR EACH ROW
  EXECUTE FUNCTION send_approval_email();

-- =====================================================
-- OPTION 2: Using Webhooks (Simpler, No Edge Function Needed)
-- =====================================================
-- Uncomment this section if you want to use webhooks instead

/*
-- Function to log approval (can be picked up by webhook service like Zapier)
CREATE OR REPLACE FUNCTION log_user_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status changed from 'pending' to 'approved'
  IF OLD.approval_status = 'pending' AND NEW.approval_status = 'approved' THEN

    -- Insert into approval_log table (you'd need to create this)
    -- A webhook service can monitor this table and send emails
    INSERT INTO user_approval_log (
      user_id,
      email,
      full_name,
      approved_at,
      approved_by
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.full_name,
      NEW.approved_at,
      NEW.approved_by
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_user_approved_log ON "web-eco_user_profile";
CREATE TRIGGER on_user_approved_log
  AFTER UPDATE ON "web-eco_user_profile"
  FOR EACH ROW
  EXECUTE FUNCTION log_user_approval();
*/

-- =====================================================
-- TEST THE TRIGGER
-- =====================================================
-- After setting up the Edge Function, test with:
/*
UPDATE "web-eco_user_profile"
SET approval_status = 'approved'
WHERE email = 'test@example.com'
  AND approval_status = 'pending';
*/
