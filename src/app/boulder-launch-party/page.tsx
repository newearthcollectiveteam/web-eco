"use client";

import { LaunchPartyContent } from "~/components/launch-party-content";
import { LazyShader } from "~/components/lazy-shader";

export default function LaunchPartyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-black dark:via-neutral-950 dark:to-black">
      {/* Flower of Life Shader Background - Only in Hero Section */}
      <LazyShader
        src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
        className="absolute inset-x-0 top-0 h-screen"
        title="Sacred Geometry Background"
        opacity={0.3}
      />

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-black/55 via-black/35 to-black/75" />

      {/* Content */}
      <div className="relative z-10">
        <LaunchPartyContent />
      </div>
    </div>
  );
}
