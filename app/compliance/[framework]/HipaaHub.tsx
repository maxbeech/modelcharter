import Link from "next/link";
import { TOOLS } from "@/lib/ai-tools";
import { KIT } from "@/lib/site";
import type { ComplianceHub } from "@/lib/registry-frameworks";
import { baaTable, hipaaHubFaqs, HIPAA_FEATURED, HEALTHCARE_POLICY_HREF } from "@/lib/hipaa-directory";
import { JsonLd } from "@/components/JsonLd";
import { Section, btn } from "@/components/ui";
import { PageHero, FaqSection } from "@/components/page";
import { HipaaBaaTable } from "@/components/HipaaBaaTable";
import { datasetLd, breadcrumbLd, faqLd } from "@/lib/seo";

// The canonical "HIPAA-compliant AI tools" page (/compliance/hipaa), written
// for small US practices. Every row comes from data/ai-tools.json through
// lib/hipaa-directory, so the table, the tool pages and llms.txt agree.

const STEPS = [
  { t: "Sign the BAA on the right plan", d: "The BAA has to cover the account your staff actually log in to. A personal or free account never counts." },
  { t: "Lock the settings", d: "Turn off public sharing, auto-joining notetakers and anything the vendor's HIPAA guide says to disable." },
  { t: "Write it down", d: "Name the approved tools in a short policy, say what patient data can go where, and get each person to sign it." },
];

export function HipaaHub({ hub }: { hub: ComplianceHub }) {
  const rows = baaTable();
  const featured = rows.filter((r) => (HIPAA_FEATURED as readonly string[]).includes(r.slug));
  const rest = rows.filter((r) => !(HIPAA_FEATURED as readonly string[]).includes(r.slug));
  const withBaa = rest.filter((r) => r.tone === "yes");
  const without = rest.filter((r) => r.tone !== "yes");
  const count = TOOLS.filter(hub.match).length;
  const faqs = hipaaHubFaqs();
  const path = `/compliance/${hub.slug}`;

  return (
    <>
      <JsonLd data={datasetLd({ name: hub.title, description: hub.blurb, path, count })} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Compliance", path: "/compliance" }, { name: hub.label, path }])} />
      <JsonLd data={faqLd(faqs)} />

      <PageHero
        eyebrow="For small healthcare practices"
        title={hub.title}
        intro="Therapists, dentists, chiropractors and small clinics all hit the same question: can this AI tool see patient data? Only if the vendor signs a Business Associate Agreement (BAA) for the plan your staff use. Here is who will, on which plan, with the vendor's own page and the date we checked."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={KIT.href} className={btn("primary", "lg")}>Get the {KIT.name}, ${KIT.price} once</Link>
          <Link href={HEALTHCARE_POLICY_HREF} className={btn("secondary", "lg")}>Free healthcare AI policy</Link>
        </div>
      </PageHero>

      <Section className="py-10 sm:py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">The tools practices ask about most</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          A BAA is the minimum, not the finish line. If a tool says Unverified, keep patient data out until the vendor gives you a BAA in writing.
        </p>
        <div className="mt-5"><HipaaBaaTable rows={featured} caption="BAA availability for the AI tools practices ask about most" /></div>

        <h2 className="mt-12 font-display text-xl font-semibold text-ink">Other AI tools with a BAA ({withBaa.length})</h2>
        <p className="mt-2 text-sm text-ink-soft">{count} of {TOOLS.length} tools in our directory offer a BAA on at least one plan. Rows marked &ldquo;with dataset&rdquo; were checked when we last compiled the directory, so confirm the plan with the vendor.</p>
        <div className="mt-5"><HipaaBaaTable rows={withBaa} caption="Other AI tools whose vendor offers a BAA" /></div>

        <details className="mt-8 rounded-2xl border border-line bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Tools with no confirmed BAA ({without.length})</summary>
          <div className="mt-4"><HipaaBaaTable rows={without} caption="AI tools with no confirmed BAA" /></div>
        </details>
      </Section>

      <div className="border-t border-line bg-paper">
        <Section className="py-12 sm:py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Before any patient data goes in</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="rounded-2xl border border-line bg-white p-5">
                <span className="text-xs font-semibold text-brand-600">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
            The <Link href={KIT.href} className="text-brand-700 hover:underline">{KIT.name}</Link> does steps two and three for you: a practice AI policy, your approved tools with a reason for each, staff sign-off and a printable record. Or start free with the <Link href={HEALTHCARE_POLICY_HREF} className="text-brand-700 hover:underline">healthcare policy preset</Link>.
          </p>
        </Section>
      </div>

      <FaqSection title="HIPAA and AI tools: common questions" faqs={faqs} columns={2} />

      <Section className="pb-14">
        <p className="text-sm text-ink-soft">
          Read <Link href="/blog/does-openai-sign-a-baa" className="text-brand-700 hover:underline">Does OpenAI sign a BAA?</Link>, see <Link href="/compliance/healthcare" className="text-brand-700 hover:underline">safe AI tools for healthcare</Link>, or browse the full <Link href="/tools" className="text-brand-700 hover:underline">AI Tool Risk Directory</Link>. Guidance only, not legal advice.
        </p>
      </Section>
    </>
  );
}
