"use client";

import { useState, useMemo } from "react";
import {
  Map,
  Globe,
  Lock,
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api } from "~/trpc/react";

type Access = "public" | "admin";
type RouteType = "page" | "api";

interface ScannedRoute {
  path: string;
  type: RouteType;
  access: Access;
}

const ACCESS_COLORS: Record<Access, string> = {
  public: "bg-green-900/50 text-green-400",
  admin: "bg-red-900/50 text-red-400",
};

function groupRoutes(routes: ScannedRoute[]) {
  const groups: Record<string, ScannedRoute[]> = {
    "Public Pages": [],
    Admin: [],
    Shaders: [],
    Playground: [],
    Templates: [],
    "Landing Pages": [],
    Gallery: [],
    API: [],
    Auth: [],
    "QR Codes": [],
    Other: [],
  };

  for (const route of routes) {
    if (route.type === "api") {
      groups.API!.push(route);
    } else if (route.path.startsWith("/admin/shaders")) {
      groups.Shaders!.push(route);
    } else if (route.path.startsWith("/admin/playground")) {
      groups.Playground!.push(route);
    } else if (route.path.startsWith("/admin/templates")) {
      groups.Templates!.push(route);
    } else if (route.path.startsWith("/admin")) {
      groups.Admin!.push(route);
    } else if (
      route.path.startsWith("/dope-ass-landing") ||
      route.path.startsWith("/join-community") ||
      route.path.startsWith("/launch") ||
      route.path.startsWith("/boulder") ||
      route.path.startsWith("/global")
    ) {
      groups["Landing Pages"]!.push(route);
    } else if (route.path.startsWith("/gallery")) {
      groups.Gallery!.push(route);
    } else if (route.path.startsWith("/auth") || route.path === "/login") {
      groups.Auth!.push(route);
    } else if (route.path.startsWith("/qr")) {
      groups["QR Codes"]!.push(route);
    } else if (route.access === "public") {
      groups["Public Pages"]!.push(route);
    } else {
      groups.Other!.push(route);
    }
  }

  return Object.entries(groups).filter(([, routes]) => routes.length > 0);
}

export default function EcosystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<Access | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RouteType | "all">("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Admin", "Public Pages", "API"])
  );

  const { data: scannedRoutes, isLoading } = api.ecosystem.scanRoutes.useQuery(
    undefined,
    { staleTime: 60_000 }
  );

  const filteredRoutes = useMemo(() => {
    if (!scannedRoutes) return [];
    return scannedRoutes.filter((route) => {
      if (searchQuery && !route.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (accessFilter !== "all" && route.access !== accessFilter) {
        return false;
      }
      if (typeFilter !== "all" && route.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [scannedRoutes, searchQuery, accessFilter, typeFilter]);

  const grouped = useMemo(() => groupRoutes(filteredRoutes), [filteredRoutes]);

  const stats = useMemo(() => {
    if (!scannedRoutes) return null;
    return {
      total: scannedRoutes.length,
      pages: scannedRoutes.filter((r) => r.type === "page").length,
      api: scannedRoutes.filter((r) => r.type === "api").length,
      public: scannedRoutes.filter((r) => r.access === "public").length,
      admin: scannedRoutes.filter((r) => r.access === "admin").length,
    };
  }, [scannedRoutes]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ecosystem Map</h1>
        <p className="text-sm text-neutral-400">
          All routes across the NEC platform
          {stats && ` · ${stats.total} routes detected`}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div
            className="rounded-lg border bg-white/5 p-4 text-center"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-neutral-500">Total Routes</p>
          </div>
          <div
            className="rounded-lg border bg-white/5 p-4 text-center"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <p className="text-2xl font-bold text-white">{stats.pages}</p>
            <p className="text-xs text-neutral-500">Pages</p>
          </div>
          <div
            className="rounded-lg border bg-white/5 p-4 text-center"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <p className="text-2xl font-bold text-[#FACF39]">{stats.api}</p>
            <p className="text-xs text-neutral-500">API Routes</p>
          </div>
          <div
            className="rounded-lg border bg-white/5 p-4 text-center"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <p className="text-2xl font-bold text-green-400">{stats.public}</p>
            <p className="text-xs text-neutral-500">Public</p>
          </div>
          <div
            className="rounded-lg border bg-white/5 p-4 text-center"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          >
            <p className="text-2xl font-bold text-red-400">{stats.admin}</p>
            <p className="text-xs text-neutral-500">Admin</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes..."
            className="block w-full rounded-md border bg-white/5 py-2 pr-4 pl-10 text-sm text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          />
        </div>
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value as Access | "all")}
          className="rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white"
        >
          <option value="all">All Access</option>
          <option value="public">Public</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as RouteType | "all")}
          className="rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white"
        >
          <option value="all">All Types</option>
          <option value="page">Pages</option>
          <option value="api">API</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
      )}

      {/* Route List */}
      {!isLoading && (
        <div className="space-y-4">
          {grouped.map(([group, routes]) => (
            <div
              key={group}
              className="rounded-lg border bg-white/5"
              style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
            >
              <button
                onClick={() => toggleGroup(group)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  )}
                  <span className="font-medium text-white">{group}</span>
                  <span className="text-sm text-neutral-500">
                    {routes.length} route{routes.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>

              {expandedGroups.has(group) && (
                <div
                  className="border-t"
                  style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="border-b text-left text-xs uppercase tracking-wider text-neutral-500"
                        style={{
                          borderColor: "rgba(250, 207, 57, 0.1)",
                        }}
                      >
                        <th className="px-4 py-2">Path</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route) => (
                        <tr
                          key={`${route.type}-${route.path}`}
                          className="border-b last:border-b-0 hover:bg-white/5"
                          style={{
                            borderColor: "rgba(250, 207, 57, 0.05)",
                          }}
                        >
                          <td className="px-4 py-2">
                            <code className="text-neutral-300">
                              {route.path}
                            </code>
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                              {route.type}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${ACCESS_COLORS[route.access]}`}
                            >
                              {route.access === "public" && (
                                <Globe className="h-3 w-3" />
                              )}
                              {route.access === "admin" && (
                                <Shield className="h-3 w-3" />
                              )}
                              {route.access}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Map className="mb-4 h-12 w-12 text-neutral-600" />
          <p className="text-neutral-400">No routes match your filters</p>
        </div>
      )}
    </div>
  );
}
