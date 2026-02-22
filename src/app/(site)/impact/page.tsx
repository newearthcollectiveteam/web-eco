"use client";

import Link from "next/link";
import { HandHeart, Users, Sparkles, ArrowRight } from "lucide-react";
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
      <section className="relative overflow-hidden pb-16 pt-32">
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

        {/* Hero Content — left aligned */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <h1
            className="mb-4 text-4xl font-bold sm:text-5xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Impact{" "}
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Missions
            </span>
          </h1>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-300">
            Real service. Real connection. Real change. Join your community for
            meaningful volunteer experiences that embody the New Earth values.
          </p>
        </div>
      </section>

      {/* Active Missions */}
      {activeMissions.length > 0 && (
        <section className="relative pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-8 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#FACF39]" />
              <h2
                className="text-2xl font-bold text-white"
                style={{
                  fontFamily: "Bourton, sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                Active Missions
              </h2>
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-0.5 text-xs font-medium text-green-400">
                {activeMissions.length} Available
              </span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {activeMissions.map((mission) => (
                <ImpactOpportunityCard key={mission.href} {...mission} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Missions */}
      {upcomingMissions.length > 0 && (
        <section className="relative pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-8 flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-400" />
              <h2
                className="text-2xl font-bold text-white"
                style={{
                  fontFamily: "Bourton, sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                Coming Soon
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingMissions.map((mission) => (
                <ImpactOpportunityCard key={mission.href} {...mission} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gradient Divider */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
      </div>

      {/* What Are Impact Missions */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <HandHeart className="h-5 w-5 text-[#FACF39]" />
            <h2
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: "Bourton, sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              What Are Impact Missions?
            </h2>
          </div>

          <div className="space-y-4 max-w-2xl text-base leading-relaxed text-white/60">
            <p>
              Impact Missions are organized volunteer experiences where the New
              Earth Collective community comes together to serve. We partner
              with local organizations doing meaningful work and show up as a
              group to make a difference.
            </p>
            <p>
              It&apos;s more than volunteering — it&apos;s{" "}
              <span className="font-semibold text-[#FACF39]">
                service as connection
              </span>
              . You&apos;ll work alongside fellow community members, build real
              relationships, and experience the joy that comes from giving back
              together.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Curated partnerships with impactful organizations",
                "Group volunteer experiences (4–8 hours)",
                "Community connection before, during, and after",
                "A tangible way to live the New Earth values",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#FACF39]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Archived Missions */}
      {archivedMissions.length > 0 && (
        <>
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
          </div>

          <section className="relative py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <details className="group">
                <summary className="mb-8 flex cursor-pointer list-none items-center gap-3">
                  <span
                    className="text-xl font-bold text-neutral-500"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Past Missions
                  </span>
                  <span className="rounded-full border border-neutral-600 bg-neutral-800 px-3 py-0.5 text-xs font-medium text-neutral-400">
                    {archivedMissions.length} Completed
                  </span>
                  <ArrowRight className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-90" />
                </summary>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedMissions.map((mission) => (
                    <ImpactOpportunityCard key={mission.href} {...mission} />
                  ))}
                </div>
              </details>
            </div>
          </section>
        </>
      )}

      {/* Gradient Divider */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
      </div>

      {/* Join CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            className="mb-4 text-2xl font-bold text-white"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            Ready to Serve?
          </h2>
          <p className="mb-8 max-w-xl text-white/60">
            Join the New Earth Collective community to get notified about
            upcoming Impact Missions and connect with fellow change-makers.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-8 py-3 text-base font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            Join the Collective
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
