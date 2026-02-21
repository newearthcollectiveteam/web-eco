import { type Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Pathway | New Earth Collective",
  description:
    "Discover your pathway into the New Earth Collective — from first connection to full collaboration.",
  openGraph: {
    title: "Pathway | New Earth Collective",
    description:
      "Discover your pathway into the New Earth Collective — from first connection to full collaboration.",
    type: "website",
  },
};

export default function PathwayPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
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
          <h1
            className="mb-6 text-5xl font-bold md:text-6xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              The Pathway
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/70">
            Coming Soon — Your journey from first spark to full collaboration.
            Start by joining the collective.
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
        </div>
      </section>
    </div>
  );
}
