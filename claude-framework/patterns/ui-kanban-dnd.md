# Kanban Board with Drag-and-Drop & Optimistic Updates

> **Category:** UI Components
> **Source:** web-eco task management

## Problem

You need a drag-and-drop kanban board where cards move between status columns with instant visual feedback, without waiting for network round-trips. The board should support dynamic columns, multi-view (list + kanban), and persist user preferences.

## When to Use

- Task/project management with workflow stages
- Any status-based pipeline (leads, orders, tickets, content publishing)
- When users need to visually reorganize items between categories
- Multi-view interfaces (list + board + timeline)

## When NOT to Use

- Simple status toggles (use a dropdown or checkbox instead)
- Read-only dashboards with no interaction
- Fewer than 2 status columns (just use a list)
- Mobile-only apps (drag-and-drop has poor mobile UX without careful touch handling)

## Key Files

```
src/app/admin/<feature>/page.tsx   # Board + cards + columns
src/server/api/routers/<feature>.ts # CRUD + status mutations
src/server/db/schema.ts             # Items table + statuses table
```

## Pattern

### 1. Install @dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Schema: Dynamic Status Columns

Store status definitions in the database so users can rename, reorder, and create new columns at runtime.

```typescript
export const itemStatuses = createTable("item_status", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),       // "To Do"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "todo"
  color: varchar("color", { length: 100 }),                 // Tailwind classes
  icon: varchar("icon", { length: 50 }),                    // Lucide icon name
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const items = createTable("item", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).default("todo").notNull(), // References slug
  // ... other fields
});
```

### 3. Sortable Card Component

```tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function KanbanCard({ item, onEdit }: { item: Item; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `item-${item.id}`, data: { type: "item", item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border p-3">
      <div className="flex items-start gap-2">
        {/* Grip handle — only this element triggers drag */}
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        {/* Clicking card body opens edit — doesn't trigger drag */}
        <button onClick={onEdit} className="flex-1 text-left">
          <p className="truncate text-sm font-medium">{item.title}</p>
        </button>
      </div>
    </div>
  );
}
```

### 4. Droppable Column Component

```tsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function KanbanColumn({ statusSlug, items, onAddItem }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${statusSlug}` });
  const itemIds = useMemo(() => items.map((i) => `item-${i.id}`), [items]);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-xl border ${isOver ? "border-primary/40 bg-primary/5" : "border-white/10"}`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <h3>{statusName}</h3>
        <span className="text-xs">{items.length}</span>
        <button onClick={onAddItem}><Plus /></button>
      </div>
      <div className="space-y-2 overflow-y-auto px-3 pb-3">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => <KanbanCard key={item.id} item={item} />)}
        </SortableContext>
      </div>
    </div>
  );
}
```

### 5. Board Orchestrator with DragOverlay

```tsx
import { DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";

function KanbanBoard({ items, statuses, onStatusChange }: Props) {
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== "item") return;
    const item = activeData.item as Item;

    const overId = String(over.id);
    let targetStatus: string | undefined;

    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "");
    } else if (overId.startsWith("item-")) {
      const overItem = items.find((i) => i.id === Number(overId.replace("item-", "")));
      if (overItem) targetStatus = overItem.status;
    }

    if (targetStatus && targetStatus !== item.status) {
      onStatusChange(item.id, targetStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveItem(e.active.data.current?.item)} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {statuses.map((s) => <KanbanColumn key={s.id} statusSlug={s.slug} items={grouped[s.slug]} />)}
      </div>
      <DragOverlay>
        {activeItem ? <CardOverlay item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 6. Optimistic Updates with tRPC + React Query

```typescript
const updateMutation = api.items.update.useMutation({
  onMutate: async (variables) => {
    if (!variables.status) return;
    await utils.items.list.cancel();
    const queryKey = { /* your filter params */ };
    const previousData = utils.items.list.getData(queryKey);

    // Optimistically move the card
    utils.items.list.setData(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((item) =>
          item.id === variables.id ? { ...item, status: variables.status! } : item
        ),
      };
    });
    return { previousData };
  },
  onError: (_err, _vars, context) => {
    // Rollback on error
    if (context?.previousData) {
      utils.items.list.setData({ /* queryKey */ }, context.previousData);
    }
  },
  onSettled: () => void utils.items.list.invalidate(),
});
```

### 7. Persist Active View Tab

```typescript
const [activeView, setActiveViewState] = useState<"list" | "kanban">("list");

useEffect(() => {
  const saved = localStorage.getItem("feature-view");
  if (saved === "list" || saved === "kanban") setActiveViewState(saved);
}, []);

const setActiveView = useCallback((view: "list" | "kanban") => {
  setActiveViewState(view);
  localStorage.setItem("feature-view", view);
}, []);
```

## Critical Details

- **ID prefixing**: Use `item-{id}` and `column-{slug}` to prevent collisions between droppable columns and sortable items
- **Separate grip handle**: Attach `listeners`/`attributes` only to the grip button so card clicks open edit modal, not trigger drag
- **DragOverlay**: Renders a floating clone during drag — the original goes transparent (`opacity: 0.3`)
- **Touch sensor delay**: 200ms prevents scroll interference on mobile
- **Pointer sensor distance**: 5px prevents accidental drags from clicks
- **Never hide cards by default**: If using collapsible columns, ensure they start expanded — users can't interact with hidden content
