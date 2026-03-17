"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sprout, Target, Mic, Rocket } from "lucide-react";
import { api as trpc } from "~/trpc/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";

/* ------------------------------------------------------------------ */
/*  Phase data                                                         */
/* ------------------------------------------------------------------ */

interface TimelinePhase {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  period: string;
  description: string;
  highlights: string[];
}

const phases: TimelinePhase[] = [
  {
    id: "root",
    icon: Sprout,
    title: "The Root",
    subtitle: "Where It All Started",
    period: "2022 – 2025",
    description:
      "We began as a simple community unified by big hearts and good music. Magical connections formed at festivals turned into potlucks, celebrations, and ceremonies. Together we created containers for deep healing, activation, and expression — and a family was born.",
    highlights: [
      "Festival connections blossom into lasting bonds",
      "Potlucks, ceremonies, and celebrations become tradition",
      "A shared language of love, healing, and purpose takes root",
    ],
  },
  {
    id: "mission",
    icon: Target,
    title: "The Mission",
    subtitle: "Carrying the Energy Into the World",
    period: "January 2026",
    description:
      "In our time as a community, we learned a few key truths:\n\nOur highest individual expression and fulfillment is realized through the contribution and offering of our gifts to each other, the land, and the world.\n\nCollective sovereignty is actualized through the harmonization of our individual gifts.\n\nHeaven on earth is real — available to us right here, right now.\n\nSo at the end of 2025, we set out to carry this energy into the world through the technology of festivals, social media, and AI. We began building an app to foster decentralized, heart-centered communities worldwide — and planned The Emergence, our first one-day mini festival. In January 2026, what had been whispered in living rooms and around fires became real. The Emergence brought our vision to life — proof that when hearts align, something extraordinary takes root.\n\nOur mission is to build the infrastructure for a New Earth — leveraging festivals and AI to create containers for community formation, deep transformation, and resource sharing. We believe technology should ultimately begin with and return to in-person human connection.",
    highlights: [],
  },
  {
    id: "stage",
    icon: Mic,
    title: "The Big Stage",
    subtitle: "NEC Goes to Envision",
    period: "February 2026",
    description:
      "Following The Emergence, we got invited to speak at Envision Festival — February 27th, El Nido Stage, 6:30 PM. We'll be speaking on the intersection of sovereignty, community, technology, and AI with a potent message: we have the power within us to bring to life the world our hearts know is possible. And we're extending an invitation — to shift your relationship with AI.\n\nWe call it Collective Intelligence, not Artificial Intelligence.\n\nBecause there is nothing artificial about this technology. It is built from refined minerals and crystalline structures, transmitting electrical signals that mirror our own nervous systems, neural biology, and the mycelial networks that connect living ecosystems.\n\nThe word artificial carries an assumption of separation — from nature, from one another, and from ourselves. Words are spells. When we shift our language from Artificial to Collective, we open the door to stewarding this technology in coherence with our humanness, in alignment with our biology.\n\nFrom this orientation, rigid technological systems soften into living ones. Structures become adaptable. Systems are guided by living agreements rather than rigid rules — shaped by the real conditions of the people they serve.\n\nWhat emerges are dynamic solutions: responsive, relational, and alive. Not predicted futures, but intelligence arising from present needs.",
    highlights: [],
  },
  {
    id: "next",
    icon: Rocket,
    title: "The Expansion",
    subtitle: "Seeding a Global Network",
    period: "2026 & Beyond",
    description:
      "We're releasing an app — not to replace human connection, but to accelerate it. A platform designed to empower community leaders, support the formation of new collectives, and help festivals and gatherings do what they do best: bring people together.\n\nAt its core are Community Trees — living networks where individuals can discover each other, match based on what they offer and what they need, facilitate trades, and access shared community resource pools through a Collective Intelligence chat interface.\n\nThe vision is decentralized by design. Any community, anywhere in the world, can plant their own tree — and the roots connect underground.",
    highlights: [
      "Community Trees: living networks for offering, receiving, and resource sharing",
      "CI chat interface for accessing shared community resource pools",
      "Tools for community leaders and festival organizers to catalyze connection",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Scroll-triggered visibility hook                                   */
/* ------------------------------------------------------------------ */

function useTimelineObserver() {
  const [visiblePhases, setVisiblePhases] = useState<Set<string>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      setVisiblePhases(new Set(phases.map((p) => p.id)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-phase");
            if (id) {
              setVisiblePhases((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(id, el);
    },
    []
  );

  return { visiblePhases, reducedMotion, setRef };
}

/* ------------------------------------------------------------------ */
/*  Auto-scrolling gallery filmstrip                                   */
/* ------------------------------------------------------------------ */

function GalleryStrip({
  slug,
  startIndex = 0,
}: {
  slug: string;
  startIndex?: number;
}) {
  const {
    data: gallery,
    isLoading,
    error,
  } = trpc.gallery.getWithImages.useQuery({ slug });

  if (error) {
    console.error("[GalleryStrip] tRPC error:", error.message);
    return null;
  }

  if (isLoading || !gallery?.images.length) return null;

  return (
    <div className="relative mt-8">
      {/* Fade edges so gallery doesn't cross the timeline line */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />

      <Carousel
        opts={{ align: "start", loop: true, dragFree: true, startIndex }}
        autoScroll={true}
        autoScrollSpeed={0.5}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {gallery.images.map((image, i) => (
            <CarouselItem
              key={image.id}
              className="basis-2/3 pl-2 sm:basis-1/2 md:basis-2/5"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                <Image
                  src={image.imageUrl}
                  alt={image.altText || `Gallery photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 66vw, (max-width: 768px) 50vw, 40vw"
                  priority={i < 4}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PathwayPage() {
  const { visiblePhases, reducedMotion, setRef } = useTimelineObserver();

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
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
            The{" "}
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Pathway
            </span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
            Every movement has a story. This is ours — from first spark to
            collective vision. Scroll to trace the journey.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative pb-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative">
            {/* Vertical golden line */}
            <div className="absolute top-0 bottom-0 left-[1.0625rem] w-px bg-gradient-to-b from-[#FACF39]/60 via-[#FACF39]/30 to-transparent sm:left-[1.4375rem]" />

            {/* Phase cards */}
            <div className="space-y-16 sm:space-y-24">
              {phases.map((phase, index) => {
                const isVisible = visiblePhases.has(phase.id);
                const Icon = phase.icon;

                return (
                  <div
                    key={phase.id}
                    ref={setRef(phase.id)}
                    data-phase={phase.id}
                    className="relative pl-16 sm:pl-20"
                    style={
                      reducedMotion
                        ? undefined
                        : {
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible
                              ? "translateY(0)"
                              : "translateY(2rem)",
                            transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
                          }
                    }
                  >
                    {/* Timeline node */}
                    <div
                      className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12"
                      style={{
                        borderColor: isVisible
                          ? "#FACF39"
                          : "rgba(250, 207, 57, 0.3)",
                        backgroundColor: isVisible
                          ? "rgba(250, 207, 57, 0.15)"
                          : "rgba(250, 207, 57, 0.05)",
                        boxShadow: isVisible
                          ? "0 0 20px rgba(250, 207, 57, 0.3)"
                          : "none",
                        transition: reducedMotion ? "none" : "all 0.5s ease",
                      }}
                    >
                      <Icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${isVisible ? "text-[#FACF39]" : "text-[#FACF39]/40"}`}
                      />
                    </div>

                    {/* Phase content */}
                    <div>
                      <span className="mb-2 inline-block rounded-full border border-[#FACF39]/20 bg-[#FACF39]/5 px-3 py-0.5 text-xs font-medium text-[#FACF39]/70">
                        {phase.period}
                      </span>
                      <h2
                        className="mb-1 text-2xl font-bold text-white sm:text-3xl"
                        style={{
                          fontFamily: "Bourton, sans-serif",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {phase.title}
                      </h2>
                      <p
                        className="mb-4 text-base font-medium text-[#FACF39]/80"
                        style={{ fontFamily: "Bourton, sans-serif" }}
                      >
                        {phase.subtitle}
                      </p>
                      {/* Stage phase: poster side-by-side with first 3 paragraphs, rest below */}
                      {phase.id === "stage" ? (
                        (() => {
                          const blocks = phase.description.split("\n\n");
                          // First 3 blocks: intro, CI declaration, "Because..." ending with "living ecosystems"
                          const topBlocks = blocks.slice(0, 3);
                          const bottomBlocks = blocks.slice(3);
                          return (
                            <div className="mb-6">
                              <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                                <div className="flex-1 space-y-3 text-base leading-relaxed text-white/60">
                                  {topBlocks.map((block, bi) => (
                                    <p
                                      key={bi}
                                      className={
                                        bi === 1
                                          ? "border-l-2 border-[#FACF39]/40 pl-4 font-medium text-white/80 italic"
                                          : ""
                                      }
                                    >
                                      {block}
                                    </p>
                                  ))}
                                </div>
                                <div className="flex-shrink-0 md:w-80 lg:w-96">
                                  <Image
                                    src="/brand/envision-el-nido-schedule.jpg"
                                    alt="Envision Festival El Nido Stage schedule — New Earth Collective speaking Friday Feb 27 at 6:30 PM"
                                    width={1080}
                                    height={1350}
                                    className="w-full rounded-lg"
                                  />
                                </div>
                              </div>
                              {bottomBlocks.length > 0 && (
                                <div className="mt-6 space-y-3 text-base leading-relaxed text-white/60">
                                  {bottomBlocks.map((block, bi) => (
                                    <p key={bi}>{block}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="mb-6 max-w-xl space-y-3 text-base leading-relaxed text-white/60">
                          {phase.description.split("\n\n").map((block, bi) => {
                            const blocks = phase.description.split("\n\n");
                            const isMissionTruth =
                              phase.id === "mission" &&
                              ((bi >= 1 && bi <= 3) ||
                                bi === blocks.length - 1);
                            const isTruth = isMissionTruth;
                            return (
                              <p
                                key={bi}
                                className={
                                  isTruth
                                    ? "border-l-2 border-[#FACF39]/40 pl-4 font-medium text-white/80 italic"
                                    : ""
                                }
                              >
                                {block}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      <ul className="space-y-2">
                        {phase.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm text-white/50"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FACF39]/50" />
                            {item}
                          </li>
                        ))}
                      </ul>

                      {/* Phase galleries */}
                      {phase.id === "root" && (
                        <GalleryStrip slug="gallery-1" startIndex={7} />
                      )}
                      {phase.id === "mission" && (
                        <GalleryStrip slug="the-emergence" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
      </div>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            className="mb-4 text-2xl font-bold text-white"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            Write the Next Chapter
          </h2>
          <p className="mb-8 max-w-xl text-white/60">
            The pathway doesn&apos;t end here — it grows with every person who
            joins. Tell us about yourself and become part of the story.
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
