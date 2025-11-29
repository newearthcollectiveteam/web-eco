-- Add willing_to_fill_questionnaire field to waitlist_intake table
ALTER TABLE "web-eco_waitlist_intake"
ADD COLUMN IF NOT EXISTS willing_to_fill_questionnaire BOOLEAN NOT NULL DEFAULT false;
