// The HIPAA AI Kit: BAA status from directory facts, the evidence pack, buy
// intent hand-off and the plan table. Fails print the input and expected value.
import { baaStatus, isPhiRisk } from "../lib/hipaa.ts";
import { buildEvidence } from "../lib/evidence.ts";
import { getTool, TOOLS } from "../lib/ai-tools.ts";
import { KIT, PLANS, PLAN_PRICES, SELLABLE_PLANS, afterAuthPath, buyIntent, isPaidPlan, planLabel } from "../lib/site.ts";
import { eq, ok, done } from "./_assert.mts";

// -- BAA status never upgrades an unknown --------------------------------------
eq(baaStatus(undefined).tone, "unknown", "a tool missing from the directory is unknown");
eq(baaStatus({ name: "X", hipaaBaa: null, enterprisePlan: undefined }).tone, "unknown", "null BAA fact is unknown, not safe");
eq(baaStatus({ name: "X", hipaaBaa: "no", enterprisePlan: undefined }).tone, "no", "no BAA is no");
eq(baaStatus({ name: "X", hipaaBaa: "n/a", enterprisePlan: undefined }).tone, "no", "n/a is treated as no BAA");
const yes = baaStatus({ name: "Acme", hipaaBaa: "yes", enterprisePlan: "Acme Enterprise" });
eq(yes.tone, "yes", "yes BAA is yes");
ok(yes.detail.includes("Acme Enterprise"), "the BAA detail names the plan that carries it");
ok(isPhiRisk("approved", { name: "X", hipaaBaa: null, enterprisePlan: undefined }), "an approved tool with no confirmed BAA is a PHI risk");
ok(!isPhiRisk("prohibited", { name: "X", hipaaBaa: "no", enterprisePlan: undefined }), "a prohibited tool is not a risk");
ok(!isPhiRisk("approved", { name: "X", hipaaBaa: "yes", enterprisePlan: undefined }), "an approved tool with a BAA is not flagged");
// Real data agrees with the helper for every tool.
for (const t of TOOLS) {
  const tone = baaStatus(t).tone;
  ok(t.hipaaBaa === "yes" ? tone === "yes" : t.hipaaBaa == null ? tone === "unknown" : tone === "no", `${t.slug}: BAA chip matches the directory fact (${t.hipaaBaa})`);
}

// -- evidence pack ---------------------------------------------------------------
const chatgpt = getTool("chatgpt");
ok(Boolean(chatgpt), "fixture tool chatgpt exists in the directory");
const ev = buildEvidence({
  orgName: "Riverside Dental",
  generatedAt: "2026-10-20T12:00:00.000Z",
  register: [
    { tool_slug: "chatgpt", name: "ChatGPT", status: "approved" },
    { tool_slug: "no-such-tool", name: "Mystery AI", status: "restricted" },
    { tool_slug: "midjourney", name: "Midjourney", status: "prohibited" },
    { tool_slug: "claude", name: "Claude", status: "review" },
  ],
  policies: [
    { version: 1, content_md: "# old", created_at: "2026-10-01T09:00:00Z" },
    { version: 2, content_md: "# new", created_at: "2026-10-10T09:00:00Z" },
  ],
  attestations: [
    { name: "Dr Patel", email: "p@riverside.test", acknowledged_at: "2026-10-12T10:00:00Z", created_at: "2026-10-11T10:00:00Z" },
    { name: "Sam", email: null, acknowledged_at: null, created_at: "2026-10-11T10:00:00Z" },
  ],
  toolFor: getTool,
});
eq(ev.generatedOn, "2026-10-20", "generated date is the date part");
eq(ev.policy, { version: 2, savedOn: "2026-10-10", contentMd: "# new" }, "the pack uses the latest policy version");
eq(ev.decided.map((t) => t.status), ["approved", "restricted", "prohibited"], "decided tools are ordered approved, restricted, prohibited");
eq(ev.undecidedCount, 1, "tools still in review are counted, not listed");
eq(ev.phiRisks.map((t) => t.name), chatgpt?.hipaaBaa === "yes" ? ["Mystery AI"] : ["ChatGPT", "Mystery AI"], "allowed tools without a confirmed BAA are flagged");
eq(ev.signed, [{ name: "Dr Patel", email: "p@riverside.test", signedOn: "2026-10-12" }], "signed sign-offs carry name and date");
eq(ev.pending, [{ name: "Sam", sentOn: "2026-10-11" }], "pending sign-offs list who still has to sign");
const empty = buildEvidence({ orgName: "X", generatedAt: "2026-10-20T00:00:00Z", register: [], policies: [], attestations: [], toolFor: getTool });
eq(empty.policy, null, "no saved policy is shown as missing, never invented");
eq(empty.decided.length + empty.signed.length + empty.pending.length, 0, "an empty workspace has an empty pack");

// -- buy intent hand-off ---------------------------------------------------------
eq(buyIntent("hipaa_kit"), "hipaa_kit", "the kit is a buy intent");
eq(buyIntent("team"), null, "legacy plans are never sold again");
eq(buyIntent("<script>"), null, "junk is ignored");
eq(afterAuthPath("sign_up", "hipaa_kit"), "/dashboard?joined=sign_up&buy=hipaa_kit", "signup from the buy button continues to checkout");
eq(afterAuthPath("login", ""), "/dashboard?joined=login", "a plain login just lands on the dashboard");
eq(afterAuthPath(null, null), "/dashboard", "no params, no query string");

// -- plans: only what exists is sold ------------------------------------------------
eq(SELLABLE_PLANS, ["hipaa_kit"], "only the kit is on sale");
eq(PLANS.map((p) => p.id), ["free", "hipaa_kit"], "pricing lists Free and the kit");
eq(KIT.price, PLAN_PRICES.hipaa_kit, "the kit price has one source");
ok(isPaidPlan("hipaa_kit") && isPaidPlan("team") && isPaidPlan("business"), "kit and legacy plans unlock paid features");
eq(planLabel("hipaa_kit"), "HIPAA AI Kit", "plan label for the header pill");
eq(planLabel("weird"), "Free", "unknown plans read as Free");
const allCopy = [...PLANS.flatMap((p) => [p.blurb, ...p.features]), KIT.blurb, ...KIT.features].join(" ");
for (const unbuilt of [/SSO|SAML/, /audit log/i, /control mapping/i, /priority support/i, /members/i, /\bPDF report\b/i]) {
  ok(!unbuilt.test(allCopy), `no plan advertises an unbuilt feature (${unbuilt})`);
}

done("kit");
