"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { PLAYGROUND_ITEMS } from "~/components/playground/playground-layout";

export default function PlaygroundPage() {
  // Filter out the overview item
  const items = PLAYGROUND_ITEMS.filter((item) => item.id !== "overview");

  return (
    <DomainLayout>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-20 text-center">
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
              Component Playground
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
              Explore interactive UI components and animation effects
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
                <Code2 className="mr-1.5 h-3.5 w-3.5" />
                Interactive
              </Badge>
              <Badge className="border-black/20 bg-black/5 text-black dark:border-white/20 dark:bg-white/5 dark:text-white">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Animated
              </Badge>
            </div>
          </div>

          {/* Component Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;
              const colorMap: Record<
                string,
                { gradient: string; border: string; text: string }
              > = {
                amber: {
                  gradient: "from-[#facf39] to-[#f59e0b]",
                  border: "border-[#facf39]/20 dark:border-[#facf39]/30",
                  text: "#facf39",
                },
                emerald: {
                  gradient: "from-[#059669] to-[#10b981]",
                  border: "border-[#059669]/20 dark:border-[#059669]/30",
                  text: "#059669",
                },
                orange: {
                  gradient: "from-[#ea580c] to-[#f97316]",
                  border: "border-[#ea580c]/20 dark:border-[#ea580c]/30",
                  text: "#ea580c",
                },
                blue: {
                  gradient: "from-[#0891b2] to-[#06b6d4]",
                  border: "border-[#0891b2]/20 dark:border-[#0891b2]/30",
                  text: "#0891b2",
                },
                purple: {
                  gradient: "from-[#6d28d9] to-[#a855f7]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  text: "#6d28d9",
                },
                indigo: {
                  gradient: "from-[#4338ca] to-[#6366f1]",
                  border: "border-[#4338ca]/20 dark:border-[#4338ca]/30",
                  text: "#4338ca",
                },
                violet: {
                  gradient: "from-[#6d28d9] to-[#7c3aed]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  text: "#6d28d9",
                },
                pink: {
                  gradient: "from-[#db2777] to-[#ec4899]",
                  border: "border-[#db2777]/20 dark:border-[#db2777]/30",
                  text: "#db2777",
                },
              };

              const colors = colorMap[item.color] ?? colorMap.violet!;

              return (
                <Link key={item.id} href={item.href}>
                  <Card className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}>
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-none items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}>
                          {item.name}
                        </h3>
                      </div>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: colors.text }}>
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Footer Note */}
          <Card className="mx-auto mt-16 max-w-3xl border-2 border-[#facf39]/20 bg-gradient-to-br from-white to-neutral-50 shadow-lg dark:from-neutral-900 dark:to-black">
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
                    Component Library
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Interactive component demonstrations showcasing animation effects and UI patterns.
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
