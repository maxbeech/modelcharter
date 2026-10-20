import Link from "next/link";
import type { AiTool } from "@/lib/ai-tools";
import { KIT } from "@/lib/site";
import { baaRow, saferAlternatives, formatChecked, HEALTHCARE_POLICY_HREF } from "@/lib/hipaa-directory";
import { BaaChip } from "@/components/HipaaBaaTable";

// HIPAA-only blocks for /tools/[slug]/hipaa: which plan carries the BAA, the
// vendor source and date checked, and directory tools that offer a BAA.

export function BaaAtAGlance({ tool }: { tool: AiTool }) {
  const r = baaRow(tool);
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">BAA at a glance</h2>
        <BaaChip row={r} />
      </div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">Plans with a BAA</dt>
          <dd className="mt-1 leading-relaxed text-ink-soft">{r.plans}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">No BAA</dt>
          <dd className="mt-1 leading-relaxed text-ink-soft">{r.excludes ?? (r.tone === "yes" ? "Any account the signed BAA does not cover" : `Every ${tool.name} plan until ${tool.vendor} confirms otherwise`)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Source</dt>
          <dd className="mt-1">
            {r.sourceUrl
              ? <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-words text-brand-700 hover:underline">{tool.vendor}&apos;s own page ↗</a>
              : <span className="text-ink-faint">No vendor page found</span>}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Checked</dt>
          <dd className="mt-1 text-ink-soft"><time dateTime={r.checked}>{formatChecked(r.checked)}</time>{r.rechecked ? "" : " (with the directory)"}</dd>
        </div>
      </dl>
      {r.note && <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm leading-relaxed text-ink-soft">{r.note}</p>}
    </div>
  );
}

export function SaferAlternatives({ tool }: { tool: AiTool }) {
  const alts = saferAlternatives(tool, 4);
  if (alts.length === 0) return null;
  const title = baaRow(tool).tone === "yes" ? `Other tools with a BAA` : `Safer alternatives to ${tool.name}`;
  return (
    <>
      <h2 className="mt-8 font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft">From our directory. Each one still needs its BAA signed on the right plan.</p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {alts.map((x) => {
          const r = baaRow(x);
          return (
            <Link key={x.slug} href={`/tools/${x.slug}/hipaa`} className="rounded-xl border border-line bg-white px-4 py-3 text-sm transition-colors hover:border-brand-300">
              <span className="flex items-center justify-between gap-2"><span className="font-medium text-ink">{x.name}</span><BaaChip row={r} /></span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-faint">{r.plans}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-ink-soft">Compare every tool on the <Link href="/compliance/hipaa" className="text-brand-700 hover:underline">HIPAA-compliant AI tools</Link> table.</p>
    </>
  );
}

export function PracticeCta() {
  return (
    <div className="rounded-2xl bg-brand-800 p-5 text-white">
      <h3 className="font-semibold">Using AI in a healthcare practice?</h3>
      <p className="mt-1 text-sm text-brand-100">The {KIT.name} gives you a practice AI policy, your approved tools, staff sign-off and a printable record. ${KIT.price}, paid once.</p>
      <Link href={KIT.href} className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">See the {KIT.name} →</Link>
      <Link href={HEALTHCARE_POLICY_HREF} className="mt-3 block text-sm text-brand-100 underline-offset-2 hover:underline">Or start with the free healthcare policy</Link>
    </div>
  );
}
