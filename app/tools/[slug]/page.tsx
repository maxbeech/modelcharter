import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getTool, CATEGORY_LABELS, type AiTool } from "@/lib/ai-tools";
import { scoreTool, bandSummary } from "@/lib/risk";
import { allQuestions } from "@/lib/registry-questions";
import { JsonLd } from "@/components/JsonLd";
import { RiskPill, VerdictTag, Section } from "@/components/ui";
import { RiskGauge } from "@/components/marketing";
import { pageMeta, faqLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) return {};
  return pageMeta({
    title: `Is ${t.name} safe for work? Data & privacy risk`,
    description: bandSummary(t) + ` See ${t.name}'s data training, retention, SOC 2, GDPR DPA and HIPAA status, sourced from ${t.vendor}'s own policies.`,
    path: `/tools/${t.slug}`,
    keywords: [`is ${t.name.toLowerCase()} safe`, `${t.name.toLowerCase()} privacy`, `${t.name.toLowerCase()} data`, `does ${t.name.toLowerCase()} train on your data`],
  });
}

function toolFaqs(t: AiTool) {
  const train = t.trainsOnPersonalData === "no" ? `No. On its consumer tier ${t.name} does not train on your data by default.`
    : t.trainsOnPersonalData === "opt-out" ? `By default it can: on the consumer tier ${t.name} uses your inputs to improve models unless you opt out. Its business tier does not.`
    : t.trainsOnPersonalData === "yes" ? `Yes. ${t.name} trains on your inputs, and there is no reliable opt-out on the default tier.`
    : `This is not confirmed in ${t.vendor}'s public policy, so treat it as unverified.`;
  return [
    { q: `Does ${t.name} train on your data?`, a: train + (t.trainsPersonalNote ? ` ${t.trainsPersonalNote}` : "") },
    { q: `Is ${t.name} SOC 2 compliant?`, a: t.soc2 === "yes" ? `${t.name} reports a SOC 2 Type II attestation.` : t.soc2 === "no" ? `We found no SOC 2 attestation for ${t.name}.` : `We could not confirm a SOC 2 attestation for ${t.name}, so treat it as unverified.` },
    { q: `Is ${t.name} safe to use at work?`, a: bandSummary(t) + (t.enterprisePlan ? ` For sensitive data, use ${t.enterprisePlan}, which adds admin controls and excludes your data from training.` : "") },
  ];
}

const FACTS: { label: string; key: keyof AiTool; good: "yes" | "no" }[] = [
  { label: "Trains on consumer-tier data", key: "trainsOnPersonalData", good: "no" },
  { label: "Trains on business-tier data", key: "trainsOnBusinessData", good: "no" },
  { label: "Training opt-out available", key: "trainingOptout", good: "yes" },
  { label: "SOC 2 Type II", key: "soc2", good: "yes" },
  { label: "ISO 27001", key: "iso27001", good: "yes" },
  { label: "ISO 42001 (AI management)", key: "iso42001", good: "yes" },
  { label: "GDPR Data Processing Addendum", key: "gdprDpa", good: "yes" },
  { label: "HIPAA BAA", key: "hipaaBaa", good: "yes" },
  { label: "EU data residency", key: "dataRegionEu", good: "yes" },
  { label: "SSO / SAML", key: "ssoSaml", good: "yes" },
];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();
  const r = scoreTool(t);
  const faqs = toolFaqs(t);
  const related = TOOLS.filter((x) => x.category === t.category && x.slug !== t.slug).slice(0, 3);
  const confidenceNote = t.confidence === "verify" ? "facts partly unverified, check sources" : `facts (${t.confidence}-confidence)`;

  return (
    <>
      <JsonLd data={softwareAppLd(t.name, `${t.name} by ${t.vendor}: AI tool data and privacy risk profile.`, `/tools/${t.slug}`)} />
      <JsonLd data={faqLd(faqs)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI Tool Risk Directory", path: "/tools" }, { name: t.name, path: `/tools/${t.slug}` }])} />

      <div className="border-b border-line bg-paper-glow">
        <Section className="py-10 sm:py-12">
          <nav className="text-sm text-ink-faint"><Link href="/tools" className="hover:text-brand-700">← AI Tool Risk Directory</Link></nav>
          <div className="mt-5 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Is {t.name} safe for work?</h1>
                <RiskPill band={r.band} score={r.score} />
              </div>
              <p className="mt-2 text-sm text-ink-faint">{t.vendor} · {CATEGORY_LABELS[t.category]} · {confidenceNote}</p>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{bandSummary(t)}</p>
            </div>
            <div className="hidden sm:block"><RiskGauge score={r.score} band={r.band} size={140} /></div>
          </div>
          {t.notableRisk && <p className="mt-5 max-w-2xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100"><strong>Watch out:</strong> {t.notableRisk}</p>}
        </Section>
      </div>

      <Section className="py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,320px)]">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Data and compliance facts</h2>
            <dl className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
              {FACTS.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-sm text-ink-soft">{f.label}</dt>
                  <dd className="text-sm"><VerdictTag value={t[f.key] as AiTool["soc2"]} goodWhen={f.good} /></dd>
                </div>
              ))}
              {t.retention && <div className="px-4 py-2.5"><dt className="text-sm font-medium text-ink">Data retention</dt><dd className="mt-0.5 text-sm text-ink-soft">{t.retention}</dd></div>}
              {t.enterprisePlan && <div className="px-4 py-2.5"><dt className="text-sm font-medium text-ink">Safer tier</dt><dd className="mt-0.5 text-sm text-ink-soft">{t.enterprisePlan}</dd></div>}
            </dl>

            <h2 className="mt-8 font-display text-xl font-semibold text-ink">Why it scores {r.score} out of 100</h2>
            {r.factors.length === 0
              ? <p className="mt-2 text-sm text-ink-soft">No risk factors flagged. Strong default data handling.</p>
              : <ul className="mt-3 space-y-2">{r.factors.map((f) => (
                  <li key={f.label} className="flex gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm">
                    <span className="font-mono font-semibold text-ink-faint">+{f.points}</span>
                    <span><span className="font-semibold text-ink">{f.label}.</span> <span className="text-ink-soft">{f.detail}</span></span>
                  </li>))}
                </ul>}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold text-ink">Sources</h3>
              <ul className="mt-2.5 space-y-2 text-sm">
                <li><a href={t.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">{t.name} website ↗</a></li>
                {t.privacyUrl && <li><a href={t.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">Privacy policy ↗</a></li>}
                {t.dpaUrl && <li><a href={t.dpaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">Data Processing Addendum ↗</a></li>}
                {t.trustUrl && <li><a href={t.trustUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">Trust / security centre ↗</a></li>}
                {t.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-brand-700 hover:underline">{s.claim || "Source"} ↗</a></li>)}
              </ul>
            </div>
            <div className="rounded-2xl bg-brand-800 p-5 text-white">
              <h3 className="font-semibold">Make {t.name} an approved tool</h3>
              <p className="mt-1 text-sm text-brand-100">Generate a free AI usage policy that lists your approved tools and data rules.</p>
              <Link href="/ai-usage-policy-generator" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">Generate a policy →</Link>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">Common questions about {t.name}</h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {allQuestions().map((q) => (
              <Link key={q.slug} href={`/tools/${t.slug}/${q.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm transition-colors hover:border-brand-300">
                <span className="font-medium text-ink">{q.ask(t.name)}</span>
                <span className="flex-none text-brand-700">→</span>
              </Link>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink">Other {CATEGORY_LABELS[t.category].toLowerCase()}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((x) => { const rr = scoreTool(x); return (
                <Link key={x.slug} href={`/tools/${x.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-white p-3.5 text-sm transition-colors hover:border-brand-300">
                  <span className="font-medium text-ink">{x.name}</span><RiskPill band={rr.band} />
                </Link>); })}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
