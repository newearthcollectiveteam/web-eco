"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Users,
  ClipboardList,
  FileSignature,
  Activity,
  Database,
  RefreshCw,
  BarChart3,
  UserPlus,
  DollarSign,
  Palette,
  Sparkles,
  Code2,
  Mail,
  ImageIcon,
} from "lucide-react";
import { api } from "~/trpc/react";

function OverviewContent() {
  const statsQuery = api.admin.dashboardStats.useQuery();
  const data = statsQuery.data;
  const loading = statsQuery.isLoading;

  return (
    <div className="space-y-8">
      {/* Page Header */}
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
              Overview
            </h1>
            <p className="text-sm text-gray-400">
              Admin dashboard for New Earth Collective
            </p>
          </div>
        </div>
        <button
          onClick={() => void statsQuery.refetch()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "CRM Contacts", value: data.stats.contacts, icon: Users },
            {
              label: "Questionnaires",
              value: data.stats.questionnaires,
              icon: ClipboardList,
            },
            {
              label: "Event Waivers",
              value: data.stats.waivers,
              icon: FileSignature,
            },
            {
              label: "Activities",
              value: data.stats.activities,
              icon: Activity,
            },
            { label: "Sources", value: data.stats.sources, icon: Database },
          ].map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-white/5">
              <CardContent className="p-4 text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-[#FACF39]" />
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Section Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/crm">
          <Card className="border-white/10 bg-white/5 transition-colors hover:border-[#FACF39]/30 hover:bg-white/[0.07]">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <Users className="h-5 w-5 text-[#FACF39]" />
                <h3 className="font-semibold text-white">CRM</h3>
              </div>
              <p className="text-sm text-gray-400">
                Contact management, leads, and pipeline tracking
              </p>
              {data && (
                <Badge className="mt-3 border-[#FACF39]/30 bg-[#FACF39]/10 text-[#FACF39]">
                  {data.stats.contacts} contacts
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="border-white/10 bg-white/5 transition-colors hover:border-[#FACF39]/30 hover:bg-white/[0.07]">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-[#FACF39]" />
                <h3 className="font-semibold text-white">Analytics</h3>
              </div>
              <p className="text-sm text-gray-400">
                Form submissions, user tracking, and attribution
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/finance">
          <Card className="border-white/10 bg-white/5 transition-colors hover:border-[#FACF39]/30 hover:bg-white/[0.07]">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#FACF39]" />
                <h3 className="font-semibold text-white">Finance</h3>
              </div>
              <p className="text-sm text-gray-400">
                Revenue, expenses, and financial overview
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      {data && data.recent.contacts.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5">
            <h3 className="mb-4 font-semibold text-white">Recent Contacts</h3>
            <div className="space-y-2">
              {data.recent.contacts.slice(0, 5).map((contact) => (
                <Link
                  key={contact.id}
                  href={`/admin/crm/contacts/${contact.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 transition-colors hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium text-white">
                      {contact.name ?? "—"}
                    </span>
                    <span className="truncate text-sm text-gray-400">
                      {contact.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/20 text-xs text-gray-400"
                    >
                      {contact.firstSource}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Team", href: "/admin/team", icon: UserPlus },
            { label: "Gallery", href: "/admin/cms/gallery", icon: ImageIcon },
            {
              label: "Email Testing",
              href: "/admin/cms/email-testing",
              icon: Mail,
            },
            { label: "Brand", href: "/admin/brand", icon: Palette },
            { label: "Shaders", href: "/admin/shaders", icon: Sparkles },
            { label: "Playground", href: "/admin/playground", icon: Code2 },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border-white/10 bg-white/5 transition-colors hover:border-[#FACF39]/30 hover:bg-white/[0.07]">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <link.icon className="h-5 w-5 text-[#FACF39]" />
                  <span className="text-sm text-gray-300">{link.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Sites */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-5">
          <h3 className="mb-4 font-semibold text-white">Live Sites</h3>
          <div className="space-y-2">
            <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-sm break-all text-white">
                  joinnewearthcollective.com
                </span>
              </div>
              <Badge className="w-fit border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
                Live
              </Badge>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-500" />
                <span className="text-sm break-all text-gray-400">
                  test.joinnewearthcollective.com
                </span>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-gray-600 text-xs text-gray-500"
              >
                Deprecated
              </Badge>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-500" />
                <span className="text-sm break-all text-gray-400">
                  launch.joinnewearthcollective.com
                </span>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-gray-600 text-xs text-gray-500"
              >
                Deprecated
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <OverviewContent />
    </Suspense>
  );
}
