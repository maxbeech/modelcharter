import { pageMeta, faqLd, breadcrumbLd, datasetLd, softwareAppLd, articleLd, organizationLd, websiteLd } from "../lib/seo.ts";
import { eq, ok, done } from "./_assert.mts";

// pageMeta: canonical + title templating.
const m = pageMeta({ title: "Tools", description: "d", path: "/tools" });
const titleText = (t: unknown) => (t && typeof t === "object" && "absolute" in t ? (t as { absolute: string }).absolute : String(t));
eq(m.alternates?.canonical, "https://www.modelcharter.com/tools", "canonical built from SITE.url + path");
ok(titleText(m.title).includes("ModelCharter"), "non-home title appends brand");
// Absolute title (so the layout template does not double the brand suffix).
ok(m.title !== null && typeof m.title === "object" && "absolute" in m.title, "title is absolute to avoid template doubling");
eq(titleText(pageMeta({ title: "Home", description: "d", path: "/" }).title), "Home", "home title not suffixed");

// faqLd shape.
const faq = faqLd([{ q: "Q1", a: "A1" }, { q: "Q2", a: "A2" }]) as any;
eq(faq["@type"], "FAQPage", "faqLd is FAQPage");
eq(faq.mainEntity.length, 2, "faqLd maps all questions");
eq(faq.mainEntity[0].acceptedAnswer.text, "A1", "faqLd carries the answer");

// breadcrumb positions are 1-indexed and in order.
const bc = breadcrumbLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }]) as any;
eq(bc.itemListElement[0].position, 1, "breadcrumb starts at 1");
eq(bc.itemListElement[1].position, 2, "breadcrumb increments");
ok(bc.itemListElement[1].item.endsWith("/tools"), "breadcrumb item is absolute URL");

// datasetLd advertises the measured variables (GEO).
const ds = datasetLd({ name: "AI Tool Risk Directory", description: "d", path: "/tools", count: 22 }) as any;
eq(ds["@type"], "Dataset", "datasetLd is a Dataset");
ok(ds.variableMeasured.includes("SOC 2"), "datasetLd lists measured variables");
ok(ds.measurementTechnique.includes("22"), "datasetLd notes the count");

// Other builders return the right @type.
eq((softwareAppLd("n", "d", "/") as any)["@type"], "SoftwareApplication", "softwareAppLd type");
eq((articleLd({ title: "t", description: "d", path: "/blog/x", date: "2026-06-18" }) as any)["@type"], "Article", "articleLd type");
eq((organizationLd() as any)["@type"], "Organization", "organizationLd type");

// websiteLd identifies the site itself (distinct from Organization) for GEO.
const ws = websiteLd() as any;
eq(ws["@type"], "WebSite", "websiteLd type");
eq(ws.url, "https://www.modelcharter.com", "websiteLd url is the canonical site url");
ok(!!ws.name && !!ws.description, "websiteLd carries name + description");

done("seo");
