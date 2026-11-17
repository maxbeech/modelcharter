import { TOOLS, getTool, toolsByCategory, CATEGORY_LABELS, type Verdict } from "../lib/ai-tools.ts";
import { eq, ok, done } from "./_assert.mts";

ok(TOOLS.length >= 20, `dataset has 20+ tools (has ${TOOLS.length})`);

// Unique slugs.
const slugs = new Set(TOOLS.map((t) => t.slug));
eq(slugs.size, TOOLS.length, "all slugs unique");

const validVerdict = (v: Verdict) => v === null || ["yes", "no", "opt-out", "n/a"].includes(v);
const validCats = Object.keys(CATEGORY_LABELS);

for (const t of TOOLS) {
  ok(!!t.name && !!t.vendor, `${t.slug}: has name + vendor`);
  ok(validCats.includes(t.category), `${t.slug}: valid category (${t.category})`);
  ok(t.homepageUrl.startsWith("http"), `${t.slug}: homepage is a URL`);
  ok(["high", "medium", "verify"].includes(t.confidence), `${t.slug}: valid confidence`);
  // Verdict fields must be valid enum values (or null).
  for (const k of ["trainsOnPersonalData", "trainsOnBusinessData", "soc2", "iso27001", "gdprDpa", "hipaaBaa"] as const) {
    ok(validVerdict(t[k]), `${t.slug}: ${k} is a valid verdict (${t[k]})`);
  }
  // No fabrication: high/medium confidence tools must cite at least one source.
  if (t.confidence !== "verify") ok(t.sources.length > 0, `${t.slug}: ${t.confidence}-confidence tool has a source`);
  // Every source has a real URL.
  for (const s of t.sources) ok(s.url.startsWith("http"), `${t.slug}: source URL valid`);
}

// Grammarly EU residency is answered from the vendor's own FAQ (AWS US East hosting).
// If this fails, the GDPR page would show a stale "Not verified" residency answer.
const grammarly = getTool("grammarly");
ok(!!grammarly, "grammarly profile exists");
eq(grammarly?.dataRegionEu, "no", "grammarly EU residency is 'no' per the vendor FAQ");
ok(
  !!grammarly?.sources.some((s) => s.url.includes("20916119474829") && /US East/.test(s.claim)),
  "grammarly residency claim cites the privacy FAQ and names US East hosting",
);

// getTool + grouping.
ok(!!getTool(TOOLS[0].slug), "getTool finds a known tool");
eq(getTool("does-not-exist"), undefined, "getTool returns undefined for unknown");
const grouped = toolsByCategory();
const groupedCount = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
eq(groupedCount, TOOLS.length, "grouping preserves all tools");

done("tools");
