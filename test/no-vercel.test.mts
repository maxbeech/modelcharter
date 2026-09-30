// ModelCharter runs on Helm7, not Vercel. A `VERCEL_*` check is always unset
// there, and a Vercel package, CLI script or vercel.json left behind either
// ships dead code or changes what the build does. Keep all of it out. The
// generated service clients are copies of a shared source and are not policed
// here, and the AI Tool Risk Directory (data/) legitimately lists Vercel's v0
// as a tool, which is why only code is scanned.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eq, ok, done } from "./_assert.mts";

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|mts|mjs)$/.test(name) ? [path] : [];
  });
}

const files = [
  ...["app", "components", "lib"].flatMap(sources),
  ...["next.config.ts", "proxy.ts", "instrumentation.ts", "instrumentation-client.ts", "sentry.server.config.ts", "sentry.edge.config.ts"].filter(existsSync),
].filter((f) => !/GENERATED/.test(readFileSync(f, "utf8").slice(0, 400)));

ok(files.length > 30, `finds the source to police (${files.length} files)`);
const offenders = files.filter((f) => /vercel/i.test(readFileSync(f, "utf8")));
eq(offenders, [], "names Vercel nowhere in application code");
eq(
  files.filter((f) => /export const maxDuration/.test(readFileSync(f, "utf8"))),
  [],
  "sets no maxDuration, which only Vercel reads",
);

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
eq(
  Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((n) => n === "vercel" || n === "botid" || n.startsWith("@vercel/")),
  [],
  "no Vercel package",
);
ok(
  !Object.values(pkg.scripts ?? {}).some((s) => /(^|[\s&;])(npx\s+)?vercel(\s|$)/.test(s)),
  "no script runs the vercel CLI",
);
ok(!existsSync("vercel.json"), "no vercel.json");
// Helm7 runs `npm start` with PORT set; a fixed port leaves the health check
// probing a port nothing listens on.
ok((pkg.scripts?.start ?? "").includes("${PORT"), `start honours $PORT (${pkg.scripts?.start})`);

done("no-vercel");
