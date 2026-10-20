import { ensureOrg, getAttestations, getPolicies } from "@/lib/workspace";
import { SITE, isPaidPlan } from "@/lib/site";
import { CopyLink } from "@/components/CopyLink";
import { NewAttestationButton } from "@/components/NewAttestationButton";
import { KitUpsell } from "@/components/KitUpsell";
import { actionCreateAttestation } from "../actions";

export default async function AttestationsPage() {
  const org = await ensureOrg();
  if (!org) return null;
  const [rows, policies] = await Promise.all([getAttestations(org.id), getPolicies(org.id)]);
  const hasPolicy = policies.length > 0;
  const paid = isPaidPlan(org.plan);

  if (!paid) {
    return <KitUpsell title="Get every staff member to sign off" body="Send each person a link to read your AI policy and confirm it. You get a dated record of who signed, and who hasn't yet." />;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Staff sign-off</h2>
          <p className="mt-1 text-sm text-ink-soft">Make a link for each person, then send it to them. You&apos;ll see when each one signs.</p>
        </div>
        <NewAttestationButton action={actionCreateAttestation} disabled={!hasPolicy} />
      </div>
      {!hasPolicy && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">Save a policy version first, then make sign-off links for it.</p>}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-faint">No sign-off links yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((a) => {
            const url = `${SITE.url}/attest/${a.token}`;
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-ink">{a.name || <span className="font-mono text-xs text-ink-faint">/attest/{a.token.slice(0, 8)}…</span>}</span>
                  <div className="mt-1">
                    {a.acknowledged_at
                      ? <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          Signed {a.acknowledged_at.slice(0, 10)}{a.email ? ` · ${a.email}` : ""}
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
