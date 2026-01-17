import { type Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Resources for a New Earth | New Earth Collective",
  description: "Explore inspirations aligning with our upside—tools for coherence and sovereignty.",
  openGraph: {
    title: "Resources | New Earth Collective",
    description: "Curated resources for regenerative growth and conscious technology.",
    type: "website",
  },
};

// Challenges we address
const challenges = [
  "Engineered addiction and nervous system dysregulation. Social media platforms don't just capture our attention—they program our brains using variable reward schedules (the same mechanism as slot machines). Research shows chronic use creates feedback loops between stress hormones and reward neurotransmitters—we're running on activation without ever settling into regulation. You're not the customer. You're the product being trained.",
  "Social fragmentation beyond our limits. Humans evolved to maintain meaningful relationships with roughly 150 people. When networks expand beyond this threshold, connection depth collapses. We start treating humans as abstractions. Empathy shuts off. Community dissolves into isolation.",
  "Severed connection to land. We've abstracted ourselves from the physical world. What researchers call 'nature deficit disorder' isn't poetic—it's physiological. Visual contact with nature reduces anxiety, stabilizes heart rate, improves cognition. We've traded the horizon for the screen. Our bodies don't touch earth.",
  "The erosion of sovereignty. Harvard professor Shoshana Zuboff calls it 'surveillance capitalism'—the claiming of private human experience as raw material for behavioral modification at scale. Tech companies don't just predict our behavior—they shape it. Without autonomy in action and thought, we lose our capacity for the moral judgment necessary for democracy itself.",
];

// Regenerative alternatives
const alternatives = [
  "Technology that strengthens in-person connection. The Global Ecovillage Network connects 6,000+ communities across 114 countries—living laboratories for technology that facilitates gathering instead of replacing it. These aren't utopian fantasies. They're regenerative communities already functioning today.",
  "Technology that safeguards nervous system coherence. The Center for Humane Technology has been developing design principles that protect attention and wellbeing since 2013. Products like Light Phone—designed to be used as little as possible—demonstrate viable alternatives to attention-hijacking interfaces. This means rejecting variable reward schedules, designing for focused attention rather than infinite scroll, and building systems that support our biology.",
  "Technology that reconnects us to land. Regenerative agriculture and permaculture show how technology can support ecological healing rather than extraction. These are integrated systems that enhance biodiversity, enrich soils, and capture carbon while reconnecting humans to the living systems that sustain us.",
  "Technology that empowers true data sovereignty. Projects like Web5 are building decentralized platforms where users control their identity and data through self-sovereign systems. This isn't blockchain hype—it's infrastructure for a world where you own your data, control who accesses it, and can revoke that access at will. Where surveillance capitalism becomes technologically impossible.",
];

const partners = [
  {
    title: "Entheos Holistics",
    description: "Earth-based healing offerings and holistic wellness practices. Explore sacred ceremonies, plant medicine integration, and embodied transformation work.",
    url: "https://entheosholistics.com/?sld=newearth",
    category: "Healing & Wellness",
  },
];

const alignedTech = [
  {
    title: "Global Ecovillage Network",
    description: "Connect with 6,000+ regenerative communities across 114 countries. Living laboratories for technology that facilitates gathering instead of replacing it.",
    url: "https://ecovillage.org/",
    category: "Community",
  },
  {
    title: "Center for Humane Technology",
    description: "Design principles for wellbeing. Developing principles that protect attention and wellbeing since 2013.",
    url: "https://www.humanetech.com/",
    category: "Tech Ethics",
  },
  {
    title: "Light Phone",
    description: "Minimalist tech for focus. A phone designed to be used as little as possible—demonstrating viable alternatives to attention-hijacking interfaces.",
    url: "https://www.thelightphone.com/",
    category: "Conscious Tech",
  },
  {
    title: "Regeneration International",
    description: "Permaculture and soil healing. Integrated systems that enhance biodiversity, enrich soils, and capture carbon while reconnecting humans to the living systems that sustain us.",
    url: "https://regenerationinternational.org/",
    category: "Regenerative Agriculture",
  },
];

export default function ResourcesPage() {
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
              Resources for a New Earth
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Explore inspirations aligning with our upside—tools for coherence and sovereignty.
          </p>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-black px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-8 text-center text-3xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <div className="flex justify-center">
            {partners.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block max-w-md rounded-lg border border-[#FACF39]/30 bg-black/60 p-6 transition-all hover:border-[#FACF39]/60 hover:shadow-lg hover:shadow-[#FACF39]/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#FACF39]/70">
                    {resource.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-white/40 transition-colors group-hover:text-[#FACF39]" />
                </div>
                <h3
                  className="mb-3 text-xl font-bold text-[#FACF39] transition-colors group-hover:text-[#FFD700]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  {resource.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Aligned Technologies Section */}
      <section className="bg-[#0A0A0A] px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-8 text-center text-3xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Aligned Technologies
            </span>
          </h2>

          {/* Featured: Web5 */}
          <div className="mb-8 flex justify-center">
            <a
              href="https://areweweb5yet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block max-w-lg rounded-lg border border-[#FACF39]/30 bg-black/60 p-6 transition-all hover:border-[#FACF39]/60 hover:shadow-lg hover:shadow-[#FACF39]/10"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[#FACF39]/70">
                  Data Sovereignty
                </span>
                <ExternalLink className="h-4 w-4 text-white/40 transition-colors group-hover:text-[#FACF39]" />
              </div>
              <h3
                className="mb-3 text-xl font-bold text-[#FACF39] transition-colors group-hover:text-[#FFD700]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Are We Web5 Yet?
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                Track the development of Web5—decentralized identity, P2P trust mechanisms, and user-controlled data. Infrastructure for a world where you own your data and control who accesses it.
              </p>
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {alignedTech.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border border-[#FACF39]/30 bg-black/60 p-6 transition-all hover:border-[#FACF39]/60 hover:shadow-lg hover:shadow-[#FACF39]/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#FACF39]/70">
                    {resource.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-white/40 transition-colors group-hover:text-[#FACF39]" />
                </div>
                <h3
                  className="mb-3 text-xl font-bold text-[#FACF39] transition-colors group-hover:text-[#FFD700]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  {resource.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="mb-6 text-3xl font-bold text-[#FACF39]"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            Share Your Resources
          </h2>
          <p className="mb-10 text-lg text-white/80">
            Want to contribute?
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-10 py-6 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f6c43f]/30"
            style={{ fontFamily: "Bourton, sans-serif" }}
          >
            <Link href="/questionnaire">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Reclaiming Connection Section */}
      <section className="bg-[#0A0A0A] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Reclaiming Connection in a Fragmented World
            </span>
          </h2>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Challenges Column */}
            <div>
              <h3
                className="mb-6 text-2xl font-bold text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                The Challenges We Address
              </h3>
              <ul className="space-y-6">
                {challenges.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#FACF39]/50" />
                    <p className="text-sm leading-relaxed text-white/80">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alternatives Column */}
            <div>
              <h3
                className="mb-6 text-2xl font-bold text-[#FACF39]"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Our Regenerative Alternatives
              </h3>
              <ul className="space-y-6">
                {alternatives.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#FACF39]" />
                    <p className="text-sm leading-relaxed text-white/80">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
