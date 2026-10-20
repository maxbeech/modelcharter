"use client";

import { analyticsEvents, trackEvent } from "@/lib/analytics-events";

export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => { trackEvent(analyticsEvents.policyExported, { method: "evidence_print" }); window.print(); }}
      className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 print:hidden">
      {label}
    </button>
  );
}
