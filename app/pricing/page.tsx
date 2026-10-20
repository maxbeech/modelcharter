import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PLANS, KIT } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { CheckoutReturnTracker } from "@/components/CheckoutReturnTracker";
import { pageMeta, faqLd, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Pricing: free AI policy, one-off HIPAA AI Kit",
  description: `The AI usage policy generator and the AI tool facts are free. The HIPAA AI Kit adds staff sign-off and a printable evidence pack for $${KIT.price}, paid once.`,
  path: "/pricing",
  keywords: ["hipaa ai policy", "ai policy for healthcare practice", "ai compliance software pricing"],
});

const FAQS = [
  { q: "What is free?", a: "The policy generator (with a healthcare preset), the facts on 60 AI tools, and a workspace with a tool register and saved policy versions. No card needed." },
  { q: "What does the kit add?", a: "Staff sign-off links with a dated record of who signed, and a printable evidence pack that puts your policy, tool decisions and sign-offs on one page." },
  { q: "Is it a subscription?", a: `No. The HIPAA AI Kit is $${KIT.price}, paid once. If you were on the old Team or Business plan, nothing changes for you.` },
];

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <CheckoutReturnTracker />
      </Suspense>
      <JsonLd data={faqLd(FAQS)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />

      <PageHero center eyebrow="Pricing" title="Simple, honest pricing" intro="Start free. Pay once when you need staff sign-off and a record you can show anyone who asks." />

      <Section className="mx-auto grid max-w-4xl items-start gap-6 py-14 sm:py-16 md:grid-cols-2">
        {PLANS.map((p) => {
          const featured = "featured" in p && p.featured;
          return (
            <div key={p.id} className={`relative flex flex-col rounded-[1.3rem] bg-white p-7 ${featured ? "border-2 border-brand-600 shadow-[0_24px_60px_-32px_rgba(31,111,78,0.5)]" : "border border-line shadow-sm"}`}>
              {featured && <span className="absolute -top-3 left-7 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">For healthcare practices</span>}
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
