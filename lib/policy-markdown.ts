// Turns the Markdown that policyToMarkdown() writes back into blocks for the
// pages people read (the sign-off page and the evidence pack). Deliberately
// small: it understands only what the generator emits (#, ##, _italic_ lines,
// "- " bullets, ---), and anything else is shown as a plain paragraph, so a
// hand-edited policy still renders as readable text rather than markup.

export type PolicyBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "note"; text: string }
  | { kind: "para"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "rule" };

export function parsePolicyMarkdown(md: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { blocks.push({ kind: "list", items: list }); list = null; } };

  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("- ")) { (list ??= []).push(line.slice(2).trim()); continue; }
    flush();
    if (line === "---") blocks.push({ kind: "rule" });
    else if (line.startsWith("## ")) blocks.push({ kind: "heading", text: line.slice(3).trim() });
    else if (line.startsWith("# ")) blocks.push({ kind: "title", text: line.slice(2).trim() });
    else if (/^_.+_$/.test(line)) blocks.push({ kind: "note", text: line.slice(1, -1).trim() });
    else blocks.push({ kind: "para", text: line });
  }
  flush();
  return blocks;
}
