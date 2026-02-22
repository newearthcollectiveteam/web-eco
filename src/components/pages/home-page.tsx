"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Play, Quote, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { assetUrl } from "~/lib/storage";

// --- Gradient Divider ---

function GradientDivider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(to right, transparent, rgba(250, 207, 57, 0.4), transparent)",
      }}
    />
  );
}

// --- Testimonial data ---

type WrittenTestimonial = {
  type: "written";
  name: string;
  quote: string;
  role?: string;
};

type VideoTestimonial = {
  type: "video";
  name: string;
  src: string;
  poster: string;
};

type Testimonial = WrittenTestimonial | VideoTestimonial;

const testimonials: Testimonial[] = [
  // Written testimonials — ordered by impact
  {
    type: "written",
    name: "Flo Bullock",
    quote:
      "It's really amazing to see human beings coming together — not just for an experience, but to connect, to co-create, to be held in a container with their gifts and their visions. The systems we've been indoctrinated into no longer serve us. Coming back to nature, coming back to tribe, rooting ourselves in our own sovereignty — and seeing what can be born from that.",
    role: "Attendee",
  },
  {
    type: "written",
    name: "Matt Mullan",
    quote:
      "This community has so many different types of people from so many different life experiences, skills, and specialties. Whatever avenue you're looking to pursue as an individual, you can find something that fits and fuels that. There's so much love shared between everyone, so much integrity, and such beautiful visions for a beautiful earth.",
    role: "Attendee",
  },
  {
    type: "written",
    name: "Neptune",
    quote:
      "The Emergence was a surprise — I had no idea what to expect, but it was a beautiful venue and I connected with a lot of beautiful individuals. I felt immediately synchronized with everyone there. I really enjoyed getting to peer into the vision that is New Earth Collective, and I look forward to working with you as we navigate this new possibility.",
    role: "Attendee",
  },
  {
    type: "written",
    name: "Christian",
    quote:
      "My favorite part was the community feeling. All the activities — the acro yoga, the authentic relating workshops — everything was stimulating to community. This aligned perfectly with what I was already envisioning — working on how to create an eco village. It felt like the next clear sign on my path.",
    role: "Attendee",
  },
  {
    type: "written",
    name: "Cody Perau",
    quote:
      "I'm excited to join a community where the emphasis is on what gifts you have and what things you can share. The New Earth is a philosophy we can embrace to live in better balance with the Earth, while also embracing what we've learned over the past hundreds and thousands of years about humanity — a fusion of ancient philosophy with modern technological advancements.",
    role: "Audio Technician",
  },
  {
    type: "written",
    name: "PJ Bullock",
    quote:
      "Just got back from the first event for the New Earth Collective and it was inspiring. Just love seeing so many people coming together to share their gifts and to think on how we can best use each other's experiences to improve the world.",
    role: "Attendee",
  },
  // Video testimonials
  {
    type: "video",
    name: "Testimonial 1",
    src: assetUrl("videos/testimonials/testimonial-1.mp4"),
    poster: assetUrl("videos/testimonials/poster-1.jpg") + "?v=2",
  },
  {
    type: "video",
    name: "Testimonial 2",
    src: assetUrl("videos/testimonials/testimonial-2.mp4"),
    poster: assetUrl("videos/testimonials/poster-2.jpg") + "?v=2",
  },
  {
    type: "video",
    name: "Jeff",
    src: assetUrl("videos/testimonials/testimonial-3.mp4"),
    poster: assetUrl("videos/testimonials/poster-3.jpg") + "?v=3",
  },
];

const writtenTestimonials = testimonials.filter(
  (t): t is WrittenTestimonial => t.type === "written"
);
const videoTestimonials = testimonials.filter(
  (t): t is VideoTestimonial => t.type === "video"
);

// --- FAQ data ---

const faqItems = [
  {
    question: "What is New Earth Collective?",
    answer:
      "New Earth Collective is a community of heart-led creators, facilitators, and visionaries building a regenerative future together. We host immersive festival experiences, volunteer missions, and ongoing collaboration to activate individual gifts in service of collective sovereignty.",
  },
  {
    question: "Who is this for?",
    answer:
      "If you feel called to live from the heart and collaborate in service of something greater than yourself, this is for you. We welcome conscious entrepreneurs, healers, artists, builders, activists, and anyone drawn to co-creating a new paradigm.",
  },
  {
    question: "What happens at your events?",
    answer:
      "Our events blend immersive workshops, authentic relating, breathwork, sound healing, music, art, and community building. They are containers for deep connection, personal transformation, and collaborative visioning — not just festivals, but catalysts for lasting change.",
  },
{
    question: "How do I get involved?",
    answer:
      "Start by filling out our questionnaire — it helps us understand your gifts and how you'd like to contribute. From there, you'll be connected with community members, invited to events, and plugged into collaboration opportunities.",
  },
];

// --- LazyVideo: poster + play button, loads <video> on click ---

// Module-level ref so only one video plays at a time.
// pauseCurrentVideo is called by the carousel on slide change.
let currentPlayingVideo: HTMLVideoElement | null = null;

function pauseCurrentVideo() {
  if (currentPlayingVideo) {
    currentPlayingVideo.pause();
    currentPlayingVideo = null;
  }
}

function LazyVideo({ src, poster }: { src: string; poster: string }) {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = useCallback(() => {
    // Pause any other playing video
    if (currentPlayingVideo) {
      currentPlayingVideo.pause();
    }
    setActive(true);
    requestAnimationFrame(() => {
      if (videoRef.current) {
        currentPlayingVideo = videoRef.current;
        void videoRef.current.play();
      }
    });
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {!active ? (
        <button
          onClick={handlePlay}
          className="group relative cursor-pointer"
          aria-label="Play video testimonial"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt="Video testimonial thumbnail"
            className="max-h-[70vh] w-auto rounded-lg"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FACF39] shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 text-black" fill="currentColor" />
            </div>
          </div>
        </button>
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={poster}
          className="max-h-[70vh] w-auto rounded-lg"
          onPlay={() => {
            if (currentPlayingVideo && currentPlayingVideo !== videoRef.current) {
              currentPlayingVideo.pause();
            }
            currentPlayingVideo = videoRef.current;
          }}
          onPause={() => {
            if (currentPlayingVideo === videoRef.current) {
              currentPlayingVideo = null;
            }
          }}
          onEnded={() => {
            if (currentPlayingVideo === videoRef.current) {
              currentPlayingVideo = null;
            }
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Pause playing video whenever carousel slide changes
  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", pauseCurrentVideo);
    return () => {
      carouselApi.off("select", pauseCurrentVideo);
    };
  }, [carouselApi]);

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
        @media (prefers-reduced-motion: reduce) {
          .btn-golden:hover {
            transform: none;
          }
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

      {/* ========== 1. Hero Section ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-30">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Green tint overlay */}
        <div className="absolute inset-0 bg-emerald-900/25 mix-blend-overlay" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-16 text-center">
          <h1
            className="animate-in fade-in fill-mode-both mb-6 text-5xl leading-tight font-bold duration-700 md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              New Earth Collective
            </span>
          </h1>
          <h2
            className="animate-in fade-in fill-mode-both mb-4 text-2xl font-bold text-white delay-150 duration-700 md:text-3xl"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            Empowering the Co-Creation of{" "}
            <span className="whitespace-nowrap">Heaven on Earth</span>
          </h2>
          <p className="animate-in fade-in fill-mode-both mx-auto mb-4 max-w-sm text-base text-white/90 delay-300 duration-700 md:max-w-2xl md:text-lg">
            We host immersive festival experiences to activate heart-led
            creators and connect them into a living network for ongoing
            collaboration.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-10 delay-700 duration-700">
            <Button
              asChild
              size="lg"
              className="btn-golden px-8 py-5 text-lg sm:px-10 sm:py-6"
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

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 2. Vision Section ========== */}
      <section className="bg-[#111111] px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Our Vision
            </span>
          </h2>
          <div className="grid items-stretch gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <p className="mb-6 text-lg leading-relaxed text-white/90">
                A world where people live from the heart and collaborate in
                service of something greater than themselves.
              </p>
              <p className="mb-3 text-base text-white/80">In service of...</p>
              <ul className="mb-6 ml-4 space-y-1">
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
                We believe true freedom emerges when individual gifts blossom
                within community—where collective sovereignty grows from the
                roots of personal empowerment.
              </p>
            </div>

            {/* Video */}
            <div className="flex h-full items-center overflow-hidden rounded-xl border border-[#f6c43f]/20 bg-black/60 shadow-2xl">
              <div className="relative h-full w-full bg-black">
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
              className="btn-golden px-8 py-5 text-lg sm:px-10 sm:py-6"
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

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 3. Upcoming Section ========== */}
      <section className="bg-[#0A0A0A] px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Upcoming
            </span>
          </h2>
          <div className="value-card overflow-hidden rounded-lg">
            {/* Poster */}
            <div className="relative w-full">
              <Image
                src="/brand/envision-el-nido-schedule.jpg"
                alt="Envision Festival El Nido Stage schedule — New Earth Collective speaking Friday Feb 27 at 6:30 PM"
                width={1080}
                height={1350}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Details */}
            <div className="p-8 sm:p-10 text-center">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#FACF39]" />
              <h3
                className="mb-2 text-3xl font-bold text-[#FACF39] sm:text-4xl"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                We&apos;re Speaking at Envision
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-white/80">
                New Earth Collective is taking the stage at Envision Festival in Costa Rica. Join us as we share our vision for conscious community, collective sovereignty, and the new paradigm.
              </p>
              <div className="mb-8 flex flex-col items-center gap-3 text-sm text-white/60 sm:flex-row sm:justify-center sm:gap-6">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#FACF39]/70" />
                  Friday, Feb 27 &middot; 6:30 PM
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FACF39]/70" />
                  El Nido Stage &middot; Uvita, Costa Rica
                </span>
              </div>
              <Button
                asChild
                className="btn-golden px-8 py-3 text-lg"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                <a
                  href="https://envisionfestival.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 4. Who We Serve Section ========== */}
      <section className="bg-[#111111] px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
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
                  <li
                    key={item}
                    className="flex items-center gap-2 text-white/80"
                  >
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
                  <li
                    key={item}
                    className="flex items-center gap-2 text-white/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FACF39]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 5. Testimonials Section ========== */}
      <section className="bg-[#0A0A0A] px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-4 text-center text-4xl font-bold"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>
          <p className="mb-12 text-center text-lg text-white/80">
            Hear from attendees of our first event:{" "}
            <br className="sm:hidden" />
            The Emergence
          </p>

          {/* Video Testimonial Carousel */}
          {videoTestimonials.length > 0 && (
            <div className="relative mx-auto mb-16 max-w-3xl">
              <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
                <CarouselContent>
                  {videoTestimonials.map((video) => (
                    <CarouselItem
                      key={video.name}
                      className="flex items-center justify-center"
                    >
                      <LazyVideo src={video.src} poster={video.poster} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {videoTestimonials.length > 1 && (
                  <>
                    <CarouselPrevious className="bg-[#FACF39]/90 text-black hover:bg-[#FACF39]" />
                    <CarouselNext className="bg-[#FACF39]/90 text-black hover:bg-[#FACF39]" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {/* Written Testimonials — auto-scrolling carousel */}
          {writtenTestimonials.length > 0 && (
            <div className="mb-0">
              <Carousel
                opts={{ loop: true, align: "start", dragFree: true }}
                autoScroll
                autoScrollSpeed={0.5}
              >
                <CarouselContent className="-ml-4 pr-4">
                  {writtenTestimonials.map((t) => (
                    <CarouselItem
                      key={t.name + t.quote.slice(0, 20)}
                      className="basis-[85%] pl-4 sm:basis-[60%] lg:basis-[38%]"
                    >
                      <div className="value-card h-full rounded-lg p-6">
                        <Quote className="mb-3 h-6 w-6 text-[#FACF39]/40" />
                        <p className="mb-4 leading-relaxed text-white/85 italic">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <p className="text-sm text-[#FACF39]">
                          &mdash; {t.name}
                          {t.role ? `, ${t.role}` : ""}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p
              className="mb-6 text-xl text-white/90"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              Want to attend our next event?
            </p>
            <Button
              asChild
              size="lg"
              className="btn-golden px-8 py-5 text-lg sm:px-10 sm:py-6"
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

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 6. FAQ Section (NEW) ========== */}
      <section className="bg-[#111111] px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="value-card rounded-lg border-0 px-6"
              >
                <AccordionTrigger
                  className="py-5 text-base font-bold text-white hover:no-underline [&>svg]:text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-relaxed text-white/80">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ========== Divider ========== */}
      <GradientDivider />

      {/* ========== 7. Final Invitation Section ========== */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 py-12 sm:py-24">
        {/* Subtle shader background */}
        <div className="absolute inset-0 opacity-10">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2
            className="mb-6 text-4xl font-bold md:text-5xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Your Gifts Are Needed.
            </span>
          </h2>
          <p className="mb-6 text-base text-white/70">
            Bring your whole self—shadows, gifts, and truths. Join us in weaving
            a tapestry where collective sovereignty is realized through the
            connection and blossoming of individual gifts.
          </p>
          <p className="mb-10 text-lg text-white/80">
            Feel the call? Fill out our questionnaire to see if we're aligned.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-golden px-8 py-5 text-lg sm:px-10 sm:py-6"
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
