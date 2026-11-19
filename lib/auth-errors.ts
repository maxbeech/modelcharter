// Turns a failed auth-provider call into the message a visitor sees.
//
// A provider 5xx can come back with an empty or non-JSON body, and the Supabase
// client then reports the literal text "{}" as the error message (Sentry
// MODELCHARTER_WEB-6: AuthRetryableFetchError "{}", status 500). That text is
// never shown: the visitor gets a plain retry message, and the full error still
// reaches Sentry through captureServerError in lib/auth.ts.

export const SIGNUP_RETRY_MESSAGE = "We couldn't create your account just now. Please try again in a moment.";

/** A message a person can read: at least one run of letters, not a serialized object or array. */
export function isReadableProviderMessage(message: string | undefined): message is string {
  const m = (message ?? "").trim();
  return /[A-Za-z]{3,}/.test(m) && !m.startsWith("{") && !m.startsWith("[");
}

/** Provider 5xx, or a message that is empty or serialized JSON, becomes the retry text; a readable 4xx message passes through. */
export function providerErrorMessage(err: { message?: string; status?: number }): string {
  if ((err.status ?? 0) >= 500 || !isReadableProviderMessage(err.message)) return SIGNUP_RETRY_MESSAGE;
  return err.message.trim();
}
