-- Add consent tracking fields to contacts table
-- This migration adds proper consent tracking for GDPR/CAN-SPAM compliance

ALTER TABLE "web-eco_contact"
ADD COLUMN IF NOT EXISTS "email_consent" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "sms_consent" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "consent_granted_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "consent_ip_address" VARCHAR(45),
ADD COLUMN IF NOT EXISTS "unsubscribed_email" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "unsubscribed_sms" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "unsubscribed_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "unsubscribe_token" VARCHAR(64) UNIQUE;

-- Create index for unsubscribe token lookups
CREATE INDEX IF NOT EXISTS "idx_contact_unsubscribe_token"
ON "web-eco_contact" ("unsubscribe_token");

-- Create index for consent queries
CREATE INDEX IF NOT EXISTS "idx_contact_email_consent"
ON "web-eco_contact" ("email_consent")
WHERE "email_consent" = true AND "unsubscribed_email" = false;

CREATE INDEX IF NOT EXISTS "idx_contact_sms_consent"
ON "web-eco_contact" ("sms_consent")
WHERE "sms_consent" = true AND "unsubscribed_sms" = false;

COMMENT ON COLUMN "web-eco_contact"."email_consent" IS 'User explicitly opted in to email communications';
COMMENT ON COLUMN "web-eco_contact"."sms_consent" IS 'User explicitly opted in to SMS communications';
COMMENT ON COLUMN "web-eco_contact"."consent_granted_at" IS 'Timestamp when consent was granted';
COMMENT ON COLUMN "web-eco_contact"."consent_ip_address" IS 'IP address when consent was granted (for compliance)';
COMMENT ON COLUMN "web-eco_contact"."unsubscribe_token" IS 'Unique token for unsubscribe links';
