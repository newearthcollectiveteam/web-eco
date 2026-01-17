"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

// Facilitators list
const facilitators = [
  "Breathwork practitioners",
  "Meditation guides",
  "Somatic practitioners",
  "Nervous system regulation specialists",
  "Polarity/relationship guides",
  "Yoga instructors",
  "Medicine guides/shamans",
  "Psychics",
  "Sound healers",
  "Reiki masters",
  "Bodyworkers",
];

// Creators & Builders list
const creatorsBuilders = [
  "Conscious entrepreneurs/solopreneurs",
  "Sovereigns",
  "Decentralized tech/currency activists",
  "Regenerative farmers",
  "Land developers",
  "Permaculture practitioners",
  "Conscious festival organizers",
  "Musicians (DJs, producers)",
  "Artists",
  "Polymaths",
];

export function HomePage() {
  return (
    <div className="relative bg-black">
      {/* Shared button styles */}
      <style jsx global>{`
        .btn-golden {
          background: linear-gradient(to right, #f3a51c, #f6c43f, #f6e45b);
          color: #000;
          font-weight: bold;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .btn-golden:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(246, 196, 63, 0.4);
        }
        .value-card {
          border: 1px solid rgba(250, 207, 57, 0.3);
          background: rgba(0, 0, 0, 0.6);
          transition: all 0.3s ease;
        }
        .value-card:hover {
          border-color: rgba(250, 207, 57, 0.6);
          box-shadow: 0 0 20px rgba(250, 207, 57, 0.1);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-20">
          <iframe
            src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-16 text-center">
          <h1
            className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              New Earth Collective
            </span>
          </h1>
          <h2
            className="mb-4 text-2xl font-bold text-white md:text-3xl"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            Building Living Technology Serving <span className="whitespace-nowrap">Collective Sovereignty</span>
          </h2>
          <p className="mx-auto mb-6 max-w-3xl text-lg text-white/90">
            We host immersive festival experiences to activate heart-led creators and connect them into a living network for ongoing collaboration.
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/70">
            Bring your whole self—shadows, gifts, and truths. Join us in weaving a tapestry where collective sovereignty is realized through the connection and blossoming of individual gifts.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-golden px-10 py-6 text-lg"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            <Link href="/questionnaire">
              Join the Collective
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-[#111111] border-y border-[#f6c43f]/20 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div>
              <h2
                className="mb-6 text-4xl font-bold"
                style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
              >
                <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
                  Our Vision
                </span>
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-white/90">
                Heart-centered leaders, connected worldwide, building systems that honor the land and empower human sovereignty.
              </p>
              <p className="mb-8 text-base leading-relaxed text-white/70">
                We believe true freedom emerges when individual gifts blossom within community—where collective sovereignty grows from the roots of personal empowerment.
              </p>
              <Button
                asChild
                className="btn-golden px-8 py-4"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                <Link href="/questionnaire">Join the Movement</Link>
              </Button>
            </div>

            {/* Video */}
            <div className="overflow-hidden rounded-xl border border-[#f6c43f]/20 bg-black/60 shadow-2xl">
              <div className="relative aspect-video w-full bg-black">
                <video
                  controls
                  className="h-full w-full object-contain bg-black"
                  poster="/videos/video-thumbnail.jpg"
                  preload="metadata"
                  playsInline
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                >
                  <source
                    src="/videos/A New Earth_v3.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="bg-[#0A0A0A] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Who We Serve
            </span>
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Facilitators */}
            <div className="value-card rounded-lg p-8">
              <h3
                className="mb-6 text-2xl font-bold text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Facilitators
              </h3>
              <ul className="space-y-2">
                {facilitators.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Creators & Builders */}
            <div className="value-card rounded-lg p-8">
              <h3
                className="mb-6 text-2xl font-bold text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Creators & Builders
              </h3>
              <ul className="space-y-2">
                {creatorsBuilders.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-10 text-center text-white/70">
            A lot of people have been out there just cultivating their own puzzle pieces. We just want to help people put their puzzle pieces together. Whether you're a shaman or a sovereign tech activist, your gifts are essential to the tapestry we weave.
          </p>
        </div>
      </section>

      {/* Final Invitation Section */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 py-24">
        {/* Subtle shader background */}
        <div className="absolute inset-0 opacity-10">
          <iframe
            src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2
            className="mb-6 text-4xl font-bold md:text-5xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Your Gifts Are Needed.
            </span>
          </h2>
          <p className="mb-10 text-lg text-white/80">
            Feel the call? Fill out our questionnaire to see if we're aligned.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-golden px-12 py-6 text-lg"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            <Link href="/questionnaire">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
