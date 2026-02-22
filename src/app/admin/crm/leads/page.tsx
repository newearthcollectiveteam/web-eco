"use client";

import { useState, Suspense } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileSignature,
  UserPlus,
} from "lucide-react";
import { api } from "~/trpc/react";

const SOURCE_TABS = [
  { key: "", label: "All" },
  { key: "waitlist", label: "Waitlist" },
  { key: "questionnaire", label: "Questionnaire" },
  { key: "event_waiver", label: "Event Waivers" },
] as const;

const SOURCE_BADGE_COLORS: Record<string, string> = {
  waitlist: "border-amber-500/40 text-amber-400",
  questionnaire: "border-emerald-500/40 text-emerald-400",
  event_waiver: "border-purple-500/40 text-purple-400",
};

const SOURCE_ICONS: Record<string, typeof ClipboardList> = {
  waitlist: UserPlus,
  questionnaire: ClipboardList,
  event_waiver: FileSignature,
};

function LeadsContent() {
  const [sourceTab, setSourceTab] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const leadsQuery = api.crm.getLeads.useQuery(
    sourceTab ? { source: sourceTab } : undefined
  );

  const markProcessedMutation = api.crm.markWaitlistProcessed.useMutation({
    onSuccess: () => void leadsQuery.refetch(),
  });

  const leads = leadsQuery.data ?? [];

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
          Raw submissions from all intake forms
        </p>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-white/5 p-1">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSourceTab(tab.key)}
            className={`shrink-0 flex-1 rounded-md px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
              sourceTab === tab.key
                ? "bg-[#facf39]/20 text-[#facf39]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads Table */}
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
                      className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-white/5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="shrink-0 font-medium text-white">
                          {lead.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${badgeColor}`}
                        >
                          {lead.source.replace(/_/g, " ")}
                        </Badge>
                        {lead.preview && (
                          <span className="hidden max-w-xs truncate text-sm text-gray-500 md:inline">
                            {lead.preview}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(lead.date)}
                        </span>

                        {/* Waitlist processed indicator */}
                        {lead.source === "waitlist" && (
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              lead.processed
                                ? "bg-green-900/50 text-green-400"
                                : "bg-neutral-800 text-neutral-500"
                            }`}
                            title={
                              lead.processed ? "Processed" : "Not processed"
                            }
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        )}

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="text-gray-200">{lead.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="text-gray-200">{lead.email}</span>
                          </div>
                          {lead.preview && (
                            <div>
                              <span className="text-gray-500">
                                {lead.source === "event_waiver"
                                  ? "Event:"
                                  : lead.source === "questionnaire"
                                    ? "Role:"
                                    : "Message:"}
                              </span>{" "}
                              <span className="text-gray-200">
                                {lead.preview}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2">
                            {/* Mark processed (waitlist only) */}
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

                            {/* Link to full view if contact exists */}
                            {lead.source !== "waitlist" && (
                              <span className="text-xs text-gray-500">
                                View full details on the contact page
                              </span>
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
