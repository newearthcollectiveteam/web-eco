"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const MICRO_APPS = [
  {
    slug: "el-nido-chat",
    name: "El Nido Chat",
    description:
      "Ask anything about the El Nido stage at Envision 2026 — schedule, logistics, contacts, and more.",
    icon: MessageCircle,
    color: "#facf39",
    status: "live" as const,
  },
];

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      {/* Header */}
      <div className="mb-10 text-center sm:mb-14">
        <h1
          className="mb-2 text-3xl font-bold tracking-wide text-white sm:text-4xl"
          style={{
            fontFamily: "Airwaves, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          NEC Apps
        </h1>
        <p className="text-sm text-gray-400 sm:text-base">
          Micro-apps from the New Earth Collective
        </p>
      </div>

      {/* App Cards */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {MICRO_APPS.map((app) => {
          const Icon = app.icon;
          return (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/[0.08] sm:p-8"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${app.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: app.color }} />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                {app.name}
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                {app.description}
              </p>
              {app.status === "live" && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-600">
        New Earth Collective
      </div>
    </div>
  );
}
