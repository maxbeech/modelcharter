import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { POSTS } from "@/lib/posts";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page";
import { pageMeta, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "AI governance blog: guides for teams",
  description: "Practical guides on AI governance, AI usage policies, shadow AI and AI compliance for small and mid-sized teams.",
  path: "/blog",
  keywords: ["ai governance blog", "ai usage policy", "shadow ai", "ai compliance"],
});

export default function Page() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <PageHero
        eyebrow="Blog"
        title="Guides to governing AI at work"
        intro="Plain-English guides on AI policies, shadow AI and AI compliance, written for teams without a compliance department."
      />
      <Section className="grid gap-5 py-14 sm:py-16 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
            {p.image && (
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-7">
              <time className="text-xs font-medium uppercase tracking-wide text-ink-faint">{p.date}</time>
              <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink group-hover:text-brand-700">{p.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-700">Read →</span>
            </div>
          </Link>
        ))}
      </Section>
    </>
  );
}
