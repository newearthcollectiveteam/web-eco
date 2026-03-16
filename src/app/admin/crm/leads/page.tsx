"use client";

import { useState, Suspense } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FileSignature,
  Filter,
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

const SOURCE_ICONS: Record<string, typeof ClipboardList> = {
  questionnaire: ClipboardList,
  event_waiver: FileSignature,
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const markProcessedMutation = api.crm.markWaitlistProcessed.useMutation({
    onSuccess: () => void leadsQuery.refetch(),
  });

  const data = leadsQuery.data ?? { leads: [], total: 0 };
  const { leads, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
          style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
        >
          Leads & Submissions
        </h1>
        <p className="text-sm text-gray-400">
          Raw submissions from all intake forms &middot; {total} total
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-[#facf39]/40 focus:outline-none"
          />
        </div>

        {/* Source Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(0);
            }}
            className="appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-8 text-sm text-white focus:border-[#facf39]/40 focus:outline-none"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key} className="bg-neutral-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Community Filter (independent) */}
        <div className="relative">
          <select
            value={communityFilter ?? ""}
            onChange={(e) => {
              setCommunityFilter(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-sm text-white focus:border-[#facf39]/40 focus:outline-none"
          >
            <option value="" className="bg-neutral-900">All Communities</option>
            {communityTags
              .filter((t) => t.type === "community")
              .map((tag) => (
                <option key={tag.id} value={tag.id} className="bg-neutral-900">
                  {tag.name}
                </option>
              ))}
            <option disabled className="bg-neutral-900">──────────</option>
            {communityTags
              .filter((t) => t.type === "location")
              .map((tag) => (
                <option key={tag.id} value={tag.id} className="bg-neutral-900">
                  📍 {tag.name}
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

      {/* Leads List */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-0">
          {leadsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No submissions found
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leads.map((lead) => {
                const key = `${lead.source}-${lead.id}`;
                const isExpanded = expandedItems.has(key);
                const Icon = SOURCE_ICONS[lead.source] ?? ClipboardList;
                const badgeColor =
                  SOURCE_BADGE_COLORS[lead.source] ??
                  "border-gray-500/40 text-gray-400";

                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleExpand(key)}
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 truncate font-medium text-white">
                          {lead.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${badgeColor}`}
                        >
                          {lead.source.replace(/_/g, " ")}
                        </Badge>
                        {/* Community badges */}
                        {lead.communityTags.map((ct) => (
                          <Badge
                            key={ct.id}
                            variant="outline"
                            className="shrink-0 text-[10px]"
                            style={{
                              borderColor: ct.color ? `${ct.color}66` : undefined,
                              color: ct.color ?? undefined,
                            }}
                          >
                            {ct.name}
                          </Badge>
                        ))}
                        {lead.preview && (
                          <span className="hidden max-w-xs truncate text-sm text-gray-500 md:inline">
                            {lead.preview}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pl-6.5 sm:gap-3 sm:pl-0">
                        <span className="text-xs text-gray-500">
                          {formatDate(lead.date)}
                        </span>
                        <span className="ml-auto sm:ml-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/5 bg-white/[0.02] px-4 py-4 sm:px-5">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="text-gray-200">{lead.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="break-all text-gray-200">{lead.email}</span>
                          </div>
                          {lead.preview && (
                            <div>
                              <span className="text-gray-500">
                                {lead.source === "event_waiver"
                                  ? "Event:"
                                  : "Role:"}
                              </span>{" "}
                              <span className="text-gray-200">
                                {lead.preview}
                              </span>
                            </div>
                          )}
                          {lead.communityTags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500">Communities:</span>
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
                                  {ct.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2">
                            {/* Mark processed (waitlist only - legacy) */}
                            {lead.source === "waitlist" && !lead.processed && (
                              <button
                                onClick={() =>
                                  markProcessedMutation.mutate({ id: lead.id })
                                }
                                disabled={markProcessedMutation.isPending}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-green-900/30 px-3 py-1.5 text-xs text-green-400 hover:bg-green-900/50"
                              >
                                <Check className="h-3 w-3" />
                                Mark Processed
                              </button>
                            )}

                            {lead.source === "waitlist" && lead.processed && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                                <Check className="h-3 w-3" />
                                Processed
                              </span>
                            )}

                            {/* Link to contact page */}
                            {lead.contactId && (
                              <Link
                                href={`/admin/crm/contacts/${lead.contactId}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#facf39]/10 px-3 py-1.5 text-xs text-[#facf39] hover:bg-[#facf39]/20"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Contact
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
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
