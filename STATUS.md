# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-02-21

## Feature Status

| Feature               | Status  | Notes                                                         |
| --------------------- | ------- | ------------------------------------------------------------- |
| Public homepage       | Working | Hero w/ animations, Vision, Envision, Who We Serve, Testimonials, FAQ, CTA |
| Site nav & footer     | Working | 5-link nav + CTA, 3-column footer (CTA/logo/links)           |
| Privacy & Terms       | Working | Full legal pages at /privacy and /terms                       |
| Stub pages            | Working | /about, /pathway, /partnerships (Coming Soon placeholders)    |
| Admin dashboard shell | Working | Sidebar nav, breadcrumbs, collapsible, mobile sheet           |
| Admin overview        | Working | KPI cards, section summaries, recent activity, quick links    |
| Admin routing         | Working | /admin/\* path-based auth, test subdomain redirects to /admin |
| CRM system            | Working | Master contacts, activities, multi-source tracking            |
| Waitlist intake       | Working | Form submission with CRM integration                          |
| Questionnaire         | Working | Full alignment survey with 7 sections                         |
| Event waivers         | Working | Digital signature capture for liability                       |
| User auth             | Working | Supabase Auth with approval workflow                          |
| Impact Missions       | Working | /impact index + /impact/joyskitchen (now in (site) route group) |
| Tracking/analytics    | Working | Full middleware, client-side hook, conversion tracking        |
| Klaviyo integration   | Working | Event-based email flows                                       |
| Photo galleries       | Working | tRPC router with Supabase Storage                             |
| GLSL shaders          | Working | Sacred geometry backgrounds (7 shaders), DPR capped for perf  |
| Email link tracking   | Working | Link generation service, click tracking                       |
| Consent management    | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens               |

## Known Limitations

- Admin hub refactor in progress — Sessions 2-5 pending (Analytics, CRM refactor, Team+Finance, CMS+Ecosystem+Tooling)
- /about, /pathway, /partnerships are Coming Soon stubs

## Recent Changes

| Date       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-02-21 | Homepage overhaul: expanded nav, 3-col footer, gradient dividers, FAQ, Envision section |
| 2026-02-21 | Created Privacy Policy and Terms of Service pages                                       |
| 2026-02-21 | Migrated /impact pages into (site) route group, created /about /pathway /partnerships stubs |
| 2026-02-21 | Shader perf fix (DPR cap), solid nav, green hero tint, footer alignment polish          |
| 2026-02-13 | Session 1: Admin dashboard shell — sidebar, header, breadcrumbs, layout, overview page  |

See `git log --oneline` for full history.
