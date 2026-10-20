import Link from "next/link";
import { TOOLS } from "@/lib/ai-tools";
import { scoreTool, type Band } from "@/lib/risk";
import { generatePolicy } from "@/lib/policy";
import { Section, Pill, Eyebrow, btn } from "@/components/ui";
import { KIT } from "@/lib/site";
import { AppFrame } from "@/components/marketing";
import { SignalConsole, type ConsoleStatus } from "@/components/console";
import { PolicyDocMock, DirectoryMock, AttestMock, FeatureRow } from "@/components/mockups";

// ── Real data feeding the illustrations (single source of truth) ────────────
const bandToStatus = (b: Band): ConsoleStatus => (b === "Low" ? "approved" : b === "High" ? "restricted" : "review");
const pick = (slugs: string[]) => slugs.map((s) => TOOLS.find((t) => t.slug === s)).filter((t): t is (typeof TOOLS)[number] => Boolean(t));

const consoleTools = pick(["chatgpt", "github-copilot", "claude", "notion-ai", "midjourney", "otter-ai"]).map((t) => ({ name: t.name, status: bandToStatus(scoreTool(t).band) }));

const samplePolicy = generatePolicy({
  companyName: "Northwind Labs", industry: "Software / SaaS", stance: "balanced", ownerRole: "Head of Operations",
  allowCustomerData: false, allowPersonalData: false, allowCodeGen: true, requireDisclosure: true,
  regulations: ["SOC 2", "GDPR"], approvedTools: ["ChatGPT", "Claude"], prohibitedTools: [], effectiveDate: "2026-06-19",
});
const policyHeadings = samplePolicy.sections.slice(0, 4).map((s) => s.heading);

const featured = pick(["midjourney"])[0];
const featuredScore = featured ? scoreTool(featured) : { score: 70, band: "High" as Band };
const dirRows = pick(["chatgpt", "claude", "github-copilot"]).map((t) => ({ name: t.name, ...scoreTool(t) }));

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b border-line bg-paper-glow">
      <div className="bg-dotgrid">
        <Section className="grid items-center gap-12 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <div>
            <Pill tone="brand"><span className="h-1.5 w-1.5 rounded-full bg-signal" />For small healthcare practices</Pill>
            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.9rem]">
              Give your practice an <span className="text-brand-700">AI charter</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Your staff already use ChatGPT, Copilot and AI note-takers. ModelCharter shows which tools will sign a BAA,
              writes an AI policy that keeps patient data safe, and keeps a record that everyone has read it. No
              compliance hire required.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/ai-usage-policy-generator?preset=healthcare" className={btn("primary", "lg")}>Write your free HIPAA AI policy</Link>
              <Link href={KIT.href} className={btn("secondary", "lg")}>See the HIPAA AI Kit</Link>
            </div>
            <p className="mt-5 text-sm text-ink-faint">No signup, no card. BAA status for {TOOLS.length} AI tools, from the vendors&apos; own terms.</p>
          </div>

          <div className="relative">
            <AppFrame title="modelcharter.com / register">
              <SignalConsole items={consoleTools} />
            </AppFrame>
            <div className="absolute -bottom-5 left-4 hidden items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-lg sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">Policy v3 adopted</p>
                <p className="text-[11px] text-ink-faint">Acknowledged by 23 of 25</p>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <Section className="space-y-20 py-20 sm:py-28">
      <div className="max-w-2xl">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Three steps from shadow AI to under control.</h2>
        <p className="mt-3 text-lg text-ink-soft">No consultants, no six-week rollout. Each piece works on its own, and they add up to the evidence an auditor or a customer will ask you for.</p>
      </div>

      <FeatureRow
        eyebrow={<Eyebrow>Step 01 · Write</Eyebrow>}
        title="A real AI usage policy, tailored to you"
        body="Answer a few plain questions about your team, your data and the rules you follow. You get a policy you can adopt today, built around the EU AI Act, NIST AI RMF, ISO 42001 and SOC 2. Edit it, download it, or save versions to your workspace."
        cta={{ href: "/ai-usage-policy-generator", label: "Open the generator" }}
      >
        <PolicyDocMock title={samplePolicy.title} version={3} sections={policyHeadings} acknowledged={23} total={25} />
      </FeatureRow>

      <FeatureRow
        flip
        eyebrow={<Eyebrow>Step 02 · Vet</Eyebrow>}
        title="Know which AI tools are safe for work"
        body="Look up how popular AI tools actually treat your data: whether they train on it, how long they keep it, and which certifications they hold. Every fact is sourced from the vendor's own policies, and every risk score shows its working."
        cta={{ href: "/tools", label: "Browse the directory" }}
      >
        <DirectoryMock score={featuredScore.score} band={featuredScore.band} rows={dirRows} />
      </FeatureRow>

      <FeatureRow
        eyebrow={<Eyebrow>Step 03 · Prove</Eyebrow>}
        title="Show that everyone has read the rules"
        body="Send each person a link and watch sign-offs come in. You get a dated record of who agreed to the policy and when, ready to print when an auditor, insurer or patient asks how you use AI."
        cta={{ href: KIT.href, label: "See the HIPAA AI Kit" }}
      >
        <AttestMock rows={[
          { initials: "AM", team: "Engineering", signed: true },
          { initials: "JS", team: "Design", signed: true },
          { initials: "RT", team: "Customer success", signed: true },
          { initials: "KP", team: "Marketing", signed: false },
        ]} signed={23} total={25} />
      </FeatureRow>
    </Section>
  );
}
