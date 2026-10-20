// Applies every migration to a throwaway Postgres (with a minimal Supabase
// stub) and runs test/sql/billing-lock.test.sql, which proves a signed-in user
// cannot grant themselves a paid plan. Needs a disposable server:
//   RLS_TEST_PG="-h /tmp/pgsock -p 54329 -U postgres" npx tsx test/rls.test.mts
// Without RLS_TEST_PG it reports a skip, so `npm test` stays runnable anywhere.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { ok, done } from "./_assert.mts";

const args = process.env.RLS_TEST_PG?.trim();
if (!args) {
  console.log("- rls: skipped (set RLS_TEST_PG to a disposable Postgres to run)");
  done("rls");
} else {
  const base = [...args.split(/\s+/), "-v", "ON_ERROR_STOP=1", "-q", "-X"];
  const psql = (extra: string[]) => execFileSync(process.env.PSQL ?? "psql", [...base, ...extra], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const db = `rls_${Date.now()}`;
  psql(["-c", `create database ${db}`]);
  try {
    psql(["-d", db, "-f", "test/sql/supabase-stub.sql"]);
    const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort();
    for (const m of migrations) {
      try { psql(["-d", db, "-f", `supabase/migrations/${m}`]); ok(true, `migration ${m} applies`); }
      catch (e) { ok(false, `migration ${m} applies: ${(e as { stderr?: string }).stderr ?? e}`); }
    }
    // Migrations are meant to be re-runnable; apply the latest one twice.
    try { psql(["-d", db, "-f", `supabase/migrations/${migrations.at(-1)}`]); ok(true, "latest migration is idempotent"); }
    catch (e) { ok(false, `latest migration is idempotent: ${(e as { stderr?: string }).stderr ?? e}`); }
    try {
      const out = psql(["-d", db, "-f", "test/sql/billing-lock.test.sql"]);
      ok(out.includes("billing-lock: all checks passed"), "billing-lock checks report success");
    } catch (e) {
      ok(false, `billing-lock checks: ${(e as { stderr?: string }).stderr ?? e}`);
    }
  } finally {
    psql(["-c", `drop database ${db}`]);
  }
  done("rls");
}
