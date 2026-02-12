# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-02-12

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Admin routing | Working | /admin/* path-based auth, test subdomain redirects to /admin |
| CRM system | Working | Master contacts, activities, multi-source tracking |
| Waitlist intake | Working | Form submission with CRM integration |
| Questionnaire | Working | Full alignment survey with 7 sections |
| Event waivers | Working | Digital signature capture for liability |
| User auth | Working | Supabase Auth with approval workflow |
| Admin dashboard | Working | User management at /admin/users |
| Impact Missions | Working | /impact index + /impact/joyskitchen landing page |
| Tracking/analytics | Working | Full middleware, client-side hook, conversion tracking |
| Klaviyo integration | Working | Event-based email flows |
| Photo galleries | Working | tRPC router with Supabase Storage |
| GLSL shaders | Working | Sacred geometry backgrounds (Flower of Life, etc.) |
| Email link tracking | Working | Link generation service, click tracking, conversion marking |
| Consent management | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens |

## Known Limitations

- Main domain (joinnewearthcollective.com) is placeholder - design in progress
- CRM dashboard is basic (contacts list + activity feed), needs advanced features
- Admin notifications for new signups not automated

## Recent Changes

| Date | Description |
|------|-------------|
| 2026-02-12 | Recovered crashed session: committed tRPC migration, tracking, docs archive, tech debt |
| 2026-02-12 | Migrated 4 REST API routes to tRPC routers, CRM dashboard uses tRPC hooks |
| 2026-02-12 | Added client-side tracking (sendBeacon hook, /api/track), email click conversions |
| 2026-02-12 | Cleared all tech debt: contactSources constraint, removed `any` from db proxy |
| 2026-02-12 | Fixed all 80 ESLint warnings, archived 11 stale docs, configured GitHub push |

See `git log --oneline` for full history.
