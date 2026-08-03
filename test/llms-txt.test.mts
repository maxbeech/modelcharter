import { GET } from "../app/llms.txt/route.ts";
import { SITE, PLANS } from "../lib/site.ts";
import { ok, eq, done } from "./_assert.mts";

// /llms.txt is the GEO summary for AI assistants. It must describe the
// product, stay in sync with SITE.updated, and link every canonical
// surface an assistant would need: free tools, compliance answers,
// pricing/plans and framework guides.
const res = GET();
const body = await res.text();

eq(res.headers.get("content-type"), "text/plain; charset=utf-8", "llms.txt is served as plain text");
ok(body.startsWith(`# ${SITE.name}: ${SITE.tagline}`), "opens with name + tagline");
ok(body.includes(SITE.shortDescription), "includes the product description");
ok(body.includes(`Updated: ${SITE.updated}`), "Updated line matches SITE.updated (no drift)");

ok(body.includes(`${SITE.url}/ai-usage-policy-generator`), "links the policy generator");
ok(body.includes(`${SITE.url}/tools`), "links the tool directory");
ok(body.includes(`${SITE.url}/glossary`), "links the glossary");
ok(body.includes(`${SITE.url}/frameworks/eu-ai-act`), "links a framework guide");

// Pricing/plans: an assistant answering "how much does this cost" needs this.
ok(body.includes(`${SITE.url}/pricing`), "links canonical pricing page");
for (const plan of PLANS) {
  ok(body.includes(plan.name), `mentions the ${plan.name} plan`);
}

done("llms-txt");
