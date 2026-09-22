"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Section, btn } from "@/components/ui";

// Route-segment error boundary. This is the one line of defense the App
// Router gives us against errors that happen during React's commit phase
// (e.g. a bot or extension mutating the DOM outside React's control, which
// surfaces as "Cannot read properties of null (reading 'removeChild')" when
// React later tries to reconcile a node that isn't there anymore). We can't
// prevent third-party interference with the live DOM, so the correct fix is
// to contain it here rather than let it blank the whole page.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <Section className="py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Error</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">This page hit an unexpected error. Reloading usually fixes it.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className={btn("primary")}>Try again</button>
        <Link href="/" className={btn("secondary")}>Home</Link>
      </div>
    </Section>
  );
}
