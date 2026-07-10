import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GLOSSARY, getTerm } from "@/lib/glossary";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { CtaBanner } from "@/components/page";
import { pageMeta, breadcrumbLd, faqLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params;
  const t = getTerm(term);
  if (!t) return {};
  return pageMeta({
    title: `${t.term}: what it means`,
    description: t.short,
    path: `/glossary/${t.slug}`,
    keywords: [t.keyword, t.term.toLowerCase(), ...(t.aka ?? []).map((a) => a.toLowerCase())],
  });
}

export default async function Page({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const t = getTerm(term);
  if (!t) notFound();
  const related = (t.related ?? []).map(getTerm).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <>
      <JsonLd data={faqLd([{ q: `What is ${t.term}?`, a: t.short }])} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }, { name: t.term, path: `/glossary/${t.slug}` }])} />
      <Section className="py-10 sm:py-14">
        <nav className="text-sm text-ink-faint"><Link href="/glossary" className="hover:text-brand-700">← Glossary</Link></nav>
        <article className="mt-5 max-w-2xl">
          <h1 className="font-display text-[2.1rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.5rem]">{t.term}</h1>
          {t.aka && t.aka.length > 0 && <p className="mt-2 text-sm text-ink-faint">Also: {t.aka.join(", ")}</p>}
          <p className="mt-4 rounded-xl bg-paper-glow px-4 py-3 text-lg leading-relaxed text-ink ring-1 ring-inset ring-line">{t.short}</p>
          <div className="mt-7 space-y-6">
            {t.body.map((s, i) => (
              <div key={i}>
                {s.h && <h2 className="mb-1.5 font-display text-xl font-semibold text-ink">{s.h}</h2>}
                <p className="leading-[1.75] text-ink-soft">{s.p}</p>
              </div>
            ))}
          </div>
          {related.length > 0 && (
            <div className="mt-9 border-t border-line pt-6">
              <h2 className="text-sm font-semibold text-ink">Related terms</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/glossary/${r.slug}`} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink-soft ring-1 ring-inset ring-line transition-colors hover:border-brand-300 hover:text-brand-700">{r.term}</Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </Section>
      <CtaBanner title="See which tools pass" body="The AI Tool Risk Directory checks every tool against these controls, sourced from the vendor's own policies." href="/tools" label="Browse the directory" />
    </>
  );
}
