"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  Users,
  Target,
  Eye,
  Gem,
  RefreshCw,
  Leaf,
  Crown,
  Brain,
  Globe,
  Instagram,
  Mail,
} from "lucide-react";

export function AboutContent() {
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
              href="/community"
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-[#facf39]"
            >
              Community
            </Link>
            <Link
              href="/launch-party"
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-[#facf39]"
            >
              Launch Party
            </Link>
            <Link href="/community#waitlist-form">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#facf39] to-[#f59e0b] font-bold text-black transition-all hover:scale-105"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Join Waitlist
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-20 mt-16 text-center">
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
              ABOUT US
            </h1>
            <p className="mx-auto max-w-2xl text-2xl text-neutral-300 dark:text-neutral-300 italic">
              A movement toward the New Earth — a society based on compassion,
              purpose, and unity.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Target className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Our Mission
                  </h2>
                </div>
                <p className="mb-6 text-2xl font-bold text-[#facf39]">
                  To be the ultimate place of belonging—where every soul feels
                  seen, loved, and supported in becoming who they are meant to be.
                </p>
                <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                  <p className="font-semibold text-white">
                    The New Earth Collective intends to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      {
                        text: "Empower the creation of heart-centered communities worldwide",
                        icon: Heart,
                      },
                      {
                        text: "Redefine the digital social experience — transforming technology into a tool for love, consciousness, and connection",
                        icon: Sparkles,
                      },
                      {
                        text: "Prepare humanity for a new era of cooperation — building a decentralized system for the creation and connection of a web of communities worldwide",
                        icon: Users,
                      },
                      {
                        text: "Become a prototype for future civilizations — where AI, data, and consciousness converge to serve the highest good",
                        icon: Brain,
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <Icon className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Vision Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Eye className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Our Vision
                  </h2>
                </div>
                <div className="space-y-6 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                  <p>
                    The New Earth Collective seeks to build the foundation for a{" "}
                    <span className="font-bold text-white">
                      new paradigm of human connection
                    </span>{" "}
                    — one that blends spirituality, technology, and authentic
                    heart-centered community.
                  </p>
                  <p>
                    We aim to become a digital ecosystem of love, collaboration,
                    and empowerment, where members support one another in their
                    personal evolution and co-create a more conscious world.
                  </p>
                  <p className="text-xl font-semibold text-white">
                    This collective is more than a group — it&apos;s a movement
                    toward the "New Earth," a society based on compassion, purpose,
                    and unity.
                  </p>
                </div>

                {/* Forest & Mycelial Vision */}
                <div className="mt-8 rounded-lg bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 p-6">
                  <h3
                    className="mb-4 text-2xl font-bold text-[#facf39]"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    The Forest & Mycelial Vision
                  </h3>
                  <div className="space-y-4 text-neutral-200 dark:text-neutral-200">
                    <p>
                      We envision the creation of an infrastructure that plants
                      individual community{" "}
                      <span className="font-bold text-white">"trees"</span>, as
                      well as a{" "}
                      <span className="font-bold text-white">
                        "mycelial" system
                      </span>{" "}
                      that connects these trees into one living forest.
                    </p>
                    <p>
                      Where the individual synthesizes within their community, and
                      the communities synthesize with each other.
                    </p>
                    <p className="text-xl font-bold text-[#facf39]">
                      We seek to bridge intimacy and scale.
                    </p>
                  </div>
                </div>

                {/* Technology Path */}
                <div className="mt-8">
                  <h3
                    className="mb-4 text-xl font-bold text-white"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Our Technology Path
                  </h3>
                  <p className="text-neutral-300 dark:text-neutral-300">
                    We are a <span className="font-bold text-white">community engine</span>. We will use Skool.com as our
                    digital point of inception and expand into self-hosted
                    technology, with in-house servers, and technological + AI
                    systems rooted in heart, nature, and sacred geometry.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 dark:bg-black/80 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 md:p-12">
                <div className="mb-8 flex items-center gap-3">
                  <Gem className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Our Values
                  </h2>
                </div>

                <div className="space-y-8">
                  {[
                    {
                      icon: Heart,
                      title: "Unconditional Love",
                      description:
                        "Every interaction, system, and offering is rooted in indiscriminate love for all beings. We lead with heart, not ego.",
                    },
                    {
                      icon: RefreshCw,
                      title: "Circular Abundance",
                      description:
                        "We reject extractive models. Energy, knowledge, and resources flow in all directions. Everyone gives. Everyone receives. Everyone grows.",
                    },
                    {
                      icon: Sparkles,
                      title: "Radical Authenticity",
                      description:
                        "We create a judgment-free space where members show up fully—with their shadows, gifts, questions, and truths. Masks are optional here. All are welcome as they are.",
                    },
                    {
                      icon: Leaf,
                      title: "Expanding Consciousness",
                      description:
                        "We are committed to growth, not perfection. We honor the messy, nonlinear path of awakening and hold space for each other's becoming. We hold each other to new standards of being, new standards of unconditional love and communal sovereignty.",
                    },
                    {
                      icon: Crown,
                      title: "Synarchy",
                      description:
                        "Evolutionary Leadership + Embodied Synthesis. We are setting a new standard for leadership, one rooted in unconditional love and service to others. We welcome all wisdom traditions, practices, and perspectives without dogma. From astrology to neuroscience, shamanism to psychology—truth lives in the synthesis.",
                    },
                    {
                      icon: Brain,
                      title: "Technology in Service of Consciousness",
                      description:
                        "AI and digital systems are not threats to humanity—they are mirrors and amplifiers. We design them to reflect our highest values and connect us to what matters most.",
                    },
                    {
                      icon: Globe,
                      title: "Collective Sovereignty",
                      description:
                        "Sovereignty as freedom through devotion, embodied value systems, community connection, and humility. Where each individual is empowered in their own unique expression while operating as a piece of the whole. Where each individual is unconditionally supported by the community and resources are shared.",
                    },
                  ].map((value, index) => {
                    const Icon = value.icon;
                    return (
                      <div key={index}>
                        <div className="mb-3 flex items-center gap-3">
                          <Icon className="h-6 w-6 text-[#facf39]" />
                          <h3
                            className="text-xl font-bold text-white"
                            style={{ fontFamily: "Bourton, sans-serif" }}
                          >
                            {value.title}
                          </h3>
                        </div>
                        <p className="pl-9 text-neutral-300 dark:text-neutral-300">
                          {value.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Soul Essence */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/40 bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 md:p-12">
                <h2
                  className="mb-6 text-center text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Soul Essence
                </h2>
                <div className="space-y-6 text-center">
                  <div>
                    <p className="mb-3 text-sm font-semibold tracking-wider text-[#facf39] uppercase">
                      Key Soul Words
                    </p>
                    <p className="text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                      Harmonic Collective Intelligence • Miracle consciousness •
                      Divine connection • Collective Sovereignty • Natural overflow
                      • Wisdom traditions • Regenerative • Overflow from base •
                      Grounded in reality • Love as practice • Unconditional Love •
                      New Earth • Kingdom of Heaven • Facilitating Synchronicity
                    </p>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-semibold tracking-wider text-[#facf39] uppercase">
                      Energy Signature
                    </p>
                    <p className="text-2xl font-bold text-white">
                      Synergistic • Synarchy • Grounded • Heaven on Earth
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="mb-20 text-center">
            <p
              className="mb-6 text-2xl text-neutral-300 dark:text-neutral-300 italic"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              Ready to join the movement?
            </p>
            <Link href="/community#waitlist-form">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-8 py-6 text-lg font-bold text-black shadow-2xl transition-all hover:scale-105"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Join the Waitlist
              </Button>
            </Link>
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
