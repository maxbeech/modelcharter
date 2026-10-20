import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, getSession } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";
import { SetupPending } from "@/components/SetupPending";
import { Section } from "@/components/ui";
import { SignalMark } from "@/components/brand";
import { afterAuthPath, buyIntent } from "@/lib/site";
import { loginAction } from "../auth-actions";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  if (!isDbConfigured()) return <SetupPending what="Accounts" />;
  const buy = buyIntent((await searchParams).plan);
  if (await getSession()) redirect(afterAuthPath(null, buy));
  return (
    <Section className="max-w-md py-20">
      <div className="rounded-[1.4rem] border border-line bg-white p-8 shadow-sm">
        <SignalMark size={36} />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">{buy ? "Log in and we'll take you straight to checkout." : "Your policy, tool register and staff sign-offs."}</p>
        <div className="mt-6"><AuthForm mode="login" action={loginAction} plan={buy} /></div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-faint">New here? <Link href={buy ? `/signup?plan=${buy}` : "/signup"} className="font-semibold text-brand-700 hover:underline">Create an account</Link></p>
    </Section>
  );
}
