# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-03-17
**Last Updated By:** @matthew

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
| CRM communities       | Working | Hierarchical community/location taxonomy, tree view CRUD, contact tagging, auto-tagging from questionnaire |
| Waitlist intake       | Working | Form submission with CRM integration                          |
| Questionnaire         | Working | Full alignment survey, multi-select intention, referral QR, abandon reminders, community auto-tagging |
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
| Task Management       | Working | Kanban board with drag-and-drop, custom status categories, tab persistence |
| Ideas Board           | Working | Collaborative idea board with rich text, categories, edit history tracking |
| Dev Pipeline          | Working | GitHub Actions CI, branch protection (main/dev), PR templates, CODEOWNERS |
| Framework Distribution| Working | claude-framework/ + setup script for developer onboarding |

## Known Limitations

- Admin hub pages scaffolded as placeholders — analytics, finance, tooling need real data/UI
- DB connection uses Supabase pooler (direct host no longer resolves)
- Community auto-tagging uses exact name matching — fuzzy matching not yet implemented

## Recent Changes

| Date       | Description                                                                            | Author |
| ---------- | -------------------------------------------------------------------------------------- | ------ |
| 2026-03-17 | Dev pipeline: CI, branch protection, PR templates, framework distribution, onboarding docs | @matthew |
| 2026-03-17 | 6 new collaboration skills + multi-dev updates to handoff/resume (framework v1.20.0) | @matthew |
| 2026-03-17 | Ideas board: collaborative idea board with rich text, categories, edit history | @matthew |
| 2026-03-17 | Team nav consolidation: Team/Tasks merged into expandable Team section | @matthew |
| 2026-03-16 | Quality sweep: SQL injection fix, a11y, dead code removal | @matthew |

See `git log --oneline` for full history.
