"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signup, login, destroySession } from "@/lib/auth";

export interface AuthState { error?: string; notice?: string }

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await signup(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (res.notice) return { notice: res.notice };
  if (!res.ok) return { error: res.error };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const res = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (!res.ok) return { error: res.error };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
