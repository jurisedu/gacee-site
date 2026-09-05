// node --env-file=.env.local scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const schema = (await import("../lib/db.ts").catch(() => null)) ?? null;
// Standalone copy of the schema (kept in sync with lib/db.ts) so the script runs without a TS loader.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS events (slug text PRIMARY KEY, title_zh text NOT NULL, title_en text NOT NULL, title_fr text NOT NULL DEFAULT '', body_zh text NOT NULL DEFAULT '', body_en text NOT NULL DEFAULT '', body_fr text NOT NULL DEFAULT '', host text NOT NULL DEFAULT '', starts_at timestamptz NOT NULL, duration_min int NOT NULL DEFAULT 30, ends_at timestamptz, time_confirmed boolean NOT NULL DEFAULT false, zoom_url text NOT NULL DEFAULT '', tencent_url text NOT NULL DEFAULT '', replay_url text NOT NULL DEFAULT '', replay_note text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'open', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS registrations (id bigserial PRIMARY KEY, event_slug text NOT NULL REFERENCES events(slug), token text NOT NULL UNIQUE, name text NOT NULL, email text NOT NULL, org text NOT NULL DEFAULT '', role text NOT NULL DEFAULT 'other', region text NOT NULL DEFAULT '', guardian_consent boolean NOT NULL DEFAULT false, recording_consent boolean NOT NULL DEFAULT false, lang text NOT NULL DEFAULT 'zh', country text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (event_slug, email))`,
  `CREATE TABLE IF NOT EXISTS joins (id bigserial PRIMARY KEY, registration_id bigint NOT NULL REFERENCES registrations(id), event_slug text NOT NULL, tool text NOT NULL, country text NOT NULL DEFAULT '', at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS questions (id bigserial PRIMARY KEY, event_slug text NOT NULL REFERENCES events(slug), registration_id bigint REFERENCES registrations(id), name text NOT NULL DEFAULT '', text text NOT NULL, answer text NOT NULL DEFAULT '', answered_at timestamptz, hidden boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS joins_event_idx ON joins(event_slug, at)`,
  `CREATE INDEX IF NOT EXISTS questions_event_idx ON questions(event_slug, created_at)`,
];
for (const s of SCHEMA) await sql.query(s);
void schema;
const r = await sql`SELECT count(*)::int AS n FROM events`;
console.log("schema ok; events:", r[0].n);
