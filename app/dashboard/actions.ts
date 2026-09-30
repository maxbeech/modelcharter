"use server";

import { revalidatePath } from "next/cache";
import { ensureOrg, setToolStatus, savePolicy, createAttestationLink } from "@/lib/workspace";
import { markAlertsRead, setTracked } from "@/lib/alerts";
import type { ActionResult } from "@/lib/analytics-events";

// All actions re-derive the org server-side (never trust a client-supplied id),
// and the workspace helpers verify org membership on every query. Each action
// revalidates the relevant dashboard route. The ones behind a journey event
// return an ActionResult so the browser can send the success or failure event.

export async function actionSetToolStatus(formData: FormData): Promise<ActionResult> {
  const org = await ensureOrg();
  if (!org) return { ok: false, reason: "no_workspace" };
  const ok = await setToolStatus(org.id, String(formData.get("slug")), String(formData.get("name")), String(formData.get("status")));
  revalidatePath("/dashboard/tools");
  return ok ? { ok } : { ok, reason: "save_failed" };
}

export async function actionSavePolicy(formData: FormData): Promise<ActionResult> {
  const org = await ensureOrg();
  if (!org) return { ok: false, reason: "no_workspace" };
  const md = String(formData.get("content_md") ?? "");
  let input: unknown = null;
  try { input = JSON.parse(String(formData.get("input_json") ?? "null")); } catch { input = null; }
  if (!md.trim()) return { ok: false, reason: "empty_policy" };
  const version = await savePolicy(org.id, md, input);
  revalidatePath("/dashboard/policy");
  return version === null ? { ok: false, reason: "save_failed" } : { ok: true, version };
}

export async function actionCreateAttestation(): Promise<ActionResult> {
  const org = await ensureOrg();
  if (!org) return { ok: false, reason: "no_workspace" };
  const token = await createAttestationLink(org.id);
  revalidatePath("/dashboard/attestations");
  return token ? { ok: true } : { ok: false, reason: "not_created" };
}

export async function actionSetTracked(formData: FormData) {
  const org = await ensureOrg();
  if (!org) return;
  await setTracked(org.id, String(formData.get("slug")), String(formData.get("on")) === "1");
  revalidatePath("/dashboard/tools");
}

export async function actionMarkAlertsRead() {
  const org = await ensureOrg();
  if (!org) return;
  await markAlertsRead(org.id);
  revalidatePath("/dashboard");
}
