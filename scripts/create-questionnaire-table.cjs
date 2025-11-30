const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Read database URL from environment
require('dotenv').config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

const sql = postgres(connectionString);

async function createTable() {
  try {
    console.log('🔄 Creating questionnaire_response table...');

    const createTableSQL = `
CREATE TABLE IF NOT EXISTS "web-eco_questionnaire_response" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer NOT NULL,
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
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "web-eco_questionnaire_response_contact_id_web-eco_contact_id_fk"
    FOREIGN KEY ("contact_id") REFERENCES "web-eco_contact"("id") ON DELETE cascade
);
    `;

    await sql.unsafe(createTableSQL);

    console.log('✅ Table created successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    await sql.end();
    process.exit(1);
  }
}

createTable();
