// Server-side data access for the team workspace (Supabase). Tenant scoping is
// enforced by Row Level Security: every query runs as the signed-in user, and
// the policies restrict rows to the orgs they belong to. The org id is still
// derived server-side (never trusted from the client).

import { createServerSupabase } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { TOOLS } from "@/lib/ai-tools";

export interface Org { id: string; name: string; plan: string; stripe_customer_id: string | null }
export interface RegisterRow { id: string; tool_slug: string; name: string; status: string; notes: string | null }
export interface PolicyRow { id: string; version: number; content_md: string; created_at: string }
export interface AttestationRow { id: string; token: string; name: string | null; email: string | null; acknowledged_at: string | null; created_at: string }

const REGISTER_STATUSES = ["approved", "restricted", "review", "prohibited"];

type SB = Awaited<ReturnType<typeof createServerSupabase>>;

async function fetchOrg(supabase: SB, userId: string): Promise<Org | null> {
  const { data: m } = await supabase
    .from("org_members").select("org_id").eq("user_id", userId).order("created_at", { ascending: true }).limit(1);
  if (!m?.length) return null;
  const { data: o } = await supabase
    .from("orgs").select("id, name, plan, stripe_customer_id").eq("id", m[0].org_id).single();
  return (o as Org) ?? null;
}

async function seedRegister(supabase: SB, orgId: string): Promise<void> {
  const { count } = await supabase.from("tool_register").select("id", { count: "exact", head: true }).eq("org_id", orgId);
  if (count && count > 0) return;
  const rows = TOOLS.map((t) => ({ org_id: orgId, tool_slug: t.slug, name: t.name, status: "review" }));
  await supabase.from("tool_register").upsert(rows, { onConflict: "org_id,tool_slug", ignoreDuplicates: true });
}

// Resolve the signed-in user's org. The handle_new_user trigger creates it on
// signup; this also creates one as a fallback, then seeds the register (once)
// with the directory tools at status "review".
export async function ensureOrg(): Promise<Org | null> {
  const user = await getSession();
  if (!user) return null;
  const supabase = await createServerSupabase();

  let org = await fetchOrg(supabase, user.id);
  if (!org) {
    const derived = (user.email.split("@")[1] ?? "My team").replace(/\..*/, "") || "My team";
    const name = derived.charAt(0).toUpperCase() + derived.slice(1);
    const { data: created } = await supabase
      .from("orgs").insert({ name, created_by: user.id }).select("id, name, plan, stripe_customer_id").single();
    if (created) {
      await supabase.from("org_members").insert({ org_id: created.id, user_id: user.id, role: "owner" });
      org = created as Org;
    }
  }
  if (org) await seedRegister(supabase, org.id);
  return org;
}

export async function getRegister(orgId: string): Promise<RegisterRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("tool_register").select("id, tool_slug, name, status, notes").eq("org_id", orgId).order("name");
  return (data as RegisterRow[]) ?? [];
}

export async function setToolStatus(orgId: string, slug: string, name: string, status: string): Promise<void> {
  if (!REGISTER_STATUSES.includes(status)) return;
  const supabase = await createServerSupabase();
  await supabase.from("tool_register").upsert(
    { org_id: orgId, tool_slug: slug, name, status, updated_at: new Date().toISOString() },
    { onConflict: "org_id,tool_slug" },
  );
}

export async function getPolicies(orgId: string): Promise<PolicyRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("policies").select("id, version, content_md, created_at").eq("org_id", orgId).order("version", { ascending: false });
  return (data as PolicyRow[]) ?? [];
}

export async function savePolicy(orgId: string, contentMd: string, inputJson: unknown): Promise<void> {
  const supabase = await createServerSupabase();
  const { data: latest } = await supabase
    .from("policies").select("version").eq("org_id", orgId).order("version", { ascending: false }).limit(1);
  const version = ((latest?.[0]?.version as number) ?? 0) + 1;
  await supabase.from("policies").insert({ org_id: orgId, version, content_md: contentMd, input_json: inputJson ?? null });
}

export async function getAttestations(orgId: string): Promise<AttestationRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("attestations").select("id, token, name, email, acknowledged_at, created_at").eq("org_id", orgId).order("created_at", { ascending: false });
  return (data as AttestationRow[]) ?? [];
}

export async function createAttestationLink(orgId: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data: pol } = await supabase
    .from("policies").select("id").eq("org_id", orgId).order("version", { ascending: false }).limit(1);
  if (!pol?.length) return null;
  const { data } = await supabase
    .from("attestations").insert({ org_id: orgId, policy_id: pol[0].id }).select("token").single();
  return (data?.token as string) ?? null;
}
