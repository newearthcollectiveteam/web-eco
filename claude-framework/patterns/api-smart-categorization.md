# Pattern: Smart Categorization Engine

## Problem
You have incoming data (transactions, support tickets, logs, etc.) that needs to be classified into categories. You want the system to learn from user corrections while also providing sensible defaults out of the box.

## When to Use
- Classifying transactions, expenses, or records into categories
- You want user corrections to improve future suggestions
- You need a fallback when no history exists (new system, new vendor, etc.)
- Categories are relatively stable (IRS categories, support tiers, etc.)

## When NOT to Use
- Categories change frequently or are user-defined per record
- You need ML-grade classification (use an LLM or classifier model instead)
- Simple 1:1 mapping with no ambiguity (just use a lookup table)

## Pattern

Two-tier categorization: **DB-learned history first**, then **regex rules fallback**.

### Tier 1: DB History Lookup

```typescript
// ═══════════════════════════════════════════════════════════
// Check past user categorizations for this counterparty
// ═══════════════════════════════════════════════════════════
interface DbMapping {
  categoryId: number;
  isTaxDeductible: boolean;
}

function suggestFromHistory(
  name: string | null,
  description: string | null,
  dbMappings: Map<string, DbMapping>
): DbMapping | null {
  if (!name && !description) return null;

  // Exact match on counterparty name
  const normalizedName = name?.toLowerCase().trim();
  if (normalizedName) {
    const exact = dbMappings.get(normalizedName);
    if (exact) return exact;
  }

  // Fuzzy: check if any known mapping is a substring
  const searchText = [name, description].filter(Boolean).join(" ").toLowerCase();
  for (const [key, mapping] of dbMappings) {
    if (searchText.includes(key) || key.includes(searchText.slice(0, 20))) {
      return mapping;
    }
  }

  return null;
}
```

### Tier 2: Regex Rules Fallback

```typescript
// ═══════════════════════════════════════════════════════════
// Static rules for common vendors/patterns
// ═══════════════════════════════════════════════════════════
interface CategorizationRule {
  pattern: RegExp;
  categoryName: string;
  metadata?: Record<string, unknown>; // e.g., { isTaxDeductible: true }
}

const RULES: CategorizationRule[] = [
  // Software & Subscriptions
  { pattern: /vercel|supabase|github|anthropic/i, categoryName: "Software & Subscriptions", metadata: { isTaxDeductible: true } },
  // Payment Processing
  { pattern: /stripe|paypal|square/i, categoryName: "Commissions & Fees", metadata: { isTaxDeductible: true } },
  // ... add domain-specific rules
];

function suggestFromRules(
  name: string | null,
  description: string | null
): { categoryName: string; metadata?: Record<string, unknown> } | null {
  const text = [name, description].filter(Boolean).join(" ");
  if (!text) return null;

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { categoryName: rule.categoryName, metadata: rule.metadata };
    }
  }
  return null;
}
```

### Combined: Two-Tier Suggestion

```typescript
// ═══════════════════════════════════════════════════════════
// Use in tRPC router or service layer
// ═══════════════════════════════════════════════════════════
function categorize(
  name: string | null,
  description: string | null,
  dbMappings: Map<string, DbMapping>,
  categoryLookup: Map<string, number> // categoryName → categoryId
): { categoryId: number | null; source: "history" | "rules" | "none" } {
  // Tier 1: DB history (user-corrected)
  const fromHistory = suggestFromHistory(name, description, dbMappings);
  if (fromHistory) {
    return { categoryId: fromHistory.categoryId, source: "history" };
  }

  // Tier 2: Regex rules
  const fromRules = suggestFromRules(name, description);
  if (fromRules) {
    const categoryId = categoryLookup.get(fromRules.categoryName) ?? null;
    return { categoryId, source: "rules" };
  }

  return { categoryId: null, source: "none" };
}
```

### Learning: Save User Corrections

```typescript
// When user manually categorizes a transaction, save the mapping
// so future transactions from the same counterparty auto-categorize
await db.insert(transactionCategories).values({
  counterpartyName: transaction.counterpartyName?.toLowerCase().trim(),
  categoryId: userSelectedCategoryId,
  isTaxDeductible: userSelectedDeductible,
}).onConflictDoUpdate({
  target: transactionCategories.counterpartyName,
  set: {
    categoryId: userSelectedCategoryId,
    isTaxDeductible: userSelectedDeductible,
    updatedAt: new Date(),
  },
});
```

## Key Decisions

1. **DB history wins over rules** — User corrections are always more accurate than regex.
2. **Regex rules as bootstrap** — New systems work out of the box before any user corrections.
3. **First match wins** — Order rules from most specific to most general.
4. **Return source** — Callers know whether a suggestion came from history or rules (useful for confidence indicators in UI).
5. **Case-insensitive matching** — Vendor names vary in capitalization across APIs.

## Schema Support

```typescript
// Junction table for learned categorizations
export const transactionCategories = pgTable("transaction_categories", {
  id: serial("id").primaryKey(),
  counterpartyName: text("counterparty_name").notNull().unique(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  isTaxDeductible: boolean("is_tax_deductible").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Related Patterns
- `api-bearer-token-integration.md` — Fetching data from the external API that produces these transactions
- `api-external-linking.md` — Linking internal category records to external service IDs
