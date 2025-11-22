"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

// GLSL Shader showcase items
const SHADERS = [
  {
    id: "north-star",
    title: "North Star",
    description: "Golden guiding beacon with radiant rays and pulsing energy",
    color: "golden",
    href: "/shaders/north-star",
  },
  {
    id: "neural-net",
    title: "Neural Network",
    description: "Mesmerizing interconnected nodes pulsing with consciousness",
    color: "cosmic-blue",
    href: "/shaders/neural-net",
  },
  {
    id: "flower-of-life",
    title: "Flower of Life",
    description: "Sacred geometry with glowing circles and mystical energy",
    color: "cosmic-pink",
    href: "/shaders/flower-of-life",
  },
  {
    id: "fractal-pyramid",
    title: "Fractal Pyramid",
    description: "Raymarched fractal geometry with rotating transformations",
    color: "cosmic-purple",
    href: "/shaders/fractal-pyramid",
  },
  {
    id: "the-way",
    title: "The Way",
    description:
      "A journey through flowing light, spiraling paths, and infinite consciousness",
    color: "deep-indigo",
    href: "/shaders/the-way",
  },
  {
    id: "metatrons-cube",
    title: "Metatron's Cube",
    description:
      "Sacred geometry containing all five Platonic solids and the blueprint of creation",
    color: "emerald",
    href: "/shaders/metatrons-cube",
  },
  {
    id: "icosahedron",
    title: "Icosahedron",
    description:
      "Floating 3D Platonic solid with 20 triangular faces, rotating in space",
    color: "sunset-orange",
    href: "/shaders/icosahedron",
  },
];

export default function ShadersPage() {
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
            <h1
              className="mb-4 text-6xl font-bold text-black dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              GLSL Shaders
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
              Explore beautiful WebGL shader animations powered by GLSL in
              Shadertoy format
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="border-[#facf39]/40 bg-[#facf39]/10 text-[#facf39]">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                WebGL Powered
              </Badge>
              <Badge className="border-black/20 bg-black/5 text-black dark:border-white/20 dark:bg-white/5 dark:text-white">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Real-time
              </Badge>
            </div>
          </div>

          {/* Shader Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SHADERS.map((shader) => {
              // Color mappings for borders
              const colorMap: Record<
                string,
                { gradient: string; border: string; text: string }
              > = {
                golden: {
                  gradient: "from-[#facf39] to-[#f59e0b]",
                  border: "border-[#facf39]/20 dark:border-[#facf39]/30",
                  text: "#facf39",
                },
                "cosmic-blue": {
                  gradient: "from-[#0891b2] to-[#06b6d4]",
                  border: "border-[#0891b2]/20 dark:border-[#0891b2]/30",
                  text: "#0891b2",
                },
                "cosmic-pink": {
                  gradient: "from-[#db2777] to-[#ec4899]",
                  border: "border-[#db2777]/20 dark:border-[#db2777]/30",
                  text: "#db2777",
                },
                "cosmic-purple": {
                  gradient: "from-[#6d28d9] to-[#a855f7]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  text: "#6d28d9",
                },
                "deep-indigo": {
                  gradient: "from-[#4338ca] to-[#6366f1]",
                  border: "border-[#4338ca]/20 dark:border-[#4338ca]/30",
                  text: "#4338ca",
                },
                emerald: {
                  gradient: "from-[#059669] to-[#10b981]",
                  border: "border-[#059669]/20 dark:border-[#059669]/30",
                  text: "#059669",
                },
                "sunset-orange": {
                  gradient: "from-[#ea580c] to-[#f97316]",
                  border: "border-[#ea580c]/20 dark:border-[#ea580c]/30",
                  text: "#ea580c",
                },
              };

              const colors =
                colorMap[shader.color] ?? colorMap["cosmic-purple"]!;

              return (
                <Link key={shader.id} href={shader.href}>
                  <Card
                    className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}
                  >
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-none items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
                        >
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <h3
                          className="text-xl font-bold text-black dark:text-white"
                          style={{
                            fontFamily: "Airwaves, sans-serif",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {shader.title}
                        </h3>
                      </div>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {shader.description}
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
                  <h3
                    className="mb-2 text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    About These Shaders
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Interactive GLSL shader animations rendered in real-time
                    using WebGL technology.
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
