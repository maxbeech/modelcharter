"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signup, login, destroySession } from "@/lib/auth";
import type { AnalyticsIdentity } from "@/lib/analytics-events";

export interface AuthState { error?: string; notice?: string; reason?: string; analytics?: AnalyticsIdentity }

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await signup(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (res.notice) return { notice: res.notice, analytics: res.analytics };
  if (!res.ok) return { error: res.error, reason: res.reason };
  revalidatePath("/", "layout");
  // `joined` tells the dashboard to send `sign_up` once, then drop the param.
  redirect("/dashboard?joined=sign_up");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (!res.ok) return { error: res.error, reason: res.reason };
  revalidatePath("/", "layout");
  redirect("/dashboard?joined=login");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
