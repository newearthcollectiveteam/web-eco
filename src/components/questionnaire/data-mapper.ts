import type { FormData } from "./types";
import { screens } from "./screens";

/** Map option IDs back to their display labels using screen config */
function idsToLabels(ids: string[], screenId: string): string {
  const screen = screens.find((s) => s.id === screenId);
  if (!screen?.options) return ids.join(", ");
  return ids
    .map((id) => screen.options!.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

/** Join array values with optional "other" text appended */
function joinWithOther(
  ids: string[],
  screenId: string,
  otherText?: string
): string {
  const labels = idsToLabels(ids, screenId);
  if (otherText?.trim()) {
    return labels ? `${labels}, ${otherText.trim()}` : otherText.trim();
  }
  return labels;
}

/** Lookup label for a single option ID on a screen */
function idToLabel(id: string, screenId: string): string {
  const screen = screens.find((s) => s.id === screenId);
  return screen?.options?.find((o) => o.id === id)?.label ?? id;
}

// Gift/seek options live in question-screen.tsx but we need labels here too
const giftLabels: Record<string, string> = {
  healing: "Healing and facilitation",
  "creative-arts": "Creative arts and expression",
  technical: "Technical and building skills",
  leadership: "Organizational and leadership",
  teaching: "Teaching and mentorship",
  financial: "Financial resources",
  "land-space": "Land, space, or venue access",
  music: "Music and sound",
  farming: "Farming and food production",
  marketing: "Marketing and community growth",
  "legal-business": "Legal, accounting, or business",
  "deep-listening": "Deep listening and holding space",
};

const seekLabels: Record<string, string> = {
  connection: "Authentic connection and belonging",
  healing: "Healing and personal growth support",
  collaboration: "Collaboration on meaningful projects",
  "land-access": "Access to land and shared spaces",
  "skill-sharing": "Skill-sharing and learning",
  "business-support": "Business and entrepreneurial support",
  spiritual: "Spiritual community and practice partners",
  transitions: "Help navigating life transitions",
  accountability: "Accountability and honest feedback",
  fun: "Fun, play, and celebration",
  mentorship: "Mentorship from experienced guides",
};

/** Convert form state into the API payload shape the backend expects */
export function mapFormToPayload(
  data: FormData,
  meta: { source: string; contactId: string; referrerContactId?: number }
) {
  const roleLabels = idsToLabels(data.identityRoles, "your-role");
  const allRoles = data.identityRolesOther
    ? [...data.identityRoles, data.identityRolesOther]
    : data.identityRoles;
  const primaryRoleText = data.primaryRole || roleLabels.split(", ")[0] || "";

  const engagementLabelList = data.engagementStyles.map((id) =>
    idToLabel(id, "engage")
  );

  const howFoundUsLabel = idToLabel(data.howFoundUs, "found-us");

  const uniqueGiftText = data.uniqueGift
    .map((id) => giftLabels[id] ?? id)
    .concat(data.uniqueGiftOther ? [data.uniqueGiftOther] : [])
    .join(", ");

  const receiveText = data.receiveFromCommunity
    .map((id) => seekLabels[id] ?? id)
    .concat(data.receiveFromCommunityOther ? [data.receiveFromCommunityOther] : [])
    .join(", ");

  const intentionText = joinWithOther(
    data.primaryIntention,
    "intention",
    data.primaryIntentionOther
  );

  return {
    // Section 1
    name: data.fullName,
    preferredName: data.preferredName || undefined,
    email: data.email,
    phone: data.phone || undefined,
    preferredContactMethods: data.preferredContactMethods,
    currentLocation: data.currentLocation || undefined,
    isNomadic: data.isNomadic,
    nomadicBaseLocation: data.nomadicBaseLocation || undefined,
    birthDate: data.birthDate || undefined,
    birthTime: data.unknownBirthTime ? "unknown" : data.birthTime || undefined,
    birthLocation: data.birthLocation || undefined,

    // Section 2 — roles
    primaryRole: primaryRoleText,
    identityRoles: allRoles,
    identityRolesOther: data.identityRolesOther || undefined,
    skills: [],

    // Social — deferred
    website: undefined,
    instagram: undefined,
    twitter: undefined,
    linkedin: undefined,
    tiktok: undefined,
    youtube: undefined,
    facebook: undefined,
    otherSocial: undefined,

    // Section 3
    newEarthMeaning: data.newEarthMeaning.trim() || undefined,
    primaryIntention: intentionText,
    sovereigntyMeaning: undefined, // removed screen — send empty

    // Section 4
    uniqueGift: uniqueGiftText,
    receiveFromCommunity: receiveText,
    openToShareResources: undefined,
    physicalResources: [],
    resourceLocation: undefined,
    resourceOther: undefined,

    // Section 5
    howFoundUs: howFoundUsLabel,
    howFoundUsDetail: data.howFoundUsDetail || undefined,
    howFoundUsOther: data.howFoundUsOther || undefined,
    existingConnections: undefined,
    otherCommunities: undefined,
    seekingConnections: undefined,

    // Section 6
    engagementStyles: engagementLabelList,
    techAIRelationship: undefined,
    improveSocialNetworks: undefined,
    ecosystemContribution: undefined,
    devSkills: undefined,
    excitementLevel: 5, // default — removed screen

    // Section 7
    profileVisibility: data.profileVisibility,
    communicationPrefs: data.communicationPrefs,
    aiPhoneCallOptIn: data.aiPhoneCallOptIn,
    marketingOptIn: data.marketingOptIn,

    // Meta
    source: meta.source,
    contactId: meta.contactId,
    referrerContactId: meta.referrerContactId || undefined,
  };
}
