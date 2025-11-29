-- Schema Cleanup & Performance Optimization Migration
-- Adds missing indexes and constraints for optimal performance

-- ============================================
-- 1. COMPOSITE UNIQUE CONSTRAINTS
-- ============================================

-- Prevent duplicate contact source entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_contact_source'
  ) THEN
    ALTER TABLE "web-eco_contact_source"
    ADD CONSTRAINT "unique_contact_source"
    UNIQUE ("contact_id", "source");
  END IF;
END $$;

-- ============================================
-- 2. PERFORMANCE INDEXES - Contacts Table
-- ============================================

-- Email lookups (already unique, but index helps)
CREATE INDEX IF NOT EXISTS "idx_contact_email"
ON "web-eco_contact" ("email");

-- Phone lookups (for SMS campaigns)
CREATE INDEX IF NOT EXISTS "idx_contact_phone"
ON "web-eco_contact" ("phone")
WHERE "phone" IS NOT NULL;

-- Status filtering (lead, qualified, customer)
CREATE INDEX IF NOT EXISTS "idx_contact_status"
ON "web-eco_contact" ("status");

-- Tag-based queries (JSONB array)
CREATE INDEX IF NOT EXISTS "idx_contact_tags"
ON "web-eco_contact" USING GIN ("tags");

-- Date range queries
CREATE INDEX IF NOT EXISTS "idx_contact_created_at"
ON "web-eco_contact" ("created_at" DESC);

-- ============================================
-- 3. PERFORMANCE INDEXES - Sessions & Events
-- ============================================

-- Anonymous ID lookups (frequent)
CREATE INDEX IF NOT EXISTS "idx_session_anonymous_id"
ON "web-eco_session" ("anonymous_id");

-- Contact session lookups
CREATE INDEX IF NOT EXISTS "idx_session_contact_id"
ON "web-eco_session" ("contact_id")
WHERE "contact_id" IS NOT NULL;

-- Session-to-event joins
CREATE INDEX IF NOT EXISTS "idx_event_session_id"
ON "web-eco_event" ("session_id")
WHERE "session_id" IS NOT NULL;

-- Contact event lookups
CREATE INDEX IF NOT EXISTS "idx_event_contact_id"
ON "web-eco_event" ("contact_id")
WHERE "contact_id" IS NOT NULL;

-- Event type filtering
CREATE INDEX IF NOT EXISTS "idx_event_type"
ON "web-eco_event" ("event_type");

-- Time-series analytics
CREATE INDEX IF NOT EXISTS "idx_event_created_at"
ON "web-eco_event" ("created_at" DESC);

-- Anonymous ID event lookups
CREATE INDEX IF NOT EXISTS "idx_event_anonymous_id"
ON "web-eco_event" ("anonymous_id");

-- ============================================
-- 4. PERFORMANCE INDEXES - Email Tracking
-- ============================================

-- Email link token lookups (already unique, but index helps)
CREATE INDEX IF NOT EXISTS "idx_email_link_token"
ON "web-eco_email_link" ("token");

-- Contact email link lookups
CREATE INDEX IF NOT EXISTS "idx_email_link_contact_id"
ON "web-eco_email_link" ("contact_id");

-- Email type filtering
CREATE INDEX IF NOT EXISTS "idx_email_link_type"
ON "web-eco_email_link" ("email_type");

-- ============================================
-- 5. PERFORMANCE INDEXES - Identity Mapping
-- ============================================

-- Anonymous ID lookups (already unique, but index helps)
CREATE INDEX IF NOT EXISTS "idx_identity_map_anonymous_id"
ON "web-eco_user_identity_map" ("anonymous_id");

-- Contact identity lookups
CREATE INDEX IF NOT EXISTS "idx_identity_map_contact_id"
ON "web-eco_user_identity_map" ("contact_id");

-- ============================================
-- 6. PERFORMANCE INDEXES - Activity Tracking
-- ============================================

-- Contact activity lookups
CREATE INDEX IF NOT EXISTS "idx_activity_contact_id"
ON "web-eco_contact_activity" ("contact_id");

-- Activity type filtering
CREATE INDEX IF NOT EXISTS "idx_activity_type"
ON "web-eco_contact_activity" ("activity_type");

-- Time-series activity queries
CREATE INDEX IF NOT EXISTS "idx_activity_created_at"
ON "web-eco_contact_activity" ("created_at" DESC);

-- ============================================
-- 7. TABLE COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE "web-eco_contact" IS
'Master CRM database - central repository for all contacts from all sources';

COMMENT ON TABLE "web-eco_contact_source" IS
'Tracks all sources a contact has interacted with (multi-source tracking)';

COMMENT ON TABLE "web-eco_contact_activity" IS
'Activity log for all contact interactions (form submissions, emails, etc.)';

COMMENT ON TABLE "web-eco_session" IS
'Browser sessions for both anonymous and known users';

COMMENT ON TABLE "web-eco_event" IS
'All user interactions (page views, clicks, form submissions)';

COMMENT ON TABLE "web-eco_email_link" IS
'Trackable links sent in email campaigns';

COMMENT ON TABLE "web-eco_user_identity_map" IS
'Links anonymous IDs to known contacts for journey tracking';

-- ============================================
-- 8. OPTIONAL: Remove example table
-- ============================================

-- Uncomment this line if the 'post' table is not being used:
-- DROP TABLE IF EXISTS "web-eco_post";
