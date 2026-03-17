# Action Menu Pattern

> **Category:** UI Components
> **Source:** website-ecosystem portal

## Problem

Admin interfaces need contextual action menus (edit, delete, archive) that:
- Support different action types (default, danger)
- Handle disabled states
- Close on click outside
- Maintain accessibility

## When to Use

- Any list item needing contextual actions
- Admin panels with row-level operations
- Cards or tiles with multiple actions

## When NOT to Use

- Single action items (just use a button)
- Global actions (use toolbar or header)
- Actions that need confirmation (combine with ConfirmDialog)

## Pattern

```typescript
// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
export interface AdminAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface AdminActionMenuProps {
  actions: AdminAction[];
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
export function AdminActionMenu({ actions }: AdminActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Open actions menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border bg-black/95 py-1 shadow-xl backdrop-blur-md">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              disabled={action.disabled}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                action.disabled
                  ? "cursor-not-allowed opacity-40"
                  : action.variant === "danger"
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Usage

```typescript
const actions: AdminAction[] = [
  {
    label: isArchived ? "Restore" : "Archive",
    icon: isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
    onClick: () => updateItem.mutate({ id: item.id, isActive: isArchived }),
  },
  {
    label: "Edit",
    icon: <Pencil className="h-4 w-4" />,
    onClick: () => setEditDialogOpen(true),
  },
  {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "danger",
    onClick: () => setDeleteConfirmOpen(true),
  },
];

<AdminActionMenu actions={actions} />
```

## Key Features

1. **Event bubbling prevention**: `e.preventDefault()` + `e.stopPropagation()` prevents clicks from triggering parent handlers
2. **Accessibility**: `aria-label` and `aria-expanded` for screen readers
3. **Variant styling**: "danger" variant uses red for destructive actions
4. **Disabled state**: Visual feedback with `opacity-40` and `cursor-not-allowed`
5. **Backdrop blur**: Modern glass-morphism effect

## Combine With

- `ConfirmDialog` for destructive actions
- Toast notifications for action feedback
- Role-based action filtering (hide actions user can't perform)
