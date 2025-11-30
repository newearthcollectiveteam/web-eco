interface KlaviyoProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  properties?: Record<string, unknown>;
}

interface WaitlistSubmission {
  email: string;
  name: string;
  phone?: string;
  message?: string;
  willingToFillQuestionnaire: boolean;
  source: string;
}

/**
 * Emit a Klaviyo event for a waitlist submission.
 * Uses the Klaviyo Events API (v2023-12-15) with a Private API Key.
 *
 * Env vars (optional but recommended to set):
 * - KLAVIYO_API_KEY (required to send)
 * - KLAVIYO_WAITLIST_METRIC (defaults to "Joined Waitlist")
 */
export async function triggerKlaviyoWaitlistFlow(
  submission: WaitlistSubmission
): Promise<boolean> {
  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  Klaviyo API key not configured; skipping Klaviyo event.");
    return false;
  }

  const metric = "GLOBAL_LANDING_SUBMITTED";

  try {
    const nameParts = submission.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const profile: KlaviyoProfile = {
      email: submission.email,
      firstName,
      lastName,
      phoneNumber: submission.phone,
      properties: {
        $source: submission.source,
        waitlist_message: submission.message,
        willing_to_fill_questionnaire: submission.willingToFillQuestionnaire,
        joined_waitlist_at: new Date().toISOString(),
      },
    };

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
            profile,
            metric_name: metric,
            properties: {
              source: submission.source,
              message: submission.message,
              willingToFillQuestionnaire: submission.willingToFillQuestionnaire,
            },
            time: new Date().toISOString(),
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ Klaviyo API error:", response.status, errorText);
      return false;
    }

    console.log(`✅ Klaviyo event "${metric}" sent for ${submission.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error triggering Klaviyo event:", error);
    return false;
  }
}
