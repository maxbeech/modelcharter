// Single source of truth for site-wide identity, used by metadata, JSON-LD,
// sitemap, nav and footer. Keep `updated` stable to avoid sitemap churn.

export const SITE = {
  name: "ModelCharter",
  domain: "modelcharter.com",
  url: "https://www.modelcharter.com",
  tagline: "Charter your AI at work",
  shortDescription:
    "ModelCharter helps small and mid-sized teams govern AI. Generate an AI usage policy quickly, see which AI tools are safe to use, and check your team has read the rules.",
  description:
    "ModelCharter is the AI governance tool for companies without a compliance team. Build a tailored AI usage policy with the free generator, look up how 60+ popular AI tools handle your data in the AI Tool Risk Directory, map your obligations under the EU AI Act, NIST AI RMF, ISO 42001 and SOC 2, and keep a register of which tools your team is approved to use.",
  email: "hello@modelcharter.com",
  // Stable last-updated date for sitemap lastmod.
  updated: "2026-06-26",
  twitter: "@modelcharter",
  // The single primary keyword cluster this site targets.
  primaryKeyword: "ai governance",
};

// A signed-in org is on a paid plan if it isn't on "free". Paid unlocks
// attestation collection and the compliance export.
export const isPaidPlan = (plan: string | undefined | null): boolean =>
  plan === "team" || plan === "business";

export type NavLink = { label: string; href: string };

export const NAV: NavLink[] = [
  { label: "Tool directory", href: "/tools" },
  { label: "Compliance", href: "/compliance" },
  { label: "Policy generator", href: "/ai-usage-policy-generator" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

// Pricing is defined once here and rendered by the pricing page + Stripe checkout.
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    blurb: "Everything an individual needs to write a policy and vet tools.",
    features: [
      "AI usage policy generator (unlimited)",
      "Download policy as Markdown",
      "Full AI Tool Risk Directory",
      "Framework guides (EU AI Act, NIST, ISO 42001, SOC 2)",
    ],
    cta: "Generate a policy",
    href: "/ai-usage-policy-generator",
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    cadence: "per month",
    blurb: "Govern AI across your whole team with a living register.",
    features: [
      "Everything in Free",
      "AI tool register with approve / restrict / review states",
      "Versioned company AI policy",
      "Employee attestation tracking (shareable link)",
      "Exportable compliance report (PDF)",
      "Up to 50 team members",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=team",
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    price: 149,
    cadence: "per month",
    blurb: "For regulated teams that need evidence and controls.",
    features: [
      "Everything in Team",
      "Unlimited members",
      "SSO (SAML), once configured",
      "Audit log & evidence export",
      "Framework control mapping (ISO 42001 / SOC 2)",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=business",
  },
] as const;
