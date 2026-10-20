import { GET } from "../app/llms.txt/route.ts";
import { SITE, PLANS, KIT } from "../lib/site.ts";
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
ok(body.includes(`${SITE.url}/blog`), "links the blog so assistants can find the articles");
ok(body.includes(`${SITE.url}/frameworks/eu-ai-act`), "links a framework guide");

// Pricing/plans: an assistant answering "how much does this cost" needs this.
ok(body.includes(`${SITE.url}/pricing`), "links canonical pricing page");
for (const plan of PLANS) {
  ok(body.includes(plan.name), `mentions the ${plan.name} plan`);
}
ok(body.includes(`${SITE.url}${KIT.href}`), "links the HIPAA AI Kit page");
ok(!body.includes("$99/mo"), "the one-off kit is never described as monthly");

// HIPAA cluster: the hub, the per-tool BAA answers and the OpenAI BAA post.
ok(body.includes(`${SITE.url}/compliance/hipaa`), "links the HIPAA hub");
ok(body.includes(`${SITE.url}/tools/chatgpt/hipaa`) && body.includes("ChatGPT: BAA on"), "lists ChatGPT's BAA plans");
ok(body.includes("Notion AI: BAA unverified"), "an unverified BAA is never listed as available");
ok(body.includes(`${SITE.url}/blog/does-openai-sign-a-baa`), "links the OpenAI BAA post");

done("llms-txt");
