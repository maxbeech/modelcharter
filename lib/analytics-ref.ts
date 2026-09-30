import { createHash } from "node:crypto";

/**
 * The pseudonymous GA user reference of the OpenHelm journey contract (GA user
 * property `oh_user_ref`): the first 16 lowercase hex characters of SHA-256 over
 * the UTF-8 bytes of the Supabase user id. Same value as `userRefFor` in
 * `openhelm-analytics-mp.ts`, but synchronous.
 *
 * Server only (it needs node:crypto, so importing it into a client component
 * fails the build): the raw id never reaches the browser, only this one-way ref.
 */
export function analyticsUserRef(userId: string): string {
  const id = userId.trim();
  if (!id) throw new Error("analyticsUserRef needs a non-empty user id");
  return createHash("sha256").update(id, "utf8").digest("hex").slice(0, 16);
}
