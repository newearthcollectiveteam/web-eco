import { type Metadata } from "next";
import Link from "next/link";
import { Instagram, Home, Gift, Video } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Thank You | The Emergence | New Earth Collective",
  description:
    "Thank you for completing the Emergence follow-up questionnaire.",
};

export default function EmergenceThankYouPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
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

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1
            className="mb-8 text-5xl font-bold text-[#FACF39] md:text-6xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Thank You!
          </h1>

          <p className="mb-6 text-xl text-white/90">
            Your responses help us build a community that truly serves you.
          </p>

          {/* Free Access Callout */}
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-[#FACF39]/40 bg-[#FACF39]/10 p-6">
            <div className="mb-3 flex items-center justify-center gap-3">
              <Gift className="h-6 w-6 text-[#FACF39]" />
              <h2
                className="text-xl font-bold text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Unlock Free Lifetime Access
              </h2>
              <Gift className="h-6 w-6 text-[#FACF39]" />
            </div>
            <p className="mb-4 text-white/80">
              Want{" "}
              <span className="font-semibold text-[#FACF39]">
                free lifetime access
              </span>{" "}
              to our online platform when it launches?
            </p>
            <p className="mb-4 text-white/80">
              Submit a short video testimonial sharing your experience at The
              Emergence and what this community means to you.
            </p>
            <p className="mb-5 text-sm text-white/60">
              Your story helps us grow and in return, you'll receive permanent
              access to our online network — no subscription fees, ever.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-[#FFD700] to-[#FACF39] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FACF39]/30"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <a
                href="https://forms.gle/DMHbejjmhsgkG8gq8"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="mr-2 h-5 w-5" />
                Submit Your Video
              </a>
            </Button>
          </div>

          <p className="mb-8 text-lg text-white/70">
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
              className="border-[#FACF39]/50 bg-transparent px-8 py-4 font-bold text-[#FACF39] transition-all hover:border-[#FACF39] hover:bg-[#FACF39]/10"
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
