import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getTool } from "@/lib/ai-tools";
import { baaStatus, type BaaTone } from "@/lib/hipaa";
import { KIT, SITE } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Section, btn } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { CheckoutReturnTracker } from "@/components/CheckoutReturnTracker";
import { pageMeta, faqLd, breadcrumbLd } from "@/lib/seo";

// Static, revalidated weekly with the directory data it reads.
export const revalidate = 604800;

export const metadata: Metadata = pageMeta({
  title: "HIPAA AI Kit for small healthcare practices",
  description: `An AI policy written for your practice, a list of which AI tools will sign a BAA, staff sign-off and a printable record. $${KIT.price}, paid once.`,
  path: KIT.href,
  keywords: ["hipaa compliant ai", "hipaa ai policy", "ai policy for healthcare practice", "hipaa compliant ai tools", "ai policy for therapists"],
});

// The tools practices ask about most, in the order people search for them.
const ASKED_ABOUT = ["chatgpt", "claude", "microsoft-365-copilot", "google-gemini", "otter-ai", "grammarly", "notion-ai", "zoom-ai-companion"];

const TONE_CLASS: Record<BaaTone, string> = {
  yes: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  no: "bg-red-50 text-red-800 ring-red-200",
  unknown: "bg-amber-50 text-amber-800 ring-amber-200",
};

const STEPS = [
  { t: "Write your policy", d: "Start from the HIPAA preset. Pick the tools you allow and save it. About ten minutes." },
  { t: "Mark your tools", d: "Approve, restrict or prohibit each AI tool. We show which ones offer a BAA, so you know where patient data can go." },
  { t: "Get sign-off, print the record", d: "Send each person a link to read and confirm. Then print one page that shows all of it." },
];

const FAQS = [
  { q: "Who is this for?", a: "Small practices, from solo therapists to clinics of around 50 people, where staff use AI tools and nobody has written down the rules yet." },
  { q: "Does this make us HIPAA compliant?", a: "No product can do that on its own. The kit covers one gap most practices have: how staff use AI tools with patient data. It gives you written rules, a reason for each tool decision and proof that staff agreed." },
  { q: "Is ChatGPT HIPAA compliant?", a: "Not the free or Plus version. OpenAI offers a BAA for its API and some business plans, and only that covered account can be used with PHI. The kit lists this for every tool we track, with the vendor source." },
  { q: "Is it a subscription?", a: `No. You pay $${KIT.price} once. Your workspace, policy versions and sign-off records stay with your account.` },
  { q: "Is this legal advice?", a: "No. It is guidance built from each vendor's published terms. Have your own advisor review the policy before you adopt it." },
  { q: "Can I try it first?", a: "Yes. The policy generator, the healthcare preset and the tool facts are free with no account. The kit adds staff sign-off and the printable record." },
];

export default function Page() {
  const tools = ASKED_ABOUT.map((slug) => getTool(slug)).filter((t) => t != null);
  return (
    <>
      <Suspense fallback={null}><CheckoutReturnTracker /></Suspense>
      <JsonLd data={faqLd(FAQS)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: KIT.name, path: KIT.href }])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Product", name: KIT.name, description: KIT.blurb, brand: { "@type": "Brand", name: SITE.name },
        offers: { "@type": "Offer", price: String(KIT.price), priceCurrency: "USD", url: `${SITE.url}${KIT.href}`, availability: "https://schema.org/InStock" },
      }} />

      <PageHero
        eyebrow="For small healthcare practices"
        title="Say yes to AI without putting patient data at risk"
        intro="Your team is already using ChatGPT. The HIPAA AI Kit gives your practice written rules, a clear list of which tools can touch patient data, and a record that everyone signed."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={KIT.buyHref} className={btn("primary", "lg")}>Get the kit for ${KIT.price}</Link>
          <Link href="/ai-usage-policy-generator?preset=healthcare" className={btn("secondary", "lg")}>Try the free policy generator</Link>
        </div>
        <p className="mt-3 text-sm text-ink-faint">Paid once. No subscription.</p>
      </PageHero>

      <Section className="py-14 sm:py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">What you get</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {KIT.features.map((f, i) => (
            <div key={f} className="rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-md">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{i + 1}</span>
              <p className="mt-4 font-medium leading-snug text-ink">{f}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="border-y border-line bg-white">
        <Section className="py-14 sm:py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Which AI tools will sign a BAA?</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">The tools practices ask us about most. Without a signed BAA, patient data must stay out.</p>
          <ul className="mt-7 divide-y divide-line rounded-2xl border border-line">
            {tools.map((t) => {
              const b = baaStatus(t);
              return (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}/hipaa`} className="group flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-paper">
                    <span>
                      <span className="font-medium text-ink group-hover:text-brand-700">Is {t.name} HIPAA compliant?</span>
                      <span className="mt-0.5 block text-sm text-ink-faint">{b.detail}</span>
                    </span>
                    <span className={`inline-flex flex-none rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${TONE_CLASS[b.tone]}`}>{b.short}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm"><Link href="/compliance/hipaa" className="font-semibold text-brand-700 hover:text-brand-900">See all 60 tools</Link></p>
        </Section>
      </div>

      <Section className="py-14 sm:py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">How it works</h2>
        <ol className="mt-7 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <p className="font-display text-sm font-semibold text-brand-600">Step {i + 1}</p>
              <p className="mt-1 font-semibold text-ink">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 overflow-hidden rounded-[1.5rem] bg-brand-800 px-8 py-12 text-center sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-200">{KIT.name}</p>
          <p className="mt-3 font-display text-5xl font-semibold text-white">${KIT.price}</p>
          <p className="mt-2 text-brand-100">Paid once. Set up in an afternoon.</p>
          <Link href={KIT.buyHref} className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-800 transition-colors hover:bg-brand-50">Get the kit</Link>
        </div>
      </Section>

      <FaqSection title="Questions practices ask" faqs={FAQS} />
    </>
  );
}
