import Link from "next/link";
import { ensureOrg, getRegister, getPolicies, getAttestations } from "@/lib/workspace";
import { getAlerts } from "@/lib/alerts";
import { actionMarkAlertsRead } from "./actions";

export default async function DashboardHome() {
  const org = await ensureOrg();
  if (!org) return null;
  const [register, policies, attestations, alerts] = await Promise.all([
    getRegister(org.id), getPolicies(org.id), getAttestations(org.id), getAlerts(org.id, 8),
  ]);
  const approved = register.filter((r) => r.status === "approved").length;
  const review = register.filter((r) => r.status === "review").length;
  const signed = attestations.filter((a) => a.acknowledged_at).length;
  const unread = alerts.filter((a) => !a.read).length;

  const stats = [
    { label: "Tools approved", value: String(approved), sub: `${review} awaiting review`, href: "/dashboard/tools" },
    { label: "Policy version", value: policies[0] ? `v${policies[0].version}` : "None", sub: policies.length ? `updated ${policies[0].created_at.slice(0, 10)}` : "not created yet", href: "/dashboard/policy" },
    { label: "Attestations signed", value: String(signed), sub: `${attestations.length} sent`, href: "/dashboard/attestations" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Change alerts{unread > 0 && <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">{unread} new</span>}
          </h2>
          {unread > 0 && (
            <form action={actionMarkAlertsRead}>
              <button type="submit" className="text-sm font-medium text-brand-700 hover:text-brand-900">Mark all read</button>
            </form>
          )}
        </div>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No alerts yet. Watch a tool on your <Link href="/dashboard/tools" className="text-brand-700 hover:underline">tool register</Link> to be told when a vendor changes how it handles your data.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {alerts.map((a) => (
              <li key={a.id} className={`rounded-xl border px-4 py-3 text-sm ${a.read ? "border-line bg-white" : "border-brand-200 bg-brand-50/60"}`}>
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/tools/${a.tool_slug}`} className="font-semibold text-ink hover:text-brand-700">{a.title}</Link>
                  <time className="flex-none text-xs text-ink-faint">{a.created_at.slice(0, 10)}</time>
                </div>
                {a.detail && <p className="mt-1 text-ink-soft">{a.detail}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Get set up in three steps</h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-soft">
          <li className="flex gap-3"><Step n={1} /><span><Link href="/dashboard/tools" className="font-semibold text-brand-700 hover:text-brand-900">Triage your tool register</Link>: mark which AI tools are approved, restricted or prohibited.</span></li>
          <li className="flex gap-3"><Step n={2} /><span><Link href="/dashboard/policy" className="font-semibold text-brand-700 hover:text-brand-900">Publish your AI usage policy</Link>: generate it and save a version.</span></li>
          <li className="flex gap-3"><Step n={3} /><span><Link href="/dashboard/attestations" className="font-semibold text-brand-700 hover:text-brand-900">Collect attestations</Link>: share a link so staff acknowledge the policy.</span></li>
        </ol>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{n}</span>;
}
