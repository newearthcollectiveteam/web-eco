# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-02-22

## Feature Status

| Feature               | Status  | Notes                                                         |
| --------------------- | ------- | ------------------------------------------------------------- |
| Public homepage       | Working | Hero w/ animations, Vision, Envision, Who We Serve, Testimonials, FAQ, CTA |
| Site nav & footer     | Working | 5-link nav + CTA, 3-column footer (CTA/logo/links)           |
| Pathway page          | Working | Interactive timeline (4 phases), scroll animations, gallery strips |
| About page            | Working | Blog-style story, CI philosophy, direct reader address        |
| Values page           | Working | 8 core values, alternating layout, no blockquotes             |
| Stewardship page      | Working | Partner cards, categories, CTA                                |
| Privacy & Terms       | Working | Full legal pages at /privacy and /terms                       |
| Admin dashboard shell | Working | Sidebar nav, breadcrumbs, collapsible, mobile sheet           |
| Admin overview        | Working | KPI cards, section summaries, recent activity, quick links    |
| Admin routing         | Working | /admin/\* path-based auth, test subdomain redirects to /admin |
| CRM system            | Working | Contacts, leads, voice notes, bulk import, team tracking, mobile responsive |
| Waitlist intake       | Working | Form submission with CRM integration                          |
| Questionnaire         | Working | Full alignment survey with 7 sections                         |
| Event waivers         | Working | Digital signature capture for liability                       |
| User auth             | Working | Supabase Auth with approval workflow                          |
| Impact Missions       | Working | /impact index + /impact/joyskitchen                          |
| Tracking/analytics    | Working | Full middleware, client-side hook, conversion tracking        |
| Klaviyo integration   | Working | Event-based email flows                                       |
| Photo galleries       | Working | 2 galleries (community: 59 imgs, emergence: 227 imgs)        |
| GLSL shaders          | Working | Sacred geometry backgrounds (7 shaders), DPR capped for perf  |
| Email link tracking   | Working | Link generation service, click tracking                       |
| Consent management    | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens               |

## Known Limitations

- Admin hub pages scaffolded as placeholders — analytics, finance, tooling need real data/UI
- DB connection uses Supabase pooler (direct host no longer resolves)

## Recent Changes

| Date       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-02-22 | Auth consolidation: merged signup/forgot-password into single /login page               |
| 2026-02-22 | Admin scaffolding: analytics, CMS gallery, finance (5 pages), tooling (2 pages)         |
| 2026-02-22 | tRPC: added auth + team routers, hardened admin/analytics procedures                    |
| 2026-02-22 | Middleware: updated Supabase auth, simplified route protection                          |
| 2026-02-22 | CRM enhancements: team tracking, bulk import, voice notes, mobile responsive            |
| 2026-02-21 | Pathway page: interactive timeline, 4 phases, gallery strips, scroll animations        |
| 2026-02-21 | About page rewrite: cohesive blog-style story with CI philosophy                       |

See `git log --oneline` for full history.
