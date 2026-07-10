import type { Metadata } from "next";
import Link from "next/link";
import { getTool } from "@/lib/ai-tools";
import { popularComparePairs, parsePair } from "@/lib/compare";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Compare AI tools on data privacy and compliance",
  description:
    "Side-by-side AI tool comparisons on the facts that matter for work: training on your data, retention, SOC 2, GDPR DPA and HIPAA BAA. ChatGPT vs Claude, Copilot vs Cursor and more.",
  path: "/compare",
  keywords: ["compare ai tools", "chatgpt vs claude", "ai tool comparison privacy", "which ai tool is safer"],
});

export default function Page() {
  const pairs = popularComparePairs()
    .map((p) => ({ p, parts: parsePair(p) }))
    .filter((x): x is { p: string; parts: [string, string] } => !!x.parts && !!getTool(x.parts[0]) && !!getTool(x.parts[1]));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <PageHero
        eyebrow="Compare"
        title="Compare AI tools on privacy and compliance"
        intro="The safety question is rarely which tool is smartest; it is which one treats your data acceptably. These comparisons line the tools up on the facts that decide it."
      />
      <Section className="grid gap-3 py-12 sm:grid-cols-2 sm:py-16">
        {pairs.map(({ p, parts }) => {
          const a = getTool(parts[0])!, b = getTool(parts[1])!;
          return (
            <Link key={p} href={`/compare/${p}`} className="group flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
              <span className="font-display text-lg font-semibold text-ink group-hover:text-brand-700">{a.name} vs {b.name}</span>
              <span className="text-sm font-semibold text-brand-700">Compare →</span>
            </Link>
          );
        })}
      </Section>
    </>
  );
}
