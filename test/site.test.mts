import { PLANS, isPaidPlan, NAV } from "../lib/site.ts";
import { LEGAL, LEGAL_SLUGS, getLegalDoc } from "../lib/legal.ts";
import { eq, ok, done } from "./_assert.mts";

// Plan gating.
eq(isPaidPlan("free"), false, "free is not paid");
eq(isPaidPlan("team"), true, "team is paid");
eq(isPaidPlan("business"), true, "business is paid");
eq(isPaidPlan("hipaa_kit"), true, "the one-off kit is paid");
eq(isPaidPlan(null), false, "null is not paid");
eq(isPaidPlan(undefined), false, "undefined is not paid");
eq(isPaidPlan("enterprise-typo"), false, "unknown plan is not paid");

// Plans are coherent.
ok(PLANS.length === 2, "two listed plans: Free and the kit");
ok(PLANS[0].id === "free" && PLANS[0].price === 0, "free plan is $0");
for (const p of PLANS) { ok(p.features.length > 0, `${p.id} has features`); ok(!!p.href, `${p.id} has CTA href`); }
ok(NAV.every((n) => n.href.startsWith("/")), "nav links are internal paths");

// Legal docs present + well-formed (a compliance product must have these).
for (const s of ["privacy", "terms", "security"]) ok(LEGAL_SLUGS.includes(s), `legal doc ${s} exists`);
for (const slug of LEGAL_SLUGS) {
  const d = LEGAL[slug];
  ok(!!d.title && !!d.intro, `${slug}: has title + intro`);
  ok(d.sections.length >= 3, `${slug}: has sections`);
  ok(/^\d{4}-\d{2}-\d{2}$/.test(d.updated), `${slug}: updated date is ISO`);
  ok(d.sections.every((sec) => sec.p.length > 0), `${slug}: every section has body`);
}
eq(getLegalDoc("privacy")?.slug, "privacy", "getLegalDoc resolves");
eq(getLegalDoc("nope"), undefined, "getLegalDoc unknown → undefined");

done("site");
