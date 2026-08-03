import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Same allow/disallow as "*", but named explicitly so AI crawlers and
// answer engines are deliberately welcomed rather than only implicitly
// allowed by the wildcard (and so a future edit to "*" can't silently
// wall them off). This is the GEO strategy: llms.txt and JSON-LD are only
// useful if the bots that consume them can actually reach the site.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  "Amazonbot",
];

const DISALLOW = ["/dashboard", "/api/", "/attest/", "/login", "/signup"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
