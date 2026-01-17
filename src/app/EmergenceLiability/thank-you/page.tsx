import { type Metadata } from "next";
import Link from "next/link";
import { Instagram, Home, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Waiver Signed | The Emergence | New Earth Collective",
  description: "Thank you for signing the event waiver for The Emergence.",
};

export default function WaiverThankYouPage() {
  return (
    <div className="bg-black">
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

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] p-1">
              <div className="rounded-full bg-black p-4">
                <CheckCircle className="h-16 w-16 text-[#FACF39]" />
              </div>
            </div>
          </div>

          <h1
            className="mb-6 text-4xl font-bold text-[#FACF39] md:text-5xl lg:text-6xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            Waiver Signed Successfully
          </h1>

          <p className="mb-4 text-xl text-white/90">
            Thank you for signing the Event Release & Assumption of Risk.
          </p>

          <div className="mb-8 rounded-lg border border-[#FACF39]/30 bg-black/60 p-6">
            <h2
              className="mb-3 text-xl font-bold text-[#FACF39]"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              The Emergence
            </h2>
            <p className="text-white/80">January 17, 2026</p>
            <p className="text-white/60">Boulder Circus Center, Boulder, CO</p>
          </div>

          <p className="mb-12 text-lg text-white/70">
            You're all set! We can't wait to see you at the event. Follow us on Instagram for updates and behind-the-scenes content.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Button
              asChild
              className="bg-gradient-to-r from-[#FFD700] to-[#FACF39] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FACF39]/30"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#FACF39]/50 bg-transparent px-8 py-4 font-bold text-[#FACF39] transition-all hover:bg-[#FACF39]/10 hover:border-[#FACF39]"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <a
                href="https://www.instagram.com/newearthcollectiveco/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Follow on Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
