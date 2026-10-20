// How a tool stands for patient data, read straight from the directory facts
// (data/ai-tools.json is the single source of truth). Unknown stays unknown:
// a tool we could not verify is never shown as safe for PHI.

import type { AiTool } from "./ai-tools";

export type BaaTone = "yes" | "no" | "unknown";

export interface BaaStatus {
  tone: BaaTone;
  /** A few words for a chip. */
  short: string;
  /** One sentence a practice manager can act on. */
  detail: string;
}

export function baaStatus(tool: Pick<AiTool, "name" | "hipaaBaa" | "enterprisePlan"> & Partial<Pick<AiTool, "baaPlans">> | undefined): BaaStatus {
  if (!tool || tool.hipaaBaa == null) {
    return { tone: "unknown", short: "BAA unverified", detail: "We couldn't confirm a BAA from the vendor's own pages. Keep patient data out until you have one in writing." };
  }
  if (tool.hipaaBaa === "yes") {
    // The checked, plan-specific fact wins over the generic enterprise plan name.
    if (tool.baaPlans) return { tone: "yes", short: "BAA available", detail: `${tool.name} offers a BAA on ${tool.baaPlans}. Sign it before any patient data goes in.` };
    const plan = tool.enterprisePlan ? ` Usually only on ${tool.enterprisePlan} or another business plan, never a personal account.` : " Usually only on a business plan, never a personal account.";
    return { tone: "yes", short: "BAA available", detail: `${tool.name} offers a BAA.${plan} Sign it before any patient data goes in.` };
  }
  return { tone: "no", short: "No BAA", detail: `${tool.name} doesn't offer a BAA, so patient data must never go into it.` };
}

/** A tool your practice allows (approved or restricted) that has no confirmed BAA. */
export function isPhiRisk(status: string, tool: Pick<AiTool, "name" | "hipaaBaa" | "enterprisePlan"> | undefined): boolean {
  return (status === "approved" || status === "restricted") && baaStatus(tool).tone !== "yes";
}
