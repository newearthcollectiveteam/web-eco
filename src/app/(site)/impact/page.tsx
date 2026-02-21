"use client";

import Link from "next/link";
import { HandHeart, Users, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ImpactOpportunityCard } from "~/components/impact/impact-opportunity-card";

// Active missions
const activeMissions = [
  {
    title: "Joy's Kitchen Denver",
    partnerName: "Joy's Kitchen",
    partnerLogo: "/brand/partners/joys-kitchen-logo.png",
    location: "Denver, Colorado",
    description:
      "Serve Colorado families in need by volunteering at Joy's Kitchen. Join us for a day of meaningful service and community connection.",
    status: "active" as const,
    href: "/impact/joyskitchen",
  },
];

// Coming soon / future missions (placeholder for expansion)
const upcomingMissions: typeof activeMissions = [];

// Archived/completed missions
const archivedMissions: typeof activeMissions = [];

export default function ImpactPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-15">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-24 text-center">
          <div className="mb-6">
            <Badge className="border-[#facf39]/30 bg-[#facf39]/10 text-[#facf39]">
              <HandHeart className="mr-1.5 h-3.5 w-3.5" />
              Serve With Us
            </Badge>
          </div>

          <h1
            className="mb-6 text-5xl leading-tight font-bold md:text-6xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Impact Missions
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-300 md:text-2xl">
            Real service. Real connection. Real change.
            <br />
            <span className="text-neutral-400">
              Join your community for meaningful volunteer experiences.
            </span>
          </p>
        </div>
      </section>

      <div className="px-4 pb-16">
        <div className="container mx-auto max-w-6xl">
          {/* Active Missions Section */}
          {activeMissions.length > 0 && (
            <section className="mb-20 pt-16">
              <div className="mb-8 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[#facf39]" />
                <h2
                  className="text-2xl font-bold text-white md:text-3xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Active Missions
                </h2>
                <Badge className="border-green-500/30 bg-green-500/10 text-green-400">
                  {activeMissions.length} Available
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeMissions.map((mission) => (
                  <ImpactOpportunityCard key={mission.href} {...mission} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Missions Section */}
          {upcomingMissions.length > 0 && (
            <section className="mb-20">
              <div className="mb-8 flex items-center gap-3">
                <Users className="h-6 w-6 text-amber-400" />
                <h2
                  className="text-2xl font-bold text-white md:text-3xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Coming Soon
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingMissions.map((mission) => (
                  <ImpactOpportunityCard key={mission.href} {...mission} />
                ))}
              </div>
            </section>
          )}

          {/* What Are Impact Missions Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="mb-6 flex items-start gap-3">
                  <HandHeart className="mt-1 h-6 w-6 shrink-0 text-[#facf39] sm:h-8 sm:w-8" />
                  <h2
                    className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    What Are Impact Missions?
                  </h2>
                </div>
                <div className="space-y-4 text-lg leading-relaxed text-neutral-300">
                  <p>
                    Impact Missions are organized volunteer experiences where
                    the New Earth Collective community comes together to serve.
                    We partner with local organizations doing meaningful work
                    and show up as a group to make a difference.
                  </p>
                  <p>
                    It&apos;s more than volunteering—it&apos;s{" "}
                    <span className="font-bold text-[#facf39]">
                      service as connection
                    </span>
                    . You&apos;ll work alongside fellow community members, build
                    real relationships, and experience the joy that comes from
                    giving back together.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Curated partnerships with impactful organizations",
                      "Group volunteer experiences (4-8 hours)",
                      "Community connection before, during, and after",
                      "A tangible way to live the New Earth values",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Archived Missions Section */}
          {archivedMissions.length > 0 && (
            <section className="mb-20">
              <details className="group">
                <summary className="mb-6 flex cursor-pointer list-none items-center gap-3">
                  <span
                    className="text-xl font-bold text-neutral-500"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Past Missions
                  </span>
                  <Badge className="border-neutral-600 bg-neutral-800 text-neutral-400">
                    {archivedMissions.length} Completed
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-90" />
                </summary>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {archivedMissions.map((mission) => (
                    <ImpactOpportunityCard key={mission.href} {...mission} />
                  ))}
                </div>
              </details>
            </section>
          )}

          {/* Join CTA Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/40 bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 text-center md:p-12">
                <h2
                  className="mb-4 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Ready to Serve?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-200">
                  Join the New Earth Collective community to get notified about
                  upcoming Impact Missions and connect with fellow
                  change-makers.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-10 py-6 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  <Link href="/questionnaire">
                    Join the Collective
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
