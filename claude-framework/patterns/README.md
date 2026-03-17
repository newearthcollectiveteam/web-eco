# Patterns Library

Optional reference patterns extracted from production projects. Pull from these when relevant — they're starting points, not copy-paste.

## Organization

Patterns use category prefixes for organization:

| Prefix     | Category           | Examples                                             |
| ---------- | ------------------ | ---------------------------------------------------- |
| `ui-`      | UI components      | kanban-dnd, admin-dashboard-shell, inline-editable   |
| `state-`   | State management   | session-scoped, dynamic-enums                        |
| `api-`     | API/backend        | external-linking, bearer-token, smart-categorization |
| `auth-`    | Authentication     | role-hierarchy                                       |
| `crm-`     | CRM/contacts       | pipeline-management                                  |
| `routing-` | Navigation/routing | multi-domain                                         |
| `finance-` | Finance            | multi-source-aggregation                             |
| `sharing-` | Sharing/public     | public-token                                         |

## Available Patterns (17)

### UI Components

- **[ui-action-menu](./ui-action-menu.md)** — Declarative admin action menus with variant support
- **[ui-toast](./ui-toast.md)** — Sonner-based toast notifications for mutations
- **[ui-kanban-dnd](./ui-kanban-dnd.md)** — Drag-and-drop kanban board with @dnd-kit + optimistic updates
- **[ui-admin-dashboard-shell](./ui-admin-dashboard-shell.md)** — Admin layout with sidebar, header, standalone page detection
- **[ui-inline-editable](./ui-inline-editable.md)** — Click-to-edit fields for inline renaming
- **[ui-markdown-toolbar](./ui-markdown-toolbar.md)** — Markdown formatting toolbar for textareas with lightweight renderer
- **[ui-icon-color-mapping](./ui-icon-color-mapping.md)** — Data-driven icon/color resolution from database strings

### State Management

- **[state-session-scoped](./state-session-scoped.md)** — Tab filter state that persists across navigation
- **[state-dynamic-enums](./state-dynamic-enums.md)** — DB-stored enums with color, icon, sort order (runtime categories)

### API Integration

- **[api-external-linking](./api-external-linking.md)** — Link internal records with external service IDs (Stripe, etc.)
- **[api-bearer-token-integration](./api-bearer-token-integration.md)** — Typed REST API wrapper with bearer token auth
- **[api-smart-categorization](./api-smart-categorization.md)** — Two-tier categorization: DB-learned history + regex rules

### Auth & Roles

- **[auth-role-hierarchy](./auth-role-hierarchy.md)** — Multi-layer role enforcement: middleware → procedure → query scope

### CRM & Contacts

- **[crm-pipeline-management](./crm-pipeline-management.md)** — Status-based pipeline with upsert dedup, activity timeline, GDPR consent

### Finance

- **[finance-multi-source-aggregation](./finance-multi-source-aggregation.md)** — Combine Stripe + bank data into unified P&L and tax reports

### Routing

- **[routing-multi-domain](./routing-multi-domain.md)** — Multi-domain routing with rewrites, redirects, analytics, cookie merging

### Sharing

- **[sharing-public-token](./sharing-public-token.md)** — Token-based public sharing with OG metadata and custom slugs

## Usage

1. Check if pattern applies to your use case
2. Read the pattern file: `cat ~/.claude/patterns/<name>.md`
3. Adapt to your project (patterns are starting points)
4. Follow the "When to Use" and "When NOT to Use" guidance

## Contributing

To add a new pattern:

1. Create file with category prefix: `~/.claude/patterns/<category>-<name>.md`
2. Use the standard template:

   ```markdown
   # Pattern Name

   > **Category:** Category Name
   > **Source:** project-name

   ## Problem

   ## When to Use

   ## When NOT to Use

   ## Pattern (code)

   ## Critical Details
   ```

3. Update this README with the new pattern
4. Run `/sync-to-global` to document the addition

## Limits

- Max 20 pattern files (consolidate related patterns if exceeding)
- Each pattern should solve a distinct, reusable problem
- Prefer extracting to patterns over duplicating in FRAMEWORK.md
