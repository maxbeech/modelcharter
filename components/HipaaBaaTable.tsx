import Link from "next/link";
import type { BaaRow } from "@/lib/hipaa-directory";
import { formatChecked } from "@/lib/hipaa-directory";
import type { BaaTone } from "@/lib/hipaa";

// "Will the vendor sign a BAA?" table, one row per tool, rendered from
// lib/hipaa-directory (which reads data/ai-tools.json). Scrolls sideways
// inside its own box on small screens so the page never does.

const TONE_CLASS: Record<BaaTone, string> = {
  yes: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  no: "bg-red-50 text-red-800 ring-red-200",
  unknown: "bg-amber-50 text-amber-800 ring-amber-200",
};

export function BaaChip({ row }: { row: Pick<BaaRow, "tone" | "answer"> }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE_CLASS[row.tone]}`}>{row.answer}</span>;
}

export function HipaaBaaTable({ rows, caption }: { rows: BaaRow[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tool</th>
            <th scope="col" className="px-4 py-3 font-semibold">Signs a BAA?</th>
            <th scope="col" className="px-4 py-3 font-semibold">Which plan</th>
            <th scope="col" className="px-4 py-3 font-semibold">Source</th>
            <th scope="col" className="px-4 py-3 font-semibold">Checked</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.slug} className="align-top">
              <th scope="row" className="px-4 py-3 font-medium">
                <Link href={`/tools/${r.slug}/hipaa`} className="text-ink hover:text-brand-700">{r.name}</Link>
                <div className="text-xs font-normal text-ink-faint">{r.vendor}</div>
              </th>
              <td className="px-4 py-3"><BaaChip row={r} /></td>
              <td className="px-4 py-3 text-ink-soft">
                {r.plans}
                {r.excludes && <div className="mt-1 text-xs text-red-700">No BAA: {r.excludes}</div>}
              </td>
              <td className="px-4 py-3">
                {r.sourceUrl
                  ? <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-brand-700 hover:underline">{r.vendor.split(/[ ,]/)[0]} page ↗</a>
                  : <span className="text-ink-faint">None found</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-faint">
                <time dateTime={r.checked}>{formatChecked(r.checked)}</time>
                {!r.rechecked && <div className="text-xs">with dataset</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
