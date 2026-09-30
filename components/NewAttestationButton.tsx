"use client";

import { analyticsEvents, reportAction, type ActionResult } from "@/lib/analytics-events";

export function NewAttestationButton({ action, disabled }: { action: () => Promise<ActionResult>; disabled: boolean }) {
  return (
    <form action={() => reportAction(
      action,
      { ok: analyticsEvents.attestationLinkCreated, failed: analyticsEvents.attestationLinkFailed },
    ).then(() => undefined)}>
      <button type="submit" disabled={disabled} className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
        + New attestation link
      </button>
    </form>
  );
}
