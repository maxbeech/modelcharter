import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/posts";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";
import { CtaBanner, FaqSection } from "@/components/page";
import { pageMeta, articleLd, breadcrumbLd, faqLd } from "@/lib/seo";

// Parses "text [link text](/href) more text" into real Link/<a> nodes so body
// copy can carry genuine, crawlable internal and external links.
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (href.startsWith("http")) {
      parts.push(
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
          {label}
        </a>
      );
    } else {
      parts.push(
        <Link key={i++} href={href} className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
          {label}
        </Link>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Blog content is static; revalidate weekly per the SEO/ISR strategy.
export const revalidate = 604800;
export const dynamicParams = false;
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.description, path: `/blog/${p.slug}`, keywords: [p.keyword] });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={articleLd({ title: p.title, description: p.description, path: `/blog/${p.slug}`, date: p.date })} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }])} />
      {p.faqs && p.faqs.length > 0 && <JsonLd data={faqLd(p.faqs)} />}
      <Section className="py-10 sm:py-14">
        <nav className="text-sm text-ink-faint"><Link href="/blog" className="hover:text-brand-700">← Blog</Link></nav>
        <article className="mt-5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium uppercase tracking-wide text-ink-faint">
            <time>{p.date}</time>
            {p.author && <><span aria-hidden>·</span><span>{p.author}</span></>}
          </div>
          <h1 className="mt-2 font-display text-[2.2rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.7rem]">{p.title}</h1>
          {p.image && (
            <div className="mt-6">
              <div className="relative h-56 overflow-hidden rounded-xl sm:h-72">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 672px, 100vw"
                  priority
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">
                Photo:{" "}
                <a
                  href={p.image.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {p.image.author}
                </a>{" "}
                / Pexels
              </p>
            </div>
          )}
          {p.tldr && p.tldr.length > 0 && (
            <div className="mt-7 rounded-xl border border-line bg-paper px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Key takeaways</p>
              <ul className="mt-2.5 space-y-1.5 text-[15px] leading-relaxed text-ink-soft">
                {p.tldr.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-7 space-y-6">
            {p.body.map((s, i) => (
              <div key={i}>
                {s.h && <h2 className="mb-1.5 font-display text-xl font-semibold text-ink">{s.h}</h2>}
                <p className="leading-[1.75] text-ink-soft">{renderInline(s.p)}</p>
              </div>
            ))}
          </div>
          {p.table && (
            <figure className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse overflow-hidden rounded-xl border border-line text-sm">
                <thead>
                  <tr className="bg-paper">
                    {p.table.headers.map((h, i) => (
                      <th key={i} className="border-b border-line px-4 py-2.5 text-left font-semibold text-ink">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.table.rows.map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-paper/60">
                      {row.map((cell, j) => (
                        <td key={j} className="border-b border-line px-4 py-2.5 text-ink-soft">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <figcaption className="mt-2 text-xs text-ink-faint">{p.table.caption}</figcaption>
            </figure>
          )}
          {p.quote && (
            <blockquote className="mt-8 border-l-2 border-brand-300 pl-5 text-lg italic leading-relaxed text-ink">
              “{p.quote.text}”
              <footer className="mt-2 text-sm not-italic font-medium text-ink-faint">{p.quote.attribution}</footer>
            </blockquote>
          )}
        </article>
      </Section>
      {p.faqs && p.faqs.length > 0 && <FaqSection faqs={p.faqs} columns={2} />}
      <CtaBanner title="Put this into practice" body="Generate a free AI usage policy for your team, then see which of your tools are safe to use." href="/ai-usage-policy-generator" label="Open the generator" />
    </>
  );
}
