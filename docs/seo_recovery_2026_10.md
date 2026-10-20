# SEO audit, October 2026

Written 2026-10-20. Audit only, no page changes made.

## What happened

Search Console (sc-domain:modelcharter.com), impressions per day:

| Window | Impressions/day |
|---|---|
| 1 Jul - 17 Aug (baseline) | about 139 (6,668 in 48 days, 9 clicks) |
| 22 Aug - 11 Sep (peak) | about 372 (8,001 in 21 days) |
| 28 Sep - 18 Oct (now) | about 216 (4,623 in 21 days) |

There is no dated cliff. Impressions rose 2.7x after the August update, then came back about 42% from the peak. The current level is still about 1.55x the July baseline. Click volume is close to zero throughout (9 clicks in the baseline window), so the site has had almost no organic traffic to lose. A second spam update ran 24 Sep - 8 Oct, which fits a drift back from a temporary spike.

## Change by family (peak window vs now, impressions)

| Family | Pattern | URLs in sitemap | Peak | Now | Change |
|---|---|---|---|---|---|
| Tool x question | /tools/{tool}/{hipaa,gdpr,soc2,iso27001,training} | 300 | 2,339 | 1,579 | -32% |
| Tool profiles | /tools/{tool} | 60 | 1,630 | 954 | -41% |
| Blog | /blog/{slug} | 61 | 1,697 | 628 | -63% |
| Compliance lists | /compliance/{slug} | 9 | 1,251 | 622 | -50% |
| Compare pairs | /compare/{a}-vs-{b} | 36 | 235 | 362 | +54% |
| Glossary | /glossary/{term} | 10 | 326 | 15 | -95% |
| Frameworks | /frameworks/{slug} | 4 | 16 | 28 | +75% |

The question pages, the family most likely to be called templated, fell the least. Every family moves, including the hand-written blog, so there is no sign of a family-specific penalty.

## Verdicts

Judged by reading the generating code and rendered samples (chatgpt, devin and heygen soc2 pages; chatgpt-vs-cursor and claude-vs-perplexity; compliance/hipaa and no-training; glossary/subprocessor).

| Family | Verdict | Reason |
|---|---|---|
| Tool profiles (60) | keep | Per-tool record from vendor documents: training posture for consumer and business tiers, retention, certifications, sources, a stated risk. |
| Tool x question (300) | keep, watch | Each page differs by real per-tool facts and notes (the devin and heygen pages carry different training and risk text), and the page answers an exact query. But all five pages for a tool re-slice one record and share the same boilerplate, and the 300 pages earned 1 click in 48 days. Not a clear failure of the distinct-data test, so left in place. If the site is still sliding after the next update, the next step is to consolidate to the profile page and noindex the slices where the answer is "Not verified". |
| Compare pairs (36) | keep | Side-by-side figures from both records, including the two retention statements. Impressions are rising. |
| Compliance lists (9) | keep | Live filtered lists across the 60 tools with counts. |
| Glossary (10) | keep | Hand-written explanatory text. |
| Frameworks (4) | keep | Hand-written. |
| Blog (61) | editorial review, not applied | Several posts overlap on one query: AI usage policy (how-to-write-an-ai-usage-policy, ai-usage-policy-that-works, ai-policy-template, ai-acceptable-use-policy, what-is-an-ai-policy, ai-policy-for-employees), NIST and ISO frameworks (four posts), best AI tools (two posts), responsible AI (three posts). Merging them is a content call that needs the posts read side by side, not a template problem. Not done here. |

## Conclusion

The drop looks like ordinary reversion after a transient spike plus the second spam update, not a family problem. No redirects, noindex tags or sitemap changes were applied. Sitemap stays at 496 URLs.

## Open items

1. The sitemap lists 496 URLs but Search Console reports 990 submitted. Worth checking which sitemap(s) are submitted (possibly the non-www host or an older file).
2. Search Console reports the www host; check non-www redirects to it.
3. Consolidate the overlapping blog posts (301 weaker into stronger) as a separate editorial pass.
