/**
 * Trackable Link Utility
 * Creates trackable questionnaire links for email and SMS campaigns
 */

export interface TrackableLinkParams {
  contactId: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  campaign?: string;
  medium?: string; // 'email' | 'sms'
}

/**
 * Generates a trackable questionnaire link with UTM parameters and user data
 * @param baseUrl - The base URL (e.g., 'https://joinnewearthcollective.com')
 * @param params - Contact and tracking information
 * @returns Full trackable URL
 */
export function generateQuestionnaireLink(
  baseUrl: string,
  params: TrackableLinkParams
): string {
  const { contactId, name, email, phone, source, campaign, medium } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    name,
    email,
    phone,
    contactId: contactId.toString(),
    source,
  });

  // Add UTM parameters for tracking
  if (campaign) {
    queryParams.append("utm_campaign", campaign);
  }
  if (medium) {
    queryParams.append("utm_medium", medium);
  }
  queryParams.append("utm_source", "new-earth-collective");

  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  return `${cleanBaseUrl}/questionnaire?${queryParams.toString()}`;
}

/**
 * Generates a trackable questionnaire link specifically for email campaigns
 */
export function generateEmailQuestionnaireLink(
  baseUrl: string,
  contact: {
    id: number;
    name: string;
    email: string;
    phone: string;
  },
  campaignName: string
): string {
  return generateQuestionnaireLink(baseUrl, {
    contactId: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    source: "email-reminder",
    campaign: campaignName,
    medium: "email",
  });
}

/**
 * Generates a trackable questionnaire link specifically for SMS campaigns
 */
export function generateSMSQuestionnaireLink(
  baseUrl: string,
  contact: {
    id: number;
    name: string;
    email: string;
    phone: string;
  },
  campaignName: string
): string {
  return generateQuestionnaireLink(baseUrl, {
    contactId: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    source: "sms-reminder",
    campaign: campaignName,
    medium: "sms",
  });
}
