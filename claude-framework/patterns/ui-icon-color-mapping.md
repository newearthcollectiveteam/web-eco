# Dynamic Icon & Color Mapping from Database

> **Category:** UI Components
> **Source:** web-eco task statuses

## Problem

You store visual metadata (icon names, color classes) in the database so users can customize appearance at runtime. The frontend needs to resolve string names like `"clock"` to actual React components and `"text-blue-400 border-blue-500/30"` to applied styles.

## When to Use

- Dynamic status/category systems with user-customizable colors and icons
- Theme systems where colors are stored in the database
- Any feature where visual properties are data-driven, not hardcoded

## When NOT to Use

- Static icons that never change (just import directly)
- When you have fewer than 3 options (hardcode the mapping inline)

## Pattern

### Icon Map

```tsx
import { Circle, Clock, CheckCircle2, AlertCircle, Eye, Star, Zap } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  clock: Clock,
  "check-circle-2": CheckCircle2,
  "alert-circle": AlertCircle,
  eye: Eye,
  star: Star,
  zap: Zap,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Circle; // Fallback to Circle
}
```

### Usage

```tsx
function StatusBadge({ status }: { status: { icon: string; color: string; name: string } }) {
  const Icon = getIcon(status.icon);
  return (
    <div className={`flex items-center gap-2 ${status.color}`}>
      <Icon className="h-4 w-4" />
      <span>{status.name}</span>
    </div>
  );
}
```

### Color Storage Format

Store full Tailwind class strings in the database:

```
text-gray-400 border-gray-500/30      # For borders + text
bg-blue-900/40 text-blue-400           # For badges
text-green-400 border-green-500/30     # For success states
```

Extract the text color when you only need one:

```tsx
const textColor = status.color?.split(" ")[0] ?? "text-gray-400";
```

## Critical Details

- **Always provide a fallback**: `ICON_MAP[name] ?? Circle` — never crash on unknown icon names
- **Extend the map as needed**: When users request new icons, add them to `ICON_MAP`. Keep the map in one file.
- **Tailwind safelist**: If using dynamic classes from DB, ensure they're in Tailwind's safelist or already used statically elsewhere in the codebase. Tailwind purges unused classes at build time.
- **Icon name convention**: Use Lucide's kebab-case names (e.g., `check-circle-2`, not `CheckCircle2`) for DB storage — they're more readable and database-friendly.
