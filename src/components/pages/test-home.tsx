"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";
import {
  Zap,
  Code2,
  Rocket,
  ArrowRight,
  Palette,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Mail,
  Users,
  Images,
  Map,
  Database,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TestHomePage() {
  const router = useRouter();
  const [selectedVariation, setSelectedVariation] =
    useState("/dope-ass-landing");
  const [selectedJoinCommunity, setSelectedJoinCommunity] =
    useState("/join-community-1");
  const [selectedLaunchLanding, setSelectedLaunchLanding] =
    useState("/launch-landing-1");

  // Navigate to a path (admin routes use path-based auth, no domain param needed)
  const navigateToPath = (path: string) => {
    router.push(path);
  };

  const landingPageVariations = [
    { name: "Original (Golden)", path: "/dope-ass-landing" },
    { name: "Earth to Sky Gradient", path: "/dope-ass-landing/earth-sky" },
    { name: "Deep Ocean Gradient", path: "/dope-ass-landing/deep-ocean" },
    { name: "Emerald-Teal Gradient", path: "/dope-ass-landing/emerald-teal" },
    { name: "Blue-Cyan Gradient", path: "/dope-ass-landing/blue-cyan" },
    { name: "Emerald", path: "/dope-ass-landing/emerald" },
    { name: "Cosmic Blue", path: "/dope-ass-landing/cosmic-blue" },
    { name: "Teal", path: "/dope-ass-landing/teal" },
    { name: "Forest Green", path: "/dope-ass-landing/forest-green" },
  ];

  const joinCommunityVariations = [
    { name: "Original (Golden)", path: "/join-community-1" },
    { name: "Earth to Sky Gradient", path: "/join-community-1/earth-sky" },
    { name: "Deep Ocean Gradient", path: "/join-community-1/deep-ocean" },
    { name: "Emerald-Teal Gradient", path: "/join-community-1/emerald-teal" },
    { name: "Blue-Cyan Gradient", path: "/join-community-1/blue-cyan" },
    { name: "Emerald", path: "/join-community-1/emerald" },
    { name: "Cosmic Blue", path: "/join-community-1/cosmic-blue" },
    { name: "Teal", path: "/join-community-1/teal" },
    { name: "Forest Green", path: "/join-community-1/forest-green" },
  ];

  const launchLandingVariations = [
    { name: "Original (Golden)", path: "/launch-landing-1" },
    { name: "Earth to Sky Gradient", path: "/launch-landing-1/earth-sky" },
    { name: "Deep Ocean Gradient", path: "/launch-landing-1/deep-ocean" },
    { name: "Emerald-Teal Gradient", path: "/launch-landing-1/emerald-teal" },
    { name: "Blue-Cyan Gradient", path: "/launch-landing-1/blue-cyan" },
    { name: "Emerald", path: "/launch-landing-1/emerald" },
    { name: "Cosmic Blue", path: "/launch-landing-1/cosmic-blue" },
    { name: "Teal", path: "/launch-landing-1/teal" },
    { name: "Forest Green", path: "/launch-landing-1/forest-green" },
  ];

  const features = [
    {
      title: "Brand Assets",
      description: "Visual identity & brand guidelines",
      details:
        "Complete brand asset library including logos, colors, favicons in multiple formats (SVG, PNG, PDF).",
      href: "/admin/brand",
      icon: Palette,
      color: "golden",
      count: "Brand Kit",
    },
    {
      title: "Page Templates",
      description: "Full-page template collection",
      details:
        "Pre-built templates for portfolios, SaaS products, startups, and developer profiles.",
      href: "/admin/templates",
      icon: Rocket,
      color: "emerald",
      count: "4 templates",
    },
    {
      title: "GLSL Shaders",
      description: "WebGL shader animations",
      details:
        "8 interactive shader demonstrations including sacred geometry, fractals, neural networks, and generative art.",
      href: "/admin/shaders",
      icon: Zap,
      color: "cosmic-purple",
      count: "8 shaders",
    },
    {
      title: "Component Playground",
      description: "Interactive UI component demos",
      details:
        "Test and explore animation effects, particle systems, and interactive components in development.",
      href: "/admin/playground",
      icon: Code2,
      color: "cosmic-blue",
      count: "9 demos",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <section className="mb-24 text-center">
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

        {/* Assets Section - MOVED UP */}
        <section className="mb-24 rounded-3xl bg-gradient-to-br from-neutral-50/50 to-white/50 p-8 dark:from-neutral-900/50 dark:to-black/50">
          <h2
            className="mb-10 text-center text-4xl font-bold"
            style={{ fontFamily: "Bourton, sans-serif", color: "#facf39" }}
          >
            Development Assets
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorMap: Record<
                string,
                {
                  gradient: string;
                  border: string;
                  badge: string;
                  text: string;
                }
              > = {
                "cosmic-purple": {
                  gradient: "from-[#6d28d9] to-[#a855f7]",
                  border: "border-[#6d28d9]/20 dark:border-[#6d28d9]/30",
                  badge:
                    "bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#6d28d9]/20 dark:text-[#a855f7]",
                  text: "#6d28d9",
                },
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
                golden: {
                  gradient: "from-[#facf39] to-[#f59e0b]",
                  border: "border-[#facf39]/20 dark:border-[#facf39]/30",
                  badge:
                    "bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20 dark:text-[#facf39]",
                  text: "#facf39",
                },
              };
              const colors = colorMap[feature.color] ?? colorMap.golden!;

              return (
                <Card
                  key={feature.title}
                  onClick={() => navigateToPath(feature.href)}
                  className={`group flex h-full cursor-pointer flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.border}`}
                >
                  <CardHeader className="flex-none">
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle
                      className="text-xl font-bold text-black dark:text-white"
                      style={{
                        fontFamily: "Airwaves, sans-serif",
                        letterSpacing: "0.05em",
                      }}
                    >
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
                      <Badge className={colors.badge}>{feature.count}</Badge>
                      <div
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: colors.text }}
                      >
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-neutral-200 dark:border-neutral-800"></div>

        {/* Live Sites Section */}
        <section className="mb-24">
          <h2
            className="mb-10 text-center text-4xl font-bold"
            style={{ fontFamily: "Bourton, sans-serif", color: "#facf39" }}
          >
            Live Production Sites
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* New Earth Collective Main Site */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <ExternalLink className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Full Ecosystem
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Official New Earth Collective community platform - Join the
                  movement for conscious evolution and regenerative systems.
                </p>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Live
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://joinnewearthcollective.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() =>
                        navigateToPath("/?domain=joinnewearthcollective.com")
                      }
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wear New Earth */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                    <ExternalLink className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Merch
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Conscious fashion and apparel for the New Earth movement -
                  Wear your values, embody the change.
                </p>

                <div className="flex items-center justify-between gap-3">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Live
                  </Badge>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://merch.joinnewearthcollective.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Current</span>
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    <span className="text-neutral-300">|</span>
                    <a
                      href="https://wearnewearth.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Future</span>
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Landing Page */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Users className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Global Landing Page
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Global landing page with sacred geometry background,
                  waitlist form, and event information.
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Launch
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://launch.joinnewearthcollective.com/global"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => window.location.href = "/global?domain=launch.joinnewearthcollective.com"}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boulder Launch Party Page */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Boulder Launch Party
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Boulder, CO community launch event page with details, RSVP, and
                  sacred geometry visuals.
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Launch
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://launch.joinnewearthcollective.com/boulder-launch-party"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => window.location.href = "/boulder-launch-party?domain=launch.joinnewearthcollective.com"}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questionnaire Page */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Mail className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Questionnaire
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Community alignment survey for new members - deep questions
                  about values, intentions, and commitment.
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Launch
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://launch.joinnewearthcollective.com/questionnaire"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => window.location.href = "/questionnaire?domain=launch.joinnewearthcollective.com"}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Page */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Users className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    About
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  About New Earth Collective - mission, vision, values, and
                  the principles that guide our community.
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Main Site
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://joinnewearthcollective.com/about"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => window.location.href = "/about?domain=joinnewearthcollective.com"}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unsubscribe Page */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Mail className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Unsubscribe
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Unsubscribe page for email and SMS opt-out. Accessible via trackable links in communications (GDPR/CAN-SPAM compliant).
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Utility
                  </Badge>
                  <div className="flex gap-3">
                    <a
                      href="https://launch.joinnewearthcollective.com/unsubscribe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Live</span>
                    </a>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => window.location.href = "/unsubscribe?domain=launch.joinnewearthcollective.com"}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "#facf39" }}
                    >
                      <span>Dev</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-neutral-200 dark:border-neutral-800"></div>

        {/* Sites Under Development Section */}
        <section className="mb-24 rounded-3xl bg-gradient-to-br from-neutral-50/50 to-white/50 p-8 dark:from-neutral-900/50 dark:to-black/50">
          <h2
            className="mb-10 text-center text-4xl font-bold"
            style={{ fontFamily: "Bourton, sans-serif", color: "#facf39" }}
          >
            Sites Under Development
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Dope Ass Landing Page with Dropdown */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Dope Ass Landing
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Epic landing page with countdown timer and sacred geometry
                  vibes - now in 9 color variations!
                </p>

                {/* Dropdown to select variation */}
                <div className="mb-3">
                  <label
                    htmlFor="variation-select"
                    className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Color Variation
                  </label>
                  <div className="relative">
                    <select
                      id="variation-select"
                      value={selectedVariation}
                      onChange={(e) => setSelectedVariation(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#facf39]/20 bg-white px-3 py-2 pr-8 text-sm text-black transition-colors hover:border-[#facf39]/40 focus:border-[#facf39] focus:outline-none dark:border-[#facf39]/30 dark:bg-neutral-900 dark:text-white dark:hover:border-[#facf39]/50"
                    >
                      {landingPageVariations.map((variation) => (
                        <option key={variation.path} value={variation.path}>
                          {variation.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-[#facf39]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    9 Variations
                  </Badge>
                  <button
                    onClick={() => navigateToPath(selectedVariation)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#facf39" }}
                  >
                    <span>View Demo</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* JoinCommunity 1 with Dropdown */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#14b8a6] shadow-lg">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Join Community 1
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Full community landing page with waitlist CTA - now in 9 color
                  variations!
                </p>

                {/* Dropdown to select variation */}
                <div className="mb-3">
                  <label
                    htmlFor="join-community-select"
                    className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Color Variation
                  </label>
                  <div className="relative">
                    <select
                      id="join-community-select"
                      value={selectedJoinCommunity}
                      onChange={(e) => setSelectedJoinCommunity(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#facf39]/20 bg-white px-3 py-2 pr-8 text-sm text-black transition-colors hover:border-[#facf39]/40 focus:border-[#facf39] focus:outline-none dark:border-[#facf39]/30 dark:bg-neutral-900 dark:text-white dark:hover:border-[#facf39]/50"
                    >
                      {joinCommunityVariations.map((variation) => (
                        <option key={variation.path} value={variation.path}>
                          {variation.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-[#facf39]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    9 Variations
                  </Badge>
                  <button
                    onClick={() => navigateToPath(selectedJoinCommunity)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#facf39" }}
                  >
                    <span>View Demo</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Launch Landing 1 with Dropdown */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Launch Landing 1
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Event landing page with countdown timer for Dec 20th launch
                  party - 9 color variations!
                </p>

                {/* Dropdown to select variation */}
                <div className="mb-3">
                  <label
                    htmlFor="launch-landing-select"
                    className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Color Variation
                  </label>
                  <div className="relative">
                    <select
                      id="launch-landing-select"
                      value={selectedLaunchLanding}
                      onChange={(e) => setSelectedLaunchLanding(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#facf39]/20 bg-white px-3 py-2 pr-8 text-sm text-black transition-colors hover:border-[#facf39]/40 focus:border-[#facf39] focus:outline-none dark:border-[#facf39]/30 dark:bg-neutral-900 dark:text-white dark:hover:border-[#facf39]/50"
                    >
                      {launchLandingVariations.map((variation) => (
                        <option key={variation.path} value={variation.path}>
                          {variation.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-[#facf39]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    9 Variations
                  </Badge>
                  <button
                    onClick={() => navigateToPath(selectedLaunchLanding)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#facf39" }}
                  >
                    <span>View Demo</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Divider */}
        <div className="my-16 border-t border-neutral-200 dark:border-neutral-800"></div>

        {/* Tools & Utilities Section - CONSOLIDATED */}
        <section className="mb-24">
          <h2
            className="mb-10 text-center text-4xl font-bold"
            style={{ fontFamily: "Bourton, sans-serif", color: "#facf39" }}
          >
            Tools & Utilities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Ecosystem Map */}
            <Card className="group flex h-full flex-col border-2 border-[#facf39]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#facf39]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                    <Map className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ecosystem Map
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Complete site map showing all pages across all domains (joinnewearthcollective.com, launch, test).
                </p>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                    Full Map
                  </Badge>
                  <button
                    onClick={() => navigateToPath("/ecosystem-map")}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#facf39" }}
                  >
                    <span>View Map</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="group flex h-full flex-col border-2 border-[#8b5cf6]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#8b5cf6]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] shadow-lg">
                    <Images className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Photo Gallery
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Rotating carousel of 58 community photos from gatherings and events with smooth animations.
                </p>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#8b5cf6]/10 text-[#8b5cf6] dark:bg-[#8b5cf6]/20">
                    58 Photos
                  </Badge>
                  <button
                    onClick={() => navigateToPath("/gallery-1")}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#8b5cf6" }}
                  >
                    <span>View Gallery</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Form Builder / Email Testing */}
            <Card className="group flex h-full flex-col border-2 border-[#06b6d4]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#06b6d4]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0891b2] to-[#06b6d4] shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Email Testing
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Test automated email sequences: 4 emails in 10 minutes, then 2 more at 24h & 36h intervals.
                </p>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20">
                    Testing
                  </Badge>
                  <button
                    onClick={() => navigateToPath("/admin/form-builder")}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#06b6d4" }}
                  >
                    <span>Test Sequence</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Dashboard */}
            <Card className="group flex h-full flex-col border-2 border-[#f59e0b]/20 transition-all duration-300 hover:shadow-2xl dark:border-[#f59e0b]/30">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-none items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] shadow-lg">
                    <Database className="h-7 w-7 text-black" />
                  </div>
                  <h3
                    className="text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Admin Dashboard
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  View CRM contacts, questionnaire responses, and event waivers. Database overview and intake form submissions.
                </p>

                <div className="flex items-center justify-between">
                  <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] dark:bg-[#f59e0b]/20">
                    Live Data
                  </Badge>
                  <button
                    onClick={() => navigateToPath("/admin/crm")}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "#f59e0b" }}
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
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
                  <h3
                    className="mb-2 text-xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Development Environment
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    This is the development environment for New Earth
                    Collective. Features are under active development.
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
