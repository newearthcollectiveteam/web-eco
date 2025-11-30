"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DomainLayout } from "~/components/domain-layout";
import { TestHomePage } from "~/components/pages/test-home";
import { MainHomePage } from "~/components/pages/main-home";
import { DOMAINS } from "~/lib/domains";

type DomainState = (typeof DOMAINS)[keyof typeof DOMAINS];

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState<DomainState | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    const domainParam = searchParams.get("domain")?.toLowerCase() || "";

    const host = (domainParam || hostname).split(",")[0]?.split(":")[0]?.trim();
    const isTest =
      host === "test" ||
      host?.includes("test.joinnewearthcollective.com") ||
      host === "test.joinnewearthcollective.com";
    const isLaunch =
      host === "launch" ||
      host?.includes("launch.joinnewearthcollective.com") ||
      host === "launch.joinnewearthcollective.com";

    if (isLaunch) {
      router.replace("/global");
      return;
    }

    setDomain(isTest ? DOMAINS.TEST_DOMAIN : DOMAINS.NEW_EARTH_COLLECTIVE);
  }, [router, searchParams]);

  // Avoid flashing the main placeholder while determining domain
  if (domain === null) {
    return null;
  }

  return (
    <DomainLayout hideAuthActions={domain === DOMAINS.NEW_EARTH_COLLECTIVE}>
      {domain === DOMAINS.TEST_DOMAIN ? <TestHomePage /> : <MainHomePage />}
    </DomainLayout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
