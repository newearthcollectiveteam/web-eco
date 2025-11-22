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
  source: varchar("source", { length: 100 }).notNull(), // Which form/page they came from (e.g., "form-builder", "landing-page-1", "waitlist")
  status: varchar("status", { length: 50 }).default("lead").notNull(), // lead, qualified, customer, inactive
  tags: jsonb("tags").$type<string[]>(), // Array of tags for segmentation
  metadata: jsonb("metadata"), // Additional form data (custom fields, etc.)
  notes: text("notes"), // Internal notes about this contact
  firstContactDate: timestamp("first_contact_date", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  lastContactDate: timestamp("last_contact_date", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Contact activities - Track all interactions with contacts
 */
export const contactActivities = createTable("contact_activity", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(), // References contacts.id
  activityType: varchar("activity_type", { length: 50 }).notNull(), // form_submission, email_sent, email_opened, email_clicked, note_added
  source: varchar("source", { length: 100 }), // Which form/sequence
  description: text("description"),
  metadata: jsonb("metadata"), // Additional activity data
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Email Sequence System Tables
 */

/**
 * Email sequence configurations
 * Defines reusable email sequences (e.g., "welcome-series", "launch-countdown")
 */
export const emailSequences = createTable("email_sequence", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "test-sequence", "welcome-series"
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  // Array of email configurations in the sequence
  // Format: [{ emailNumber: 1, delayMinutes: 0, subject: "...", templateName: "..." }, ...]
  emails: jsonb("emails").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

/**
 * Scheduled emails to be sent
 * Individual emails queued for delivery
 */
export const scheduledEmails = createTable("scheduled_email", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id"), // References contacts.id - links to master CRM
  sequenceName: varchar("sequence_name", { length: 100 }).notNull(), // References email_sequences.name
  emailNumber: integer("email_number").notNull(), // Which email in the sequence (1, 2, 3, etc.)
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  // Additional data to pass to email template (form submission data, etc.)
  templateData: jsonb("template_data"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, failed, cancelled
  retryCount: integer("retry_count").default(0).notNull(),
  lastRetryAt: timestamp("last_retry_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Email send log
 * Track all email send attempts for monitoring and debugging
 */
export const emailSendLog = createTable("email_send_log", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id"), // References contacts.id - links to master CRM
  scheduledEmailId: integer("scheduled_email_id"), // References scheduled_emails.id (null if not from sequence)
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // mailjet, sendgrid, resend, etc.
  status: varchar("status", { length: 50 }).notNull(), // success, failed, rate_limited
  providerResponse: jsonb("provider_response"), // Store provider's response for debugging
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Rate limit tracking
 * Monitor email sends to avoid hitting provider limits
 */
export const rateLimitTracker = createTable("rate_limit_tracker", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // mailjet, sendgrid, etc.
  period: varchar("period", { length: 20 }).notNull(), // daily, monthly, hourly
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  emailCount: integer("email_count").default(0).notNull(),
  limit: integer("limit").notNull(), // The max allowed for this period
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});
