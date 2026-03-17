# Pattern: Multi-Layer Role Hierarchy

## Problem

Your app needs more than simple "logged in vs not" access control. You need role-based access enforced at multiple layers — middleware (routing), API procedures (data access), and query scoping (data visibility) — with support for broad roles and granular sub-roles.

## When to Use

- B2B SaaS with admin and client roles
- Multi-tenant apps where users should only see their own data
- Apps where some users manage others (account managers, team leads)
- Any app that outgrows a single `isAdmin` boolean

## When NOT to Use

- Simple apps with just "public" and "logged in" access
- Apps where all authenticated users have equal access
- Purely public-facing sites

## Pattern

Three enforcement layers, each catching what the previous one can't:

```
Request → [Middleware] → [Procedure] → [Query Scope]
              │              │               │
          Route gate    Role check     Data filtering
         (fast, URL)   (DB lookup)    (row-level)
```

### Layer 1: Middleware — Route Gate

Fast, URL-based checks before any page or API route runs. No DB queries here — use email allowlists or JWT claims.

```typescript
// src/middleware.ts
const ADMIN_EMAILS = ["admin@company.com"];

if (pathname.startsWith("/admin")) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Fast gate: email allowlist (no DB query)
  if (!ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
}
```

### Layer 2: tRPC Procedure — Role Check

DB-backed role verification. Create procedure types for each role tier.

```typescript
// src/server/api/trpc.ts

// Public — no auth
export const publicProcedure = t.procedure;

// Protected — requires authentication
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const protectedProcedure = t.procedure.use(authMiddleware);

// Admin — requires admin role (DB lookup)
const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const profile = await ctx.db.query.users.findFirst({
    where: eq(users.authUserId, ctx.user.id),
  });

  if (!profile || profile.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  // Pass profile downstream — avoids redundant DB lookups
  return next({ ctx: { ...ctx, user: ctx.user, profile } });
});
export const adminProcedure = t.procedure.use(adminMiddleware);
```

### Layer 3: Query Scope — Row-Level Filtering

Even within the same procedure, different roles see different data.

```typescript
// src/server/api/routers/resources.ts
getResources: protectedProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ ctx, input }) => {
    const profile = await ctx.db.query.users.findFirst({
      where: eq(users.authUserId, ctx.user.id),
    });

    if (!profile) throw new TRPCError({ code: "FORBIDDEN" });

    // Clients can only see their own slug
    if (profile.role === "client" && profile.clientSlug !== input.slug) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    // Clients only see active resources; admins see all
    const conditions = [eq(resources.clientSlug, input.slug)];
    if (profile.role === "client") {
      conditions.push(eq(resources.isActive, true));
    }

    return ctx.db.query.resources.findMany({
      where: and(...conditions),
    });
  }),
```

### Sub-Roles for Granular Permissions

When broad roles aren't enough, add a `companyRoles` array for feature-level permissions.

```typescript
// Schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role", { enum: ["admin", "client"] })
    .notNull()
    .default("client"),
  companyRoles: text("company_roles").array().default([]),
  // "account_manager", "billing_admin", "viewer", etc.
});

// Check sub-role in procedure
if (profile.companyRoles?.includes("account_manager")) {
  // Filter to only their assigned clients
  conditions.push(eq(resources.accountManagerId, profile.id));
}
```

## Key Decisions

1. **Middleware = fast gate, no DB** — Email allowlists or JWT claims only. Keeps middleware fast.
2. **Procedure = authoritative role check** — DB lookup confirms role. This is the security boundary.
3. **Query scope = data visibility** — Same procedure, different views. Clients see less than admins.
4. **Pass profile downstream** — Admin middleware attaches `profile` to context so routers don't re-query.
5. **Sub-roles are additive** — Base role (`admin`/`client`) for broad access, `companyRoles` array for feature-level permissions.

## Related Patterns

- Framework: Authentication Patterns (Supabase Auth setup)
- Framework: API Patterns (tRPC procedure types)
