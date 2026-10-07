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

done("blog publication");
