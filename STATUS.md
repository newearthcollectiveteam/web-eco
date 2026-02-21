# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-02-21

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
| CRM system            | Working | Master contacts, activities, multi-source tracking            |
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

- Admin hub refactor in progress — Sessions 2-5 pending (Analytics, CRM refactor, Team+Finance, CMS+Ecosystem+Tooling)
- DB connection uses Supabase pooler (direct host no longer resolves)

## Recent Changes

| Date       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-02-21 | Pathway page: interactive timeline, 4 phases, gallery strips, scroll animations        |
| 2026-02-21 | About page rewrite: cohesive blog-style story with CI philosophy                       |
| 2026-02-21 | Emergence gallery: 227 JPGs → WebP, DB records, GalleryStrip component                |
| 2026-02-21 | DB connection fix: migrated to Supabase pooler (direct host DNS failure)               |
| 2026-02-21 | Values page: removed blockquotes; Homepage: removed "100+ creators" line               |

See `git log --oneline` for full history.
