import { readFileSync } from "node:fs";
import { checkCronAuth } from "../lib/cron-auth.ts";
import { eq, ok, done } from "./_assert.mts";

eq(checkCronAuth("Bearer s3cret", "s3cret"), "ok", "the right bearer token passes");
eq(checkCronAuth("Bearer s3cret", undefined), "unconfigured", "an unset secret is 503, not a pass");
eq(checkCronAuth("Bearer s3cret", ""), "unconfigured", "an empty secret is 503, not a pass");
eq(checkCronAuth("Bearer ", ""), "unconfigured", "an empty secret with an empty token is still refused");
eq(checkCronAuth(null, "s3cret"), "unauthorized", "no header is 401");
eq(checkCronAuth("Bearer wrong!", "s3cret"), "unauthorized", "a wrong token of the same length is 401");
eq(checkCronAuth("Bearer s3cre", "s3cret"), "unauthorized", "a shorter token is 401 without throwing");
eq(checkCronAuth("Bearer s3cret-and-more", "s3cret"), "unauthorized", "a longer token is 401 without throwing");
eq(checkCronAuth("s3cret", "s3cret"), "unauthorized", "the bare secret without Bearer is 401");

const route = readFileSync("app/api/cron/sync-alerts/route.ts", "utf8");
ok(route.includes("checkCronAuth"), "the alerts cron uses the shared fail-closed check");
ok(!/authorization"\) !==/.test(route), "the alerts cron has no inline non-constant-time comparison");

done("cron-auth");
