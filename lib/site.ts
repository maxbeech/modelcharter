// Single source of truth for site-wide identity, used by metadata, JSON-LD,
// sitemap, nav and footer. Keep `updated` stable to avoid sitemap churn.

export const SITE = {
  name: "ModelCharter",
  domain: "modelcharter.com",
  url: "https://www.modelcharter.com",
  tagline: "Charter your AI at work",
  shortDescription:
    "ModelCharter helps small healthcare practices use AI safely. See which AI tools will sign a BAA, write an AI policy that protects patient data, and check your staff have read the rules.",
  description:
    "ModelCharter is AI governance for small healthcare practices and teams without a compliance department. Write a HIPAA-ready AI usage policy with the free generator, check whether 60+ popular AI tools offer a BAA, train on your data or hold SOC 2, keep a register of approved tools, and collect staff sign-off with the HIPAA AI Kit.",
  email: "hello@mail.modelcharter.com",
  // Stable last-updated date for sitemap lastmod. Bump this when a
  // site-wide content push ships (new posts, catalog changes), not on
  // every commit; last bumped for the 2026-10-07 Search Console content update.
  updated: "2026-10-07",
  twitter: "@modelcharter",
  // The single primary keyword cluster this site targets.
  primaryKeyword: "ai governance",
};

// Every value orgs.plan can hold. "hipaa_kit" is the one-off HIPAA AI Kit;
// "team" and "business" are legacy subscriptions, no longer sold but still
// honoured for anyone who subscribed before 2026-10-20.
export type PlanId = "free" | "hipaa_kit" | "team" | "business";

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  hipaa_kit: "HIPAA AI Kit",
  team: "Team",
  business: "Business",
};

export const planLabel = (plan: string | undefined | null): string =>
  PLAN_LABELS[(plan ?? "free") as PlanId] ?? PLAN_LABELS.free;

// List price in USD for analytics items. Legacy plans keep the monthly price
// they were sold at so an old subscriber's renewal still reports correctly.
export const PLAN_PRICES: Record<PlanId, number> = { free: 0, hipaa_kit: 99, team: 49, business: 149 };

// A signed-in org has paid access if it bought the kit or holds a legacy
// subscription. Paid unlocks staff sign-off links and the evidence page.
export const isPaidPlan = (plan: string | undefined | null): boolean =>
  plan === "hipaa_kit" || plan === "team" || plan === "business";

export type NavLink = { label: string; href: string };

export const NAV: NavLink[] = [
  { label: "Tool directory", href: "/tools" },
  { label: "Compliance", href: "/compliance" },
  { label: "Policy generator", href: "/ai-usage-policy-generator" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

// The paid product: one price, paid once. Defined here and read by the kit
// page, the pricing page, the dashboard billing tab, Stripe checkout and the
// GA purchase payload. Only list features that exist in the product.
export const KIT = {
  id: "hipaa_kit" as const,
  name: "HIPAA AI Kit",
  price: PLAN_PRICES.hipaa_kit,
  cadence: "one-time",
  href: "/hipaa-ai-kit",
  buyHref: "/signup?plan=hipaa_kit",
  blurb: "Everything a small practice needs to say yes to AI without putting patient data at risk.",
  features: [
    "HIPAA AI policy written for your practice, saved with version history",
    "Tool register showing which AI tools will sign a BAA, and on which plan",
    "Staff sign-off links with a dated record of who signed",
    "Printable evidence pack: policy, tool decisions and sign-offs in one place",
  ],
};

// The plans checkout will start today. Team and Business are legacy: honoured
// for existing subscribers, never sold.
export const SELLABLE_PLANS: readonly string[] = [KIT.id];

/** A ?plan= value worth acting on (only something on sale), else null. */
export const buyIntent = (plan: string | undefined | null): string | null =>
  plan && SELLABLE_PLANS.includes(plan) ? plan : null;

/**
 * Where to send someone after signing up or logging in. With a buy intent the
 * dashboard continues straight on to Checkout; `joined` lets it send the
 * sign_up / login event first.
 */
export function afterAuthPath(joined: "sign_up" | "login" | null, plan: string | undefined | null): string {
  const q = new URLSearchParams();
  if (joined) q.set("joined", joined);
  const buy = buyIntent(plan);
  if (buy) q.set("buy", buy);
  const qs = q.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

// Pricing is defined once here and rendered by the pricing page.
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    blurb: "Write a policy and check any AI tool, no account needed.",
    features: [
      "AI usage policy generator, with a healthcare preset",
      "Download as Markdown or save as PDF",
      "HIPAA, GDPR and training facts for 60 AI tools",
      "Free workspace: tool register and saved policy versions",
    ],
    cta: "Generate a policy",
    href: "/ai-usage-policy-generator",
  },
  {
    id: KIT.id,
    name: KIT.name,
    price: KIT.price,
    cadence: KIT.cadence,
    blurb: KIT.blurb,
    features: ["Everything in Free", ...KIT.features.slice(2)],
    cta: `Get the kit for $${KIT.price}`,
    href: KIT.href,
    featured: true,
  },
] as const;
