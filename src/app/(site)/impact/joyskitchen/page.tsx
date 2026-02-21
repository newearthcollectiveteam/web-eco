"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Users,
  HandHeart,
  Calendar,
  CheckCircle,
  ExternalLink,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function JoysKitchenPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#a855f7] to-[#ec4899]">
      {/* Flower of Life Shader Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10">
        <iframe
          src="/admin/shaders/flower-of-life/embed"
          className="h-full w-full border-0"
          style={{ pointerEvents: "none" }}
          title="Sacred Geometry Background"
        />
      </div>

      <style jsx global>{`
        .btn-white {
          background: white;
          color: #a855f7;
          font-weight: bold;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .btn-white:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
        }
        .btn-green {
          background: #22c55e;
          color: white;
          font-weight: bold;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .btn-green:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
        }
        .btn-outline-white {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid white;
          color: white;
          font-weight: bold;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .btn-outline-white:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
      `}</style>

      <div className="relative z-10 px-4 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-16 pt-8 text-center">
            {/* Dual Logo Lockup */}
            <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-6">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#ec4899]/60 bg-white p-1.5 shadow-lg sm:h-24 sm:w-24 sm:border-4 sm:p-2">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-light text-white/60 sm:text-4xl">
                &times;
              </span>
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#a855f7]/60 bg-white shadow-lg sm:h-24 sm:w-24 sm:border-4">
                <Image
                  src="/brand/partners/joys-kitchen-logo.png"
                  alt="Joy's Kitchen"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <Badge className="mb-6 border-white/30 bg-white/20 text-white backdrop-blur-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Impact Mission
            </Badge>

            <h1
              className="mb-4 text-3xl leading-tight font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              Joy&apos;s Kitchen
              <span className="block text-xl text-white/80 sm:text-2xl md:text-3xl">
                Denver, Colorado
              </span>
            </h1>

            <p className="text-shadow mx-auto mb-6 max-w-2xl text-xl text-white md:text-2xl">
              <span className="sm:hidden">
                Let&apos;s show up together and serve
                <br />
                Colorado families in need.
              </span>
              <span className="hidden sm:inline">
                Let&apos;s show up together and serve Colorado families in need.
              </span>
            </p>

            {/* Key Stat */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-3 backdrop-blur-sm">
              <Heart className="h-5 w-5 text-white" />
              <span className="text-lg font-semibold text-white">
                6 million meals provided
              </span>
            </div>

            {/* CTAs */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="https://joyskitchen.org/volunteer"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:max-w-[340px] sm:flex-1"
              >
                <Button
                  size="lg"
                  className="btn-white w-full px-10 py-6 text-lg"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Volunteer Signup
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a
                href="https://joyskitchen.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:max-w-[340px] sm:flex-1"
              >
                <Button
                  size="lg"
                  className="btn-outline-white w-full px-10 py-6 text-lg"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Donate
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </section>

          {/* What Is This Section */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="mb-6 flex items-start gap-3">
                  <HandHeart className="mt-1 h-6 w-6 shrink-0 text-white sm:h-8 sm:w-8" />
                  <h2
                    className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    What is an Impact Mission?
                  </h2>
                </div>
                <div className="text-shadow space-y-4 text-lg leading-relaxed text-white">
                  <p>
                    Impact Missions are how the New Earth Collective shows up in
                    the world—not just talking about change, but{" "}
                    <span className="font-bold text-white">being</span> the
                    change.
                  </p>
                  <p>
                    We partner with organizations doing meaningful work and
                    mobilize our community to volunteer together. It&apos;s
                    service meets connection—a chance to make a real difference
                    while building bonds with like-minded souls.
                  </p>
                  <div className="mt-6 rounded-lg border border-white/20 bg-white/15 p-4">
                    <p className="font-semibold text-white">
                      <Calendar className="mr-2 inline-block h-5 w-5" />
                      Expect: 4-8 hours of volunteering, connection, and shared
                      purpose
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Why Joy's Kitchen Section */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="mb-6 flex items-start gap-3">
                  <Heart className="mt-1 h-6 w-6 shrink-0 text-white sm:h-8 sm:w-8" />
                  <h2
                    className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Why Joy&apos;s Kitchen?
                  </h2>
                </div>
                <p className="text-shadow mb-6 text-lg text-white">
                  Joy&apos;s Kitchen has been feeding Colorado families since
                  2009, providing nutritious meals to those facing food
                  insecurity. Their mission aligns perfectly with our
                  vision—heart-centered service that uplifts the whole
                  community.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      icon: Star,
                      text: "Feeding families in need across Colorado",
                    },
                    {
                      icon: Users,
                      text: "Building community through collective action",
                    },
                    { icon: Heart, text: "Serving with love, not obligation" },
                    {
                      icon: Sparkles,
                      text: "Becoming the movement, not just supporting it",
                    },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <item.icon className="mt-1 h-5 w-5 shrink-0 text-[#22c55e]" />
                      <span className="text-shadow text-lg text-white">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* How It Works Section */}
          <section className="mb-16">
            <Card className="border-2 border-[#10b981]/40 bg-gradient-to-br from-[#10b981]/20 to-[#06b6d4]/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="mb-6 flex items-start gap-3">
                  <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-[#22c55e] sm:h-8 sm:w-8" />
                  <h2
                    className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    How It Works
                  </h2>
                </div>
                <div className="mb-8 space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Sign up as a volunteer",
                      description:
                        "Register on Joy's Kitchen volunteer portal (takes 60 seconds)",
                    },
                    {
                      step: 2,
                      title: "We announce the group date",
                      description:
                        "You'll receive details about when we're going as a collective",
                    },
                    {
                      step: 3,
                      title: "Show up and serve",
                      description:
                        "Meet your community, make an impact, and feel the joy",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-lg font-bold text-white">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="text-shadow text-white/80">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://joyskitchen.org/volunteer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="btn-green w-full px-10 py-6 text-lg md:w-auto"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Volunteer Signup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* Can't Make It Section */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <h2
                  className="mb-4 text-2xl font-bold text-white md:text-3xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Can&apos;t Make It?
                </h2>
                <div className="text-shadow space-y-4 text-lg text-white">
                  <p>
                    No worries—there will be more missions. But you can still
                    support:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start gap-2">
                      <Star className="mt-1 h-4 w-4 shrink-0 text-[#facf39]" />
                      <a
                        href="https://joyskitchen.org/donate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-2 transition-all hover:gap-2 hover:text-white hover:underline-offset-4"
                      >
                        Make a donation to Joy&apos;s Kitchen
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="mt-1 h-4 w-4 shrink-0 text-[#facf39]" />
                      <span>
                        Volunteer on your own time with a fellow community
                        member
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="mt-1 h-4 w-4 shrink-0 text-[#facf39]" />
                      <span>
                        Share this mission with someone who might want to join
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Final CTA Section */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 text-center md:p-12">
                <h2
                  className="mb-4 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Ready to Make an Impact?
                </h2>
                <p className="text-shadow mx-auto mb-8 max-w-2xl text-xl text-white">
                  This is what it means to be part of the New Earth
                  Collective—showing up, serving together, and creating the
                  world we want to live in.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <a
                    href="https://joyskitchen.org/volunteer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="btn-white w-full min-w-[220px] px-10 py-6 text-lg sm:w-auto"
                      style={{ fontFamily: "Bourton, sans-serif" }}
                    >
                      Join the Mission
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a
                    href="https://joyskitchen.org/donate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="btn-outline-white w-full min-w-[220px] px-10 py-6 text-lg sm:w-auto"
                      style={{ fontFamily: "Bourton, sans-serif" }}
                    >
                      Donate
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Impact Points Section - Coming Soon Teaser */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <Badge className="mb-4 border-[#facf39]/30 bg-[#facf39]/10 text-[#facf39]">
                  Coming Soon
                </Badge>
                <h3
                  className="mb-4 text-xl font-bold text-white sm:text-2xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Impact Points &amp; Badges
                </h3>

                <div className="space-y-4 text-white/80">
                  <p>
                    As we launch Impact Missions, participants will begin
                    earning:
                  </p>
                  <ul className="space-y-1 pl-4">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-[#facf39]" />
                      Impact Badges
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-[#facf39]" />
                      Impact Points
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-[#facf39]" />
                      Recognition inside the community
                    </li>
                  </ul>

                  <p>In the future, these points may unlock perks such as:</p>
                  <ul className="space-y-1 pl-4">
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-[#facf39]" />
                      Discounts toward future events
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-[#facf39]" />
                      Community rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-[#facf39]" />
                      Other benefit systems we&apos;re exploring
                    </li>
                  </ul>

                  <p className="pt-2 text-lg font-semibold text-white">
                    For now, the mission is simple: show up and serve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* About NEC Section */}
          <section className="mb-16">
            <Card className="border-2 border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="flex flex-col items-start gap-6 md:flex-row">
                  <div className="relative h-20 w-20 shrink-0">
                    <Image
                      src="/brand/symbol.svg"
                      alt="New Earth Collective"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3
                      className="mb-2 text-2xl font-bold text-white"
                      style={{ fontFamily: "Bourton, sans-serif" }}
                    >
                      About New Earth Collective
                    </h3>
                    <p className="text-shadow mb-4 text-white">
                      We&apos;re a community of visionaries, healers, and
                      change-makers building the new paradigm together. Through
                      events, workshops, and Impact Missions like this, we
                      create real transformation in ourselves and our world.
                    </p>
                    <Link href="/">
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/15"
                      >
                        Learn More About NEC
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
