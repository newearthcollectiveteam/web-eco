"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { DomainLayout } from "~/components/domain-layout";
import { BackButton } from "~/components/back-button";
import { ArrowRight, Globe2 } from "lucide-react";

function EcosystemMapContent() {
  return (
    <DomainLayout>
      <Suspense fallback={null}>
        <BackButton />
      </Suspense>
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <section className="mb-12 text-center">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative h-20 w-20">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <h1
              className="mb-4 text-5xl font-bold text-black dark:text-white md:text-6xl"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              Ecosystem Map
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
              Complete site structure across all domains
            </p>
          </section>

          {/* Main Map Card */}
          <Card className="mx-auto max-w-5xl border-2 border-[#facf39]/20 bg-gradient-to-br from-white to-neutral-50 shadow-lg dark:from-neutral-900 dark:to-black">
            <CardContent className="p-8">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] shadow-lg">
                  <Globe2 className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3
                    className="text-2xl font-bold text-black dark:text-white"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Domain Ecosystem
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    All pages and routes across the platform
                  </p>
                </div>
              </div>

              {/* joinnewearthcollective.com */}
              <div className="mb-8">
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                  <span className="text-[#facf39]">●</span>
                  joinnewearthcollective.com
                </h4>
                <div className="ml-6 space-y-2">
                  <Link
                    href="/?domain=joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/ (Home)</span>
                  </Link>
                  <Link
                    href="/about?domain=joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/about</span>
                  </Link>
                </div>
              </div>

              {/* launch.joinnewearthcollective.com */}
              <div className="mb-8">
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                  <span className="text-[#facf39]">●</span>
                  launch.joinnewearthcollective.com
                </h4>
                <div className="ml-6 space-y-2">
                  <Link
                    href="/global?domain=launch.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/global (Waitlist Landing)</span>
                  </Link>
                  <Link
                    href="/boulder-launch-party?domain=launch.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/boulder-launch-party</span>
                  </Link>
                  <Link
                    href="/questionnaire?domain=launch.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/questionnaire</span>
                  </Link>
                  <Link
                    href="/unsubscribe?domain=launch.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/unsubscribe</span>
                  </Link>
                </div>
              </div>

              {/* test.joinnewearthcollective.com */}
              <div className="mb-8">
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                  <span className="text-[#facf39]">●</span>
                  test.joinnewearthcollective.com
                </h4>
                <div className="ml-6 space-y-2">
                  <Link
                    href="/?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/ (Dev Hub)</span>
                  </Link>
                  <Link
                    href="/brand?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/brand</span>
                  </Link>
                  <Link
                    href="/templates?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/templates</span>
                  </Link>
                  <Link
                    href="/shaders?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/shaders</span>
                  </Link>
                  <Link
                    href="/playground?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/playground</span>
                  </Link>
                  <Link
                    href="/gallery?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/gallery</span>
                  </Link>
                  <Link
                    href="/form-builder?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/form-builder</span>
                  </Link>
                </div>
              </div>

              {/* Misc */}
              <div>
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                  <span className="text-[#facf39]">●</span>
                  Misc
                </h4>
                <div className="ml-6 space-y-2">
                  <Link
                    href="/login?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/login (join)</span>
                  </Link>
                  <Link
                    href="/about-community?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/about-community (join)</span>
                  </Link>
                  <Link
                    href="/local-community?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/local-community (join)</span>
                  </Link>
                  <Link
                    href="/onboarding?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/onboarding (join)</span>
                  </Link>
                  <Link
                    href="/profile?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/profile (join)</span>
                  </Link>
                  <Link
                    href="/auth/signup?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/auth/signup (join)</span>
                  </Link>
                  <Link
                    href="/auth/forgot-password?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/auth/forgot-password (join)</span>
                  </Link>
                  <Link
                    href="/auth/reset-password?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/auth/reset-password (join)</span>
                  </Link>
                  <Link
                    href="/auth/pending-approval?domain=test.joinnewearthcollective.com"
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#facf39] dark:text-neutral-400"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>/auth/pending-approval (join)</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DomainLayout>
  );
}

export default function EcosystemMapPage() {
  return (
    <Suspense fallback={null}>
      <EcosystemMapContent />
    </Suspense>
  );
}
