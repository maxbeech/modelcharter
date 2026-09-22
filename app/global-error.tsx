"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Same rationale as app/error.tsx, but for errors thrown by the root layout
// itself (outside any route segment's boundary). Next.js requires this file
// to render its own <html>/<body> since it replaces the whole layout.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: 12, color: "#555" }}>Please refresh the page.</p>
        </div>
      </body>
    </html>
  );
}
