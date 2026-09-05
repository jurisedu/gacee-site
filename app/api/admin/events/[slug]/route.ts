import { NextRequest, NextResponse } from "next/server";
import { sql, getEvent, isAdmin, ensureSchema, seedEvents } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  await ensureSchema();
  if (slug === "_seed") { await seedEvents(); return NextResponse.json({ ok: true }); }
  const ev = await getEvent(slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const format = new URL(req.url).searchParams.get("format");
  const regs = await sql`SELECT r.id, r.name, r.email, r.org, r.role, r.region, r.country, r.lang, r.guardian_consent, r.recording_consent, r.created_at,
      (SELECT count(*)::int FROM joins j WHERE j.registration_id = r.id) AS joins,
      (SELECT string_agg(DISTINCT tool, '+') FROM joins j WHERE j.registration_id = r.id) AS tools,
      (SELECT min(at) FROM joins j WHERE j.registration_id = r.id) AS first_join
    FROM registrations r WHERE r.event_slug = ${slug} ORDER BY r.created_at DESC`;
  if (format === "csv") {
    const head = ["id", "name", "email", "org", "role", "region", "country", "lang", "guardian_consent", "recording_consent", "registered_at", "joins", "tools", "first_join"];
    const esc = (v: unknown) => `"${(v instanceof Date ? v.toISOString() : String(v ?? "")).replace(/"/g, '""')}"`;
    const body = [head.join(","), ...(regs as Record<string, unknown>[]).map((r) => head.map((h) => esc(r[h === "registered_at" ? "created_at" : h])).join(","))].join("\n");
    return new NextResponse("﻿" + body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}-registrations.csv"` } });
  }
  const joins = await sql`SELECT j.id, j.tool, j.country, j.at, r.name FROM joins j JOIN registrations r ON r.id = j.registration_id WHERE j.event_slug = ${slug} ORDER BY j.at DESC LIMIT 500`;
  const questions = await sql`SELECT id, name, text, answer, answered_at, hidden, created_at FROM questions WHERE event_slug = ${slug} ORDER BY created_at DESC LIMIT 500`;
  const stats = (await sql`SELECT (SELECT count(*)::int FROM registrations WHERE event_slug = ${slug}) AS registrations,
      (SELECT count(DISTINCT registration_id)::int FROM joins WHERE event_slug = ${slug}) AS attended,
      (SELECT count(*)::int FROM joins WHERE event_slug = ${slug} AND tool = 'zoom') AS zoom,
      (SELECT count(*)::int FROM joins WHERE event_slug = ${slug} AND tool = 'tencent') AS tencent,
      (SELECT count(*)::int FROM questions WHERE event_slug = ${slug}) AS questions`)[0];
  return NextResponse.json({ event: ev, stats, registrations: regs, joins, questions });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const ev = await getEvent(slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const str = (k: string, cur: string) => (typeof b[k] === "string" ? String(b[k]).trim().slice(0, 2000) : cur);
  const zoom = str("zoom_url", ev.zoom_url), tencent = str("tencent_url", ev.tencent_url), replay = str("replay_url", ev.replay_url), note = str("replay_note", ev.replay_note), host = str("host", ev.host);
  const status = ["open", "live", "closed", "hidden"].includes(b.status) ? b.status : ev.status;
  const starts = typeof b.starts_at === "string" && !isNaN(Date.parse(b.starts_at)) ? new Date(b.starts_at).toISOString() : ev.starts_at;
  const dur = Number.isFinite(Number(b.duration_min)) ? Math.max(5, Math.min(600, Number(b.duration_min))) : ev.duration_min;
  const confirmed = typeof b.time_confirmed === "boolean" ? b.time_confirmed : ev.time_confirmed;
  await sql`UPDATE events SET zoom_url = ${zoom}, tencent_url = ${tencent}, replay_url = ${replay}, replay_note = ${note}, host = ${host}, status = ${status}, starts_at = ${starts}, duration_min = ${dur}, time_confirmed = ${confirmed}, updated_at = now() WHERE slug = ${slug}`;
  return NextResponse.json({ ok: true, event: await getEvent(slug) });
}
