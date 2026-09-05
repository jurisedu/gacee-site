import { NextRequest, NextResponse } from "next/server";
import { sql, getEvent } from "@/lib/db";

export const runtime = "nodejs";

/* GET: resolve a registration token → registrant + event links (no secrets beyond the meeting URLs the registrant is entitled to).
   POST: record a join click and return the meeting URL. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const ev = await getEvent(slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const rows = (await sql`SELECT id, name, region, lang FROM registrations WHERE event_slug = ${slug} AND token = ${t}`) as { id: number; name: string; region: string; lang: string }[];
  if (!rows[0]) return NextResponse.json({ error: "invalid_token" }, { status: 403 });
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  return NextResponse.json({
    name: rows[0].name, region: rows[0].region, country,
    suggested: rows[0].region === "cn" || country === "CN" ? "tencent" : "zoom",
    event: { slug: ev.slug, title_zh: ev.title_zh, title_en: ev.title_en, title_fr: ev.title_fr, host: ev.host, starts_at: ev.starts_at, duration_min: ev.duration_min, ends_at: ev.ends_at, time_confirmed: ev.time_confirmed, status: ev.status, hasZoom: !!ev.zoom_url, hasTencent: !!ev.tencent_url, replay_url: ev.replay_url, replay_note: ev.replay_note },
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const t = String(b.token ?? ""); const tool = b.tool === "tencent" ? "tencent" : "zoom";
  const ev = await getEvent(slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const rows = (await sql`SELECT id FROM registrations WHERE event_slug = ${slug} AND token = ${t}`) as { id: number }[];
  if (!rows[0]) return NextResponse.json({ error: "invalid_token" }, { status: 403 });
  const url = tool === "tencent" ? ev.tencent_url : ev.zoom_url;
  if (!url) return NextResponse.json({ error: "link_not_ready" }, { status: 409 });
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  await sql`INSERT INTO joins (registration_id, event_slug, tool, country) VALUES (${rows[0].id}, ${slug}, ${tool}, ${country})`;
  return NextResponse.json({ url });
}
