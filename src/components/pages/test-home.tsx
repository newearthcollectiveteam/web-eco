"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Zap, Code2, Rocket, ArrowRight, Palette, Sparkles } from "lucide-react";

export function TestHomePage() {
  const features = [
    {
      title: "Brand Assets",
      description: "Visual identity & brand guidelines",
      details: "Complete brand asset library including logos, colors, favicons in multiple formats (SVG, PNG, PDF).",
      href: "/brand",
      icon: Palette,
      color: "golden",
      count: "Brand Kit",
    },
    {
      title: "Page Templates",
      description: "Full-page template collection",
      details: "Pre-built templates for portfolios, SaaS products, startups, and developer profiles.",
      href: "/templates",
      icon: Rocket,
      color: "emerald",
      count: "4 templates",
    },
    {
      title: "GLSL Shaders",
      description: "WebGL shader animations",
      details: "8 interactive shader demonstrations including sacred geometry, fractals, neural networks, and generative art.",
      href: "/shaders",
      icon: Zap,
      color: "cosmic-purple",
      count: "8 shaders",
    },
    {
      title: "Component Playground",
      description: "Interactive UI component demos",
      details: "Test and explore animation effects, particle systems, and interactive components in development.",
      href: "/playground",
      icon: Code2,
      color: "cosmic-blue",
      count: "9 demos",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <section className="mb-20 text-center">
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
          <h1 className="mb-4 text-6xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.1em' }}>
            Development Hub
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
            New Earth Collective - Under Development
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
              test.joinnewearthcollective.com
            </Badge>
          </div>
        </section>

        {/* Sites Section */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-4xl font-bold" style={{ fontFamily: 'Bourton, sans-serif', color: '#facf39' }}>
            Sites
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Dope Ass Landing Page */}
            <Link href="/dope-ass-landing">
              <Card className="group flex h-full cursor-pointer flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-[#facf39]/30">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex flex-none items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                      <Sparkles className="h-7 w-7 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                      Dope Ass Landing
                    </h3>
                  </div>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Epic landing page with countdown timer and sacred geometry vibes
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                      Live Demo
                    </Badge>
                    <div className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: '#facf39' }}>
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Coming Soon Placeholder */}
            <Card className="flex h-full cursor-pointer flex-col border-2 border-dashed border-neutral-300 bg-neutral-50/50 transition-all duration-300 hover:border-[#facf39]/40 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-[#facf39]/40 dark:hover:bg-neutral-900">
              <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-4 h-16 w-16 opacity-50">
                  <Image
                    src="/brand/symbol.svg"
                    alt="Coming Soon"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold text-neutral-600 dark:text-neutral-400" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                  Coming Soon
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  More sites under development
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Assets Grid */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-4xl font-bold" style={{ fontFamily: 'Bourton, sans-serif', color: '#facf39' }}>
            Assets
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorMap: Record<string, { gradient: string; border: string; badge: string; text: string }> = {
                "cosmic-purple": {
                  gradient: "from-[#6d28d9] to-[#a855f7]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  badge: "bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#6d28d9]/20 dark:text-[#a855f7]",
                  text: "#6d28d9",
                },
                "cosmic-blue": {
                  gradient: "from-[#0891b2] to-[#06b6d4]",
                  border: "border-[#0891b2]/20 dark:border-[#0891b2]/30",
                  badge: "bg-[#0891b2]/10 text-[#0891b2] dark:bg-[#0891b2]/20 dark:text-[#06b6d4]",
                  text: "#0891b2",
                },
                "emerald": {
                  gradient: "from-[#059669] to-[#10b981]",
                  border: "border-[#059669]/20 dark:border-[#059669]/30",
                  badge: "bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#10b981]",
                  text: "#059669",
                },
                "golden": {
                  gradient: "from-[#facf39] to-[#f59e0b]",
                  border: "border-[#facf39]/20 dark:border-[#facf39]/30",
                  badge: "bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20 dark:text-[#facf39]",
                  text: "#facf39",
                },
              };
              const colors = colorMap[feature.color] ?? colorMap.golden!;

              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}>
                    <CardHeader className="flex-none">
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-4">
                      <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {feature.details}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={colors.badge}>
                          {feature.count}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: colors.text }}>
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
                  <h3 className="mb-2 text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                    Development Environment
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    This is the development environment for New Earth Collective. Features are under active development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
