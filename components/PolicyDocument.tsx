import { parsePolicyMarkdown } from "@/lib/policy-markdown";

// A saved policy, rendered for reading and printing.
export function PolicyDocument({ markdown, className = "" }: { markdown: string; className?: string }) {
  const blocks = parsePolicyMarkdown(markdown);
  return (
    <div className={`text-sm leading-relaxed text-ink-soft ${className}`}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "title": return <h3 key={i} className="font-display text-xl font-semibold text-ink">{b.text}</h3>;
          case "heading": return <h4 key={i} className="mt-5 break-after-avoid font-display text-base font-semibold text-ink">{b.text}</h4>;
          case "note": return <p key={i} className="mt-1 italic text-ink-faint">{b.text}</p>;
          case "list": return <ul key={i} className="mt-1.5 list-disc space-y-1 pl-5">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
          case "rule": return <hr key={i} className="my-5 border-line" />;
          default: return <p key={i} className="mt-1.5">{b.text}</p>;
        }
      })}
    </div>
  );
}
