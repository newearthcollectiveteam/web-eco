"use client";

import { CommunityLandingContent } from "~/components/community-landing-content";

export default function LocalCommunityLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-black dark:via-neutral-950 dark:to-black">
      {/* Flower of Life Shader Background - Only in Hero Section */}
      <div className="absolute inset-x-0 top-0 h-screen opacity-30 dark:opacity-25">
        <iframe
          src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
          className="h-full w-full border-0"
          style={{ pointerEvents: "none" }}
          title="Sacred Geometry Background"
        />
      </div>

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10">
        <CommunityLandingContent />
      </div>
    </div>
  );
}
