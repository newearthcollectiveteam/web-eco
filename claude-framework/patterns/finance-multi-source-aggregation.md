# Pattern: Multi-Source Financial Aggregation

## Problem

Your app tracks revenue and expenses from multiple financial sources (payment processor like Stripe + bank account like Mercury). Each source uses different units (cents vs dollars), different APIs, and different data shapes. You need to combine them into unified views: dashboards, P&L reports, and tax-ready exports.

## When to Use

- Apps with multiple revenue/expense sources (Stripe + bank, PayPal + accounting software, etc.)
- Finance dashboards that need a unified view across providers
- Tax/compliance reporting that combines manual and automated entries
- Any system that aggregates financial data from disparate APIs

## When NOT to Use

- Single payment provider with no bank integration
- Simple revenue tracking (just Stripe, no aggregation needed)
- When a dedicated accounting tool (QuickBooks, Xero) already handles aggregation

## Pattern

### Parallel Fetch with Graceful Degradation

Fetch from all sources simultaneously. If one fails, show partial data rather than nothing.

```typescript
getOverview: adminProcedure.query(async () => {
  // Fetch all sources in parallel — each handles its own errors
  const [stripeData, bankData] = await Promise.all([
    fetchStripeOverview().catch(() => null),
    fetchBankOverview().catch(() => null),
  ]);

  return {
    stripe: stripeData ?? { connected: false, mrr: 0, totalRevenue: 0 },
    bank: bankData ?? { connected: false, totalAvailable: 0, accounts: [] },
  };
}),
```

### Currency Normalization

Establish a canonical unit early. Stripe uses cents; most bank APIs use dollars.

```typescript
// ═══════════════════════════════════════════════════════════
// RULE: All internal amounts are in CENTS (integers)
// Convert at the boundary, not in business logic
// ═══════════════════════════════════════════════════════════

// Stripe: already in cents — use directly
const stripeRevenue = charges.reduce((sum, c) => sum + c.amount, 0);

// Bank API: dollars → cents at the boundary
const bankExpenseCents = Math.round(Math.abs(bankTx.amount) * 100);

// Display: cents → dollars only in the UI layer
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

### Combined Monthly P&L

Merge revenue (Stripe) and expenses (bank + manual) into a month-by-month view.

```typescript
getYearlyProfitLoss: adminProcedure
  .input(z.object({ year: z.number() }))
  .query(async ({ ctx, input }) => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      expenses: 0,
      profit: 0,
    }));

    // --- Revenue: Stripe charges ---
    const charges = await fetchStripeCharges(input.year);
    for (const charge of charges) {
      const monthIdx = new Date(charge.created * 1000).getMonth();
      months[monthIdx]!.revenue += charge.amount; // already cents
    }

    // --- Expenses: Manual (DB) ---
    const manualExpenses = await ctx.db.select()
      .from(expenses)
      .where(and(
        gte(expenses.date, `${input.year}-01-01`),
        lt(expenses.date, `${input.year + 1}-01-01`)
      ));

    for (const exp of manualExpenses) {
      const monthIdx = new Date(exp.date).getMonth();
      months[monthIdx]!.expenses += exp.amount; // stored in cents
    }

    // --- Expenses: Bank transactions (negative = outflow) ---
    const bankTxs = await fetchBankTransactions(input.year);
    for (const tx of bankTxs) {
      if (tx.amount >= 0) continue; // skip inflows
      const amountCents = Math.round(Math.abs(tx.amount) * 100);
      const monthIdx = new Date(tx.postedAt ?? tx.createdAt).getMonth();
      months[monthIdx]!.expenses += amountCents;
    }

    // --- Calculate profit ---
    for (const month of months) {
      month.profit = month.revenue - month.expenses;
    }

    return {
      months,
      totalRevenue: months.reduce((sum, m) => sum + m.revenue, 0),
      totalExpenses: months.reduce((sum, m) => sum + m.expenses, 0),
      netProfit: months.reduce((sum, m) => sum + m.profit, 0),
    };
  }),
```

### Expense Categorization + Tax Tracking

Combine manual DB expenses with auto-categorized bank transactions, grouped by IRS-aligned categories.

```typescript
getYearlyExpenses: (adminProcedure
  .input(z.object({ year: z.number() }))
  .query(async ({ ctx, input }) => {
    const categoryTotals: Record<string, { name: string; total: number }> = {};
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      expenses: 0,
    }));

    // 1. Manual expenses (already categorized in DB)
    const manualExpenses = await ctx.db
      .select({
        amount: expenses.amount,
        date: expenses.date,
        categoryName: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .where(dateRange(input.year));

    for (const exp of manualExpenses) {
      const monthIdx = new Date(exp.date).getMonth();
      months[monthIdx]!.expenses += exp.amount;
      accumulate(
        categoryTotals,
        exp.categoryName ?? "Uncategorized",
        exp.amount
      );
    }

    // 2. Bank transactions (use learned + rule-based categorization)
    const bankTxs = await fetchBankTransactions(input.year);
    const categorizations = await fetchCategorizationsForTxs(ctx.db, bankTxs);

    for (const tx of bankTxs) {
      if (tx.amount >= 0) continue;
      const catName = categorizations.get(tx.id);
      if (!catName) continue; // uncategorized bank txs excluded from reports

      const amountCents = Math.round(Math.abs(tx.amount) * 100);
      const monthIdx = new Date(tx.postedAt ?? tx.createdAt).getMonth();
      months[monthIdx]!.expenses += amountCents;
      accumulate(categoryTotals, catName, amountCents);
    }

    return {
      months,
      total: months.reduce((sum, m) => sum + m.expenses, 0),
      byCategory: Object.values(categoryTotals).sort(
        (a, b) => b.total - a.total
      ),
    };
  }),
  // Helper
  function accumulate(
    totals: Record<string, { name: string; total: number }>,
    name: string,
    amount: number
  ) {
    if (!totals[name]) totals[name] = { name, total: 0 };
    totals[name]!.total += amount;
  });
```

### Tax Deduction Export

Filter categorized expenses by deductibility for accountant-ready reports.

```typescript
getTaxDeductions: adminProcedure
  .input(z.object({ year: z.number() }))
  .query(async ({ ctx, input }) => {
    // Combine manual expenses + categorized bank transactions
    // Filter where isTaxDeductible = true
    // Group by IRS category (Line 8, Line 9, etc.)
    // Return CSV-ready rows: { vendor, date, category, irsLine, amount }
  }),
```

## Key Decisions

1. **Canonical unit = cents (integers)** — Avoids floating point issues. Convert bank API dollars → cents at the boundary.
2. **Parallel fetch, independent error handling** — Each source catches its own errors. Partial data is better than no data.
3. **Bank transactions filtered by status** — Exclude `failed` and `cancelled` transactions from all calculations.
4. **Only categorized bank txs in reports** — Uncategorized transactions are excluded from expense reports to avoid noise. Users categorize via the dashboard, and the system learns for next time.
5. **Manual expenses + bank transactions = complete picture** — DB expenses cover things not in the bank (credit cards, cash), bank transactions cover automated outflows.

## Related Patterns

- `api-bearer-token-integration.md` — The fetch wrapper for bank API calls
- `api-smart-categorization.md` — The two-tier categorization engine for auto-classifying transactions
- `api-external-linking.md` — Linking internal records to Stripe/bank transaction IDs
