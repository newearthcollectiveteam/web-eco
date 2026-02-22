/**
 * Migration Script: Add Tracking & Analytics Tables
 *
 * This script adds:
 * 1. sessions - Browser sessions
 * 2. events - User interaction tracking
 * 3. email_links - Trackable email links
 * 4. email_link_clicks - Click tracking
 * 5. user_identity_map - Anonymous → Known linking
 */

import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log("\n🚀 Starting tracking & analytics migration...\n");

    // Step 1: Create sessions table
    console.log("📋 Step 1: Creating sessions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_session" (
        id TEXT PRIMARY KEY,
        anonymous_id TEXT NOT NULL,
        contact_id INTEGER REFERENCES "web-eco_contact"(id) ON DELETE SET NULL,

        initial_domain VARCHAR(100),
        initial_source VARCHAR(100),
        initial_medium VARCHAR(100),
        initial_campaign VARCHAR(100),

        user_agent TEXT,
        ip_address_hash VARCHAR(64),
        device VARCHAR(50),
        browser VARCHAR(50),
        os VARCHAR(50),

        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ended_at TIMESTAMP WITH TIME ZONE,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log("✅ Sessions table created\n");

    // Step 2: Create events table
    console.log("📋 Step 2: Creating events table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_event" (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES "web-eco_session"(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES "web-eco_contact"(id) ON DELETE SET NULL,
        anonymous_id TEXT NOT NULL,

        event_type VARCHAR(50) NOT NULL,
        event_name VARCHAR(100),

        domain VARCHAR(100),
        path VARCHAR(500),
        referrer TEXT,

        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        utm_content VARCHAR(100),
        utm_term VARCHAR(100),

        properties JSONB DEFAULT '{}'::jsonb,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log("✅ Events table created\n");

    // Step 3: Create email_links table
    console.log("📋 Step 3: Creating email_links table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_email_link" (
        id SERIAL PRIMARY KEY,
        token VARCHAR(100) NOT NULL UNIQUE,
        contact_id INTEGER NOT NULL REFERENCES "web-eco_contact"(id) ON DELETE CASCADE,

        email_type VARCHAR(100) NOT NULL,
        email_subject VARCHAR(255),
        sent_at TIMESTAMP WITH TIME ZONE,

        destination_url TEXT NOT NULL,
        link_text VARCHAR(255),

        click_count INTEGER DEFAULT 0 NOT NULL,
        first_clicked_at TIMESTAMP WITH TIME ZONE,
        last_clicked_at TIMESTAMP WITH TIME ZONE,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log("✅ Email links table created\n");

    // Step 4: Create email_link_clicks table
    console.log("📋 Step 4: Creating email_link_clicks table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_email_link_click" (
        id SERIAL PRIMARY KEY,
        email_link_id INTEGER NOT NULL REFERENCES "web-eco_email_link"(id) ON DELETE CASCADE,
        contact_id INTEGER NOT NULL REFERENCES "web-eco_contact"(id) ON DELETE CASCADE,
        session_id TEXT REFERENCES "web-eco_session"(id) ON DELETE SET NULL,

        clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ip_address_hash VARCHAR(64),
        user_agent TEXT,

        converted_to_form_submission BOOLEAN DEFAULT FALSE NOT NULL,
        form_submitted_at TIMESTAMP WITH TIME ZONE,
        form_type VARCHAR(100),

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log("✅ Email link clicks table created\n");

    // Step 5: Create user_identity_map table
    console.log("📋 Step 5: Creating user_identity_map table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "web-eco_user_identity_map" (
        id SERIAL PRIMARY KEY,
        anonymous_id TEXT NOT NULL UNIQUE,
        contact_id INTEGER NOT NULL REFERENCES "web-eco_contact"(id) ON DELETE CASCADE,

        identified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        identification_source VARCHAR(100) NOT NULL,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log("✅ User identity map table created\n");

    // Step 6: Create indexes for performance
    console.log("📋 Step 6: Creating indexes...");

    const indexes = [
      // Session indexes
      sql`CREATE INDEX IF NOT EXISTS idx_session_anonymous_id ON "web-eco_session"(anonymous_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_session_contact_id ON "web-eco_session"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_session_started_at ON "web-eco_session"(started_at)`,

      // Event indexes
      sql`CREATE INDEX IF NOT EXISTS idx_event_session_id ON "web-eco_event"(session_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_event_contact_id ON "web-eco_event"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_event_anonymous_id ON "web-eco_event"(anonymous_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_event_type ON "web-eco_event"(event_type)`,
      sql`CREATE INDEX IF NOT EXISTS idx_event_domain ON "web-eco_event"(domain)`,
      sql`CREATE INDEX IF NOT EXISTS idx_event_created_at ON "web-eco_event"(created_at)`,

      // Email link indexes
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_token ON "web-eco_email_link"(token)`,
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_contact_id ON "web-eco_email_link"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_type ON "web-eco_email_link"(email_type)`,

      // Email link click indexes
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_click_email_link_id ON "web-eco_email_link_click"(email_link_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_click_contact_id ON "web-eco_email_link_click"(contact_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_email_link_click_session_id ON "web-eco_email_link_click"(session_id)`,

      // Identity map indexes
      sql`CREATE INDEX IF NOT EXISTS idx_identity_map_anonymous_id ON "web-eco_user_identity_map"(anonymous_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_identity_map_contact_id ON "web-eco_user_identity_map"(contact_id)`,
    ];

    for (const indexQuery of indexes) {
      await indexQuery;
    }

    console.log("✅ All indexes created\n");

    // Step 7: Verify migration
    console.log("📋 Step 7: Verifying migration...");

    const tableChecks = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'web-eco_%'
      AND table_name IN (
        'web-eco_session',
        'web-eco_event',
        'web-eco_email_link',
        'web-eco_email_link_click',
        'web-eco_user_identity_map'
      )
      ORDER BY table_name
    `;

    console.log("📊 Tracking tables created:");
    tableChecks.forEach((table) => {
      console.log(`   ✅ ${table.table_name}`);
    });
    console.log("");

    console.log("✅ Migration completed successfully!\n");
    console.log("🎉 Your tracking & analytics system is ready!");
    console.log("");
    console.log("New capabilities:");
    console.log("   ✅ Session tracking (anonymous + known users)");
    console.log("   ✅ Event tracking (page views, clicks, conversions)");
    console.log("   ✅ Email link tracking with click attribution");
    console.log("   ✅ Cross-device user identification");
    console.log("   ✅ Multi-domain tracking support");
    console.log("   ✅ UTM parameter capture");
    console.log("   ✅ Complete user journey tracking\n");
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
