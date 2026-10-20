import { ensureOrg, getPolicies, getRegister, getLatestPolicyInput } from "@/lib/workspace";
import { TOOLS } from "@/lib/ai-tools";
import { PolicyGenerator } from "@/components/PolicyGenerator";
import { actionSavePolicy } from "../actions";

import { isPresetId, savedAnswers } from "@/lib/policy";

export default async function PolicyPage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset } = await searchParams;
  const org = await ensureOrg();
  if (!org) return null;
  const [policies, register, latestInput] = await Promise.all([getPolicies(org.id), getRegister(org.id), getLatestPolicyInput(org.id)]);
  // Reopen the last saved answers; the practice name defaults to the workspace name.
  const initial = savedAnswers(latestInput);
  const approved = register.filter((r) => r.status === "approved").map((r) => r.name);
  const prohibited = register.filter((r) => r.status === "prohibited").map((r) => r.name);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Company AI usage policy</h2>
        <p className="mt-1 text-sm text-ink-soft">Approved and prohibited tools come from your <a href="/dashboard/tools" className="font-medium text-brand-700 hover:underline">tool register</a>. Each save is kept as a fixed version for your records and sign-off links.</p>
      </div>

      {policies.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-sm font-semibold text-ink">Saved versions</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {policies.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
                <span className="font-medium text-ink">Version {p.version}</span>
                <span className="text-ink-faint">{p.created_at.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PolicyGenerator today={today} toolNames={TOOLS.map((t) => t.name)} baaToolNames={TOOLS.filter((t) => t.hipaaBaa === "yes").map((t) => t.name)} saveAction={actionSavePolicy} preset={isPresetId(preset) ? preset : null}
        initial={initial} defaultCompanyName={org.name} approvedFromRegister={approved} prohibitedFromRegister={prohibited} />
    </div>
  );
}
