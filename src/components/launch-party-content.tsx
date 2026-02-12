"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Star,
  Music,
  Heart,
  Users,
  Instagram,
  Mail,
  ExternalLink,
} from "lucide-react";

export function LaunchPartyContent() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target date - December 20th, 2025 at 1 PM
    const targetDate = new Date("2025-12-20T13:00:00");

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        [data-hero-cta] {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        [data-hero-cta] > * {
          position: relative;
          z-index: 2;
        }
        [data-hero-cta]::before {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(246,196,63,0.4), transparent 55%);
          opacity: 0.7;
          filter: blur(6px);
          z-index: 1;
          animation: heroPulse 3s ease-in-out infinite;
        }
        @keyframes heroPulse {
          0% { transform: scale(0.95); opacity: 0.55; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(0.95); opacity: 0.55; }
        }
        [data-hero-cta]::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: buttonShimmer 10s ease-in-out infinite;
          z-index: 3;
          pointer-events: none;
        }
        @keyframes buttonShimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }
      `}</style>
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#facf39]/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-xl font-bold bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              NEW EARTH COLLECTIVE
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="https://www.skool.com/new-earth-collective-8653"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Join the Community
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <div className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-16 text-center pt-12 md:pt-14">
          <div className="mb-10 inline-flex items-center justify-center">
            <div className="relative h-20 w-20 drop-shadow-2xl">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="mb-6 text-5xl leading-tight font-bold text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            <span
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
                NEW EARTH COLLECTIVE
              </span>
            </span>
            <br />
            <span style={{ fontFamily: "Bourton, sans-serif" }}>
              LAUNCH PARTY
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-neutral-300 dark:text-neutral-300 italic md:text-2xl">
            A Day-Long Transformational Festival of Heart, Harmony, and High
            Vibe Connection
          </p>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://www.skool.com/new-earth-collective-8653"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                data-hero-cta
                className="group w-full sm:w-auto bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-8 py-6 text-lg font-bold text-black shadow-2xl transition-all hover:scale-105 hover:shadow-[#facf39]/50"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
              }}
            >
                <span>Join the Skool Community</span>
                <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a
              href="https://partiful.com/e/SzZhBxdzGE3Fye6JpxNa?source=share"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="group w-full sm:w-auto border-2 border-[#facf39] bg-black/40 px-8 py-6 text-lg font-bold text-[#facf39] shadow-lg transition-all hover:scale-105 hover:bg-[#facf39]/10"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                RSVP on Partiful
                <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>

          {/* Event Details */}
          <div className="mb-6 flex flex-col items-center justify-center gap-4 text-lg text-neutral-300 dark:text-neutral-300 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#facf39]" />
              <span>December 20th, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#facf39]" />
              <span>1 PM to 12 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#facf39]" />
              <span>Boulder Circus Center, CO</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6 flex w-full justify-center">
            <Card className="w-full border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md sm:w-auto">
              <CardContent className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="mb-4 flex items-center justify-center gap-2 text-[#facf39]">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-semibold tracking-wider uppercase">
                    Event Countdown
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center">
                      <div className="mb-2 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                        <span
                          className="text-2xl sm:text-3xl font-bold text-black"
                          style={{ fontFamily: "Bourton, sans-serif" }}
                        >
                          {String(item.value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-xs font-semibold tracking-wider text-neutral-400 dark:text-neutral-400 uppercase">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Vision Section */}
        <section className="mb-20">
          <Card className="overflow-hidden border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-black">
                <video
                  controls
                  className="h-full w-full object-contain bg-black"
                  poster="/brand/symbol.png"
                  preload="metadata"
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                >
                  <source
                    src="https://www.dropbox.com/scl/fi/r59jhwqf191x25epoy7so/Join-the-New-Earth-Collective.mp4?rlkey=6100f1oere6mipjwk6t5au3p6&raw=1"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-6">
                <h3
                  className="mb-2 text-xl font-bold text-white"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  The Vision
                </h3>
                <p className="text-sm text-neutral-300 dark:text-neutral-300">
                  Discover the vision behind our community and what we&apos;re
                  building together.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* The Invitation Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Heart className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  The Invitation
                </h2>
              </div>
              <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                <p className="text-xl font-bold text-white">
                  This isn&apos;t just a party. It&apos;s a pulse.
                </p>
                <p>
                  The New Earth is rising—a new way of living, loving, and
                  leading rooted in unity, creativity, and heart-centered
                  connection. And it begins right here, with us, in Boulder.
                </p>
                <p>
                  You&apos;re invited to be the{" "}
                  <span className="font-bold text-[#facf39]">heart</span> of the
                  New Earth Collective. A diverse, potent, and playful community
                  of facilitators, artists, healers, mystics, and visionaries
                  ready to co-create something greater than ourselves.
                </p>
                <p>
                  This launch party is our first spark. A sacred celebration. A
                  living ceremony. An 11-hour journey of self-activation, group
                  coherence, soul nourishment, and pure ecstatic expression.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What to Expect Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Music className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  What to Expect
                </h2>
              </div>
              <p className="mb-6 text-2xl font-bold text-[#facf39]">
                Heaven on Earth Vibes
              </p>
              <ul className="mb-6 space-y-3">
                {[
                  "Soul-stirring workshops to awaken your gifts",
                  "Coded conversations & deep connective magic",
                  "Charcuterie boards to graze & visionary speech",
                  "Curated bass music to move your body & spirit",
                  "Integration lounges, tea service, vibrational therapy, cuddle zones",
                  "Acro, aerials, jugglers, and joyful circus energy",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                    <span className="text-lg text-neutral-300 dark:text-neutral-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mb-4 text-lg text-neutral-200 dark:text-neutral-200 italic">
                We are weaving together the many beautiful threads of Boulder
                into one Flower of Life field.
              </p>
              <p className="mb-8 text-lg font-semibold text-white">
                This isn&apos;t <span className="italic">our</span> party.
                It&apos;s <span className="italic">ours</span> to co-create.
              </p>
              <a
                href="https://www.skool.com/new-earth-collective-8653"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span className="cta-shimmer">Join the Skool Community</span>
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        {/* How to Attend Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/40 bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  How to Attend
                </h2>
              </div>
              <div className="mb-6 space-y-4 text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                <p className="text-2xl font-bold text-white">
                  This party is free—because your presence{" "}
                  <span className="italic">is</span> the gift.
                </p>
                <p className="text-xl font-bold text-[#facf39]">
                  Your Entry = Joining the Skool Community + RSVP on Partiful
                  (contribute suggested donation if in capacity)
                </p>
                <p>
                  This Skool group will be the living ecosystem of the New Earth
                  Collective—a digital temple and sanctuary where we:
                </p>
                <ul className="space-y-2 pl-6">
                  {[
                    "Connect with soul-aligned beings",
                    "Share & receive healing, guidance, and support",
                    "Activate purpose & amplify service",
                    "Host weekly connection calls, men's & women's circles, and more",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="mt-1 h-4 w-4 shrink-0 text-[#facf39]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-white">
                  This in-person event is the{" "}
                  <span className="text-[#facf39]">foundational heartbeat</span>{" "}
                  of the digital New Earth Collective. YOU are the roots. And
                  the world is waiting to bloom from what we grow together.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="https://www.skool.com/new-earth-collective-8653"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] font-bold text-black shadow-lg transition-all hover:scale-105"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span className="cta-shimmer">Join the Skool Community</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a
                  href="https://partiful.com/e/SzZhBxdzGE3Fye6JpxNa?source=share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-[#facf39] bg-black/40 font-bold text-[#facf39] shadow-lg transition-all hover:scale-105 hover:bg-[#facf39]/10"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    RSVP on Partiful
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <h2
                className="mb-6 text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Come As You Are. Leave More Fully Yourself.
              </h2>
              <div className="mb-8 space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                <p>This is for the ones who feel the call.</p>
                <p>
                  The ones who carry medicine in their voice, their touch, their
                  laughter, their presence.
                </p>
                <p>The ones ready to live in rhythm with the New Earth.</p>
                <p className="text-xl font-semibold text-white">
                  Sound like you?
                </p>
                <p className="text-white">
                  Then come dance, dream, and create this vision with us.
                </p>
              </div>
              <a
                href="https://www.skool.com/new-earth-collective-8653"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span className="cta-shimmer">I&apos;m In</span>
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Final Details */}
        <section className="mb-20 text-center">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-lg backdrop-blur-md">
            <CardContent className="p-6">
              <div className="space-y-2 text-sm text-neutral-300 dark:text-neutral-300">
                <p className="font-semibold text-[#facf39]">
                  Skool Signup Required for Entry
                </p>
                <p>Event is FREE - Contribute suggested $25 donation if in capacity!</p>
                <p>
                  Final party details will be shared via Partiful closer to the
                  event
                </p>
              </div>
            </CardContent>
          </Card>
          <p
            className="mt-8 text-2xl text-neutral-300 dark:text-neutral-300 italic"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            Let&apos;s co-create Heaven on Earth, together.
          </p>
        </section>

          {/* Footer */}
          <footer className="border-t border-[#facf39]/20 pt-12 pb-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <a
                  href="https://instagram.com/newearthcollectiveco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 transition-colors hover:text-[#facf39]"
                >
                  <Instagram className="h-5 w-5" />
                  <span>@newearthcollectiveco</span>
                </a>
                <a
                  href="mailto:community@joinnewearthcollective.com"
                  className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 transition-colors hover:text-[#facf39]"
                >
                  <Mail className="h-5 w-5" />
                  <span>community@joinnewearthcollective.com</span>
                </a>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                © {new Date().getFullYear()} New Earth Collective. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
