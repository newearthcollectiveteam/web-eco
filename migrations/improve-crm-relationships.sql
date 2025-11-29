-- Migration: Improve CRM and Intake Form Relationships
-- This migration adds proper foreign key constraints and the contactSources table
-- for scalable multi-form CRM management

-- Step 1: Rename source to firstSource in contacts table
ALTER TABLE web-eco_contact
  RENAME COLUMN source TO first_source;

-- Step 2: Add default values for JSONB fields if they're NULL
UPDATE web-eco_contact
SET tags = '[]'::jsonb
WHERE tags IS NULL;

UPDATE web-eco_contact
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;

-- Step 3: Create contact_sources table for multi-source tracking
CREATE TABLE IF NOT EXISTS web-eco_contact_source (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER NOT NULL,
  source VARCHAR(100) NOT NULL,
  first_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  interaction_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Enforce uniqueness: each contact can only have one record per source
  CONSTRAINT unique_contact_source UNIQUE (contact_id, source)
);

-- Step 4: Add foreign key constraints
-- Note: This assumes all existing contactId values are valid
-- If you have orphaned records, clean them up first

-- Add FK for contact_sources -> contacts
ALTER TABLE web-eco_contact_source
  ADD CONSTRAINT fk_contact_source_contact
  FOREIGN KEY (contact_id)
  REFERENCES web-eco_contact(id)
  ON DELETE CASCADE;

-- Add FK for contact_activity -> contacts
-- First, check if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contact_activity_contact'
  ) THEN
    ALTER TABLE web-eco_contact_activity
      ADD CONSTRAINT fk_contact_activity_contact
      FOREIGN KEY (contact_id)
      REFERENCES web-eco_contact(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK for waitlist_intake -> contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_waitlist_intake_contact'
  ) THEN
    ALTER TABLE web-eco_waitlist_intake
      ADD CONSTRAINT fk_waitlist_intake_contact
      FOREIGN KEY (contact_id)
      REFERENCES web-eco_contact(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK for gallery_image -> galleries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_gallery_image_gallery'
  ) THEN
    ALTER TABLE web-eco_gallery_image
      ADD CONSTRAINT fk_gallery_image_gallery
      FOREIGN KEY (gallery_id)
      REFERENCES web-eco_gallery(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Backfill contact_sources from existing data
-- This creates a contact_source record for each contact's first_source
INSERT INTO web-eco_contact_source (contact_id, source, first_interaction, last_interaction, interaction_count)
SELECT
  id,
  first_source,
  first_contact_date,
  last_contact_date,
  1
FROM web-eco_contact
ON CONFLICT (contact_id, source) DO NOTHING;

-- Step 6: Backfill contact_sources from waitlist_intake
-- This handles cases where contacts submitted the waitlist form
INSERT INTO web-eco_contact_source (contact_id, source, first_interaction, last_interaction, interaction_count)
SELECT
  contact_id,
  source,
  created_at,
  created_at,
  1
FROM web-eco_waitlist_intake
WHERE contact_id IS NOT NULL
ON CONFLICT (contact_id, source)
DO UPDATE SET
  interaction_count = web-eco_contact_source.interaction_count + 1,
  last_interaction = EXCLUDED.last_interaction;

-- Step 7: Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contact_sources_contact_id
  ON web-eco_contact_source(contact_id);

CREATE INDEX IF NOT EXISTS idx_contact_sources_source
  ON web-eco_contact_source(source);

CREATE INDEX IF NOT EXISTS idx_contact_activity_contact_id
  ON web-eco_contact_activity(contact_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_intake_contact_id
  ON web-eco_waitlist_intake(contact_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_intake_source
  ON web-eco_waitlist_intake(source);

CREATE INDEX IF NOT EXISTS idx_gallery_image_gallery_id
  ON web-eco_gallery_image(gallery_id);

-- Step 8: Add indexes for email lookups (common query pattern)
CREATE INDEX IF NOT EXISTS idx_contact_email
  ON web-eco_contact(email);

CREATE INDEX IF NOT EXISTS idx_waitlist_intake_email
  ON web-eco_waitlist_intake(email);

-- Migration complete!
-- The schema now has:
-- ✅ Proper foreign key constraints
-- ✅ Multi-source tracking via contact_sources table
-- ✅ Backfilled data from existing records
-- ✅ Indexes for common query patterns
