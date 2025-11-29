# User Tracking & Analytics System Design

## Problem Statement

**Current Situation:**
- ✅ Email is unique identifier across forms
- ✅ CRM tracks which forms a contact submitted
- ❌ No tracking before form submission (anonymous visitors)
- ❌ No link click tracking from emails
- ❌ Can't distinguish which email link brought user back
- ❌ No session or page view analytics
- ❌ Can't track full user journey: first visit → email → return → conversion

**Goal:**
Build a complete tracking system that follows industry best practices (like Segment, Mixpanel, PostHog) to track the entire user lifecycle.

---

## User Lifecycle Stages

```
1. Anonymous Visitor
   ↓ (browses site, tracked by session)
2. Engaged Visitor
   ↓ (clicks email CTA, tracked by UTM params + link token)
3. Form Submitter
   ↓ (submits form, becomes known contact)
4. Contact (Known User)
   ↓ (tracked across all interactions)
5. Engaged Community Member
   ↓ (multiple form submissions, event attendance)
6. Active Member
```

---

## Core Concepts

### 1. **Anonymous ID** (before known)
- Generated on first visit
- Stored in cookie: `nec_aid` (New Earth Collective Anonymous ID)
- Tracks all activity before form submission
- UUID format: `anon_550e8400-e29b-41d4-a716-446655440000`

### 2. **Contact ID** (after known)
- Database ID from `contacts` table
- Assigned when form is submitted
- Links to email (unique identifier)

### 3. **Session ID**
- Unique per browser session
- Expires after 30 minutes of inactivity
- UUID format: `sess_550e8400-e29b-41d4-a716-446655440000`

### 4. **Tracking Token** (for email links)
- Unique per email sent
- Format: `et_[contactId]_[timestamp]_[randomHash]`
- Example: `et_123_1732847600_a1b2c3`
- Tracks which email brought user back

---

## Database Schema

### New Tables

#### 1. `sessions` - Browser sessions
```typescript
{
  id: UUID (primary key),
  anonymousId: UUID (indexed),
  contactId: integer (foreign key, nullable),

  // Session metadata
  initialSource: string, // How they first arrived
  initialMedium: string, // organic, email, social, etc.
  initialCampaign: string, // UTM campaign

  // Device & browser
  userAgent: string,
  ipAddress: string (hashed),
  device: string, // mobile, desktop, tablet
  browser: string,
  os: string,

  // Timestamps
  startedAt: timestamp,
  lastActivityAt: timestamp,
  endedAt: timestamp (nullable),

  createdAt: timestamp
}
```

#### 2. `events` - User interactions
```typescript
{
  id: serial (primary key),
  sessionId: UUID (foreign key),
  contactId: integer (foreign key, nullable),
  anonymousId: UUID (indexed),

  // Event details
  eventType: string, // page_view, form_submit, button_click, etc.
  eventName: string, // specific action

  // Context
  path: string, // /community, /waitlist, etc.
  referrer: string,

  // UTM parameters
  utmSource: string,
  utmMedium: string,
  utmCampaign: string,
  utmContent: string,
  utmTerm: string,

  // Properties
  properties: jsonb, // Flexible event data

  createdAt: timestamp
}
```

#### 3. `email_links` - Trackable links in emails
```typescript
{
  id: serial (primary key),
  token: string (unique, indexed), // et_123_1732847600_a1b2c3
  contactId: integer (foreign key),

  // Email context
  emailType: string, // waitlist_welcome, event_reminder, etc.
  emailSubject: string,
  sentAt: timestamp,

  // Link details
  destinationUrl: string,
  linkText: string, // CTA text

  // Tracking
  clickCount: integer (default 0),
  firstClickedAt: timestamp (nullable),
  lastClickedAt: timestamp (nullable),

  createdAt: timestamp
}
```

#### 4. `email_link_clicks` - Individual click events
```typescript
{
  id: serial (primary key),
  emailLinkId: integer (foreign key),
  contactId: integer (foreign key),
  sessionId: UUID (foreign key),

  // Click context
  clickedAt: timestamp,
  ipAddress: string (hashed),
  userAgent: string,

  // Did they convert after clicking?
  convertedToFormSubmission: boolean (default false),
  formSubmittedAt: timestamp (nullable),

  createdAt: timestamp
}
```

#### 5. `user_identity_map` - Links anonymous → known
```typescript
{
  id: serial (primary key),
  anonymousId: UUID (unique, indexed),
  contactId: integer (foreign key, indexed),

  // When did they become known?
  identifiedAt: timestamp,
  identificationSource: string, // waitlist, event-registration, etc.

  createdAt: timestamp
}
```

---

## Implementation Flow

### Scenario 1: New Anonymous Visitor

1. User lands on site
2. Middleware generates `anonymousId`, stores in cookie
3. Creates `session` record
4. Tracks `page_view` event
5. All subsequent actions tracked with `anonymousId`

### Scenario 2: Form Submission (Anonymous → Known)

1. User submits waitlist form
2. API creates `contact` record
3. **Links anonymous → contact** in `user_identity_map`
4. **Retroactively updates** all events: `anonymousId` → `contactId`
5. Updates session with `contactId`
6. Tracks `form_submission` event

### Scenario 3: Email Link Click → Return Visit

1. User receives email with tracked link
   - Link: `https://site.com/event?et=et_123_1732847600_a1b2c3`
2. User clicks link
3. Middleware detects `et` parameter
4. Looks up `emailLink` record
5. Increments click count
6. Creates `email_link_click` record
7. If cookie exists, associates with existing session
8. If not, creates new session linked to `contactId`

### Scenario 4: Known User Returns Later

1. User returns to site (has `contactId` cookie)
2. Middleware reads cookie
3. Creates new session linked to `contactId`
4. All events automatically attributed to contact
5. No need for email token (already known)

### Scenario 5: Multi-Form Journey

1. User submits waitlist form (becomes Contact #123)
2. Receives email with link to event registration
3. Clicks email link (tracked with `et` token)
4. Submits event registration form
5. System recognizes same email
6. Updates Contact #123 with event data
7. Creates `contactSource` for "event-registration"
8. Full funnel tracked: anonymous → waitlist → email click → event registration

---

## Link Generation Best Practices

### Format

```
https://newearth.eco/event-registration
  ?et=et_123_1732847600_a1b2c3        // Email tracking token
  &utm_source=klaviyo                 // Traffic source
  &utm_medium=email                   // Medium
  &utm_campaign=waitlist-nurture-day3 // Campaign name
  &utm_content=cta-register-now       // Which CTA
```

### Token Structure

```typescript
// Email Tracking Token (et)
const token = [
  'et',                    // prefix
  contactId,               // 123
  Math.floor(Date.now()/1000), // unix timestamp
  randomHash(8)            // a1b2c3d4
].join('_');

// Result: et_123_1732847600_a1b2c3d4
```

### Why This Works

- ✅ **Unique per email per contact** - no collisions
- ✅ **Time-stamped** - know when email was sent
- ✅ **Short enough** - fits in URL without being unwieldy
- ✅ **Secure** - random hash prevents guessing
- ✅ **Informative** - can extract contactId and timestamp

---

## UTM Parameter Tracking

### Standard UTM Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `utm_source` | Where traffic came from | klaviyo, mailchimp, instagram |
| `utm_medium` | How they got there | email, social, organic, cpc |
| `utm_campaign` | Which campaign | waitlist-nurture, summer-event |
| `utm_content` | Specific link/CTA | cta-join-now, banner-top |
| `utm_term` | Keyword (for paid) | community, meditation |

### Auto-Generated for Emails

```typescript
function generateEmailLink(params: {
  contactId: number;
  destinationPath: string;
  emailType: string;
  linkText: string;
}) {
  const token = generateEmailToken(params.contactId);

  const url = new URL(params.destinationPath, process.env.NEXT_PUBLIC_BASE_URL);
  url.searchParams.set('et', token);
  url.searchParams.set('utm_source', 'klaviyo');
  url.searchParams.set('utm_medium', 'email');
  url.searchParams.set('utm_campaign', params.emailType);
  url.searchParams.set('utm_content', slugify(params.linkText));

  return url.toString();
}
```

---

## Data Queries & Analytics

### Attribution Reports

**1. Which sources drive the most conversions?**
```sql
SELECT
  s.initial_source,
  s.initial_campaign,
  COUNT(DISTINCT c.id) as contacts,
  COUNT(DISTINCT CASE WHEN c.status = 'qualified' THEN c.id END) as qualified
FROM sessions s
JOIN contacts c ON s.contact_id = c.id
GROUP BY s.initial_source, s.initial_campaign
ORDER BY contacts DESC;
```

**2. Email click-through and conversion rates**
```sql
SELECT
  el.email_type,
  COUNT(*) as emails_sent,
  SUM(el.click_count) as total_clicks,
  COUNT(DISTINCT elc.contact_id) as unique_clickers,
  SUM(CASE WHEN elc.converted_to_form_submission THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(el.click_count) / COUNT(*), 2) as ctr_percent,
  ROUND(100.0 * SUM(CASE WHEN elc.converted_to_form_submission THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_percent
FROM email_links el
LEFT JOIN email_link_clicks elc ON el.id = elc.email_link_id
GROUP BY el.email_type;
```

**3. Multi-touch attribution**
```sql
SELECT
  c.email,
  c.first_source,
  array_agg(DISTINCT cs.source) as all_sources,
  array_agg(DISTINCT e.utm_campaign) as campaigns_engaged,
  COUNT(DISTINCT e.id) as total_events
FROM contacts c
JOIN events e ON c.id = e.contact_id
JOIN contact_sources cs ON c.id = cs.contact_id
GROUP BY c.id
HAVING COUNT(DISTINCT cs.source) > 1
ORDER BY total_events DESC;
```

---

## Privacy & Compliance

### GDPR/CCPA Compliance

1. **Cookie Consent**
   - Show banner before setting tracking cookies
   - Respect user preferences
   - Store consent in database

2. **IP Hashing**
   - Never store raw IP addresses
   - Use SHA-256 hashing: `sha256(ip + salt)`

3. **Right to Delete**
   - Delete all user data on request
   - Foreign keys cascade delete

4. **Data Minimization**
   - Only collect what's needed
   - Auto-delete old sessions (90 days)

### Security

1. **Tracking Tokens**
   - Include random hash (prevents guessing)
   - Rate limit token validation
   - Expire after 90 days

2. **Session Security**
   - HttpOnly cookies
   - Secure flag (HTTPS only)
   - SameSite=Lax

---

## Implementation Priority

### Phase 1: Foundation (Implement First)
1. ✅ Session tracking
2. ✅ Anonymous ID generation
3. ✅ Event logging (page views, form submissions)
4. ✅ UTM parameter capture

### Phase 2: Email Tracking
1. ✅ Email link generation service
2. ✅ Click tracking
3. ✅ Link → form conversion tracking

### Phase 3: Identity Resolution
1. ✅ Anonymous → Known linking
2. ✅ Retroactive event attribution
3. ✅ Cross-device recognition

### Phase 4: Analytics & Reporting
1. ✅ Dashboard queries
2. ✅ Attribution reports
3. ✅ Funnel analysis

---

## Similar to Industry Standards

This design follows patterns used by:

- **Segment** - Event tracking, anonymous ID, identity resolution
- **Mixpanel** - User profiles, event properties, funnel analysis
- **PostHog** - Session replay, feature flags, A/B testing
- **Amplitude** - User journey tracking, cohort analysis
- **Google Analytics 4** - Events, parameters, user ID tracking

**Key Difference:** We own all the data, full privacy control, no third-party dependencies.

---

## Next Steps

1. Implement database schema
2. Create tracking middleware
3. Build link generation service
4. Add event tracking to forms
5. Create analytics API
6. Build dashboard

---

**Result:** Full-funnel tracking from anonymous visitor to engaged community member, with complete attribution and privacy compliance.
