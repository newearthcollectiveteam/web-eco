"use client";

import { useState, Suspense } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileSignature,
  Search,
} from "lucide-react";
import { api } from "~/trpc/react";

const SOURCE_OPTIONS = [
  { key: "", label: "All Sources" },
  { key: "questionnaire", label: "Questionnaire" },
  { key: "event_waiver", label: "Event Waivers" },
] as const;

const SOURCE_BADGE_COLORS: Record<string, string> = {
  questionnaire: "border-emerald-500/40 text-emerald-400",
  event_waiver: "border-purple-500/40 text-purple-400",
};

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

const SORT_OPTIONS = [
  { key: "date" as const, label: "Date" },
  { key: "name" as const, label: "Name" },
  { key: "source" as const, label: "Source" },
];

const PAGE_SIZE = 25;

function LeadsContent() {
  const [sourceFilter, setSourceFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "source">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const communityTagsQuery = api.crm.getCommunityTagsFlat.useQuery();

  const leadsQuery = api.crm.getLeads.useQuery({
    source: sourceFilter || undefined,
    communityTagId: communityFilter,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const data = leadsQuery.data ?? { leads: [], total: 0 };
  const { leads, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleSort = (col: "date" | "name" | "source") => {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder(col === "name" ? "asc" : "desc");
    }
    setPage(0);
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const communityTags = communityTagsQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{
            fontFamily: "Airwaves, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Leads & Submissions
        </h1>
        <p className="text-sm text-gray-400">
          Raw submissions from all intake forms &middot; {total} total
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-white placeholder:text-gray-500 focus:border-[#facf39]/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/40 focus:outline-none"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={communityFilter ?? ""}
            onChange={(e) => {
              setCommunityFilter(
                e.target.value ? Number(e.target.value) : undefined
              );
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/40 focus:outline-none"
          >
            <option value="">All Communities</option>
            {communityTags
              .filter((t) => t.type === "community")
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            <option disabled>──────────</option>
            {communityTags
              .filter((t) => t.type === "location")
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
        Sort by:
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => toggleSort(opt.key)}
            className={`rounded px-2 py-1 transition-colors ${
              sortBy === opt.key
                ? "bg-[#facf39]/20 text-[#facf39]"
                : "hover:text-white"
            }`}
          >
            {opt.label}
            {sortBy === opt.key && (sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden border-white/10 bg-white/5 md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Communities</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Preview</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leadsQuery.isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {!leadsQuery.isLoading && leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No submissions found
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const key = `${lead.source}-${lead.id}`;
                  const Icon =
                    lead.source === "event_waiver"
                      ? FileSignature
                      : ClipboardList;
                  const badgeColor =
                    SOURCE_BADGE_COLORS[lead.source] ??
                    "border-gray-500/40 text-gray-400";

                  return (
                    <tr key={key} className="hover:bg-white/5">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                          <span className="font-medium text-white">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-400">
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="text-xs text-gray-500">
                            {lead.phone}
                          </div>
                        )}
                      </td>
                      {/* Communities BEFORE source */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {lead.communityTags.map((ct) => (
                            <Badge
                              key={ct.id}
                              variant="outline"
                              className="text-[10px]"
                              style={{
                                borderColor: ct.color
                                  ? `${ct.color}66`
                                  : undefined,
                                color: ct.color ?? undefined,
                              }}
                            >
                              {ct.parentName ? `${ct.parentName} > ` : ""}
                              {ct.name}
                            </Badge>
                          ))}
                          {lead.communityTags.length === 0 && (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${badgeColor}`}
                        >
                          {lead.source.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? ""}`}
                        >
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </span>
                      </td>
                      <td className="max-w-[200px] px-5 py-3">
                        <span className="truncate text-xs text-gray-500">
                          {lead.preview || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(lead.date)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {lead.contactId ? (
                          <Link
                            href={`/admin/crm/contacts/${lead.contactId}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-[#facf39]"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <span className="text-xs text-gray-500">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs text-gray-400">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="space-y-3 md:hidden">
        {leadsQuery.isLoading && (
          <p className="py-12 text-center text-sm text-gray-500">Loading...</p>
        )}
        {!leadsQuery.isLoading && leads.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No submissions found
          </p>
        )}
        {leads.map((lead) => {
          const key = `${lead.source}-${lead.id}`;
          const badgeColor =
            SOURCE_BADGE_COLORS[lead.source] ??
            "border-gray-500/40 text-gray-400";

          return (
            <Card key={key} className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-white">{lead.name}</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? ""}`}
                  >
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-400">
                  {lead.email}
                </p>
                {/* Community tags first */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {lead.communityTags.map((ct) => (
                    <Badge
                      key={ct.id}
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        borderColor: ct.color ? `${ct.color}66` : undefined,
                        color: ct.color ?? undefined,
                      }}
                    >
                      {ct.parentName ? `${ct.parentName} > ` : ""}
                      {ct.name}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${badgeColor}`}
                  >
                    {lead.source.replace(/_/g, " ")}
                  </Badge>
                </div>
                {lead.preview && (
                  <p className="mt-2 truncate text-xs text-gray-500">
                    {lead.preview}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(lead.date)}</span>
                  {lead.contactId && (
                    <Link
                      href={`/admin/crm/contacts/${lead.contactId}`}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs text-[#facf39] hover:bg-white/10"
                    >
                      View Contact
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-500">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}{" "}
              of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-2 text-sm text-gray-400">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsContent />
    </Suspense>
  );
}
