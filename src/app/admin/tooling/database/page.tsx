"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Table2,
  HardDrive,
  ArrowLeft,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";

interface TableInfo {
  name: string;
  columns: number;
  purpose: string;
  fks?: string[];
  hasRLS: boolean;
}

interface TableGroup {
  label: string;
  description: string;
  tables: TableInfo[];
}

const TABLE_GROUPS: TableGroup[] = [
  {
    label: "Auth & Team",
    description: "User profiles and authentication — team members, roles, approval",
    tables: [
      { name: "user_profile", columns: 14, purpose: "Team member profiles — linked to Supabase Auth, roles, phone", hasRLS: true },
    ],
  },
  {
    label: "CRM & Contacts",
    description: "Master contact hub — all forms feed into central contacts table",
    tables: [
      { name: "contact", columns: 21, purpose: "Master CRM — email dedup, tags, consent tracking, unsubscribe tokens", hasRLS: true },
      { name: "contact_source", columns: 8, purpose: "Multi-source tracking — which forms each contact submitted", fks: ["contact"], hasRLS: true },
      { name: "contact_activity", columns: 7, purpose: "Activity timeline — form submissions, notes, interactions", fks: ["contact"], hasRLS: true },
      { name: "waitlist_intake", columns: 10, purpose: "Waitlist form submissions — name, email, message", fks: ["contact"], hasRLS: true },
      { name: "questionnaire_response", columns: 60, purpose: "Alignment questionnaire — 7 sections, 40+ fields", fks: ["contact"], hasRLS: true },
    ],
  },
  {
    label: "Content & Media",
    description: "Photo galleries and community media",
    tables: [
      { name: "gallery", columns: 9, purpose: "Photo galleries — title, slug, cover image, display order", hasRLS: true },
      { name: "gallery_image", columns: 11, purpose: "Individual photos — storage path, caption, dimensions", fks: ["gallery"], hasRLS: true },
    ],
  },
  {
    label: "Events",
    description: "Event management and digital waivers",
    tables: [
      { name: "event_waiver", columns: 14, purpose: "Signed liability waivers — signature data, consent tracking", hasRLS: true },
    ],
  },
  {
    label: "Tracking & Analytics",
    description: "Full-funnel user journey — anonymous visitors to known contacts",
    tables: [
      { name: "session", columns: 16, purpose: "Browser sessions — anonymous ID, UTM params, device info", fks: ["contact"], hasRLS: true },
      { name: "event", columns: 16, purpose: "User interactions — page views, clicks, form submissions", fks: ["session", "contact"], hasRLS: true },
      { name: "user_identity_map", columns: 6, purpose: "Identity resolution — links anonymous IDs to known contacts", fks: ["contact"], hasRLS: true },
      { name: "rate_limit_tracker", columns: 8, purpose: "Rate limiting for API endpoints", hasRLS: true },
    ],
  },
];

const ALL_TABLES = TABLE_GROUPS.flatMap((g) => g.tables);

type Severity = "success" | "warning" | "info";
type Advisor = { severity: Severity; message: string; url: string | null };

const advisors: { security: Advisor[]; performance: Advisor[] } = {
  security: [
    { severity: "success", message: "All 13 tables have RLS enabled", url: null },
    { severity: "warning", message: "RLS policies not yet defined on most tables (RLS enabled but no policies)", url: "https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy" },
    { severity: "info", message: "Service role key used for admin operations (team management)", url: null },
  ],
  performance: [
    { severity: "success", message: "Using connection pooler (Supavisor)", url: null },
    { severity: "info", message: "Consider adding indexes on contacts.email, user_profile.email", url: "https://supabase.com/docs/guides/database/postgres/indexes" },
    { severity: "info", message: "Questionnaire table has 60 columns — monitor query performance", url: null },
  ],
};

export default function DatabaseHealthPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(TABLE_GROUPS.map((g) => g.label))
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const totalColumns = ALL_TABLES.reduce((sum, t) => sum + t.columns, 0);
  const totalFKs = ALL_TABLES.reduce((sum, t) => sum + (t.fks?.length ?? 0), 0);
  const rlsCoverage = Math.round(
    (ALL_TABLES.filter((t) => t.hasRLS).length / ALL_TABLES.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2">
          <Link
            href="/admin/tooling"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tooling
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-white">Database Health</h1>
        <p className="text-sm text-neutral-400">
          Supabase PostgreSQL — {ALL_TABLES.length} tables across {TABLE_GROUPS.length} domains
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <Table2 className="mx-auto h-4 w-4 text-[#FACF39]" />
          <p className="mt-2 text-2xl font-bold text-white">{ALL_TABLES.length}</p>
          <p className="text-xs text-neutral-500">Tables</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <Database className="mx-auto h-4 w-4 text-[#FACF39]" />
          <p className="mt-2 text-2xl font-bold text-white">{totalColumns}</p>
          <p className="text-xs text-neutral-500">Columns</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <HardDrive className="mx-auto h-4 w-4 text-[#FACF39]" />
          <p className="mt-2 text-2xl font-bold text-white">{totalFKs}</p>
          <p className="text-xs text-neutral-500">Foreign Keys</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <Shield className="mx-auto h-4 w-4 text-green-400" />
          <p className="mt-2 text-2xl font-bold text-green-400">{rlsCoverage}%</p>
          <p className="text-xs text-neutral-500">RLS Coverage</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <Users className="mx-auto h-4 w-4 text-[#FACF39]" />
          <p className="mt-2 text-2xl font-bold text-white">{TABLE_GROUPS.length}</p>
          <p className="text-xs text-neutral-500">Domains</p>
        </div>
      </div>

      {/* Tables by Domain */}
      <div className="space-y-4">
        {TABLE_GROUPS.map((group) => (
          <div
            key={group.label}
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex w-full items-center justify-between bg-white/5 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                {expandedGroups.has(group.label) ? (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                )}
                <div>
                  <span className="font-medium text-white">{group.label}</span>
                  <span className="ml-2 text-sm text-neutral-500">
                    {group.tables.length} table{group.tables.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <span className="hidden text-xs text-neutral-500 sm:inline">{group.description}</span>
            </button>

            {expandedGroups.has(group.label) && (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b bg-white/5 text-left text-xs uppercase tracking-wider text-neutral-500"
                    style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
                  >
                    <th className="px-4 py-2">Table</th>
                    <th className="px-4 py-2 text-center">Cols</th>
                    <th className="hidden px-4 py-2 md:table-cell">Purpose</th>
                    <th className="hidden px-4 py-2 lg:table-cell">References</th>
                    <th className="px-4 py-2 text-center">RLS</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tables.map((table) => (
                    <tr
                      key={table.name}
                      className="border-b bg-white/5 last:border-b-0 hover:bg-white/10"
                      style={{ borderColor: "rgba(250, 207, 57, 0.05)" }}
                    >
                      <td className="px-4 py-2">
                        <code className="text-neutral-300">{table.name}</code>
                      </td>
                      <td className="px-4 py-2 text-center text-neutral-400">{table.columns}</td>
                      <td className="hidden px-4 py-2 text-neutral-400 md:table-cell">{table.purpose}</td>
                      <td className="hidden px-4 py-2 lg:table-cell">
                        {table.fks && table.fks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {table.fks.map((fk) => (
                              <code key={fk} className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-neutral-500">
                                → {fk}
                              </code>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {table.hasRLS ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="mx-auto h-4 w-4 text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* Advisors */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Shield className="h-4 w-4 text-[#FACF39]" />
            Security
          </h2>
          <div className="space-y-2 rounded-lg border bg-white/5 p-4" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
            {advisors.security.map((advisor, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {advisor.severity === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />}
                {advisor.severity === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />}
                {advisor.severity === "info" && <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#FACF39]" />}
                <div className="flex-1">
                  <p className="text-sm text-neutral-300">{advisor.message}</p>
                  {advisor.url && (
                    <a href={advisor.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#FACF39] transition-colors hover:text-white">
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Zap className="h-4 w-4 text-[#FACF39]" />
            Performance
          </h2>
          <div className="space-y-2 rounded-lg border bg-white/5 p-4" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
            {advisors.performance.map((advisor, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {advisor.severity === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />}
                {advisor.severity === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />}
                {advisor.severity === "info" && <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#FACF39]" />}
                <div className="flex-1">
                  <p className="text-sm text-neutral-300">{advisor.message}</p>
                  {advisor.url && (
                    <a href={advisor.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#FACF39] transition-colors hover:text-white">
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schema Reference */}
      <div className="rounded-lg border p-4" style={{ borderColor: "rgba(250, 207, 57, 0.2)", backgroundColor: "rgba(250, 207, 57, 0.03)" }}>
        <p className="text-sm text-neutral-400">
          <strong className="text-neutral-300">Schema source:</strong>{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs text-neutral-400">src/server/db/schema.ts</code>
          {" — "}All tables use Drizzle ORM with PostgreSQL. FK cascades handle child cleanup. All timestamps include timezone.
        </p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-[#FACF39] transition-colors hover:text-white"
        >
          Open Supabase Dashboard
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
