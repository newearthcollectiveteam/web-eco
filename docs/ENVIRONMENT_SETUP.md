# Environment Setup

Step-by-step guide for setting up your local environment. Ask the project lead if you get stuck.

## Quick Start

```bash
cp .env.example .env
```

Then fill in the values below.

## Required Variables

### Supabase (Required)

These connect you to the shared database and auth system.

| Variable | Where to get it | Shared or personal? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Shared (same for everyone) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key | Shared (same for everyone) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key | Shared (same for everyone) |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string (Transaction mode) | Shared (same for everyone) |

**Getting access:**
1. Ask the project lead to invite you to the Supabase project
2. Go to [app.supabase.com](https://app.supabase.com)
3. Accept the invitation
4. Navigate to the project → Settings → API

**DATABASE_URL format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Important:** If the password contains special characters, URL-encode them:
- `!` → `%21`
- `*` → `%2A`
- `@` → `%40`

### Important: Shared Database

Everyone connects to the **same** Supabase project. This means:
- Your test data is visible to others
- Don't delete data you didn't create
- Coordinate before running schema migrations (`npm run db:push`)
- Use unique email addresses when testing forms (e.g., `yourname+test1@email.com`)

## Optional Variables

### Email (Mailjet)

For testing email features locally. Skip if you're not working on email.

| Variable | Where to get it | Shared or personal? |
|---|---|---|
| `MAILJET_API_KEY` | Ask project lead | Shared |
| `MAILJET_SECRET_KEY` | Ask project lead | Shared |
| `MAILJET_FROM_EMAIL` | Use default | Shared |
| `MAILJET_FROM_NAME` | Use default | Shared |

**Without email configured:** Form submissions will still work, but confirmation emails won't send. You'll see errors in the console — that's fine for most development.

### Klaviyo (Marketing)

For testing marketing email flows. Most developers can skip this.

| Variable | Where to get it | Shared or personal? |
|---|---|---|
| `KLAVIYO_API_KEY` | Ask project lead | Shared (has sending quota) |
| `KLAVIYO_PUBLIC_KEY` | Ask project lead | Shared |
| `KLAVIYO_METRIC_ID` | Ask project lead | Shared |

**Without Klaviyo:** Everything works except marketing automation triggers.

### Anthropic (AI Features)

| Variable | Where to get it | Shared or personal? |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | **Personal** (each dev uses their own) |

**Without Anthropic:** AI-powered features won't work, but the rest of the app is unaffected.

### Analytics & Tracking

| Variable | Purpose | Default |
|---|---|---|
| `IP_HASH_SALT` | Privacy-safe IP hashing | Generate any random string |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | Cross-subdomain tracking | Use `localhost` for local dev |
| `NEXT_PUBLIC_BASE_URL` | Email template links | `http://localhost:3000` |
| `NEXT_PUBLIC_EMAIL_ASSET_BASE_URL` | Email image URLs | `http://localhost:3000` |

## Verifying Your Setup

After filling in `.env`:

```bash
# 1. Check env vars are valid
npm run env:validate

# 2. Start the dev server
npm run dev

# 3. Visit these pages to verify:
#    http://localhost:3000          → Public homepage (should load)
#    http://localhost:3000/login    → Login page (should show form)
#    http://localhost:3000/admin    → Admin area (requires login + approval)
```

### If something's wrong

- **"Missing required env var"** → You missed a required variable. Check the error message for which one.
- **"Connection refused"** → DATABASE_URL is wrong. Double-check the connection string.
- **"Invalid API key"** → Copy-paste error. Re-copy the key from Supabase dashboard.
- See `docs/TROUBLESHOOTING.md` for more common issues.

## For the Project Lead

When onboarding a new developer:

1. Invite them to the Supabase project (Settings → Team)
2. Share the shared env values (Supabase URL, anon key, database URL, email keys)
3. Have them generate their own `IP_HASH_SALT` and `ANTHROPIC_API_KEY`
4. After they sign up at `/login`, approve their account via SQL:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = raw_app_meta_data || '{"approved": true, "role": "admin"}'
   WHERE email = 'their@email.com';
   ```
