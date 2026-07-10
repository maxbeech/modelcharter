import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/ai-tools";
import { FRAMEWORKS } from "@/lib/frameworks";
import { POSTS } from "@/lib/posts";
import { QUESTION_SLUGS } from "@/lib/registry-questions";
import { HUBS, USE_CASES } from "@/lib/registry-frameworks";
import { popularComparePairs } from "@/lib/compare";
import { GLOSSARY } from "@/lib/glossary";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE.url}${p}`;
  const last = new Date(SITE.updated);
  const statics = ["/", "/ai-usage-policy-generator", "/ai-vendor-risk-assessment", "/tools", "/compliance", "/compare", "/glossary", "/frameworks", "/pricing", "/blog", "/about", "/contact", "/privacy", "/terms", "/security"];
  return [
    ...statics.map((p) => ({ url: u(p), lastModified: last, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...TOOLS.map((t) => ({ url: u(`/tools/${t.slug}`), lastModified: last, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...TOOLS.flatMap((t) => QUESTION_SLUGS.map((q) => ({ url: u(`/tools/${t.slug}/${q}`), lastModified: last, changeFrequency: "monthly" as const, priority: 0.6 }))),
    ...HUBS.map((h) => ({ url: u(`/compliance/${h.slug}`), lastModified: last, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...USE_CASES.map((uc) => ({ url: u(`/compliance/${uc.slug}`), lastModified: last, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...popularComparePairs().map((p) => ({ url: u(`/compare/${p}`), lastModified: last, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...GLOSSARY.map((t) => ({ url: u(`/glossary/${t.slug}`), lastModified: last, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...FRAMEWORKS.map((f) => ({ url: u(`/frameworks/${f.slug}`), lastModified: new Date(f.reviewed), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...POSTS.map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
