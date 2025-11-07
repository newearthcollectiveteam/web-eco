"use client";

import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { DomainLayout } from "~/components/domain-layout";
import { ArrowRight, Code2 } from "lucide-react";
import { PLAYGROUND_ITEMS } from "~/components/playground/playground-layout";

export default function PlaygroundPage() {
  // Filter out the overview item
  const items = PLAYGROUND_ITEMS.filter((item) => item.id !== "overview");

  return (
    <DomainLayout>
      <div className="via-background dark:via-background min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent dark:from-violet-400 dark:to-purple-400">
                Component Playground
              </h1>
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Explore interactive UI components and animation effects
            </p>
          </div>

          {/* Component Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;
              const colorMap: Record<
                string,
                { dark: string; gradient: string }
              > = {
                amber: {
                  dark: "#f59e0b",
                  gradient: "from-amber-500 to-amber-600",
                },
                emerald: {
                  dark: "#10b981",
                  gradient: "from-emerald-500 to-emerald-600",
                },
                orange: {
                  dark: "#f97316",
                  gradient: "from-orange-500 to-orange-600",
                },
                blue: {
                  dark: "#3b82f6",
                  gradient: "from-blue-500 to-blue-600",
                },
                purple: {
                  dark: "#8b5cf6",
                  gradient: "from-purple-500 to-purple-600",
                },
                indigo: {
                  dark: "#6366f1",
                  gradient: "from-indigo-500 to-indigo-600",
                },
                violet: {
                  dark: "#7c3aed",
                  gradient: "from-violet-500 to-violet-600",
                },
                pink: {
                  dark: "#ec4899",
                  gradient: "from-pink-500 to-pink-600",
                },
              };

              const colors = colorMap[item.color] ?? colorMap.violet!;

              return (
                <Link key={item.id} href={item.href}>
                  <Card
                    className="group h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      borderColor: colors.dark,
                      borderWidth: "1px",
                    }}
                  >
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colors.gradient}`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                      </div>
                      <p className="text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
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
          <div className="text-muted-foreground pt-16 text-center text-sm">
            <p>
              Interactive component demonstrations - implementations coming soon
            </p>
          </div>
        </div>
      </div>
    </DomainLayout>
  );
}
