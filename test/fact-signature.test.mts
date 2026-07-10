import { TOOLS } from "../lib/ai-tools.ts";
import { factSignature, diffFactSignatures, describeFactChanges, WATCHED_KEYS } from "../lib/fact-signature.ts";
import { eq, ok, done } from "./_assert.mts";

const t = TOOLS[0];
const sig = factSignature(t);

// Signature carries exactly the watched keys.
eq(Object.keys(sig).sort().join(","), [...WATCHED_KEYS].sort().join(","), "signature has the watched keys");
// Signature values are the tool's own values (or null).
for (const k of WATCHED_KEYS) eq(sig[k], (t as unknown as Record<string, unknown>)[k] ?? null, `signature[${k}] mirrors the tool`);

// Identical signatures diff to nothing.
eq(diffFactSignatures(sig, factSignature(t)).length, 0, "no change => no diff");

// A single flipped fact is detected, and only that one.
const changed = { ...sig, hipaaBaa: sig.hipaaBaa === "yes" ? "no" : "yes" };
const diffs = diffFactSignatures(sig, changed);
eq(diffs.length, 1, "one changed fact => one diff");
eq(diffs[0].key, "hipaaBaa", "diff identifies the changed key");
ok(diffs[0].before !== diffs[0].after, "diff carries before and after");

// A newly-verified fact (null => value) is a change.
const wasNull = { ...sig, soc2: null };
ok(diffFactSignatures(wasNull, sig).some((d) => d.key === "soc2") === (sig.soc2 !== null), "null to value is a change when the value is non-null");

// describeFactChanges is human and dash-free.
const text = describeFactChanges([{ key: "hipaaBaa", label: "HIPAA BAA", before: null, after: "yes" }]);
ok(text.includes("HIPAA BAA"), "description names the fact");
ok(text.includes("not verified to yes"), "description renders null as 'not verified' and uses 'to'");
ok(!text.includes("—") && !text.includes("→"), "description has no em dash or arrow");

done("fact-signature");
