"use client";

import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Sparkles,
  Star,
  Zap,
  Calendar,
  MapPin,
  Clock,
  Instagram,
  Mail,
  Loader2,
} from "lucide-react";

export function CommunityLandingContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "community-landing",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Welcome to the New Earth Collective! Check your email for next steps.",
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <>
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#facf39]/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/community" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              NEW EARTH COLLECTIVE
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/launch-party"
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-[#facf39]"
            >
              Launch Party
            </Link>
            <Button
              size="sm"
              onClick={scrollToForm}
              className="bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Join Waitlist
            </Button>
          </nav>
        </div>
      </header>

      <div className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-20 min-h-[90vh] flex flex-col items-center justify-center text-center">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative h-20 w-20 drop-shadow-2xl">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1
              className="mb-4 text-6xl font-bold text-white drop-shadow-2xl md:text-7xl"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              THE NEW EARTH
              <br />
              COLLECTIVE
            </h1>
          <p className="mx-auto mb-8 max-w-2xl text-2xl text-neutral-300 dark:text-neutral-300 italic">
            A global sanctuary for awakened souls ready to connect, co-create,
            and rise together.
          </p>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="group bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-8 py-6 text-lg font-bold text-black shadow-2xl transition-all hover:scale-105 hover:shadow-[#facf39]/50"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Join the Waitlist
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </section>

        {/* You're Not Alone Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Heart className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  You&apos;re Not Alone. You&apos;re Early.
                </h2>
              </div>
              <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                <p>The world has changed. You feel it.</p>
                <p>
                  You&apos;ve started waking up. You see through the old
                  systems. You crave real connection and a place to belong.
                </p>
                <p className="font-semibold text-white">This is that place.</p>
                <p>
                  The <span className="text-[#facf39]">New Earth Collective</span>{" "}
                  is a grounded, heart-led digital community built for people on
                  the path of awakening. A space to meet others who get it,
                  share your truth, and be supported while stepping into the
                  next version of you.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Be First In Line
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What Is Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  What Is the New Earth Collective?
                </h2>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                An online Skool community where seekers, healers, creatives, and
                conscious humans gather to grow and serve—together.
              </p>
              <div className="mb-6">
                <p className="mb-4 text-lg font-semibold text-white">
                  Inside, you&apos;ll find:
                </p>
                <ul className="space-y-3">
                  {[
                    "Weekly community calls to connect and be seen",
                    "Bi-weekly men's and women's circles",
                    "Relationship coaching calls for real partnership",
                    "Guided breathwork, meditations, astrology & more",
                    "A space to offer your gifts and receive others'",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                      <span className="text-lg text-neutral-300 dark:text-neutral-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mb-8 text-lg font-semibold text-white italic">
                It&apos;s not just content. It&apos;s connection.
              </p>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Save Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Launch Party Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/30 bg-gradient-to-br from-[#facf39]/10 via-black/60 to-black/60 dark:from-[#facf39]/10 dark:via-black/80 dark:to-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Join Us for the Launch Party
                </h2>
              </div>
              <div className="mb-6 space-y-4 text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                <p className="text-2xl font-bold text-[#facf39]">
                  December 20th, 2025 • 12 PM to 12 AM
                </p>
                <div className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300">
                  <MapPin className="h-5 w-5 text-[#facf39]" />
                  <span>Boulder Circus Center, CO</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  A Day-Long Transformational Festival of Heart, Harmony, and
                  High Vibe Connection
                </p>
                <p>
                  This isn&apos;t just a party. It&apos;s the foundational
                  heartbeat of our community. A 12-hour journey of
                  self-activation, group coherence, soul nourishment, and pure
                  ecstatic expression.
                </p>
                <div className="rounded-lg bg-black/40 p-4">
                  <p className="mb-2 font-semibold text-[#facf39]">
                    Experience:
                  </p>
                  <ul className="space-y-2 pl-4">
                    {[
                      "Soul-stirring workshops to awaken your gifts",
                      "Deep connective conversations & coded magic",
                      "Potluck community feast & visionary speeches",
                      "Curated bass music to move your body & spirit",
                      "Integration lounges, tea service, tarot, cuddle zones",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-neutral-300 dark:text-neutral-300"
                      >
                        <Star className="mt-1 h-4 w-4 shrink-0 text-[#facf39]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-semibold text-white">
                  Entry: Join the Skool Community + Bring a Dish to Share
                </p>
              </div>
              <Link href="/launch-party">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black shadow-lg transition-all hover:scale-105"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Learn More About the Launch Party
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Founding Member Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/40 bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Star className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Become a Founding Member
                </h2>
              </div>
              <div className="mb-6 space-y-4 text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                <p className="text-2xl font-bold text-[#facf39]">
                  The first 100 members get free lifetime access to everything.
                </p>
                <p>
                  After that, it becomes $20/month, and will rise as the
                  community grows.
                </p>
                <p className="font-semibold text-white">
                  Act now, and you become a foundational part of something
                  designed to last.
                </p>
              </div>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black shadow-lg transition-all hover:scale-105"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Claim Lifetime Access
                <Star className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Why This, Why Now Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Zap className="h-8 w-8 text-[#facf39]" />
                <h2
                  className="text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Why This, Why Now?
                </h2>
              </div>
              <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                <p>Because awakening alone is hard.</p>
                <p>Because your voice, gifts, and presence matter.</p>
                <p>
                  Because the world needs communities built on truth,
                  connection, and mutual support.
                </p>
                <p className="text-xl font-bold text-white">
                  This isn&apos;t just a group. It&apos;s a movement.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Join the Movement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Who Is This For Section */}
        <section className="mb-20">
          <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <h2
                className="mb-6 text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Who Is This For?
              </h2>
              <ul className="mb-8 space-y-3">
                {[
                  "The seekers who feel like outsiders",
                  "The newly awakened looking for direction",
                  "The empaths and artists ready to be seen",
                  "The quiet leaders who know they came here for more",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                    <span className="text-lg text-neutral-300 dark:text-neutral-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mb-8 text-lg font-semibold text-white">
                If that&apos;s you, this is your space.
              </p>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105 md:w-auto"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Enter the Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Waitlist Form Section */}
        <section id="waitlist-form" className="mb-20 scroll-mt-20">
          <Card className="border-2 border-[#facf39]/30 bg-gradient-to-br from-[#facf39]/5 via-black/70 to-black/70 dark:from-[#facf39]/5 dark:via-black/90 dark:to-black/90 shadow-2xl backdrop-blur-md">
            <CardContent className="p-8 md:p-12">
              <div className="mb-6 text-center">
                <h2
                  className="mb-4 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Join the Waitlist
                </h2>
                <p className="text-lg text-neutral-300 dark:text-neutral-300">
                  Be among the first 100 founding members to receive lifetime
                  free access.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-white"
                  >
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-black/40 border-[#facf39]/30 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-white"
                  >
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-black/40 border-[#facf39]/30 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-white"
                  >
                    Phone Number (Optional)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-black/40 border-[#facf39]/30 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-white"
                  >
                    Why do you want to join the New Earth Collective?
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-black/40 border-[#facf39]/30 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                    placeholder="Share what brings you here..."
                  />
                </div>

                {submitStatus.type && (
                  <div
                    className={`rounded-lg p-4 ${
                      submitStatus.type === "success"
                        ? "bg-green-500/20 border border-green-500/30 text-green-200"
                        : "bg-red-500/20 border border-red-500/30 text-red-200"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Secure My Spot
                      <Star className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="mb-20 text-center">
          <p
            className="mb-6 text-2xl text-neutral-300 dark:text-neutral-300 italic"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            The New Earth is here. Let&apos;s build it together.
          </p>
          <Badge className="border-[#facf39]/40 bg-[#facf39]/10 px-4 py-2 text-sm text-[#facf39]">
            <Sparkles className="mr-2 h-4 w-4" />
            First 100 Members Get Lifetime Free Access
          </Badge>
        </section>

          {/* Footer */}
          <footer className="border-t border-[#facf39]/20 pt-12 pb-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex items-center gap-6">
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
