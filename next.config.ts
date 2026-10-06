import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "maxed-labs",
  project: process.env.SENTRY_PROJECT || "modelcharter_web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: { treeshake: { removeDebugLogging: true } },
  // Route browser reports through our own domain so an ad blocker cannot
  // silently drop them. `true` picks a random path per build (a fixed
  // "/monitoring" is on ad-blocker lists).
  tunnelRoute: true,
});
