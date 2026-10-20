import type { Metadata } from "next";
import { TOOLS } from "@/lib/ai-tools";
import { Suspense } from "react";
import { PolicyGenerator, PolicyGeneratorFromUrl } from "@/components/PolicyGenerator";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { pageMeta, softwareAppLd, faqLd, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free AI Usage Policy Generator",
  description:
    "Generate a tailored AI usage policy for your company. Free, no signup. Covers approved tools, data rules, disclosure and the EU AI Act, NIST AI RMF, ISO 42001 and SOC 2. Download as Markdown or PDF.",
  path: "/ai-usage-policy-generator",
  keywords: ["ai usage policy", "ai usage policy template", "ai acceptable use policy", "ai policy generator", "employee ai policy", "hipaa ai policy", "ai policy for healthcare"],
});

const FAQS = [
  { q: "What should an AI usage policy include?", a: "At minimum: who it applies to, which AI tools are approved, what data may and may not be entered into AI tools, transparency and disclosure rules, any regulatory obligations (EU AI Act, GDPR, HIPAA, SOC 2), and who owns the policy and handles breaches. ModelCharter's generator produces all of these, tailored to your answers." },
  { q: "Is this AI usage policy template free?", a: "Yes. The generator is free with no signup. You can copy the policy, download it as Markdown, or save it as a PDF. Treat it as a strong starting point, and have your own legal or compliance advisor review it before adopting." },
  { q: "How is this different from a static template?", a: "A static template is one-size-fits-all. This generator changes the actual clauses based on your industry, risk stance, what data your team handles, your approved tools and which regulations apply, so you get a policy that fits your company, not a generic document." },
];

export default function Page() {
  const today = new Date().toISOString().slice(0, 10);
  const toolNames = TOOLS.map((t) => t.name);
  const baaToolNames = TOOLS.filter((t) => t.hipaaBaa === "yes").map((t) => t.name);
  return (
    <>
      <JsonLd data={softwareAppLd("AI Usage Policy Generator", metadata.description as string, "/ai-usage-policy-generator")} />
      <JsonLd data={faqLd(FAQS)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI Usage Policy Generator", path: "/ai-usage-policy-generator" }])} />

      <PageHero
        eyebrow="Free tool"
        title="The AI usage policy generator"
        intro="Answer a few questions and get a tailored AI usage policy you can adopt today. It adapts to your industry, how permissive you want to be, what data your team handles, and the rules you are held to. No signup: copy, download or save as PDF."
      />

      <Section className="py-10 sm:py-14">
        <Suspense fallback={<PolicyGenerator today={today} toolNames={toolNames} baaToolNames={baaToolNames} />}>
          <PolicyGeneratorFromUrl today={today} toolNames={toolNames} baaToolNames={baaToolNames} />
        </Suspense>
      </Section>

      <FaqSection title="AI usage policy questions, answered" faqs={FAQS} />
    </>
  );
}
