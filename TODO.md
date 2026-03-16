# TODO

## Critical (blocks production)

_None_

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Unstaged Prettier formatting changes across ~100 files (from quality-check run)
- [ ] 227 emergence photos in public/ — consider Supabase Storage migration to reduce repo size
- [ ] 3 lint warnings: unused imports in ecosystem, team, login pages
- [ ] `drizzle-kit push` crashes on Node v24 (checkValue.replace bug) — use raw SQL for migrations

## CRM Enhancements

- [ ] Intelligent community detection improvements (fuzzy matching, abbreviations, common misspellings)

## Admin Hub Refactor (multi-session)

### Session 1: Foundation (DONE)
### Session 3: CRM Refactor (DONE)
### Session 3b: CRM Community Overhaul (DONE)
### Session 4: Team + Finance (SCAFFOLDED)
- [ ] Finance pages — build out with Mercury connection

### Session 5: CMS + Assets + Ecosystem + Tooling (SCAFFOLDED)
- [ ] CMS Email Testing page
- [ ] Build out CMS Gallery with real data
- [ ] Build out Tooling pages with real data

## Enhancements (nice to have)

### Questionnaire
- [ ] Voice memo as questionnaire response — allow audio answers in addition to text
- [ ] Conditional branching in Klaviyo based on questionnaire completion
- [ ] Questionnaire progress saving (draft mode)

### Public Site
- [ ] Add contact submission form to /stewardship page
- [ ] Scroll-triggered entrance animations for below-fold sections

### CRM System
- [ ] Social media tagging on contacts — link/display social profiles directly on contact records
- [ ] Contact syncing when someone joins the ecosystem — mutual contacts / shared connections feature
- [ ] Bulk import/export contacts
- [ ] Advanced contact segmentation
- [ ] Contact scoring system
- [ ] Merge duplicate contacts feature
- [ ] Automated status progression

### Task Management
- [ ] Kanban board view — drag-and-drop columns (To Do, In Progress, Done) for visual task management
- [ ] Google Calendar integration — sync tasks with due dates to a shared Google Calendar that team members can subscribe to

### Email & Notifications
- [ ] Email open/click tracking integration with CRM
- [ ] Admin notifications for new signups
- [ ] SMS flow integration with Klaviyo
