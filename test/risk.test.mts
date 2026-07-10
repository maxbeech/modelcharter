import { TOOLS, getTool, type AiTool } from "../lib/ai-tools.ts";
import { scoreTool, bandSummary } from "../lib/risk.ts";
import { eq, ok, done } from "./_assert.mts";

// Midjourney trains on all tiers with no certs => must be High.
const mj = getTool("midjourney");
ok(!!mj, "midjourney exists");
if (mj) eq(scoreTool(mj).band, "High", "midjourney is High risk");

// ChatGPT (opt-out training, strong certs) should be Low/Medium, not High.
const gpt = getTool("chatgpt");
if (gpt) ok(["Low", "Medium"].includes(scoreTool(gpt).band), "chatgpt is not High risk");

// General invariants across the whole directory.
for (const t of TOOLS) {
  const r = scoreTool(t);
  ok(r.score >= 0 && r.score <= 100, `${t.name}: score in range`);
  ok(r.coverage >= 0 && r.coverage <= 1, `${t.name}: coverage in 0..1`);
  ok(["Low", "Medium", "High", "Unrated"].includes(r.band), `${t.name}: valid band`);
  // Factor contributions sum to the score (within per-factor rounding error).
  if (r.band !== "Unrated") {
    const sum = r.factors.reduce((s, f) => s + f.points, 0);
    ok(Math.abs(sum - r.score) <= r.factors.length + 1, `${t.name}: factor points sum near score`);
    ok(r.factors.every((f) => f.points > 0), `${t.name}: only risk-adding factors surfaced`);
  }
  // A tool that trains by default is never rated Low.
  if (t.trainsOnPersonalData === "yes") ok(r.band !== "Low", `${t.name}: default-training tool is not Low`);
}

function fakeTool(over: Partial<AiTool>): AiTool {
  return { slug: "x", name: "X", vendor: "V", category: "assistant", homepageUrl: "https://x",
    trainsOnPersonalData: "no", trainsOnBusinessData: "no", trainingOptout: "yes",
    soc2: "yes", iso27001: "yes", iso42001: "yes", gdprDpa: "yes", hipaaBaa: "yes",
    dataRegionEu: "yes", ssoSaml: "yes", sources: [], confidence: "high", ...over };
}

// All controls present, no training => 0 risk, Low, full coverage.
const allGood = scoreTool(fakeTool({}));
eq(allGood.band, "Low", "all-good tool is Low");
eq(allGood.score, 0, "all-good tool scores 0");
eq(allGood.coverage, 1, "all-good tool has full coverage");

// Training on both tiers + missing SOC 2 and GDPR => High.
eq(scoreTool(fakeTool({ trainsOnPersonalData: "yes", trainsOnBusinessData: "yes", soc2: "no", gdprDpa: "no" })).band, "High", "training both tiers + missing certs is High");

// Coverage guardrail: safe on the one fact we know, but too little verified to
// claim Low. Everything unknown except a clean training posture.
const thin = fakeTool({ trainsOnBusinessData: null, soc2: null, iso27001: null, iso42001: null, gdprDpa: null, hipaaBaa: null, dataRegionEu: null, ssoSaml: null });
ok(scoreTool(thin).coverage < 0.5, "thin tool has low coverage");
eq(scoreTool(thin).band, "Medium", "thin evidence cannot earn Low");

// Nothing verified => Unrated.
const blank = fakeTool({ trainsOnPersonalData: null, trainsOnBusinessData: null, trainingOptout: null, soc2: null, iso27001: null, iso42001: null, gdprDpa: null, hipaaBaa: null, dataRegionEu: null, ssoSaml: null });
eq(scoreTool(blank).band, "Unrated", "fully unverified tool is Unrated");

// bandSummary names the tool and never contains an em dash.
for (const t of TOOLS.slice(0, 8)) {
  ok(bandSummary(t).includes(t.name), `${t.name}: bandSummary names tool`);
  ok(!bandSummary(t).includes("—"), `${t.name}: bandSummary has no em dash`);
}

done("risk");
