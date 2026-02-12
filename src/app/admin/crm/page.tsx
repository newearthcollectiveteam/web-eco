"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import {
  Users,
  ClipboardList,
  FileSignature,
  Activity,
  Database,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "~/trpc/react";

interface Contact {
  id: number;
  email: string;
  name: string | null;
  firstSource: string;
  status: string;
  createdAt: Date;
}

interface QuestionnaireResponse {
  id: number;
  name: string;
  email: string;
  source: string | null;
  createdAt: Date;
}

interface Waiver {
  id: number;
  signerName: string;
  signerEmail: string;
  eventName: string;
  signedAt: Date;
}

type SectionItem = Contact | QuestionnaireResponse | Waiver;

function getItemName(item: SectionItem): string {
  if ("signerName" in item) return item.signerName;
  return item.name ?? "";
}

function getItemEmail(item: SectionItem): string {
  if ("signerEmail" in item) return item.signerEmail;
  return item.email;
}

function getItemDate(item: SectionItem): Date {
  if ("signedAt" in item) return item.signedAt;
  return item.createdAt;
}

function AdminPageContent() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const statsQuery = api.admin.dashboardStats.useQuery();
  const data = statsQuery.data;
  const loading = statsQuery.isLoading;
  const error = statsQuery.error;

  const contactsTable = api.admin.tableData.useQuery(
    { table: "contacts", limit: 50 },
    { enabled: expandedSection === "crm" }
  );
  const questionnaireTable = api.admin.tableData.useQuery(
    { table: "questionnaire", limit: 50 },
    { enabled: expandedSection === "questionnaire" }
  );
  const waiversTable = api.admin.tableData.useQuery(
    { table: "waivers", limit: 50 },
    { enabled: expandedSection === "waivers" }
  );

  const tableQueries: Record<string, typeof contactsTable> = {
    contacts: contactsTable,
    questionnaire: questionnaireTable,
    waivers: waiversTable,
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sections = [
    {
      id: "crm",
      table: "contacts",
      title: "CRM Contacts",
      icon: Users,
      color: "amber",
      stat: data?.stats.contacts ?? 0,
      description: "Master contact database - all leads and members",
      recent: (data?.recent.contacts ?? []) as SectionItem[],
    },
    {
      id: "questionnaire",
      table: "questionnaire",
      title: "Questionnaire Responses",
      icon: ClipboardList,
      color: "emerald",
      stat: data?.stats.questionnaires ?? 0,
      description: "Alignment questionnaire submissions",
      recent: (data?.recent.questionnaires ?? []) as SectionItem[],
    },
    {
      id: "waivers",
      table: "waivers",
      title: "Event Waivers",
      icon: FileSignature,
      color: "purple",
      stat: data?.stats.waivers ?? 0,
      description: "Signed event liability waivers",
      recent: (data?.recent.waivers ?? []) as SectionItem[],
    },
  ];

  const colorMap: Record<string, { gradient: string; border: string; bg: string }> = {
    amber: {
      gradient: "from-[#facf39] to-[#f59e0b]",
      border: "border-[#facf39]/30",
      bg: "bg-[#facf39]/10",
    },
    emerald: {
      gradient: "from-[#059669] to-[#10b981]",
      border: "border-[#059669]/30",
      bg: "bg-[#059669]/10",
    },
    purple: {
      gradient: "from-[#6d28d9] to-[#a855f7]",
      border: "border-[#6d28d9]/30",
      bg: "bg-[#6d28d9]/10",
    },
  };

  return (
    <DomainLayout>
      <Suspense fallback={null}>
        <BackButton />
      </Suspense>
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative h-16 w-16">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <h1
              className="mb-4 text-5xl font-bold text-black dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              Admin Dashboard
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Database overview and intake form submissions
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
                <Database className="mr-1.5 h-3.5 w-3.5" />
                Live Data
              </Badge>
              <button
                onClick={() => void statsQuery.refetch()}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/20 bg-black/5 px-3 py-1 text-sm text-black transition-colors hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-8 border-red-500/30 bg-red-500/10">
              <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
                Failed to load database info
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          {data && (
            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: "Contacts", value: data.stats.contacts, icon: Users },
                { label: "Questionnaires", value: data.stats.questionnaires, icon: ClipboardList },
                { label: "Waivers", value: data.stats.waivers, icon: FileSignature },
                { label: "Activities", value: data.stats.activities, icon: Activity },
                { label: "Sources", value: data.stats.sources, icon: Database },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border border-neutral-200 dark:border-neutral-800"
                >
                  <CardContent className="p-4 text-center">
                    <stat.icon className="mx-auto mb-2 h-5 w-5 text-[#facf39]" />
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-neutral-500">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Data Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const colors = colorMap[section.color]!;
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              const tableQuery = tableQueries[section.table];
              const fullData = tableQuery?.data?.data ?? [];

              return (
                <Card
                  key={section.id}
                  className={`overflow-hidden border-2 ${colors.border}`}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold text-black dark:text-white"
                          style={{ fontFamily: "Airwaves, sans-serif" }}
                        >
                          {section.title}
                        </h2>
                        <p className="text-sm text-neutral-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${colors.bg} ${colors.border} text-black dark:text-white`}>
                        {section.stat} records
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* Recent Preview (always visible) */}
                  {!isExpanded && section.recent.length > 0 && (
                    <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
                      <div className="text-xs font-medium uppercase tracking-wide text-neutral-400 mb-3">
                        Recent
                      </div>
                      <div className="space-y-2">
                        {section.recent.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-900"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-black dark:text-white">
                                {getItemName(item)}
                              </span>
                              <span className="text-sm text-neutral-500">
                                {getItemEmail(item)}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">
                              {formatDate(getItemDate(item))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Full List */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800">
                      {tableQuery?.isLoading ? (
                        <div className="p-8 text-center">
                          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
                          <p className="mt-2 text-sm text-neutral-500">Loading...</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-900">
                              <tr className="text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                              {fullData.map((item: Record<string, unknown>) => {
                                const str = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");
                                const id = str(item.id);
                                const name = str(item.name) || str(item.signerName);
                                const email = str(item.email) || str(item.signerEmail);
                                const source = str(item.firstSource) || str(item.source) || str(item.eventName) || "\u2014";
                                const date = str(item.createdAt) || str(item.signedAt);
                                return (
                                <tr
                                  key={id}
                                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                >
                                  <td className="px-6 py-3 text-sm text-neutral-500">
                                    {id}
                                  </td>
                                  <td className="px-6 py-3 font-medium text-black dark:text-white">
                                    {name}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                                    {email}
                                  </td>
                                  <td className="px-6 py-3">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {source}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-3 text-sm text-neutral-500">
                                    {formatDate(date)}
                                  </td>
                                </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <Card className="mx-auto mt-12 max-w-3xl border-2 border-[#facf39]/20 bg-gradient-to-br from-white to-neutral-50 shadow-lg dark:from-neutral-900 dark:to-black">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src="/brand/symbol.svg"
                    alt="New Earth Collective"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="text-left">
                  <h3
                    className="mb-1 text-lg font-bold text-black dark:text-white"
                    style={{ fontFamily: "Airwaves, sans-serif" }}
                  >
                    Database Admin
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    CRM and intake form data visualization. All data syncs to the master contact database.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DomainLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  );
}
