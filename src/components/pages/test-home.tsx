"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Zap, Code2, Rocket, ArrowRight, Sparkles } from "lucide-react";

export function TestHomePage() {
  // Check if we're on localhost to add domain parameter
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  const domainParam = isLocalhost ? '?domain=test.joinnewearthcollective.com' : '';

  const features = [
    {
      title: "GLSL Shaders",
      description: "WebGL shader animations and effects",
      details: "8 interactive shader demonstrations including sacred geometry, fractals, neural networks, and generative art.",
      href: `/shaders${domainParam}`,
      icon: Zap,
      color: "violet",
      count: "8 shaders",
    },
    {
      title: "Component Playground",
      description: "Interactive UI component demos",
      details: "Test and explore animation effects, particle systems, and interactive components in development.",
      href: `/playground${domainParam}`,
      icon: Code2,
      color: "blue",
      count: "9 demos",
    },
    {
      title: "Page Templates",
      description: "Full-page template collection",
      details: "Pre-built templates for portfolios, SaaS products, startups, and developer profiles.",
      href: `/templates${domainParam}`,
      icon: Rocket,
      color: "purple",
      count: "4 templates",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <section className="mb-16 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent dark:from-violet-400 dark:to-purple-400">
            Development Hub
          </h1>
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl text-xl">
            New Earth Collective - Under Development
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              test.joinnewearthcollective.com
            </Badge>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Available Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorMap: Record<string, { gradient: string; border: string; badge: string }> = {
                violet: {
                  gradient: "from-violet-500 to-purple-600",
                  border: "border-violet-200 dark:border-violet-800/50",
                  badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
                },
                blue: {
                  gradient: "from-blue-500 to-cyan-600",
                  border: "border-blue-200 dark:border-blue-800/50",
                  badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
                },
                purple: {
                  gradient: "from-purple-500 to-pink-600",
                  border: "border-purple-200 dark:border-purple-800/50",
                  badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
                },
              };
              const colors = colorMap[feature.color] ?? colorMap.violet!;

              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className={`group h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}>
                    <CardHeader>
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.details}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={colors.badge}>
                          {feature.count}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer Note */}
        <section className="text-center">
          <div className="border-border bg-muted/50 mx-auto max-w-3xl rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Development Environment</h3>
            <p className="text-muted-foreground text-sm">
              This is the test environment for New Earth Collective. Features are under active development.
              The main site at joinnewearthcollective.com will be configured separately.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
