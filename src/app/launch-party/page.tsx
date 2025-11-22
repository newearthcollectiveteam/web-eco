"use client";

import { LaunchPartyContent } from "~/components/launch-party-content";

export default function LaunchPartyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-black dark:via-neutral-950 dark:to-black">
      {/* Static gradient background - no shader */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#facf39]/5 via-transparent to-[#f59e0b]/5" />

      {/* Content */}
      <div className="relative z-10">
        <LaunchPartyContent />
      </div>
    </div>
  );
}
