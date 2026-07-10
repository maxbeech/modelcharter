import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, CATEGORY_LABELS } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { HUBS, HUB_BY_SLUG, USE_CASES, USE_CASE_BY_SLUG } from "@/lib/registry-frameworks";
import { JsonLd } from "@/components/JsonLd";
import { RiskPill, Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta, datasetLd, breadcrumbLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...HUBS.map((h) => ({ framework: h.slug })), ...USE_CASES.map((u) => ({ framework: u.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ framework: string }> }): Promise<Metadata> {
  const { framework } = await params;
  const hub = HUB_BY_SLUG[framework];
  const uc = USE_CASE_BY_SLUG[framework];
  if (hub) return pageMeta({ title: hub.title, description: hub.blurb, path: `/compliance/${framework}`, keywords: [hub.keyword, `${hub.label.toLowerCase()} ai`, `is chatgpt ${hub.label.toLowerCase()} compliant`] });
  if (uc) return pageMeta({ title: uc.title, description: uc.blurb, path: `/compliance/${framework}`, keywords: [`ai tools for ${uc.label.toLowerCase()}`, `safe ai tools ${uc.label.toLowerCase()}`] });
  return {};
}

function ToolRow({ slug }: { slug: string }) {
  const t = TOOLS.find((x) => x.slug === slug)!;
  const r = scoreTool(t);
  return (
    <Link href={`/tools/${t.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:border-brand-300">
      <div>
        <span className="font-medium text-ink group-hover:text-brand-700">{t.name}</span>
        <span className="ml-2 text-xs text-ink-faint">{t.vendor} · {CATEGORY_LABELS[t.category]}</span>
      </div>
      <RiskPill band={r.band} score={r.score} />
    </Link>
  );
}

export default async function Page({ params }: { params: Promise<{ framework: string }> }) {
  const { framework } = await params;
  const hub = HUB_BY_SLUG[framework];
  const uc = USE_CASE_BY_SLUG[framework];
  if (!hub && !uc) notFound();

  if (hub) {
    const pass = TOOLS.filter(hub.match).map((t) => t.slug);
    return (
      <>
        <JsonLd data={datasetLd({ name: hub.title, description: hub.blurb, path: `/compliance/${framework}`, count: pass.length })} />
        <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compliance", path: "/compliance" }, { name: hub.label, path: `/compliance/${framework}` }])} />
        <PageHero eyebrow="Compliance" title={hub.title} intro={hub.blurb} />
        <Section className="py-10 sm:py-14">
          <p className="text-sm text-ink-faint">{pass.length} of {TOOLS.length} tools in the directory qualify on the facts we could verify. Always confirm the current tier and terms with the vendor.</p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">{pass.map((s) => <ToolRow key={s} slug={s} />)}</div>
          <p className="mt-8 text-sm text-ink-soft">Browse the full <Link href="/tools" className="text-brand-700 hover:underline">AI Tool Risk Directory</Link> or see other <Link href="/compliance" className="text-brand-700 hover:underline">compliance frameworks</Link>.</p>
        </Section>
      </>
    );
  }

  const u = uc!;
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compliance", path: "/compliance" }, { name: u.label, path: `/compliance/${framework}` }])} />
      <PageHero eyebrow="By industry" title={u.title} intro={u.intro} />
      <Section className="py-10 sm:py-14">
        {u.keyFrameworks.map((fw) => {
          const h = HUB_BY_SLUG[fw];
          if (!h) return null;
          const pass = TOOLS.filter(h.match).map((t) => t.slug);
          return (
            <div key={fw} className="mb-9">
              <h2 className="font-display text-lg font-semibold text-ink">{h.title} <span className="text-sm font-normal text-ink-faint">({pass.length})</span></h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">{pass.map((s) => <ToolRow key={s} slug={s} />)}</div>
            </div>
          );
        })}
        <p className="text-sm text-ink-soft">See every framework on the <Link href="/compliance" className="text-brand-700 hover:underline">compliance hub</Link>, or generate a tailored <Link href="/ai-usage-policy-generator" className="text-brand-700 hover:underline">AI usage policy</Link> for your team.</p>
      </Section>
    </>
  );
}
