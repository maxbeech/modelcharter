import { TOOLS, getTool } from "../lib/ai-tools.ts";
import { getQuestion } from "../lib/registry-questions.ts";
import { HUB_BY_SLUG } from "../lib/registry-frameworks.ts";
import { baaTable, baaRow, saferAlternatives, hipaaHubFaqs, hipaaToolFaqs, formatChecked, HIPAA_FEATURED, HEALTHCARE_POLICY_HREF } from "../lib/hipaa-directory.ts";
import { eq, ok, done } from "./_assert.mts";

// The /compliance/hipaa table and the per-tool HIPAA pages are built from
// data/ai-tools.json. These checks keep the table honest: every tool once,
// unknown never shown as a pass, and the rechecked tools fully sourced.

const rows = baaTable();
const today = new Date().toISOString().slice(0, 10);

// --- table shape ---
eq(rows.length, TOOLS.length, "hub table has one row per directory tool");
eq(new Set(rows.map((r) => r.slug)).size, TOOLS.length, "no tool appears twice");
eq(rows.slice(0, HIPAA_FEATURED.length).map((r) => r.slug), [...HIPAA_FEATURED], "featured tools lead the table in search-volume order");
const tail = rows.slice(HIPAA_FEATURED.length);
const order = { yes: 0, unknown: 1, no: 2 } as const;
ok(tail.every((r, i) => i === 0 || order[tail[i - 1].tone] <= order[r.tone]), "remaining rows run BAA, then unverified, then no");

// --- every row mirrors its fact ---
for (const r of rows) {
  const t = getTool(r.slug)!;
  const expected = t.hipaaBaa === "yes" ? "yes" : t.hipaaBaa == null ? "unknown" : "no";
  eq(r.tone, expected, `${r.slug}: row tone matches hipaa_baa (${t.hipaaBaa})`);
  ok(r.tone !== "yes" || r.answer !== "Unverified", `${r.slug}: a BAA row is never labelled Unverified`);
  ok(r.tone === "yes" || !/^(yes|only)/i.test(r.answer), `${r.slug}: a row without a confirmed BAA never reads as a pass (${r.answer})`);
  ok(/^\d{4}-\d{2}-\d{2}$/.test(r.checked) && r.checked <= today, `${r.slug}: checked date is an ISO date not in the future (${r.checked})`);
  ok(!r.sourceUrl || r.sourceUrl.startsWith("https://"), `${r.slug}: source is an https URL`);
  ok(r.plans.length > 0, `${r.slug}: plan column is never blank`);
  for (const text of [r.answer, r.plans, r.excludes ?? "", r.note ?? ""]) ok(!/[—–]/.test(text), `${r.slug}: row copy has no em or en dash`);
}

// --- the seven rechecked tools carry a dated, sourced BAA fact ---
for (const slug of HIPAA_FEATURED) {
  const t = getTool(slug);
  ok(!!t, `${slug}: is in the directory`);
  if (!t) continue;
  ok(!!t.baaSource && t.baaSource.startsWith("https://"), `${slug}: has a BAA source URL`);
  ok(!!t.baaVerified, `${slug}: has a BAA verified date`);
  ok(t.sources.some((s) => s.url === t.baaSource), `${slug}: BAA source is also listed in sources`);
  ok(baaRow(t).rechecked, `${slug}: row is marked as rechecked`);
  if (t.hipaaBaa === "yes") ok(!!t.baaPlans, `${slug}: a confirmed BAA names the plans it covers`);
  else ok(!!t.baaNote, `${slug}: an unverified BAA explains why`);
}

// Spot checks against what the vendors say (rechecked 2026-10-20).
const chatgpt = baaRow(getTool("chatgpt")!);
eq(chatgpt.tone, "yes", "ChatGPT: OpenAI offers a BAA on some products");
ok(/Enterprise/.test(chatgpt.plans) && /API/.test(chatgpt.plans), "ChatGPT: plans name Enterprise and the API");
ok(/Business/.test(chatgpt.excludes ?? ""), "ChatGPT: Business is listed as having no BAA");
eq(baaRow(getTool("notion-ai")!).tone, "unknown", "Notion AI: BAA coverage for AI features is unverified, not a pass");
ok(!TOOLS.filter(HUB_BY_SLUG.hipaa.match).some((t) => t.slug === "notion-ai"), "Notion AI is not counted on the HIPAA hub");

// --- answers ---
const q = getQuestion("hipaa")!;
const chatgptAnswer = q.answer(getTool("chatgpt")!);
ok(chatgptAnswer.startsWith("Only on the right plan."), "ChatGPT answer leads with the direct answer");
ok(chatgptAnswer.includes("ChatGPT Business"), "ChatGPT answer names the plan without a BAA");
ok(q.answer(getTool("notion-ai")!).startsWith("Not verified."), "Notion AI answer says not verified");

// --- safer alternatives ---
for (const t of TOOLS) {
  const alts = saferAlternatives(t);
  ok(alts.every((x) => x.hipaaBaa === "yes" && x.slug !== t.slug), `${t.slug}: alternatives all offer a BAA and exclude the tool`);
  ok(alts.length <= 4, `${t.slug}: at most four alternatives`);
}
const meetingAlt = saferAlternatives(getTool("otter-ai")!)[0];
eq(meetingAlt?.category, "meetings", "alternatives prefer the same category first");

// --- FAQs (hub + tool pages feed FAQPage structured data) ---
const hubFaqs = hipaaHubFaqs();
ok(hubFaqs.length >= 6, "hub has a substantive FAQ");
ok(hubFaqs.some((f) => f.q === "Is ChatGPT HIPAA compliant?" && f.a === chatgptAnswer), "hub FAQ reuses the tool-page answer");
for (const slug of HIPAA_FEATURED) {
  const faqs = hipaaToolFaqs(getTool(slug)!);
  ok(faqs.length >= 3, `${slug}: HIPAA page has at least three FAQs`);
  eq(faqs[0].a, q.answer(getTool(slug)!), `${slug}: first FAQ is the direct answer`);
}
for (const f of [...hubFaqs, ...TOOLS.flatMap((t) => hipaaToolFaqs(t))]) {
  ok(!/[—–]/.test(f.q + f.a), `FAQ has no em or en dash: ${f.q}`);
}

// --- hub metadata and CTAs ---
const hub = HUB_BY_SLUG.hipaa;
ok(!!hub.metaDescription && hub.metaDescription.length <= 155, "hub meta description fits a search snippet");
ok(!!hub.keywords?.includes("hipaa compliant ai"), "hub targets the head term");
eq(HEALTHCARE_POLICY_HREF, "/ai-usage-policy-generator?preset=healthcare", "policy CTA uses the healthcare preset");
eq(formatChecked("2026-10-20"), "Oct 20, 2026", "dates render in US format");

done("hipaa hub");
