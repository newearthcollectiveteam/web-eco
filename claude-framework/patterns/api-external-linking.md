# External Service Linking Pattern

> **Category:** API Integration
> **Source:** website-ecosystem portal (Stripe billing)

## Problem

You need to link your internal records (proposals, orders, users) with external service IDs (Stripe payment intents, subscriptions, invoices) without:

- Modifying the external service's data
- Making N+1 queries to resolve relationships
- Losing the relationship when external data changes

## Solution

Build lookup maps from your internal data, then use those maps to filter and enrich external data in a single pass.

## When to Use

- Stripe payment/subscription integration
- Any payment processor (PayPal, Square)
- Third-party CRM linking
- External API data enrichment
- Multi-service data aggregation

## When NOT to Use

- Internal database relationships (use foreign keys)
- Simple 1:1 relationships (just store the ID)
- Real-time sync requirements (use webhooks)

## Pattern

### Step 1: Store External IDs in Metadata

```typescript
// When creating a Stripe checkout session
const session = await stripe.checkout.sessions.create({
  // ... session config
  metadata: {
    proposalId: proposal.id.toString(),
    clientSlug: client.slug,
  },
});

// After successful payment (webhook handler)
await db
  .update(proposals)
  .set({
    metadata: {
      ...proposal.metadata,
      stripePaymentIntentId: session.payment_intent,
      stripeSubscriptionId: session.subscription,
    },
  })
  .where(eq(proposals.id, proposalId));
```

### Step 2: Build Lookup Maps

```typescript
// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
interface ProposalLink {
  proposalId: number;
  proposalTitle: string;
  projectId: number | null;
  projectName: string | null;
}

// ═══════════════════════════════════════════════════════════
// BUILD MAPS FROM YOUR DATA
// ═══════════════════════════════════════════════════════════
const piToProposal = new Map<string, ProposalLink>(); // Payment Intent → Proposal
const subToProposal = new Map<string, ProposalLink>(); // Subscription → Proposal
const invToProposal = new Map<string, ProposalLink>(); // Invoice → Proposal

// Populate from proposals with metadata
for (const p of proposals) {
  const meta = p.metadata as Record<string, unknown> | null;
  if (!meta) continue;

  const link: ProposalLink = {
    proposalId: p.id,
    proposalTitle: p.title,
    projectId: p.project?.id ?? null,
    projectName: p.project?.name ?? null,
  };

  const piId = meta.stripePaymentIntentId as string | undefined;
  if (piId) piToProposal.set(piId, link);

  const subId = meta.stripeSubscriptionId as string | undefined;
  if (subId) subToProposal.set(subId, link);

  const invId = meta.stripeInvoiceId as string | undefined;
  if (invId) invToProposal.set(invId, link);
}
```

### Step 3: Filter External Data

```typescript
// Fetch from external service
const [payments, subscriptions, invoices] = await Promise.all([
  stripe.paymentIntents.list({ customer: customerId, limit: 100 }),
  stripe.subscriptions.list({ customer: customerId, limit: 100 }),
  stripe.invoices.list({ customer: customerId, limit: 100 }),
]);

// Filter to only linked items
const linkedPayments = payments.data
  .filter((pi) => piToProposal.has(pi.id))
  .map((pi) => ({
    ...pi,
    _proposalLink: piToProposal.get(pi.id),
  }));

const linkedSubscriptions = subscriptions.data
  .filter((sub) => subToProposal.has(sub.id))
  .map((sub) => ({
    ...sub,
    _proposalLink: subToProposal.get(sub.id),
  }));
```

### Step 4: Handle Invoice Fallback Chain

Invoices can be linked via:

1. Direct invoice ID
2. Parent subscription ID
3. Payment intent ID

```typescript
const linkedInvoices = invoices.data
  .map((inv) => {
    // Try direct invoice link
    let link = invToProposal.get(inv.id);

    // Fall back to subscription link
    if (!link && inv.subscription) {
      const subId =
        typeof inv.subscription === "string"
          ? inv.subscription
          : inv.subscription.id;
      link = subToProposal.get(subId);
    }

    // Fall back to payment intent link
    if (!link && inv.payment_intent) {
      const piId =
        typeof inv.payment_intent === "string"
          ? inv.payment_intent
          : inv.payment_intent.id;
      link = piToProposal.get(piId);
    }

    return { ...inv, _proposalLink: link };
  })
  .filter((inv) => inv._proposalLink !== undefined);
```

## Full Example: getBillingInfo

```typescript
getBillingInfo: protectedProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ ctx, input }) => {
    // 1. Verify access
    const profile = await getProfile(ctx.user.id);
    if (profile.role === "client" && profile.clientSlug !== input.slug) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // 2. Get client and their proposals
    const client = await db.query.clients.findFirst({
      where: eq(clients.slug, input.slug),
      with: { proposals: { with: { project: true } } },
    });

    // 3. Build lookup maps
    const piToProposal = new Map<string, ProposalLink>();
    const subToProposal = new Map<string, ProposalLink>();

    for (const p of client.proposals) {
      // ... populate maps
    }

    // 4. Fetch external data
    const [payments, subscriptions] = await Promise.all([
      stripe.paymentIntents.list({ customer: client.stripeCustomerId }),
      stripe.subscriptions.list({ customer: client.stripeCustomerId }),
    ]);

    // 5. Filter and enrich
    return {
      payments: payments.data
        .filter((pi) => piToProposal.has(pi.id))
        .map((pi) => ({ ...pi, proposal: piToProposal.get(pi.id) })),
      subscriptions: subscriptions.data
        .filter((sub) => subToProposal.has(sub.id))
        .map((sub) => ({ ...sub, proposal: subToProposal.get(sub.id) })),
    };
  }),
```

## Key Insights

1. **Non-invasive**: External service data is never modified
2. **Single pass**: No N+1 queries to resolve relationships
3. **Fallback chain**: Multiple ways to resolve a link
4. **Type safety**: `ProposalLink` interface structures the relationship
5. **Filtering + Enrichment**: Same maps serve both purposes

## Webhook Integration

```typescript
// Webhook handler: write the link when payment succeeds
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const proposalId = session.metadata?.proposalId;
  if (!proposalId) return;

  await db
    .update(proposals)
    .set({
      metadata: sql`jsonb_set(
        COALESCE(metadata, '{}'),
        '{stripePaymentIntentId}',
        ${JSON.stringify(session.payment_intent)}
      )`,
    })
    .where(eq(proposals.id, parseInt(proposalId)));
}
```

## Combine With

- Webhook handlers for writing links
- tRPC procedures for querying
- Role-based access control (clients only see their own)
