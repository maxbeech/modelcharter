import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, CATEGORY_LABELS, type AiTool } from "@/lib/ai-tools";
import { scoreTool, bandSummary } from "@/lib/risk";
import { popularComparePairs, parsePair } from "@/lib/compare";
import { JsonLd } from "@/components/JsonLd";
import { RiskPill, VerdictTag, Section } from "@/components/ui";
import { pageMeta, breadcrumbLd, faqLd } from "@/lib/seo";

// Any valid two-tool pair renders; popular pairs are pre-built, the rest render
// on demand and cache.
export const dynamicParams = true;
export function generateStaticParams() {
  return popularComparePairs().map((pair) => ({ pair }));
}

function resolve(pair: string): [AiTool, AiTool] | null {
  const parts = parsePair(pair);
  if (!parts) return null;
  const a = getTool(parts[0]);
  const b = getTool(parts[1]);
  return a && b ? [a, b] : null;
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const r = resolve(pair);
  if (!r) return {};
  const [a, b] = r;
  return pageMeta({
    title: `${a.name} vs ${b.name}: which is safer for work?`,
    description: `${a.name} and ${b.name} compared on data training, retention, SOC 2, GDPR DPA and HIPAA, sourced from each vendor's own policies and rated for at-work use.`,
    path: `/compare/${pair}`,
    keywords: [`${a.name.toLowerCase()} vs ${b.name.toLowerCase()}`, `${a.name.toLowerCase()} or ${b.name.toLowerCase()}`, "ai tool comparison"],
  });
}

const ROWS: { label: string; key: keyof AiTool; good: "yes" | "no" }[] = [
  { label: "Trains on consumer-tier data", key: "trainsOnPersonalData", good: "no" },
  { label: "SOC 2 Type II", key: "soc2", good: "yes" },
  { label: "ISO 27001", key: "iso27001", good: "yes" },
  { label: "GDPR DPA", key: "gdprDpa", good: "yes" },
  { label: "HIPAA BAA", key: "hipaaBaa", good: "yes" },
  { label: "EU data residency", key: "dataRegionEu", good: "yes" },
  { label: "SSO / SAML", key: "ssoSaml", good: "yes" },
];

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const r = resolve(pair);
  if (!r) notFound();
  const [a, b] = r;
  const ra = scoreTool(a), rb = scoreTool(b);
  const safer = ra.band === "Unrated" || rb.band === "Unrated" ? null : ra.score === rb.score ? null : ra.score < rb.score ? a : b;

  const faqs = [
    { q: `Is ${a.name} or ${b.name} safer for work?`, a: safer ? `${safer.name} scores lower risk for default at-work use. ${bandSummary(safer)}` : `${a.name} and ${b.name} are close on the facts we could verify. Check the specific tier each team would use.` },
    { q: `Does ${a.name} train on your data?`, a: bandSummary(a) },
    { q: `Does ${b.name} train on your data?`, a: bandSummary(b) },
  ];

  return (
    <>
      <JsonLd data={faqLd(faqs)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }, { name: `${a.name} vs ${b.name}`, path: `/compare/${pair}` }])} />

      <div className="border-b border-line bg-paper-glow">
        <Section className="py-10 sm:py-12">
          <nav className="text-sm text-ink-faint"><Link href="/compare" className="hover:text-brand-700">← Compare</Link></nav>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{a.name} vs {b.name}: which is safer for work?</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            {safer ? `On the facts we could verify, ${safer.name} carries lower data-exposure risk for default at-work use. Both should still be used on an approved tier for anything sensitive.` : `${a.name} and ${b.name} are close on the facts we could verify. The right choice comes down to the specific tier your team would use.`}
          </p>
        </Section>
      </div>

      <Section className="py-10 sm:py-12">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="py-3 text-left font-medium text-ink-faint">Fact</th>
                {[a, b].map((t) => { const rr = scoreTool(t); return (
                  <th key={t.slug} className="py-3 text-left">
                    <Link href={`/tools/${t.slug}`} className="font-display text-base font-semibold text-ink hover:text-brand-700">{t.name}</Link>
                    <div className="mt-1 flex items-center gap-2 font-normal"><RiskPill band={rr.band} score={rr.score} /></div>
                    <div className="mt-0.5 text-xs font-normal text-ink-faint">{t.vendor} · {CATEGORY_LABELS[t.category]}</div>
                  </th>
                ); })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-line/70">
                  <td className="py-2.5 pr-4 text-ink-soft">{row.label}</td>
                  <td className="py-2.5"><VerdictTag value={a[row.key] as AiTool["soc2"]} goodWhen={row.good} /></td>
                  <td className="py-2.5"><VerdictTag value={b[row.key] as AiTool["soc2"]} goodWhen={row.good} /></td>
                </tr>
              ))}
              <tr className="border-b border-line/70">
                <td className="py-2.5 pr-4 text-ink-soft">Data retention</td>
                <td className="py-2.5 text-ink-soft">{a.retention ?? "Unverified"}</td>
                <td className="py-2.5 text-ink-soft">{b.retention ?? "Unverified"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          Full profiles: <Link href={`/tools/${a.slug}`} className="text-brand-700 hover:underline">{a.name}</Link> · <Link href={`/tools/${b.slug}`} className="text-brand-700 hover:underline">{b.name}</Link>. Facts are sourced from each vendor's own policies; confirm the tier before relying on them.
        </p>
      </Section>
    </>
  );
}
