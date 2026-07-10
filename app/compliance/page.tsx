import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/ai-tools";
import { HUBS, USE_CASES } from "@/lib/registry-frameworks";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Compliant AI tools by framework: HIPAA, GDPR, SOC 2, ISO 27001",
  description:
    "Which AI tools meet HIPAA, GDPR, SOC 2 and ISO 27001, and which do not train on your data. Each list is computed from the vendor's own sourced facts and rated for at-work use.",
  path: "/compliance",
  keywords: ["hipaa compliant ai tools", "gdpr ai tools", "soc 2 ai tools", "ai tools that don't train on your data"],
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compliance", path: "/compliance" }])} />
      <PageHero
        eyebrow="Compliance"
        title="Compliant AI tools, by framework"
        intro="Filter the AI Tool Risk Directory by the control you actually need to satisfy. Each list is computed from the same sourced facts as the tool profiles, so it never drifts."
      />
      <Section className="py-12 sm:py-16">
        <h2 className="font-display text-lg font-semibold text-ink">By framework</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {HUBS.map((h) => {
            const count = TOOLS.filter(h.match).length;
            return (
              <Link key={h.slug} href={`/compliance/${h.slug}`} className="group rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-brand-700">{h.title}</h3>
                  <span className="flex-none text-sm font-semibold text-brand-700">{count}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{h.blurb}</p>
              </Link>
            );
          })}
        </div>

        <h2 className="mt-12 font-display text-lg font-semibold text-ink">By industry</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {USE_CASES.map((u) => (
            <Link key={u.slug} href={`/compliance/${u.slug}`} className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-inset ring-line transition-colors hover:border-brand-300 hover:text-brand-700">
              {u.label}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
