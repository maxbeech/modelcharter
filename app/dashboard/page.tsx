import Link from "next/link";
import { ensureOrg, getRegister, getPolicies, getAttestations } from "@/lib/workspace";
import { getAlerts } from "@/lib/alerts";
import { confirmCheckoutSession, reconcileCheckoutSession } from "@/lib/billing/entitlements";
import { getSession } from "@/lib/auth";
import { buildAnalyticsIdentity } from "@/lib/analytics-identity";
import { PurchaseTracker, type PurchaseOutcome } from "@/components/PurchaseTracker";
import { redirect } from "next/navigation";
import { ContinueToCheckout } from "@/components/ContinueToCheckout";
import { KIT, buyIntent, isPaidPlan } from "@/lib/site";
import { planAvailable } from "@/lib/stripe";
import { actionMarkAlertsRead } from "./actions";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ upgraded?: string; session_id?: string; confirmed?: string; buy?: string }> }) {
  const org = await ensureOrg();
  if (!org) return null;
  const { session_id: sessionId, confirmed: confirmedId, buy: buyParam, upgraded } = await searchParams;
  // Came from a buy button: carry on to Checkout unless they already have access.
  const buy = buyIntent(buyParam);
  const continueToCheckout = buy && !isPaidPlan(org.plan) && planAvailable(buy);
  let purchase: PurchaseOutcome | null = null;
  if (sessionId) {
    // Stripe's return. Grant the plan, then reload the page so the header shows
    // it, carrying the session id as `confirmed` so the purchase is reported
    // once, from a session Stripe has verified for this workspace.
    const result = await reconcileCheckoutSession(sessionId, org.id);
    if (result.ok) redirect(`/dashboard?upgraded=1&confirmed=${encodeURIComponent(sessionId)}`);
    purchase = { kind: "failed", reason: result.reason };
  } else if (confirmedId) {
    const [result, user] = await Promise.all([confirmCheckoutSession(confirmedId, org.id), getSession()]);
    purchase = result.ok && user
      // The plan comes from the verified Checkout session, not from the stale org row.
      ? { kind: "confirmed", purchase: result.purchase, identity: buildAnalyticsIdentity(user.id, result.purchase.items[0]?.item_id, user.isTest) }
      : { kind: "failed", reason: result.ok ? "unauthorized" : result.reason };
  }
  const [register, policies, attestations, alerts] = await Promise.all([
    getRegister(org.id), getPolicies(org.id), getAttestations(org.id), getAlerts(org.id, 8),
  ]);
  const approved = register.filter((r) => r.status === "approved").length;
  const review = register.filter((r) => r.status === "review").length;
  const signed = attestations.filter((a) => a.acknowledged_at).length;
  const unread = alerts.filter((a) => !a.read).length;

  const stats = [
    { label: "Tools approved", value: String(approved), sub: `${review} awaiting review`, href: "/dashboard/tools" },
    { label: "Policy version", value: policies[0] ? `v${policies[0].version}` : "None", sub: policies.length ? `updated ${policies[0].created_at.slice(0, 10)}` : "not created yet", href: "/dashboard/policy" },
    { label: "Staff signed off", value: String(signed), sub: `${attestations.length} links sent`, href: "/dashboard/attestations" },
  ];

  return (
    <div>
      {purchase && <PurchaseTracker outcome={purchase} />}
      {upgraded && isPaidPlan(org.plan) && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <p className="font-semibold">The {KIT.name} is yours.</p>
          <p className="mt-0.5 text-emerald-800">Work through the four steps below. It takes most practices under an hour.</p>
        </div>
      )}
      {continueToCheckout && <ContinueToCheckout plan={KIT.id} name={KIT.name} price={KIT.price} />}
      {buy && !continueToCheckout && !isPaidPlan(org.plan) && (
        <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">
          Your account is ready. Checkout isn&apos;t switched on yet, so you won&apos;t be charged. Everything free is open to you now.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Change alerts{unread > 0 && <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">{unread} new</span>}
          </h2>
          {unread > 0 && (
            <form action={actionMarkAlertsRead}>
              <button type="submit" className="text-sm font-medium text-brand-700 hover:text-brand-900">Mark all read</button>
            </form>
          )}
        </div>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No alerts yet. Watch a tool on your <Link href="/dashboard/tools" className="text-brand-700 hover:underline">tool register</Link> to be told when a vendor changes how it handles your data.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {alerts.map((a) => (
              <li key={a.id} className={`rounded-xl border px-4 py-3 text-sm ${a.read ? "border-line bg-white" : "border-brand-200 bg-brand-50/60"}`}>
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/tools/${a.tool_slug}`} className="font-semibold text-ink hover:text-brand-700">{a.title}</Link>
                  <time className="flex-none text-xs text-ink-faint">{a.created_at.slice(0, 10)}</time>
                </div>
                {a.detail && <p className="mt-1 text-ink-soft">{a.detail}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Get your practice set up</h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-soft">
          <li className="flex gap-3"><Step n={1} /><span><Link href="/dashboard/policy?preset=healthcare" className="font-semibold text-brand-700 hover:text-brand-900">Write your AI policy</Link>: start from the HIPAA preset and save a version.</span></li>
          <li className="flex gap-3"><Step n={2} /><span><Link href="/dashboard/tools" className="font-semibold text-brand-700 hover:text-brand-900">Mark your AI tools</Link>: approve, restrict or prohibit each one. The BAA column tells you which can touch patient data.</span></li>
          <li className="flex gap-3"><Step n={3} /><span><Link href="/dashboard/attestations" className="font-semibold text-brand-700 hover:text-brand-900">Get staff to sign off</Link>: send each person a link to read and confirm the policy.{!isPaidPlan(org.plan) && <span className="text-ink-faint"> Part of the {KIT.name}.</span>}</span></li>
          <li className="flex gap-3"><Step n={4} /><span><Link href="/dashboard/evidence" className="font-semibold text-brand-700 hover:text-brand-900">Print your evidence pack</Link>: the record you show if anyone asks.{!isPaidPlan(org.plan) && <span className="text-ink-faint"> Part of the {KIT.name}.</span>}</span></li>
        </ol>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{n}</span>;
}
