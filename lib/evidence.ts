// The evidence pack: one page a practice can print and hand to an auditor, an
// insurer or a patient who asks "how do you use AI?". A pure function over the
// workspace rows and the directory, so it is fully testable and shows only
// what the workspace actually holds.

import { baaStatus, isPhiRisk, type BaaStatus } from "./hipaa";
import type { AiTool } from "./ai-tools";

export interface EvidenceInput {
  orgName: string;
  generatedAt: string; // ISO date-time
  register: { tool_slug: string; name: string; status: string }[];
  policies: { version: number; content_md: string; created_at: string }[];
  attestations: { name: string | null; email: string | null; acknowledged_at: string | null; created_at: string }[];
  toolFor: (slug: string) => AiTool | undefined;
}

export interface EvidenceTool { slug: string; name: string; status: string; baa: BaaStatus; phiRisk: boolean; sourceUrl?: string }

export interface Evidence {
  orgName: string;
  generatedOn: string;
  policy: { version: number; savedOn: string; contentMd: string } | null;
  decided: EvidenceTool[];
  undecidedCount: number;
  phiRisks: EvidenceTool[];
  signed: { name: string; email: string | null; signedOn: string }[];
  pending: { name: string | null; sentOn: string }[];
}

const STATUS_ORDER: Record<string, number> = { approved: 0, restricted: 1, prohibited: 2 };

export function buildEvidence(input: EvidenceInput): Evidence {
  const latest = [...input.policies].sort((a, b) => b.version - a.version)[0];
  const decided = input.register
    .filter((r) => r.status in STATUS_ORDER)
    .map((r): EvidenceTool => {
      const tool = input.toolFor(r.tool_slug);
      const baaSource = tool?.baaSource ?? tool?.sources.find((s) => /hipaa|baa/i.test(s.claim))?.url;
      return { slug: r.tool_slug, name: r.name, status: r.status, baa: baaStatus(tool), phiRisk: isPhiRisk(r.status, tool), sourceUrl: baaSource ?? tool?.trustUrl };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));

  const signed = input.attestations
    .filter((a) => a.acknowledged_at)
    .map((a) => ({ name: a.name || a.email || "Unnamed", email: a.email, signedOn: a.acknowledged_at!.slice(0, 10) }))
    .sort((a, b) => a.signedOn.localeCompare(b.signedOn));
  const pending = input.attestations
    .filter((a) => !a.acknowledged_at)
    .map((a) => ({ name: a.name, sentOn: a.created_at.slice(0, 10) }));

  return {
    orgName: input.orgName,
    generatedOn: input.generatedAt.slice(0, 10),
    policy: latest ? { version: latest.version, savedOn: latest.created_at.slice(0, 10), contentMd: latest.content_md } : null,
    decided,
    undecidedCount: input.register.length - decided.length,
    phiRisks: decided.filter((t) => t.phiRisk),
    signed,
    pending,
  };
}
