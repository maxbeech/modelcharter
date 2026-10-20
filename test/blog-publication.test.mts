import { OCTOBER_2026_CAMPAIGN_SLUGS, POSTS } from "../lib/posts.ts";
import { eq, ok, done } from "./_assert.mts";

const campaign = OCTOBER_2026_CAMPAIGN_SLUGS.map((slug) => POSTS.find((post) => post.slug === slug));
const textFor = (post: NonNullable<(typeof campaign)[number]>) => [
  post.title,
  post.description,
  ...(post.tldr ?? []),
  ...post.body.flatMap((section) => [section.h ?? "", section.p]),
  post.table?.caption ?? "",
  ...(post.table?.headers ?? []),
  ...(post.table?.rows.flat() ?? []),
  post.quote?.text ?? "",
  ...(post.faqs?.flatMap((faq) => [faq.q, faq.a]) ?? []),
].join(" ");

eq(campaign.length, 15, "October campaign contains exactly fifteen posts");
ok(campaign.every(Boolean), "every campaign slug is registered in POSTS");

const posts = campaign as NonNullable<(typeof campaign)[number]>[];
const categories = new Set(posts.map((post) => post.category));
ok(categories.has("Academy") && categories.has("News") && categories.has("Reviews"), "campaign spans Academy, News and Reviews");

for (const post of posts) {
  const content = textFor(post);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  ok(post.title.length < 60, `${post.slug}: title is under 60 characters`);
  ok(post.description.length < 155, `${post.slug}: description is under 155 characters`);
  ok(post.date >= "2026-10-01" && post.date <= "2026-10-07", `${post.slug}: published within the campaign week`);
  ok((post.supportingKeywords?.length ?? 0) >= 6, `${post.slug}: has six supporting keywords`);
  ok(words >= 1200, `${post.slug}: has at least 1,200 words including FAQs and table content`);
  ok((post.faqs?.length ?? 0) >= 3, `${post.slug}: has at least three FAQs`);
  ok(!!post.table, `${post.slug}: has a visual data table`);
  ok(!!post.quote, `${post.slug}: has an attributable expert quote`);
  ok(!!post.image?.src && !!post.image.alt && !!post.image.authorUrl, `${post.slug}: has a credited featured image`);
}

// --- HIPAA cluster: "Does OpenAI sign a BAA?" (targets "openai baa", "chatgpt baa") ---
const baaPost = POSTS.find((post) => post.slug === "does-openai-sign-a-baa");
ok(!!baaPost, "the OpenAI BAA post is registered in POSTS");
if (baaPost) {
  const content = textFor(baaPost);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  ok(baaPost.title.length < 60, "openai baa: title is under 60 characters");
  ok(baaPost.description.length < 155, "openai baa: description is under 155 characters");
  eq(baaPost.keyword, "openai baa", "openai baa: targets the head term");
  ok(!!baaPost.supportingKeywords?.includes("chatgpt baa"), "openai baa: also targets chatgpt baa");
  ok((baaPost.supportingKeywords?.length ?? 0) >= 6, "openai baa: has six supporting keywords");
  ok(/^\d{4}-\d{2}-\d{2}$/.test(baaPost.date) && baaPost.date <= new Date().toISOString().slice(0, 10), "openai baa: dated, not in the future");
  ok(words >= 1200, `openai baa: has at least 1,200 words (${words})`);
  ok((baaPost.faqs?.length ?? 0) >= 3 && !!baaPost.table && !!baaPost.quote, "openai baa: has FAQs, a table and a quote");
  ok(!!baaPost.image?.src && !!baaPost.image.alt && !!baaPost.image.authorUrl, "openai baa: has a credited featured image");
  ok(!/[\u2014\u2013]/.test(content), "openai baa: no em or en dashes");
  // The facts must match the directory record the post points readers to.
  ok(content.includes("ChatGPT Business") && /does not offer a BAA for ChatGPT Business/.test(content), "openai baa: says Business has no BAA");
  ok(content.includes("/tools/chatgpt/hipaa") && content.includes("/compliance/hipaa"), "openai baa: links the live answer page and the hub");
  ok(content.includes("/hipaa-ai-kit") && content.includes("/ai-usage-policy-generator?preset=healthcare"), "openai baa: links both practice CTAs");
  ok(content.includes("help.openai.com"), "openai baa: cites OpenAI's own help article");
}

done("blog publication");
