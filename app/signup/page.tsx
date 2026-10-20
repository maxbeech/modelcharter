import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, getSession } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";
import { SetupPending } from "@/components/SetupPending";
import { Section } from "@/components/ui";
import { SignalMark } from "@/components/brand";
import { KIT, afterAuthPath, buyIntent } from "@/lib/site";
import { signupAction } from "../auth-actions";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  if (!isDbConfigured()) return <SetupPending what="Accounts" />;
  const { plan } = await searchParams;
  const buy = buyIntent(plan);
  // Already signed in: skip the form and carry on to Checkout if they came to buy.
  if (await getSession()) redirect(afterAuthPath(null, buy));
  return (
    <Section className="max-w-md py-20">
      <div className="rounded-[1.4rem] border border-line bg-white p-8 shadow-sm">
        <SignalMark size={36} />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">{buy ? `Get the ${KIT.name}` : "Create your account"}</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {buy
            ? `Create your account, then pay $${KIT.price} once on the next screen. No subscription.`
            : "Save your policy, keep a tool register and see what changes. Free, no card needed."}
        </p>
        <div className="mt-6"><AuthForm mode="signup" action={signupAction} plan={buy} /></div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-faint">Already have an account? <Link href={buy ? `/login?plan=${buy}` : "/login"} className="font-semibold text-brand-700 hover:underline">Log in</Link></p>
      <p className="mt-3 text-center text-xs text-ink-faint">By creating an account you agree to our <Link href="/terms" className="underline hover:text-ink">Terms</Link> and <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.</p>
    </Section>
  );
}
