import Link from "next/link";
import { TOOLS } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { FRAMEWORKS } from "@/lib/frameworks";
import { Section, Eyebrow, RiskPill, btn } from "@/components/ui";
import { KIT } from "@/lib/site";

const sampleTools = ["chatgpt", "claude", "github-copilot", "otter-ai", "midjourney", "notion-ai"]
  .map((s) => TOOLS.find((t) => t.slug === s))
  .filter((t): t is (typeof TOOLS)[number] => Boolean(t))
  .map((t) => ({ t, r: scoreTool(t) }));

export const HOME_FAQS = [
  { q: "What is AI governance?", a: "AI governance is how a company sets rules for using AI safely and legally. In practice that means an AI usage policy, a register of which AI tools are approved, and a way to show staff have read the rules. It is how you avoid shadow AI, where employees use unapproved tools that may train on or leak your data." },
  { q: "Do small companies need an AI usage policy?", a: "Yes. The moment anyone on your team uses ChatGPT, Copilot or similar for work, you have AI risk: confidential data can leak into tools that train on it. A short AI usage policy plus an approved-tools list is the cheapest, fastest control, and it is now expected by SOC 2 auditors and the EU AI Act's AI-literacy duty." },
  { q: "Is ModelCharter free?", a: `The AI usage policy generator and the full AI Tool Risk Directory are free, with no login. The HIPAA AI Kit adds staff sign-off and a printable evidence pack for $${KIT.price}, paid once.` },
  { q: "How accurate is the AI Tool Risk Directory?", a: "Every fact is compiled from the vendor's own privacy policy, DPA and trust centre, with source links. Anything we could not confirm is shown as Unverified rather than guessed, so always check the linked source before relying on a fact." },
];

export function TrustStrip() {
  const stats = [
    { n: `${TOOLS.length}`, l: "AI tools rated" },
    { n: `${TOOLS.reduce((s, t) => s + t.sources.length, 0)}+`, l: "facts sourced from vendor policies" },
    { n: `${FRAMEWORKS.length}`, l: "frameworks mapped" },
    { n: "$0", l: "to generate your first policy" },
  ];
  return (
    <div className="border-b border-line bg-white">
      <Section className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center md:text-left">
            <div className="font-display text-4xl font-semibold tracking-tight text-ink">{s.n}</div>
            <div className="mt-1 text-sm text-ink-soft">{s.l}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}

export function DirectoryPreview() {
  return (
    <div className="border-y border-line bg-white">
      <Section className="py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Eyebrow>AI Tool Risk Directory</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Is that AI tool safe for work?</h2>
            <p className="mt-3 text-lg text-ink-soft">A sample of the directory, rated for default at-work use. Open any tool to see the data-handling facts and where each one came from.</p>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-brand-700 hover:text-brand-900">View all {TOOLS.length} tools →</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleTools.map(({ t, r }) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="group rounded-2xl border border-line bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink group-hover:text-brand-700">{t.name}</span>
                <RiskPill band={r.band} score={r.score} />
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">{t.vendor} · {t.category}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{t.notableRisk}</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-100 text-brand-700">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  ) : (
    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-slate-100 text-slate-400">
      <span className="h-0.5 w-2.5 rounded-full bg-current" />
    </span>
  );
}

export function Positioning() {
  return (
    <Section className="py-20 sm:py-24">
      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-line p-8 sm:p-10 md:border-b-0 md:border-r">
            <h2 className="max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">AI governance was built for the Fortune 500. We built it for everyone else.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">The enterprise platforms are capable, but they are sold through sales teams, priced for big budgets, and aimed at companies that already have a compliance function. Most teams do not. ModelCharter gives you the parts that actually matter, today.</p>
          </div>
          <div className="grid grid-rows-2 bg-paper">
            <div className="border-b border-line p-7 sm:p-8">
              <h3 className="text-sm font-semibold text-ink-faint">Enterprise governance suites</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                {["Book a demo, annual contracts", "Built for dedicated compliance teams", "Weeks to onboard", "Five-figure starting price"].map((x) => (
                  <li key={x} className="flex items-start gap-2.5"><Mark ok={false} />{x}</li>
                ))}
              </ul>
            </div>
            <div className="p-7 sm:p-8">
              <h3 className="text-sm font-semibold text-brand-700">ModelCharter</h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-ink">
                {["Self-serve and free to start", "Built for teams with no compliance hire", "A usable policy in one sitting", `$${KIT.price} once when you need staff sign-off`].map((x) => (
                  <li key={x} className="flex items-start gap-2.5"><Mark ok />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function FrameworksStrip() {
  return (
    <div className="border-y border-line bg-white">
      <Section className="py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Built around the frameworks you are measured on</p>
        <div className="mt-7 flex flex-wrap items-stretch justify-center gap-3">
          {FRAMEWORKS.map((f) => (
            <Link key={f.slug} href={`/frameworks/${f.slug}`} className="rounded-xl border border-line bg-paper px-6 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm">
              <div className="font-semibold text-ink">{f.name}</div>
              <div className="mt-0.5 text-xs text-ink-faint">{f.authority}</div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function FaqAndCta() {
  return (
    <Section className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Questions, answered.</h2>
          <p className="mt-3 text-ink-soft">Still unsure? <Link href="/contact" className="font-semibold text-brand-700 hover:text-brand-900">Get in touch</Link>.</p>
        </div>
        <dl className="space-y-6">
          {HOME_FAQS.map((f) => (
            <div key={f.q} className="border-b border-line pb-6 last:border-0">
              <dt className="font-semibold text-ink">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-16 overflow-hidden rounded-[1.5rem] bg-brand-800 px-8 py-12 text-center sm:px-12">
        <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">Get your AI usage policy today.</h3>
        <p className="mx-auto mt-3 max-w-lg text-brand-100">Free, no signup. Then see which of your tools are safe to use, and bring the whole team along.</p>
        <Link href="/ai-usage-policy-generator" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-800 transition-colors hover:bg-brand-50">Start now</Link>
      </div>
    </Section>
  );
}
