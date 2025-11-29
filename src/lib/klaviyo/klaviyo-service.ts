/**
 * Klaviyo Integration Service
 * Handles communication with Klaviyo API for email marketing automation
 *
 * Setup Instructions:
 * 1. Add KLAVIYO_API_KEY to .env file (get from Klaviyo account settings)
 * 2. Add KLAVIYO_WAITLIST_FLOW_ID to .env (create a flow in Klaviyo first)
 * 3. Update env.js to validate these environment variables
 * 4. Uncomment the code below and test
 */

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
 * Triggers a Klaviyo flow for a waitlist submission
 * This will send the contact data to Klaviyo and start the configured flow
 *
 * @param submission - The waitlist submission data
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function triggerKlaviyoWaitlistFlow(
  submission: WaitlistSubmission
): Promise<boolean> {
  // TODO: Uncomment when Klaviyo API keys are configured
  /*
  try {
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const KLAVIYO_WAITLIST_FLOW_ID = process.env.KLAVIYO_WAITLIST_FLOW_ID;

    if (!KLAVIYO_API_KEY) {
      console.error('❌ Klaviyo API key not configured');
      return false;
    }

    // Split name into first and last
    const nameParts = submission.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create or update profile in Klaviyo
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

    // Klaviyo API v2023-12-15
    const response = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2023-12-15',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            profile: profile,
            metric_name: 'Joined Waitlist',
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
      const errorData = await response.json();
      console.error('❌ Klaviyo API error:', errorData);
      return false;
    }

    console.log(`✅ Klaviyo event triggered for ${submission.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error triggering Klaviyo flow:', error);
    return false;
  }
  */

  // Temporary: Log that Klaviyo would be triggered here
  console.log(`🔔 [KLAVIYO PLACEHOLDER] Would trigger flow for:`, {
    email: submission.email,
    name: submission.name,
    source: submission.source,
    willingToFillQuestionnaire: submission.willingToFillQuestionnaire,
  });

  return true;
}

/**
 * Example: Add a profile to a Klaviyo list
 * Useful for segmenting contacts
 */
export async function addToKlaviyoList(
  email: string,
  listId: string
): Promise<boolean> {
  // TODO: Implement when needed
  console.log(`🔔 [KLAVIYO PLACEHOLDER] Would add ${email} to list ${listId}`);
  return true;
}

/**
 * Example: Update profile properties in Klaviyo
 * Useful for tracking additional data over time
 */
export async function updateKlaviyoProfile(
  email: string,
  properties: Record<string, unknown>
): Promise<boolean> {
  // TODO: Implement when needed
  console.log(
    `🔔 [KLAVIYO PLACEHOLDER] Would update profile ${email} with:`,
    properties
  );
  return true;
}

/**
 * Sends questionnaire reminder to contact
 * This creates an event in Klaviyo that triggers the questionnaire reminder flow
 */
export async function sendQuestionnaireReminder(params: {
  email: string;
  name: string;
  phone: string;
  questionnaireLink: string;
  contactId: number;
}): Promise<boolean> {
  // TODO: Uncomment when Klaviyo API keys are configured
  /*
  try {
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;

    if (!KLAVIYO_API_KEY) {
      console.error('❌ Klaviyo API key not configured');
      return false;
    }

    const nameParts = params.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create event in Klaviyo to trigger questionnaire reminder flow
    const response = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2023-12-15',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            profile: {
              email: params.email,
              firstName,
              lastName,
              phoneNumber: params.phone,
              properties: {
                contactId: params.contactId,
              },
            },
            metric_name: 'Questionnaire Reminder',
            properties: {
              questionnaire_link: params.questionnaireLink,
              reminder_sent_at: new Date().toISOString(),
            },
            time: new Date().toISOString(),
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Klaviyo API error:', errorData);
      return false;
    }

    console.log(`✅ Questionnaire reminder sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending questionnaire reminder:', error);
    return false;
  }
  */

  console.log(`🔔 [KLAVIYO PLACEHOLDER] Would send questionnaire reminder to:`, {
    email: params.email,
    name: params.name,
    questionnaireLink: params.questionnaireLink,
  });

  return true;
}

/**
 * Triggers event when questionnaire is completed
 * This can be used to stop reminder flows and trigger completion flows
 */
export async function triggerQuestionnaireCompleted(params: {
  email: string;
  name: string;
  contactId: number;
}): Promise<boolean> {
  console.log(`🔔 [KLAVIYO PLACEHOLDER] Would trigger questionnaire completed event for:`, {
    email: params.email,
    name: params.name,
    contactId: params.contactId,
  });

  return true;
}
