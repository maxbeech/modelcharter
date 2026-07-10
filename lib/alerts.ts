// Team-facing reads/writes for tracked tools and change alerts. RLS scopes every
// row to the caller's org. Alert rows are written by the cron (service role);
// teams only read and dismiss them.

import { createServerSupabase } from "@/lib/supabase/server";

export interface AlertRow {
  id: string;
  tool_slug: string;
  kind: string;
  title: string;
  detail: string | null;
  read: boolean;
  created_at: string;
}

export async function getUnreadAlertCount(orgId: string): Promise<number> {
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from("tool_alerts").select("id", { count: "exact", head: true }).eq("org_id", orgId).eq("read", false);
  return count ?? 0;
}

export async function getAlerts(orgId: string, limit = 25): Promise<AlertRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("tool_alerts").select("id, tool_slug, kind, title, detail, read, created_at")
    .eq("org_id", orgId).order("created_at", { ascending: false }).limit(limit);
  return (data as AlertRow[]) ?? [];
}

export async function markAlertsRead(orgId: string): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.from("tool_alerts").update({ read: true }).eq("org_id", orgId).eq("read", false);
}

export async function getTrackedSlugs(orgId: string): Promise<string[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("tracked_tools").select("tool_slug").eq("org_id", orgId);
  return (data ?? []).map((r) => r.tool_slug as string);
}

export async function setTracked(orgId: string, slug: string, on: boolean): Promise<void> {
  const supabase = await createServerSupabase();
  if (on) {
    await supabase.from("tracked_tools").upsert({ org_id: orgId, tool_slug: slug }, { onConflict: "org_id,tool_slug", ignoreDuplicates: true });
  } else {
    await supabase.from("tracked_tools").delete().eq("org_id", orgId).eq("tool_slug", slug);
  }
}
