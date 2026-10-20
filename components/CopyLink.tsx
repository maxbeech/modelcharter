"use client";
import { useState } from "react";

// Copies the link, or, where the browser refuses clipboard access, shows the
// URL selected so it can be copied by hand. Never a silent failure.
export function CopyLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("manual");
    }
  }
  if (state === "manual") {
    return (
      <input readOnly value={url} autoFocus onFocus={(e) => e.currentTarget.select()} aria-label="Sign-off link"
        className="w-64 max-w-full rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1 font-mono text-xs text-ink focus:outline-none" />
    );
  }
  return (
    <button type="button" onClick={copy}
      className="rounded-md border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-paper">
      {state === "copied" ? "Copied" : "Copy link"}
    </button>
  );
}
