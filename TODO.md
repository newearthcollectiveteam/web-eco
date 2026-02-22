# TODO

## Critical (blocks production)

_None currently_

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Unstaged Prettier formatting changes across ~100 files (from quality-check run)
- [ ] 227 emergence photos in public/ — consider Supabase Storage migration to reduce repo size

## Admin Hub Refactor (multi-session)

### Session 1: Foundation (DONE)

- [x] Install shadcn/ui: sheet, tooltip, collapsible, breadcrumb, skeleton
- [x] Create admin shell: sidebar, header, breadcrumbs, dashboard layout
- [x] Create admin layout.tsx wrapping all /admin/\* pages
- [x] Update existing pages to remove DomainLayout/BackButton
- [x] Build overview page with KPI cards, section summaries, quick links

### Session 2: Overview + Analytics

- [ ] Analytics page at /admin/analytics (KPI row, submission sources, trends)
- [ ] tRPC overviewStats procedure if needed

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

### Session 4: Team + Finance

- [ ] Team page (/admin/team) with member CRUD
- [ ] teamMembers DB schema
- [ ] Finance overview (/admin/finance) with Mercury connection
- [ ] Finance sub-pages (revenue, expenses, yearly, tax) as boilerplate
- [ ] Mercury API client (src/lib/mercury.ts)

### Session 5: CMS + Assets + Ecosystem + Tooling

- [ ] CMS Gallery page (/admin/cms/gallery)
- [ ] CMS Email Testing page (/admin/cms/email-testing)
- [ ] Ecosystem map (/admin/ecosystem) with route inventory
- [ ] Tooling inventory (/admin/tooling)
- [ ] Database health (/admin/tooling/database)
- [ ] Remove TestHomePage component

## Enhancements (nice to have)

### Public Site

- [x] Flesh out /about page with real content
- [x] Flesh out /pathway page with journey/funnel content
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

### Questionnaire

- [ ] Conditional branching in Klaviyo based on questionnaire completion
- [ ] Questionnaire progress saving (draft mode)
