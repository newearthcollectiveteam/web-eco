# New Earth Collective Web Ecosystem

## Overview
Multi-domain Next.js application for the New Earth Collective community platform. Features a CRM system, community questionnaires, event management with digital waivers, user tracking/analytics, and email integration via Klaviyo. Supports multiple domains serving different purposes from a single codebase.

## Quick Commands
```bash
npm run dev              # Start dev server (Turbo mode)
npm run build            # Build for production
npm run typecheck        # Type check
npm run lint:fix         # Auto-fix lint errors
npm run quality-check    # Full quality check (format, lint, typecheck, build)
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio (database GUI)
```

## Tech Stack
- **Framework**: Next.js 15, React 19, TypeScript
- **Database**: Supabase PostgreSQL via Drizzle ORM
- **Auth**: Supabase Auth with approval workflow
- **API**: tRPC with TanStack Query
- **Email**: Klaviyo integration for email sequences
- **Styling**: Tailwind CSS v4 with custom design system
- **Visual Effects**: GLSL shaders for sacred geometry backgrounds

## Key Paths
| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages |
| `src/app/admin/` | Protected admin routes (user management) |
| `src/app/api/` | API routes (waitlist, CRM, analytics, questionnaire) |
| `src/components/pages/` | Domain-specific homepage components |
| `src/server/api/routers/` | tRPC routers |
| `src/server/db/schema.ts` | Database schema (CRM, tracking, galleries) |
| `src/lib/domains.ts` | Multi-domain configuration |
| `src/lib/crm/` | CRM service layer |
| `src/middleware.ts` | Domain routing and tracking middleware |
| `shaders/` | GLSL shader files for visual effects |

## Domain Routing
Middleware detects hostname and serves appropriate content:
- `joinnewearthcollective.com` - Main collective site (placeholder)
- `launch.joinnewearthcollective.com` - Launch experience with questionnaire
- `test.joinnewearthcollective.com` - Development/testing environment

**Local development**: Use URL params to test domains:
- `http://localhost:3000` - Main site
- `http://localhost:3000?domain=test` - Test environment
- `http://localhost:3000?domain=launch` - Launch experience

## CRM System
Master CRM tracks all contacts from all forms with:
- Email-based deduplication
- Multi-source tracking (which forms a contact submitted)
- Activity timeline (complete interaction history)
- GDPR-compliant consent tracking
- Unsubscribe token management

Pattern: Each intake form (waitlist, questionnaire, event registration) has its own table linked to master contacts table via foreign key.

## Tracking & Analytics
Full-funnel user journey tracking:
- Anonymous visitor tracking with session IDs
- Identity resolution (anonymous to known user)
- Email link click tracking with unique tokens
- UTM parameter capture for attribution
- Event logging (page views, form submissions, etc.)

## Current Status
See `STATUS.md` for feature status and `TODO.md` for tracked work.
