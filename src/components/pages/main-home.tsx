"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export function MainHomePage() {
  const primaryAuroraClass =
    "btn-aurora relative overflow-hidden bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] text-black shadow-[0_10px_40px_rgba(246,196,63,0.25)]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-neutral-950 to-black">
      <style jsx>{`
        .btn-aurora::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.28) 35%,
            transparent 65%
          );
          transform: translateX(-120%);
          transition: transform 0.8s ease;
        }
        .btn-aurora:hover::after {
          transform: translateX(120%);
        }
        .btn-aurora {
          animation: pulseGlow 3.2s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 10px 40px rgba(246, 196, 63, 0.25);
          }
          50% {
            box-shadow: 0 10px 55px rgba(246, 196, 63, 0.38);
          }
        }
      `}</style>
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
          background: radial-gradient(
            circle,
            rgba(246, 196, 63, 0.4),
            transparent 55%
          );
          opacity: 0.7;
          filter: blur(6px);
          z-index: 1;
          animation: heroPulse 3s ease-in-out infinite;
        }
        @keyframes heroPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.55;
          }
        }
        [data-hero-cta]::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.65),
            transparent
          );
          animation: buttonShimmer 10s ease-in-out infinite;
          z-index: 3;
          pointer-events: none;
        }
        @keyframes buttonShimmer {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }
        .hero-text-shimmer {
          position: relative;
          color: #0b0b0b;
          display: inline-block;
        }
      `}</style>
      {/* Flower of Life Shader Background */}
      <div className="absolute inset-0 opacity-45">
        <iframe
          src="/admin/shaders/flower-of-life/embed"
          className="h-full w-full border-0"
          style={{ pointerEvents: "none" }}
          title="Sacred Geometry Background"
        />
      </div>

      {/* Golden overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-black/80" />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="flex max-w-3xl flex-col items-center gap-8 text-center">
          <h1
            className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-6xl leading-tight font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            NEW EARTH
            <br />
            COLLECTIVE
          </h1>
          <h2
            className="text-3xl leading-tight font-bold tracking-tight text-white md:text-4xl lg:text-5xl"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Building a regenerative future together
          </h2>
          <p className="max-w-2xl text-lg text-neutral-300 md:text-xl">
            A collective of visionaries, builders, and change-makers co-creating
            regenerative systems for a thriving planet.
          </p>
          <Button
            size="lg"
            data-hero-cta
            asChild
            className={`${primaryAuroraClass} group mt-4 px-8 py-6 text-lg font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-[#facf39]/50`}
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <Link href="/about" className="flex items-center">
              <span className="hero-text-shimmer">ABOUT</span>
              <ArrowRight className="ml-2 h-5 w-5 text-black transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
