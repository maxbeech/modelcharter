// Compliance hub pages (/compliance/[framework]): each lists the tools in the
// directory that meet one control, computed from the same sourced facts. These
// target head-term "HIPAA compliant AI tools" style queries. Match predicates
// use ModelCharter's Verdict fields (a fact must be an explicit "yes"; null is
// treated as not-passing so we never over-claim).

import type { AiTool } from "./ai-tools";

export interface ComplianceHub {
  slug: string;
  label: string;
  title: string;
  blurb: string;
  keyword: string;
  match: (t: AiTool) => boolean;
}

export const HUBS: ComplianceHub[] = [
  {
    slug: "hipaa",
    label: "HIPAA",
    title: "HIPAA-compliant AI tools",
    blurb:
      "AI tools whose vendor will sign a Business Associate Agreement (BAA), the baseline for handling protected health information (PHI) in the US. Usually available on an enterprise tier only.",
    keyword: "hipaa compliant ai tools",
    match: (t) => t.hipaaBaa === "yes",
  },
  {
    slug: "gdpr",
    label: "GDPR",
    title: "GDPR-ready AI tools",
    blurb:
      "AI tools that offer a Data Processing Agreement (DPA), the control EU and UK teams need before an AI vendor processes personal data on their behalf.",
    keyword: "gdpr compliant ai tools",
    match: (t) => t.gdprDpa === "yes",
  },
  {
    slug: "soc-2",
    label: "SOC 2",
    title: "SOC 2 AI tools",
    blurb:
      "AI tools with a SOC 2 report: independent assurance over their security, availability and confidentiality controls. The baseline most B2B security reviews expect.",
    keyword: "soc 2 ai tools",
    match: (t) => t.soc2 === "yes",
  },
  {
    slug: "iso-27001",
    label: "ISO 27001",
    title: "ISO 27001 certified AI tools",
    blurb: "AI tools certified against ISO/IEC 27001, the international information-security management standard.",
    keyword: "iso 27001 ai tools",
    match: (t) => t.iso27001 === "yes",
  },
  {
    slug: "no-training",
    label: "No training",
    title: "AI tools that do not train on your data",
    blurb:
      "AI tools that do not train their models on your content by default. The single most important control for keeping confidential work out of a vendor's training set.",
    keyword: "ai tools that don't train on your data",
    match: (t) => t.trainsOnPersonalData === "no",
  },
];

export const HUB_BY_SLUG: Record<string, ComplianceHub> = Object.fromEntries(HUBS.map((h) => [h.slug, h]));

export interface UseCase {
  slug: string;
  label: string;
  title: string;
  blurb: string;
  keyFrameworks: string[];
  intro: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "healthcare",
    label: "Healthcare",
    title: "Safe AI tools for healthcare",
    blurb: "Which AI tools will sign a BAA and keep PHI out of training.",
    keyFrameworks: ["hipaa", "soc-2", "no-training"],
    intro:
      "In healthcare the gating question is simple: will the vendor sign a BAA, and does it keep your PHI out of model training? These AI tools clear that bar on the facts we could verify from each vendor's own trust centre.",
  },
  {
    slug: "legal",
    label: "Legal",
    title: "Safe AI tools for law firms",
    blurb: "AI tools that protect privileged and confidential client data.",
    keyFrameworks: ["no-training", "soc-2", "gdpr"],
    intro:
      "Law firms need AI tools that never train on privileged material and can prove their controls. These meet that standard on the facts we could verify.",
  },
  {
    slug: "finance",
    label: "Finance",
    title: "Safe AI tools for finance and fintech",
    blurb: "AI tools with the certifications and residency finance teams require.",
    keyFrameworks: ["soc-2", "iso-27001", "no-training"],
    intro:
      "Finance teams gate on SOC 2 and ISO 27001, data residency, and a no-training posture. Here is where each tool in the directory actually stands.",
  },
  {
    slug: "enterprise",
    label: "Enterprise",
    title: "Enterprise-ready AI tools",
    blurb: "AI tools with SSO, a DPA, subprocessor transparency and audited controls.",
    keyFrameworks: ["soc-2", "iso-27001", "gdpr"],
    intro:
      "Enterprise security reviews look for SSO/SAML, a DPA, published subprocessors and independent audits. These AI tools tick the most boxes on the facts we could verify.",
  },
];

export const USE_CASE_BY_SLUG: Record<string, UseCase> = Object.fromEntries(USE_CASES.map((u) => [u.slug, u]));
