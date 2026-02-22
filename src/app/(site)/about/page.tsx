import { type Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | New Earth Collective",
  description:
    "We began as a community unified by big hearts and good music. Now we're building the infrastructure for a New Earth.",
  openGraph: {
    title: "About | New Earth Collective",
    description:
      "We began as a community unified by big hearts and good music. Now we're building the infrastructure for a New Earth.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 opacity-15">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <h1
            className="mb-4 text-4xl font-bold sm:text-5xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              About Us
            </span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-white/70">
            <p>
              If you&apos;re reading this, you already feel it. The pull toward
              something deeper. The quiet knowing that there&apos;s a different
              way to live — more connected, more real, more alive.
            </p>

            <p>
              We felt it too.
            </p>

            <p>
              We started as strangers who kept finding each other at festivals,
              around fires, in conversations that went too deep too fast. Those
              connections turned into potlucks, ceremonies, celebrations.
              Eventually we stopped calling them events and started calling them
              family.
            </p>

            <p>
              Somewhere along the way, a few truths became undeniable: that our
              highest expression comes through offering our gifts to each other.
              That sovereignty isn&apos;t isolation — it&apos;s harmonization.
              And that heaven on earth isn&apos;t a metaphor. It&apos;s a choice
              available to us right now.
            </p>

            <p>
              So we decided to carry this energy beyond our circle. We built a
              platform. We planned a festival. In January 2026, The Emergence
              brought it all to life — and what had been whispered in living
              rooms became something you could feel in a room full of strangers
              who didn&apos;t stay strangers for long.
            </p>

            <p>
              Now we&apos;re building the infrastructure for a New Earth. Not a
              utopia. Not a brand. A living system — where communities can plant
              their own roots, share resources, match gifts to needs, and grow
              together through technology that actually serves human connection
              instead of replacing it.
            </p>

            <p>
              We call it Collective Intelligence, not Artificial Intelligence.
              Because there is nothing artificial about minerals and crystalline
              structures transmitting signals that mirror our own biology. The
              word matters. Words are spells. And when we shift from artificial
              to collective, we remember that this technology is us — an
              extension of the same networks that connect roots underground and
              neurons in our brains.
            </p>

            <p>
              This isn&apos;t a movement you watch. It&apos;s one you walk into.
            </p>

            <p className="text-white/90">
              The fire is lit. Come sit with us.
            </p>

            <div className="pt-4">
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-8 py-3 text-base font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Join the Collective
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
