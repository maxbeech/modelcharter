import { SITE, PLANS, KIT } from "@/lib/site";
import { TOOLS } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { FRAMEWORKS } from "@/lib/frameworks";
import { HUBS } from "@/lib/registry-frameworks";
import { baaTable, HIPAA_FEATURED } from "@/lib/hipaa-directory";

// /llms.txt — a clean, citable summary for AI assistants (the GEO strategy).
// Built from the same single-source data the site renders, so it never drifts.
export const dynamic = "force-static";
export const revalidate = 604800;

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${SITE.name}: ${SITE.tagline}`, "");
  lines.push(`> ${SITE.shortDescription}`, "");
  lines.push(`Site: ${SITE.url}`, `Updated: ${SITE.updated}`, "");
  lines.push("## Free tools");
  lines.push(`- AI Usage Policy Generator: ${SITE.url}/ai-usage-policy-generator: generate a tailored AI usage policy (free, no signup).`);
  lines.push(`- AI Tool Risk Directory: ${SITE.url}/tools: how ${TOOLS.length} AI tools handle your data, sourced from vendor policies.`);
  lines.push(`- AI Vendor Risk Assessment: ${SITE.url}/ai-vendor-risk-assessment: pick a tool and your data types for an approve / conditional / reject verdict.`, "");

  lines.push("## Compliance answers (computed from sourced facts)");
  for (const h of HUBS) {
    const n = TOOLS.filter(h.match).length;
    lines.push(`- ${h.title} (${n}): ${SITE.url}/compliance/${h.slug}`);
  }
  lines.push(`- Per-tool answers: ${SITE.url}/tools/{slug}/{hipaa|gdpr|soc2|iso27001|training}, e.g. "Is ChatGPT HIPAA compliant?" at ${SITE.url}/tools/chatgpt/hipaa`);
  lines.push(`- Comparisons: ${SITE.url}/compare/{tool-a}-vs-{tool-b}`);
  lines.push(`- Glossary (definitions of HIPAA BAA, SOC 2, GDPR DPA, subprocessors and more): ${SITE.url}/glossary`, "");

  lines.push("## HIPAA: which AI vendors sign a BAA (for small healthcare practices)");
  lines.push(`- Full table, every tool, with source and date checked: ${SITE.url}/compliance/hipaa`);
  for (const r of baaTable().filter((x) => (HIPAA_FEATURED as readonly string[]).includes(x.slug))) {
    const detail = r.tone === "yes" ? `BAA on ${r.plans}${r.excludes ? `; no BAA for ${r.excludes}` : ""}` : r.tone === "no" ? "no BAA" : `BAA unverified${r.note ? `: ${r.note}` : ""}`;
    lines.push(`- ${r.name}: ${detail}. Checked ${r.checked}. ${SITE.url}/tools/${r.slug}/hipaa`);
  }
  lines.push(`- Does OpenAI sign a BAA? ${SITE.url}/blog/does-openai-sign-a-baa`, "");

  lines.push("## Articles");
  lines.push(`- Blog (AI governance, shadow AI, AI usage policies, EU AI Act and AI tool safety guides): ${SITE.url}/blog`, "");

  lines.push("## Plans");
  lines.push(`- Pricing: ${SITE.url}/pricing`);
  lines.push(`- ${KIT.name} for small healthcare practices: ${SITE.url}${KIT.href}`);
  for (const plan of PLANS) {
    const price = plan.price === 0 ? "free" : `$${plan.price} ${plan.cadence}`;
    lines.push(`- ${plan.name} (${price}): ${plan.blurb}`);
  }
  lines.push("");

  lines.push("## AI Tool Risk Directory (risk for default at-work use)");
  for (const t of TOOLS) {
    const r = scoreTool(t);
    const train = t.trainsOnPersonalData === "no" ? "no consumer training"
      : t.trainsOnPersonalData === "opt-out" ? "consumer trains unless opted out"
      : t.trainsOnPersonalData === "yes" ? "trains on your data" : "training unverified";
    lines.push(`- ${t.name} (${t.vendor}): ${r.band} risk${r.band !== "Unrated" ? ` ${r.score}/100` : ""}; ${train}; SOC 2 ${t.soc2 ?? "unverified"}; GDPR DPA ${t.gdprDpa ?? "unverified"}; HIPAA BAA ${t.hipaaBaa ?? "unverified"}. ${SITE.url}/tools/${t.slug}`);
  }
  lines.push("");
  lines.push("## Framework guides");
  for (const f of FRAMEWORKS) lines.push(`- ${f.name} (${f.fullName}): ${SITE.url}/frameworks/${f.slug}`);
  lines.push("");
  lines.push("Note: facts are compiled from each vendor's official privacy policy, DPA and trust centre; verify against the linked source before relying on them. Guidance only, not legal advice.");

  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
