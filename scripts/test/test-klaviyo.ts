/**
 * Test script to verify Klaviyo Events API submission using a metric ID.
 * Requires KLAVIYO_API_KEY and KLAVIYO_METRIC_ID set in .env
 * Run with: npx tsx scripts/test-klaviyo.ts
 */

import "dotenv/config";

async function testKlaviyoEvent() {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const metricId = process.env.KLAVIYO_METRIC_ID;

  if (!apiKey) {
    console.error("❌ KLAVIYO_API_KEY not found in environment");
    process.exit(1);
  }
  if (!metricId) {
    console.error("❌ KLAVIYO_METRIC_ID not found in environment");
    process.exit(1);
  }

  const firstName = "Test";
  const lastName = "User";
  const email = "test@example.com";
  const phone = "+1234567890";
  const profileId = `profile:${email.toLowerCase()}`;

  console.log("🧪 Testing Klaviyo Events API submission...\n");

  try {
    const response = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        "Content-Type": "application/json",
        revision: "2023-12-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: {
              data: {
                type: "metric",
                id: metricId,
              },
            },
            profile: {
              data: {
                type: "profile",
                id: profileId,
              },
            },
            properties: {
              source: "test-script",
              message: "This is a test submission",
              willing_to_fill_questionnaire: true,
              joined_waitlist_at: new Date().toISOString(),
            },
            time: new Date().toISOString(),
          },
        },
        included: [
          {
            type: "profile",
            id: profileId,
            attributes: {
              email,
              first_name: firstName,
              last_name: lastName,
              phone_number: phone,
              properties: {
                $source: "test-script",
                waitlist_message: "This is a test submission",
                willing_to_fill_questionnaire: true,
                joined_waitlist_at: new Date().toISOString(),
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Klaviyo Events API Error:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json().catch(() => ({}));
    console.log(
      `✅ Klaviyo Events API event sent for ${email} (metric id: ${metricId})`
    );
    console.log("Raw response:", data);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testKlaviyoEvent();
