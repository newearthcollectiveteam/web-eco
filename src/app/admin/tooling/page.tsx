"use client";

import { useState, useMemo } from "react";
import {
  Wrench,
  Database,
  Mail,
  Cloud,
  BarChart3,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Paintbrush,
  FileText,
  Sparkles,
  Code,
  Ban,
} from "lucide-react";

type Category =
  | "framework"
  | "database"
  | "api"
  | "email"
  | "hosting"
  | "ui"
  | "styling"
  | "content"
  | "graphics"
  | "analytics"
  | "security"
  | "devtools";

type Status = "active" | "configured" | "pending" | "deprecated";

interface ServiceInfo {
  name: string;
  category: Category;
  purpose: string;
  version?: string;
  envVars: string[];
  docsUrl?: string;
  status: Status;
  notes?: string;
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  framework: <Layers className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  api: <Wrench className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  hosting: <Cloud className="h-4 w-4" />,
  ui: <Wrench className="h-4 w-4" />,
  styling: <Paintbrush className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  graphics: <Sparkles className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  devtools: <Code className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<Category, string> = {
  framework: "Core Platform",
  database: "Database & ORM",
  api: "API & Data Layer",
  email: "Email",
  hosting: "Hosting & Infrastructure",
  ui: "UI & Components",
  styling: "Styling & Typography",
  content: "Content & Media",
  graphics: "Shaders & Graphics",
  analytics: "Analytics & Tracking",
  security: "Security",
  devtools: "Developer Tools",
};

const CATEGORY_ORDER: Category[] = [
  "framework", "database", "api", "email", "hosting", "ui",
  "styling", "content", "graphics", "analytics", "security", "devtools",
];

const STATUS_BADGES: Record<Status, { className: string; icon: React.ReactNode }> = {
  active: { className: "bg-green-900/50 text-green-400", icon: <CheckCircle2 className="h-3 w-3" /> },
  configured: { className: "bg-[#FACF39]/15 text-[#FACF39]", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending: { className: "bg-blue-900/50 text-blue-400", icon: <Clock className="h-3 w-3" /> },
  deprecated: { className: "bg-neutral-800 text-neutral-500", icon: <Ban className="h-3 w-3" /> },
};

const SERVICES: ServiceInfo[] = [
  // Core Platform
  { name: "Next.js", category: "framework", version: "15", purpose: "Full-stack React framework — App Router, SSR, middleware, multi-domain routing", envVars: [], docsUrl: "https://nextjs.org/docs", status: "active", notes: "Turbopack for dev" },
  { name: "React", category: "framework", version: "19", purpose: "UI library — Server Components, Suspense, concurrent features", envVars: [], docsUrl: "https://react.dev", status: "active" },
  { name: "TypeScript", category: "framework", purpose: "Type-safe JavaScript — strict mode, path aliases", envVars: [], docsUrl: "https://www.typescriptlang.org/docs", status: "active" },

  // Database & ORM
  { name: "Supabase PostgreSQL", category: "database", purpose: "Primary database — PostgreSQL with auth, storage, RLS", envVars: ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"], docsUrl: "https://supabase.com/docs", status: "active", notes: "Connection pooler via aws-1-us-east-1.pooler.supabase.com" },
  { name: "Drizzle ORM", category: "database", purpose: "Type-safe SQL query builder — schema-driven, relational queries", envVars: [], docsUrl: "https://orm.drizzle.team/docs", status: "active", notes: "Schema at src/server/db/schema.ts" },
  { name: "Supabase Storage", category: "database", purpose: "File hosting — gallery images, community photos", envVars: ["SUPABASE_SERVICE_ROLE_KEY"], docsUrl: "https://supabase.com/docs/guides/storage", status: "active", notes: "Buckets: community-photos, emergence-photos" },

  // API & Data Layer
  { name: "tRPC", category: "api", purpose: "End-to-end type-safe API — procedures auto-infer types", envVars: [], docsUrl: "https://trpc.io/docs", status: "active", notes: "Routers: admin, analytics, auth, crm, ecosystem, gallery, questionnaire, team" },
  { name: "TanStack React Query", category: "api", purpose: "Server state management — caching, optimistic updates", envVars: [], docsUrl: "https://tanstack.com/query/latest/docs", status: "active" },
  { name: "Zod", category: "api", purpose: "Runtime schema validation — tRPC inputs, env vars, forms", envVars: [], docsUrl: "https://zod.dev", status: "active" },
  { name: "SuperJSON", category: "api", purpose: "Rich JSON serialization — preserves Date, Map, Set across tRPC", envVars: [], docsUrl: "https://github.com/blitz-js/superjson", status: "active" },

  // Email
  { name: "Resend", category: "email", purpose: "Transactional email — primary email provider", envVars: ["RESEND_API_KEY"], docsUrl: "https://resend.com/docs", status: "active" },
  { name: "Mailjet", category: "email", purpose: "Transactional email — waitlist confirmations (legacy)", envVars: ["MAILJET_API_KEY", "MAILJET_SECRET_KEY", "MAILJET_FROM_EMAIL", "MAILJET_FROM_NAME"], docsUrl: "https://dev.mailjet.com", status: "deprecated" },
  { name: "Klaviyo", category: "email", purpose: "Email marketing — sequences, segmentation (legacy)", envVars: ["KLAVIYO_API_KEY", "KLAVIYO_METRIC_ID"], docsUrl: "https://developers.klaviyo.com", status: "deprecated" },

  // Hosting
  { name: "Vercel", category: "hosting", purpose: "Deployment — Edge Network, serverless functions, preview deploys", envVars: [], docsUrl: "https://vercel.com/docs", status: "active", notes: "Auto-deploys from main branch" },
  { name: "GitHub", category: "hosting", purpose: "Source control — newearthcollectiveteam org", envVars: [], docsUrl: "https://docs.github.com", status: "active", notes: "HTTPS auth via gh CLI" },

  // UI & Components
  { name: "shadcn/ui", category: "ui", purpose: "Component library — Button, Dialog, Sheet, Carousel, Breadcrumb", envVars: [], docsUrl: "https://ui.shadcn.com", status: "active", notes: "Components in src/components/ui/" },
  { name: "Lucide React", category: "ui", purpose: "Icon library — SVG icons across all pages", envVars: [], docsUrl: "https://lucide.dev", status: "active" },
  { name: "Embla Carousel", category: "ui", purpose: "Carousel engine — powers gallery photo viewers", envVars: [], docsUrl: "https://www.embla-carousel.com", status: "active" },

  // Styling
  { name: "Tailwind CSS", category: "styling", version: "4", purpose: "Utility-first CSS — custom design system, NEC gold #FACF39", envVars: [], docsUrl: "https://tailwindcss.com/docs", status: "active" },
  { name: "Google Fonts (next/font)", category: "styling", purpose: "Self-hosted web fonts — Airwaves (headings), system fonts", envVars: [], docsUrl: "https://nextjs.org/docs/app/building-your-application/optimizing/fonts", status: "active" },

  // Content & Media
  { name: "Supabase Auth", category: "content", purpose: "Authentication — magic links, password resets, team account claiming", envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"], docsUrl: "https://supabase.com/docs/guides/auth", status: "active" },

  // Graphics
  { name: "WebGL / GLSL Shaders", category: "graphics", purpose: "Custom shader engine — Flower of Life, Neural Net, Metatron's Cube, and more", envVars: [], status: "active", notes: "8 shaders in /admin/shaders. Renderer at src/components/shaders/" },

  // Analytics
  { name: "Custom Tracking", category: "analytics", purpose: "Full-funnel user journey — anonymous to known, UTM attribution", envVars: ["IP_HASH_SALT"], status: "active", notes: "Sessions, events, email link clicks, identity resolution" },

  // Security
  { name: "Supabase RLS", category: "security", purpose: "Row-level security — PostgreSQL policies at the database layer", envVars: [], docsUrl: "https://supabase.com/docs/guides/auth/row-level-security", status: "active", notes: "All tables have RLS enabled" },
  { name: "@t3-oss/env-nextjs", category: "security", purpose: "Environment validation — Zod schema for required env vars", envVars: [], docsUrl: "https://env.t3.gg", status: "active" },

  // Dev Tools
  { name: "ESLint", category: "devtools", purpose: "Code linting — TypeScript rules, React hooks, Next.js conventions", envVars: [], docsUrl: "https://eslint.org/docs", status: "active" },
  { name: "Prettier", category: "devtools", purpose: "Code formatting — Tailwind class sorting", envVars: [], docsUrl: "https://prettier.io/docs", status: "active" },
  { name: "Drizzle Kit", category: "devtools", purpose: "Schema migrations — push, generate, introspect", envVars: ["DATABASE_URL"], docsUrl: "https://orm.drizzle.team/kit-docs", status: "active" },
  { name: "Husky", category: "devtools", purpose: "Git hooks — pre-commit quality checks", envVars: [], docsUrl: "https://typicode.github.io/husky", status: "active" },
];

export default function ToolingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !service.name.toLowerCase().includes(query) &&
          !service.purpose.toLowerCase().includes(query) &&
          !service.envVars.some((v) => v.toLowerCase().includes(query)) &&
          !(service.notes?.toLowerCase().includes(query))
        ) {
          return false;
        }
      }
      if (categoryFilter !== "all" && service.category !== categoryFilter) return false;
      if (statusFilter !== "all" && service.status !== statusFilter) return false;
      return true;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const groupedServices = useMemo(() => {
    const groups = new Map<Category, ServiceInfo[]>();
    for (const service of filteredServices) {
      const existing = groups.get(service.category) ?? [];
      existing.push(service);
      groups.set(service.category, existing);
    }
    return CATEGORY_ORDER
      .filter((cat) => groups.has(cat))
      .map((cat) => [cat, groups.get(cat)!] as const);
  }, [filteredServices]);

  const stats = useMemo(() => ({
    total: SERVICES.length,
    active: SERVICES.filter((s) => s.status === "active").length,
    configured: SERVICES.filter((s) => s.status === "configured").length,
    pending: SERVICES.filter((s) => s.status === "pending").length,
    categories: new Set(SERVICES.map((s) => s.category)).size,
    envVarCount: new Set(SERVICES.flatMap((s) => s.envVars)).size,
  }), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Technology Inventory</h1>
        <p className="text-sm text-neutral-400">
          Complete stack across the NEC ecosystem
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-neutral-500">Total</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-xs text-neutral-500">Active</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-[#FACF39]">{stats.configured}</p>
          <p className="text-xs text-neutral-500">Configured</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
          <p className="text-xs text-neutral-500">Planned</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-white">{stats.categories}</p>
          <p className="text-xs text-neutral-500">Categories</p>
        </div>
        <div className="rounded-lg border bg-white/5 p-4 text-center" style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}>
          <p className="text-2xl font-bold text-white">{stats.envVarCount}</p>
          <p className="text-xs text-neutral-500">Env Vars</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, env vars, or notes..."
            className="block w-full rounded-md border bg-white/5 py-2 pr-4 pl-10 text-sm text-white placeholder-neutral-500 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39]/30 focus:outline-none"
            style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
          className="rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white"
        >
          <option value="all">All Categories</option>
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
          className="rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="configured">Configured</option>
          <option value="pending">Planned</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {/* Service List */}
      <div className="space-y-6">
        {groupedServices.map(([category, services]) => (
          <div key={category}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ backgroundColor: "rgba(250, 207, 57, 0.1)", color: "#FACF39" }}
              >
                {CATEGORY_ICONS[category]}
              </div>
              <h2 className="font-semibold text-white">{CATEGORY_LABELS[category]}</h2>
              <span className="text-sm text-neutral-500">{services.length}</span>
            </div>

            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="rounded-lg border bg-white/5 p-4"
                  style={{ borderColor: "rgba(250, 207, 57, 0.2)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        {service.version && (
                          <code className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-neutral-500">
                            v{service.version}
                          </code>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${STATUS_BADGES[service.status].className}`}>
                          {STATUS_BADGES[service.status].icon}
                          {service.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-400">{service.purpose}</p>
                      {service.notes && (
                        <p className="mt-1 text-xs text-neutral-500">{service.notes}</p>
                      )}
                      {service.envVars.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {service.envVars.map((envVar) => (
                            <code key={envVar} className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-neutral-400">
                              {envVar}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                    {service.docsUrl && (
                      <a
                        href={service.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                        title="Documentation"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wrench className="mb-4 h-12 w-12 text-neutral-600" />
          <p className="text-neutral-400">No services match your filters</p>
        </div>
      )}
    </div>
  );
}
