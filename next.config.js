/**
 * Next.js configuration
 *
 * Note: Environment variable validation happens when env.js is imported in the app code,
 * not here. This prevents build failures when env vars aren't available during config evaluation.
 */

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // ESLint checked via pre-commit hook (husky) and npm run lint
    // Not blocking builds to allow incremental fixes
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // Friendly gallery paths: /gallery-1 -> /gallery/gallery-1
      {
        source: "/gallery-:slug",
        destination: "/gallery/gallery-:slug",
      },
    ];
  },
};

export default config;
