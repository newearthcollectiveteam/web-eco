import { type Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Globe,
  Heart,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Stewardship | New Earth Collective",
  description:
    "We steward aligned partners — communities, conscious businesses, facilitators, and practitioners — whose work supports a regenerative future.",
  openGraph: {
    title: "Stewardship | New Earth Collective",
    description:
      "We steward aligned partners — communities, conscious businesses, facilitators, and practitioners — whose work supports a regenerative future.",
    type: "website",
  },
};

const featuredPartners = [
  {
    name: "Entheos Holistics",
    description:
      "Plant-based wellness products and holistic health practices. Premium supplements, adaptogens, and ceremonial-grade botanicals sourced with integrity.",
    href: "https://entheosholistics.com/?sld=newearth",
    image: "/images/stewards/entheos.png",
    category: "Conscious Business",
  },
];

const partnerCategories = [
  {
    title: "Communities",
    icon: Globe,
    description:
      "Aligned collectives and intentional communities building regenerative culture on the ground — from ecovillages to urban co-ops reimagining how we live together.",
  },
  {
    title: "Conscious Business",
    icon: Sparkles,
    description:
      "Enterprises rooted in purpose over profit. These businesses operate with integrity, prioritize impact, and prove that commerce can be a force for healing.",
  },
  {
    title: "Facilitators",
    icon: Users,
    description:
      "Guides who hold space for transformation — from retreat leaders and workshop facilitators to mediators and community organizers cultivating deeper connection.",
  },
  {
    title: "Practitioners",
    icon: Heart,
    description:
      "Healers, therapists, and holistic practitioners whose modalities support the well-being of body, mind, and spirit. Trusted hands in the work of personal and collective evolution.",
  },
];

export default function StewardshipPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-32">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-15">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        {/* Hero Content — left aligned */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <h1
            className="mb-4 text-4xl font-bold sm:text-5xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Stewardship{" "}
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-300">
            We partner with businesses and practitioners whose work aligns with
            our mission. These are companies and individuals we steward —
            endorsing their products and services because we believe in their
            positive impact on the people we serve.
          </p>
        </div>
      </section>

      {/* Our Partners — immediately after hero */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            className="mb-8 text-2xl font-bold text-white"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            Our Partners
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {/* Image */}
                <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <h3
                  className="mb-2 text-lg font-bold tracking-wide text-white uppercase"
                  style={{
                    fontFamily: "Bourton, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {partner.name}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-white/60">
                  {partner.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#FACF39] transition-colors group-hover:text-[#f6e45b]">
                  Visit site
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
      </div>

      {/* Who We Steward — categories */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            className="mb-4 text-2xl font-bold text-white"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            Who We Steward
          </h2>
          <p className="mb-10 max-w-2xl text-white/60">
            Our stewardship network spans four pillars of the regenerative
            ecosystem.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {partnerCategories.map((category) => (
              <div
                key={category.title}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-[#FACF39]/30 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACF39]/10">
                    <category.icon className="h-5 w-5 text-[#FACF39]" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white"
                    style={{
                      fontFamily: "Bourton, sans-serif",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {category.title}
                  </h3>
                </div>
                <p className="leading-relaxed text-white/60">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-[#FACF39]/30 via-[#FACF39]/10 to-transparent" />
      </div>

      {/* Get in Touch CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            className="mb-4 text-2xl font-bold text-white"
            style={{
              fontFamily: "Bourton, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            Aligned with Our Mission?
          </h2>
          <p className="mb-8 max-w-xl text-white/60">
            If your work supports regenerative living, holistic well-being, or
            conscious community building, we&apos;d love to explore stewardship
            together.
          </p>
          <a
            href="mailto:community@joinnewearthcollective.com"
            className="inline-flex items-center gap-2 text-lg font-medium text-[#FACF39] transition-colors hover:text-[#f6e45b]"
          >
            <Mail className="h-5 w-5" />
            community@joinnewearthcollective.com
          </a>
        </div>
      </section>
    </div>
  );
}
