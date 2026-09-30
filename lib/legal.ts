// Single source for the legal / trust pages. Content is specific to
// ModelCharter and deliberately honest (a compliance product cannot afford
// over-claiming). Rendered by the shared LegalDoc component.

export interface LegalSection { h: string; p: string[] }
export interface LegalDoc { slug: string; title: string; updated: string; intro: string; sections: LegalSection[] }

const UPDATED = "2026-06-18";

export const LEGAL: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    updated: UPDATED,
    intro: "This policy explains what data ModelCharter collects and how we use it. We practise what we preach about data minimisation.",
    sections: [
      { h: "What we collect", p: [
        "Free tools (the AI Usage Policy Generator and the AI Tool Risk Directory) run in your browser and require no account. The policy you generate is assembled on your device; we do not receive or store its contents.",
        "If you create an account, we store your email address, a securely hashed password (we never store the plaintext), and the workspace data you create: your AI tool register, saved policy versions and attestation records.",
        "We collect basic, privacy-respecting analytics (page views, aggregate usage) to improve the product.",
      ] },
      { h: "What we do NOT do", p: [
        "We do not sell your data. We do not use your workspace content to train AI models. We do not share your data with advertisers.",
      ] },
      { h: "Sub-processors", p: [
        "We use Helm7 (hosting), Neon (database) and Stripe (payments) as data processors. Each is bound by its own data-processing terms.",
      ] },
      { h: "Your rights", p: [
        "You can access, export or delete your account data at any time by emailing us. We delete account data within 30 days of an account being closed.",
      ] },
      { h: "Contact", p: ["Questions about this policy? Email privacy@modelcharter.com."] },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    updated: UPDATED,
    intro: "These terms govern your use of ModelCharter. By using the service you agree to them.",
    sections: [
      { h: "The service", p: [
        "ModelCharter provides tools to help you govern the use of AI at work: an AI usage policy generator, an AI tool risk directory, framework guides, and (on paid plans) a team workspace with a tool register, versioned policy and attestation tracking.",
      ] },
      { h: "Not legal advice", p: [
        "ModelCharter provides information and document templates, not legal advice. The AI Tool Risk Directory is compiled from public vendor sources and may be incomplete or out of date, so always verify against the vendor's own policies. You are responsible for having qualified advisors review any policy before you adopt it.",
      ] },
      { h: "Accounts & acceptable use", p: [
        "You are responsible for activity under your account and for keeping your password secure. Don't misuse the service, attempt to break its security, or use it to violate the law.",
      ] },
      { h: "Plans & billing", p: [
        "Paid plans are billed monthly via Stripe and include a 14-day trial. You can cancel at any time from the billing portal; cancellation takes effect at the end of the current period.",
      ] },
      { h: "Liability", p: [
        "The service is provided \"as is\". To the extent permitted by law, ModelCharter is not liable for indirect or consequential damages arising from your use of it.",
      ] },
      { h: "Contact", p: ["Questions? Email hello@mail.modelcharter.com."] },
    ],
  },
  security: {
    slug: "security",
    title: "Security",
    updated: UPDATED,
    intro: "How we protect your data, described plainly and without security theatre.",
    sections: [
      { h: "Encryption", p: [
        "All traffic is served over HTTPS/TLS. Data is encrypted at rest by our database provider (Neon). Passwords are hashed with bcrypt and never stored in plaintext.",
      ] },
      { h: "Access & isolation", p: [
        "Each workspace's data is isolated and scoped to its members. Sessions use signed, httpOnly cookies. We follow the principle of least privilege for internal access.",
      ] },
      { h: "Infrastructure", p: [
        "We host on Helm7 and build on Neon and Stripe. Neon and Stripe have their own SOC 2 and ISO programmes; Helm7 does not hold one yet. Payment card data is handled entirely by Stripe; we never see or store card numbers.",
      ] },
      { h: "Responsible disclosure", p: [
        "Found a vulnerability? Please email security@modelcharter.com. We'll acknowledge promptly and won't pursue researchers acting in good faith.",
      ] },
      { h: "Honest status", p: [
        "We're an early-stage product. We don't yet hold a formal SOC 2 report. When we pursue one, we will say so here rather than imply certifications we do not have.",
      ] },
    ],
  },
};

export function getLegalDoc(slug: string): LegalDoc | undefined { return LEGAL[slug]; }
export const LEGAL_SLUGS = Object.keys(LEGAL);
