"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AiTool } from "@/lib/ai-tools";
import { assessRisk, DATA_TYPES, type DataType } from "@/lib/risk-assessment";
import { toCsv } from "@/lib/csv";

// Free AI vendor risk assessment: pick a tool and the data you'd put into it,
// get an explainable approve / conditional / reject verdict you can export.

const VERDICT_STYLE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  conditional: "bg-amber-100 text-amber-800 ring-amber-200",
  review: "bg-slate-100 text-slate-700 ring-slate-200",
  reject: "bg-red-100 text-red-800 ring-red-200",
};
const LEVEL_MARK: Record<string, string> = { ok: "text-emerald-600", warn: "text-amber-600", block: "text-red-600" };

export function RiskAssessment({ tools }: { tools: AiTool[] }) {
  const sorted = useMemo(() => [...tools].sort((a, b) => a.name.localeCompare(b.name)), [tools]);
  const [slug, setSlug] = useState(sorted[0]?.slug ?? "");
  const [types, setTypes] = useState<DataType[]>(["pii"]);

  const tool = sorted.find((t) => t.slug === slug) ?? sorted[0];
  const result = tool ? assessRisk(tool, types) : null;

  const toggle = (t: DataType) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  function exportCsv() {
    if (!tool || !result) return;
    const rows: (string | number)[][] = [
      ["Tool", tool.name],
      ["Vendor", tool.vendor],
      ["Data types", types.join("; ")],
      ["Verdict", result.verdict],
      ["Risk score (0-100, lower is safer)", result.score],
      ["Band", result.band],
      ...result.reasons.map((r) => [r.level.toUpperCase(), r.text]),
    ];
    const csv = toCsv(["Field", "Value"], rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risk-assessment-${tool.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-6">
        <div>
          <label htmlFor="tool" className="text-sm font-semibold text-ink">AI tool</label>
          <select id="tool" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink focus-brand">
            {sorted.map((t) => <option key={t.slug} value={t.slug}>{t.name} ({t.vendor})</option>)}
          </select>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">What data would go into it?</p>
          <div className="mt-2 space-y-2">
            {DATA_TYPES.map((d) => (
              <label key={d.id} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm hover:border-brand-300">
                <input type="checkbox" checked={types.includes(d.id)} onChange={() => toggle(d.id)} className="mt-0.5 accent-brand-700" />
                <span><span className="font-medium text-ink">{d.label}</span><span className="block text-xs text-ink-faint">{d.hint}</span></span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {tool && result && (
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${VERDICT_STYLE[result.verdict]}`}>{result.verdict}</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">{result.headline}</h2>
              <p className="mt-0.5 text-sm text-ink-faint">{tool.name} · risk score {result.score}/100 ({result.band})</p>
            </div>
            <button onClick={exportCsv} className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink-faint hover:bg-paper">Export CSV</button>
          </div>
          {types.length === 0 && <p className="mt-4 text-sm text-ink-soft">Select the data types your team would enter to see the verdict.</p>}
          <ul className="mt-5 space-y-2.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className={`mt-0.5 font-bold ${LEVEL_MARK[r.level]}`}>{r.level === "ok" ? "✓" : r.level === "warn" ? "!" : "✕"}</span>
                <span className="text-ink-soft">{r.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-line pt-4 text-sm text-ink-soft">
            See the full <Link href={`/tools/${tool.slug}`} className="text-brand-700 hover:underline">{tool.name} risk profile</Link>, then capture the decision in a <Link href="/ai-usage-policy-generator" className="text-brand-700 hover:underline">free AI usage policy</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
