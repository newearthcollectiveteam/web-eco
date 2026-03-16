import { sql, relations } from "drizzle-orm";
import {
  pgTableCreator,
  text,
  timestamp,
  boolean,
  serial,
  varchar,
  integer,
  jsonb,
  unique,
  index,
  type AnyPgColumn,
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
  phone: varchar("phone", { length: 50 }),
  teamRoles: jsonb("team_roles").$type<string[]>().default(sql`'[]'::jsonb`),
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

/**
 * Master CRM System
 */

/**
 * Contacts - Master CRM database
 * Central repository for all contacts from all forms and sources
 */
export const contacts = createTable(
  "contact",
  {
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
    tags: jsonb("tags")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`),

    // Use metadata sparingly - only for truly dynamic fields
    // Common fields should get their own columns
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    // Who added this contact (team member tracking)
    addedBy: text("added_by").references(() => userProfiles.id, { onDelete: "set null" }),

    // Referral tracking — who referred this contact
    referredByContactId: integer("referred_by_contact_id").references(
      (): AnyPgColumn => contacts.id,
      { onDelete: "set null" }
    ),

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
  },
  (t) => [
    index("idx_contact_status").on(t.status),
    index("idx_contact_first_source").on(t.firstSource),
    index("idx_contact_last_contact").on(t.lastContactDate),
    index("idx_contact_created").on(t.createdAt),
  ]
);

/**
 * Contact Sources - Track ALL sources a contact has interacted with
 * Solves the multi-form problem: a contact can submit multiple forms
 */
export const contactSources = createTable(
  "contact_source",
  {
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
  },
  (t) => [unique("unique_contact_source").on(t.contactId, t.source)]
);

/**
 * Contact Activities - Track all interactions with contacts
 */
export const contactActivities = createTable(
  "contact_activity",
  {
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
  },
  (t) => [
    index("idx_activity_contact").on(t.contactId),
    index("idx_activity_type").on(t.activityType),
    index("idx_activity_created").on(t.createdAt),
  ]
);

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
  identityRoles: jsonb("identity_roles")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),
  identityRolesOther: varchar("identity_roles_other", { length: 500 }), // Conditional: when "Other" selected

  // Section 2: Gifts & Identity - Skills
  skills: jsonb("skills")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),

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
  engagementStyles: jsonb("engagement_styles")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),
  techAIRelationship: text("tech_ai_relationship"),
  improveSocialNetworks: text("improve_social_networks"),
  ecosystemContribution: varchar("ecosystem_contribution", { length: 50 }), // dev, beta, updates, not_interested
  devSkills: varchar("dev_skills", { length: 500 }), // Conditional: when ecosystemContribution=dev
  excitementLevel: integer("excitement_level").default(5),

  // Section 7: Preferences
  profileVisibility: varchar("profile_visibility", { length: 50 }), // public, searchable, private
  communicationPrefs: jsonb("communication_prefs")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),
  aiPhoneCallOptIn: boolean("ai_phone_call_opt_in").default(true),
  marketingOptIn: boolean("marketing_opt_in").default(true),

  // Referral tracking
  referrerContactId: integer("referrer_contact_id").references(
    () => contacts.id,
    { onDelete: "set null" }
  ),

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
  identificationSource: varchar("identification_source", {
    length: 100,
  }).notNull(), // waitlist, event-registration, etc.

  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Event Waivers - Signed liability waivers for events
 * Stores waiver submissions with digital signatures
 */
export const eventWaivers = createTable(
  "event_waiver",
  {
    id: serial("id").primaryKey(),

    // FK to contacts (nullable for legacy waivers without a contact)
    contactId: integer("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),

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
    waiverVersion: varchar("waiver_version", { length: 50 })
      .default("1.0")
      .notNull(),

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
  },
  (t) => [
    index("idx_waiver_contact").on(t.contactId),
    index("idx_waiver_signer_email").on(t.signerEmail),
  ]
);

/**
 * Voice Notes - Audio recordings attached to contacts
 * Files stored in Supabase Storage (voice-notes bucket)
 */
export const voiceNotes = createTable("voice_note", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  recordedBy: text("recorded_by")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "set null" }),
  storagePath: varchar("storage_path", { length: 500 }).notNull(),
  publicUrl: text("public_url").notNull(),
  durationSeconds: integer("duration_seconds"),
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: varchar("mime_type", { length: 100 }).default("audio/webm"),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Team Tasks - Lightweight task management
 * Assigned to team members with notes and priority
 */
export const teamTasks = createTable(
  "team_task",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"), // rich notes
    status: varchar("status", { length: 50 }).default("todo").notNull(), // todo, in_progress, done
    priority: varchar("priority", { length: 20 }).default("medium").notNull(), // low, medium, high, urgent
    assignedTo: text("assigned_to").references(() => userProfiles.id, { onDelete: "set null" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "set null" }),
    startDate: timestamp("start_date", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_task_assigned").on(t.assignedTo),
    index("idx_task_status").on(t.status),
    index("idx_task_due").on(t.dueDate),
  ]
);

/**
 * Task Statuses - Custom status columns for kanban/list views
 * Slug is stored in teamTasks.status to link tasks to their column
 */
export const taskStatuses = createTable("task_status", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Display name: "To Do", "In Progress"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // Stored in tasks: "todo", "in_progress"
  color: varchar("color", { length: 100 }).default("text-gray-400 border-gray-500/30"),
  icon: varchar("icon", { length: 50 }).default("circle"), // Lucide icon name
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export const taskStatusesRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(teamTasks),
}));

export const teamTasksRelations = relations(teamTasks, ({ one }) => ({
  assignee: one(userProfiles, {
    fields: [teamTasks.assignedTo],
    references: [userProfiles.id],
    relationName: "taskAssignee",
  }),
  creator: one(userProfiles, {
    fields: [teamTasks.createdBy],
    references: [userProfiles.id],
    relationName: "taskCreator",
  }),
}));

/**
 * Community Tags - Hierarchical taxonomy for communities and locations
 * type: 'community' for groups/events, 'location' for geographic hubs
 * parent_id enables tree structure (location → community, meta → sub)
 */
export const communityTags = createTable("community_tag", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull().default("community"), // 'community' or 'location'
  description: text("description"),
  color: varchar("color", { length: 20 }),
  parentId: integer("parent_id").references(
    (): AnyPgColumn => communityTags.id,
    { onDelete: "set null" }
  ),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Contact Community Tags - Many-to-many between contacts and community tags
 */
export const contactCommunityTags = createTable(
  "contact_community_tag",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    communityTagId: integer("community_tag_id")
      .notNull()
      .references(() => communityTags.id, { onDelete: "cascade" }),
    taggedAt: timestamp("tagged_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    taggedBy: varchar("tagged_by", { length: 100 }), // 'system', 'manual', 'questionnaire'
  },
  (t) => [
    unique("unique_contact_community").on(t.contactId, t.communityTagId),
    index("idx_contact_community_contact").on(t.contactId),
    index("idx_contact_community_tag").on(t.communityTagId),
  ]
);

/**
 * Contact Associations - Many-to-many between contacts and team members
 * Replaces single addedBy FK with flexible association system
 */
export const contactAssociations = createTable(
  "contact_association",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    unique("unique_contact_user").on(t.contactId, t.userId),
    index("idx_contact_associations_contact").on(t.contactId),
    index("idx_contact_associations_user").on(t.userId),
  ]
);

/**
 * Drizzle Relations
 * Enable type-safe eager loading with `with:` syntax
 */

export const communityTagsRelations = relations(communityTags, ({ one, many }) => ({
  parent: one(communityTags, {
    fields: [communityTags.parentId],
    references: [communityTags.id],
    relationName: "communityTagHierarchy",
  }),
  children: many(communityTags, {
    relationName: "communityTagHierarchy",
  }),
  contactTags: many(contactCommunityTags),
}));

export const contactCommunityTagsRelations = relations(
  contactCommunityTags,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactCommunityTags.contactId],
      references: [contacts.id],
    }),
    communityTag: one(communityTags, {
      fields: [contactCommunityTags.communityTagId],
      references: [communityTags.id],
    }),
  })
);

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  sources: many(contactSources),
  activities: many(contactActivities),
  associations: many(contactAssociations),
  communityTags: many(contactCommunityTags),
  questionnaireResponses: many(questionnaireResponses, {
    relationName: "submitter",
  }),
  referrals: many(questionnaireResponses, {
    relationName: "referrer",
  }),
  referredBy: one(contacts, {
    fields: [contacts.referredByContactId],
    references: [contacts.id],
    relationName: "contactReferrals",
  }),
  referredContacts: many(contacts, {
    relationName: "contactReferrals",
  }),
  waitlistIntakes: many(waitlistIntake),
  eventWaivers: many(eventWaivers),
  voiceNotes: many(voiceNotes),
  sessions: many(sessions),
  events: many(events),
  emailLinks: many(emailLinks),
  emailLinkClicks: many(emailLinkClicks),
  identityMaps: many(userIdentityMap),
  addedByProfile: one(userProfiles, {
    fields: [contacts.addedBy],
    references: [userProfiles.id],
  }),
}));

export const contactAssociationsRelations = relations(
  contactAssociations,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactAssociations.contactId],
      references: [contacts.id],
    }),
    user: one(userProfiles, {
      fields: [contactAssociations.userId],
      references: [userProfiles.id],
    }),
  })
);

export const contactSourcesRelations = relations(contactSources, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactSources.contactId],
    references: [contacts.id],
  }),
}));

export const contactActivitiesRelations = relations(
  contactActivities,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactActivities.contactId],
      references: [contacts.id],
    }),
  })
);

export const questionnaireResponsesRelations = relations(
  questionnaireResponses,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [questionnaireResponses.contactId],
      references: [contacts.id],
      relationName: "submitter",
    }),
    referrerContact: one(contacts, {
      fields: [questionnaireResponses.referrerContactId],
      references: [contacts.id],
      relationName: "referrer",
    }),
  })
);

export const waitlistIntakeRelations = relations(waitlistIntake, ({ one }) => ({
  contact: one(contacts, {
    fields: [waitlistIntake.contactId],
    references: [contacts.id],
  }),
}));

export const galleriesRelations = relations(galleries, ({ many }) => ({
  images: many(galleryImages),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryImages.galleryId],
    references: [galleries.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [sessions.contactId],
    references: [contacts.id],
  }),
  events: many(events),
  emailLinkClicks: many(emailLinkClicks),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  session: one(sessions, {
    fields: [events.sessionId],
    references: [sessions.id],
  }),
  contact: one(contacts, {
    fields: [events.contactId],
    references: [contacts.id],
  }),
}));

export const emailLinksRelations = relations(emailLinks, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [emailLinks.contactId],
    references: [contacts.id],
  }),
  clicks: many(emailLinkClicks),
}));

export const emailLinkClicksRelations = relations(
  emailLinkClicks,
  ({ one }) => ({
    emailLink: one(emailLinks, {
      fields: [emailLinkClicks.emailLinkId],
      references: [emailLinks.id],
    }),
    contact: one(contacts, {
      fields: [emailLinkClicks.contactId],
      references: [contacts.id],
    }),
    session: one(sessions, {
      fields: [emailLinkClicks.sessionId],
      references: [sessions.id],
    }),
  })
);

export const eventWaiversRelations = relations(eventWaivers, ({ one }) => ({
  contact: one(contacts, {
    fields: [eventWaivers.contactId],
    references: [contacts.id],
  }),
}));

export const voiceNotesRelations = relations(voiceNotes, ({ one }) => ({
  contact: one(contacts, {
    fields: [voiceNotes.contactId],
    references: [contacts.id],
  }),
  recorder: one(userProfiles, {
    fields: [voiceNotes.recordedBy],
    references: [userProfiles.id],
  }),
}));

export const userIdentityMapRelations = relations(
  userIdentityMap,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [userIdentityMap.contactId],
      references: [contacts.id],
    }),
  })
);
