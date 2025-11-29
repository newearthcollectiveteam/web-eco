/**
 * Test script for waitlist API with improved CRM
 */

async function testWaitlistAPI() {
  try {
    console.log('🧪 Testing waitlist API with improved CRM...\n');

    const testData = {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '555-1234',
      message: 'Testing the improved CRM system',
      willingToFillQuestionnaire: true,
      source: 'test-implementation'
    };

    console.log('📤 Sending test data:', testData);

    const response = await fetch('http://localhost:3001/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('\n📥 Response status:', response.status);
    console.log('📥 Response data:', result);

    if (result.success) {
      console.log('\n✅ Test passed! Waitlist submission successful');
      console.log(`   Contact ID: ${result.contactId}`);
      console.log(`   Waitlist ID: ${result.waitlistId}`);
    } else {
      console.log('\n❌ Test failed!');
      console.log(`   Error: ${result.error}`);
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error('\nMake sure the dev server is running:');
    console.error('   npm run dev');
  }
}

testWaitlistAPI();
