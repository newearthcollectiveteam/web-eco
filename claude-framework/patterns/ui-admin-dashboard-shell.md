# Admin Dashboard Shell

> **Category:** UI Components
> **Source:** web-eco admin layout

## Problem

You need an admin layout with sidebar navigation, header with breadcrumbs, and responsive mobile handling. Some pages (galleries, dashboards) use the shell; others (full-screen viewers, embeds, landing pages) should bypass it.

## When to Use

- Admin panels with 5+ pages
- Any multi-page dashboard requiring consistent navigation
- When some pages need the shell and others don't

## When NOT to Use

- Single-page apps
- Public marketing pages
- Simple settings panels with only 2-3 pages (use tabs instead)

## Key Files

```
src/components/admin/
├── admin-dashboard-layout.tsx  # Shell wrapper with standalone detection
├── admin-sidebar.tsx           # Collapsible sidebar + mobile sheet
├── admin-sidebar-context.tsx   # Sidebar state context (collapsed, mobile)
├── admin-header.tsx            # Header with breadcrumbs
└── admin-nav.ts                # Navigation config (links, icons, badges)

src/app/admin/layout.tsx        # Wraps all /admin/* pages
```

## Pattern

### 1. Layout Wrapper with Standalone Detection

```tsx
const STANDALONE_PREFIXES = ["/admin/templates/"];

function isStandalonePage(pathname: string): boolean {
  if (STANDALONE_PREFIXES.some((p) => pathname.startsWith(p))) return true;

  // Gallery index gets shell, but individual items don't
  if (pathname.startsWith("/admin/shaders/") && pathname !== "/admin/shaders")
    return true;
  if (
    pathname.startsWith("/admin/playground/") &&
    pathname !== "/admin/playground"
  )
    return true;

  return false;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed, closeMobile } = useAdminSidebar();

  // Close mobile sidebar on navigation
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  if (isStandalonePage(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <AdminHeader />
      <main
        style={{ marginLeft: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {children}
      </main>
    </div>
  );
}
```

### 2. Sidebar Context

```tsx
const AdminSidebarContext = createContext<{
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
} | null>(null);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse: () => setIsCollapsed((c) => !c),
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: useCallback(() => setIsMobileOpen(false), []),
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}
```

### 3. Navigation Config (Declarative)

```typescript
export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
  { label: "CRM", href: "/admin/crm", icon: "users", badge: "new" },
  {
    label: "Content",
    icon: "file-text",
    children: [
      { label: "Pages", href: "/admin/content/pages" },
      { label: "Gallery", href: "/admin/gallery" },
    ],
  },
];
```

### 4. App Layout

```tsx
// src/app/admin/layout.tsx
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
```

## Critical Details

- **Standalone detection is prefix-based**: Index pages get the shell, child pages don't. Pattern: `pathname.startsWith("/admin/X/") && pathname !== "/admin/X"`
- **Sidebar width as constants**: Export `SIDEBAR_WIDTH` and `SIDEBAR_WIDTH_COLLAPSED` so main content margin stays in sync
- **Mobile: remove margin**: Below breakpoint, main content goes full-width and sidebar becomes an overlay sheet
- **Close mobile on navigate**: `useEffect` on `pathname` change calls `closeMobile()`
- **Tooltips when collapsed**: Show nav label as tooltip when sidebar is in collapsed icon-only mode
