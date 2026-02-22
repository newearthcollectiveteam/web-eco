export type ScreenType =
  | "text"
  | "text-pills"
  | "autocomplete"
  | "birth-info"
  | "multi-select"
  | "single-select"
  | "give-receive"
  | "preferences"
  | "review";

export interface SelectOption {
  id: string;
  label: string;
}

export interface ScreenConfig {
  id: string;
  type: ScreenType;
  title: string;
  subtitle?: string;
  field: string;
  extraFields?: string[];
  options?: SelectOption[];
  minSelect?: number;
  maxSelect?: number;
  hasOther?: boolean;
  otherPlaceholder?: string;
  otherField?: string;
  required?: boolean;
  detailOptions?: Record<string, string>;
  detailField?: string;
}

export interface FormData {
  // Screen 1: Name
  fullName: string;
  preferredName: string;
  // Screen 2: Contact
  email: string;
  phone: string;
  preferredContactMethods: string[];
  // Screen 3: Location
  currentLocation: string;
  isNomadic: boolean;
  nomadicBaseLocation: string;
  // Screen 4: Birth Info
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  unknownBirthTime: boolean;
  // Screen 5: Your Role
  identityRoles: string[];
  identityRolesOther: string;
  primaryRole: string;
  // Screen 6: New Earth
  newEarthMeaning: string[];
  newEarthMeaningOther: string;
  // Screen 7: Intention
  primaryIntention: string;
  primaryIntentionOther: string;
  // Screen 8: Give & Receive
  uniqueGift: string[];
  uniqueGiftOther: string;
  receiveFromCommunity: string[];
  receiveFromCommunityOther: string;
  // Screen 9: Found Us
  howFoundUs: string;
  howFoundUsDetail: string;
  howFoundUsOther: string;
  // Screen 10: Engage
  engagementStyles: string[];
  // Screen 11: Preferences + Opt-ins
  profileVisibility: string;
  communicationPrefs: string[];
  aiPhoneCallOptIn: boolean;
  marketingOptIn: boolean;
}

export const initialFormData: FormData = {
  fullName: "",
  preferredName: "",
  email: "",
  phone: "",
  preferredContactMethods: [],
  currentLocation: "",
  isNomadic: false,
  nomadicBaseLocation: "",
  birthDate: "",
  birthTime: "",
  birthLocation: "",
  unknownBirthTime: false,
  identityRoles: [],
  identityRolesOther: "",
  primaryRole: "",
  newEarthMeaning: [],
  newEarthMeaningOther: "",
  primaryIntention: "",
  primaryIntentionOther: "",
  uniqueGift: [],
  uniqueGiftOther: "",
  receiveFromCommunity: [],
  receiveFromCommunityOther: "",
  howFoundUs: "",
  howFoundUsDetail: "",
  howFoundUsOther: "",
  engagementStyles: [],
  profileVisibility: "",
  communicationPrefs: [],
  aiPhoneCallOptIn: true,
  marketingOptIn: true,
};
