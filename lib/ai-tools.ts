// AI Tool Risk Directory — the real-data spine and GEO moat.
//
// Facts are compiled from each vendor's official privacy policy, DPA and trust
// centre and stored in data/ai-tools.json (single source of truth). Every
// version-sensitive claim carries a source URL and a confidence flag; anything
// we could not verify is `null` + confidence "verify" and shown as "Unverified"
// in the UI — we never present an unverified fact as settled.

import raw from "../data/ai-tools.json";

export type Verdict = "yes" | "no" | "opt-out" | "n/a" | null;
export type Confidence = "high" | "medium" | "verify";
export type Category =
  | "assistant" | "coding" | "meetings" | "writing"
  | "productivity" | "image" | "video" | "audio" | "search" | "design"
  | "customer-support" | "sales";

export interface Source { claim: string; url: string }

export interface AiTool {
  slug: string;
  name: string;
  vendor: string;
  category: Category;
  homepageUrl: string;
  privacyUrl?: string;
  dpaUrl?: string;
  trustUrl?: string;
  subprocessorsUrl?: string;
  trainsOnPersonalData: Verdict;
  trainsPersonalNote?: string;
  trainsOnBusinessData: Verdict;
  trainsBusinessNote?: string;
  trainingOptout: Verdict;
  retention?: string;
  soc2: Verdict;
  iso27001: Verdict;
  iso42001: Verdict;
  gdprDpa: Verdict;
  hipaaBaa: Verdict;
  dataRegionEu: Verdict;
  ssoSaml: Verdict;
  enterprisePlan?: string;
  notableRisk?: string;
  sources: Source[];
  confidence: Confidence;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  assistant: "AI assistants", coding: "Coding", meetings: "Meetings & notetakers",
  writing: "Writing", productivity: "Productivity", image: "Image",
  video: "Video", audio: "Audio", search: "Search", design: "Design",
  "customer-support": "Customer support", sales: "Sales & CRM",
};

function v(x: unknown): Verdict {
  const s = String(x ?? "").toLowerCase().trim();
  if (s === "yes" || s === "no" || s === "opt-out" || s === "n/a") return s as Verdict;
  return null;
}
function str(x: unknown): string | undefined {
  const s = x == null ? "" : String(x).trim();
  return s ? s : undefined;
}

// Normalise a loosely-typed JSON record into a strict AiTool. Decouples the
// published data file from the app so a regenerated dataset never breaks types.
function normalize(r: Record<string, unknown>): AiTool {
  const conf = String(r.confidence ?? "verify").toLowerCase();
  return {
    slug: String(r.slug),
    name: String(r.name),
    vendor: String(r.vendor ?? ""),
    category: (str(r.category) as Category) ?? "assistant",
    homepageUrl: String(r.homepage_url ?? r.homepageUrl ?? ""),
    privacyUrl: str(r.privacy_url ?? r.privacyUrl),
    dpaUrl: str(r.dpa_url ?? r.dpaUrl),
    trustUrl: str(r.trust_url ?? r.trustUrl),
    subprocessorsUrl: str(r.subprocessors_url ?? r.subprocessorsUrl),
    trainsOnPersonalData: v(r.trains_on_personal_data ?? r.trainsOnPersonalData),
    trainsPersonalNote: str(r.trains_on_personal_data_note ?? r.trains_personal_note ?? r.trainsPersonalNote),
    trainsOnBusinessData: v(r.trains_on_business_data ?? r.trainsOnBusinessData),
    trainsBusinessNote: str(r.trains_on_business_data_note ?? r.trains_business_note ?? r.trainsBusinessNote),
    trainingOptout: v(r.training_optout ?? r.trainingOptout),
    retention: str(r.retention),
    soc2: v(r.soc2), iso27001: v(r.iso27001), iso42001: v(r.iso42001),
    gdprDpa: v(r.gdpr_dpa ?? r.gdprDpa), hipaaBaa: v(r.hipaa_baa ?? r.hipaaBaa),
    dataRegionEu: v(r.data_region_eu ?? r.dataRegionEu), ssoSaml: v(r.sso_saml ?? r.ssoSaml),
    enterprisePlan: str(r.enterprise_plan ?? r.enterprisePlan),
    notableRisk: str(r.notable_risk ?? r.notableRisk),
    sources: Array.isArray(r.sources)
      ? (r.sources as Record<string, unknown>[])
          .filter((s) => s && s.url)
          .map((s) => ({ claim: String(s.claim ?? ""), url: String(s.url) }))
      : [],
    confidence: (["high", "medium", "verify"].includes(conf) ? conf : "verify") as Confidence,
  };
}

const rawTools = ((raw as { tools?: unknown[] }).tools ?? []) as Record<string, unknown>[];

export const TOOLS: AiTool[] = rawTools
  .filter((r) => r && r.slug && r.name)
  .map(normalize)
  .sort((a, b) => a.name.localeCompare(b.name));

export const DATASET_GENERATED: string =
  String((raw as { generated?: string }).generated ?? SITE_FALLBACK_DATE());

function SITE_FALLBACK_DATE() { return "2026-06-18"; }

export function getTool(slug: string): AiTool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(): Record<string, AiTool[]> {
  const out: Record<string, AiTool[]> = {};
  for (const t of TOOLS) (out[t.category] ??= []).push(t);
  return out;
}
