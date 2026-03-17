# Session-Scoped State Pattern

> **Category:** State Management
> **Source:** website-ecosystem portal

## Problem

Filter states (search, sort, view mode) reset when navigating between tabs, causing poor UX. Options:
- **URL params**: Clutters URL, causes navigation issues
- **localStorage**: Persists too long, stale across sessions
- **Redux/Zustand**: Overkill for simple filter state
- **Component state**: Resets on every navigation

## Solution

React Context + `useRef(new Map())` for state that:
- Persists across tab navigation within a session
- Resets on page refresh (intentional)
- Has zero external dependencies
- Provides instant lookups via Map

## When to Use

- Tab-based UIs with filters per tab
- Dashboard panels with independent state
- Multi-step forms with preserved progress
- Any state that should survive navigation but not page refresh

## When NOT to Use

- State that should persist across sessions (use localStorage)
- State that should be shareable via URL (use URL params)
- Global app state (use Zustand/Redux)
- Simple single-component state (use useState)

## Pattern

### Context Provider

```typescript
// src/components/filter-context.tsx
"use client";

import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
export type SortOrder = "newest" | "oldest" | "name";
export type ViewMode = "grouped" | "list";

export interface TabFilterState {
  searchQuery: string;
  sortOrder: SortOrder;
  selectedProject: number | string | "all";
  viewMode: ViewMode;
  collapsedGroups: string[];
  activeTab?: "active" | "archived";
}

const DEFAULT_STATE: TabFilterState = {
  searchQuery: "",
  sortOrder: "newest",
  selectedProject: "all",
  viewMode: "list",
  collapsedGroups: [],
  activeTab: "active",
};

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════
interface FilterContextValue {
  getTabState: (tab: string) => TabFilterState;
  setTabState: (tab: string, partial: Partial<TabFilterState>) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

// ═══════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════
export function FilterProvider({ children }: { children: ReactNode }) {
  // useRef + Map survives re-renders without causing them
  const stateMap = useRef(new Map<string, TabFilterState>());

  const getTabState = useCallback((tab: string): TabFilterState => {
    return stateMap.current.get(tab) ?? { ...DEFAULT_STATE };
  }, []);

  const setTabState = useCallback(
    (tab: string, partial: Partial<TabFilterState>) => {
      const prev = stateMap.current.get(tab) ?? { ...DEFAULT_STATE };
      stateMap.current.set(tab, { ...prev, ...partial });
    },
    [],
  );

  return (
    <FilterContext.Provider value={{ getTabState, setTabState }}>
      {children}
    </FilterContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════
export function useTabFilters(tab: string) {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useTabFilters must be used within FilterProvider");
  }

  return {
    getState: () => context.getTabState(tab),
    setState: (partial: Partial<TabFilterState>) => context.setTabState(tab, partial),
  };
}
```

### Layout Wrapper

```typescript
// src/app/portal/[slug]/layout.tsx
"use client";

import { FilterProvider } from "~/components/filter-context";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <FilterProvider>{children}</FilterProvider>;
}
```

### Tab Component Usage

```typescript
// src/app/portal/[slug]/tooling/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTabFilters } from "~/components/filter-context";

export default function ToolingPage() {
  const { getState, setState: persistState } = useTabFilters("tooling");
  const saved = getState();

  // Initialize from persisted state
  const [searchQuery, setSearchQuery] = useState(saved.searchQuery);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);
  const [viewMode, setViewMode] = useState(saved.viewMode);
  const [activeTab, setActiveTab] = useState(saved.activeTab ?? "active");

  // Persist changes back to context
  useEffect(() => {
    persistState({ searchQuery, sortOrder, viewMode, activeTab });
  }, [searchQuery, sortOrder, viewMode, activeTab, persistState]);

  return (
    // ... component JSX
  );
}
```

## Key Insights

1. **useRef + Map**: Survives re-renders without causing them. Perfect for "invisible" state storage.

2. **Spread on read**: `{ ...DEFAULT_STATE }` creates new object, preventing mutation bugs.

3. **Partial updates**: `{ ...prev, ...partial }` allows updating individual fields.

4. **Tab isolation**: Each tab has independent state. No cross-tab pollution.

5. **No serialization**: Unlike localStorage, no JSON.parse/stringify overhead.

## Variations

### With Reset Function

```typescript
const resetTabState = useCallback((tab: string) => {
  stateMap.current.delete(tab);
}, []);
```

### With All-Tabs Reset

```typescript
const resetAllTabs = useCallback(() => {
  stateMap.current.clear();
}, []);
```

### With State Debugging

```typescript
const debugState = useCallback(() => {
  console.log(Object.fromEntries(stateMap.current));
}, []);
```

## Combine With

- SearchFilterBar component for filter UI
- Tab navigation components
- List/Grid view toggles
