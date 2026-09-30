"use client";

import { useEffect, useMemo, useState } from "react";
import { generatePolicy, policyToMarkdown, type PolicyInput, type Stance } from "@/lib/policy";
import { analyticsEvents, reportAction, trackEvent, trackFailure, type ActionResult } from "@/lib/analytics-events";

const INDUSTRIES = ["General business", "Software / SaaS", "Healthcare", "Finance", "Legal", "Education", "Marketing / agency", "E-commerce / retail", "Government / public sector", "Non-profit"];
const REGS = ["EU AI Act", "GDPR", "HIPAA", "SOC 2", "ISO 42001"];
const STANCES: { id: Stance; label: string; hint: string }[] = [
  { id: "permissive", label: "Permissive", hint: "Encourage AI, few rules" },
  { id: "balanced", label: "Balanced", hint: "Allowed with guardrails" },
  { id: "strict", label: "Strict", hint: "Only what's approved" },
];

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-line-strong">
      <span><span className="block text-sm font-medium text-ink">{label}</span>{hint && <span className="block text-xs text-ink-faint">{hint}</span>}</span>
      <span className={`relative h-6 w-11 flex-none rounded-full transition-colors ${value ? "bg-brand-600" : "bg-line-strong"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

const chip = (active: boolean) => `rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line text-ink-soft hover:border-ink-faint"}`;
const inputClass = "w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export function PolicyGenerator({ today: todayProp, toolNames, saveAction }: { today: string; toolNames: string[]; saveAction?: (fd: FormData) => Promise<ActionResult> }) {
  // Seed from the server value (no hydration mismatch), then correct to the
  // real current date after mount so a long-cached page still dates correctly.
  const [today, setToday] = useState(todayProp);
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [stance, setStance] = useState<Stance>("balanced");
  const [ownerRole, setOwnerRole] = useState("Head of Operations");
  const [allowCustomerData, setAllowCustomerData] = useState(false);
  const [allowPersonalData, setAllowPersonalData] = useState(false);
  const [allowCodeGen, setAllowCodeGen] = useState(false);
  const [requireDisclosure, setRequireDisclosure] = useState(true);
  const [regulations, setRegulations] = useState<string[]>(["SOC 2"]);
  const [approvedTools, setApprovedTools] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const input: PolicyInput = {
    companyName, industry, stance, ownerRole,
    allowCustomerData, allowPersonalData, allowCodeGen, requireDisclosure,
    regulations, approvedTools, prohibitedTools: [], effectiveDate: today,
  };
  const policy = useMemo(() => generatePolicy(input), [JSON.stringify(input)]);
  const markdown = useMemo(() => policyToMarkdown(policy), [policy]);

  const toggleIn = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${(companyName || "ai-usage").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-ai-usage-policy.md`;
    a.click(); URL.revokeObjectURL(url);
    trackEvent(analyticsEvents.policyExported, { method: "download" });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch (error) {
      trackFailure(analyticsEvents.policyExportFailed, "clipboard_denied", { method: "copy" });
      throw error;
    }
    trackEvent(analyticsEvents.policyExported, { method: "copy" });
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  function print() {
    trackEvent(analyticsEvents.policyExported, { method: "print" });
    window.print();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Form */}
      <form className="space-y-5 print:hidden" onSubmit={(e) => e.preventDefault()}>
        <Field label="Company name">
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." className={inputClass} />
        </Field>
        <Field label="Industry">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="How permissive should the policy be?">
          <div className="grid grid-cols-3 gap-2">
            {STANCES.map((s) => (
              <button key={s.id} type="button" onClick={() => setStance(s.id)} className={`rounded-lg border px-2 py-2 text-center text-xs transition-colors ${stance === s.id ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line text-ink-soft hover:border-ink-faint"}`}>
                <span className="block font-semibold">{s.label}</span><span className="block">{s.hint}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Data rules">
          <div className="space-y-2">
            <Toggle label="Allow customer / confidential data in approved tools" value={allowCustomerData} onChange={setAllowCustomerData} />
            <Toggle label="Allow personal data (PII) in approved tools" value={allowPersonalData} onChange={setAllowPersonalData} />
            <Toggle label="AI-assisted coding is in scope" value={allowCodeGen} onChange={setAllowCodeGen} />
            <Toggle label="Require disclosure of AI-generated content" value={requireDisclosure} onChange={setRequireDisclosure} />
          </div>
        </Field>
        <Field label="Which rules apply to you?">
          <div className="flex flex-wrap gap-2">
            {REGS.map((r) => (
              <button key={r} type="button" onClick={() => toggleIn(regulations, setRegulations, r)} className={chip(regulations.includes(r))}>{r}</button>
            ))}
          </div>
        </Field>
        <Field label="Who owns the policy?">
          <input value={ownerRole} onChange={(e) => setOwnerRole(e.target.value)} className={inputClass} />
        </Field>
        <Field label={`Approved tools (optional, ${approvedTools.length} selected)`}>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-line p-2">
            {toolNames.map((t) => (
              <button key={t} type="button" onClick={() => toggleIn(approvedTools, setApprovedTools, t)} className={chip(approvedTools.includes(t))}>{t}</button>
            ))}
          </div>
        </Field>
      </form>

      {/* Live policy */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <span className="text-sm text-ink-faint">Live preview, updates as you type</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={copy} className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink-faint hover:bg-paper">{copied ? "Copied!" : "Copy Markdown"}</button>
            <button onClick={download} className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink-faint hover:bg-paper">Download .md</button>
            <button onClick={print} className="rounded-full bg-brand-700 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">Save as PDF</button>
            {saveAction && (
              <form action={(fd) => reportAction(
                () => saveAction(fd),
                { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed },
                (r) => ({ version: r.version }),
              ).then(() => undefined)}>
                <input type="hidden" name="content_md" value={markdown} />
                <input type="hidden" name="input_json" value={JSON.stringify(input)} />
                <button type="submit" className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">Save version to workspace</button>
              </form>
            )}
          </div>
        </div>
        <article className="policy-doc rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">{policy.title}</h2>
          {policy.intro.map((p, i) => <p key={i} className="mt-1 text-sm italic text-ink-faint">{p}</p>)}
          {policy.sections.map((s) => (
            <section key={s.heading} className="mt-5">
              <h3 className="font-display text-base font-semibold text-ink">{s.heading}</h3>
              {s.body.map((b, i) => Array.isArray(b)
                ? <ul key={i} className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-soft">{b.map((li, j) => <li key={j}>{li}</li>)}</ul>
                : <p key={i} className="mt-1.5 text-sm leading-relaxed text-ink-soft">{b}</p>)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>{children}</div>;
}
