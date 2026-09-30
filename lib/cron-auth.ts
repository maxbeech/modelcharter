import { timingSafeEqual } from "node:crypto";

export type CronAuth = "ok" | "unconfigured" | "unauthorized";

// Fail-closed bearer check for scheduled routes. Unset secret is "unconfigured"
// (503), never a pass: an endpoint that runs when its secret is missing can be
// triggered by anyone. Compared in constant time so the secret cannot be
// recovered one byte at a time from response timing.
export function checkCronAuth(authorization: string | null, secret: string | undefined): CronAuth {
  if (!secret) return "unconfigured";
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorization ?? "");
  // timingSafeEqual throws on unequal lengths, so a length mismatch is a plain reject.
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return "unauthorized";
  return "ok";
}
