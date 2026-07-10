import type { Metadata } from "next";
import { TOOLS, CATEGORY_LABELS, DATASET_GENERATED } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { ToolDirectory, type DirItem } from "@/components/ToolDirectory";
import { pageMeta, datasetLd, breadcrumbLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "AI Tool Risk Directory: is that AI tool safe for work?",
  description:
    "How 60+ popular AI tools handle your data: whether they train on it, retention, and their SOC 2, GDPR DPA and HIPAA status. Each is rated for default at-work use and sourced from the vendor's own policies. ChatGPT, Claude, Gemini, Copilot, Otter and more.",
  path: "/tools",
  keywords: ["ai tool risk", "is chatgpt safe for work", "ai tool directory", "ai vendor risk", "which ai tools are safe"],
});

const FAQS = [
  { q: "How are the risk ratings calculated?", a: "Each tool is scored on the data exposure an employee creates by using its default or consumer tier at work: whether it trains on your inputs, retention, and whether it holds SOC 2, ISO 27001, a GDPR DPA, EU data residency, SSO and a HIPAA BAA. The score is transparent: every point is explained on the tool's page." },
  { q: "Are these facts official?", a: "Yes. They are compiled from each vendor's privacy policy, DPA and trust centre, with source links on every tool page. Anything we could not verify is shown as Unverified rather than guessed." },
  { q: "Which AI tools are safest for work?", a: "Tools that do not train on your data and hold SOC 2 or a GDPR DPA score lowest. On their business tiers, assistants like ChatGPT Enterprise, Claude for Work and Microsoft 365 Copilot rate well. Image tools that train on all inputs, such as Midjourney, rate highest-risk." },
];

export default function Page() {
  const items: DirItem[] = TOOLS.map((t) => {
    const r = scoreTool(t);
    return { slug: t.slug, name: t.name, vendor: t.vendor, category: t.category, categoryLabel: CATEGORY_LABELS[t.category] ?? t.category, notableRisk: t.notableRisk ?? "", band: r.band, score: r.score };
  });
  return (
    <>
      <JsonLd data={datasetLd({ name: "AI Tool Risk Directory", description: metadata.description as string, path: "/tools", count: TOOLS.length })} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI Tool Risk Directory", path: "/tools" }])} />
      <JsonLd data={faqLd(FAQS)} />

      <PageHero
        eyebrow="AI Tool Risk Directory"
        title="Is that AI tool safe for work?"
        intro={`Before your team uses an AI tool at work, know how it treats your data. We rate ${TOOLS.length} popular tools for default at-work use: whether they train on your inputs, how long they keep data, and which certifications they hold. Everything is sourced from the vendor's own policies.`}
      >
        <p className="mt-4 text-sm text-ink-faint">Facts compiled {DATASET_GENERATED}. Always confirm against the linked source before relying on a fact.</p>
      </PageHero>

      <Section className="py-10 sm:py-14">
        <ToolDirectory items={items} />
      </Section>

      <FaqSection title="About the directory" faqs={FAQS} />
    </>
  );
}
