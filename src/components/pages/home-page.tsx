"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Quote } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
import { assetUrl } from "~/lib/storage";

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
          className="relative cursor-pointer group"
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
              <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-20">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
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
            className="btn-golden px-8 py-5 text-lg sm:px-10 sm:py-6"
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
      <section className="bg-[#111111] border-y border-[#f6c43f]/20 px-4 py-12 sm:py-24">
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

      {/* Who We Serve Section */}
      <section className="bg-[#0A0A0A] px-4 py-12 sm:py-24">
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
      <section className="bg-[#111111] border-y border-[#f6c43f]/20 px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-4 text-center text-4xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>
          <p className="mb-12 text-center text-lg text-white/80">
            Hear from attendees of our first event: The Emergence
          </p>

          {/* Video Testimonial Carousel */}
          {videoTestimonials.length > 0 && (
            <div className="relative mx-auto max-w-3xl mb-16">
              <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
                <CarouselContent>
                  {videoTestimonials.map((video) => (
                    <CarouselItem key={video.name} className="flex items-center justify-center">
                      <LazyVideo src={video.src} poster={video.poster} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {videoTestimonials.length > 1 && (
                  <>
                    <CarouselPrevious className="bg-[#FACF39]/90 hover:bg-[#FACF39] text-black" />
                    <CarouselNext className="bg-[#FACF39]/90 hover:bg-[#FACF39] text-black" />
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
                <CarouselContent className="-ml-4">
                  {writtenTestimonials.map((t) => (
                    <CarouselItem
                      key={t.name + t.quote.slice(0, 20)}
                      className="pl-4 basis-[85%] sm:basis-[60%] lg:basis-[38%]"
                    >
                      <div className="value-card rounded-lg p-6 h-full">
                        <Quote className="mb-3 h-6 w-6 text-[#FACF39]/40" />
                        <p className="mb-4 italic leading-relaxed text-white/85">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <p className="text-sm text-[#FACF39]">
                          &mdash; {t.name}{t.role ? `, ${t.role}` : ""}
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
            <p className="mb-6 text-xl text-white/90" style={{ fontFamily: "Bourton, sans-serif" }}>
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

      {/* Final Invitation Section */}
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
