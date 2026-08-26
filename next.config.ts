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
  org: "maxed-labs",
  project: "modelcharter_web",
  silent: true,
  widenClientFileUpload: true,
  webpack: { treeshake: { removeDebugLogging: true }, automaticVercelMonitors: true },
});
