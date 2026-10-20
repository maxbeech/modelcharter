import Link from "next/link";
import { ensureOrg, getRegister, getPolicies, getAttestations } from "@/lib/workspace";
import { getTool } from "@/lib/ai-tools";
import { buildEvidence } from "@/lib/evidence";
import { isPaidPlan } from "@/lib/site";
import { KitUpsell } from "@/components/KitUpsell";
import { PrintButton } from "@/components/PrintButton";
import { PolicyDocument } from "@/components/PolicyDocument";
import type { BaaTone } from "@/lib/hipaa";
import { actionRenameOrg } from "../actions";

const BAA_CLASS: Record<BaaTone, string> = {
  yes: "text-emerald-700",
  no: "text-red-700",
  unknown: "text-amber-700",
};

export default async function EvidencePage() {
  const org = await ensureOrg();
  if (!org) return null;
  if (!isPaidPlan(org.plan)) {
    return <KitUpsell title="Your evidence pack, ready to print" body="Your policy, every tool decision with its BAA status, and who signed what, on one page. Hand it to an auditor, an insurer or a patient who asks how you use AI." />;
  }
  const [register, policies, attestations] = await Promise.all([getRegister(org.id), getPolicies(org.id), getAttestations(org.id)]);
  const ev = buildEvidence({ orgName: org.name, generatedAt: new Date().toISOString(), register, policies, attestations, toolFor: getTool });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Evidence pack</h2>
          <p className="mt-1 text-sm text-ink-soft">Built live from your workspace. Print it, or save it as a PDF from the print dialog.</p>
        </div>
        <PrintButton />
      </div>

      <form action={actionRenameOrg} className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
        <label htmlFor="org-name" className="text-sm text-ink-soft">Name on this record</label>
        <input id="org-name" name="name" defaultValue={org.name} maxLength={80} required
          className="w-64 max-w-full rounded-full border border-line-strong bg-white px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
        <button type="submit" className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper">Save</button>
      </form>

      <article className="evidence-doc rounded-2xl border border-line bg-white p-6 sm:p-10 print:border-0 print:p-0">
        <header className="border-b border-line pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">AI use record</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">{ev.orgName}</h1>
          <p className="mt-1 text-sm text-ink-faint">Prepared {ev.generatedOn}</p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <Stat label="Policy" value={ev.policy ? `Version ${ev.policy.version}` : "Not saved yet"} sub={ev.policy ? `saved ${ev.policy.savedOn}` : undefined} />
            <Stat label="Tool decisions" value={String(ev.decided.length)} sub={ev.undecidedCount ? `${ev.undecidedCount} still to review` : "all reviewed"} />
            <Stat label="Staff sign-offs" value={String(ev.signed.length)} sub={ev.pending.length ? `${ev.pending.length} waiting` : "none waiting"} />
          </dl>
        </header>

        {ev.phiRisks.length > 0 && (
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">
            <p className="font-semibold">Keep patient data out of {ev.phiRisks.length === 1 ? "this tool" : "these tools"}</p>
            <p className="mt-1">{ev.phiRisks.map((t) => t.name).join(", ")} {ev.phiRisks.length === 1 ? "is" : "are"} allowed at your practice but {ev.phiRisks.length === 1 ? "has" : "have"} no confirmed BAA. Staff can use {ev.phiRisks.length === 1 ? "it" : "them"} for work that contains no PHI only.</p>
          </div>
        )}

        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-lg font-semibold text-ink">1. AI tools and patient data</h2>
          {ev.decided.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No tools marked yet. <Link href="/dashboard/tools" className="text-brand-700 hover:underline print:no-underline">Mark tools in your register</Link> and they appear here.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <tr><th className="py-2 pr-4 font-semibold">Tool</th><th className="py-2 pr-4 font-semibold">Decision</th><th className="py-2 font-semibold">BAA</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ev.decided.map((t) => (
                    <tr key={t.slug} className="align-top">
                      <td className="py-2.5 pr-4 font-medium text-ink">{t.name}</td>
                      <td className="py-2.5 pr-4 capitalize text-ink-soft">{t.status}</td>
                      <td className="py-2.5">
                        <span className={`font-semibold ${BAA_CLASS[t.baa.tone]}`}>{t.baa.short}</span>
                        <span className="block text-xs text-ink-faint">{t.baa.detail}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-lg font-semibold text-ink">2. Staff sign-offs</h2>
          {ev.signed.length === 0 && ev.pending.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No sign-off links sent yet. <Link href="/dashboard/attestations" className="text-brand-700 hover:underline">Send one to each person</Link>.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {ev.signed.map((s, i) => (
                <li key={`s${i}`} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span className="text-ink">{s.name}{s.email && <span className="text-ink-faint"> · {s.email}</span>}</span>
                  <span className="font-medium text-emerald-700">Signed {s.signedOn}</span>
                </li>
              ))}
              {ev.pending.map((p, i) => (
                <li key={`p${i}`} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span className="text-ink-soft">{p.name ?? "Unnamed link"}</span>
                  <span className="text-ink-faint">Sent {p.sentOn}, not signed</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-ink">3. AI usage policy{ev.policy ? `, version ${ev.policy.version}` : ""}</h2>
          {ev.policy
            ? <PolicyDocument markdown={ev.policy.contentMd} className="mt-3 rounded-xl border border-line bg-paper/40 p-5 print:border-0 print:bg-transparent print:p-0" />
            : <p className="mt-2 text-sm text-ink-soft">No policy saved yet. <Link href="/dashboard/policy?preset=healthcare" className="text-brand-700 hover:underline">Write your HIPAA policy</Link>.</p>}
        </section>

        <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
          Prepared with ModelCharter from this practice&apos;s own records. BAA facts come from each vendor&apos;s published terms and should be confirmed with the vendor before patient data is used. This is a record of decisions, not legal advice.
        </p>
      </article>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-ink-faint">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-semibold text-ink">{value}</dd>
      {sub && <dd className="text-xs text-ink-faint">{sub}</dd>}
    </div>
  );
}
