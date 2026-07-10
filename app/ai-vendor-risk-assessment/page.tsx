import type { Metadata } from "next";
import { TOOLS } from "@/lib/ai-tools";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { RiskAssessment } from "@/components/RiskAssessment";
import { pageMeta, softwareAppLd, breadcrumbLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free AI vendor risk assessment tool",
  description:
    "Assess whether an AI tool is safe for the data you would put into it. Pick a tool and your data types for an explainable approve, conditional or reject verdict you can export, sourced from vendor policies.",
  path: "/ai-vendor-risk-assessment",
  keywords: ["ai vendor risk assessment", "ai tool risk assessment", "is this ai tool safe", "ai vendor security assessment"],
});

const FAQS = [
  { q: "How does the assessment decide?", a: "It combines the data you would enter (public, PII, PHI, financial, source code, confidential) with the tool's sourced facts: whether it trains on your data, and its HIPAA BAA, SOC 2 and GDPR DPA status. PHI without a BAA, or sensitive data with default training, produces a reject or conditional verdict." },
  { q: "Is it a substitute for legal or security review?", a: "No. It is a fast first-pass triage to focus your review, not legal advice or a certification. Confirm the current tier and terms with the vendor before relying on any result." },
  { q: "Where do the facts come from?", a: "Each tool's data-handling facts are compiled from the vendor's own privacy policy, DPA and trust centre, with a source link on the tool's profile. Anything unverified is treated as a gap, not assumed safe." },
];

export default function Page() {
  return (
    <>
      <JsonLd data={softwareAppLd("AI Vendor Risk Assessment", "Free tool to assess whether an AI tool is safe for your data.", "/ai-vendor-risk-assessment")} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI Vendor Risk Assessment", path: "/ai-vendor-risk-assessment" }])} />
      <JsonLd data={faqLd(FAQS)} />
      <PageHero
        eyebrow="Free tool"
        title="AI vendor risk assessment"
        intro="Answer one question, is this AI tool safe for the data we would put into it, in under a minute. Pick a tool and your data types for an explainable verdict you can export for your records."
      />
      <Section className="py-10 sm:py-14">
        <RiskAssessment tools={TOOLS} />
      </Section>
      <FaqSection title="About this tool" faqs={FAQS} columns={3} />
    </>
  );
}
