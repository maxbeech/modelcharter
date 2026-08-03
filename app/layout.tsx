import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE, NAV } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";
import { LogoLink, SignalMark } from "@/components/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description, creator: SITE.twitter },
};

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <LogoLink />
        <nav className="flex items-center gap-1 text-sm font-medium text-ink-soft">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="hidden rounded-md px-3 py-2 transition-colors hover:text-ink md:inline">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="hidden rounded-md px-3 py-2 transition-colors hover:text-ink sm:inline">Log in</Link>
          <Link
            href="/ai-usage-policy-generator"
            className="ml-1 rounded-full bg-brand-700 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            Generate a policy
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-white print:hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="/" aria-label="ModelCharter home" className="flex items-center gap-2.5">
            <SignalMark />
            <span className="text-[1.15rem] font-semibold tracking-tight text-ink">ModelCharter</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            AI governance for teams that do not have a compliance department.
          </p>
        </div>
        <FooterCol title="Product" links={[["AI Tool Risk Directory", "/tools"], ["AI vendor risk assessment", "/ai-vendor-risk-assessment"], ["Compare tools", "/compare"], ["AI usage policy generator", "/ai-usage-policy-generator"], ["Pricing", "/pricing"]]} />
        <FooterCol title="Compliance" links={[["HIPAA-compliant AI tools", "/compliance/hipaa"], ["GDPR-ready AI tools", "/compliance/gdpr"], ["SOC 2 AI tools", "/compliance/soc-2"], ["Tools that don't train on your data", "/compliance/no-training"]]} />
        <FooterCol title="Company" links={[["Blog", "/blog"], ["Glossary", "/glossary"], ["Frameworks", "/frameworks"], ["About", "/about"], ["Contact", "/contact"], ["Security", "/security"]]} />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. Guidance only, not legal advice. Always check vendor facts against their official sources.</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
            <Link href="/security" className="transition-colors hover:text-ink">Security</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="text-ink-soft transition-colors hover:text-brand-700">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
