"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { PLAYGROUND_ITEMS } from "~/components/playground/playground-layout";
import { Suspense } from "react";

function PlaygroundPageContent() {
  const items = PLAYGROUND_ITEMS.filter((item) => item.id !== "overview");

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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
                style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
              >
                Component Playground
              </h1>
              <p className="text-sm text-gray-400">
                Interactive UI components and animation effects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              Interactive
            </Badge>
            <Badge className="border-white/20 bg-white/5 text-white">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Animated
            </Badge>
          </div>
        </div>

        {/* Component Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            const colorMap: Record<
              string,
              { gradient: string; border: string; text: string }
            > = {
              amber: {
                gradient: "from-[#facf39] to-[#f59e0b]",
                border: "border-[#facf39]/30",
                text: "#facf39",
              },
              emerald: {
                gradient: "from-[#059669] to-[#10b981]",
                border: "border-[#059669]/30",
                text: "#059669",
              },
              orange: {
                gradient: "from-[#ea580c] to-[#f97316]",
                border: "border-[#ea580c]/30",
                text: "#ea580c",
              },
              blue: {
                gradient: "from-[#0891b2] to-[#06b6d4]",
                border: "border-[#0891b2]/30",
                text: "#0891b2",
              },
              purple: {
                gradient: "from-[#6d28d9] to-[#a855f7]",
                border: "border-[#6d28d9]/30",
                text: "#6d28d9",
              },
              indigo: {
                gradient: "from-[#4338ca] to-[#6366f1]",
                border: "border-[#4338ca]/30",
                text: "#4338ca",
              },
              violet: {
                gradient: "from-[#6d28d9] to-[#7c3aed]",
                border: "border-[#6d28d9]/30",
                text: "#6d28d9",
              },
              pink: {
                gradient: "from-[#db2777] to-[#ec4899]",
                border: "border-[#db2777]/30",
                text: "#db2777",
              },
            };

            const colors = colorMap[item.color] ?? colorMap.violet!;

            return (
              <Link key={item.id} href={item.href}>
                <Card
                  className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}
                >
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-none items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3
                        className="text-xl font-bold text-white"
                        style={{
                          fontFamily: "Airwaves, sans-serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-400">
                      {item.description}
                    </p>
                    <div
                      className="flex items-center gap-2 text-sm font-medium transition-colors"
                      style={{ color: colors.text }}
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundPageContent />
    </Suspense>
  );
}
