// Helpers for /compare/[pair] ("chatgpt-vs-claude"). Crossing every tool would
// be C(n,2) pages, most never searched, so we pre-render the cross of the most
// searched tools and let any other valid pair render on demand.
import { TOOLS } from "./ai-tools";

const POPULAR_POOL = [
  "chatgpt",
  "claude",
  "google-gemini",
  "microsoft-365-copilot",
  "github-copilot",
  "perplexity",
  "notion-ai",
  "grammarly",
  "cursor",
];

export const PAIR_DELIMITER = "-vs-";

export function popularComparePairs(): string[] {
  const known = new Set(TOOLS.map((t) => t.slug));
  const pool = POPULAR_POOL.filter((s) => known.has(s));
  const pairs: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) pairs.push(`${pool[i]}${PAIR_DELIMITER}${pool[j]}`);
  }
  return pairs;
}

export function parsePair(pair: string): [string, string] | null {
  const idx = pair.indexOf(PAIR_DELIMITER);
  if (idx <= 0) return null;
  const a = pair.slice(0, idx);
  const b = pair.slice(idx + PAIR_DELIMITER.length);
  if (!a || !b || a === b) return null;
  return [a, b];
}
