import { NextResponse } from "next/server";
import { TOOLS } from "@/lib/ai-tools";
import { factSignature, diffFactSignatures, describeFactChanges } from "@/lib/fact-signature";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { captureServerError } from "@/lib/observability";
import { checkCronAuth } from "@/lib/cron-auth";

// Daily cron: snapshot every tool's watched facts, diff against the last
// snapshot, and raise a change alert for any team tracking a tool whose facts
// moved. Fail-closed: refuses to run unless CRON_SECRET is set and matches, so
// the endpoint can never be triggered anonymously. The Helm7 cron service sends
// Authorization: Bearer <CRON_SECRET> on scheduled invocations.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = checkCronAuth(request.headers.get("authorization"), process.env.CRON_SECRET);
  if (auth === "unconfigured") return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  if (auth === "unauthorized") return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  const admin = createAdminSupabase();
  if (!admin) return NextResponse.json({ ok: false, reason: "no service role key" }, { status: 503 });

  const { data: snaps, error: snapsError } = await admin.from("tool_fact_snapshots").select("tool_slug, signature");
  if (snapsError) {
    captureServerError(snapsError, { scope: "cron-sync-alerts", stage: "read_snapshots", code: snapsError.code });
    return NextResponse.json({ ok: false, reason: "snapshot_read_failed" }, { status: 500 });
  }
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
    const { data: tracked, error: trackedError } = await admin.from("tracked_tools").select("org_id").eq("tool_slug", c.slug);
    if (trackedError) captureServerError(trackedError, { scope: "cron-sync-alerts", stage: "read_tracked", toolSlug: c.slug, code: trackedError.code });
    const rows = (tracked ?? []).map((t) => ({
      org_id: t.org_id as string,
      tool_slug: c.slug,
      kind: "policy_changed",
      title: `${c.name} data facts changed`,
      detail: c.detail,
    }));
    if (rows.length) {
      const { error: insertError } = await admin.from("tool_alerts").insert(rows);
      if (insertError) captureServerError(insertError, { scope: "cron-sync-alerts", stage: "insert_alerts", toolSlug: c.slug, count: rows.length, code: insertError.code });
      else alertsCreated += rows.length;
    }
  }

  // Upsert all snapshots in one call. First run just establishes the baseline
  // (prior is empty, so nothing is flagged as changed).
  const { error: upsertError } = await admin.from("tool_fact_snapshots").upsert(snapshotRows, { onConflict: "tool_slug" });
  if (upsertError) {
    captureServerError(upsertError, { scope: "cron-sync-alerts", stage: "write_snapshots", count: snapshotRows.length, code: upsertError.code });
    return NextResponse.json({ ok: false, reason: "snapshot_write_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tools: TOOLS.length, changed: changed.length, alertsCreated });
}
