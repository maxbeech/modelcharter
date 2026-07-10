import { ensureOrg, getRegister } from "@/lib/workspace";
import { getTrackedSlugs } from "@/lib/alerts";
import { getTool } from "@/lib/ai-tools";
import { scoreTool } from "@/lib/risk";
import { RegisterTable, type RegisterItem } from "@/components/RegisterTable";
import { actionSetToolStatus, actionSetTracked } from "../actions";

export default async function ToolsPage() {
  const org = await ensureOrg();
  if (!org) return null;
  const [rows, tracked] = await Promise.all([getRegister(org.id), getTrackedSlugs(org.id)]);
  const trackedSet = new Set(tracked);
  const items: RegisterItem[] = rows.map((r) => {
    const t = getTool(r.tool_slug);
    const sc = t ? scoreTool(t) : { band: "Unrated" as const, score: 0, factors: [] };
    return { slug: r.tool_slug, name: r.name, status: r.status, band: sc.band, score: sc.score, tracked: trackedSet.has(r.tool_slug) };
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-ink">AI tool register</h2>
        <p className="mt-1 text-sm text-ink-soft">Decide which AI tools your team may use. Risk ratings come from the directory; the status you set here is your team&apos;s policy. Watch a tool to get an alert when its data-handling facts change.</p>
      </div>
      <RegisterTable items={items} action={actionSetToolStatus} trackAction={actionSetTracked} />
    </div>
  );
}
