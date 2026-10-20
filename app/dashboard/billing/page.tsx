import Link from "next/link";
import { ensureOrg } from "@/lib/workspace";
import { isStripeConfigured, planAvailable } from "@/lib/stripe";
import { KIT, isPaidPlan, planLabel } from "@/lib/site";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ already?: string }> }) {
  const org = await ensureOrg();
  if (!org) return null;
  const { already } = await searchParams;
  const paid = isPaidPlan(org.plan);
  // Legacy subscribers manage their subscription in the Stripe portal.
  const legacySubscriber = org.plan === "team" || org.plan === "business";
  const available = planAvailable(KIT.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Billing</h2>
          <p className="mt-1 text-sm text-ink-soft">You&apos;re on <span className="font-semibold text-ink">{planLabel(org.plan)}</span>.</p>
        </div>
        {legacySubscriber && isStripeConfigured() && (
          <form action="/api/stripe/portal" method="post">
            <button type="submit" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-paper">Manage subscription</button>
          </form>
        )}
      </div>

      {already && paid && (
        <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-100">You already have everything in the kit, so there&apos;s nothing to pay.</p>
      )}

      <div className="mt-7 max-w-lg rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">{KIT.name}</h3>
          {paid && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">Owned</span>}
        </div>
        {!paid && <p className="mt-1 font-display text-3xl font-semibold text-ink">${KIT.price}<span className="text-sm font-normal text-ink-faint"> {KIT.cadence}</span></p>}
        <p className="mt-2 text-sm text-ink-soft">{KIT.blurb}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">{KIT.features.map((f) => <li key={f} className="flex gap-2"><span className="text-brand-600">·</span>{f}</li>)}</ul>
        {paid ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/evidence" className="rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">Open your evidence pack</Link>
            <Link href="/dashboard/attestations" className="rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">Send sign-off links</Link>
          </div>
        ) : (
          <>
            <CheckoutForm plan={KIT.id} label={`Get the kit for $${KIT.price}`} disabled={!available} />
            <p className="mt-2 text-center text-xs text-ink-faint">{available ? "Paid once by card through Stripe. No subscription." : "Checkout isn't switched on yet. You won't be charged."}</p>
          </>
        )}
      </div>
    </div>
  );
}
