// Vendor risk verdict: a pure, explainable function of (what data you would put
// in) times (the tool's sourced trust facts). Backs the free AI vendor risk
// assessment tool. Deterministic; every verdict carries its reasons. Adapted to
// ModelCharter's AiTool + scoreTool (where a higher score means MORE risk).

import type { AiTool } from "./ai-tools";
import { scoreTool } from "./risk";

export type DataType = "public" | "pii" | "phi" | "financial" | "source_code" | "confidential";

export const DATA_TYPES: { id: DataType; label: string; hint: string }[] = [
  { id: "public", label: "Public / non-sensitive", hint: "Marketing copy, published content" },
  { id: "pii", label: "Personal data (PII)", hint: "Names, emails, customer records" },
  { id: "phi", label: "Health data (PHI)", hint: "Anything covered by HIPAA" },
  { id: "financial", label: "Financial data", hint: "Accounts, transactions, card data" },
  { id: "source_code", label: "Source code", hint: "Proprietary or client code" },
  { id: "confidential", label: "Confidential / IP", hint: "Unreleased plans, contracts, secrets" },
];

export type AssessmentVerdict = "approve" | "conditional" | "reject" | "review";

export interface RiskResult {
  verdict: AssessmentVerdict;
  score: number;
  band: string;
  reasons: { level: "block" | "warn" | "ok"; text: string }[];
  headline: string;
}

const SENSITIVE: DataType[] = ["pii", "phi", "financial", "source_code", "confidential"];
const hasSensitive = (types: DataType[]) => types.some((t) => SENSITIVE.includes(t));

export function assessRisk(tool: AiTool, dataTypes: DataType[]): RiskResult {
  const reasons: RiskResult["reasons"] = [];
  const r = scoreTool(tool);
  const sensitive = hasSensitive(dataTypes);
  const onlyPublic = dataTypes.length > 0 && dataTypes.every((t) => t === "public");

  // Severity accumulator: 0 = ok, 1 = conditional, 2 = reject.
  let severity = 0;
  const worsen = (level: 1 | 2) => {
    if (level > severity) severity = level;
  };

  if (dataTypes.includes("phi")) {
    if (tool.hipaaBaa === "yes") reasons.push({ level: "ok", text: "Vendor will sign a HIPAA BAA, which is required for PHI." });
    else if (tool.hipaaBaa === "no") {
      reasons.push({ level: "block", text: "Vendor will not sign a BAA. Do not use with PHI." });
      worsen(2);
    } else {
      reasons.push({ level: "warn", text: "BAA availability is not verified. Confirm with the vendor before using with PHI." });
      worsen(1);
    }
  }

  if (sensitive) {
    const tp = tool.trainsOnPersonalData;
    if (tp === "yes") {
      reasons.push({ level: "block", text: "Trains on your inputs with no reliable opt-out. Unsafe for sensitive data on the default tier." });
      worsen(2);
    } else if (tp === "opt-out") {
      reasons.push({ level: "warn", text: "May train on your data depending on tier and settings. Use the business tier and opt out." });
      worsen(1);
    } else if (tp === "no") {
      reasons.push({ level: "ok", text: "Does not train on your data by default." });
    } else {
      reasons.push({ level: "warn", text: "Training posture not verified. Confirm before submitting sensitive data." });
      worsen(1);
    }

    if (tool.soc2 === "yes") reasons.push({ level: "ok", text: "Holds a SOC 2 report." });
    else reasons.push({ level: "warn", text: "SOC 2 not verified. Request the report." });

    if (dataTypes.includes("pii") || dataTypes.includes("confidential")) {
      if (tool.gdprDpa === "yes") reasons.push({ level: "ok", text: "Offers a GDPR Data Processing Agreement." });
      else reasons.push({ level: "warn", text: "DPA availability not verified. Request one before processing EU personal data." });
    }
  }

  if (onlyPublic) reasons.push({ level: "ok", text: "Only non-sensitive or public data, which is low risk for most uses." });

  let verdict: AssessmentVerdict = severity === 2 ? "reject" : severity === 1 ? "conditional" : "approve";
  if (r.band === "Unrated" && verdict === "approve") verdict = "review";

  const headline =
    verdict === "reject" ? "Not recommended for this data"
    : verdict === "conditional" ? "Usable with conditions"
    : verdict === "review" ? "Needs a manual check"
    : "Looks safe for this use";

  return { verdict, score: r.score, band: r.band, reasons, headline };
}
