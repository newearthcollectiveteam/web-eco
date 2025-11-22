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
  activityType: varchar("activity_type", { length: 50 }).notNull(), // form_submission, note_added, etc.
  source: varchar("source", { length: 100 }), // Which form/page
  description: text("description"),
  metadata: jsonb("metadata"), // Additional activity data
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
