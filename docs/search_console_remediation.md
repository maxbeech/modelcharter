# Search Console remediation — 7 October 2026

## Checklist

- [x] Record the reported URL samples and confirm the current date from the host.
- [x] Confirm the preferred origin, redirect chain, and existing canonical source of truth.
- [x] Audit the route templates and source data behind the affected tool and blog pages.
- [x] Improve the evidence-led content on indexable question pages without inventing vendor facts.
- [ ] Add regression coverage for canonical URL, sitemap membership and substantive question-page content.
- [x] Run the complete test suite, lint and a production build.
- [ ] Run browser E2E checks against the released site.
- [ ] Commit, synchronise `main`, deploy through the configured Helm7 Git integration, and verify live URLs.

## Decisions

- `https://www.modelcharter.com` remains the only canonical origin. `SITE.url` is the repository's single source of truth for metadata, JSON-LD, robots and sitemap URLs.
- The three **Page with redirect** examples are duplicate host variants. A permanent redirect to the `www` URL is intentional; they must remain excluded from the index rather than become indexable pages.
- The `/icon` sample is a generated favicon endpoint, not a content document. It is not included in the sitemap and does not need to be indexed.
- The affected tool-question routes remain indexable because they answer distinct vendor-and-framework questions. Their body will expose the relevant, sourced evidence and practical decision guidance rather than only a short answer and navigation links.
