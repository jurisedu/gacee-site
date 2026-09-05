import { neon } from "@neondatabase/serverless";
import { randomBytes } from "crypto";

export const sql = neon(process.env.SG_DATABASE_URL ?? process.env.DATABASE_URL!);

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS events (
    slug text PRIMARY KEY,
    title_zh text NOT NULL, title_en text NOT NULL, title_fr text NOT NULL DEFAULT '',
    body_zh text NOT NULL DEFAULT '', body_en text NOT NULL DEFAULT '', body_fr text NOT NULL DEFAULT '',
    host text NOT NULL DEFAULT '',
    starts_at timestamptz NOT NULL,
    duration_min int NOT NULL DEFAULT 30,
    ends_at timestamptz,
    time_confirmed boolean NOT NULL DEFAULT false,
    zoom_url text NOT NULL DEFAULT '', tencent_url text NOT NULL DEFAULT '',
    replay_url text NOT NULL DEFAULT '', replay_note text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS registrations (
    id bigserial PRIMARY KEY,
    event_slug text NOT NULL REFERENCES events(slug),
    token text NOT NULL UNIQUE,
    name text NOT NULL, email text NOT NULL, org text NOT NULL DEFAULT '',
    role text NOT NULL DEFAULT 'other', region text NOT NULL DEFAULT '',
    guardian_consent boolean NOT NULL DEFAULT false, recording_consent boolean NOT NULL DEFAULT false,
    lang text NOT NULL DEFAULT 'zh', country text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (event_slug, email)
  )`,
  `CREATE TABLE IF NOT EXISTS joins (
    id bigserial PRIMARY KEY,
    registration_id bigint NOT NULL REFERENCES registrations(id),
    event_slug text NOT NULL,
    tool text NOT NULL,
    country text NOT NULL DEFAULT '',
    at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id bigserial PRIMARY KEY,
    event_slug text NOT NULL REFERENCES events(slug),
    registration_id bigint REFERENCES registrations(id),
    name text NOT NULL DEFAULT '',
    text text NOT NULL,
    answer text NOT NULL DEFAULT '',
    answered_at timestamptz,
    hidden boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS joins_event_idx ON joins(event_slug, at)`,
  `CREATE INDEX IF NOT EXISTS questions_event_idx ON questions(event_slug, created_at)`,
];

let ensured: Promise<void> | null = null;
export function ensureSchema() {
  if (!ensured) ensured = (async () => { for (const s of SCHEMA) await sql.query(s); })();
  return ensured;
}

export function newToken(bytes = 12) {
  return randomBytes(bytes).toString("base64url");
}

export function isAdmin(req: Request) {
  const t = req.headers.get("x-admin-token") ?? new URL(req.url).searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && t === process.env.ADMIN_TOKEN;
}

export type EventRow = {
  slug: string; title_zh: string; title_en: string; title_fr: string; body_zh: string; body_en: string; body_fr: string;
  host: string; starts_at: string; duration_min: number; ends_at: string | null; time_confirmed: boolean;
  zoom_url: string; tencent_url: string; replay_url: string; replay_note: string; status: string;
};

export async function getEvent(slug: string): Promise<EventRow | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM events WHERE slug = ${slug}`) as EventRow[];
  return rows[0] ?? null;
}

export async function listEvents(): Promise<EventRow[]> {
  await ensureSchema();
  return (await sql`SELECT * FROM events WHERE status <> 'hidden' ORDER BY starts_at ASC`) as EventRow[];
}

export const SEED_EVENTS = [
  {
    slug: "open-class-0917",
    title_zh: "线上互动课 · 幼儿园与澳洲分校 30 分钟公开课",
    title_en: "Live interactive class · 30-minute open lesson with the kindergarten's Australian campus",
    title_fr: "Cours interactif en ligne · 30 minutes avec le campus australien",
    body_zh: "由杜老师主场的 30 分钟线上互动课，面向幼儿园与集团澳洲分校的孩子和家长。报名后可通过 Zoom（海外）或腾讯会议（中国大陆）进入，课后可在本页观看回放并留言提问。",
    body_en: "A 30-minute live interactive class hosted by Du Laoshi for children and parents of the kindergarten and its Australian campus. After registering, join via Zoom (overseas) or Tencent Meeting (mainland China); the replay and Q&A open here after class.",
    body_fr: "Un cours interactif de 30 minutes animé par Du Laoshi pour les enfants et parents de la maternelle et de son campus australien. Après inscription, rejoignez via Zoom (international) ou Tencent Meeting (Chine continentale) ; le replay et les questions s'ouvrent ici après le cours.",
    host: "杜老师 Du Laoshi",
    starts_at: "2026-09-17T08:00:00Z", duration_min: 30, time_confirmed: false,
  },
  {
    slug: "reading-week-0921",
    title_zh: "同悦读书会 · 7 天在线公益阅读「一个孩子的诗园」",
    title_en: "Tongyue Reading Club · 7-day online public reading: A Child's Garden of Verses",
    title_fr: "Club de lecture Tongyue · 7 jours de lecture publique en ligne",
    body_zh: "9 月 21 日至 27 日，每天一场线上共读，免费向学校、家庭与孩子开放。报名一次即可参加全部七场；每场提供 Zoom 与腾讯会议两个入口，所有场次都有回放。",
    body_en: "From 21 to 27 September, one online shared-reading session each day, free for schools, families and children. Register once for all seven sessions; each offers Zoom and Tencent Meeting entrances, and every session is recorded.",
    body_fr: "Du 21 au 27 septembre, une séance de lecture partagée en ligne chaque jour, gratuite pour les écoles, familles et enfants. Une seule inscription pour les sept séances ; chaque séance propose Zoom et Tencent Meeting, et toutes sont enregistrées.",
    host: "同悦读书会 · GACEE 公益",
    starts_at: "2026-09-21T12:00:00Z", duration_min: 40, ends_at: "2026-09-27T13:00:00Z", time_confirmed: false,
  },
];

export async function seedEvents() {
  await ensureSchema();
  for (const e of SEED_EVENTS) {
    await sql`INSERT INTO events (slug, title_zh, title_en, title_fr, body_zh, body_en, body_fr, host, starts_at, duration_min, ends_at, time_confirmed)
      VALUES (${e.slug}, ${e.title_zh}, ${e.title_en}, ${e.title_fr}, ${e.body_zh}, ${e.body_en}, ${e.body_fr}, ${e.host}, ${e.starts_at}, ${e.duration_min}, ${"ends_at" in e ? (e as { ends_at: string }).ends_at : null}, ${e.time_confirmed})
      ON CONFLICT (slug) DO NOTHING`;
  }
}
