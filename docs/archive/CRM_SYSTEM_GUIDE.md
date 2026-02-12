# Master CRM System - Complete Guide

## Overview

A centralized Customer Relationship Management (CRM) system that tracks all contacts from all forms and sources. Every form submission creates or updates a contact in the master CRM database, ensuring you have a single source of truth for all customer data.

## Architecture

```
Form Submission → Master CRM (upsert contact) → Schedule Email Sequence
                       ↓
                  Log Activity
                       ↓
                  Track in Timeline
```

### Key Features

- ✅ **Single Source of Truth**: All contacts from all forms in one database
- ✅ **Automatic De-duplication**: Email-based matching prevents duplicates
- ✅ **Source Tracking**: Know exactly where each contact came from
- ✅ **Activity Timeline**: Complete history of all interactions
- ✅ **Status Management**: Track lead → qualified → customer progression
- ✅ **Tagging System**: Segment contacts with flexible tags
- ✅ **Custom Metadata**: Store any additional form data
- ✅ **Integrated with Email Sequences**: All emails link back to contacts

## Database Tables

### `contacts` - Master CRM Database

The central repository for all contacts.

**Fields:**

- `id` - Unique contact ID
- `email` - Email address (unique, indexed)
- `name` - Full name
- `phone` - Phone number
- `source` - Where they came from (e.g., "form-builder", "landing-1", "waitlist")
- `status` - Current status: "lead", "qualified", "customer", "inactive"
- `tags` - Array of tags for segmentation
- `metadata` - JSON object for custom form data
- `notes` - Internal notes
- `firstContactDate` - When first created
- `lastContactDate` - Most recent interaction
- `createdAt` / `updatedAt` - Timestamps

### `contact_activities` - Activity Timeline

Tracks all interactions with contacts.

**Fields:**

- `id` - Activity ID
- `contactId` - References contact
- `activityType` - Type: "form_submission", "email_sent", "email_opened", "note_added"
- `source` - Which form/sequence
- `description` - Human-readable description
- `metadata` - Additional activity data
- `createdAt` - When it happened

### Updated Email Tables

- `scheduled_emails` - Now includes `contactId` to link emails to CRM
- `email_send_log` - Now includes `contactId` to track sends per contact

## How It Works

### 1. Form Submission Flow

When a user submits ANY form:

```typescript
// Step 1: Create or update contact in master CRM
const { contact, isNew } = await upsertContact({
  email: "user@example.com",
  name: "John Doe",
  phone: "+1 555-0123",
  source: "form-builder", // Which form
  status: "lead",
  tags: ["test-sequence"],
  metadata: {
    message: "I want to join!",
    submittedAt: new Date().toISOString(),
  },
});

// Step 2: Schedule email sequence (linked to contact)
await scheduleEmailSequence({
  sequenceName: "test-sequence",
  recipientEmail: contact.email,
  recipientName: contact.name,
  contactId: contact.id, // Links emails to CRM
});

// Step 3: Log activity
await addContactActivity({
  contactId: contact.id,
  activityType: "form_submission",
  source: "form-builder",
  description: "Submitted form and joined test sequence",
});
```

### 2. Automatic De-duplication

If a contact submits multiple forms:

- First submission creates new contact
- Subsequent submissions update existing contact
- Updates `lastContactDate`
- Merges metadata
- Adds new tags
- Logs each activity

### 3. Contact Lifecycle

```
lead → qualified → customer → inactive
  ↓        ↓          ↓          ↓
Forms  Engagement  Purchase  Churned
```

## API Endpoints

### Get All Contacts

```bash
curl http://localhost:3000/api/crm/contacts
```

**Query Parameters:**

- `source` - Filter by source (e.g., "form-builder")
- `status` - Filter by status (e.g., "lead")
- `search` - Search by email or name
- `limit` - Max results (default: 50)

**Response:**

```json
{
  "success": true,
  "contacts": [...],
  "total": 42,
  "stats": {
    "bySource": [
      { "source": "form-builder", "count": 30 },
      { "source": "landing-1", "count": 12 }
    ],
    "byStatus": [
      { "status": "lead", "count": 35 },
      { "status": "qualified", "count": 7 }
    ]
  }
}
```

### Get Single Contact with Activities

```bash
curl "http://localhost:3000/api/crm/contacts?id=1"
```

**Response:**

```json
{
  "success": true,
  "contact": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "source": "form-builder",
    "status": "lead",
    ...
  },
  "activities": [
    {
      "id": 1,
      "activityType": "form_submission",
      "description": "Submitted form and joined test sequence",
      "createdAt": "2025-01-21T10:00:00Z"
    },
    {
      "id": 2,
      "activityType": "email_sent",
      "description": "Email #1 sent",
      "createdAt": "2025-01-21T10:01:00Z"
    }
  ]
}
```

## Using the CRM Service

### Import the Service

```typescript
import {
  upsertContact,
  getContactByEmail,
  getContactById,
  updateContact,
  addContactActivity,
  getContactActivities,
  searchContacts,
} from "~/lib/crm/crm-service";
```

### Create/Update Contact

```typescript
const { contact, isNew } = await upsertContact({
  email: "user@example.com",
  name: "John Doe",
  phone: "+1 555-0123",
  source: "landing-page-1",
  status: "lead",
  tags: ["early-adopter", "vip"],
  metadata: {
    referralCode: "FRIEND2025",
    interests: ["meditation", "community"],
  },
});

console.log(isNew ? "New contact created!" : "Existing contact updated!");
```

### Get Contact by Email

```typescript
const contact = await getContactByEmail("user@example.com");
if (contact) {
  console.log(`Found contact: ${contact.name} (${contact.status})`);
}
```

### Update Contact Status

```typescript
await updateContact(contactId, {
  status: "qualified",
  notes: "Responded to welcome email, very engaged",
});
```

### Add Activity

```typescript
await addContactActivity({
  contactId: 1,
  activityType: "email_opened",
  source: "test-sequence",
  description: "Opened welcome email",
  metadata: {
    emailNumber: 1,
    openedAt: new Date().toISOString(),
  },
});
```

### Search Contacts

```typescript
// Get all contacts from a specific source
const contacts = await searchContacts({
  source: "form-builder",
  limit: 100,
});

// Get all qualified leads
const qualified = await searchContacts({
  status: "qualified",
  limit: 50,
});
```

## Adding CRM to New Forms

When creating a new form, follow this pattern:

### 1. Update Form Component

Add a hidden or optional `source` field:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch("/api/form-submission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      name,
      phone,
      message,
      source: "my-new-form", // Unique identifier for this form
      sequenceName: "welcome-series",
    }),
  });
};
```

### 2. Form Submission Automatically:

- Creates/updates contact with `source: 'my-new-form'`
- Links all scheduled emails to that contact
- Logs activity in timeline
- Returns `contactId` and `isNewContact` in response

### 3. Track Multiple Forms

Each form can have a unique source:

- `form-builder` - Test form builder
- `landing-1` - Landing page variant 1
- `landing-2` - Landing page variant 2
- `waitlist` - Waitlist signup
- `early-access` - Early access request
- `contact-us` - Contact form

This lets you track conversion rates and segment by source.

## Common Queries

### Get Contact with Full History

```bash
curl "http://localhost:3000/api/crm/contacts?id=1"
```

### Get All Contacts from Landing Page 1

```bash
curl "http://localhost:3000/api/crm/contacts?source=landing-1"
```

### Search for Specific Email

```bash
curl "http://localhost:3000/api/crm/contacts?search=john@example.com"
```

### Get All Qualified Leads

```bash
curl "http://localhost:3000/api/crm/contacts?status=qualified"
```

## Best Practices

### 1. Use Descriptive Sources

Use clear, unique identifiers for each form:

```typescript
// Good
source: "landing-page-1";
source: "waitlist-2024";
source: "webinar-signup";

// Avoid
source: "form";
source: "page1";
```

### 2. Tag Strategically

Use tags to segment contacts:

```typescript
tags: [
  sequenceName, // Auto-tag with sequence
  "early-bird", // Manual segment tags
  "vip",
  "referred-by-friend",
];
```

### 3. Store Rich Metadata

Capture useful context in metadata:

```typescript
metadata: {
  referralSource: 'instagram',
  campaignId: 'summer-2024',
  interests: ['yoga', 'meditation'],
  howDidYouHear: 'Friend recommendation',
}
```

### 4. Log Important Activities

Track meaningful interactions:

```typescript
// Email engagement
await addContactActivity({
  contactId,
  activityType: "email_opened",
  source: sequenceName,
  description: "Opened email #3",
});

// Status changes
await addContactActivity({
  contactId,
  activityType: "status_changed",
  description: "Upgraded from lead to customer",
  metadata: { previousStatus: "lead", newStatus: "customer" },
});

// Manual notes
await addContactActivity({
  contactId,
  activityType: "note_added",
  description: "Had great conversation on discovery call",
});
```

### 5. Update Contact Status

Keep status current as contacts progress:

```typescript
// New submission
status: "lead";

// Responded to emails, showed interest
status: "qualified";

// Made purchase or joined
status: "customer";

// No engagement for 90+ days
status: "inactive";
```

## Data Flow Example

**User Journey:**

1. **Day 1**: User submits waitlist form
   - Contact created: `{ source: 'waitlist', status: 'lead' }`
   - Activity logged: `form_submission`
   - Email sequence scheduled

2. **Day 1 (later)**: Emails sent
   - Activities logged: `email_sent` (x6)
   - All emails linked to contact via `contactId`

3. **Day 2**: User clicks email link
   - Activity logged: `email_clicked`
   - Status updated: `qualified`

4. **Day 7**: User submits another form (early access)
   - Existing contact updated
   - `lastContactDate` updated
   - New activity: `form_submission` from `early-access`
   - New sequence scheduled

5. **Day 30**: User becomes customer
   - Status updated: `customer`
   - Activity: `status_changed`
   - Note added: Details about conversion

## Monitoring

### View Contact Stats

```bash
curl http://localhost:3000/api/crm/contacts | jq '.stats'
```

### Check Recent Activities

```bash
curl "http://localhost:3000/api/crm/contacts?id=1" | jq '.activities | .[:5]'
```

## Future Enhancements

Planned features:

- [ ] Bulk import/export
- [ ] Advanced segmentation
- [ ] Email open/click tracking integration
- [ ] Custom fields per source
- [ ] Automated status progression
- [ ] Contact scoring
- [ ] Merge duplicate contacts
- [ ] CRM dashboard UI

## File Structure

```
src/
├── lib/crm/
│   └── crm-service.ts           # CRM operations
├── app/api/
│   ├── crm/contacts/route.ts    # CRM API
│   └── form-submission/route.ts # Form handler (CRM integrated)
└── server/db/schema.ts          # Database schema

CRM_SYSTEM_GUIDE.md              # This guide
```

## Summary

Every form submission now:

1. ✅ Creates/updates contact in master CRM
2. ✅ Tracks source of submission
3. ✅ Logs activity in timeline
4. ✅ Links all emails to contact
5. ✅ Enables unified customer view

You have a complete CRM system tracking all contacts across all forms with full activity history!

---

Built with Claude Code by Anthropic
