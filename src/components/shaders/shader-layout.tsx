"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ShaderLayoutProps {
  children: React.ReactNode;
}

function ShaderLayoutInner({ children }: ShaderLayoutProps) {
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

  const backHref = domainParam
    ? `/shaders?domain=${encodeURIComponent(domainParam)}`
    : "/shaders";

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fullscreen shader content */}
      {children}

      {/* Floating back button at bottom left */}
      <Link href={backHref} className="fixed bottom-8 left-8 z-50">
        <Button
          variant="secondary"
          size="lg"
          className="group shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back to Gallery
        </Button>
      </Link>
    </div>
  );
}

export function ShaderLayout({ children }: ShaderLayoutProps) {
  return (
    <Suspense fallback={null}>
      <ShaderLayoutInner>{children}</ShaderLayoutInner>
    </Suspense>
  );
}
