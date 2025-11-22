-- Create waitlist_intake table
CREATE TABLE IF NOT EXISTS "web-eco_waitlist_intake" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "message" TEXT,
  "source" VARCHAR(100) NOT NULL,
  "contact_id" INTEGER,
  "processed" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "idx_waitlist_email" ON "web-eco_waitlist_intake" ("email");
CREATE INDEX IF NOT EXISTS "idx_waitlist_created_at" ON "web-eco_waitlist_intake" ("created_at");
