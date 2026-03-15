# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-03-15

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
| Admin routing         | Working | /admin/* path-based auth, test subdomain redirects to /admin  |
| CRM system            | Working | Contacts, leads, community tags, voice notes, bulk import, associations, vCard import, mobile responsive |
| CRM community tags    | **New** | Hierarchical community/location taxonomy, contact tagging, independent filtering |
| Waitlist intake       | Working | Form submission with CRM integration                          |
| Questionnaire         | Working | Full alignment survey, multi-select intention, referral QR, abandon reminders |
| Event waivers         | Working | Digital signature capture for liability                       |
| User auth             | Working | Supabase Auth with approval workflow                          |
| Impact Missions       | Working | /impact index + /impact/joyskitchen                          |
| Tracking/analytics    | Working | Full middleware, client-side hook, conversion tracking        |
| Klaviyo integration   | Working | Event-based email flows                                       |
| Photo galleries       | Working | 2 galleries (community: 59 imgs, emergence: 227 imgs)        |
| GLSL shaders          | Working | Sacred geometry backgrounds (7 shaders), DPR capped for perf  |
| Email system          | Working | Polished HTML templates, confirmation + abandon reminder emails |
| Email link tracking   | Working | Link generation service, click tracking                       |
| Consent management    | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens               |

## Known Limitations

- Admin hub pages scaffolded as placeholders — analytics, finance, tooling need real data/UI
- DB connection uses Supabase pooler (direct host no longer resolves)
- Referral tracking stores referrer as display name text, not a contact FK — needs proper linking
- Communities page (/admin/crm/communities) not yet built — nav link added, page needed

## Recent Changes

| Date       | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| 2026-03-15 | CRM community tags: schema, migration, seed 15 communities/locations, tag 92 Emergence + 19 Envision contacts |
| 2026-03-15 | CRM leads: unified list with independent source/community filters, sorting, pagination, contact links |
| 2026-03-15 | CRM contacts: community tag badges, independent community filter, removed inline editing (use contact page) |
| 2026-03-15 | Data cleanup: merged Lydia duplicate, phone_import→manual source, removed waitlist source |
| 2026-03-15 | CRM router: 9 new community tag procedures, social media from questionnaire, sorting support |

See `git log --oneline` for full history.
