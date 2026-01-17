import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  text,
  timestamp,
  boolean,
  serial,
  varchar,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Database schema for New Earth Collective ecosystem
 * Using PostgreSQL with Supabase
 * Improved with proper foreign keys and scalable intake form pattern
 */
export const createTable = pgTableCreator((name) => `web-eco_${name}`);

/**
 * User profiles table
 * Linked to Supabase Auth users via id field (UUID from auth.users)
 */
export const userProfiles = createTable("user_profile", {
  // Uses Supabase Auth user ID (UUID) as primary key
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  approvalStatus: varchar("approval_status", { length: 50 })
    .default("pending")
    .notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedBy: text("approved_by"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

// Example table - can be removed when adding real application tables
export const posts = createTable("post", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Master CRM System
 */

/**
 * Contacts - Master CRM database
 * Central repository for all contacts from all forms and sources
 */
export const contacts = createTable("contact", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),

  // Track the FIRST source where this contact came from
  firstSource: varchar("first_source", { length: 100 }).notNull(),

  // Lead lifecycle status
  status: varchar("status", { length: 50 }).default("lead").notNull(), // lead, qualified, customer, inactive

  // Consent tracking (GDPR/CAN-SPAM compliance)
  emailConsent: boolean("email_consent").default(false).notNull(),
  smsConsent: boolean("sms_consent").default(false).notNull(),
  consentGrantedAt: timestamp("consent_granted_at", { withTimezone: true }),
  consentIpAddress: varchar("consent_ip_address", { length: 45 }),

  // Unsubscribe tracking
  unsubscribedEmail: boolean("unsubscribed_email").default(false).notNull(),
  unsubscribedSms: boolean("unsubscribed_sms").default(false).notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).unique(),

  // Segmentation and tagging
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),

  // Use metadata sparingly - only for truly dynamic fields
  // Common fields should get their own columns
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

  // Internal notes
  notes: text("notes"),

  // Engagement tracking
  firstContactDate: timestamp("first_contact_date", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  lastContactDate: timestamp("last_contact_date", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Contact Sources - Track ALL sources a contact has interacted with
 * Solves the multi-form problem: a contact can submit multiple forms
 */
export const contactSources = createTable("contact_source", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Which form/page they interacted with
  source: varchar("source", { length: 100 }).notNull(),

  // First and last interaction with THIS source
  firstInteraction: timestamp("first_interaction", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  lastInteraction: timestamp("last_interaction", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // How many times they've interacted with this source
  interactionCount: integer("interaction_count").default(1).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

// Note: Composite unique constraint (contactId, source) should be added via database migration
// Drizzle's inline unique() only supports single columns

/**
 * Contact Activities - Track all interactions with contacts
 */
export const contactActivities = createTable("contact_activity", {
  id: serial("id").primaryKey(),

  // Foreign key with constraint
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Type of activity
  activityType: varchar("activity_type", { length: 50 }).notNull(), // form_submission, note_added, email_sent, etc.

  // Which form/page triggered this
  source: varchar("source", { length: 100 }),

  // Description of the activity
  description: text("description"),

  // Additional activity data (form-specific details)
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Questionnaire Responses - Alignment survey submissions
 * Redesigned with proper columns for all fields
 */
export const questionnaireResponses = createTable("questionnaire_response", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Section 1: The Basics - Contact Information
  name: varchar("name", { length: 255 }).notNull(),
  preferredName: varchar("preferred_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  preferredContactMethods: jsonb("preferred_contact_methods")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),

  // Section 1: The Basics - Location
  currentLocation: text("current_location"),
  isNomadic: boolean("is_nomadic").default(false),
  nomadicBaseLocation: text("nomadic_base_location"), // Conditional: when isNomadic=true

  // Section 1: The Basics - Birth Information
  birthDate: varchar("birth_date", { length: 50 }),
  birthTime: varchar("birth_time", { length: 100 }),
  birthLocation: text("birth_location"),

  // Section 2: Gifts & Identity - Role
  primaryRole: varchar("primary_role", { length: 500 }),
  identityRoles: jsonb("identity_roles").$type<string[]>().default(sql`'[]'::jsonb`),
  identityRolesOther: varchar("identity_roles_other", { length: 500 }), // Conditional: when "Other" selected

  // Section 2: Gifts & Identity - Skills
  skills: jsonb("skills").$type<string[]>().default(sql`'[]'::jsonb`),

  // Section 2: Gifts & Identity - Online Presence
  website: varchar("website", { length: 500 }),
  instagram: varchar("instagram", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  linkedin: varchar("linkedin", { length: 500 }),
  tiktok: varchar("tiktok", { length: 255 }),
  youtube: varchar("youtube", { length: 500 }),
  facebook: varchar("facebook", { length: 500 }),
  otherSocial: varchar("other_social", { length: 500 }),

  // Section 3: Alignment Check
  newEarthMeaning: text("new_earth_meaning"),
  primaryIntention: text("primary_intention"),
  sovereigntyMeaning: text("sovereignty_meaning"),

  // Section 4: Give & Receive
  uniqueGift: text("unique_gift"),
  receiveFromCommunity: text("receive_from_community"),
  openToShareResources: varchar("open_to_share_resources", { length: 50 }), // yes_free, yes_depends, no
  physicalResources: jsonb("physical_resources")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`), // Conditional: when openToShareResources != no
  resourceLocation: varchar("resource_location", { length: 255 }), // Conditional: when land resource selected
  resourceOther: varchar("resource_other", { length: 500 }), // Conditional: other resources

  // Section 5: Community & Connection - Discovery
  howFoundUs: varchar("how_found_us", { length: 100 }),
  howFoundUsDetail: varchar("how_found_us_detail", { length: 500 }), // Conditional: for invitation/social/event
  howFoundUsOther: varchar("how_found_us_other", { length: 500 }), // Conditional: when howFoundUs=other

  // Section 5: Community & Connection - Network
  existingConnections: text("existing_connections"),
  otherCommunities: text("other_communities"),
  seekingConnections: text("seeking_connections"),

  // Section 6: Ecosystem Development
  engagementStyles: jsonb("engagement_styles").$type<string[]>().default(sql`'[]'::jsonb`),
  techAIRelationship: text("tech_ai_relationship"),
  improveSocialNetworks: text("improve_social_networks"),
  ecosystemContribution: varchar("ecosystem_contribution", { length: 50 }), // dev, beta, updates, not_interested
  devSkills: varchar("dev_skills", { length: 500 }), // Conditional: when ecosystemContribution=dev
  excitementLevel: integer("excitement_level").default(5),

  // Section 7: Preferences
  profileVisibility: varchar("profile_visibility", { length: 50 }), // public, searchable, private
  communicationPrefs: jsonb("communication_prefs").$type<string[]>().default(sql`'[]'::jsonb`),

  // Metadata
  source: varchar("source", { length: 100 }).default("questionnaire"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Waitlist Intake - Community waitlist form submissions
 * Stores raw form data for the New Earth Collective community waitlist
 */
export const waitlistIntake = createTable("waitlist_intake", {
  id: serial("id").primaryKey(),

  // Foreign key to master CRM with constraint
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Common fields (all intake tables have these)
  source: varchar("source", { length: 100 }).notNull(),
  processed: boolean("processed").default(false).notNull(),

  // Waitlist-specific fields
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message"), // Why they want to join
  willingToFillQuestionnaire: boolean("willing_to_fill_questionnaire")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Photo Galleries - Organize community photos into galleries
 */
export const galleries = createTable("gallery", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isPublished: boolean("is_published").default(true).notNull(),
  coverImageUrl: text("cover_image_url"), // Featured image for the gallery card
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Gallery Images - Individual photos within galleries
 * Images are stored in Supabase Storage, this table stores metadata and references
 */
export const galleryImages = createTable("gallery_image", {
  id: serial("id").primaryKey(),

  // Foreign key with constraint
  galleryId: integer("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),

  imageUrl: text("image_url").notNull(), // Supabase Storage URL
  thumbnailUrl: text("thumbnail_url"), // Optional optimized thumbnail
  caption: text("caption"),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
  width: integer("width"), // Original image width
  height: integer("height"), // Original image height
  storagePath: varchar("storage_path", { length: 500 }).notNull(), // Path in Supabase Storage bucket
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Tracking & Analytics System
 * Complete user journey tracking from anonymous visitor to engaged community member
 */

/**
 * Sessions - Browser sessions for both anonymous and known users
 */
export const sessions = createTable("session", {
  id: text("id").primaryKey(), // UUID: sess_550e8400-e29b-41d4-a716-446655440000
  anonymousId: text("anonymous_id").notNull(), // UUID: anon_550e8400-e29b-41d4-a716-446655440000

  // Links to contact when user becomes known (nullable for anonymous sessions)
  contactId: integer("contact_id").references(() => contacts.id, {
    onDelete: "set null",
  }),

  // Initial acquisition data (where did they first come from?)
  initialDomain: varchar("initial_domain", { length: 100 }), // Which domain they first landed on
  initialSource: varchar("initial_source", { length: 100 }), // klaviyo, google, direct
  initialMedium: varchar("initial_medium", { length: 100 }), // email, organic, social
  initialCampaign: varchar("initial_campaign", { length: 100 }), // waitlist-nurture-day3

  // Device & browser info
  userAgent: text("user_agent"),
  ipAddressHash: varchar("ip_address_hash", { length: 64 }), // SHA-256 hash
  device: varchar("device", { length: 50 }), // mobile, desktop, tablet
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),

  // Session timing
  startedAt: timestamp("started_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Events - All user interactions (page views, clicks, form submissions, etc.)
 */
export const events = createTable("event", {
  id: serial("id").primaryKey(),

  // Foreign keys (at least one will always be present)
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "cascade",
  }),
  contactId: integer("contact_id").references(() => contacts.id, {
    onDelete: "set null",
  }),
  anonymousId: text("anonymous_id").notNull(), // Always present, even for known users

  // Event details
  eventType: varchar("event_type", { length: 50 }).notNull(), // page_view, button_click, form_submit, etc.
  eventName: varchar("event_name", { length: 100 }), // Specific action name

  // Page context
  domain: varchar("domain", { length: 100 }), // Which domain/subdomain
  path: varchar("path", { length: 500 }), // /community, /waitlist, etc.
  referrer: text("referrer"),

  // UTM parameters for attribution
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  utmContent: varchar("utm_content", { length: 100 }),
  utmTerm: varchar("utm_term", { length: 100 }),

  // Additional event data (flexible JSONB)
  properties: jsonb("properties").default(sql`'{}'::jsonb`),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Email Links - Trackable links sent in emails
 */
export const emailLinks = createTable("email_link", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 100 }).notNull().unique(), // et_123_1732847600_a1b2c3

  // Who received this link
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // Email context
  emailType: varchar("email_type", { length: 100 }).notNull(), // waitlist_welcome, event_reminder
  emailSubject: varchar("email_subject", { length: 255 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),

  // Link details
  destinationUrl: text("destination_url").notNull(),
  linkText: varchar("link_text", { length: 255 }), // CTA text

  // Click tracking
  clickCount: integer("click_count").default(0).notNull(),
  firstClickedAt: timestamp("first_clicked_at", { withTimezone: true }),
  lastClickedAt: timestamp("last_clicked_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Email Link Clicks - Individual click events for email links
 */
export const emailLinkClicks = createTable("email_link_click", {
  id: serial("id").primaryKey(),

  // Foreign keys
  emailLinkId: integer("email_link_id")
    .notNull()
    .references(() => emailLinks.id, { onDelete: "cascade" }),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),

  // Click context
  clickedAt: timestamp("clicked_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  ipAddressHash: varchar("ip_address_hash", { length: 64 }), // SHA-256 hash
  userAgent: text("user_agent"),

  // Conversion tracking
  convertedToFormSubmission: boolean("converted_to_form_submission")
    .default(false)
    .notNull(),
  formSubmittedAt: timestamp("form_submitted_at", { withTimezone: true }),
  formType: varchar("form_type", { length: 100 }), // which form they submitted

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * User Identity Map - Links anonymous IDs to known contacts
 * Enables tracking user journey from anonymous → known
 */
export const userIdentityMap = createTable("user_identity_map", {
  id: serial("id").primaryKey(),
  // Ensure one anonymous ID maps to only one contact (but contact can have multiple anonymous IDs from different devices)
  anonymousId: text("anonymous_id").notNull().unique(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  // When and how did they become known?
  identifiedAt: timestamp("identified_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  identificationSource: varchar("identification_source", { length: 100 }).notNull(), // waitlist, event-registration, etc.

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Event Waivers - Signed liability waivers for events
 * Stores waiver submissions with digital signatures
 */
export const eventWaivers = createTable("event_waiver", {
  id: serial("id").primaryKey(),

  // Signer information
  signerName: varchar("signer_name", { length: 255 }).notNull(),
  signerEmail: varchar("signer_email", { length: 255 }).notNull(),

  // Event details
  eventName: varchar("event_name", { length: 255 }).notNull(),
  eventDate: varchar("event_date", { length: 50 }).notNull(),
  eventLocation: varchar("event_location", { length: 255 }).notNull(),

  // Signature data (base64 PNG)
  signatureData: text("signature_data").notNull(),

  // Waiver version for legal tracking
  waiverVersion: varchar("waiver_version", { length: 50 }).default("1.0").notNull(),

  // Agreement tracking
  agreedToTerms: boolean("agreed_to_terms").default(false).notNull(),
  agreedToPhotoVideo: boolean("agreed_to_photo_video").default(false).notNull(),

  // Submission metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  signedAt: timestamp("signed_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
