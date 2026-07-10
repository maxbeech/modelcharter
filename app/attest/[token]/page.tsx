import type { Metadata } from "next";
import { isDbConfigured } from "@/lib/auth";
import { getAttestation } from "@/lib/attest";
import { SetupPending } from "@/components/SetupPending";
import { Section } from "@/components/ui";
import { actionSign } from "./actions";

export const metadata: Metadata = { title: "Acknowledge AI policy", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isDbConfigured()) return <SetupPending what="Attestations" />;
  const att = await getAttestation(token);

  if (!att) {
    return (
      <Section className="max-w-xl py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Link not found</h1>
        <p className="mt-2 text-ink-soft">This attestation link is invalid or has expired. Ask whoever sent it for a fresh one.</p>
      </Section>
    );
  }

  const inputClass = "w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  return (
    <Section className="max-w-2xl py-14">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{att.orgName} AI Usage Policy</h1>
      <p className="mt-1 text-sm text-ink-faint">Please read and acknowledge this policy{att.version ? ` (version ${att.version})` : ""}.</p>
      {att.contentMd
        ? <div className="mt-5 max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-white p-5 text-sm leading-relaxed text-ink-soft">{att.contentMd}</div>
        : <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-100">No policy is attached to this link yet.</p>}

      {att.acknowledged ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-emerald-500 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="font-semibold text-emerald-900">Thank you. Your acknowledgement is recorded.</p>
        </div>
      ) : (
        <form action={actionSign} className="mt-6 space-y-3">
          <input type="hidden" name="token" value={token} />
          <input required name="name" placeholder="Your full name" className={inputClass} />
          <input required name="email" type="email" placeholder="Your work email" className={inputClass} />
          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input required type="checkbox" className="mt-0.5" /> I have read and agree to follow this AI usage policy.
          </label>
          <button type="submit" className="w-full rounded-full bg-brand-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-800">Acknowledge policy</button>
        </form>
      )}
    </Section>
  );
}
