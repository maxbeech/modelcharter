import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Public attestation lookups: no auth, access is by the unguessable token. Runs
// through the service-role client (server only) so the public sign page can read
// and write a single attestation row by token without an anon RLS policy.

export interface AttestView { orgName: string; version: number | null; contentMd: string | null; acknowledged: boolean }

export async function getAttestation(token: string): Promise<AttestView | null> {
  const admin = createAdminSupabase();
  if (!admin || !token) return null;
  const { data: a } = await admin
    .from("attestations").select("org_id, policy_id, acknowledged_at").eq("token", token).maybeSingle();
  if (!a) return null;
  const { data: o } = await admin.from("orgs").select("name").eq("id", a.org_id).maybeSingle();
  let version: number | null = null;
  let contentMd: string | null = null;
  if (a.policy_id) {
    const { data: p } = await admin.from("policies").select("version, content_md").eq("id", a.policy_id).maybeSingle();
    version = (p?.version as number) ?? null;
    contentMd = (p?.content_md as string) ?? null;
  }
  return { orgName: (o?.name as string) ?? "", version, contentMd, acknowledged: Boolean(a.acknowledged_at) };
}

export async function signAttestation(token: string, name: string, email: string): Promise<boolean> {
  const admin = createAdminSupabase();
  if (!admin || !name.trim() || !email.trim()) return false;
  const { data } = await admin
    .from("attestations")
    .update({ name: name.trim(), email: email.trim().toLowerCase(), acknowledged_at: new Date().toISOString() })
    .eq("token", token).is("acknowledged_at", null).select("id");
  return (data?.length ?? 0) > 0;
}
