# Dynamic Enums (Runtime Categories)

> **Category:** State Management / Schema Design
> **Source:** web-eco task statuses

## Problem

You hardcode enums like `["todo", "in_progress", "done"]` in TypeScript and database schemas. Users can't add, rename, or reorder these without a code release. Different teams want different workflow stages, colors, and icons.

## When to Use

- Status columns (task boards, pipelines, workflows)
- Category systems users should customize (project types, ticket categories)
- Any enum where the values need visual metadata (color, icon, sort order)
- Multi-tenant apps where each tenant wants different options

## When NOT to Use

- System-level enums that must never change (roles: `admin`, `member`)
- Binary states (active/inactive, published/draft)
- Enums with business logic branching (`if status === "done"` everywhere)
- Fewer than 3 options that will never change

## Pattern

### Schema

```typescript
export const itemStatuses = createTable("item_status", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Display: "In Review"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // FK reference: "in_review"
  color: varchar("color", { length: 100 }), // "text-blue-400 border-blue-500/30"
  icon: varchar("icon", { length: 50 }), // "eye" (Lucide icon name)
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});
```

Items reference via slug (not FK id) for readability in queries:

```typescript
export const items = createTable("item", {
  // ...
  status: varchar("status", { length: 50 }).default("todo").notNull(),
});
```

### Router: CRUD for Statuses

```typescript
listStatuses: protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.select().from(itemStatuses).orderBy(asc(itemStatuses.sortOrder));
}),

updateStatus: protectedProcedure
  .input(z.object({ id: z.number(), name: z.string().min(1).max(100).optional(), color: z.string().optional(), icon: z.string().optional() }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return (await ctx.db.update(itemStatuses).set(data).where(eq(itemStatuses.id, id)).returning())[0];
  }),

reorderStatuses: protectedProcedure
  .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
  .mutation(async ({ ctx, input }) => {
    await Promise.all(input.map((s) =>
      ctx.db.update(itemStatuses).set({ sortOrder: s.sortOrder }).where(eq(itemStatuses.id, s.id))
    ));
  }),

deleteStatus: protectedProcedure
  .input(z.object({ id: z.number(), migrateToSlug: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const [toDelete] = await ctx.db.select({ slug: itemStatuses.slug }).from(itemStatuses).where(eq(itemStatuses.id, input.id));
    if (toDelete) {
      await ctx.db.update(items).set({ status: input.migrateToSlug }).where(eq(items.status, toDelete.slug));
    }
    await ctx.db.delete(itemStatuses).where(eq(itemStatuses.id, input.id));
  }),
```

### Frontend: Icon Mapping

```tsx
import { Circle, Clock, CheckCircle2 } from "lucide-react";

const ICON_MAP: Record<string, typeof Circle> = {
  circle: Circle,
  clock: Clock,
  "check-circle-2": CheckCircle2,
  // Add icons as needed
};

function getStatusIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Circle;
}
```

### Frontend: Dynamic Filters

Replace hardcoded `<option>` lists with data from the query:

```tsx
const statusesQuery = api.items.listStatuses.useQuery();
const statuses = useMemo(() => statusesQuery.data ?? [], [statusesQuery.data]);

<select>
  <option value="">All Statuses</option>
  {statuses.map((s) => (
    <option key={s.id} value={s.slug}>
      {s.name}
    </option>
  ))}
</select>;
```

### Seed Data

```sql
INSERT INTO "item_status" ("name", "slug", "color", "icon", "sort_order") VALUES
  ('To Do',        'todo',        'text-gray-400 border-gray-500/30',    'circle',         0),
  ('In Progress',  'in_progress', 'text-yellow-400 border-yellow-500/30', 'clock',          1),
  ('Done',         'done',        'text-green-400 border-green-500/30',  'check-circle-2',  2);
```

## Critical Details

- **Slug as FK, not id**: Items store `status: "in_progress"` not `statusId: 2`. Readable in raw SQL, survives re-imports.
- **Delete requires migration target**: When deleting a status, all items must move to another status first. Never orphan records.
- **Sort order is explicit**: Don't rely on insertion order or alphabetical. Store `sortOrder` and use it everywhere.
- **"Last status" heuristic**: If your app auto-stamps `completedAt` when items reach the final status, query `ORDER BY sortOrder DESC LIMIT 1` to find it dynamically — don't hardcode `"done"`.
