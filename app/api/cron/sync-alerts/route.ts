import { NextResponse } from "next/server";
import { TOOLS } from "@/lib/ai-tools";
import { factSignature, diffFactSignatures, describeFactChanges } from "@/lib/fact-signature";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Daily cron: snapshot every tool's watched facts, diff against the last
// snapshot, and raise a change alert for any team tracking a tool whose facts
// moved. Fail-closed: refuses to run unless CRON_SECRET is set and matches, so
// the endpoint can never be triggered anonymously. Vercel injects the
// Authorization: Bearer <CRON_SECRET> header on scheduled invocations.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }
  const admin = createAdminSupabase();
  if (!admin) return NextResponse.json({ ok: false, reason: "no service role key" }, { status: 503 });

  const { data: snaps } = await admin.from("tool_fact_snapshots").select("tool_slug, signature");
  const prior = new Map((snaps ?? []).map((s) => [s.tool_slug as string, s.signature]));

  const now = new Date().toISOString();
  const snapshotRows = [];
  const changed: { slug: string; name: string; detail: string }[] = [];

  for (const tool of TOOLS) {
    const sig = factSignature(tool);
    snapshotRows.push({ tool_slug: tool.slug, signature: sig, updated_at: now });
    const before = prior.get(tool.slug);
    if (before) {
      const diffs = diffFactSignatures(before as Record<string, unknown>, sig);
      if (diffs.length) changed.push({ slug: tool.slug, name: tool.name, detail: describeFactChanges(diffs) });
    }
  }

  let alertsCreated = 0;
  for (const c of changed) {
    const { data: tracked } = await admin.from("tracked_tools").select("org_id").eq("tool_slug", c.slug);
    const rows = (tracked ?? []).map((t) => ({
      org_id: t.org_id as string,
      tool_slug: c.slug,
      kind: "policy_changed",
      title: `${c.name} data facts changed`,
      detail: c.detail,
    }));
    if (rows.length) {
      await admin.from("tool_alerts").insert(rows);
      alertsCreated += rows.length;
    }
  }

  // Upsert all snapshots in one call. First run just establishes the baseline
  // (prior is empty, so nothing is flagged as changed).
  await admin.from("tool_fact_snapshots").upsert(snapshotRows, { onConflict: "tool_slug" });

  return NextResponse.json({ ok: true, tools: TOOLS.length, changed: changed.length, alertsCreated });
}
