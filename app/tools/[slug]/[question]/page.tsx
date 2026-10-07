import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getTool, CATEGORY_LABELS } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { QUESTION_SLUGS, getQuestion, allQuestions, evidenceForQuestion } from "@/lib/registry-questions";
import { JsonLd } from "@/components/JsonLd";
import { RiskPill, Section } from "@/components/ui";
import { pageMeta, faqLd, breadcrumbLd } from "@/lib/seo";

// Head-term registry pages: "Is ChatGPT HIPAA compliant?", "Does Claude train
// on your data?" etc. One page per tool x question, answered from the same
// sourced facts as the tool profile. This is the flagship GEO/citation surface.

export const dynamicParams = false;
// Keep question pages fresh without spending origin work on every request.
export const revalidate = 604800;
export function generateStaticParams() {
  return TOOLS.flatMap((t) => QUESTION_SLUGS.map((q) => ({ slug: t.slug, question: q })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; question: string }> }): Promise<Metadata> {
  const { slug, question } = await params;
  const t = getTool(slug);
  const q = getQuestion(question);
  if (!t || !q) return {};
  const title = q.ask(t.name);
  return pageMeta({
    title,
    description: q.answer(t).slice(0, 155),
    path: `/tools/${t.slug}/${q.slug}`,
    keywords: q.keywords(t.name.toLowerCase()),
  });
}

const PASS_LABEL: Record<string, { text: string; cls: string }> = {
  yes: { text: "Yes", cls: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  no: { text: "No", cls: "bg-red-100 text-red-800 ring-red-200" },
  unverified: { text: "Unverified", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default async function Page({ params }: { params: Promise<{ slug: string; question: string }> }) {
  const { slug, question } = await params;
  const t = getTool(slug);
  const q = getQuestion(question);
  if (!t || !q) notFound();
  const r = scoreTool(t);
  const pass = q.passes(t);
  const badge = pass === null ? PASS_LABEL.unverified : pass ? PASS_LABEL.yes : PASS_LABEL.no;
  const others = allQuestions().filter((x) => x.slug !== q.slug);
  const evidence = evidenceForQuestion(t, q.slug);

  const faqs = [{ q: q.ask(t.name), a: q.answer(t) }];

  return (
    <>
      <JsonLd data={faqLd(faqs)} />
      <JsonLd data={breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "AI Tool Risk Directory", path: "/tools" },
        { name: t.name, path: `/tools/${t.slug}` },
        { name: q.label, path: `/tools/${t.slug}/${q.slug}` },
      ])} />

      <div className="border-b border-line bg-paper-glow">
        <Section className="py-10 sm:py-12">
          <nav className="text-sm text-ink-faint"><Link href={`/tools/${t.slug}`} className="hover:text-brand-700">← {t.name}</Link></nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{q.ask(t.name)}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.cls}`}>{badge.text}</span>
          </div>
          <p className="mt-2 text-sm text-ink-faint">{t.vendor} · {CATEGORY_LABELS[t.category]}</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{q.answer(t)}</p>
        </Section>
      </div>

      <Section className="py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,300px)]">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">What we checked</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              This assessment separates the consumer product from any business plan. It uses the vendor documents linked below; an unverified item is not a pass.
            </p>
            <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
              {evidence.map((item) => (
                <div key={item.label} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <dt className="text-sm font-semibold text-ink">{item.label}</dt>
                    <dd className="text-sm font-medium text-brand-700">{item.value}</dd>
                  </div>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{item.explanation}</dd>
                </div>
              ))}
            </dl>

            {t.notableRisk && (
              <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 ring-1 ring-inset ring-amber-100">
                <span className="font-semibold">Practical risk:</span> {t.notableRisk}
              </div>
            )}

            <h2 className="mt-8 font-display text-xl font-semibold text-ink">How to make a decision</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Check the precise account tier, written contract and intended data before approving {t.name}. A security certification, DPA or setting can apply to only part of a vendor's service. Keep the source links with your supplier review and revisit them when the vendor changes its terms.
            </p>

            <h2 className="mt-8 font-display text-xl font-semibold text-ink">More on {t.name}</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/tools/${t.slug}/${o.slug}`} className="rounded-xl border border-line bg-white px-4 py-3 text-sm transition-colors hover:border-brand-300">
                  <span className="font-medium text-ink">{o.ask(t.name)}</span>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-ink-soft">
              See the full <Link href={`/tools/${t.slug}`} className="text-brand-700 hover:underline">{t.name} risk profile</Link>, with every data-handling fact and its source, or browse all <Link href="/tools" className="text-brand-700 hover:underline">rated AI tools</Link>.
            </p>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Overall risk</h3>
                <RiskPill band={r.band} score={r.score} />
              </div>
              <p className="mt-2 text-sm text-ink-soft">For default at-work use, sourced from {t.vendor}'s own policies.</p>
              {t.sources.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {t.sources.slice(0, 3).map((source) => (
                    <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">{source.claim || "Vendor source"} ↗</a></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl bg-brand-800 p-5 text-white">
              <h3 className="font-semibold">Approve it properly</h3>
              <p className="mt-1 text-sm text-brand-100">Generate a free AI usage policy that names your approved tools and tiers.</p>
              <Link href="/ai-usage-policy-generator" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">Generate a policy →</Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
