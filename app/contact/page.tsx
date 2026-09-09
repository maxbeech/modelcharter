import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Get in touch with the ModelCharter team about support, sales, security and press.",
  path: "/contact",
});

const CHANNELS = [
  { h: "General & support", e: "hello@mail.modelcharter.com", d: "Questions about the product, your account or a tool in the directory." },
  { h: "Sales", e: "sales@modelcharter.com", d: "Team and Business plans, volume pricing, procurement and security reviews." },
  { h: "Security", e: "security@modelcharter.com", d: "Report a vulnerability or ask about our security practices." },
  { h: "Privacy", e: "privacy@modelcharter.com", d: "Data access, export or deletion requests." },
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us" intro="We are a small team and we read everything. Email the right inbox and we will get back to you quickly." />
      <Section className="py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <div key={c.e} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-semibold text-ink">{c.h}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.d}</p>
              <a href={`mailto:${c.e}`} className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">{c.e}</a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink-faint">Prefer the free tools? <Link href="/ai-usage-policy-generator" className="font-semibold text-brand-700 hover:underline">Generate an AI usage policy</Link>. No account needed.</p>
      </Section>
    </>
  );
}
