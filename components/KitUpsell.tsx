import Link from "next/link";
import { KIT } from "@/lib/site";

// The one upgrade card used wherever a kit feature is locked, so the offer
// reads the same everywhere.
export function KitUpsell({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{KIT.name}</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard/billing" className="inline-flex rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">Get the kit for ${KIT.price}</Link>
        <Link href={KIT.href} className="text-sm font-medium text-brand-700 hover:text-brand-900">What&apos;s included</Link>
      </div>
      <p className="mt-3 text-xs text-ink-faint">Paid once. No subscription.</p>
    </div>
  );
}
