import { type Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Join the Collective | New Earth Collective",
  description: "Scan to fill out our community alignment questionnaire.",
};

export default function QRQuestionnairePage() {
  return (
    <div className="min-h-screen bg-black">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-40">
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
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <h1
            className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Join the Collective
            </span>
          </h1>

          <p className="mb-8 text-lg text-white/80">
            Scan to fill out our community alignment questionnaire.
          </p>

          {/* QR Code */}
          <div className="mb-8 inline-block rounded-2xl border border-[#FACF39]/30 bg-white p-6 shadow-2xl shadow-[#FACF39]/10">
            <Image
              src="/qr-questionnaire.png"
              alt="Scan to access questionnaire"
              width={250}
              height={250}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
