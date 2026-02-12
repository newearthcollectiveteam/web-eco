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
| Tracking/analytics | Partial | Schema complete, middleware needs full implementation |
| Klaviyo integration | Working | Event-based email flows |
| Photo galleries | Working | tRPC router with Supabase Storage |
| GLSL shaders | Working | Sacred geometry backgrounds (Flower of Life, etc.) |
| Email link tracking | Partial | Schema complete, link generation service needed |
| Consent management | Working | GDPR/CAN-SPAM compliant with unsubscribe tokens |

## Known Limitations

- Tracking middleware not fully implemented for all event types
- Email link click tracking needs link generation service
- Main domain (joinnewearthcollective.com) is placeholder - design in progress
- CRM dashboard is basic (contacts list + activity feed), needs advanced features
- Admin notifications for new signups not automated

## Recent Changes

| Date | Description |
|------|-------------|
| 2026-02-12 | Added Drizzle relations, CRM dashboard, a11y improvements, type safety fixes |
| 2026-02-12 | Committed and pushed all uncommitted work (9 commits, 118 files) |
| 2026-02-12 | Configured GitHub push flow (newearthcollectiveteam account, HTTPS) |
| 2026-02-11 | Moved admin tools from test subdomain to /admin path-based routing |
| 2026-02-01 | Added Impact Missions feature with Joy's Kitchen volunteer opportunity |

See `git log --oneline` for full history.
