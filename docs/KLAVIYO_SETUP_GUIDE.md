# Klaviyo Integration Setup Guide

## Overview

Your Klaviyo integration uses an **event-based architecture** that's fully expandable:

```
Form Submit → API Route → Klaviyo Event → Flow Triggered → Email Sent
```

**Key Benefits:**

- ✅ Each form can trigger different flows
- ✅ Easy to add conditional branching (e.g., questionnaire completion)
- ✅ Unsubscribe logic can update both Klaviyo and Supabase
- ✅ All consent tracking is handled in Supabase

---

## Step-by-Step Setup

### **STEP 1: Create Your First Flow in Klaviyo**

#### 1.1 Access Klaviyo Dashboard

- Go to https://www.klaviyo.com
- Log in with your account

#### 1.2 Navigate to Flows

- Click **Flows** in the left sidebar
- Click **Create Flow** button (top right)
- Select **Create From Scratch**

#### 1.3 Name Your Flow

- **Flow Name:** "Global Landing Waitlist Flow"
- **Description:** "Welcome series for users who join from the global landing page"
- Click **Create Flow**

#### 1.4 Add the Trigger

1. Click **Add Trigger** in the flow builder
2. Select **Metric** as trigger type
3. In the metric dropdown, type: **`GLOBAL_LANDING_SUBMITTED`**
   - ⚠️ **IMPORTANT:** This exact name must match what your code sends
   - This event is automatically created when your form sends it the first time
4. **Trigger Settings:**
   - Trigger immediately when event occurs
   - No filters needed for now
5. Click **Done**

#### 1.5 Create Welcome Email

1. Click the **+** button below your trigger
2. Select **Email**
3. Click **Create Email**
4. **Email Settings:**
   - **Name:** "Welcome to New Earth Collective"
   - **Subject:** "Welcome to the Movement, {{ person.first_name }}!"
   - **Preview Text:** "Thank you for joining the New Earth Collective"
5. Design your email using Klaviyo's drag-and-drop builder

**Available Variables:**

```django
{{ person.first_name }}           # Their first name
{{ person.last_name }}            # Their last name
{{ person.email }}                # Their email
{{ person.phone_number }}         # Their phone (if provided)
{{ event.source }}                # Where they signed up from
{{ event.message }}               # Their message (if provided)
{{ event.willingToFillQuestionnaire }}  # true/false
```

**Example Email Content:**

```
Hi {{ person.first_name }},

Welcome to the New Earth Collective!

Thank you for joining our waitlist. We're building something special, and you're now part of the movement.

{% if event.willingToFillQuestionnaire %}
We noticed you're willing to fill out our community questionnaire. We'll send you a link to that soon!
{% endif %}

Stay tuned for updates.

With gratitude,
The New Earth Collective Team
```

6. **Email Timing:**
   - Set to send **Immediately** (or add a delay if you want)
7. **Save** the email

#### 1.6 Activate the Flow

1. Click **Review and Turn On** (top right)
2. Review settings
3. Click **Turn On Flow**

---

### **STEP 2: Test the Integration**

#### 2.1 Test with Script

Run the test script to verify Klaviyo receives events:

```bash
npx tsx scripts/test-klaviyo.ts
```

This will:

- Send a test event to Klaviyo
- Verify the API connection works
- Show you where to check in Klaviyo

#### 2.2 Verify in Klaviyo

1. Go to **Analytics > Metrics** in Klaviyo
2. Search for **"GLOBAL_LANDING_SUBMITTED"**
3. Click on it to see all events
4. Verify your test event appears

#### 2.3 Check Email Sent

1. Go to **Flows > Global Landing Waitlist Flow**
2. Click on the email step
3. Check **Analytics** tab
4. Verify the email was sent to test@example.com

#### 2.4 Test with Real Form

1. Go to https://launch.joinnewearthcollective.com/global
2. Fill out the waitlist form with a real email address you control
3. Submit the form
4. Check your email inbox
5. You should receive the welcome email!

---

### **STEP 3: Monitor and Optimize**

#### Check Flow Analytics

- **Flows > Global Landing Waitlist Flow > Analytics**
- Monitor:
  - Flow entries (how many people entered)
  - Email open rates
  - Click rates
  - Any errors

#### Check Event Data

- **Analytics > Metrics > GLOBAL_LANDING_SUBMITTED**
- See all events triggered
- View profile details
- Check custom properties

---

## Future Expansion

### Adding Questionnaire Conditional Branch

When you're ready to add the questionnaire logic:

1. **Create a new event** in your code (e.g., `QUESTIONNAIRE_COMPLETED`)
2. **Add a conditional split** in the flow:
   - Path A: If `willingToFillQuestionnaire = true`
   - Path B: If `willingToFillQuestionnaire = false`
3. **Send questionnaire link** to Path A users
4. **Add trigger** for `QUESTIONNAIRE_COMPLETED` event
5. **Continue flow** based on completion

### Adding More Flows

For each new form/flow:

1. **Define a unique event name** (e.g., `BOULDER_EVENT_SIGNUP`)
2. **Send that event** from your API route
3. **Create a new flow** in Klaviyo with that event as trigger
4. **Design emails** specific to that flow

---

## Troubleshooting

### Event Not Showing in Klaviyo

- ✅ Check API key is correct in `.env`
- ✅ Verify event name matches exactly (case-sensitive)
- ✅ Check Klaviyo API status
- ✅ Look at server logs for errors

### Email Not Sending

- ✅ Verify flow is **turned on** (not draft)
- ✅ Check email is **active** (not paused)
- ✅ Verify trigger conditions are met
- ✅ Check spam folder
- ✅ Verify email address is valid

### Profile Not Created

- ✅ Check email format is valid
- ✅ Verify API key has write permissions
- ✅ Check for duplicate profiles

---

## Next Steps

After the welcome email is working:

1. ✅ Test thoroughly with real submissions
2. ✅ Monitor analytics for a few days
3. ✅ Optimize email content based on open/click rates
4. ✅ Plan questionnaire conditional branching
5. ✅ Implement unsubscribe logic
6. ✅ Add SMS flow (if needed)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. User fills form on /global
   ↓
2. Form submits to /api/waitlist
   ↓
3. API Route:
   - Saves to Supabase (contacts table)
   - Tracks consent
   - Generates unsubscribe token
   - Logs activity
   ↓
4. Triggers Klaviyo Event: "GLOBAL_LANDING_SUBMITTED"
   ↓
5. Klaviyo Flow Triggered
   ↓
6. Welcome Email Sent

Future:
7. User clicks questionnaire link
   ↓
8. Completes questionnaire
   ↓
9. Triggers "QUESTIONNAIRE_COMPLETED" event
   ↓
10. Flow continues with conditional path
```

---

## Support

- **Klaviyo Docs:** https://developers.klaviyo.com
- **Support:** https://help.klaviyo.com
- **API Reference:** https://developers.klaviyo.com/en/reference/api-overview
