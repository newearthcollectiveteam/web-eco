/**
 * Migration Script: Improve CRM and Intake Form Relationships
 *
 * This script:
 * 1. Renames contacts.source to contacts.first_source
 * 2. Adds default JSONB values
 * 3. Creates contact_sources table
 * 4. Adds foreign key constraints
 * 5. Backfills data from existing records
 * 6. Creates indexes for performance
 */

import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

console.log("🔄 Connecting to database...");
console.log(
  `📍 Database: ${DATABASE_URL.split("@")[1]?.split("/")[0] || "local"}`
);

const sql = postgres(DATABASE_URL);

async function runMigration() {
  try {
    console.log("\n🚀 Starting CRM improvements migration...\n");

    // Step 1: Check if migration already ran
    console.log("📋 Step 1: Checking if migration already ran...");
    try {
      const result = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'web-eco_contact'
        AND column_name = 'first_source'
      `;

      if (result.length > 0) {
        console.log(
          "⚠️  Migration appears to have already run (first_source column exists)"
        );
        console.log("⚠️  Skipping to later steps...\n");
      }
    } catch (e) {
      // Column doesn't exist yet, continue with migration
      console.log("✅ Migration not yet applied, proceeding...\n");
    }

    // Step 2: Rename source to firstSource in contacts table
    console.log(
      "📋 Step 2: Renaming contacts.source to contacts.first_source..."
    );
    try {
      await sql`
        ALTER TABLE "web-eco_contact"
        RENAME COLUMN source TO first_source
      `;
      console.log("✅ Column renamed successfully\n");
    } catch (e) {
      if (
        e.message.includes("does not exist") ||
        e.message.includes("already exists")
      ) {
        console.log("⚠️  Column already renamed, skipping...\n");
      } else {
        throw e;
      }
    }

    // Step 3: Add default values for JSONB fields if they're NULL
    console.log("📋 Step 3: Setting default JSONB values...");
    await sql`
      UPDATE "web-eco_contact"
      SET tags = '[]'::jsonb
      WHERE tags IS NULL
    `;
    await sql`
      UPDATE "web-eco_contact"
      SET metadata = '{}'::jsonb
      WHERE metadata IS NULL
    `;
    console.log("✅ Default JSONB values set\n");

    // Step 4: Create contact_sources table
    console.log("📋 Step 4: Creating contact_sources table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_contact_source" (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER NOT NULL,
        source VARCHAR(100) NOT NULL,
        first_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        interaction_count INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT unique_contact_source UNIQUE (contact_id, source)
      )
    `;
    console.log("✅ contact_sources table created\n");

    // Step 5: Add foreign key for contact_sources
    console.log("📋 Step 5: Adding foreign key constraints...");
    try {
      await sql`
        ALTER TABLE "web-eco_contact_source"
        ADD CONSTRAINT fk_contact_source_contact
        FOREIGN KEY (contact_id)
        REFERENCES "web-eco_contact"(id)
        ON DELETE CASCADE
      `;
      console.log("✅ Foreign key added to contact_sources\n");
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("⚠️  Foreign key already exists, skipping...\n");
      } else {
        throw e;
      }
    }

    // Step 6: Backfill contact_sources from existing data
    console.log("📋 Step 6: Backfilling contact_sources from contacts...");
    const backfillResult = await sql`
      INSERT INTO "web-eco_contact_source" (contact_id, source, first_interaction, last_interaction, interaction_count)
      SELECT
        id,
        first_source,
        first_contact_date,
        last_contact_date,
        1
      FROM "web-eco_contact"
      WHERE id NOT IN (SELECT contact_id FROM "web-eco_contact_source")
    `;
    console.log(
      `✅ Backfilled ${backfillResult.count} contact sources from contacts table\n`
    );

    // Step 7: Backfill from waitlist_intake
    console.log(
      "📋 Step 7: Backfilling contact_sources from waitlist_intake..."
    );
    const waitlistBackfill = await sql`
      INSERT INTO "web-eco_contact_source" (contact_id, source, first_interaction, last_interaction, interaction_count)
      SELECT
        contact_id,
        source,
        created_at,
        created_at,
        1
      FROM "web-eco_waitlist_intake"
      WHERE contact_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "web-eco_contact_source" cs
        WHERE cs.contact_id = "web-eco_waitlist_intake".contact_id
        AND cs.source = "web-eco_waitlist_intake".source
      )
    `;
    console.log(
      `✅ Backfilled ${waitlistBackfill.count} contact sources from waitlist_intake\n`
    );

    // Step 8: Create indexes
    console.log("📋 Step 8: Creating indexes...");

    const indexes = [
      sql`CREATE INDEX IF NOT EXISTS idx_contact_sources_contact_id ON "web-eco_contact_source"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_contact_sources_source ON "web-eco_contact_source"(source)`,
      sql`CREATE INDEX IF NOT EXISTS idx_contact_activity_contact_id ON "web-eco_contact_activity"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_waitlist_intake_contact_id ON "web-eco_waitlist_intake"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_waitlist_intake_source ON "web-eco_waitlist_intake"(source)`,
      sql`CREATE INDEX IF NOT EXISTS idx_gallery_image_gallery_id ON "web-eco_gallery_image"(gallery_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_contact_email ON "web-eco_contact"(email)`,
      sql`CREATE INDEX IF NOT EXISTS idx_waitlist_intake_email ON "web-eco_waitlist_intake"(email)`,
    ];

    for (const indexQuery of indexes) {
      await indexQuery;
    }

    console.log("✅ All indexes created\n");

    // Step 9: Verify the migration
    console.log("📋 Step 9: Verifying migration...");
    const contactCount =
      await sql`SELECT COUNT(*) as count FROM "web-eco_contact"`;
    const sourceCount =
      await sql`SELECT COUNT(*) as count FROM "web-eco_contact_source"`;
    const activityCount =
      await sql`SELECT COUNT(*) as count FROM "web-eco_contact_activity"`;
    const waitlistCount =
      await sql`SELECT COUNT(*) as count FROM "web-eco_waitlist_intake"`;

    console.log("📊 Database stats:");
    console.log(`   - Contacts: ${contactCount[0].count}`);
    console.log(`   - Contact Sources: ${sourceCount[0].count}`);
    console.log(`   - Contact Activities: ${activityCount[0].count}`);
    console.log(`   - Waitlist Entries: ${waitlistCount[0].count}`);

    console.log("\n✅ Migration completed successfully!\n");
    console.log("🎉 Your CRM is now ready for multiple intake forms with:");
    console.log("   ✅ Proper foreign key constraints");
    console.log("   ✅ Multi-source tracking via contact_sources table");
    console.log("   ✅ Backfilled data from existing records");
    console.log("   ✅ Indexes for common query patterns\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\nError details:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the migration
runMigration();
