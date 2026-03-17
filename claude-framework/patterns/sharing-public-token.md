# Public Token Sharing Pattern

Make gated/private content optionally public via unique token-based share links. Users toggle visibility; the system generates short URLs that work without authentication.

## Problem It Solves

You have content behind authentication (client portals, dashboards, gated apps) that users occasionally need to share externally — with prospects, stakeholders, or the public — without giving them full access to the app.

## When to Use

- Gated portals where specific items need selective public access
- Demo/portfolio sharing from an authenticated workspace
- Any resource with per-item visibility control (docs, reports, dashboards)
- When you need OG metadata for social sharing of gated content

## When NOT to Use

- Fully public content (just use public routes)
- Bulk sharing (this is per-item; use API keys or org-level sharing instead)
- Sensitive data where even a token leak is unacceptable (use authenticated sharing with invite flow)

## Architecture

```
Database Table (resources)
├── isPublic: boolean (default false)
├── publicToken: text, unique (nanoid, 12+ chars)
└── isActive: boolean (for soft-delete safety)

API Layer
├── getPublicResource(token) — publicProcedure, no auth
│   └── WHERE token = ? AND isPublic = true AND isActive = true
└── togglePublic(resourceId, isPublic) — protectedProcedure
    └── Generate token on first toggle, reuse on subsequent

Public Route: /s/[token]/[[...path]]
├── SSR page with generateMetadata() for OG tags
├── force-dynamic (never cache — visibility can change)
├── Renders content by type (component, link, embed, richtext)
└── not-found page for invalid/revoked tokens

Middleware
└── /s/* routes bypass all auth checks

UI (Portal/Dashboard)
├── "Make Public" / "Make Private" toggle button
├── "Copy Share Link" button (visible when public)
├── Visual badge (e.g., globe icon + "Public") on shared items
└── Auto-copy to clipboard on first toggle to public
```

## Implementation Checklist

### 1. Schema

Add two columns to the resource table:

```typescript
isPublic: boolean("is_public").default(false),
publicToken: text("public_token").unique(), // nanoid(12)
```

### 2. API — Public Read (No Auth)

```typescript
getPublicResource: publicProcedure
  .input(z.object({ token: z.string() }))
  .query(async ({ input }) => {
    const resource = await db.query.resources.findFirst({
      where: and(
        eq(resources.publicToken, input.token),
        eq(resources.isPublic, true),
        eq(resources.isActive, true),
      ),
    });
    if (!resource) throw new TRPCError({ code: "NOT_FOUND" });
    return resource;
  }),
```

### 3. API — Toggle (Protected)

```typescript
togglePublic: protectedProcedure
  .input(z.object({ resourceId: z.number(), isPublic: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const resource = await getResource(input.resourceId);
    authorize(ctx.user, resource); // role-based check

    // Generate token on first toggle; reuse existing
    const publicToken = resource.publicToken ?? (input.isPublic ? nanoid(12) : null);

    return db.update(resources)
      .set({ isPublic: input.isPublic, publicToken, updatedAt: new Date() })
      .where(eq(resources.id, input.resourceId))
      .returning();
  }),
```

### 4. Public Route — `/s/[token]/[[...path]]/page.tsx`

```typescript
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const demo = await api.getPublicResource({ token: params.token });
  return {
    title: demo.title,
    openGraph: { title: demo.title, description: demo.description },
  };
}

export default async function SharedPage({ params }) {
  const resource = await api.getPublicResource({ token: params.token });
  return <ResourceRenderer resource={resource} basePath={`/s/${params.token}`} />;
}
```

### 5. Middleware — Bypass Auth

```typescript
const needsAuth = !pathname.startsWith('/s/') && (
  pathname.startsWith('/admin') ||
  pathname.startsWith('/portal')
);
```

### 6. UI — Share Controls

```typescript
// Toggle mutation with auto-copy
const togglePublic = api.togglePublic.useMutation({
  onSuccess: (data) => {
    if (data.isPublic && data.publicToken) {
      void navigator.clipboard.writeText(`${origin}/s/${data.publicToken}`);
      toast.success("Public link copied!");
    } else {
      toast.success("Now private");
    }
  },
});
```

## Security Notes

- **Token entropy**: 12-char nanoid = ~71 bits of entropy; infeasible to enumerate
- **Triple-check on read**: token match + isPublic + isActive
- **Revocation**: Setting `isPublic=false` nullifies the token; old URLs return 404
- **No data leakage**: Public endpoint returns only display fields, never internal IDs or auth data
- **Role-based toggle**: Clients can only share their own resources; admins can share any

## Sub-Route Support

For multi-view resources (e.g., a demo hub with tabs), store route mappings in a JSONB metadata field:

```typescript
metadata: {
  demoComponent: "hub-component-key",
  subRoutes: { "slides": "slides-component", "inputs": "inputs-component" }
}
```

The catch-all `[[...path]]` resolves sub-routes to components via the metadata map.

## Origin Project

`website-ecosystem` — Client portal demo sharing (`/s/[token]` routes, `clientResources` table)
