import { config } from 'dotenv';
import { readFileSync } from 'fs';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function runMigration() {
  try {
    const migrationSQL = readFileSync('./drizzle/migrations/0001_questionnaire_redesign.sql', 'utf8');

    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Running ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await sql.unsafe(stmt);
          console.log(`✓ Statement ${i + 1}/${statements.length} completed`);
        } catch (err) {
          console.error(`✗ Statement ${i + 1} failed:`, err.message);
          console.error('Statement:', stmt.substring(0, 100) + '...');
        }
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function checkColumns() {
  try {
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'web-eco_questionnaire_response'
      ORDER BY ordinal_position
    `;
    console.log('Current columns:');
    result.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await sql.end();
  }
}

// Check if we should run migration or check columns
if (process.argv[2] === 'check') {
  checkColumns();
} else {
  runMigration();
}
