-- Add questionnaire responses table linked to master contacts
CREATE TABLE IF NOT EXISTS "web-eco_questionnaire_response" (
  "id" serial PRIMARY KEY,
  "contact_id" integer NOT NULL REFERENCES "web-eco_contact"(id) ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "discovery" jsonb DEFAULT '[]'::jsonb,
  "intention" jsonb DEFAULT '[]'::jsonb,
  "inner_work" jsonb DEFAULT '[]'::jsonb,
  "accountability" varchar(255),
  "commitment" varchar(255),
  "participation" varchar(255),
  "safety" varchar(255),
  "narratives" jsonb DEFAULT '{}'::jsonb,
  "birth_date" varchar(20),
  "birth_time" varchar(20),
  "birth_location" varchar(255),
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "web-eco_questionnaire_response_contact_idx"
  ON "web-eco_questionnaire_response" ("contact_id");
