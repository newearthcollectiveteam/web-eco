# TODO

## Critical (blocks production)

_None_

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Unstaged Prettier formatting changes across ~100 files (from quality-check run)
- [ ] 227 emergence photos in public/ — consider Supabase Storage migration to reduce repo size
- [ ] `drizzle-kit push` crashes on Node v24 (checkValue.replace bug) — use raw SQL for migrations
- [ ] Remove `@libsql/client` from package.json (dead dependency, SQLite path removed)
- [ ] Move `@types/pg`, `@types/react-datepicker`, `@types/react-signature-canvas` to devDependencies
- [ ] Phone import modal needs ARIA treatment (dialog role, focus trap, label associations)
- [ ] Login page password toggle needs `aria-label`

## CRM Enhancements

- [ ] Intelligent community detection improvements (fuzzy matching, abbreviations, common misspellings)

## Admin Hub (remaining work)

- [ ] Finance pages — build out with Mercury connection
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

- [ ] Google Calendar integration — sync tasks with due dates to a shared Google Calendar that team members can subscribe to

### Email & Notifications

- [ ] Email open/click tracking integration with CRM
- [ ] Admin notifications for new signups
- [ ] SMS flow integration with Klaviyo

### Mobile App (Capacitor)

- [ ] Capacitor project setup in `mobile/` directory — see `docs/CAPACITOR_MOBILE_PLAN.md`
- [ ] Web app mods: native detection, safe areas, splash screen, offline banner
- [ ] Push notifications: FCM setup, device token schema, tRPC router
- [ ] Deep links: `.well-known` files, Vercel rewrites
- [ ] App store assets: icon, splash, Apple Developer enrollment
