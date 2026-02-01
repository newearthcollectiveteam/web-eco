# Project Status

**Version:** 0.1.0
**Last Updated:** 2026-01-27

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-domain routing | Working | joinnewearthcollective.com, launch., test. subdomains |
| CRM system | Working | Master contacts, activities, multi-source tracking |
| Waitlist intake | Working | Form submission with CRM integration |
| Questionnaire | Working | Full alignment survey with 7 sections |
| Event waivers | Working | Digital signature capture for liability |
| User auth | Working | Supabase Auth with approval workflow |
| Admin dashboard | Working | User management at /admin/users |
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
- No CRM dashboard UI yet (API only)
- Admin notifications for new signups not automated

## Recent Changes

| Date | Description |
|------|-------------|
| 2026-01-27 | Initialized project standards (CLAUDE.md, STATUS.md, TODO.md) |
| 2026-01-20 | Questionnaire form updates |
| 2026-01-17 | Waiver system and QR code generation |
| 2026-01-15 | Website design overhaul planning (DesignInput.md) |

See `git log --oneline` for full history.
