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
