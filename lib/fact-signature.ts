// Change detection for the AI Tool Risk Directory. The facts live in the
// codebase, so "a vendor changed their policy" is detected by diffing the
// current catalog against the last stored snapshot of watched fact VALUES only
// (not sources or dates, so re-sourcing the same value never raises a false
// alert). Pure and deterministic, so it is unit-testable and the cron and any
// preview compute identical results.

import type { AiTool } from "./ai-tools";

export const WATCHED_KEYS = [
  "trainsOnPersonalData",
  "trainsOnBusinessData",
  "trainingOptout",
  "retention",
  "soc2",
  "iso27001",
  "iso42001",
  "gdprDpa",
  "hipaaBaa",
  "dataRegionEu",
  "ssoSaml",
  "enterprisePlan",
] as const;

const LABELS: Record<string, string> = {
  trainsOnPersonalData: "Trains on consumer data",
  trainsOnBusinessData: "Trains on business data",
  trainingOptout: "Training opt-out",
  retention: "Data retention",
  soc2: "SOC 2",
  iso27001: "ISO 27001",
  iso42001: "ISO 42001",
  gdprDpa: "GDPR DPA",
  hipaaBaa: "HIPAA BAA",
  dataRegionEu: "EU data residency",
  ssoSaml: "SSO / SAML",
  enterprisePlan: "Safer tier",
};

export type FactSignature = Record<string, unknown>;
export interface FactChange { key: string; label: string; before: unknown; after: unknown }

export function factSignature(tool: AiTool): FactSignature {
  const out: FactSignature = {};
  for (const k of WATCHED_KEYS) out[k] = (tool as unknown as Record<string, unknown>)[k] ?? null;
  return out;
}

export function diffFactSignatures(before: FactSignature, after: FactSignature): FactChange[] {
  const changes: FactChange[] = [];
  for (const k of WATCHED_KEYS) {
    const b = before[k] ?? null;
    const a = after[k] ?? null;
    if (JSON.stringify(b) !== JSON.stringify(a)) changes.push({ key: k, label: LABELS[k] ?? k, before: b, after: a });
  }
  return changes;
}

function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "not verified";
  if (v === "opt-out") return "opt-out";
  if (v === "n/a") return "not applicable";
  return String(v);
}

// One human-readable line for an alert detail, e.g.
// "HIPAA BAA: not verified to yes; SOC 2: yes to no".
export function describeFactChanges(changes: FactChange[]): string {
  return changes.map((c) => `${c.label}: ${show(c.before)} to ${show(c.after)}`).join("; ");
}
