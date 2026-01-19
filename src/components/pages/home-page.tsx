"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";

// Testimonial videos
const testimonialVideos = [
  {
    id: 1,
    src: "https://www.dropbox.com/scl/fi/z0uri3l0vlku0wfmzolzq/IMG_4545.mov?rlkey=loqjyl84qciewi5smkd91o2jl&st=ytxecyeh&raw=1",
  },
];

// Facilitators list
const facilitators = [
  "Breathwork Practitioners",
  "Meditation Guides",
  "Somatic Practitioners",
  "Nervous System Regulation Specialists",
  "Polarity/Relationship Guides",
  "Yoga Instructors",
  "Medicine Guides/Shamans",
  "Psychics",
  "Sound Healers",
  "Reiki Masters",
  "Bodyworkers",
];

// Creators & Builders list
const creatorsBuilders = [
  "Conscious Community Builders",
  "Conscious Entrepreneurs/Solopreneurs",
  "Sovereigns",
  "Decentralized Tech/Currency Activists",
  "Regenerative Farmers",
  "Land Developers",
  "Permaculture Practitioners",
  "Transformational Festival Organizers",
  "Musicians (DJs, Producers)",
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
            Empowering the Co-Creation of <span className="whitespace-nowrap">Heaven on Earth</span>
          </h2>
          <p className="mx-auto mb-10 max-w-sm md:max-w-2xl text-base md:text-lg text-white/90">
            We host immersive festival experiences to activate heart-led creators and connect them into a living network for ongoing collaboration.
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
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Our Vision
            </span>
          </h2>
          <div className="grid items-stretch gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <p className="mb-6 text-lg leading-relaxed text-white/90">
                A world where people live from the heart and collaborate in service of something greater than themselves.
              </p>
              <p className="mb-3 text-base text-white/80">In service of...</p>
              <ul className="mb-6 space-y-1 ml-4">
                <li className="flex items-center gap-2 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                  Collective Sovereignty
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                  Community Organization
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                  Planetary Stewardship
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                  Regenerative Ecosystems
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                  Conscious Technologies
                </li>
              </ul>
              <p className="text-base leading-relaxed text-white/70">
                We believe true freedom emerges when individual gifts blossom within community—where collective sovereignty grows from the roots of personal empowerment.
              </p>
            </div>

            {/* Video */}
            <div className="overflow-hidden rounded-xl border border-[#f6c43f]/20 bg-black/60 shadow-2xl h-full flex items-center">
              <div className="relative w-full h-full bg-black">
                <video
                  controls
                  className="h-full w-full object-cover"
                  poster="/videos/video-thumbnail.jpg"
                  preload="metadata"
                  playsInline
                >
                  <source
                    src="https://www.dropbox.com/scl/fi/8ihg2dyltoz2rpbtnu5vw/A-New-world_FINAL_V2.mp4?rlkey=ydtn7xu2rqer0tu2n7wudo5xx&st=wjx87r9q&raw=1"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          {/* Centered CTA */}
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="btn-golden px-10 py-6 text-lg"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <Link href="/questionnaire">
                Join the Movement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#111111] border-y border-[#f6c43f]/20 px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-4 text-center text-4xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>
          <p className="mb-12 text-center text-lg text-white/80">
            See some reviews from our first event: The Emergence
          </p>

          {/* Video Carousel */}
          <div className="relative">
            <Carousel opts={{ loop: true }}>
              <CarouselContent>
                {testimonialVideos.map((video) => (
                  <CarouselItem key={video.id}>
                    <div className="overflow-hidden rounded-xl border border-[#f6c43f]/20 bg-black/60">
                      <div className="relative aspect-[9/16] md:aspect-video w-full max-w-2xl mx-auto bg-black">
                        <video
                          controls
                          className="h-full w-full object-contain bg-black"
                          preload="metadata"
                          playsInline
                        >
                          <source src={video.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {testimonialVideos.length > 1 && (
                <>
                  <CarouselPrevious className="bg-[#FACF39]/90 hover:bg-[#FACF39] text-black" />
                  <CarouselNext className="bg-[#FACF39]/90 hover:bg-[#FACF39] text-black" />
                </>
              )}
            </Carousel>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="mb-6 text-xl text-white/90" style={{ fontFamily: "Bourton, sans-serif" }}>
              Want to attend our next event?
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
          <p className="mb-6 text-base text-white/70">
            Bring your whole self—shadows, gifts, and truths. Join us in weaving a tapestry where collective sovereignty is realized through the connection and blossoming of individual gifts.
          </p>
          <p className="mb-10 text-lg text-white/80">
            Feel the call? Fill out our questionnaire to see if we're aligned.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-golden px-10 py-6 text-lg"
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
