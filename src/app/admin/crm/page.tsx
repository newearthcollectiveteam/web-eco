"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { api } from "~/trpc/react";

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  customer: "Member",
  inactive: "Inactive",
};

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-yellow-900/50 text-yellow-400",
  qualified: "bg-blue-900/50 text-blue-400",
  customer: "bg-green-900/50 text-green-400",
  inactive: "bg-neutral-800 text-neutral-400",
};

const PIPELINE_COLORS: Record<string, string> = {
  lead: "bg-yellow-500",
  qualified: "bg-blue-500",
  customer: "bg-green-500",
  inactive: "bg-neutral-600",
};

const PIPELINE_ICONS: Record<string, typeof Users> = {
  lead: UserPlus,
  qualified: Users,
  customer: UserCheck,
  inactive: UserX,
};

const SOURCE_LABELS: Record<string, string> = {
  waitlist: "Waitlist",
  questionnaire: "Questionnaire",
  event_waiver: "Event Waiver",
  manual: "Manual",
  other: "Other",
};

const SOURCE_COLORS: Record<string, string> = {
  waitlist: "bg-amber-500",
  questionnaire: "bg-emerald-500",
  event_waiver: "bg-purple-500",
  manual: "bg-blue-500",
  other: "bg-neutral-500",
};

function CRMDashboardContent() {
  const statsQuery = api.crm.getPipelineStats.useQuery();
  const sourceQuery = api.crm.getSourceBreakdown.useQuery();
  const recentQuery = api.crm.getContacts.useQuery({ limit: 10 });

  const stats = statsQuery.data;
  const sources = sourceQuery.data;
  const recent = recentQuery.data;
  const loading = statsQuery.isLoading;

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10">
            <Image
              src="/brand/symbol.svg"
              alt="New Earth Collective"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              CRM Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              {stats ? `${stats.total} total contacts` : "Loading..."}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            void statsQuery.refetch();
            void sourceQuery.refetch();
            void recentQuery.refetch();
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Pipeline Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(["lead", "qualified", "customer", "inactive"] as const).map(
            (status) => {
              const Icon = PIPELINE_ICONS[status] ?? Users;
              const count = (stats as Record<string, number>)[status] ?? 0;
              return (
                <Card key={status} className="border-white/10 bg-white/5">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">
                          {STATUS_LABELS[status]}
                        </p>
                        <p className="mt-1 text-3xl font-bold text-white">
                          {count}
                        </p>
                      </div>
                      <div
                        className={`rounded-xl p-3 ${STATUS_COLORS[status]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      )}

      {/* Pipeline Distribution Bar */}
      {stats && stats.total > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-medium text-gray-400">
              Pipeline Distribution
            </p>
            <div className="flex h-4 overflow-hidden rounded-full bg-neutral-800">
              {(["lead", "qualified", "customer", "inactive"] as const).map(
                (status) => {
                  const count = (stats as Record<string, number>)[status] ?? 0;
                  const pct = (count / stats.total) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={status}
                      className={`${PIPELINE_COLORS[status]} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${STATUS_LABELS[status]}: ${count} (${pct.toFixed(0)}%)`}
                    />
                  );
                }
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {(["lead", "qualified", "customer", "inactive"] as const).map(
                (status) => {
                  const count = (stats as Record<string, number>)[status] ?? 0;
                  const pct = stats.total
                    ? ((count / stats.total) * 100).toFixed(0)
                    : "0";
                  return (
                    <div
                      key={status}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${PIPELINE_COLORS[status]}`}
                      />
                      {STATUS_LABELS[status]} {pct}%
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Breakdown */}
      {sources && sources.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-medium text-gray-400">
              Contacts by Source
            </p>
            <div className="space-y-3">
              {sources.map((s) => {
                const maxCount = sources[0]?.count ?? 1;
                const pct = (s.count / maxCount) * 100;
                return (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm text-gray-300 sm:w-28">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </span>
                    <div className="flex-1">
                      <div className="h-6 rounded bg-neutral-800">
                        <div
                          className={`flex h-6 items-center rounded px-2 text-xs font-medium text-white ${SOURCE_COLORS[s.source] ?? "bg-neutral-500"}`}
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          {s.count}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Contacts */}
      {recent && recent.contacts.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-sm font-medium text-gray-400">
                Recent Contacts
              </p>
              <Link
                href="/admin/crm/contacts"
                className="flex items-center gap-1 text-xs text-[#facf39] hover:underline"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recent.contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/crm/contacts/${c.id}`}
                          className="font-medium text-white hover:text-[#facf39]"
                        >
                          {c.name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {c.email}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className="border-white/20 text-xs"
                        >
                          {SOURCE_LABELS[c.firstSource] ?? c.firstSource}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                        >
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-white/5 md:hidden">
              {recent.contacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/crm/contacts/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {c.name ?? "—"}
                    </p>
                    <p className="truncate text-xs text-gray-500">{c.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[c.status] ?? ""}`}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/crm/contacts"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#facf39]/30 bg-gradient-to-r from-[#facf39]/10 to-[#f59e0b]/10 px-6 py-4 font-medium text-[#facf39] transition-colors hover:from-[#facf39]/20 hover:to-[#f59e0b]/20"
        >
          <Users className="h-5 w-5" />
          All Contacts
        </Link>
        <Link
          href="/admin/crm/leads"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-medium text-white transition-colors hover:bg-white/10"
        >
          <UserPlus className="h-5 w-5" />
          Leads & Submissions
        </Link>
      </div>
    </div>
  );
}

export default function CRMDashboardPage() {
  return (
    <Suspense fallback={null}>
      <CRMDashboardContent />
    </Suspense>
  );
}
