import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { softwareAppLd, faqLd, pageMeta } from "@/lib/seo";
import { Hero, HowItWorks } from "@/components/home";
import { TrustStrip, DirectoryPreview, Positioning, FrameworksStrip, FaqAndCta, HOME_FAQS } from "@/components/home-extra";

// Explicit title and description for the home page, so it does not rely on the root layout alone.
export const metadata: Metadata = pageMeta({
  title: `HIPAA AI policy and BAA checker for small practices | ${SITE.name}`,
  description: "See which AI tools will sign a BAA, write an AI policy that keeps patient data safe, and collect staff sign-off. Built for small healthcare practices without a compliance department.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={softwareAppLd(SITE.name, SITE.description, "/")} />
      <JsonLd data={faqLd(HOME_FAQS)} />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <DirectoryPreview />
      <Positioning />
      <FrameworksStrip />
      <FaqAndCta />
    </>
  );
}
