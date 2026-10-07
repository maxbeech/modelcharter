// The head-term registry questions ("Is X HIPAA compliant?", "Does X train on
// your data?") that back both the /tools/[slug]/[question] pages and the FAQ
// block on a tool profile. One data table so both surfaces answer identically
// from the same sourced facts. Answers are sourced-only: when a fact is null we
// say "not verified" rather than guessing.

import type { AiTool } from "./ai-tools";

export type QuestionSlug = "hipaa" | "gdpr" | "soc2" | "iso27001" | "training";
export const QUESTION_SLUGS: QuestionSlug[] = ["hipaa", "gdpr", "soc2", "iso27001", "training"];

// null = unverified, true = passes (safe/compliant), false = fails.
export interface QuestionDef {
  slug: QuestionSlug;
  label: string;
  framework: string; // matching /compliance hub slug
  ask: (name: string) => string;
  passes: (t: AiTool) => boolean | null;
  answer: (t: AiTool) => string;
  keywords: (name: string) => string[];
}

export type QuestionEvidence = {
  label: string;
  value: string;
  explanation: string;
};

const DEFS: Record<QuestionSlug, QuestionDef> = {
  hipaa: {
    slug: "hipaa",
    label: "HIPAA",
    framework: "hipaa",
    ask: (n) => `Is ${n} HIPAA compliant?`,
    passes: (t) => (t.hipaaBaa === null ? null : t.hipaaBaa === "yes"),
    answer: (t) =>
      t.hipaaBaa === null
        ? `Not verified. Check directly with ${t.vendor} before using ${t.name} with protected health information (PHI).`
        : t.hipaaBaa === "yes"
          ? `Yes. ${t.vendor} will sign a Business Associate Agreement (BAA) for ${t.name}, usually on an enterprise plan, which is the baseline requirement for handling PHI.`
          : `No documented BAA. ${t.vendor} does not appear to offer one for ${t.name}, so treat it as unsuitable for PHI until confirmed otherwise.`,
    keywords: (n) => [`is ${n} hipaa compliant`, `${n} hipaa`, `${n} baa`, `${n} phi`],
  },
  gdpr: {
    slug: "gdpr",
    label: "GDPR",
    framework: "gdpr",
    ask: (n) => `Is ${n} GDPR compliant?`,
    passes: (t) => (t.gdprDpa === null ? null : t.gdprDpa === "yes"),
    answer: (t) =>
      t.gdprDpa === null
        ? `Not verified. Check ${t.vendor}'s terms for a GDPR Data Processing Agreement (DPA) before processing EU personal data in ${t.name}.`
        : t.gdprDpa === "yes"
          ? `Yes. ${t.vendor} offers a Data Processing Agreement (DPA) for ${t.name}, the baseline GDPR control when a vendor processes personal data on your behalf.`
          : `No documented DPA found for ${t.name}. That is a gap for GDPR-regulated data until ${t.vendor} confirms one.`,
    keywords: (n) => [`is ${n} gdpr compliant`, `${n} gdpr`, `${n} dpa`, `${n} data processing agreement`],
  },
  soc2: {
    slug: "soc2",
    label: "SOC 2",
    framework: "soc-2",
    ask: (n) => `Is ${n} SOC 2 compliant?`,
    passes: (t) => (t.soc2 === null ? null : t.soc2 === "yes"),
    answer: (t) =>
      t.soc2 === null
        ? `Not verified. ${t.vendor} has not published a SOC 2 report we could confirm for ${t.name}.`
        : t.soc2 === "yes"
          ? `Yes. ${t.vendor} holds a SOC 2 report covering ${t.name}, which gives independent assurance over its security controls.`
          : `No SOC 2 report found for ${t.name}.`,
    keywords: (n) => [`is ${n} soc 2 compliant`, `${n} soc 2`, `${n} soc2`, `${n} security certification`],
  },
  iso27001: {
    slug: "iso27001",
    label: "ISO 27001",
    framework: "iso-27001",
    ask: (n) => `Is ${n} ISO 27001 certified?`,
    passes: (t) => (t.iso27001 === null ? null : t.iso27001 === "yes"),
    answer: (t) =>
      t.iso27001 === null
        ? `Not verified. We could not confirm an ISO/IEC 27001 certification for ${t.name}.`
        : t.iso27001 === "yes"
          ? `Yes. ${t.vendor} is ISO/IEC 27001 certified for ${t.name}, the international information-security management standard.`
          : `No ISO/IEC 27001 certification found for ${t.name}.`,
    keywords: (n) => [`is ${n} iso 27001 certified`, `${n} iso 27001`, `${n} iso27001`],
  },
  training: {
    slug: "training",
    label: "Training on your data",
    framework: "no-training",
    ask: (n) => `Does ${n} train on your data?`,
    passes: (t) => (t.trainsOnPersonalData === null ? null : t.trainsOnPersonalData === "no"),
    answer: (t) =>
      t.trainsOnPersonalData === null
        ? `Not verified. Check ${t.vendor}'s privacy terms for ${t.name}'s current training policy.`
        : t.trainsOnPersonalData === "no"
          ? `No. ${t.name} does not train its models on your content by default${t.enterprisePlan ? `, and its business tier (${t.enterprisePlan}) keeps your data out of training` : ""}.`
          : t.trainsOnPersonalData === "opt-out"
            ? `By default it can. On the consumer tier ${t.name} uses your inputs to improve models unless you opt out. Its business tier typically does not.`
            : `Yes. ${t.name} trains on your inputs on its default tier, with no reliable opt-out. Use an approved business tier for anything sensitive.`,
    keywords: (n) => [`does ${n} train on your data`, `${n} data training`, `${n} privacy`, `is ${n} safe`],
  },
};

export function getQuestion(slug: string): QuestionDef | undefined {
  return DEFS[slug as QuestionSlug];
}
export function allQuestions(): QuestionDef[] {
  return QUESTION_SLUGS.map((s) => DEFS[s]);
}

function verdict(value: AiTool["soc2"]): string {
  return value === "yes" ? "Confirmed" : value === "no" ? "Not offered" : "Not verified";
}

/**
 * The facts that explain an answer, kept alongside the answer definitions so
 * every tool-question route is generated from the same vendor-sourced record.
 * This makes a question page useful on its own instead of a thin duplicate of
 * its parent tool profile.
 */
export function evidenceForQuestion(t: AiTool, question: QuestionSlug): QuestionEvidence[] {
  const common: QuestionEvidence[] = [
    {
      label: "Default data training",
      value: t.trainsOnPersonalData === null ? "Not verified" : t.trainsOnPersonalData === "no" ? "No by default" : t.trainsOnPersonalData === "opt-out" ? "Opt-out required" : "Yes by default",
      explanation: t.trainsPersonalNote || `ModelCharter could not confirm a more specific public training statement from ${t.vendor}.`,
    },
    {
      label: "Business-tier training",
      value: t.trainsOnBusinessData === null ? "Not verified" : t.trainsOnBusinessData === "no" ? "No by default" : t.trainsOnBusinessData === "opt-out" ? "Opt-out required" : "Yes by default",
      explanation: t.trainsBusinessNote || (t.enterprisePlan ? `${t.enterprisePlan} is the business tier recorded for this profile.` : `No separate business tier was confirmed for this profile.`),
    },
  ];

  const byQuestion: Record<QuestionSlug, QuestionEvidence[]> = {
    hipaa: [
      { label: "Business Associate Agreement", value: verdict(t.hipaaBaa), explanation: t.hipaaBaa === "yes" ? `${t.vendor} publishes a BAA option. Confirm the exact plan and service are covered before sending PHI.` : t.hipaaBaa === "no" ? `No BAA was found in ${t.vendor}'s published materials for this service.` : `No public BAA was confirmed. Treat PHI use as blocked until ${t.vendor} provides written terms.` },
      { label: "Enterprise route", value: t.enterprisePlan || "Not confirmed", explanation: t.enterprisePlan ? `For regulated use, validate the BAA, configured service and users under the ${t.enterprisePlan} contract.` : `Do not infer a regulated-use tier from consumer product marketing.` },
      ...common,
    ],
    gdpr: [
      { label: "Data Processing Agreement", value: verdict(t.gdprDpa), explanation: t.gdprDpa === "yes" ? `${t.vendor} publishes a DPA. A DPA is necessary but does not replace your own lawful-basis, DPIA and transfer assessment.` : t.gdprDpa === "no" ? `No DPA was found in ${t.vendor}'s published materials for this service.` : `No public DPA was confirmed. Do not process EU personal data until the vendor supplies suitable processor terms.` },
      { label: "EU data residency", value: verdict(t.dataRegionEu), explanation: t.dataRegionEu === "yes" ? `${t.vendor} documents an EU data-residency option; confirm it is enabled for the account and workload in scope.` : `No EU-residency option was confirmed in the sources reviewed for this profile.` },
      ...common,
    ],
    soc2: [
      { label: "SOC 2 report", value: verdict(t.soc2), explanation: t.soc2 === "yes" ? `${t.vendor} reports a SOC 2 attestation. Request the current report and relevant bridge letter during procurement.` : t.soc2 === "no" ? `No SOC 2 report was found in ${t.vendor}'s public materials for this service.` : `No public SOC 2 report was confirmed. Ask ${t.vendor} for current assurance evidence before approving sensitive use.` },
      { label: "ISO 27001", value: verdict(t.iso27001), explanation: t.iso27001 === "yes" ? `${t.vendor} also reports ISO/IEC 27001 certification.` : `No ISO/IEC 27001 certification was confirmed in the sources reviewed for this profile.` },
      ...common,
    ],
    iso27001: [
      { label: "ISO/IEC 27001", value: verdict(t.iso27001), explanation: t.iso27001 === "yes" ? `${t.vendor} reports ISO/IEC 27001 certification. Ask for scope and current certificate dates before treating it as supplier assurance.` : t.iso27001 === "no" ? `No ISO/IEC 27001 certification was found in ${t.vendor}'s public materials for this service.` : `No public ISO/IEC 27001 certification was confirmed. Request evidence from ${t.vendor} if this is a procurement requirement.` },
      { label: "SOC 2", value: verdict(t.soc2), explanation: t.soc2 === "yes" ? `${t.vendor} also reports a SOC 2 attestation, which can complement but does not replace ISO scope evidence.` : `No SOC 2 report was confirmed in the sources reviewed for this profile.` },
      ...common,
    ],
    training: [
      common[0],
      common[1],
      { label: "Training control", value: verdict(t.trainingOptout), explanation: t.trainingOptout === "yes" ? `${t.vendor} documents a training control. Confirm whether it is enabled centrally or must be set by each user.` : `No reliable training opt-out was confirmed in the sources reviewed for this profile.` },
    ],
  };

  return byQuestion[question];
}
