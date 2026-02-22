# TODO

## Critical (blocks production)

- [ ] **Referral tracking**: QR referrals store display name only — need `referred_by` FK on contacts, encode referrer email in QR URL, resolve to contact ID on submit. Currently no way to link referrer to referred in CRM.

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Unstaged Prettier formatting changes across ~100 files (from quality-check run)
- [ ] 227 emergence photos in public/ — consider Supabase Storage migration to reduce repo size
- [ ] 3 lint warnings: unused imports in ecosystem, team, login pages
- [ ] `drizzle-kit push` crashes on Node v24 (checkValue.replace bug) — use raw SQL for migrations

## Admin Hub Refactor (multi-session)

### Session 1: Foundation (DONE)

- [x] Install shadcn/ui: sheet, tooltip, collapsible, breadcrumb, skeleton
- [x] Create admin shell: sidebar, header, breadcrumbs, dashboard layout
- [x] Create admin layout.tsx wrapping all /admin/\* pages
- [x] Update existing pages to remove DomainLayout/BackButton
- [x] Build overview page with KPI cards, section summaries, quick links

### Session 2: Overview + Analytics (SCAFFOLDED)

- [x] Analytics page placeholder at /admin/analytics
- [ ] Build out analytics UI (KPI row, submission sources, trends)
- [ ] tRPC overviewStats procedure with real data

### Session 3: CRM Refactor (DONE)

- [x] CRM dashboard with pipeline stats, source breakdown, contact growth
- [x] All Contacts page (/admin/crm/contacts) with filters, search, pagination
- [x] Leads page (/admin/crm/leads) with filtered view
- [x] Create/Edit/Delete contact modals
- [x] tRPC CRM router updates (getPipelineStats, paginated getContacts)
- [x] Team tracking (addedBy field, filter by team member)
- [x] Bulk import (Contact Picker API + CSV fallback)
- [x] Voice notes (record, upload, playback with progress)
- [x] Mobile responsive (tables → cards, stacked filters)

### Session 4: Team + Finance (SCAFFOLDED)

- [x] Finance placeholder pages scaffolded (overview, revenue, expenses, yearly, tax)
- [x] Team tRPC router created (src/server/api/routers/team.ts)
- [ ] Team page (/admin/team) with member CRUD — build out UI
- [ ] teamMembers DB schema
- [ ] Finance pages — build out with Mercury connection
- [ ] Mercury API client (src/lib/mercury.ts)

### Session 5: CMS + Assets + Ecosystem + Tooling (SCAFFOLDED)

- [x] CMS Gallery page scaffolded (/admin/cms/gallery) — 126 lines
- [x] Tooling inventory scaffolded (/admin/tooling) — 341 lines
- [x] Database health scaffolded (/admin/tooling/database)
- [x] Auth router added (src/server/api/routers/auth.ts)
- [ ] CMS Email Testing page (/admin/cms/email-testing)
- [ ] Ecosystem map (/admin/ecosystem) — build out route inventory
- [ ] Build out CMS Gallery with real data
- [ ] Build out Tooling pages with real data
- [ ] Remove TestHomePage component

## Enhancements (nice to have)

### Questionnaire

- [ ] Conditional branching in Klaviyo based on questionnaire completion
- [ ] Questionnaire progress saving (draft mode)

### Public Site

- [ ] Add contact submission form to /stewardship page
- [ ] Scroll-triggered entrance animations for below-fold sections

### CRM System

- [ ] Bulk import/export contacts
- [ ] Advanced contact segmentation
- [ ] Contact scoring system
- [ ] Merge duplicate contacts feature
- [ ] Automated status progression

### Email & Notifications

- [ ] Email open/click tracking integration with CRM
- [ ] Admin notifications for new signups
- [ ] SMS flow integration with Klaviyo

### Tracking & Analytics

- [ ] Cross-device user recognition
- [ ] Attribution reports dashboard
- [ ] Funnel analysis visualization
- [ ] Cookie consent banner (GDPR)
- [ ] Auto-delete old sessions (90 days)
