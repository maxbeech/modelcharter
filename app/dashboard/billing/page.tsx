import { ensureOrg } from "@/lib/workspace";
import { isStripeConfigured, planAvailable } from "@/lib/stripe";
import { PLANS } from "@/lib/site";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function BillingPage() {
  const org = await ensureOrg();
  if (!org) return null;
  const stripeOn = isStripeConfigured();
  const paidPlans = PLANS.filter((p) => p.id !== "free");
  const isPaid = org.plan !== "free";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Billing</h2>
          <p className="mt-1 text-sm text-ink-soft">Current plan: <span className="font-semibold capitalize text-ink">{org.plan}</span></p>
        </div>
        {isPaid && stripeOn && (
          <form action="/api/stripe/portal" method="post">
            <button type="submit" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-paper">Manage billing</button>
          </form>
        )}
      </div>

      {!stripeOn && (
        <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">
          Billing is not connected on this deployment yet. Add your Stripe keys to enable upgrades. The workspace is fully usable on the free plan in the meantime.
        </p>
      )}

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {paidPlans.map((p) => {
          const available = planAvailable(p.id);
          const current = org.plan === p.id;
          return (
            <div key={p.id} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
              <p className="mt-1 font-display text-3xl font-semibold text-ink">${p.price}<span className="text-sm font-normal text-ink-faint"> / {p.cadence}</span></p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">{p.features.slice(0, 4).map((f) => <li key={f} className="flex gap-2"><span className="text-brand-600">·</span>{f}</li>)}</ul>
              <CheckoutForm plan={p.id} label={current ? "Current plan" : `Upgrade to ${p.name}`} disabled={!available || current} />
              {!available && !current && <p className="mt-2 text-center text-xs text-ink-faint">Not available on this deployment yet.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
