import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isDbConfigured, getSession } from "@/lib/auth";
import { ensureOrg } from "@/lib/workspace";
import { SetupPending } from "@/components/SetupPending";
import { Section, Pill } from "@/components/ui";
import { DashTabs } from "@/components/dash-tabs";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { buildAnalyticsIdentity } from "@/lib/analytics-identity";
import { logoutAction } from "../auth-actions";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isDbConfigured()) return <SetupPending what="The dashboard" />;
  const user = await getSession();
  if (!user) redirect("/login");
  const org = await ensureOrg();

  // A one-way ref and the plan; the raw user id never leaves the server.
  const identity = buildAnalyticsIdentity(user.id, org?.plan);

  return (
    <Section className="py-10">
      <Suspense fallback={null}>
        <DashboardAnalytics identity={identity} />
      </Suspense>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-ink">{org?.name ?? "Workspace"}</h1>
            <Pill tone={org?.plan && org.plan !== "free" ? "brand" : "slate"}>{org?.plan ?? "free"} plan</Pill>
          </div>
          <p className="mt-1 text-sm text-ink-faint">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-paper">Log out</button>
        </form>
      </div>
      <DashTabs />
      <div className="py-7">{children}</div>
    </Section>
  );
}
