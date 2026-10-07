import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SITE } from "../lib/site.ts";
import { getTool } from "../lib/ai-tools.ts";
import { getQuestion } from "../lib/registry-questions.ts";
import { eq, ok, done } from "./_assert.mts";

// Search Console must see one canonical origin across sitemap, metadata and
// structured-data builders. The host redirect itself is owned by Helm7/Caddy.
eq(SITE.url, "https://www.modelcharter.com", "www is the canonical site origin");
eq(SITE.updated, "2026-10-07", "sitemap freshness date reflects the content release");

const sitemapSource = readFileSync(fileURLToPath(new URL("../app/sitemap.ts", import.meta.url)), "utf8");
ok(sitemapSource.includes('import { SITE } from "@/lib/site"'), "sitemap uses the site source of truth");
ok(sitemapSource.includes('u(`/tools/${t.slug}/${q}`)'), "sitemap includes every tool-question route");
ok(sitemapSource.includes('u(`/blog/${p.slug}`)'), "sitemap includes every blog route");
ok(!sitemapSource.includes("modelcharter.com/"), "sitemap does not hardcode a competing host");

const bolt = getTool("bolt-new");
const gdpr = getQuestion("gdpr");
ok(!!bolt && !!gdpr, "reported Bolt.new GDPR route has source data");
if (bolt && gdpr) {
  ok(gdpr.answer(bolt).length >= 80, "question page has a direct, useful answer");
}

done("search-console");
