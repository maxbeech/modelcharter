import Link from "next/link";
import { ensureOrg, getAttestations, getPolicies } from "@/lib/workspace";
import { SITE, isPaidPlan } from "@/lib/site";
import { CopyLink } from "@/components/CopyLink";
import { NewAttestationButton } from "@/components/NewAttestationButton";
import { actionCreateAttestation } from "../actions";

export default async function AttestationsPage() {
  const org = await ensureOrg();
  if (!org) return null;
  const [rows, policies] = await Promise.all([getAttestations(org.id), getPolicies(org.id)]);
  const hasPolicy = policies.length > 0;
  const paid = isPaidPlan(org.plan);

  if (!paid) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="font-display text-lg font-semibold text-ink">Collect attestations on the Team plan</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">Send each colleague a link to read and acknowledge your AI policy, and get a dated record of who signed: the evidence auditors ask for.</p>
        <Link href="/dashboard/billing" className="mt-5 inline-flex rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">Upgrade to Team</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Attestations</h2>
          <p className="mt-1 text-sm text-ink-soft">Create a link for each person who must acknowledge the policy. You will see exactly when each person signed.</p>
        </div>
        <NewAttestationButton action={actionCreateAttestation} disabled={!hasPolicy} />
      </div>
      {!hasPolicy && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">Save a policy version first, then create attestation links against it.</p>}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-faint">No attestation links yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((a) => {
            const url = `${SITE.url}/attest/${a.token}`;
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <span className="font-mono text-xs text-ink-faint">/attest/{a.token.slice(0, 8)}…</span>
                  <div className="mt-1">
                    {a.acknowledged_at
                      ? <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          Signed by {a.name || a.email} · {a.acknowledged_at.slice(0, 10)}
                        </span>
                      : <span className="text-ink-faint">Awaiting signature</span>}
                  </div>
                </div>
                <CopyLink url={url} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
