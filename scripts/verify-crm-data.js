/**
 * Verify CRM data after test
 * Check that all tables were updated correctly
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function verifyData() {
  try {
    console.log('🔍 Verifying CRM data...\n');

    // Check the test contact
    const contact = await sql`
      SELECT * FROM "web-eco_contact"
      WHERE email = 'testuser@example.com'
    `;

    console.log('📋 Contact Record:');
    console.log('   ID:', contact[0].id);
    console.log('   Name:', contact[0].name);
    console.log('   Email:', contact[0].email);
    console.log('   First Source:', contact[0].first_source);
    console.log('   Status:', contact[0].status);
    console.log('   Tags:', contact[0].tags);
    console.log('');

    // Check contact sources
    const sources = await sql`
      SELECT * FROM "web-eco_contact_source"
      WHERE contact_id = ${contact[0].id}
    `;

    console.log('📊 Contact Sources:');
    sources.forEach((source, i) => {
      console.log(`   ${i + 1}. Source: ${source.source}`);
      console.log(`      Interaction Count: ${source.interaction_count}`);
      console.log(`      First: ${source.first_interaction}`);
      console.log(`      Last: ${source.last_interaction}`);
    });
    console.log('');

    // Check activities
    const activities = await sql`
      SELECT * FROM "web-eco_contact_activity"
      WHERE contact_id = ${contact[0].id}
      ORDER BY created_at DESC
    `;

    console.log('📝 Contact Activities:');
    activities.forEach((activity, i) => {
      console.log(`   ${i + 1}. ${activity.activity_type} from ${activity.source}`);
      console.log(`      ${activity.description}`);
      console.log(`      ${activity.created_at}`);
    });
    console.log('');

    // Check waitlist entries
    const waitlist = await sql`
      SELECT * FROM "web-eco_waitlist_intake"
      WHERE contact_id = ${contact[0].id}
    `;

    console.log('📋 Waitlist Entries:');
    waitlist.forEach((entry, i) => {
      console.log(`   ${i + 1}. From: ${entry.source}`);
      console.log(`      Message: ${entry.message}`);
      console.log(`      Willing to fill questionnaire: ${entry.willing_to_fill_questionnaire}`);
      console.log(`      Processed: ${entry.processed}`);
    });
    console.log('');

    // Summary
    console.log('✅ Verification Summary:');
    console.log(`   - Contact exists: ${contact.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   - Sources tracked: ${sources.length}`);
    console.log(`   - Activities logged: ${activities.length}`);
    console.log(`   - Waitlist entries: ${waitlist.length}`);
    console.log('');

    if (contact.length > 0 && sources.length > 0 && activities.length > 0 && waitlist.length > 0) {
      console.log('🎉 All data verified successfully!');
      console.log('✅ CRM improvements are working correctly\n');
    } else {
      console.log('⚠️  Some data is missing, check the logs\n');
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await sql.end();
  }
}

verifyData();
