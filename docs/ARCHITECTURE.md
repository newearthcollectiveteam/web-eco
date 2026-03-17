# Architecture Overview

**Last Updated:** 2026-03-17

## System Overview

Multi-domain Next.js 15 application serving the New Earth Collective community platform. Single codebase powers public-facing pages, admin dashboard, CRM, event management, and internal tools.

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 15, React 19, TypeScript (strict) |
| Database       | Supabase PostgreSQL via Drizzle ORM       |
| Auth           | Supabase Auth with approval workflow      |
| API            | tRPC + TanStack Query                     |
| Email          | Mailjet + Klaviyo for marketing flows     |
| Styling        | Tailwind CSS v4, shadcn/ui components     |
| Visual Effects | GLSL shaders (sacred geometry)            |
| CI/CD          | GitHub Actions → Vercel (auto-deploy)     |

## Branching & Deployment

```
main (production) ← Vercel auto-deploys to live domain
 └── dev (integration) ← Vercel preview deployment
      └── feature/* (developer branches) ← Vercel PR previews
```

Branch protection: `main` requires PR + approval + CI. `dev` requires CI.

## Application Structure

### Routes (106 pages)

**Public Site** — Marketing and community pages

- Homepage, About, Pathway, Values, Stewardship, Impact
- Questionnaire with abandon reminders and community auto-tagging
- Privacy, Terms, Unsubscribe
- Landing page experiments (3 series x 8 color variants each)

**Admin Dashboard** (`/admin/*`) — Protected, requires auth + approval

- Overview with KPIs and recent activity
- CRM: contacts, leads, communities (hierarchical taxonomy)
- Team: roles, tasks (kanban), ideas board
- Finance: revenue, expenses, tax, yearly (scaffolded)
- CMS: gallery, email testing (scaffolded)
- Ecosystem map, form builder, tooling/database
- Brand assets, shader gallery, playground demos, templates

**API Routes** (10 endpoints)

- `/api/trpc/[trpc]` — tRPC handler
- `/api/waitlist`, `/api/questionnaire`, `/api/waiver` — Form submissions
- `/api/track` — Analytics event tracking
- `/api/unsubscribe` — Email unsubscribe
- `/api/chat/el-nido` — AI chat experiment
- `/api/email-preview`, `/api/location-search` — Utilities

### tRPC Routers (10)

| Router          | Purpose                                    |
| --------------- | ------------------------------------------ |
| `admin`         | Admin dashboard data, KPIs                 |
| `analytics`     | Tracking and metrics                       |
| `auth`          | User management, approval workflow         |
| `crm`           | Contacts, leads, activities, communities   |
| `ecosystem`     | Ecosystem map data                         |
| `gallery`       | Photo galleries                            |
| `ideas`         | Ideas board CRUD with edit history         |
| `questionnaire` | Survey responses, community detection      |
| `tasks`         | Kanban tasks with custom status categories |
| `team`          | Team roles and members                     |

### Database (13 tables via Drizzle ORM)

**CRM & Contacts:** `user_profile`, `waitlist_intake`, `questionnaire_response`, `community_tag`
**Content:** `gallery`, `gallery_image`, `voice_note`
**Tracking:** `session`, `event`, `email_link`, `email_link_click`, `user_identity_map`
**Task Management:** `task_status`

Schema: `src/server/db/schema.ts`

## Key Architectural Patterns

### CRM Data Flow

```
Form submission → API route → Upsert contact → Create intake record → Log activity → Trigger Klaviyo
```

- Email-based deduplication across all forms
- Multi-source tracking (which forms a contact submitted)
- GDPR-compliant consent tracking with unsubscribe tokens

### Multi-Domain Routing

- Configured in `src/lib/domains.ts`
- Middleware handles domain detection, auth, and redirects
- `test.joinnewearthcollective.com` → 301 to `/admin`
- `launch.joinnewearthcollective.com` → 301 to main domain

### User Tracking

- Anonymous visitor tracking with session IDs
- Identity resolution (anonymous → known user)
- Email link click tracking with unique tokens
- UTM parameter capture for attribution

### Admin Dashboard Shell

- Layout at `src/app/admin/layout.tsx`
- Collapsible sidebar with mobile sheet
- Standalone pages (shader viewers, playground demos) bypass shell
- Gallery listing pages get the shell

## Directory Map

```
src/
├── app/                    # Next.js App Router
│   ├── (site)/             # Public pages (grouped route)
│   ├── admin/              # Protected admin area
│   ├── api/                # API routes
│   └── auth/               # Auth callback routes
├── components/
│   ├── admin/              # Dashboard shell, sidebar, nav
│   ├── pages/              # Page-specific components
│   ├── questionnaire/      # Survey form components
│   ├── shaders/            # GLSL shader renderers
│   ├── playground/         # Visual effect demos
│   └── ui/                 # shadcn/ui + custom components
├── lib/
│   ├── auth/               # Supabase auth utilities
│   ├── consent/            # GDPR consent tracking
│   ├── crm/                # CRM service layer
│   ├── email/              # Email sending utilities
│   ├── klaviyo/            # Marketing email integration
│   ├── tracking/           # Analytics utilities
│   └── domains.ts          # Multi-domain configuration
├── server/
│   ├── api/routers/        # tRPC routers (10)
│   └── db/schema.ts        # Database schema (13 tables)
└── middleware.ts            # Auth & routing middleware

claude-framework/           # Dev framework distribution (33 skills, 18 patterns)
scripts/                    # Dev scripts, migrations, setup
shaders/                    # GLSL shader source files
supabase-scripts/           # Database setup SQL (11 scripts)
docs/                       # Feature documentation
```

## Developer Workflow

See `CONTRIBUTING.md` for full setup. See `docs/GIT_WORKFLOW_GUIDE.md` for branching/PR guide.

```
/checkout feature/thing  → Create branch from dev
... work ...
/handoff                 → Save session state
/pr                      → Open pull request
/review 42               → Review someone's PR
/release                 → Ship dev → main
```
