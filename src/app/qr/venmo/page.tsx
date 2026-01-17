import { type Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Support the Collective | New Earth Collective",
  description: "Scan to support the New Earth Collective via Venmo.",
};

export default function QRVenmoPage() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-40">
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
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <h1
            className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Support the Collective
            </span>
          </h1>

          <p className="mb-8 text-lg text-white/80">
            Your contribution helps us create transformative experiences and <span className="whitespace-nowrap">build our online ecosystem.</span>
          </p>

          {/* QR Code */}
          <div className="mb-8 inline-block rounded-2xl border border-[#FACF39]/30 bg-white p-6 shadow-2xl shadow-[#FACF39]/10">
            <Image
              src="/qr-venmo.png"
              alt="Scan to donate via Venmo"
              width={250}
              height={250}
              className="rounded-lg"
            />
          </div>

          <div className="mb-8 mx-auto w-fit rounded-lg border border-[#FACF39]/30 bg-black/60 px-6 py-3">
            <p className="text-xl font-bold text-[#FACF39]" style={{ fontFamily: "Bourton, sans-serif" }}>
              @thenewearthcollective
            </p>
          </div>

          <p className="mt-4 text-sm text-white/50">
            Thank you for supporting the movement.
          </p>
        </div>
      </section>
    </div>
  );
}
