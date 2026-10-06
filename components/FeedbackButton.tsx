"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * The user-facing feedback control. Opens Sentry's feedback form, so a report
 * from a person lands in the same Sentry project as the exceptions from the
 * code. The SDK is imported lazily so marketing pages do not pull the browser
 * SDK into their first bundle just to render a footer link.
 */
export function FeedbackButton({
  variant = "link",
  className = "",
  user,
}: {
  variant?: "link" | "pill";
  className?: string;
  /** Signed-in user, so nobody retypes their email. */
  user?: { email?: string | null; name?: string | null };
}) {
  const [unavailable, setUnavailable] = useState(false);

  const open = async () => {
    const Sentry = await import("@sentry/nextjs");
    const feedback = Sentry.getFeedback();
    if (!feedback) {
      // No DSN on this deployment: say so rather than do nothing on click.
      setUnavailable(true);
      return;
    }
    // The form reads name and email from the Sentry user.
    if (user?.email) Sentry.setUser({ email: user.email, ...(user.name ? { username: user.name } : {}) });
    const form = await feedback.createForm();
    form.appendToDom();
    form.open();
  };

  if (unavailable) {
    return (
      <span className={className}>
        Feedback is not set up here. Email{" "}
        <a className="underline underline-offset-2" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </span>
    );
  }

  const styles =
    variant === "pill"
      ? "inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-paper focus-brand"
      : "transition-colors hover:text-ink focus-brand";

  return (
    <button type="button" onClick={open} className={`${styles} ${className}`.trim()}>
      {variant === "pill" && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        </svg>
      )}
      Send feedback
    </button>
  );
}
