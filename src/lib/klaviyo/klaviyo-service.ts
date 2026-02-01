import { env } from "~/env";

interface WaitlistSubmission {
  email: string;
  name: string;
  phone?: string;
  message?: string;
  willingToFillQuestionnaire: boolean;
  source: string;
}

/**
 * Send a Klaviyo event for a waitlist submission via the Events API.
 * Requires KLAVIYO_API_KEY and KLAVIYO_METRIC_ID (metric must already exist).
 */
export async function triggerKlaviyoWaitlistFlow(
  submission: WaitlistSubmission
): Promise<boolean> {
  const apiKey = env.KLAVIYO_API_KEY;
  const metricId = env.KLAVIYO_METRIC_ID;

  if (!apiKey) {
    console.warn("⚠️  Klaviyo API key not configured; skipping Klaviyo event.");
    return false;
  }
  if (!metricId) {
    console.warn(
      "⚠️  KLAVIYO_METRIC_ID not set; cannot send Events API payload without a metric ID."
    );
    return false;
  }

  const nameParts = submission.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const profileId = `profile:${submission.email.toLowerCase()}`;

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
              source: submission.source,
              message: submission.message,
              willing_to_fill_questionnaire:
                submission.willingToFillQuestionnaire,
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
              email: submission.email,
              first_name: firstName,
              last_name: lastName,
              phone_number: submission.phone,
              properties: {
                $source: submission.source,
                waitlist_message: submission.message,
                willing_to_fill_questionnaire:
                  submission.willingToFillQuestionnaire,
                joined_waitlist_at: new Date().toISOString(),
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ Klaviyo Events API error:", response.status, errorText);
      return false;
    }

    console.log(
      `✅ Klaviyo event sent for ${submission.email} (metric id: ${metricId})`
    );
    return true;
  } catch (error) {
    console.error("❌ Error triggering Klaviyo event:", error);
    return false;
  }
}
