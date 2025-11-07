"use client";

import { useEffect, useState } from "react";
import { getDomainConfig } from "~/lib/domains";
import { DomainLayout } from "~/components/domain-layout";
import { NewEarthHomePage } from "~/components/pages/new-earth-home";
import { TestHomePage } from "~/components/pages/test-home";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  if (!mounted) {
    return (
      <DomainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Loading...</div>
        </div>
      </DomainLayout>
    );
  }

  const domainConfig = getDomainConfig(hostname);

  // Determine which page to render based on domain
  function renderDomainPage() {
    // Handle localhost with domain parameter
    if (hostname.includes("localhost")) {
      const urlParams = new URLSearchParams(window.location.search);
      const domain = urlParams.get("domain");

      // Check if domain parameter includes "test"
      if (domain?.includes("test")) {
        return <TestHomePage />;
      }

      return <NewEarthHomePage />; // Default for localhost
    }

    // Handle production domains
    if (hostname.includes("test.joinnewearthcollective.com")) {
      return <TestHomePage />;
    } else if (hostname.includes("joinnewearthcollective.com")) {
      return <NewEarthHomePage />;
    }

    // Default fallback
    return <NewEarthHomePage />;
  }

  return <DomainLayout hostname={hostname}>{renderDomainPage()}</DomainLayout>;
}
