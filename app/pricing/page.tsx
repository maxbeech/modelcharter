import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PLANS } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { CheckoutReturnTracker } from "@/components/CheckoutReturnTracker";
import { pageMeta, faqLd, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Pricing: free AI policy, paid AI governance",
  description: "ModelCharter is free for the AI usage policy generator and the full AI Tool Risk Directory. Paid Team ($49/mo) and Business ($149/mo) plans add a shared tool register, versioned policy and employee attestation tracking.",
  path: "/pricing",
  keywords: ["ai governance software pricing", "ai compliance software"],
});

const FAQS = [
  { q: "What is free?", a: "The AI usage policy generator and the entire AI Tool Risk Directory are free forever, with no signup or credit card." },
  { q: "What do paid plans add?", a: "A shared, living register of approved and restricted AI tools, a versioned company policy, employee attestation tracking with a shareable link, and exportable compliance reports: the evidence auditors and customers ask for." },
  { q: "Is there a trial?", a: "Yes. Team and Business plans include a 14-day trial, with no charge until it ends." },
];

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <CheckoutReturnTracker />
      </Suspense>
      <JsonLd data={faqLd(FAQS)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />

      <PageHero center eyebrow="Pricing" title="Simple, honest pricing" intro="Start free. Upgrade when you need a shared register and the evidence to prove your team follows the rules." />

      <Section className="grid items-start gap-6 py-14 sm:py-16 md:grid-cols-3">
        {PLANS.map((p) => {
          const featured = "featured" in p && p.featured;
          return (
            <div key={p.id} className={`relative flex flex-col rounded-[1.3rem] bg-white p-7 ${featured ? "border-2 border-brand-600 shadow-[0_24px_60px_-32px_rgba(31,111,78,0.5)]" : "border border-line shadow-sm"}`}>
              {featured && <span className="absolute -top-3 left-7 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
              <h2 className="font-display text-xl font-semibold text-ink">{p.name}</h2>
              <div className="mt-3"><span className="font-display text-4xl font-semibold tracking-tight text-ink">${p.price}</span><span className="ml-1 text-sm text-ink-faint">/ {p.cadence}</span></div>
              <p className="mt-2 text-sm text-ink-soft">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-100 text-brand-700">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`mt-7 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors ${featured ? "bg-brand-700 text-white shadow-sm hover:bg-brand-800" : "border border-line-strong text-ink hover:border-ink-faint hover:bg-paper"}`}>{p.cta}</Link>
            </div>
          );
        })}
      </Section>

      <FaqSection title="Pricing FAQ" faqs={FAQS} />
    </>
  );
}
