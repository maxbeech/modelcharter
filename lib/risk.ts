// Transparent risk scoring for the AI Tool Risk Directory.
//
// The score answers ONE question: "How much data exposure does an employee
// create by using this tool on its DEFAULT/consumer tier at work?" (the shadow-
// AI problem). It is a WEIGHTED AVERAGE over only the signals we could verify,
// rescaled to 0-100, so an unknown fact lowers our CONFIDENCE (coverage) rather
// than silently counting as risk. Coverage is reported separately, and a tool
// verified on only a sliver of evidence can never earn the best band. Every
// point is explained (no black box) so the per-tool page and JSON-LD can cite
// exactly why a tool scores the way it does.

import type { AiTool, Verdict } from "./ai-tools";

export type Band = "Low" | "Medium" | "High" | "Unrated";

export interface RiskFactor { label: string; points: number; detail: string }
export interface RiskResult { score: number; band: Band; coverage: number; factors: RiskFactor[] }

// A signal maps a tool to a per-signal RISK value 0-100 (0 = safe, 100 = worst)
// or null when the underlying fact is unverified (excluded from the average).
interface Signal {
  key: string;
  weight: number;
  risk: (t: AiTool) => number | null;
  label: string;
  detail: (t: AiTool) => string;
}

// "yes" means the protective control IS present (0 risk); "no" is full risk;
// null is unknown (excluded). Used for the certification-style signals.
function control(v: Verdict): number | null {
  if (v === null) return null;
  if (v === "yes" || v === "n/a") return 0;
  return 100;
}

const SIGNALS: Signal[] = [
  {
    key: "training", weight: 26, label: "Trains on your data",
    risk: (t) => {
      switch (t.trainsOnPersonalData) {
        case "no": case "n/a": return 0;
        case "opt-out": return 55;
        case "yes": return 100;
        default: return null;
      }
    },
    detail: (t) => t.trainsOnPersonalData === "yes"
      ? "On the default tier your inputs train the vendor's models, which is irreversible exposure."
      : t.trainsOnPersonalData === "opt-out"
        ? "Training is on by default on the consumer tier; you must find and set the opt-out."
        : "Does not train on your data by default.",
  },
  {
    key: "businessTraining", weight: 8, label: "Trains on business-tier data",
    risk: (t) => {
      switch (t.trainsOnBusinessData) {
        case "no": case "n/a": return 0;
        case "opt-out": return 60;
        case "yes": return 100;
        default: return null;
      }
    },
    detail: () => "Whether even the paid or team tier uses your data for training.",
  },
  { key: "soc2", weight: 16, label: "SOC 2 Type II", risk: (t) => control(t.soc2), detail: () => "Independent SOC 2 security attestation." },
  { key: "gdpr", weight: 16, label: "GDPR DPA", risk: (t) => control(t.gdprDpa), detail: () => "A Data Processing Addendum for EU/UK personal data." },
  { key: "iso", weight: 10, label: "ISO 27001", risk: (t) => control(t.iso27001), detail: () => "ISO/IEC 27001 information-security certification." },
  { key: "hipaa", weight: 10, label: "HIPAA BAA", risk: (t) => control(t.hipaaBaa), detail: () => "A Business Associate Agreement, required for protected health information." },
  { key: "residency", weight: 8, label: "EU data residency", risk: (t) => control(t.dataRegionEu), detail: () => "Whether data can be kept in the EU." },
  { key: "sso", weight: 6, label: "SSO / SAML", risk: (t) => control(t.ssoSaml), detail: () => "Enterprise single sign-on to govern account access." },
];

const TOTAL_WEIGHT = SIGNALS.reduce((s, x) => s + x.weight, 0);

export function scoreTool(t: AiTool): RiskResult {
  const known = SIGNALS.map((s) => ({ s, r: s.risk(t) })).filter((x): x is { s: Signal; r: number } => x.r !== null);
  const knownWeight = known.reduce((sum, x) => sum + x.s.weight, 0);
  const coverage = TOTAL_WEIGHT > 0 ? knownWeight / TOTAL_WEIGHT : 0;

  if (knownWeight === 0) return { score: 0, band: "Unrated", coverage: 0, factors: [] };

  const score = Math.round(known.reduce((sum, x) => sum + x.r * x.s.weight, 0) / knownWeight);

  // Per-signal contribution to the final score (shares sum to `score`), shown as
  // the "why it scores X" breakdown. Only surface signals that add risk.
  const factors: RiskFactor[] = known
    .map((x) => ({ label: x.s.label, points: Math.round((x.r * x.s.weight) / knownWeight), detail: x.s.detail(t) }))
    .filter((f) => f.points > 0);

  let band: Band = score <= 24 ? "Low" : score <= 54 ? "Medium" : "High";
  // Honesty guardrails: a top band can never rest on thin evidence, and a tool
  // that trains on your data by default is never "Low" risk.
  if (band === "Low" && (coverage < 0.5 || t.trainsOnPersonalData === "yes")) band = "Medium";

  return { score, band, coverage, factors };
}

export const BAND_COLORS: Record<Band, string> = {
  Low: "emerald",
  Medium: "amber",
  High: "red",
  Unrated: "slate",
};

// Short, citable one-liner used in lists, meta descriptions and JSON-LD.
export function bandSummary(t: AiTool): string {
  const { band, score, coverage } = scoreTool(t);
  if (band === "Unrated") return `${t.name}: risk not yet rated. Facts pending verification.`;
  const train =
    t.trainsOnPersonalData === "no" ? "does not train on your data"
    : t.trainsOnPersonalData === "opt-out" ? "trains on your data unless you opt out"
    : t.trainsOnPersonalData === "yes" ? "trains on your data by default"
    : "has unclear training practices";
  const conf = coverage < 0.5 ? ", though several facts are still unverified" : "";
  return `${t.name} is ${band.toLowerCase()}-risk for default at-work use (${score}/100): it ${train}${
    t.soc2 === "yes" ? ", and holds SOC 2 Type II" : ""
  }${conf}.`;
}
