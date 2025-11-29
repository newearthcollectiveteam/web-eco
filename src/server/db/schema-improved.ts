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
  unique,
} from "drizzle-orm/pg-core";

/**
 * Improved Database Schema for New Earth Collective ecosystem
 * With proper foreign key constraints and scalable intake form pattern
 */
export const createTable = pgTableCreator((name) => `web-eco_${name}`);

/**
 * User profiles table
 * Linked to Supabase Auth users via id field (UUID from auth.users)
 */
export const userProfiles = createTable("user_profile", {
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
  (table) => ({
    // Prevent duplicate contact-source pairs
    uniqueContactSource: unique().on(table.contactId, table.source),
  }),
);

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
 * Intake Form Tables
 * Each form type gets its own table following this pattern
 */

/**
 * Waitlist Intake - Community waitlist form submissions
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
  message: text("message"),
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
  coverImageUrl: text("cover_image_url"),
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
 */
export const galleryImages = createTable("gallery_image", {
  id: serial("id").primaryKey(),

  // Foreign key with constraint
  galleryId: integer("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),

  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
  width: integer("width"),
  height: integer("height"),
  storagePath: varchar("storage_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
