# TODO

## Critical (blocks production)

- [ ] **Referral tracking**: QR referrals store display name only — need `referred_by` FK on contacts, encode referrer email in QR URL, resolve to contact ID on submit. Currently no way to link referrer to referred in CRM.

## CRM Community Overhaul (in progress)

### Completed
- [x] Community tags schema (community_tag + contact_community_tag tables)
- [x] Seed 10 communities + 5 locations with hierarchy
- [x] Tag existing contacts (92 Emergence, 19 Envision)
- [x] CRM router: getCommunityTags, getCommunityTagsFlat, create/update/delete, assign/remove/bulkAssign
- [x] Leads page: unified list, independent source + community filters, sorting, pagination, contact links
- [x] Contacts page: community tag badges, independent community filter, removed inline editing
- [x] Data migration: merge Lydia duplicate, phone_import→manual, remove waitlist source
- [x] Social media pulled from questionnaire in getContact response

### Remaining
- [ ] **Communities tab** (`/admin/crm/communities`): tree view with CRUD UI for managing community/location hierarchy (nav link added, page not built)
- [ ] **Questionnaire auto-tagging**: update questionnaire submit route to auto-tag community based on how_found_us_detail and other_communities fields
- [ ] **Contact detail page**: show community tags with add/remove UI, show social media links
- [ ] Intelligent community detection from questionnaire other_communities free text (e.g. "Bridge and Extreme" → auto-tag)

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Unstaged Prettier formatting changes across ~100 files (from quality-check run)
- [ ] 227 emergence photos in public/ — consider Supabase Storage migration to reduce repo size
- [ ] 3 lint warnings: unused imports in ecosystem, team, login pages
- [ ] `drizzle-kit push` crashes on Node v24 (checkValue.replace bug) — use raw SQL for migrations

## Admin Hub Refactor (multi-session)

### Session 1: Foundation (DONE)
### Session 3: CRM Refactor (DONE)
### Session 4: Team + Finance (SCAFFOLDED)
- [ ] Finance pages — build out with Mercury connection

### Session 5: CMS + Assets + Ecosystem + Tooling (SCAFFOLDED)
- [ ] CMS Email Testing page
- [ ] Build out CMS Gallery with real data
- [ ] Build out Tooling pages with real data

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
