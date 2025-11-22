import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  User,
  Building,
  Briefcase,
  ExternalLink,
  Sparkles,
  Code,
} from "lucide-react";

const TEMPLATES = [
  {
    id: "developer-profile",
    title: "Developer Profile",
    description: "Portfolio template for developers and designers",
    icon: User,
    color: "cosmic-blue",
    href: "/templates/developer-profile",
    tags: ["Portfolio", "Personal"],
  },
  {
    id: "saas-business",
    title: "SaaS Business",
    description: "Professional landing page for SaaS products",
    icon: Building,
    color: "emerald",
    href: "/templates/saas-business",
    tags: ["Business", "SaaS"],
  },
  {
    id: "startup",
    title: "Startup",
    description: "Modern startup landing page with animations",
    icon: Rocket,
    color: "cosmic-purple",
    href: "/templates/startup",
    tags: ["Startup", "Landing"],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Personal portfolio with smooth animations",
    icon: Briefcase,
    color: "sunset-orange",
    href: "/templates/portfolio",
    tags: ["Portfolio", "Creative"],
  },
];

export default function TemplatesPage() {
  return (
    <DomainLayout>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white p-6 dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Header */}
          <div className="space-y-6 text-center">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative h-20 w-20">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <h1
              className="text-6xl font-bold text-black dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              Template Gallery
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
              Full-page templates for portfolios, startups, and business landing
              pages
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
                <Code className="mr-1.5 h-3.5 w-3.5" />
                Production Ready
              </Badge>
              <Badge className="border-black/20 bg-black/5 text-black dark:border-white/20 dark:bg-white/5 dark:text-white">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Responsive
              </Badge>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              const colorMap: Record<
                string,
                {
                  gradient: string;
                  border: string;
                  badge: string;
                  text: string;
                }
              > = {
                "cosmic-blue": {
                  gradient: "from-[#0891b2] to-[#06b6d4]",
                  border: "border-[#0891b2]/20 dark:border-[#0891b2]/30",
                  badge:
                    "bg-[#0891b2]/10 text-[#0891b2] dark:bg-[#0891b2]/20 dark:text-[#06b6d4]",
                  text: "#0891b2",
                },
                emerald: {
                  gradient: "from-[#059669] to-[#10b981]",
                  border: "border-[#059669]/20 dark:border-[#059669]/30",
                  badge:
                    "bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#10b981]",
                  text: "#059669",
                },
                "cosmic-purple": {
                  gradient: "from-[#6d28d9] to-[#a855f7]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  badge:
                    "bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#6d28d9]/20 dark:text-[#a855f7]",
                  text: "#6d28d9",
                },
                "sunset-orange": {
                  gradient: "from-[#ea580c] to-[#f97316]",
                  border: "border-[#ea580c]/20 dark:border-[#ea580c]/30",
                  badge:
                    "bg-[#ea580c]/10 text-[#ea580c] dark:bg-[#ea580c]/20 dark:text-[#f97316]",
                  text: "#ea580c",
                },
              };
              const colors =
                colorMap[template.color] ?? colorMap["cosmic-blue"]!;

              return (
                <Link key={template.id} href={template.href}>
                  <Card
                    className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}
                  >
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex-none">
                        <div
                          className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3
                          className="text-xl font-bold text-black dark:text-white"
                          style={{
                            fontFamily: "Airwaves, sans-serif",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {template.title}
                        </h3>
                      </div>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {template.description}
                      </p>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className={`text-xs ${colors.badge}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div
                          className="flex items-center gap-2 text-sm font-medium transition-colors"
                          style={{ color: colors.text }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Open Template</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Footer Note */}
          <Card className="mx-auto max-w-3xl border-2 border-[#facf39]/20 bg-gradient-to-br from-white to-neutral-50 shadow-lg dark:from-neutral-900 dark:to-black">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src="/brand/symbol.svg"
                    alt="New Earth Collective"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="text-left">
                  <h3
                    className="mb-2 text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Template Information
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    All templates open in a new window for immersive full-page
                    previews. Built with Next.js, TypeScript, and Tailwind CSS.
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
