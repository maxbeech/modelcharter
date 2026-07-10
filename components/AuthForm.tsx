"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/auth-actions";

// Email + password form for login/signup. Uses useActionState so server-side
// validation errors render inline without losing the page.
export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (prev: AuthState, fd: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">Work email</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com"
          className="w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
        <input id="password" name="password" type="password" required minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          className="w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-brand-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Just a moment…" : mode === "signup" ? "Create account" : "Log in"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-100">{state.notice}</p>}
    </form>
  );
}
