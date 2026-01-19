import { type Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Our Core Values | New Earth Collective",
  description: "Explore the guiding values of New Earth Collective: Unconditional Love, Circular Abundance, Radical Authenticity, and more.",
  openGraph: {
    title: "Our Core Values | New Earth Collective",
    description: "These principles guide every aspect of the New Earth Collective, from festivals to technology.",
    type: "website",
  },
};

const values = [
  {
    title: "Unconditional Love",
    description: "Every interaction begins with the heart. We lead with indiscriminate love, not ego—creating space where all beings are honored.",
    quote: "Love is the foundation of all true connection.",
  },
  {
    title: "Circular Abundance",
    description: "Energy, knowledge, and resources flow multidirectionally. What you give returns; what you receive, you share. We operate in cycles, not hierarchies.",
    quote: "In the circle of giving and receiving, abundance multiplies.",
  },
  {
    title: "Radical Authenticity",
    description: "Bring your whole self—shadows, gifts, and truths. This is a judgment-free space where vulnerability is strength and masks aren't needed.",
    quote: "Your truth, fully expressed, is your greatest gift to the collective.",
  },
  {
    title: "Expanding Consciousness",
    description: "We honor growth over perfection and embrace the messy, beautiful path of awakening. Evolution is the journey, not the destination.",
    quote: "Every moment of awareness is a step toward the New Earth.",
  },
  {
    title: "Synarchy",
    description: "Leadership rooted in service and unconditional love. We synthesize wisdom from all traditions, recognizing that true authority comes from alignment with the highest good.",
    quote: "True leaders serve; true service is leadership.",
  },
  {
    title: "Technology Serving Consciousness",
    description: "AI and digital systems are mirrors and amplifiers of our highest values—tools that elevate humanity rather than diminish it.",
    quote: "Technology is most powerful when it serves human connection.",
  },
  {
    title: "Collective Sovereignty",
    description: "Individual empowerment exists within the whole. True freedom emerges through devotion to community and conscious connection.",
    quote: "Your sovereignty strengthens the whole; the whole protects your sovereignty.",
  },
  {
    title: "Harmonic Collective Intelligence",
    description: "Like forests and mycelial networks, we blend individual gifts into a unified, living system—operating in seamless, mutually supportive harmony with nature's wisdom, cycles, and rhythms.",
    quote: "Together, we are wiser than any of us alone.",
  },
];

export default function ValuesPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-15">
          <iframe
            src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-24 text-center">
          <h1
            className="mb-6 text-5xl font-bold md:text-6xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Our Core Values
            </span>
          </h1>
          <p className="mx-auto max-w-xs md:max-w-2xl text-base md:text-lg text-white/80">
            These principles guide every aspect of the New Earth Collective,<br className="hidden md:inline" />
            from festivals to technology.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-black px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-16">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`flex flex-col gap-8 ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}
              >
                {/* Value Content */}
                <div className="flex-1">
                  <h2
                    className="mb-4 text-3xl font-bold text-[#FACF39]"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    {value.title}
                  </h2>
                  <p className="mb-6 text-lg leading-relaxed text-white/80">
                    {value.description}
                  </p>
                  <blockquote className="border-l-4 border-[#FACF39]/50 pl-4">
                    <p className="italic text-white/60">"{value.quote}"</p>
                  </blockquote>
                </div>

                {/* Decorative Element */}
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#FACF39]/30 bg-[#FACF39]/5">
                    <span
                      className="text-5xl font-bold text-[#FACF39]/40"
                      style={{ fontFamily: "Bourton, sans-serif" }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="bg-[#0A0A0A] px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-12 text-xl text-white/80">
            Like the roots of a tree, these values link us together—where collective sovereignty is realized through the empowerment and connection of individual gifts.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-10 py-6 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            <Link href="/questionnaire">
              Align with Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
