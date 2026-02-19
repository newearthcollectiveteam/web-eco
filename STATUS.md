# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-02-13

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Admin dashboard shell | Working | Sidebar nav, breadcrumbs, collapsible, mobile sheet |
| Admin overview | Working | KPI cards, section summaries, recent activity, quick links |
| Admin routing | Working | /admin/* path-based auth, test subdomain redirects to /admin |
| CRM system | Working | Master contacts, activities, multi-source tracking |
| Waitlist intake | Working | Form submission with CRM integration |
| Questionnaire | Working | Full alignment survey with 7 sections |
| Event waivers | Working | Digital signature capture for liability |
| User auth | Working | Supabase Auth with approval workflow |
| Impact Missions | Working | /impact index + /impact/joyskitchen landing page |
| Tracking/analytics | Working | Full middleware, client-side hook, conversion tracking |
| Klaviyo integration | Working | Event-based email flows |
| Photo galleries | Working | tRPC router with Supabase Storage |
| GLSL shaders | Working | Sacred geometry backgrounds (7 shaders) |
| Email link tracking | Working | Link generation service, click tracking |
| Consent management | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens |

## Known Limitations

- Main domain (joinnewearthcollective.com) is placeholder - design in progress
- Admin hub refactor in progress — Sessions 2-5 pending (Analytics, CRM refactor, Team+Finance, CMS+Ecosystem+Tooling)

## Recent Changes

| Date | Description |
|------|-------------|
| 2026-02-13 | Session 1: Admin dashboard shell — sidebar, header, breadcrumbs, layout, overview page |
| 2026-02-13 | Installed shadcn/ui: sheet, tooltip, collapsible, breadcrumb, skeleton |
| 2026-02-13 | Removed DomainLayout/BackButton from admin pages (shell provides navigation) |
| 2026-02-12 | Locked down git push auth, recovered crashed session, migrated routes to tRPC |
| 2026-02-12 | Cleared tech debt: contactSources constraint, removed `any` from db proxy |

See `git log --oneline` for full history.
