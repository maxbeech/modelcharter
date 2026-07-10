"use server";

import { revalidatePath } from "next/cache";
import { ensureOrg, setToolStatus, savePolicy, createAttestationLink } from "@/lib/workspace";
import { markAlertsRead, setTracked } from "@/lib/alerts";

// All actions re-derive the org server-side (never trust a client-supplied id),
// and the workspace helpers verify org membership on every query. Each action
// revalidates the relevant dashboard route.

export async function actionSetToolStatus(formData: FormData) {
  const org = await ensureOrg();
  if (!org) return;
  await setToolStatus(org.id, String(formData.get("slug")), String(formData.get("name")), String(formData.get("status")));
  revalidatePath("/dashboard/tools");
}

export async function actionSavePolicy(formData: FormData) {
  const org = await ensureOrg();
  if (!org) return;
  const md = String(formData.get("content_md") ?? "");
  let input: unknown = null;
  try { input = JSON.parse(String(formData.get("input_json") ?? "null")); } catch { input = null; }
  if (md.trim()) await savePolicy(org.id, md, input);
  revalidatePath("/dashboard/policy");
}

export async function actionCreateAttestation() {
  const org = await ensureOrg();
  if (!org) return;
  await createAttestationLink(org.id);
  revalidatePath("/dashboard/attestations");
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
