"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({
  href = "/",
  label = "Back to Hub",
}: BackButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [domainParam, setDomainParam] = useState(
    () => searchParams.get("domain") || ""
  );

  useEffect(() => {
    const paramFromSearch = searchParams.get("domain");
    if (paramFromSearch) {
      setDomainParam(paramFromSearch);
      return;
    }

    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (host.includes("test.joinnewearthcollective.com")) {
        setDomainParam("test.joinnewearthcollective.com");
      }
    }
  }, [searchParams]);

  const handleClick = () => {
    if (href) {
      // Preserve test domain query when present
      const hasDomainAlready = href.includes("domain=");
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      let targetHref = href;

      if (!hasDomainAlready) {
        const activeDomain =
          domainParam || (isLocal ? "test.joinnewearthcollective.com" : "");

        if (activeDomain && href.startsWith("/")) {
          const separator = href.includes("?") ? "&" : "?";
          targetHref = `${href}${separator}domain=${encodeURIComponent(
            activeDomain
          )}`;
        }
      }

      // Fallback for local root without a detected domain
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const isLocalHost =
          hostname === "localhost" || hostname === "127.0.0.1";
        if (isLocalHost && href === "/" && !hasDomainAlready && !domainParam) {
          window.location.href = "/?domain=test.joinnewearthcollective.com";
          return;
        }
      }

      router.push(targetHref);
    } else {
      router.back();
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 left-6 z-50 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      aria-label={label}
    >
      <Home className="mr-2 h-5 w-5" />
      {label}
    </Button>
  );
}
