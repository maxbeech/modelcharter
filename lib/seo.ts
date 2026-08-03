import type { Metadata } from "next";
import { SITE } from "./site";

// Single source for page metadata + structured-data (JSON-LD) builders.
// JSON-LD is rendered via <JsonLd> (components/JsonLd.tsx) on each page so AI
// assistants and search engines get clean, citable facts (the GEO strategy).

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE.url}${opts.path}`;
  const title = opts.path === "/" ? opts.title : `${opts.title} · ${SITE.name}`;
  return {
    // Absolute so the root layout's `%s · ModelCharter` template does not append
    // the brand a second time (pageMeta already includes it for non-home pages).
    title: { absolute: title },
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: opts.description,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: opts.description },
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.shortDescription,
    email: SITE.email,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.shortDescription,
  };
}

export function softwareAppLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `${SITE.url}${path}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE.url}${t.path}`,
    })),
  };
}

export function articleLd(opts: { title: string; description: string; path: string; date: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.date,
    dateModified: opts.date,
    url: `${SITE.url}${opts.path}`,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

// A Dataset node makes the AI Tool Risk Directory machine-readable & citable.
export function datasetLd(opts: { name: string; description: string; path: string; count: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    creator: { "@type": "Organization", name: SITE.name },
    keywords: ["AI governance", "AI tool risk", "data privacy", "AI compliance"],
    variableMeasured: ["trains on your data", "data retention", "SOC 2", "GDPR DPA", "HIPAA BAA"],
    isAccessibleForFree: true,
    measurementTechnique: `Compiled by ${SITE.name} from each vendor's official privacy policy, DPA and trust centre. Count: ${opts.count}.`,
  };
}
