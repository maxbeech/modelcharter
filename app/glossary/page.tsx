import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "AI governance glossary: HIPAA BAA, SOC 2, DPA and more",
  description:
    "Plain-English definitions of the compliance terms behind AI tool risk: HIPAA BAA, SOC 2, GDPR DPA, ISO 27001, subprocessors, model training, shadow AI and more.",
  path: "/glossary",
  keywords: ["ai governance glossary", "hipaa baa", "gdpr dpa", "what is soc 2", "ai compliance terms"],
});

export default function Page() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }])} />
      <PageHero
        eyebrow="Glossary"
        title="The compliance terms behind AI tool risk"
        intro="Every term the AI Tool Risk Directory checks, defined in one plain sentence, then explained. Written for a team that has to make a call, not pass an exam."
      />
      <Section className="grid gap-4 py-12 sm:grid-cols-2 sm:py-16">
        {terms.map((t) => (
          <Link key={t.slug} href={`/glossary/${t.slug}`} className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
            <h2 className="font-display text-lg font-semibold text-ink group-hover:text-brand-700">{t.term}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t.short}</p>
          </Link>
        ))}
      </Section>
    </>
  );
}
