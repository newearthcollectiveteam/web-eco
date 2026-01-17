import { type Metadata } from "next";
import Link from "next/link";
import { Instagram, Home } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Thank You | New Earth Collective",
  description: "Thank you for sharing your blueprint with the New Earth Collective.",
};

export default function ThankYouPage() {
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
          <h1
            className="mb-8 text-5xl font-bold text-[#FACF39] md:text-6xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            Thank You!
          </h1>
          <p className="mb-6 text-xl text-white/90">
            Your responses help us assess alignment and inform the building of our app.
          </p>
          <p className="mb-4 text-lg text-white/70">
            We'll connect soon via email or our network.
          </p>
          <p className="mb-12 text-lg text-white/70">
            In the meantime, follow our journey on Instagram.
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
