"use client";

import { useRef } from "react";
import { analyticsEvents, reportAction, type ActionResult } from "@/lib/analytics-events";

export function NewAttestationButton({ action, disabled }: { action: (fd: FormData) => Promise<ActionResult>; disabled: boolean }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} className="flex flex-wrap items-center gap-2" action={(fd) => reportAction(
      () => action(fd),
      { ok: analyticsEvents.attestationLinkCreated, failed: analyticsEvents.attestationLinkFailed },
    ).then(() => { form.current?.reset(); })}>
      <label htmlFor="attest-name" className="sr-only">Who is this link for?</label>
      <input id="attest-name" name="name" disabled={disabled} maxLength={120} placeholder="Name, e.g. Dr Patel (optional)"
        className="w-56 rounded-full border border-line-strong bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50" />
      <button type="submit" disabled={disabled} className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
        + New sign-off link
      </button>
    </form>
  );
}
