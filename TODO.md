# TODO

## Critical (blocks production)

_None currently_

## Bugs (broken functionality)

_None documented_

## Tech Debt (code quality)

- [ ] Migrate data-query API routes to tRPC (`/api/crm/contacts`, `/api/questionnaire/check`, `/api/admin/database`)
- [ ] Implement full tracking middleware for all event types
- [ ] Add email link generation service for click tracking
- [ ] Add composite unique constraint (contactId, source) to contactSources table
- [ ] Migrate scheduled_emails table to include contactId linking
- [ ] Remove remaining `any` types in db/index.ts proxy (requires union type refactor)
- [ ] Fix pre-existing ESLint errors (floating promises, unsafe arguments) to enable ESLint during builds

## Enhancements (nice to have)

### CRM System
- [ ] Build CRM dashboard UI
- [ ] Bulk import/export contacts
- [ ] Advanced contact segmentation
- [ ] Contact scoring system
- [ ] Merge duplicate contacts feature
- [ ] Automated status progression

### Email & Notifications
- [ ] Email open/click tracking integration with CRM
- [ ] Admin notifications for new signups
- [ ] SMS flow integration with Klaviyo

### Tracking & Analytics
- [ ] Cross-device user recognition
- [ ] Attribution reports dashboard
- [ ] Funnel analysis visualization
- [ ] Cookie consent banner (GDPR)
- [ ] Auto-delete old sessions (90 days)

### Main Website
- [ ] Implement main domain homepage design (see DesignInput.md)
- [ ] About page
- [ ] Values page
- [ ] Resources page
- [ ] Contact page

### Questionnaire
- [ ] Conditional branching in Klaviyo based on questionnaire completion
- [ ] Questionnaire progress saving (draft mode)

## Documentation

See `docs/` folder for detailed guides:
- `ARCHITECTURE.md` - CRM and intake forms architecture
- `CRM_SYSTEM_GUIDE.md` - Master CRM documentation
- `TRACKING_ANALYTICS_DESIGN.md` - User tracking system design
- `KLAVIYO_SETUP_GUIDE.md` - Email integration setup
- `AUTH_SETUP.md` - Authentication configuration
- `QUICK_START.md` - Admin approval workflow setup
