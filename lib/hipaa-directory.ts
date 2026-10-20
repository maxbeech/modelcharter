// The "who will sign a BAA" view of the directory, shared by the HIPAA hub
// (/compliance/hipaa), the per-tool HIPAA answer pages and their tests. Rows
// are derived from data/ai-tools.json only. A tool we could not verify stays
// "Unverified", never a pass.

import { TOOLS, DATASET_GENERATED, type AiTool } from "./ai-tools";
import { baaStatus, type BaaTone } from "./hipaa";
import { getQuestion } from "./registry-questions";

/** The tools small practices ask about most, in search-volume order. */
export const HIPAA_FEATURED = ["chatgpt", "claude", "microsoft-365-copilot", "google-gemini", "otter-ai", "grammarly", "notion-ai"] as const;

export const HEALTHCARE_POLICY_HREF = "/ai-usage-policy-generator?preset=healthcare";

export interface BaaRow {
  slug: string;
  name: string;
  vendor: string;
  tone: BaaTone;
  /** Short answer for the table: "Only on some plans", "Yes", "No", "Unverified". */
  answer: string;
  /** Which plan carries the BAA, or why we could not confirm one. */
  plans: string;
  /** Plans the vendor will not cover, when it says so. */
  excludes?: string;
  note?: string;
  sourceUrl?: string;
  /** ISO date the fact was checked. */
  checked: string;
  /** True when the BAA fact was rechecked on its own, not just with the dataset. */
  rechecked: boolean;
}

/** The vendor page behind a tool's BAA fact, best first. */
export function baaSourceUrl(t: AiTool): string | undefined {
  return t.baaSource ?? t.sources.find((s) => /hipaa|baa/i.test(s.claim))?.url ?? t.trustUrl;
}

export function baaRow(t: AiTool): BaaRow {
  const tone = baaStatus(t).tone;
  const plans = (t.baaPlans && t.baaPlans[0].toUpperCase() + t.baaPlans.slice(1))
    ?? (tone === "yes" ? (t.enterprisePlan ? `Usually ${t.enterprisePlan}. Confirm the plan with ${t.vendor}.` : `A business plan. Confirm which one with ${t.vendor}.`)
      : tone === "no" ? "None" : "Not confirmed");
  const answer = tone === "yes" ? (t.baaPlans || t.enterprisePlan ? "Only on some plans" : "Yes") : tone === "no" ? "No" : "Unverified";
  return {
    slug: t.slug,
    name: t.name,
    vendor: t.vendor,
    tone,
    answer,
    plans,
    excludes: t.baaExcludes,
    note: t.baaNote,
    sourceUrl: baaSourceUrl(t),
    checked: t.baaVerified ?? DATASET_GENERATED,
    rechecked: !!t.baaVerified,
  };
}

const TONE_ORDER: Record<BaaTone, number> = { yes: 0, unknown: 1, no: 2 };

/**
 * Every tool as a BAA row: the featured tools first in their fixed order, then
 * the rest by verdict (BAA, unverified, no) and name.
 */
export function baaTable(tools: AiTool[] = TOOLS): BaaRow[] {
  const featured = HIPAA_FEATURED.map((s) => tools.find((t) => t.slug === s)).filter((t): t is AiTool => !!t);
  const rest = tools
    .filter((t) => !(HIPAA_FEATURED as readonly string[]).includes(t.slug))
    .map(baaRow)
    .sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone] || a.name.localeCompare(b.name));
  return [...featured.map(baaRow), ...rest];
}

/**
 * Tools with a confirmed BAA to suggest instead of (or next to) `t`. Same
 * category first, then general assistants, then anything else; tools whose
 * BAA we rechecked recently rank ahead of the rest.
 */
export function saferAlternatives(t: AiTool, limit = 4, tools: AiTool[] = TOOLS): AiTool[] {
  const rank = (x: AiTool) => (x.category === t.category ? 0 : x.category === "assistant" ? 1 : 2) * 2 + (x.baaVerified ? 0 : 1);
  return tools
    .filter((x) => x.slug !== t.slug && x.hipaaBaa === "yes")
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** "Oct 20, 2026" from an ISO date, fixed to UTC so builds are deterministic. */
export function formatChecked(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export interface HipaaFaq { q: string; a: string }

/**
 * FAQs for the HIPAA hub. The per-tool answers reuse the registry question
 * text, so the hub, the tool pages and the FAQ structured data always agree.
 */
export function hipaaHubFaqs(tools: AiTool[] = TOOLS): HipaaFaq[] {
  const q = getQuestion("hipaa")!;
  const perTool = ["chatgpt", "claude", "microsoft-365-copilot", "google-gemini"]
    .map((s) => tools.find((t) => t.slug === s))
    .filter((t): t is AiTool => !!t)
    .map((t) => ({ q: q.ask(t.name), a: q.answer(t) }));
  return [
    { q: "What makes an AI tool HIPAA compliant?", a: "No AI tool is HIPAA compliant on its own. Before patient data goes in, you need a Business Associate Agreement (BAA) with the vendor that covers the exact plan your staff use. Then you need the right settings and written rules for staff." },
    ...perTool,
    { q: "Can staff use a free or personal AI account with patient data?", a: "No. Treat free and personal accounts as off limits for PHI. Every BAA we have confirmed covers a business, enterprise or API account, or a product built for clinicians, and only once it is signed." },
    { q: "Is de-identified data safe to use?", a: "Data that is properly de-identified under HIPAA is no longer PHI. Removing a name is not enough, though, because dates, locations and record numbers can identify a patient too. If in doubt, keep anything from a patient record out of tools without a BAA." },
    { q: "Is this legal advice?", a: "No. It is guidance built from each vendor's published terms, with the source and the date we checked. Vendors change their plans, so confirm the current terms before you rely on them." },
  ];
}

/** Extra FAQs for /tools/[slug]/hipaa, after the direct answer. */
export function hipaaToolFaqs(t: AiTool, tools: AiTool[] = TOOLS): HipaaFaq[] {
  const q = getQuestion("hipaa")!;
  const row = baaRow(t);
  const alts = saferAlternatives(t, 4, tools).map((x) => x.name);
  const faqs: HipaaFaq[] = [{ q: q.ask(t.name), a: q.answer(t) }];
  if (row.tone === "yes") {
    faqs.push({ q: `Which ${t.name} plan includes a BAA?`, a: `${t.baaPlans ? `${t.vendor} will sign a BAA for ${t.baaPlans}.` : row.plans}${t.baaNote ? ` ${t.baaNote}` : ""}` });
  }
  faqs.push({
    q: `Can I use the free version of ${t.name} with patient data?`,
    a: row.tone === "yes"
      ? `No. Only an account covered by a signed BAA can be used with PHI.${t.baaExcludes ? ` ${t.vendor} offers no BAA for ${t.baaExcludes}.` : " Free and personal accounts are not covered."}`
      : `No. We could not confirm a BAA for any ${t.name} plan, so keep patient data out of it entirely.`,
  });
  if (alts.length) {
    faqs.push({ q: `What can I use instead of ${t.name} for patient data?`, a: `Tools whose vendor offers a BAA include ${alts.join(", ")}. Each still needs the BAA signed on the right plan before any PHI goes in.` });
  }
  return faqs;
}
