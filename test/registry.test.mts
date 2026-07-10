import { TOOLS, getTool } from "../lib/ai-tools.ts";
import { allQuestions, getQuestion, QUESTION_SLUGS } from "../lib/registry-questions.ts";
import { HUBS, HUB_BY_SLUG, USE_CASES } from "../lib/registry-frameworks.ts";
import { assessRisk } from "../lib/risk-assessment.ts";
import { parsePair, popularComparePairs, PAIR_DELIMITER } from "../lib/compare.ts";
import { toCsv } from "../lib/csv.ts";
import { eq, ok, done } from "./_assert.mts";

// --- registry questions ---
eq(allQuestions().length, 5, "five registry questions");
eq(QUESTION_SLUGS.length, 5, "five question slugs");
ok(!!getQuestion("hipaa") && !getQuestion("nope"), "getQuestion resolves known/unknown");

const chatgpt = getTool("chatgpt");
if (chatgpt) {
  const hipaa = getQuestion("hipaa")!;
  ok(hipaa.ask(chatgpt.name).startsWith("Is ChatGPT"), "hipaa question phrases the tool name");
  ok(hipaa.answer(chatgpt).includes("ChatGPT") || hipaa.answer(chatgpt).includes("OpenAI"), "hipaa answer references the tool/vendor");
  // passes() mirrors the underlying fact
  eq(hipaa.passes(chatgpt), chatgpt.hipaaBaa === null ? null : chatgpt.hipaaBaa === "yes", "hipaa passes() matches fact");
}

// Every question, every tool: answer is a non-empty string with no em dash.
for (const t of TOOLS) {
  for (const q of allQuestions()) {
    const a = q.answer(t);
    ok(a.length > 0, `${t.slug}/${q.slug}: answer non-empty`);
    ok(!a.includes("—") && !a.includes("–"), `${t.slug}/${q.slug}: answer has no em/en dash`);
    ok([true, false, null].includes(q.passes(t)), `${t.slug}/${q.slug}: passes() is tri-state`);
  }
}

// --- compliance hubs ---
eq(HUBS.length, 5, "five compliance hubs");
for (const h of HUBS) {
  ok(HUB_BY_SLUG[h.slug] === h, `hub ${h.slug} indexed`);
  const n = TOOLS.filter(h.match).length;
  ok(n >= 0 && n <= TOOLS.length, `hub ${h.slug} count in range (${n})`);
  ok(!h.blurb.includes("—"), `hub ${h.slug} blurb has no em dash`);
}
// no-training hub only includes tools that explicitly do not train
const noTrain = HUBS.find((h) => h.slug === "no-training")!;
ok(TOOLS.filter(noTrain.match).every((t) => t.trainsOnPersonalData === "no"), "no-training hub only lists non-training tools");
ok(USE_CASES.length >= 3, "use cases present");

// --- compare ---
const pairs = popularComparePairs();
ok(pairs.length > 0, "popular compare pairs generated");
ok(pairs.every((p) => p.includes(PAIR_DELIMITER)), "pairs use the delimiter");
eq(parsePair("chatgpt-vs-claude"), ["chatgpt", "claude"], "parsePair splits a valid pair");
eq(parsePair("chatgpt"), null, "parsePair rejects a non-pair");
eq(parsePair("x-vs-x".replace(/x/g, "same")), null, "parsePair rejects identical halves");

// --- risk assessment ---
// A tool that will not sign a BAA must be rejected for PHI.
const noBaa = TOOLS.find((t) => t.hipaaBaa === "no");
if (noBaa) eq(assessRisk(noBaa, ["phi"]).verdict, "reject", "PHI + no BAA => reject");
// Trains-by-default tool must reject sensitive data.
const trains = TOOLS.find((t) => t.trainsOnPersonalData === "yes");
if (trains) eq(assessRisk(trains, ["confidential"]).verdict, "reject", "sensitive + trains => reject");
// Public-only data on a rated safe tool is approve.
const safe = TOOLS.find((t) => t.trainsOnPersonalData === "no" && t.soc2 === "yes" && t.hipaaBaa === "yes");
if (safe) ok(["approve", "conditional"].includes(assessRisk(safe, ["public"]).verdict), "public-only on a safe tool is not rejected");
// Reasons never contain an em dash.
for (const t of TOOLS.slice(0, 10)) {
  for (const r of assessRisk(t, ["pii", "phi"]).reasons) ok(!r.text.includes("—"), `${t.slug}: reason has no em dash`);
}

// --- csv ---
eq(toCsv(["a", "b"], [[1, "x,y"]]), 'a,b\r\n1,"x,y"', "csv quotes a comma field");
eq(toCsv(["a"], [['he said "hi"']]), 'a\r\n"he said ""hi"""', "csv escapes quotes");

done("registry");
