# Pattern: Bearer Token API Integration

## Problem

You need to integrate with an external REST API that uses bearer token authentication (e.g., Mercury, Plaid, financial APIs). You want type-safe responses, graceful error handling, and a clean abstraction that doesn't leak implementation details.

## When to Use

- Integrating with any REST API that uses `Authorization: Bearer <token>` auth
- The API key comes from environment variables
- You need typed responses and null-safe error handling
- Multiple endpoints share the same auth/base URL

## When NOT to Use

- OAuth2 flows (use a dedicated OAuth library)
- GraphQL APIs (use a GraphQL client)
- APIs with complex auth (HMAC signing, certificate pinning)

## Pattern

```typescript
// src/lib/<service>.ts
import { env } from "~/env";

const BASE_URL = "https://api.example.com/v1";

// ═══════════════════════════════════════════════════════════
// RESPONSE TYPES (match API docs)
// ═══════════════════════════════════════════════════════════
interface Account {
  id: string;
  name: string;
  status: "active" | "closed";
  balance: number;
}

interface AccountsResponse {
  accounts: Account[];
}

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  status: "pending" | "sent" | "failed";
  createdAt: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

// ═══════════════════════════════════════════════════════════
// GENERIC FETCH WRAPPER
// ═══════════════════════════════════════════════════════════
async function apiFetch<T>(endpoint: string): Promise<T | null> {
  if (!env.SERVICE_API_KEY) {
    console.warn("Service API key not configured");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${env.SERVICE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error("API fetch error:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════
export async function getAccounts(): Promise<Account[]> {
  const data = await apiFetch<AccountsResponse>("/accounts");
  return data?.accounts ?? [];
}

export async function getTransactions(
  accountId: string,
  limit = 100,
  offset = 0,
  start?: string,
  end?: string
): Promise<Transaction[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const data = await apiFetch<TransactionsResponse>(
    `/account/${accountId}/transactions?${params.toString()}`
  );
  return data?.transactions ?? [];
}

export type { Account, Transaction };
```

## Key Decisions

1. **Return `null` on failure, not throw** — Callers decide how to handle missing data (show empty state vs error). Throwing forces try/catch everywhere.
2. **Generic `apiFetch<T>`** — Single place for auth headers, error logging, and response parsing. Add retry logic here if needed.
3. **Check env var at call time** — Graceful degradation when API key isn't configured (dev environments, CI builds).
4. **Export types** — Consumers can use the response types without coupling to implementation.

## Multi-Source Aggregation

When combining data from multiple APIs (e.g., Stripe in cents + Mercury in dollars):

```typescript
// Normalize to a common unit before combining
const stripeRevenue = stripeCharges.reduce((sum, c) => sum + c.amount, 0) / 100; // cents → dollars
const mercuryRevenue = mercuryTxs.reduce((sum, t) => sum + t.amount, 0); // already dollars
const totalRevenue = stripeRevenue + mercuryRevenue;
```

## Related Patterns

- `api-external-linking.md` — Linking internal records to external service IDs
