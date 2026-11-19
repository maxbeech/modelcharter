import { readFileSync } from "node:fs";
import { providerErrorMessage, isReadableProviderMessage, SIGNUP_RETRY_MESSAGE } from "../lib/auth-errors.ts";
import { eq, ok, done } from "./_assert.mts";

// MODELCHARTER_WEB-6: Supabase answered sign-up with HTTP 500 and the client
// reported the message "{}". The visitor must see the retry text, never "{}".
eq(providerErrorMessage({ message: "{}", status: 500 }), SIGNUP_RETRY_MESSAGE, "a 500 with the serialized-object message shows the retry text");
eq(providerErrorMessage({ message: "{}" }), SIGNUP_RETRY_MESSAGE, "a serialized-object message with no status shows the retry text");
eq(providerErrorMessage({ message: "", status: 500 }), SIGNUP_RETRY_MESSAGE, "an empty message shows the retry text");
eq(providerErrorMessage({ message: undefined }), SIGNUP_RETRY_MESSAGE, "a missing message shows the retry text");
eq(providerErrorMessage({ message: "[]", status: 400 }), SIGNUP_RETRY_MESSAGE, "a serialized-array message shows the retry text");
eq(providerErrorMessage({ message: "Server error", status: 503 }), SIGNUP_RETRY_MESSAGE, "any 5xx shows the retry text even with a readable message");

// A readable 4xx message from the provider is shown as it is.
eq(providerErrorMessage({ message: "Password should be at least 6 characters.", status: 422 }), "Password should be at least 6 characters.", "a readable 4xx message passes through");
eq(providerErrorMessage({ message: "  Signups not allowed for this instance  ", status: 400 }), "Signups not allowed for this instance", "a readable message is trimmed");

// Readability check on its own.
ok(isReadableProviderMessage("Email rate limit exceeded"), "plain words are readable");
ok(!isReadableProviderMessage("{}"), "{} is not readable");
ok(!isReadableProviderMessage("12 34"), "digits only are not readable");

// The sign-up path must use the helper, so the raw message can never reach the form.
const src = readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf8");
ok(src.includes("providerErrorMessage(error)"), "lib/auth.ts signup maps the provider error through providerErrorMessage");
ok(!/exists \? "An account[^:]*: error\.message/.test(src), "lib/auth.ts no longer passes raw error.message to the form");

done("auth-errors");
